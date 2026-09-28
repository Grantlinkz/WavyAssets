import {
  Injectable,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { EventsGateway } from '../events/events.gateway';
import { FreezePlatformDto } from './dto/freeze-platform.dto';
import { UnfreezePlatformDto } from './dto/unfreeze-platform.dto';

@Injectable()
export class EmergencyService implements OnModuleInit {
  private readonly logger = new Logger(EmergencyService.name);

  private _isFrozen = false;
  private _frozenAt: string | null = null;
  private _frozenBy: string | null = null;
  private _freezeReason: string | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    try {
      // Recover last emergency state from persistent audit logs on boot
      const lastAudit = await this.prisma.adminAuditLog.findFirst({
        where: {
          action: {
            in: ['PLATFORM_EMERGENCY_FREEZE', 'PLATFORM_EMERGENCY_UNFREEZE'],
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (lastAudit && lastAudit.action === 'PLATFORM_EMERGENCY_FREEZE') {
        this._isFrozen = true;
        this._frozenAt = lastAudit.createdAt.toISOString();
        this._frozenBy = lastAudit.adminId;
        this._freezeReason = lastAudit.reason;
        this.logger.warn(
          `System booted into EMERGENCY FREEZE state from log ${lastAudit.id}`,
        );
      }
    } catch {
      // Table may not yet be populated during initial bootstrapping
    }
  }

  resetState() {
    this._isFrozen = false;
    this._frozenAt = null;
    this._frozenBy = null;
    this._freezeReason = null;
  }

  isPlatformFrozen(): boolean {
    return this._isFrozen;
  }

  /**
   * Retrieves comprehensive live telemetry and lockdown state
   */
  async getStatus() {
    const [activeSessionsCount, activeCardsCount, pendingTransactions] =
      await Promise.all([
        this.prisma.session.count(),
        this.prisma.vipCard.count({ where: { isFrozen: false } }),
        this.prisma.ledgerTransaction.findMany({
          where: { status: 'PENDING' },
          select: { amount: true },
        }),
      ]);

    const pendingWiresCount = pendingTransactions.length;
    const pendingWiresVolume = pendingTransactions.reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0,
    );

    return {
      isFrozen: this._isFrozen,
      defconLevel: this._isFrozen ? 1 : 5,
      protocol: this._isFrozen ? 'HALT-ZERO-TIER1' : 'STANDBY',
      frozenAt: this._frozenAt,
      frozenBy: this._frozenBy,
      reason: this._freezeReason,
      telemetry: {
        activeSessionsCount,
        activeCardsCount,
        pendingWiresCount,
        pendingWiresVolume,
        vaultStatus: this._isFrozen
          ? 'HALTED_FAIL_SAFE'
          : 'HSM Auto-Sign Standby',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Executes emergency platform freeze per Swiss FINMA Statutory Record
   */
  async freeze(adminId: string, dto: FreezePlatformDto) {
    if (this._isFrozen) {
      throw new BadRequestException(
        'Platform is already in emergency freeze state',
      );
    }

    this._isFrozen = true;
    this._frozenAt = new Date().toISOString();
    this._frozenBy = adminId;
    this._freezeReason = dto.reason;

    // Halt active VIP cards immediately
    await this.prisma.vipCard.updateMany({
      where: { isFrozen: false },
      data: { isFrozen: true },
    });

    // Record Immutable Differential Audit Log
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'PLATFORM_EMERGENCY_FREEZE',
        targetEntity: 'Platform',
        targetId: 'GLOBAL_PLATFORM',
        diffBefore: JSON.stringify({ isFrozen: false, defconLevel: 5 }),
        diffAfter: JSON.stringify({
          isFrozen: true,
          defconLevel: 1,
          protocol: 'HALT-ZERO-TIER1',
          secondaryOfficerId: dto.secondaryOfficerId || null,
        }),
        reason: dto.reason,
        ipAddressHash: '0x' + this.cryptoService.hashBlindIndex(adminId).slice(0, 16),
      },
    });

    // Broadcast system-wide freeze over WebSocket namespace /ws/admin
    this.eventsGateway.emitEmergencyFreeze({
      isFrozen: true,
      defconLevel: 1,
      protocol: 'HALT-ZERO-TIER1',
      reason: dto.reason,
      adminId,
      frozenAt: this._frozenAt,
    });

    this.logger.error(
      `CRITICAL DEFCON 1: Platform emergency freeze initiated by operator '${adminId}'. Reason: ${dto.reason}`,
    );

    return this.getStatus();
  }

  /**
   * Executes platform recovery and unfreeze
   */
  async unfreeze(adminId: string, dto: UnfreezePlatformDto) {
    if (!this._isFrozen) {
      throw new BadRequestException('Platform is not currently frozen');
    }

    const previousReason = this._freezeReason;
    this._isFrozen = false;
    this._frozenAt = null;
    this._frozenBy = null;
    this._freezeReason = null;

    // Record Immutable Differential Audit Log
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'PLATFORM_EMERGENCY_UNFREEZE',
        targetEntity: 'Platform',
        targetId: 'GLOBAL_PLATFORM',
        diffBefore: JSON.stringify({
          isFrozen: true,
          defconLevel: 1,
          previousReason,
        }),
        diffAfter: JSON.stringify({
          isFrozen: false,
          defconLevel: 5,
          secondaryOfficerId: dto.secondaryOfficerId || null,
        }),
        reason: dto.reason,
        ipAddressHash: '0x' + this.cryptoService.hashBlindIndex(adminId).slice(0, 16),
      },
    });

    // Broadcast system-wide unfreeze
    this.eventsGateway.emitEmergencyUnfreeze({
      isFrozen: false,
      defconLevel: 5,
      protocol: 'STANDBY',
      reason: dto.reason,
      adminId,
      unfrozenAt: new Date().toISOString(),
    });

    this.logger.log(
      `Platform emergency freeze lifted by operator '${adminId}'. Reason: ${dto.reason}`,
    );

    return this.getStatus();
  }
}
