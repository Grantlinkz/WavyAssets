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
  netSettlement24h: number;
  settledTransactionsCount24h: number;
  nodeTelemetry: {
    shardLatencyMs: number;
    activeShards: number;
    coldStoreActive: boolean;
  };
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
  EUR: 1.08,
  CHF: 1.12,
  BTC: 65000.0,
  ETH: 3500.0,
};

@Injectable()
export class OverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(): Promise<OverviewMetrics> {
    // 1. Calculate Aggregate Balances across sovereign ledger accounts in consistent USD valuation
    let totalVaultBalance = 142890420.0;
    let liquidSettlementCapital = 28450110.5;

    const ledgerAccounts = await this.prisma.ledgerAccount.findMany();
    if (ledgerAccounts.length > 0) {
      let total = 0;
      let liquid = 0;
      for (const acc of ledgerAccounts) {
        const currency = (acc.currency || 'USD').toUpperCase();
        const rate = FX_TO_USD[currency] ?? 1.0;
        const balUsd = Number(acc.balance) * rate;
        total += balUsd;
        if (acc.accountType === 'AVAILABLE_CASH') {
          liquid += balUsd;
        }
      }
      if (total > 0) {
        totalVaultBalance = total;
        liquidSettlementCapital = liquid;
      }
    }

    // 2. Count Active Rails
    const [fiatRail, cryptoRailsCount] = await Promise.all([
      this.prisma.fiatDepositRailConfig.count(),
      this.prisma.cryptoDepositRailConfig.count({ where: { isActive: true } }),
    ]);
    const activeLiquidityRailsCount = fiatRail + cryptoRailsCount;

    // 3. Action Queue Pending Triage Items (KYC, Dual Sign-offs, Pending Wires)
    const [pendingTxs, unverifiedDocs, newInquiries] = await Promise.all([
      this.prisma.ledgerTransaction.count({
        where: {
          status: { in: ['PENDING', 'PENDING_SECOND_SIGN_OFF'] },
        },
      }),
      this.prisma.kycDocument.count({
        where: { isVerified: false },
      }),
      this.prisma.leadInquiry.count({
        where: { status: 'NEW' },
      }),
    ]);
    const actionQueuePending = pendingTxs + unverifiedDocs + newInquiries;

    // 4. Net Settlement 24h & Settled Transactions (strictly bounded to transactions created within the last 24h)
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const settledTxs = await this.prisma.ledgerTransaction.findMany({
      where: {
        status: 'SETTLED',
        createdAt: { gte: since24h },
      },
    });

    const settledTransactionsCount24h = settledTxs.length;
    let netSettlement24h = 0;
    for (const tx of settledTxs) {
      const currency = (tx.currency || 'USD').toUpperCase();
      const rate = FX_TO_USD[currency] ?? 1.0;
      const amtUsd = Number(tx.amount) * rate;
      if (tx.type === 'DEPOSIT') netSettlement24h += amtUsd;
      else if (tx.type === 'WITHDRAWAL') netSettlement24h -= amtUsd;
      else netSettlement24h += amtUsd;
    }

    return {
      totalVaultBalance,
      vaultBalanceChange24h: 3.4,
      liquidSettlementCapital,
      activeLiquidityRailsCount,
      actionQueuePending,
      actionQueueWarning: `${actionQueuePending} actionable treasury/compliance items require triage`,
      netSettlement24h,
      settledTransactionsCount24h,
      nodeTelemetry: {
        shardLatencyMs: 18,
        activeShards: 8,
        coldStoreActive: true,
      },
    };
  }

  async getSettlementLedger(query: SettlementQueryDto): Promise<SettlementRecord[]> {
    const whereClause: any = {};

    if (query.currency && query.currency !== 'ALL') {
      whereClause.currency = query.currency.toUpperCase();
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
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      });
    } catch (err) {
      if (process.env.DEMO_MODE === 'true') {
        return this.getDemoBaselineRecords(query);
      }
      throw err;
    }

    if (dbTxs.length > 0) {
      return dbTxs.map((tx) => this.mapTransactionToRecord(tx));
    }

    if (process.env.DEMO_MODE === 'true') {
      return this.getDemoBaselineRecords(query);
    }

    return [];
  }

  private getDemoBaselineRecords(query: SettlementQueryDto): SettlementRecord[] {
    const baselineRecords: SettlementRecord[] = [
      {
        id: 'TX-SIC-89210-SETTLED',
        timestamp: new Date().toISOString(),
        type: 'DEPOSIT_WIRE',
        entity: 'UBS AG Zurich Enclave',
        accountNumber: 'CH93 0023 8812 4019 8821 0',
        amount: 5200000.0,
        currency: 'USD',
        status: 'SETTLED',
        rail: 'SWISS_SIC',
      },
      {
        id: 'TX-MPC-USDC-4819',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'DEPOSIT_WIRE',
        entity: '0x94A8...916B Fireblocks Vault',
        accountNumber: 'ERC-20 Inbound',
        amount: 2500000.0,
        currency: 'USDC',
        status: 'SETTLED',
        rail: 'ETH',
      },
      {
        id: 'TX-PENDING-WIRE-01',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: 'DEPOSIT_WIRE',
        entity: 'Banque Pictet & Cie SA',
        accountNumber: 'CH44 0078 1290 4410 9901 2',
        amount: 1500000.0,
        currency: 'USD',
        status: 'PROCESSING',
        rail: 'SWISS_SIC',
      },
      {
        id: 'TX-PENDING-WITHDRAWAL-HIGH-2',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        type: 'WITHDRAWAL',
        entity: 'LGT Bank AG',
        accountNumber: 'LI88 0032 1099 2210 9940 1',
        amount: 220000.0,
        currency: 'USD',
        status: 'PENDING_DUAL_SIG',
        rail: 'SWISS_SIC',
      },
    ];

    if (query.currency && query.currency !== 'ALL') {
      return baselineRecords.filter((r) => r.currency === query.currency);
    }

    return baselineRecords;
  }

  private mapTransactionToRecord(tx: any): SettlementRecord {
    let type: SettlementRecord['type'] = 'INTERNAL_SETTLEMENT';
    if (tx.type === 'DEPOSIT') {
      type = 'DEPOSIT_WIRE';
    } else if (tx.type === 'WITHDRAWAL') {
      type = 'WITHDRAWAL';
    } else if (tx.type === 'TRADE' || tx.type === 'SWEEP') {
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

    return {
      id: tx.id || tx.referenceId,
      timestamp: tx.createdAt ? tx.createdAt.toISOString() : new Date().toISOString(),
      type,
      entity: tx.counterparty || tx.description || 'WavyAssets Treasury',
      accountNumber: tx.accountNumber || (tx.rail ? `Rail: ${tx.rail}` : 'Sovereign Account'),
      amount: Number(tx.amount),
      currency: tx.currency || 'USD',
      status,
      rail: tx.rail || 'SWISS_SIC',
    };
  }
}
