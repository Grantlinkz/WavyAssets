import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { EventsGateway } from '../events/events.gateway';
import { MintCardDto } from './dto/mint-card.dto';
import { UpdateCardParametersDto } from './dto/update-card-parameters.dto';
import { VipCardQueryDto } from './dto/vip-card-query.dto';

@Injectable()
export class VipCardsService {
  private readonly logger = new Logger(VipCardsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Retrieves paginated catalog of VIP cards with executive metrics
   */
  async getCards(query: VipCardQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.tier) {
      where.tier = query.tier;
    }
    if (query.cardType) {
      where.cardType = query.cardType;
    }
    if (query.isFrozen !== undefined) {
      where.isFrozen = query.isFrozen;
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { cardNumberLast4: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [total, rawCards, allCards] = await Promise.all([
      this.prisma.vipCard.count({ where }),
      this.prisma.vipCard.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              tier: true,
              kycTier: true,
            },
          },
        },
      }),
      this.prisma.vipCard.findMany({
        select: {
          isFrozen: true,
          dailySpendLimit: true,
        },
      }),
    ]);

    // Sanitize cards: never leak encrypted PIN
    const cards = rawCards.map((card) => {
      const { pinEncrypted, ...safeCard } = card;
      return safeCard;
    });

    // Compute executive portfolio telemetry
    const totalIssued = allCards.length;
    const activeCards = allCards.filter((c) => !c.isFrozen).length;
    const frozenCards = allCards.filter((c) => c.isFrozen).length;
    const totalDailyLimitVolume = allCards.reduce(
      (sum, c) => sum + (c.dailySpendLimit || 0),
      0,
    );

    return {
      cards,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalIssued,
        activeCards,
        frozenCards,
        totalDailyLimitVolume,
      },
    };
  }

  /**
   * Computes real-time executive VIP card portfolio telemetry from database
   */
  async getTelemetry() {
    const [activeCards, lockedCards, allCards, transactions24h] = await Promise.all([
      this.prisma.vipCard.count({ where: { isFrozen: false } }),
      this.prisma.vipCard.count({ where: { isFrozen: true } }),
      this.prisma.vipCard.findMany({
        where: { isFrozen: false },
        select: { dailySpendLimit: true },
      }),
      this.prisma.ledgerTransaction.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        select: {
          amount: true,
          status: true,
        },
      }),
    ]);

    const authorizedDailyCapacity = allCards.reduce(
      (sum, c) => sum + (c.dailySpendLimit || 0),
      0,
    );

    const settledTxs = transactions24h.filter((t) => t.status === 'SETTLED');
    const volume24h = settledTxs.reduce(
      (sum, t) => sum + (Number(t.amount) || 0),
      0,
    );

    const authRate24h =
      transactions24h.length > 0
        ? Number(((settledTxs.length / transactions24h.length) * 100).toFixed(1))
        : 100.0;

    // Real blank inventory: 500 initial safe vault capacity minus total minted cards
    const totalMinted = activeCards + lockedCards;
    const vaultInventoryBlanks = Math.max(0, 500 - totalMinted);

    return {
      activeCards,
      authorizedDailyCapacity,
      volume24h,
      authRate24h,
      lockedCards,
      vaultInventoryBlanks,
    };
  }

  /**
   * Retrieves single VIP card by ID
   */
  async getCardById(cardId: string) {
    const card = await this.prisma.vipCard.findUnique({
      where: { id: cardId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            tier: true,
            kycTier: true,
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException(`VIP Card with ID '${cardId}' not found`);
    }

    const { pinEncrypted, ...safeCard } = card;
    return safeCard;
  }

  /**
   * Provisions and mints a new Supreme VIP metal card
   */
  async mintCard(adminId: string, dto: MintCardDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${dto.userId}' not found`);
    }

    const existingCard = await this.prisma.vipCard.findUnique({
      where: { userId: dto.userId },
    });

    if (existingCard) {
      throw new ConflictException(
        `User '${dto.userId}' already holds an active Supreme card (ID: ${existingCard.id})`,
      );
    }

    // Encrypt temporary PIN with AES-256-GCM
    const pin = dto.temporaryPin || Math.floor(1000 + Math.random() * 9000).toString();
    const pinEncrypted = this.cryptoService.encrypt(pin);

    // Auto-generate unique last 4 digits if not provided
    const cardNumberLast4 =
      dto.cardNumberLast4 ||
      Math.floor(1000 + Math.random() * 9000).toString();

    const card = await this.prisma.vipCard.create({
      data: {
        userId: dto.userId,
        cardNumberLast4,
        cardType: dto.cardType || 'PHYSICAL',
        tier: dto.tier || 'OBSIDIAN',
        isFrozen: false,
        dailySpendLimit: dto.dailySpendLimit ?? 50000.0,
        pinEncrypted,
        shippingStatus:
          dto.shippingStatus ||
          (dto.cardType === 'VIRTUAL' ? 'DELIVERED' : 'IN_TRANSIT'),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            tier: true,
            kycTier: true,
          },
        },
      },
    });

    // Record Immutable Differential Audit Log
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'VIP_CARD_MINT',
        targetEntity: 'VipCard',
        targetId: card.id,
        diffBefore: null,
        diffAfter: JSON.stringify({
          cardId: card.id,
          userId: card.userId,
          cardNumberLast4,
          tier: card.tier,
          cardType: card.cardType,
          dailySpendLimit: card.dailySpendLimit,
          shippingStatus: card.shippingStatus,
        }),
        reason: `Minted Supreme VIP card for user ${user.email}`,
        ipAddressHash: '0x' + this.cryptoService.hashBlindIndex(adminId).slice(0, 16),
      },
    });

    this.logger.log(
      `Minted VIP card '${card.id}' (tier: ${card.tier}, last4: ${card.cardNumberLast4}) for user '${card.userId}' by operator '${adminId}'`,
    );

    const { pinEncrypted: _, ...safeCard } = card;
    return safeCard;
  }

  /**
   * 1-Click Instant Lock / Unlock Freeze Toggle with <50ms real-time broadcast
   */
  async toggleFreeze(cardId: string, adminId: string, reason?: string) {
    const card = await this.prisma.vipCard.findUnique({
      where: { id: cardId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException(`VIP Card with ID '${cardId}' not found`);
    }

    const previousFrozenState = card.isFrozen;
    const nextFrozenState = !previousFrozenState;

    const updatedCard = await this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.vipCard.updateMany({
        where: {
          id: cardId,
          isFrozen: previousFrozenState,
        },
        data: {
          isFrozen: nextFrozenState,
        },
      });

      if (updateResult.count !== 1) {
        throw new ConflictException(
          `VIP Card '${cardId}' state has changed concurrently.`,
        );
      }

      const refreshedCard = await tx.vipCard.findUniqueOrThrow({
        where: { id: cardId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              tier: true,
              kycTier: true,
            },
          },
        },
      });

      // Record Immutable Differential Audit Log
      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: 'VIP_CARD_FREEZE_TOGGLE',
          targetEntity: 'VipCard',
          targetId: card.id,
          diffBefore: JSON.stringify({ isFrozen: previousFrozenState }),
          diffAfter: JSON.stringify({ isFrozen: nextFrozenState }),
          reason:
            reason ||
            `Toggled VIP card freeze state to ${nextFrozenState ? 'LOCKED' : 'ACTIVE'}`,
          ipAddressHash: '0x' + this.cryptoService.hashBlindIndex(adminId).slice(0, 16),
        },
      });

      return refreshedCard;
    });

    // Broadcast WebSocket event only after transaction commits
    this.eventsGateway.emitVipCardFrozenStateChanged({
      cardId: updatedCard.id,
      userId: updatedCard.userId,
      isFrozen: nextFrozenState,
      cardNumberLast4: updatedCard.cardNumberLast4,
      tier: updatedCard.tier,
      adminId,
    });

    this.logger.log(
      `VIP card '${card.id}' freeze toggled to ${nextFrozenState} by operator '${adminId}'`,
    );

    const { pinEncrypted, ...safeCard } = updatedCard;
    return safeCard;
  }

  /**
   * Updates card governance parameters (daily spend limits, card mode, shipping custody)
   */
  async updateParameters(
    cardId: string,
    adminId: string,
    dto: UpdateCardParametersDto,
  ) {
    const card = await this.prisma.vipCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new NotFoundException(`VIP Card with ID '${cardId}' not found`);
    }

    const diffBefore: any = {};
    const diffAfter: any = {};
    const dataToUpdate: any = {};

    if (dto.dailySpendLimit !== undefined) {
      diffBefore.dailySpendLimit = card.dailySpendLimit;
      diffAfter.dailySpendLimit = dto.dailySpendLimit;
      dataToUpdate.dailySpendLimit = dto.dailySpendLimit;
    }
    if (dto.cardType !== undefined) {
      diffBefore.cardType = card.cardType;
      diffAfter.cardType = dto.cardType;
      dataToUpdate.cardType = dto.cardType;
    }
    if (dto.shippingStatus !== undefined) {
      diffBefore.shippingStatus = card.shippingStatus;
      diffAfter.shippingStatus = dto.shippingStatus;
      dataToUpdate.shippingStatus = dto.shippingStatus;
    }

    const updatedCard = await this.prisma.vipCard.update({
      where: { id: cardId },
      data: dataToUpdate,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            tier: true,
            kycTier: true,
          },
        },
      },
    });

    // Record Immutable Differential Audit Log
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'VIP_CARD_PARAMETERS_UPDATE',
        targetEntity: 'VipCard',
        targetId: card.id,
        diffBefore: JSON.stringify(diffBefore),
        diffAfter: JSON.stringify(diffAfter),
        reason: `Updated VIP card parameters for card ${card.id}`,
        ipAddressHash: '0x' + this.cryptoService.hashBlindIndex(adminId).slice(0, 16),
      },
    });

    this.logger.log(
      `VIP card '${card.id}' parameters updated by operator '${adminId}'`,
    );

    const { pinEncrypted, ...safeCard } = updatedCard;
    return safeCard;
  }
}
