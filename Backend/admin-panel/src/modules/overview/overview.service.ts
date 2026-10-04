import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { SettlementQueryDto } from './dto/settlement-query.dto';

export interface OverviewMetrics {
  totalVaultBalance: number;
  vaultBalanceChange24h: number;
  liquidSettlementCapital: number;
  activeLiquidityRailsCount: number;
  actionQueuePending: number;
  actionQueueWarning: string;
  treasurySignOffs?: number;
  pendingTreasury?: number;
  pendingCompliance?: number;
  netSettlement24h: number;
  settledTransactionsCount24h: number;
  nodeTelemetry: {
    shardLatencyMs: number;
    activeShards: number;
    coldStoreActive: boolean;
  };
  badgeCounts?: BadgeCounts;
}

export interface BadgeCounts {
  urgentActions: number;
  newInquiries: number;
  totalUsers: number;
  pendingCompliance: number;
  treasurySignOffs: number;
  activeCards: number;
  pendingWithdrawals?: number;
}

export interface SettlementRecord {
  id: string;
  timestamp: string;
  type: 'DEPOSIT_WIRE' | 'WITHDRAWAL' | 'INTERNAL_SETTLEMENT' | 'VAULT_SWAP';
  entity: string;
  accountNumber: string;
  amount: number;
  currency: string;
  status: 'SETTLED' | 'PENDING_DUAL_SIG' | 'PROCESSING' | 'BLOCKED';
  rail: string;
}

const FX_TO_USD: Record<string, number> = {
  USD: 1.0,
  USDC: 1.0,
  USDT: 1.0,
  EUR: 1.08,
  CHF: 1.12,
  BTC: 65000.0,
  ETH: 3500.0,
};

@Injectable()
export class OverviewService {
  constructor(private readonly prisma: PrismaService) {}

  private async getPendingComplianceCount(): Promise<number> {
    const unverifiedDocs = await this.prisma.kycDocument.findMany({
      where: { isVerified: false },
      select: { id: true },
    });

    if (unverifiedDocs.length === 0) return 0;

    let rejectedDocIds = new Set<string>();
    try {
      const rejectedAudits = await this.prisma.adminAuditLog.findMany({
        where: {
          targetEntity: 'KycDocument',
          targetId: { in: unverifiedDocs.map((d) => d.id) },
          action: 'KYC_DOC_REJECTED',
        },
        select: { targetId: true },
      });
      rejectedDocIds = new Set(
        rejectedAudits.map((a) => a.targetId).filter(Boolean) as string[],
      );
    } catch {
      // continue gracefully
    }

    return unverifiedDocs.filter((d) => !rejectedDocIds.has(d.id)).length;
  }

  async getBadgeCounts(): Promise<BadgeCounts> {
    const [
      urgentActions,
      pendingWithdrawals,
      newInquiries,
      totalUsers,
      pendingCompliance,
      treasurySignOffs,
      activeCards,
    ] = await Promise.all([
      this.prisma.ledgerTransaction.count({
        where: { status: { in: ['PENDING', 'PENDING_SECOND_SIGN_OFF'] } },
      }),
      this.prisma.ledgerTransaction.count({
        where: {
          type: 'WITHDRAWAL',
          status: { in: ['PENDING', 'PENDING_SECOND_SIGN_OFF'] },
        },
      }),
      this.prisma.leadInquiry.count({
        where: { status: 'NEW' },
      }),
      this.prisma.user.count(),
      this.getPendingComplianceCount(),
      this.prisma.ledgerTransaction.count({
        where: { status: 'PENDING_SECOND_SIGN_OFF' },
      }),
      this.prisma.vipCard.count({
        where: { isFrozen: false },
      }),
    ]);

    return {
      urgentActions,
      pendingWithdrawals,
      newInquiries,
      totalUsers,
      pendingCompliance,
      treasurySignOffs,
      activeCards,
    };
  }

  async getMetrics(): Promise<OverviewMetrics> {
    // 1. Calculate Aggregate Balances across real ledger accounts in consistent USD valuation
    let totalVaultBalance = 0;
    let liquidSettlementCapital = 0;

    const ledgerAccounts = await this.prisma.ledgerAccount.findMany();
    if (ledgerAccounts.length > 0) {
      for (const acc of ledgerAccounts) {
        const currency = (acc.currency || 'USD').toUpperCase();
        const rate = FX_TO_USD[currency] ?? 1.0;
        const balUsd = Number(acc.balance) * rate;
        totalVaultBalance += balUsd;
        if (acc.accountType === 'AVAILABLE_CASH') {
          liquidSettlementCapital += balUsd;
        }
      }
    }

    // 2. Count Active Rails
    const [fiatRail, cryptoRailsCount] = await Promise.all([
      this.prisma.fiatDepositRailConfig.count(),
      this.prisma.cryptoDepositRailConfig.count({ where: { isActive: true } }),
    ]);
    const activeLiquidityRailsCount = fiatRail + cryptoRailsCount;

    // 3. Action Queue Pending Triage Items (KYC, Dual Sign-offs, Pending Wires)
    const [
      pendingTxs,
      pendingWithdrawals,
      pendingCompliance,
      newInquiries,
      totalUsers,
      treasurySignOffs,
      activeCards,
    ] = await Promise.all([
      this.prisma.ledgerTransaction.count({
        where: {
          status: { in: ['PENDING', 'PENDING_SECOND_SIGN_OFF'] },
        },
      }),
      this.prisma.ledgerTransaction.count({
        where: {
          type: 'WITHDRAWAL',
          status: { in: ['PENDING', 'PENDING_SECOND_SIGN_OFF'] },
        },
      }),
      this.getPendingComplianceCount(),
      this.prisma.leadInquiry.count({
        where: { status: 'NEW' },
      }),
      this.prisma.user.count(),
      this.prisma.ledgerTransaction.count({
        where: { status: 'PENDING_SECOND_SIGN_OFF' },
      }),
      this.prisma.vipCard.count({
        where: { isFrozen: false },
      }),
    ]);
    const actionQueuePending = pendingTxs + pendingCompliance;
    const warningText =
      actionQueuePending === 0
        ? 'All treasury and compliance queues cleared and up to date'
        : `${actionQueuePending} actionable treasury/compliance item${actionQueuePending === 1 ? '' : 's'} require triage (${pendingTxs} treasury, ${pendingCompliance} compliance)`;

    // 4. Net Settlement 24h & Settled Transactions (strictly bounded to transactions created within the last 24h)
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const settledTxs = await this.prisma.ledgerTransaction.findMany({
      where: {
        status: 'SETTLED',
        createdAt: { gte: since24h },
      },
      include: {
        entries: {
          include: {
            account: true,
          },
        },
      },
    });

    const settledTransactionsCount24h = settledTxs.length;
    let netSettlement24h = 0;
    for (const tx of settledTxs) {
      let amount = Number(tx.amount || 0);
      let currency = (tx.currency || 'USD').toUpperCase();
      if (tx.entries?.length) {
        const pos = tx.entries.find((e: any) => Number(e.amount) > 0) || tx.entries[0];
        if (pos) {
          amount = Math.abs(Number(pos?.amount || 0)) || amount;
          currency = (pos?.account?.currency || currency).toUpperCase();
        }
      }
      const rate = FX_TO_USD[currency] ?? 1.0;
      const amtUsd = amount * rate;
      if (tx.type === 'DEPOSIT') netSettlement24h += amtUsd;
      else if (tx.type === 'WITHDRAWAL') netSettlement24h -= amtUsd;
      else netSettlement24h += amtUsd;
    }

    const priorBalance = totalVaultBalance - netSettlement24h;
    const vaultBalanceChange24h =
      priorBalance > 0
        ? Number(((netSettlement24h / priorBalance) * 100).toFixed(1))
        : totalVaultBalance > 0
        ? 100.0
        : 0.0;

    return {
      totalVaultBalance,
      vaultBalanceChange24h,
      liquidSettlementCapital,
      activeLiquidityRailsCount,
      actionQueuePending,
      actionQueueWarning: warningText,
      treasurySignOffs,
      pendingTreasury: pendingTxs,
      pendingCompliance,
      netSettlement24h,
      settledTransactionsCount24h,
      nodeTelemetry: {
        shardLatencyMs: 18,
        activeShards: 8,
        coldStoreActive: true,
      },
      badgeCounts: {
        urgentActions: pendingTxs,
        pendingWithdrawals,
        newInquiries,
        totalUsers,
        pendingCompliance,
        treasurySignOffs,
        activeCards,
      },
    };
  }

  async getSettlementLedger(query: SettlementQueryDto): Promise<SettlementRecord[]> {
    const whereClause: any = {};

    if (query.currency && query.currency !== 'ALL') {
      const curr = query.currency.toUpperCase();
      whereClause.OR = [
        {
          entries: {
            some: {
              account: {
                currency: curr,
              },
            },
          },
        },
        {
          currency: curr,
        },
      ];
    }

    if (query.type && query.type !== 'ALL') {
      const normalizedType = query.type.toUpperCase();
      if (normalizedType === 'DEPOSIT_WIRE') {
        whereClause.type = 'DEPOSIT';
      } else if (normalizedType === 'VAULT_SWAP') {
        whereClause.type = { in: ['TRADE', 'SWEEP'] };
      } else if (normalizedType === 'INTERNAL_SETTLEMENT') {
        whereClause.type = { notIn: ['DEPOSIT', 'WITHDRAWAL', 'TRADE', 'SWEEP'] };
      } else {
        whereClause.type = normalizedType;
      }
    }

    if (query.timeHorizon && query.timeHorizon.toUpperCase() !== 'ALL') {
      const horizon = query.timeHorizon.toLowerCase();
      const now = Date.now();
      let since: Date | undefined;
      if (horizon === '24h') {
        since = new Date(now - 24 * 60 * 60 * 1000);
      } else if (horizon === '7d') {
        since = new Date(now - 7 * 24 * 60 * 60 * 1000);
      } else if (horizon === '30d') {
        since = new Date(now - 30 * 24 * 60 * 60 * 1000);
      }
      if (since) {
        whereClause.createdAt = { gte: since };
      }
    }

    const parsedLimit = query.limit ? parseInt(query.limit, 10) : 50;
    const limit = isNaN(parsedLimit) || parsedLimit <= 0 ? 50 : Math.min(parsedLimit, 100);

    const parsedPage = query.page ? parseInt(query.page, 10) : 1;
    const page = isNaN(parsedPage) || parsedPage <= 0 ? 1 : parsedPage;
    const skip = (page - 1) * limit;

    let dbTxs: any[];
    try {
      dbTxs = await this.prisma.ledgerTransaction.findMany({
        where: whereClause,
        include: {
          entries: {
            include: {
              account: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      });
    } catch {
      dbTxs = [];
    }

    if (dbTxs.length > 0) {
      return dbTxs.map((tx) => this.mapTransactionToRecord(tx));
    }

    return [];
  }

  private mapTransactionToRecord(tx: any): SettlementRecord {
    let type: SettlementRecord['type'] = 'INTERNAL_SETTLEMENT';
    const normalizedType = (tx.type || '').toUpperCase();
    if (normalizedType === 'DEPOSIT') {
      type = 'DEPOSIT_WIRE';
    } else if (normalizedType === 'WITHDRAWAL') {
      type = 'WITHDRAWAL';
    } else if (normalizedType === 'TRADE' || normalizedType === 'SWEEP' || normalizedType === 'STAKE') {
      type = 'VAULT_SWAP';
    }

    let status: SettlementRecord['status'] = 'SETTLED';
    if (tx.status === 'PENDING_SECOND_SIGN_OFF' || tx.status === 'PENDING_DUAL_SIG') {
      status = 'PENDING_DUAL_SIG';
    } else if (tx.status === 'PENDING') {
      status = 'PROCESSING';
    } else if (tx.status === 'FAILED') {
      status = 'BLOCKED';
    }

    let amount = 0;
    let currency = 'USD';
    let entity = '';
    let accountNumber = '';

    if (tx.entries && tx.entries.length > 0) {
      const positiveEntry = tx.entries.find((e: any) => Number(e.amount) > 0) || tx.entries[0];
      if (positiveEntry) {
        amount = Math.abs(Number(positiveEntry.amount || 0));
        if (positiveEntry.account) {
          currency = positiveEntry.account.currency || 'USD';
          if (positiveEntry.account.user) {
            entity = positiveEntry.account.user.fullName || positiveEntry.account.user.email;
          }
          accountNumber = `${positiveEntry.account.accountType} (${currency})`;
        }
      }
    }

    if (amount === 0 && tx.amount !== undefined) {
      amount = Math.abs(Number(tx.amount));
    }
    if (tx.currency) {
      currency = tx.currency;
    }

    if (!entity) {
      entity = tx.description || 'WavyAssets Custody AG';
    }
    if (!accountNumber) {
      accountNumber = 'Vault Depository';
    }

    let isoTimestamp = new Date().toISOString();
    if (tx.createdAt) {
      if (tx.createdAt instanceof Date) {
        isoTimestamp = tx.createdAt.toISOString();
      } else if (typeof tx.createdAt === 'number') {
        isoTimestamp = new Date(tx.createdAt).toISOString();
      } else if (typeof tx.createdAt === 'string') {
        const parsed = Number(tx.createdAt);
        if (!isNaN(parsed) && parsed > 1000000000) {
          isoTimestamp = new Date(parsed).toISOString();
        } else {
          isoTimestamp = new Date(tx.createdAt).toISOString();
        }
      }
    }

    const rail = currency === 'USDC' || currency === 'ETH' ? 'ETH' : currency === 'BTC' ? 'BTC' : currency === 'EUR' ? 'FEDWIRE' : 'SWISS_SIC';

    return {
      id: tx.referenceId || tx.id,
      timestamp: isoTimestamp,
      type,
      entity,
      accountNumber,
      amount,
      currency,
      status,
      rail,
    };
  }
}
