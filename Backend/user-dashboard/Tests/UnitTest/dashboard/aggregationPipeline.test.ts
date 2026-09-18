import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../../../src/modules/dashboard/dashboard.service';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('DashboardService — Universal Command Bar & Multi-Asset Aggregator', () => {
  let dashboardService: DashboardService;
  let mockPrisma: {
    user: { findUnique: ReturnType<typeof vi.fn> };
    cryptoHolding: { findMany: ReturnType<typeof vi.fn> };
    stockPosition: { findMany: ReturnType<typeof vi.fn> };
    aiFundPosition: { findMany: ReturnType<typeof vi.fn> };
    realEstateShare: { findMany: ReturnType<typeof vi.fn> };
    carShare: { findMany: ReturnType<typeof vi.fn> };
    ledgerAccount: { findMany: ReturnType<typeof vi.fn> };
  };

  const testUserId = 'usr-institutional-001';

  beforeEach(() => {
    mockPrisma = {
      user: { findUnique: vi.fn() },
      cryptoHolding: { findMany: vi.fn() },
      stockPosition: { findMany: vi.fn() },
      aiFundPosition: { findMany: vi.fn() },
      realEstateShare: { findMany: vi.fn() },
      carShare: { findMany: vi.fn() },
      ledgerAccount: { findMany: vi.fn() },
    };

    dashboardService = new DashboardService(mockPrisma as unknown as PrismaService);
  });

  describe('getCommandBarData', () => {
    it('aggregates live positions across all 7 asset classes with exact color tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        tier: 'INSTITUTIONAL',
        kycTier: 'TIER_3',
      });

      // 1. Crypto: 2 BTC @ $60,000 = $120,000
      mockPrisma.cryptoHolding.findMany.mockResolvedValue([
        { quantity: 2.0, avgBuyPrice: 60000.0 },
      ]);

      // 2. Stocks: 100 NVDA @ $120 ($12,000) + 50 AAPL @ $200 ($10,000) = $22,000
      mockPrisma.stockPosition.findMany.mockResolvedValue([
        { shares: 100, avgCostBasis: 120.0 },
        { shares: 50, avgCostBasis: 200.0 },
      ]);

      // 3. AI Quant Funds: $50,000 allocated + $5,000 alpha = $55,000
      mockPrisma.aiFundPosition.findMany.mockResolvedValue([
        { allocatedUsd: 50000.0, unrealizedAlpha: 5000.0 },
      ]);

      // 4. Prime Real Estate: 100 tokens @ $250 = $25,000
      mockPrisma.realEstateShare.findMany.mockResolvedValue([
        { tokenCount: 100, property: { tokenPriceUsd: 250.0 } },
      ]);

      // 5. Exotic Cars: 50% share of $200,000 car = $100,000
      mockPrisma.carShare.findMany.mockResolvedValue([
        { sharePct: 50.0, car: { insuredValue: 200000.0 } },
      ]);

      // 6. Cash Ledger: $50,000
      mockPrisma.ledgerAccount.findMany.mockResolvedValue([
        { balance: '50000.00' },
      ]);

      const result = await dashboardService.getCommandBarData(testUserId);

      // Total Net Worth = 120,000 + 22,000 + 55,000 + 25,000 + 100,000 + 50,000 = $372,000
      expect(result.consolidatedNetWorth).toBe(372000.0);
      expect(result.currency).toBe('USD');

      // Verify Allocation Matrix
      expect(result.allocationMatrix).toHaveLength(6);

      const cryptoAllocation = result.allocationMatrix.find((a) => a.id === 'crypto');
      expect(cryptoAllocation).toBeDefined();
      expect(cryptoAllocation?.actualValue).toBe(120000.0);
      expect(cryptoAllocation?.actualPct).toBe(32.3);
      expect(cryptoAllocation?.color).toBe('#E5C158');

      const stocksAllocation = result.allocationMatrix.find((a) => a.id === 'stocks');
      expect(stocksAllocation?.actualValue).toBe(22000.0);
      expect(stocksAllocation?.color).toBe('#53DC98');

      const aiFundsAllocation = result.allocationMatrix.find((a) => a.id === 'ai-funds');
      expect(aiFundsAllocation?.actualValue).toBe(55000.0);
      expect(aiFundsAllocation?.color).toBe('#926F13');

      const realEstateAllocation = result.allocationMatrix.find((a) => a.id === 'real-estate');
      expect(realEstateAllocation?.actualValue).toBe(25000.0);
      expect(realEstateAllocation?.color).toBe('#D4AF37');

      const carsAllocation = result.allocationMatrix.find((a) => a.id === 'cars');
      expect(carsAllocation?.actualValue).toBe(100000.0);
      expect(carsAllocation?.color).toBe('#BA1A1A');

      const walletAllocation = result.allocationMatrix.find((a) => a.id === 'wallet');
      expect(walletAllocation?.actualValue).toBe(50000.0);
      expect(walletAllocation?.color).toBe('#8B9BB4');

      // Allocation percentages sum approximately to 100%
      const totalPct = result.allocationMatrix.reduce((sum, item) => sum + item.actualPct, 0);
      expect(totalPct).toBeGreaterThanOrEqual(99.0);
      expect(totalPct).toBeLessThanOrEqual(101.0);

      // Verify Returns metrics
      expect(result.returns['1D'].percentageChange).toBe(1.26);
      expect(result.returns['1D'].dollarChange).toBeGreaterThan(0);
      expect(result.returns['1Y'].percentageChange).toBe(23.71);
      expect(result.returns.ALL.percentageChange).toBe(57.65);

      // Verify KYC Status
      expect(result.kycStatus).toEqual({
        tier: 'TIER_3',
        dailyLimit: 'UNLIMITED',
        status: 'VERIFIED',
      });
    });

    it('safely handles empty portfolio with zero balances without NaN or division by zero', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-empty',
        tier: 'RETAIL',
        kycTier: 'TIER_1',
      });

      mockPrisma.cryptoHolding.findMany.mockResolvedValue([]);
      mockPrisma.stockPosition.findMany.mockResolvedValue([]);
      mockPrisma.aiFundPosition.findMany.mockResolvedValue([]);
      mockPrisma.realEstateShare.findMany.mockResolvedValue([]);
      mockPrisma.carShare.findMany.mockResolvedValue([]);
      mockPrisma.ledgerAccount.findMany.mockResolvedValue([]);

      const result = await dashboardService.getCommandBarData('usr-empty');

      expect(result.consolidatedNetWorth).toBe(0);
      expect(result.returns['1D'].dollarChange).toBe(0);
      expect(result.returns['1D'].percentageChange).toBe(0);

      for (const item of result.allocationMatrix) {
        expect(item.actualValue).toBe(0);
        expect(item.actualPct).toBe(0);
        expect(Number.isNaN(item.actualPct)).toBe(false);
      }

      expect(result.kycStatus).toEqual({
        tier: 'TIER_1',
        dailyLimit: '$10,000',
        status: 'BASIC',
      });
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(dashboardService.getCommandBarData('non-existent-user')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('serves cached aggregate response on successive calls within TTL', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        tier: 'PRIVATE_WEALTH',
        kycTier: 'TIER_2',
      });
      mockPrisma.cryptoHolding.findMany.mockResolvedValue([]);
      mockPrisma.stockPosition.findMany.mockResolvedValue([]);
      mockPrisma.aiFundPosition.findMany.mockResolvedValue([]);
      mockPrisma.realEstateShare.findMany.mockResolvedValue([]);
      mockPrisma.carShare.findMany.mockResolvedValue([]);
      mockPrisma.ledgerAccount.findMany.mockResolvedValue([]);

      const res1 = await dashboardService.getCommandBarData(testUserId);
      const res2 = await dashboardService.getCommandBarData(testUserId);

      expect(res1).toBe(res2); // Strict reference equality from in-memory cache
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('re-queries database when cache is explicitly invalidated', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        tier: 'PRIVATE_WEALTH',
        kycTier: 'TIER_2',
      });
      mockPrisma.cryptoHolding.findMany.mockResolvedValue([]);
      mockPrisma.stockPosition.findMany.mockResolvedValue([]);
      mockPrisma.aiFundPosition.findMany.mockResolvedValue([]);
      mockPrisma.realEstateShare.findMany.mockResolvedValue([]);
      mockPrisma.carShare.findMany.mockResolvedValue([]);
      mockPrisma.ledgerAccount.findMany.mockResolvedValue([]);

      await dashboardService.getCommandBarData(testUserId);
      dashboardService.invalidateCache(testUserId);
      await dashboardService.getCommandBarData(testUserId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2);
    });

    it('completes aggregation calculation pipeline in under 30ms', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        tier: 'INSTITUTIONAL',
        kycTier: 'TIER_3',
      });
      mockPrisma.cryptoHolding.findMany.mockResolvedValue([{ quantity: 5.5, avgBuyPrice: 50000 }]);
      mockPrisma.stockPosition.findMany.mockResolvedValue([{ shares: 200, avgCostBasis: 150 }]);
      mockPrisma.aiFundPosition.findMany.mockResolvedValue([{ allocatedUsd: 100000, unrealizedAlpha: 12000 }]);
      mockPrisma.realEstateShare.findMany.mockResolvedValue([{ tokenCount: 50, property: { tokenPriceUsd: 500 } }]);
      mockPrisma.carShare.findMany.mockResolvedValue([{ sharePct: 25, car: { insuredValue: 300000 } }]);
      mockPrisma.ledgerAccount.findMany.mockResolvedValue([{ balance: '75000' }]);

      dashboardService.invalidateCache(testUserId);

      const start = performance.now();
      await dashboardService.getCommandBarData(testUserId);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(30); // Institutional SLA: <30ms
    });
  });

  describe('getActionRail', () => {
    it('computes correct limits and quarantine alerts for Tier 2 user with quarantined destination', async () => {
      const futureQuarantineDate = new Date(Date.now() + 24 * 3600 * 1000);
      const pastQuarantineDate = new Date(Date.now() - 3600 * 1000);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        kycTier: 'TIER_2',
        isActive: true,
        tier: 'PRIVATE_WEALTH',
        whitelistAddresses: [
          { status: 'QUARANTINE', quarantineUntil: futureQuarantineDate },
          { status: 'ACTIVE', quarantineUntil: pastQuarantineDate },
        ],
      });

      const rail = await dashboardService.getActionRail(testUserId);

      expect(rail.kycTier).toBe('TIER_2');
      expect(rail.dailyDepositLimit).toBe(250000);
      expect(rail.dailyWithdrawalLimit).toBe(250000);
      expect(rail.quarantinedDestinationsCount).toBe(1);
      expect(rail.activeDestinationsCount).toBe(1);
      expect(rail.depositEligible).toBe(true);
      expect(rail.withdrawalEligible).toBe(true);
      expect(rail.requiresHardwareSignature).toBe(true); // Quarantined destination present
    });

    it('throws NotFoundException if user does not exist in getActionRail', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(dashboardService.getActionRail('unknown-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
