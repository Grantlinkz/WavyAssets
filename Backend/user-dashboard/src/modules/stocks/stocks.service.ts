import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Optional,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStockOrderDto,
  StockOrderBookResponse,
  StockPositionResponse,
} from './dto/stocks.dto';
import { WalletService } from '../wallet/wallet.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { PortfolioGateway } from '../websocket/portfolio.gateway';
import { InsufficientAvailableBalanceException } from '../../common/exceptions';

interface StockMetadata {
  name: string;
  exchange: string;
  price: number;
  beta: number;
  range52w: { low: number; high: number };
}

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  // DMA Institutional reference prices & metadata
  private readonly STOCKS_DATA: Record<string, StockMetadata> = {
    NVDA: {
      name: 'NVIDIA Corporation',
      exchange: 'NASDAQ',
      price: 128.4,
      beta: 1.68,
      range52w: { low: 45.1, high: 140.76 },
    },
    MSFT: {
      name: 'Microsoft Corporation',
      exchange: 'NASDAQ',
      price: 430.5,
      beta: 0.89,
      range52w: { low: 309.45, high: 468.35 },
    },
    AAPL: {
      name: 'Apple Inc.',
      exchange: 'NASDAQ',
      price: 225.1,
      beta: 1.05,
      range52w: { low: 164.08, high: 237.23 },
    },
    SPACEX: {
      name: 'Space Exploration Technologies (Pre-IPO)',
      exchange: 'PRIVATE_OTC',
      price: 185.0,
      beta: 1.45,
      range52w: { low: 120.0, high: 210.0 },
    },
    ANTHROPIC: {
      name: 'Anthropic PBC (Series E Pre-IPO)',
      exchange: 'PRIVATE_OTC',
      price: 95.0,
      beta: 1.7,
      range52w: { low: 60.0, high: 110.0 },
    },
    TSLA: {
      name: 'Tesla, Inc.',
      exchange: 'NASDAQ',
      price: 210.5,
      beta: 2.15,
      range52w: { low: 138.8, high: 271.0 },
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    @Optional() @Inject(DashboardService) private readonly dashboardService?: DashboardService,
    @Optional() @Inject(PortfolioGateway) private readonly portfolioGateway?: PortfolioGateway,
  ) {}

  /**
   * Generates Level-2 simulated order book depth (Top 10 bids, Top 10 asks, spread, and VWAP)
   */
  getOrderBook(symbol: string): StockOrderBookResponse {
    const stock = this.STOCKS_DATA[symbol] || {
      name: symbol,
      exchange: 'NYSE',
      price: 100.0,
      beta: 1.0,
      range52w: { low: 80.0, high: 120.0 },
    };

    const refPrice = stock.price;
    const bids: [number, number][] = [];
    const asks: [number, number][] = [];

    let totalBidVolume = 0;
    let totalBidWeight = 0;
    let totalAskVolume = 0;
    let totalAskWeight = 0;

    for (let i = 1; i <= 10; i++) {
      // Bids: descending from reference price with small random increment
      const bidPrice = Number((refPrice - i * 0.05).toFixed(2));
      const bidSize = 100 * i + (i % 3) * 50;
      bids.push([bidPrice, bidSize]);
      totalBidVolume += bidSize;
      totalBidWeight += bidPrice * bidSize;

      // Asks: ascending from reference price
      const askPrice = Number((refPrice + i * 0.05).toFixed(2));
      const askSize = 80 * i + (i % 2) * 70;
      asks.push([askPrice, askSize]);
      totalAskVolume += askSize;
      totalAskWeight += askPrice * askSize;
    }

    const spread = Number((asks[0][0] - bids[0][0]).toFixed(2));
    const totalVolume = totalBidVolume + totalAskVolume;
    const vwap = Number(((totalBidWeight + totalAskWeight) / totalVolume).toFixed(2));

    return {
      symbol,
      bids,
      asks,
      spread,
      vwap,
      lastPrice: refPrice,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Returns user active equity positions with DMA valuations
   */
  async getPositions(userId: string): Promise<{
    positions: StockPositionResponse[];
    totalPortfolioValueUsd: number;
    totalCostBasisUsd: number;
    totalUnrealizedPnlUsd: number;
  }> {
    const rawPositions = await this.prisma.stockPosition.findMany({
      where: { userId },
    });

    const positions: StockPositionResponse[] = rawPositions.map((p) => {
      const stock = this.STOCKS_DATA[p.symbol] || {
        name: p.symbol,
        exchange: p.exchange,
        price: p.avgCostBasis,
        beta: 1.0,
        range52w: { low: p.avgCostBasis * 0.8, high: p.avgCostBasis * 1.2 },
      };

      const currentPrice = stock.price;
      const marketValue = Number((p.shares * currentPrice).toFixed(2));
      const costBasis = p.shares * p.avgCostBasis;
      const unrealizedPnl = Number((marketValue - costBasis).toFixed(2));
      const unrealizedPnlPct = costBasis > 0 ? Number(((unrealizedPnl / costBasis) * 100).toFixed(2)) : 0;

      return {
        id: p.id,
        symbol: p.symbol,
        exchange: p.exchange,
        shares: p.shares,
        avgCostBasis: p.avgCostBasis,
        currentPrice,
        marketValue,
        unrealizedPnl,
        unrealizedPnlPct,
        beta: stock.beta,
        range52w: stock.range52w,
        dripEnabled: p.dripEnabled,
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    const totalPortfolioValueUsd = Number(
      positions.reduce((sum, p) => sum + p.marketValue, 0).toFixed(2),
    );
    const totalCostBasisUsd = Number(
      positions.reduce((sum, p) => sum + p.shares * p.avgCostBasis, 0).toFixed(2),
    );
    const totalUnrealizedPnlUsd = Number(
      (totalPortfolioValueUsd - totalCostBasisUsd).toFixed(2),
    );

    return {
      positions,
      totalPortfolioValueUsd,
      totalCostBasisUsd,
      totalUnrealizedPnlUsd,
    };
  }

  /**
   * Order Placement Engine: Validates buying power, reserves funds, and executes or queues orders
   */
  async placeOrder(userId: string, dto: CreateStockOrderDto) {
    const stock = this.STOCKS_DATA[dto.symbol] || {
      name: dto.symbol,
      exchange: 'NASDAQ',
      price: 100.0,
      beta: 1.0,
      range52w: { low: 80.0, high: 120.0 },
    };

    if (dto.orderType === 'LIMIT' && (!dto.limitPrice || dto.limitPrice <= 0)) {
      throw new BadRequestException('Limit orders require a positive limitPrice');
    }

    const executionPrice = dto.limitPrice || stock.price;
    const orderCost = Number((dto.shares * executionPrice).toFixed(2));

    if (dto.side === 'BUY') {
      const cashAccount = await this.walletService.getOrCreateAccount(
        userId,
        'AVAILABLE_CASH',
        'USD',
      );
      const investedAccount = await this.walletService.getOrCreateAccount(
        userId,
        'INVESTED_CAPITAL',
        'USD',
      );

      const currentBalance = Number(cashAccount.balance);
      if (currentBalance < orderCost) {
        throw new InsufficientAvailableBalanceException(
          `Insufficient buying power for ${dto.shares} shares of ${dto.symbol}. Required: $${orderCost}, Available: $${currentBalance}`,
          orderCost,
          currentBalance,
        );
      }

      // Execute order via double-entry reservation: Debit AVAILABLE_CASH, Credit INVESTED_CAPITAL
      await this.walletService.recordLedgerTransaction({
        type: 'TRADE',
        description: `Order fill: BUY ${dto.shares} ${dto.symbol} @ $${executionPrice}`,
        entries: [
          { accountId: cashAccount.id, amount: -orderCost },
          { accountId: investedAccount.id, amount: orderCost },
        ],
      });

      // Update or create StockPosition
      const existingPos = await this.prisma.stockPosition.findFirst({
        where: { userId, symbol: dto.symbol },
      });

      if (existingPos) {
        const totalShares = existingPos.shares + dto.shares;
        const totalCost = existingPos.shares * existingPos.avgCostBasis + orderCost;
        const newAvgCost = Number((totalCost / totalShares).toFixed(2));

        await this.prisma.stockPosition.update({
          where: { id: existingPos.id },
          data: {
            shares: totalShares,
            avgCostBasis: newAvgCost,
          },
        });
      } else {
        await this.prisma.stockPosition.create({
          data: {
            userId,
            symbol: dto.symbol,
            exchange: stock.exchange,
            shares: dto.shares,
            avgCostBasis: executionPrice,
          },
        });
      }
    } else {
      // SELL flow: Verify shares ownership
      const position = await this.prisma.stockPosition.findFirst({
        where: { userId, symbol: dto.symbol },
      });

      if (!position || position.shares < dto.shares) {
        throw new BadRequestException(
          `Insufficient shares to sell ${dto.shares} of ${dto.symbol}. Available: ${position?.shares || 0}`,
        );
      }

      const cashAccount = await this.walletService.getOrCreateAccount(
        userId,
        'AVAILABLE_CASH',
        'USD',
      );
      const investedAccount = await this.walletService.getOrCreateAccount(
        userId,
        'INVESTED_CAPITAL',
        'USD',
      );

      // Debit INVESTED_CAPITAL, Credit AVAILABLE_CASH
      await this.walletService.recordLedgerTransaction({
        type: 'TRADE',
        description: `Order fill: SELL ${dto.shares} ${dto.symbol} @ $${executionPrice}`,
        entries: [
          { accountId: investedAccount.id, amount: -orderCost },
          { accountId: cashAccount.id, amount: orderCost },
        ],
      });

      const remainingShares = position.shares - dto.shares;
      if (remainingShares <= 0) {
        await this.prisma.stockPosition.delete({ where: { id: position.id } });
      } else {
        await this.prisma.stockPosition.update({
          where: { id: position.id },
          data: { shares: remainingShares },
        });
      }
    }

    // Persist Order record
    const order = await this.prisma.stockOrder.create({
      data: {
        userId,
        symbol: dto.symbol,
        orderType: dto.orderType,
        side: dto.side,
        shares: dto.shares,
        limitPrice: dto.limitPrice,
        status: dto.orderType === 'MARKET' ? 'FILLED' : 'PENDING',
      },
    });

    this.dashboardService?.invalidateCache(userId);
    this.portfolioGateway?.broadcastAllocationRebalanced(userId, {
      trigger: 'ORDER_FILLED',
      assetId: 'stocks',
      symbol: dto.symbol,
    });

    return {
      success: true,
      order: {
        id: order.id,
        symbol: order.symbol,
        side: order.side,
        orderType: order.orderType,
        shares: order.shares,
        executionPrice,
        totalCost: orderCost,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      },
    };
  }

  /**
   * Order Cancellation Engine: Releases reserved funds back to AVAILABLE_CASH
   */
  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.stockOrder.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException(`Stock order with ID ${orderId} not found`);
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot cancel order with status ${order.status}. Only PENDING orders can be cancelled.`,
      );
    }

    // Release reserved funds back to AVAILABLE_CASH
    const executionPrice = order.limitPrice || this.STOCKS_DATA[order.symbol]?.price || 100.0;
    const orderCost = Number((order.shares * executionPrice).toFixed(2));

    if (order.side === 'BUY') {
      const cashAccount = await this.walletService.getOrCreateAccount(userId, 'AVAILABLE_CASH', 'USD');
      const investedAccount = await this.walletService.getOrCreateAccount(userId, 'INVESTED_CAPITAL', 'USD');

      if (cashAccount && investedAccount) {
        await this.walletService.recordLedgerTransaction({
          type: 'TRADE',
          description: `Order cancellation refund: BUY ${order.shares} ${order.symbol}`,
          entries: [
            { accountId: investedAccount.id, amount: -orderCost },
            { accountId: cashAccount.id, amount: orderCost },
          ],
        });
      }

      const position = await this.prisma.stockPosition.findFirst({
        where: { userId, symbol: order.symbol },
      });
      if (position) {
        const remainingShares = position.shares - order.shares;
        if (remainingShares <= 0) {
          await this.prisma.stockPosition.delete({ where: { id: position.id } });
        } else {
          const priorTotalCost = position.shares * position.avgCostBasis - orderCost;
          const priorAvgCost =
            priorTotalCost > 0
              ? Number((priorTotalCost / remainingShares).toFixed(2))
              : position.avgCostBasis;

          await this.prisma.stockPosition.update({
            where: { id: position.id },
            data: {
              shares: remainingShares,
              avgCostBasis: priorAvgCost,
            },
          });
        }
      }
    } else if (order.side === 'SELL') {
      const cashAccount = await this.walletService.getOrCreateAccount(userId, 'AVAILABLE_CASH', 'USD');
      const investedAccount = await this.walletService.getOrCreateAccount(userId, 'INVESTED_CAPITAL', 'USD');

      // Symmetrical SELL cancellation: reverse cash and restore shares
      if (cashAccount && investedAccount) {
        await this.walletService.recordLedgerTransaction({
          type: 'TRADE',
          description: `Order cancellation reversal: SELL ${order.shares} ${order.symbol}`,
          entries: [
            { accountId: cashAccount.id, amount: -orderCost },
            { accountId: investedAccount.id, amount: orderCost },
          ],
        });
      }

      const position = await this.prisma.stockPosition.findFirst({
        where: { userId, symbol: order.symbol },
      });
      if (position) {
        await this.prisma.stockPosition.update({
          where: { id: position.id },
          data: { shares: position.shares + order.shares },
        });
      } else {
        await this.prisma.stockPosition.create({
          data: {
            userId,
            symbol: order.symbol,
            exchange: this.STOCKS_DATA[order.symbol]?.exchange || 'NASDAQ',
            shares: order.shares,
            avgCostBasis: executionPrice,
          },
        });
      }
    }

    const updated = await this.prisma.stockOrder.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    this.dashboardService?.invalidateCache(userId);

    return {
      success: true,
      orderId: updated.id,
      status: updated.status,
      message: `Order for ${order.shares} shares of ${order.symbol} has been cancelled`,
    };
  }

  /**
   * Toggles DRIP (Dividend Re-Investment Plan) on position
   */
  async toggleDrip(userId: string, positionId: string, enabled: boolean) {
    const position = await this.prisma.stockPosition.findUnique({
      where: { id: positionId },
    });

    if (!position || position.userId !== userId) {
      throw new NotFoundException(`Position with ID ${positionId} not found`);
    }

    const updated = await this.prisma.stockPosition.update({
      where: { id: positionId },
      data: { dripEnabled: enabled },
    });

    return {
      id: updated.id,
      symbol: updated.symbol,
      dripEnabled: updated.dripEnabled,
      message: `DRIP has been ${updated.dripEnabled ? 'enabled' : 'disabled'} for ${updated.symbol}`,
    };
  }

  /**
   * Corporate Actions Calendar
   */
  getCorporateActions() {
    return [
      {
        id: 'ca-001',
        symbol: 'NVDA',
        event: 'DIVIDEND_PAYMENT',
        date: '2026-10-02',
        amountPerShare: 0.1,
        recordDate: '2026-09-15',
      },
      {
        id: 'ca-002',
        symbol: 'AAPL',
        event: 'EARNINGS_RELEASE',
        date: '2026-10-24',
        details: 'Q4 2026 Earnings Call',
      },
      {
        id: 'ca-003',
        symbol: 'MSFT',
        event: 'STOCK_SPLIT',
        date: '2026-11-15',
        details: '2-for-1 Forward Split Voting',
      },
    ];
  }
}
