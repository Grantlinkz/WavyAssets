import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiFundsService } from '../../../src/modules/ai-funds/ai-funds.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { WalletService } from '../../../src/modules/wallet/wallet.service';
import { CircuitBreakerTriggeredException } from '../../../src/common/exceptions';
import { BadRequestException } from '@nestjs/common';

describe('AiFundsService — Quantitative Telemetry, Yield Claiming & Circuit Breaker', () => {
  let aiFundsService: AiFundsService;
  let mockPrisma: {
    aiFundPosition: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
    };
    aiRationaleLog: {
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let mockWalletService: {
    getOrCreateAccount: ReturnType<typeof vi.fn>;
    recordLedgerTransaction: ReturnType<typeof vi.fn>;
  };
  let mockGateway: {
    broadcastAllocationRebalanced: ReturnType<typeof vi.fn>;
  };
  let mockDashboardService: {
    invalidateCache: ReturnType<typeof vi.fn>;
  };

  const testUserId = 'usr-institutional-001';

  beforeEach(() => {
    mockPrisma = {
      aiFundPosition: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      aiRationaleLog: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => (typeof cb === 'function' ? cb(mockPrisma) : Promise.all(cb))),
    };

    mockWalletService = {
      getOrCreateAccount: vi.fn().mockImplementation((userId, accountType, currency) =>
        Promise.resolve({
          id: `acc-${userId}-${accountType}`,
          userId,
          accountType,
          currency,
          balance: 100000.0,
        }),
      ),
      recordLedgerTransaction: vi.fn().mockResolvedValue({ id: 'tx-ai-yield' }),
    };

    mockGateway = {
      broadcastAllocationRebalanced: vi.fn(),
    };

    mockDashboardService = {
      invalidateCache: vi.fn(),
    };

    aiFundsService = new AiFundsService(
      mockPrisma as unknown as PrismaService,
      mockWalletService as unknown as WalletService,
      mockGateway as any,
      mockDashboardService as any,
    );
  });

  describe('getMetrics', () => {
    it('returns balanced quantitative metrics and benchmark comparison', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-001',
        userId: testUserId,
        strategyTier: 'balanced',
        allocatedUsd: 2500000.0,
        unrealizedAlpha: 142850.0,
        circuitBreaker: false,
        claimedYield: 34200.0,
        pendingYield: 1845.5,
      });

      const metrics = await aiFundsService.getMetrics(testUserId);
      expect(metrics.strategyTier).toBe('balanced');
      expect(metrics.sharpeRatio).toBe(3.12);
      expect(metrics.sortinoRatio).toBe(4.05);
      expect(metrics.maxDrawdownPct).toBe(-4.2);
      expect(metrics.annualAlphaPct).toBe(18.6);
      expect(metrics.circuitBreakerActive).toBe(false);
      expect(metrics.benchmark.sp500AnnualReturnPct).toBe(12.4);
      expect(metrics.benchmark.alphaSpreadPct).toBe(6.2);
    });

    it('returns high-volatility telemetry with elevated Sharpe and beta', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-002',
        userId: testUserId,
        strategyTier: 'high-vol',
        allocatedUsd: 3000000.0,
        unrealizedAlpha: 350000.0,
        circuitBreaker: false,
        claimedYield: 50000.0,
        pendingYield: 5000.0,
      });

      const metrics = await aiFundsService.getMetrics(testUserId);
      expect(metrics.strategyTier).toBe('high-vol');
      expect(metrics.annualAlphaPct).toBe(34.2);
      expect(metrics.portfolioBeta).toBe(1.28);
    });
  });

  describe('setRiskTier', () => {
    it('updates strategy tier and broadcasts allocation rebalance', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-001',
        userId: testUserId,
        strategyTier: 'balanced',
      });
      mockPrisma.aiFundPosition.update.mockResolvedValue({
        id: 'pos-001',
        strategyTier: 'preservation',
        updatedAt: new Date('2026-09-16T04:00:00.000Z'),
      });

      const result = await aiFundsService.setRiskTier(testUserId, { strategyTier: 'preservation' });
      expect(result.success).toBe(true);
      expect(result.strategyTier).toBe('preservation');
      expect(mockGateway.broadcastAllocationRebalanced).toHaveBeenCalledWith(testUserId, {
        trigger: 'AI_STRATEGY_CALIBRATED',
        assetId: 'ai-funds',
      });
    });
  });

  describe('getComputeYield & claimComputeYield', () => {
    it('returns GPU cluster telemetry and accrued yields', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-001',
        userId: testUserId,
        pendingYield: 1845.5,
        claimedYield: 34200.0,
        updatedAt: new Date('2026-09-16T04:00:00.000Z'),
      });

      const yieldData = await aiFundsService.getComputeYield(testUserId);
      expect(yieldData.clusterTelemetry.accelerator).toBe('NVIDIA H100 SXM5 80GB');
      expect(yieldData.clusterTelemetry.utilizationPct).toBe(94.8);
      expect(yieldData.userYield.pendingYieldUsd).toBe(1845.5);
    });

    it('rejects yield claiming if pending yield is zero or negative', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-001',
        userId: testUserId,
        pendingYield: 0.0,
        claimedYield: 34200.0,
      });

      await expect(aiFundsService.claimComputeYield(testUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('claims pending yield via double-entry transaction and resets pending balance', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-001',
        userId: testUserId,
        pendingYield: 2500.0,
        claimedYield: 10000.0,
      });
      mockPrisma.aiFundPosition.update.mockResolvedValue({});

      const claim = await aiFundsService.claimComputeYield(testUserId);
      expect(claim.success).toBe(true);
      expect(claim.claimedAmountUsd).toBe(2500.0);
      expect(claim.walletBalanceUpdated).toBe(true);
      expect(mockWalletService.recordLedgerTransaction).toHaveBeenCalledTimes(1);
      expect(mockDashboardService.invalidateCache).toHaveBeenCalledWith(testUserId);
    });
  });

  describe('Emergency Circuit Breaker Invariant', () => {
    it('toggles circuit breaker state and broadcasts notification', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-001',
        userId: testUserId,
        circuitBreaker: false,
      });
      mockPrisma.aiFundPosition.update.mockResolvedValue({
        id: 'pos-001',
        circuitBreaker: true,
      });

      const res = await aiFundsService.toggleCircuitBreaker(testUserId, {
        circuitBreaker: true,
        reason: 'Extreme market volatility spike',
      });
      expect(res.success).toBe(true);
      expect(res.circuitBreakerActive).toBe(true);
      expect(mockGateway.broadcastAllocationRebalanced).toHaveBeenCalledWith(testUserId, {
        trigger: 'CIRCUIT_BREAKER_TOGGLED',
        assetId: 'ai-funds',
      });
    });

    it('hard-blocks rebalance execution by throwing CircuitBreakerTriggeredException (HTTP 403) when active', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-001',
        userId: testUserId,
        circuitBreaker: true, // Circuit breaker active
      });

      await expect(aiFundsService.rebalance(testUserId)).rejects.toThrow(
        CircuitBreakerTriggeredException,
      );
    });

    it('permits rebalance execution when circuit breaker is inactive', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-001',
        userId: testUserId,
        circuitBreaker: false, // Inactive
      });

      const result = await aiFundsService.rebalance(testUserId, {
        asset: 'NVDA',
        amountUsd: 50000.0,
      });
      expect(result.success).toBe(true);
      expect(result.status).toBe('EXECUTED');
      expect(result.targetAsset).toBe('NVDA');
    });
  });
});
