import { Injectable, NotFoundException, Logger, Optional, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDcaScheduleDto,
  CompoundStakingDto,
  GasPreviewResponse,
  CryptoHoldingResponse,
} from './dto/crypto.dto';
import { DashboardService } from '../dashboard/dashboard.service';
import { PortfolioGateway } from '../websocket/portfolio.gateway';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);

  // Spot prices across institutional crypto assets
  private readonly SPOT_PRICES: Record<string, { price: number; name: string }> = {
    BTC: { price: 65420.0, name: 'Bitcoin' },
    ETH: { price: 3480.0, name: 'Ethereum' },
    SOL: { price: 145.5, name: 'Solana' },
    LINK: { price: 16.8, name: 'Chainlink' },
    AVAX: { price: 28.5, name: 'Avalanche' },
  };

  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject(DashboardService) private readonly dashboardService?: DashboardService,
    @Optional() @Inject(PortfolioGateway) private readonly portfolioGateway?: PortfolioGateway,
  ) {}

  /**
   * Aggregates live crypto balances across custody tiers (Vault, Web3, Staked)
   */
  async getHoldings(userId: string): Promise<{
    holdings: CryptoHoldingResponse[];
    summary: {
      totalCryptoUsd: number;
      totalStakedUsd: number;
      totalPendingRewardsUsd: number;
      totalUnrealizedPnlUsd: number;
    };
  }> {
    const rawHoldings = await this.prisma.cryptoHolding.findMany({
      where: { userId },
    });

    const holdings: CryptoHoldingResponse[] = rawHoldings.map((h) => {
      const spot = this.SPOT_PRICES[h.symbol] || { price: h.avgBuyPrice, name: h.symbol };
      const currentPrice = spot.price;
      const currentValuation = Number((h.quantity * currentPrice).toFixed(2));
      const costBasis = h.quantity * h.avgBuyPrice;
      const unrealizedPnl = Number((currentValuation - costBasis).toFixed(2));
      const unrealizedPnlPct = costBasis > 0 ? Number(((unrealizedPnl / costBasis) * 100).toFixed(2)) : 0;

      return {
        id: h.id,
        symbol: h.symbol,
        name: spot.name,
        custodyType: h.custodyType,
        quantity: h.quantity,
        avgBuyPrice: h.avgBuyPrice,
        currentPrice,
        currentValuation,
        unrealizedPnl,
        unrealizedPnlPct,
        stakedAmount: h.stakedAmount,
        pendingReward: h.pendingReward,
        apy: h.apy,
        updatedAt: h.updatedAt.toISOString(),
      };
    });

    const totalCryptoUsd = Number(
      holdings.reduce((sum, h) => sum + h.currentValuation, 0).toFixed(2),
    );
    const totalStakedUsd = Number(
      holdings.reduce((sum, h) => sum + h.stakedAmount * h.currentPrice, 0).toFixed(2),
    );
    const totalPendingRewardsUsd = Number(
      holdings.reduce((sum, h) => sum + h.pendingReward * h.currentPrice, 0).toFixed(2),
    );
    const totalUnrealizedPnlUsd = Number(
      holdings.reduce((sum, h) => sum + h.unrealizedPnl, 0).toFixed(2),
    );

    return {
      holdings,
      summary: {
        totalCryptoUsd,
        totalStakedUsd,
        totalPendingRewardsUsd,
        totalUnrealizedPnlUsd,
      },
    };
  }

  /**
   * EIP-1559 Mempool Gas Estimation Preview
   */
  getGasPreview(network = 'ethereum', actionType = 'TRANSFER'): GasPreviewResponse {
    let baseFeeGwei = 18.5;
    let priorityFeeGwei = 2.0;
    let gasLimit = 21000;

    if (network.toLowerCase() === 'arbitrum') {
      baseFeeGwei = 0.1;
      priorityFeeGwei = 0.05;
      gasLimit = 40000;
    }

    if (actionType === 'SWAP') {
      gasLimit = 150000;
    } else if (actionType === 'STAKE') {
      gasLimit = 85000;
    }

    const maxFeeGwei = baseFeeGwei + priorityFeeGwei;
    const estimatedCostEth = Number(((gasLimit * maxFeeGwei) / 1e9).toFixed(6));
    const ethPrice = this.SPOT_PRICES.ETH?.price || 3480.0;
    const estimatedCostUsd = Number((estimatedCostEth * ethPrice).toFixed(2));

    return {
      network,
      baseFeeGwei,
      priorityFeeGwei,
      maxFeeGwei,
      gasLimit,
      estimatedCostEth,
      estimatedCostUsd,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Creates a recurring DCA purchase schedule
   */
  async createDcaSchedule(userId: string, dto: CreateDcaScheduleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const now = new Date();
    let nextRunAt = new Date(now.getTime() + 24 * 3600 * 1000); // Default daily

    if (dto.frequency === 'WEEKLY') {
      nextRunAt = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    } else if (dto.frequency === 'BIWEEKLY') {
      nextRunAt = new Date(now.getTime() + 14 * 24 * 3600 * 1000);
    } else if (dto.frequency === 'MONTHLY') {
      const targetMonth = now.getMonth() + 1;
      const targetYear = now.getFullYear() + Math.floor(targetMonth / 12);
      const normalizedMonth = targetMonth % 12;
      const originalDay = now.getDate();
      const maxDaysInMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
      const adjustedDay = Math.min(originalDay, maxDaysInMonth);
      nextRunAt = new Date(targetYear, normalizedMonth, adjustedDay, now.getHours(), now.getMinutes(), now.getSeconds());
    }

    const schedule = await this.prisma.dcaSchedule.create({
      data: {
        userId,
        symbol: dto.symbol,
        amountUsd: dto.amountUsd,
        frequency: dto.frequency,
        isActive: true,
        nextRunAt,
      },
    });

    return {
      success: true,
      schedule: {
        id: schedule.id,
        symbol: schedule.symbol,
        amountUsd: schedule.amountUsd,
        frequency: schedule.frequency,
        isActive: schedule.isActive,
        nextRunAt: schedule.nextRunAt.toISOString(),
      },
    };
  }

  /**
   * Activates or pauses a DCA schedule
   */
  async toggleDcaSchedule(userId: string, id: string) {
    const existing = await this.prisma.dcaSchedule.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(`DCA Schedule with ID ${id} not found`);
    }

    const updated = await this.prisma.dcaSchedule.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return {
      id: updated.id,
      symbol: updated.symbol,
      isActive: updated.isActive,
      message: `DCA schedule successfully ${updated.isActive ? 'activated' : 'paused'}`,
    };
  }

  /**
   * Compounds accrued staking rewards into staked principal
   */
  async compoundStaking(userId: string, dto: CompoundStakingDto) {
    const holding = await this.prisma.cryptoHolding.findFirst({
      where: {
        userId,
        symbol: dto.symbol,
        custodyType: 'STAKED',
      },
    });

    if (!holding) {
      throw new NotFoundException(`Staked holding for ${dto.symbol} not found`);
    }

    const rewardsToCompound = holding.pendingReward;
    const precisionBySymbol: Record<string, number> = {
      BTC: 8,
      ETH: 8,
      SOL: 9,
      LINK: 8,
      AVAX: 8,
    };
    const precision = precisionBySymbol[dto.symbol] || 8;
    const newStakedAmount = Number((holding.stakedAmount + rewardsToCompound).toFixed(precision));
    const newQuantity = Number((holding.quantity + rewardsToCompound).toFixed(precision));

    const updated = await this.prisma.cryptoHolding.update({
      where: { id: holding.id },
      data: {
        stakedAmount: newStakedAmount,
        quantity: newQuantity,
        pendingReward: 0.0,
      },
    });

    this.dashboardService?.invalidateCache(userId);
    this.portfolioGateway?.broadcastAllocationRebalanced(userId, {
      trigger: 'STAKING_COMPOUNDED',
      assetId: 'crypto',
      symbol: dto.symbol,
    });

    return {
      success: true,
      symbol: dto.symbol,
      compoundedAmount: rewardsToCompound,
      newStakedPrincipal: updated.stakedAmount,
      totalQuantity: updated.quantity,
      pendingReward: updated.pendingReward,
      message: `Successfully compounded ${rewardsToCompound} ${dto.symbol} into active staking principal`,
    };
  }

  /**
   * Generates downloadable CSV tax lots
   */
  async exportTaxLots(userId: string, method: 'FIFO' | 'LIFO' = 'FIFO'): Promise<string> {
    const holdings = await this.prisma.cryptoHolding.findMany({
      where: { userId },
      orderBy: { updatedAt: method === 'LIFO' ? 'desc' : 'asc' },
    });

    const headers = 'Timestamp,Asset,CustodyType,Quantity,CostBasisUSD,SpotPriceUSD,UnrealizedGainUSD,AccountingMethod\n';
    const rows = holdings.map((h) => {
      const spotPrice = this.SPOT_PRICES[h.symbol]?.price || h.avgBuyPrice;
      const costBasis = (h.quantity * h.avgBuyPrice).toFixed(2);
      const spotVal = (h.quantity * spotPrice).toFixed(2);
      const gain = (Number(spotVal) - Number(costBasis)).toFixed(2);
      return `${h.updatedAt.toISOString()},${h.symbol},${h.custodyType},${h.quantity},${costBasis},${spotPrice},${gain},${method}`;
    });

    return headers + rows.join('\n');
  }
}
