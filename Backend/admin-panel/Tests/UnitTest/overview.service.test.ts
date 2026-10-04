import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OverviewService } from '../../src/modules/overview/overview.service';

describe('OverviewService', () => {
  let overviewService: OverviewService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      ledgerAccount: {
        findMany: vi.fn().mockResolvedValue([
          { accountType: 'AVAILABLE_CASH', balance: 28450110.5 },
          { accountType: 'INVESTED_CAPITAL', balance: 114440309.5 },
        ]),
      },
      fiatDepositRailConfig: {
        count: vi.fn().mockResolvedValue(1),
      },
      cryptoDepositRailConfig: {
        count: vi.fn().mockResolvedValue(4),
      },
      ledgerTransaction: {
        count: vi.fn().mockResolvedValue(2),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'TX-1',
            referenceId: 'REF-1',
            type: 'DEPOSIT',
            status: 'SETTLED',
            amount: 5200000,
            currency: 'USD',
            counterparty: 'UBS Zurich',
            createdAt: new Date(),
          },
        ]),
      },
      kycDocument: {
        count: vi.fn().mockResolvedValue(1),
      },
      leadInquiry: {
        count: vi.fn().mockResolvedValue(1),
      },
      user: {
        count: vi.fn().mockResolvedValue(10),
      },
      vipCard: {
        count: vi.fn().mockResolvedValue(5),
      },
    };

    overviewService = new OverviewService(mockPrisma);
  });

  describe('getMetrics', () => {
    it('should calculate executive metrics matching telemetry contracts', async () => {
      const metrics = await overviewService.getMetrics();

      expect(metrics.totalVaultBalance).toBe(142890420.0);
      expect(metrics.liquidSettlementCapital).toBe(28450110.5);
      expect(metrics.vaultBalanceChange24h).toBe(3.4);
      expect(metrics.activeLiquidityRailsCount).toBe(5);
      expect(metrics.actionQueuePending).toBe(3);
      expect(metrics.actionQueueWarning).toContain('3 actionable treasury/compliance items require triage');
      expect(metrics.nodeTelemetry.shardLatencyMs).toBe(18);
      expect(metrics.nodeTelemetry.activeShards).toBe(8);
      expect(metrics.nodeTelemetry.coldStoreActive).toBe(true);
    });
  });

  describe('getSettlementLedger', () => {
    it('should return settlement transactions mapped to frontend contract', async () => {
      const records = await overviewService.getSettlementLedger({});

      expect(records.length).toBeGreaterThan(0);
      const first = records[0];
      expect(first.id).toBeDefined();
      expect(first.type).toBe('DEPOSIT_WIRE');
      expect(first.amount).toBe(5200000);
      expect(first.currency).toBe('USD');
      expect(first.status).toBe('SETTLED');
    });

    it('should filter settlement records by currency', async () => {
      mockPrisma.ledgerTransaction.findMany.mockImplementation(async ({ where }: any) => {
        const matchesCurrency =
          where?.currency === 'USDC' ||
          where?.OR?.some((cond: any) => cond.currency === 'USDC');
        if (matchesCurrency) {
          return [
            {
              id: 'TX-USDC-1',
              type: 'DEPOSIT',
              status: 'SETTLED',
              amount: 100000,
              currency: 'USDC',
              createdAt: new Date(),
            },
          ];
        }
        return [];
      });

      const records = await overviewService.getSettlementLedger({ currency: 'USDC' });
      expect(records.length).toBe(1);
      expect(records[0].currency).toBe('USDC');
    });
  });
});
