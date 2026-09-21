import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CryptoService } from '../../../src/modules/crypto/crypto.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CryptoService — Investment, Gas Telemetry & Staking Compounding', () => {
  let cryptoService: CryptoService;
  let mockPrisma: {
    user: { findUnique: ReturnType<typeof vi.fn> };
    cryptoHolding: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    dcaSchedule: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  const testUserId = 'usr-institutional-001';

  beforeEach(() => {
    mockPrisma = {
      user: { findUnique: vi.fn() },
      cryptoHolding: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      dcaSchedule: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    cryptoService = new CryptoService(mockPrisma as unknown as PrismaService);
  });

  describe('getHoldings', () => {
    it('aggregates live holdings across custody tiers and computes P&L', async () => {
      mockPrisma.cryptoHolding.findMany.mockResolvedValue([
        {
          id: 'h-btc',
          symbol: 'BTC',
          custodyType: 'Global_VAULT',
          quantity: 2.0,
          avgBuyPrice: 50000.0,
          stakedAmount: 0.0,
          pendingReward: 0.0,
          apy: 0.0,
          updatedAt: new Date('2026-09-15T12:00:00Z'),
        },
        {
          id: 'h-eth',
          symbol: 'ETH',
          custodyType: 'STAKED',
          quantity: 10.0,
          avgBuyPrice: 3000.0,
          stakedAmount: 10.0,
          pendingReward: 0.5,
          apy: 4.5,
          updatedAt: new Date('2026-09-15T12:00:00Z'),
        },
      ]);

      const res = await cryptoService.getHoldings(testUserId);

      expect(res.holdings).toHaveLength(2);

      const btc = res.holdings.find((h) => h.symbol === 'BTC');
      expect(btc).toBeDefined();
      expect(btc?.currentPrice).toBe(65420.0);
      expect(btc?.currentValuation).toBe(130840.0);
      expect(btc?.unrealizedPnl).toBe(30840.0); // 130840 - 100000
      expect(btc?.unrealizedPnlPct).toBe(30.84);

      expect(res.summary.totalCryptoUsd).toBeGreaterThan(0);
      expect(res.summary.totalStakedUsd).toBeGreaterThan(0);
    });
  });

  describe('getGasPreview', () => {
    it('calculates EIP-1559 gas fee estimation for standard Ethereum transfer', () => {
      const gas = cryptoService.getGasPreview('ethereum', 'TRANSFER');

      expect(gas.network).toBe('ethereum');
      expect(gas.baseFeeGwei).toBe(18.5);
      expect(gas.priorityFeeGwei).toBe(2.0);
      expect(gas.maxFeeGwei).toBe(20.5);
      expect(gas.gasLimit).toBe(21000);
      expect(gas.estimatedCostUsd).toBeGreaterThan(0);
    });

    it('calculates lower gas estimation for Arbitrum L2', () => {
      const gas = cryptoService.getGasPreview('arbitrum', 'TRANSFER');

      expect(gas.network).toBe('arbitrum');
      expect(gas.baseFeeGwei).toBe(0.1);
      expect(gas.gasLimit).toBe(40000);
    });
  });

  describe('createDcaSchedule & toggleDcaSchedule', () => {
    it('creates a weekly recurring DCA purchase schedule', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: testUserId });
      mockPrisma.dcaSchedule.create.mockResolvedValue({
        id: 'dca-001',
        symbol: 'BTC',
        amountUsd: 500,
        frequency: 'WEEKLY',
        isActive: true,
        nextRunAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      });

      const res = await cryptoService.createDcaSchedule(testUserId, {
        symbol: 'BTC',
        amountUsd: 500,
        frequency: 'WEEKLY',
      });

      expect(res.success).toBe(true);
      expect(res.schedule.symbol).toBe('BTC');
      expect(res.schedule.frequency).toBe('WEEKLY');
      expect(res.schedule.isActive).toBe(true);
    });

    it('toggles DCA schedule status from active to paused', async () => {
      mockPrisma.dcaSchedule.findUnique.mockResolvedValue({
        id: 'dca-001',
        userId: testUserId,
        symbol: 'BTC',
        isActive: true,
      });
      mockPrisma.dcaSchedule.update.mockResolvedValue({
        id: 'dca-001',
        symbol: 'BTC',
        isActive: false,
      });

      const res = await cryptoService.toggleDcaSchedule(testUserId, 'dca-001');

      expect(res.isActive).toBe(false);
      expect(res.message).toContain('paused');
    });
  });

  describe('compoundStaking', () => {
    it('compounds pending rewards into staked principal and resets rewards to zero', async () => {
      mockPrisma.cryptoHolding.findFirst.mockResolvedValue({
        id: 'h-eth-staked',
        userId: testUserId,
        symbol: 'ETH',
        custodyType: 'STAKED',
        quantity: 10.0,
        stakedAmount: 10.0,
        pendingReward: 0.65,
      });

      mockPrisma.cryptoHolding.update.mockResolvedValue({
        id: 'h-eth-staked',
        symbol: 'ETH',
        stakedAmount: 10.65,
        quantity: 10.65,
        pendingReward: 0.0,
      });

      const res = await cryptoService.compoundStaking(testUserId, { symbol: 'ETH' });

      expect(res.success).toBe(true);
      expect(res.compoundedAmount).toBe(0.65);
      expect(res.newStakedPrincipal).toBe(10.65);
      expect(res.pendingReward).toBe(0.0);
    });

    it('throws NotFoundException if no staked position exists for symbol', async () => {
      mockPrisma.cryptoHolding.findFirst.mockResolvedValue(null);

      await expect(
        cryptoService.compoundStaking(testUserId, { symbol: 'SOL' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportTaxLots', () => {
    it('generates properly formatted CSV string with tax lot records', async () => {
      mockPrisma.cryptoHolding.findMany.mockResolvedValue([
        {
          symbol: 'BTC',
          custodyType: 'Global_VAULT',
          quantity: 1.5,
          avgBuyPrice: 60000,
          updatedAt: new Date('2026-09-10T00:00:00Z'),
        },
      ]);

      const csv = await cryptoService.exportTaxLots(testUserId, 'FIFO');

      expect(csv).toContain('Timestamp,Asset,CustodyType,Quantity,CostBasisUSD');
      expect(csv).toContain('BTC,Global_VAULT,1.5,90000.00');
      expect(csv).toContain('FIFO');
    });
  });
});
