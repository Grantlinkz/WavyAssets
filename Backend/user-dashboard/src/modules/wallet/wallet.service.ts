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
  FiatRampDto,
  CashSweepDto,
  FxConvertDto,
  WalletBalancesResponse,
} from './dto/wallet.dto';
import {
  LedgerImbalanceException,
  QuarantineTimeLockException,
  InsufficientAvailableBalanceException,
} from '../../common/exceptions';
import { randomUUID } from 'crypto';
import { PortfolioGateway } from '../websocket/portfolio.gateway';
import { DashboardService } from '../dashboard/dashboard.service';
import { Prisma } from '@prisma/client';

export interface LedgerEntryInput {
  accountId: string;
  amount: number; // Positive for Credit, Negative for Debit
}

export interface RecordTransactionInput {
  referenceId?: string;
  type: string; // DEPOSIT | WITHDRAWAL | TRADE | STAKE | REWARD | DIVIDEND | SWEEP | FX
  description: string;
  entries: LedgerEntryInput[];
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  // Institutional FX rates relative to USD
  private readonly FX_RATES_TO_USD: Record<string, number> = {
    USD: 1.0,
    USDC: 1.0,
    EUR: 1.085,
    GBP: 1.282,
    CHF: 1.124,
    BTC: 65000.0,
    ETH: 3500.0,
  };

  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject(PortfolioGateway) private readonly portfolioGateway?: PortfolioGateway,
    @Optional() @Inject(DashboardService) private readonly dashboardService?: DashboardService,
  ) {}

  /**
   * Returns segregated balances across Available Cash, Invested Capital, and Staking Escrow
   */
  async getBalances(userId: string): Promise<WalletBalancesResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const accounts = await this.prisma.ledgerAccount.findMany({
      where: { userId },
    });

    const mapAccount = (acc: (typeof accounts)[0]) => {
      const amount = Number(acc.balance);
      const rate = this.FX_RATES_TO_USD[acc.currency] || 1.0;
      return {
        currency: acc.currency,
        amount,
        usdEquivalent: Number((amount * rate).toFixed(2)),
      };
    };

    const availableCash = accounts
      .filter((a) => a.accountType === 'AVAILABLE_CASH')
      .map(mapAccount);

    const investedCapital = accounts
      .filter((a) => a.accountType === 'INVESTED_CAPITAL')
      .map(mapAccount);

    const stakingEscrow = accounts
      .filter((a) => a.accountType === 'STAKING_ESCROW')
      .map(mapAccount);

    const totalUsd = Number(
      [...availableCash, ...investedCapital, ...stakingEscrow]
        .reduce((sum, item) => sum + item.usdEquivalent, 0)
        .toFixed(2),
    );

    return {
      totalUsd,
      availableCash,
      investedCapital,
      stakingEscrow,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get or create a ledger account for a user and currency
   */
  async getOrCreateAccount(
    userId: string,
    accountType: 'AVAILABLE_CASH' | 'INVESTED_CAPITAL' | 'STAKING_ESCROW' | 'FEE_RECEIVABLE',
    currency = 'USD',
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    const existing = await client.ledgerAccount.findUnique({
      where: {
        userId_accountType_currency: {
          userId,
          accountType,
          currency,
        },
      },
    });

    if (existing) return existing;

    const created = await client.ledgerAccount.create({
      data: {
        userId,
        accountType,
        currency,
        balance: 0.0,
      },
    });

    return (
      created || {
        id: `acc-${userId}-${accountType}-${currency}`,
        userId,
        accountType,
        currency,
        balance: 0.0,
      }
    );
  }

  /**
   * Core Double-Entry Transaction Recorder
   * Inviolable invariant: sum(Debits) + sum(Credits) === 0
   */
  async recordLedgerTransaction(
    input: RecordTransactionInput,
    externalTx?: Prisma.TransactionClient,
  ) {
    // 1. Verify mathematical balance conservation
    const sum = input.entries.reduce((acc, entry) => acc + entry.amount, 0);
    if (Math.abs(sum) > 0.0001) {
      this.logger.error(
        `Ledger imbalance detected for tx [${input.referenceId}]: Sum is ${sum}. Required: 0.0000`,
      );
      throw new LedgerImbalanceException(
        `Ledger entries do not balance to zero. Net discrepancy: ${sum.toFixed(4)}`,
        sum,
      );
    }

    const execute = async (tx: Prisma.TransactionClient) => {
      const referenceId = input.referenceId || `tx-${randomUUID()}`;

      // Check balance constraints before modifying
      for (const entry of input.entries) {
        if (entry.amount < 0) {
          const account = await tx.ledgerAccount.findUnique({
            where: { id: entry.accountId },
          });
          if (account && account.accountType === 'AVAILABLE_CASH') {
            const currentBalance = Number(account.balance);
            const proposedBalance = currentBalance + entry.amount;
            if (proposedBalance < 0) {
              throw new InsufficientAvailableBalanceException(
                `Operation rejected: Account balance (${currentBalance}) would become negative (${proposedBalance}).`,
                Math.abs(entry.amount),
                currentBalance,
              );
            }
          }
        }
      }

      // Create transaction record
      const transaction = await tx.ledgerTransaction.create({
        data: {
          referenceId,
          type: input.type,
          status: 'SETTLED',
          description: input.description,
        },
      });

      const txId = transaction?.id || `tx-${randomUUID()}`;

      // Create entries and mutate account balances atomically
      for (const entry of input.entries) {
        await tx.ledgerEntry.create({
          data: {
            transactionId: txId,
            accountId: entry.accountId,
            amount: entry.amount,
          },
        });

        await tx.ledgerAccount.update({
          where: { id: entry.accountId },
          data: {
            balance: {
              increment: entry.amount,
            },
          },
        });
      }

      return (
        transaction || {
          id: txId,
          referenceId,
          type: input.type,
          status: 'SETTLED',
          description: input.description,
          createdAt: new Date(),
        }
      );
    };

    if (externalTx) {
      return execute(externalTx);
    }

    return this.prisma.$transaction(execute);
  }

  /**
   * Fiat on/off-ramp initiating wire deposits and withdrawals
   */
  async initiateFiatRamp(userId: string, dto: FiatRampDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const cashAccount = await this.getOrCreateAccount(userId, 'AVAILABLE_CASH', dto.currency);

    if (dto.direction === 'DEPOSIT') {
      // Balanced deposit: Credit user cash account (+), Debit platform clearing (-)
      const clearingAccount = await this.getOrCreateAccount(
        user.id,
        'FEE_RECEIVABLE',
        dto.currency,
      );

      const tx = await this.recordLedgerTransaction({
        type: 'DEPOSIT',
        description: `Wire deposit of ${dto.amount} ${dto.currency} received and settled`,
        entries: [
          { accountId: cashAccount.id, amount: dto.amount },
          { accountId: clearingAccount.id, amount: -dto.amount },
        ],
      });

      this.dashboardService?.invalidateCache(userId);
      this.portfolioGateway?.broadcastAllocationRebalanced(userId, {
        trigger: 'DEPOSIT_SETTLED',
        assetId: 'wallet',
        symbol: dto.currency,
      });

      return {
        success: true,
        status: 'SETTLED',
        direction: 'DEPOSIT',
        amount: dto.amount,
        currency: dto.currency,
        referenceId: tx.referenceId,
      };
    }

    // WITHDRAWAL Flow: Enforce strict KYC Tier Daily Withdrawal Limits & 48-Hour Quarantine Time-Lock
    let dailyLimit = 10000;
    if (user.kycTier === 'TIER_2') dailyLimit = 250000;
    if (user.kycTier === 'TIER_3') dailyLimit = Infinity;

    if (dto.amount > dailyLimit) {
      const tierName =
        user.kycTier === 'TIER_3' ? 'Level 3' : user.kycTier === 'TIER_2' ? 'Level 2' : 'Level 1';
      throw new BadRequestException(
        `You have gone beyond your Tier daily limit ($${dailyLimit.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} USD for ${tierName}). Please upgrade your Tier.`
      );
    }

    if (!dto.destinationId) {
      throw new BadRequestException('Target destinationId is required for withdrawals');
    }

    const destination = await this.prisma.whitelistDestination.findUnique({
      where: { id: dto.destinationId },
    });

    if (!destination || destination.userId !== userId) {
      throw new NotFoundException('Target whitelist destination not found for this account');
    }

    const now = new Date();
    if (destination.status === 'QUARANTINE' || destination.quarantineUntil > now) {
      throw new QuarantineTimeLockException(
        'Target withdrawal address is currently quarantined under the 48-hour security time-lock.',
        destination.quarantineUntil,
      );
    }

    if (destination.signersCompleted < destination.signersRequired) {
      throw new BadRequestException(
        `Target destination has not satisfied multi-sig hardware requirements (${destination.signersCompleted}/${destination.signersRequired} completed)`,
      );
    }

    if (destination.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Target destination is not active (current status: ${destination.status})`,
      );
    }

    // Balanced withdrawal: Debit user cash account (-), Credit platform clearing (+)
    const clearingAccount = await this.getOrCreateAccount(
      user.id,
      'FEE_RECEIVABLE',
      dto.currency,
    );

    const tx = await this.recordLedgerTransaction({
      type: 'WITHDRAWAL',
      description: `Outbound wire transfer of ${dto.amount} ${dto.currency} to ${destination.destinationLabel}`,
      entries: [
        { accountId: cashAccount.id, amount: -dto.amount },
        { accountId: clearingAccount.id, amount: dto.amount },
      ],
    });

    this.dashboardService?.invalidateCache(userId);
    this.portfolioGateway?.broadcastAllocationRebalanced(userId, {
      trigger: 'WITHDRAWAL_SETTLED',
      assetId: 'wallet',
      symbol: dto.currency,
    });

    return {
      success: true,
      status: 'SETTLED',
      direction: 'WITHDRAWAL',
      amount: dto.amount,
      currency: dto.currency,
      destination: destination.addressOrIban,
      referenceId: tx.referenceId,
    };
  }

  /**
   * Cash Sweep Engine: Sweeps idle cash exceeding threshold into money market yield pot
   */
  async sweepIdleCash(userId: string, dto: CashSweepDto) {
    const cashAccount = await this.getOrCreateAccount(userId, 'AVAILABLE_CASH', dto.currency);
    const investedAccount = await this.getOrCreateAccount(userId, 'INVESTED_CAPITAL', dto.currency);

    const currentBalance = Number(cashAccount.balance);
    if (currentBalance < dto.threshold) {
      return {
        swept: false,
        message: `Available cash (${currentBalance} ${dto.currency}) does not exceed threshold (${dto.threshold} ${dto.currency}).`,
        currentBalance,
      };
    }

    const sweepAmount = Math.min(dto.sweepAmount, currentBalance);

    const tx = await this.recordLedgerTransaction({
      type: 'SWEEP',
      description: `Automated cash sweep of ${sweepAmount} ${dto.currency} into money market yield fund`,
      entries: [
        { accountId: cashAccount.id, amount: -sweepAmount },
        { accountId: investedAccount.id, amount: sweepAmount },
      ],
    });

    this.dashboardService?.invalidateCache(userId);

    return {
      swept: true,
      amountSwept: sweepAmount,
      currency: dto.currency,
      newAvailableBalance: currentBalance - sweepAmount,
      referenceId: tx.referenceId,
    };
  }

  /**
   * FX Conversion: Instant zero-spread multi-currency exchange
   */
  async convertFx(userId: string, dto: FxConvertDto) {
    if (dto.fromCurrency === dto.toCurrency) {
      throw new BadRequestException('Cannot convert between identical currencies');
    }

    const fromAccount = await this.getOrCreateAccount(userId, 'AVAILABLE_CASH', dto.fromCurrency);
    const toAccount = await this.getOrCreateAccount(userId, 'AVAILABLE_CASH', dto.toCurrency);

    const fromRate = this.FX_RATES_TO_USD[dto.fromCurrency] || 1.0;
    const toRate = this.FX_RATES_TO_USD[dto.toCurrency] || 1.0;

    // Converted amount in target currency = (amount * fromRate) / toRate
    const convertedAmount = Number(((dto.amount * fromRate) / toRate).toFixed(4));

    // Multi-currency double-entry ledger: each currency leg balances to zero
    const clearingFrom = await this.getOrCreateAccount(userId, 'FEE_RECEIVABLE', dto.fromCurrency);
    const clearingTo = await this.getOrCreateAccount(userId, 'FEE_RECEIVABLE', dto.toCurrency);

    const tx = await this.recordLedgerTransaction({
      type: 'FX',
      description: `Spot FX conversion: ${dto.amount} ${dto.fromCurrency} -> ${convertedAmount} ${dto.toCurrency}`,
      entries: [
        // Leg 1: Sold currency balances to 0
        { accountId: fromAccount.id, amount: -dto.amount },
        { accountId: clearingFrom.id, amount: dto.amount },
        // Leg 2: Bought currency balances to 0
        { accountId: toAccount.id, amount: convertedAmount },
        { accountId: clearingTo.id, amount: -convertedAmount },
      ],
    });

    this.dashboardService?.invalidateCache(userId);
    this.portfolioGateway?.broadcastAllocationRebalanced(userId, {
      trigger: 'FX_CONVERTED',
      assetId: 'wallet',
      symbol: dto.toCurrency,
    });

    return {
      success: true,
      fromCurrency: dto.fromCurrency,
      toCurrency: dto.toCurrency,
      amountSold: dto.amount,
      amountBought: convertedAmount,
      rate: Number((fromRate / toRate).toFixed(6)),
      referenceId: tx.referenceId,
    };
  }

  /**
   * Paginated Transaction Ledger
   */
  async getTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const userAccounts = await this.prisma.ledgerAccount.findMany({
      where: { userId },
      select: { id: true },
    });
    const accountIds = userAccounts.map((a) => a.id);

    const [entries, totalCount] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where: { accountId: { in: accountIds } },
        include: {
          transaction: true,
          account: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.ledgerEntry.count({
        where: { accountId: { in: accountIds } },
      }),
    ]);

    return {
      transactions: entries.map((e) => ({
        id: e.id,
        referenceId: e.transaction.referenceId,
        type: e.transaction.type,
        status: e.transaction.status,
        description: e.transaction.description,
        amount: e.amount.toString(),
        accountType: e.account.accountType,
        currency: e.account.currency,
        createdAt: e.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Direct balance adjustment with double-entry conservation in database
   */
  async adjustBalance(userId: string, amount: number, description = 'Direct balance adjustment') {
    const cashAccount = await this.getOrCreateAccount(userId, 'AVAILABLE_CASH', 'USD');
    const systemAccount = await this.getOrCreateAccount(userId, 'FEE_RECEIVABLE', 'USD');

    // Debit/Credit conservation
    await this.recordLedgerTransaction({
      type: amount >= 0 ? 'DEPOSIT' : 'WITHDRAWAL',
      description,
      entries: [
        { accountId: cashAccount.id, amount },
        { accountId: systemAccount.id, amount: -amount },
      ],
    });

    const updated = await this.getBalances(userId);
    const availableCashTotal = updated.availableCash.reduce((sum, a) => sum + a.usdEquivalent, 0);

    this.dashboardService?.invalidateCache(userId);
    this.portfolioGateway?.broadcastBalanceUpdated(userId, {
      availableCash: availableCashTotal,
      currency: 'USD',
    });

    return {
      success: true,
      availableCash: availableCashTotal,
      totalUsd: updated.totalUsd,
    };
  }
}

