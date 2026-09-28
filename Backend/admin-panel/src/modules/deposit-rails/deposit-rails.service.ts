import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { EventsGateway } from '../events/events.gateway';
import { UpdateFiatRailDto } from './dto/update-fiat-rail.dto';
import { UpdateCryptoRailDto } from './dto/update-crypto-rail.dto';

@Injectable()
export class DepositRailsService {
  private readonly logger = new Logger(DepositRailsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Retrieves all fiat and crypto deposit rail configurations
   */
  async getAllRails() {
    let fiatRail = await this.prisma.fiatDepositRailConfig.findUnique({
      where: { id: 'GLOBAL_FIAT_RAIL' },
    });

    if (!fiatRail) {
      fiatRail = await this.prisma.fiatDepositRailConfig.create({
        data: {
          id: 'GLOBAL_FIAT_RAIL',
          beneficiaryName: 'WavyAssets Sovereign Custody AG',
          swissIban: 'CH93 0023 8812 4019 8821 0',
          bicSwift: 'UBSWCHZH80A',
          clearingRail: 'Swiss SIC RTGS / Fedwire DvP',
          memoFormat: 'WY-{USER_REF}-TREASURY-03',
        },
      });
    }

    const cryptoRails = await this.prisma.cryptoDepositRailConfig.findMany({
      orderBy: [{ asset: 'asc' }, { network: 'asc' }],
    });

    // Group crypto rails by asset
    const groupedCrypto: Record<string, typeof cryptoRails> = {};
    for (const rail of cryptoRails) {
      if (!groupedCrypto[rail.asset]) {
        groupedCrypto[rail.asset] = [];
      }
      groupedCrypto[rail.asset].push(rail);
    }

    return {
      fiat: {
        id: fiatRail.id,
        beneficiaryName: fiatRail.beneficiaryName,
        swissIban: fiatRail.swissIban,
        bicSwift: fiatRail.bicSwift,
        clearingRail: fiatRail.clearingRail,
        memoFormat: fiatRail.memoFormat,
        updatedAt: fiatRail.updatedAt,
        updatedBy: fiatRail.updatedBy,
      },
      crypto: cryptoRails,
      groupedCrypto,
      metadata: {
        totalCryptoRails: cryptoRails.length,
        activeCryptoRailsCount: cryptoRails.filter((r) => r.isActive).length,
      },
    };
  }

  /**
   * Updates global fiat deposit rail parameters
   */
  async updateFiatRail(dto: UpdateFiatRailDto, adminId?: string) {
    const existing = await this.prisma.fiatDepositRailConfig.findUnique({
      where: { id: 'GLOBAL_FIAT_RAIL' },
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      const rail = await tx.fiatDepositRailConfig.upsert({
        where: { id: 'GLOBAL_FIAT_RAIL' },
        create: {
          id: 'GLOBAL_FIAT_RAIL',
          beneficiaryName: dto.beneficiaryName,
          swissIban: dto.swissIban,
          bicSwift: dto.bicSwift,
          clearingRail: dto.clearingRail,
          memoFormat: dto.memoFormat,
          updatedBy: adminId || 'SUPER_ADMIN',
        },
        update: {
          beneficiaryName: dto.beneficiaryName,
          swissIban: dto.swissIban,
          bicSwift: dto.bicSwift,
          clearingRail: dto.clearingRail,
          memoFormat: dto.memoFormat,
          updatedBy: adminId || 'SUPER_ADMIN',
        },
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: adminId || null,
          action: 'DEPOSIT_RAIL_FIAT_UPDATE',
          targetEntity: 'FiatDepositRailConfig',
          targetId: 'GLOBAL_FIAT_RAIL',
          diffBefore: existing ? JSON.stringify(existing) : null,
          diffAfter: JSON.stringify(dto),
          reason: 'Global fiat deposit rail coordinates updated by treasury administration',
          ipAddressHash: this.cryptoService.hashIpAddress('127.0.0.1'),
        },
      });

      return rail;
    });

    this.logger.log(`Fiat deposit rail updated by operator ${adminId || 'SYSTEM'}`);

    this.eventsGateway.emitDepositRailUpdated({
      railType: 'FIAT',
      fiat: updated,
    });

    return updated;
  }

  /**
   * Upserts crypto deposit rail vault address and network coordinates
   */
  async upsertCryptoRail(dto: UpdateCryptoRailDto, adminId?: string) {
    const asset = dto.asset.toUpperCase().trim();
    const network = dto.network.trim();

    const existing = await this.prisma.cryptoDepositRailConfig.findUnique({
      where: {
        asset_network: {
          asset,
          network,
        },
      },
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      const rail = await tx.cryptoDepositRailConfig.upsert({
        where: {
          asset_network: {
            asset,
            network,
          },
        },
        create: {
          asset,
          network,
          vaultAddress: dto.vaultAddress,
          minDepositUsd: dto.minDepositUsd ?? 500.0,
          confirmations: dto.confirmations ?? 3,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
          updatedBy: adminId || 'SUPER_ADMIN',
        },
        update: {
          vaultAddress: dto.vaultAddress,
          minDepositUsd: dto.minDepositUsd ?? 500.0,
          confirmations: dto.confirmations ?? 3,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
          updatedBy: adminId || 'SUPER_ADMIN',
        },
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: adminId || null,
          action: 'DEPOSIT_RAIL_CRYPTO_UPDATE',
          targetEntity: 'CryptoDepositRailConfig',
          targetId: rail.id,
          diffBefore: existing ? JSON.stringify(existing) : null,
          diffAfter: JSON.stringify(dto),
          reason: `Crypto deposit rail ${asset}-${network} coordinates updated by treasury administration`,
          ipAddressHash: this.cryptoService.hashIpAddress('127.0.0.1'),
        },
      });

      return rail;
    });

    this.logger.log(
      `Crypto deposit rail ${asset} (${network}) upserted by operator ${adminId || 'SYSTEM'}`,
    );

    this.eventsGateway.emitDepositRailUpdated({
      railType: 'CRYPTO',
      asset,
      network,
      rail: updated,
    });

    return updated;
  }

  /**
   * Public-facing high-performance endpoint directly consumed by client deposit modals
   */
  async getPublicRails() {
    const [fiatRail, activeCryptoRails] = await Promise.all([
      this.prisma.fiatDepositRailConfig.findUnique({
        where: { id: 'GLOBAL_FIAT_RAIL' },
      }),
      this.prisma.cryptoDepositRailConfig.findMany({
        where: { isActive: true },
        select: {
          id: true,
          asset: true,
          network: true,
          vaultAddress: true,
          minDepositUsd: true,
          confirmations: true,
        },
        orderBy: [{ asset: 'asc' }, { network: 'asc' }],
      }),
    ]);

    return {
      fiat: fiatRail || {
        beneficiaryName: 'WavyAssets Sovereign Custody AG',
        swissIban: 'CH93 0023 8812 4019 8821 0',
        bicSwift: 'UBSWCHZH80A',
        clearingRail: 'Swiss SIC RTGS / Fedwire DvP',
        memoFormat: 'WY-{USER_REF}-TREASURY-03',
      },
      crypto: activeCryptoRails,
    };
  }
}
