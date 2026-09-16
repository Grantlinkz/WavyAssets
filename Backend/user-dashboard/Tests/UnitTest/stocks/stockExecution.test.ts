import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StocksService } from '../../../src/modules/stocks/stocks.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { WalletService } from '../../../src/modules/wallet/wallet.service';
import {
  InsufficientAvailableBalanceException,
} from '../../../src/common/exceptions';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('StocksService — Order Book, DMA Execution & Balance Reservation', () => {
  let stocksService: StocksService;
  let mockPrisma: {
    stockPosition: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    stockOrder: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let mockWalletService: {
    getOrCreateAccount: ReturnType<typeof vi.fn>;
    recordLedgerTransaction: ReturnType<typeof vi.fn>;
  };

  const testUserId = 'usr-institutional-001';

  beforeEach(() => {
    mockPrisma = {
      stockPosition: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      stockOrder: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    mockWalletService = {
      getOrCreateAccount: vi.fn(),
      recordLedgerTransaction: vi.fn().mockResolvedValue({ id: 'tx-stock' }),
    };

    stocksService = new StocksService(
      mockPrisma as unknown as PrismaService,
      mockWalletService as unknown as WalletService,
    );
  });

  describe('getOrderBook', () => {
    it('generates simulated Level-2 depth with 10 bids, 10 asks, positive spread, and VWAP', () => {
      const book = stocksService.getOrderBook('NVDA');

      expect(book.symbol).toBe('NVDA');
      expect(book.bids).toHaveLength(10);
      expect(book.asks).toHaveLength(10);
      expect(book.spread).toBeGreaterThan(0);
      expect(book.vwap).toBeGreaterThan(0);

      // Verify bids are strictly descending
      for (let i = 0; i < book.bids.length - 1; i++) {
        expect(book.bids[i][0]).toBeGreaterThan(book.bids[i + 1][0]);
      }

      // Verify asks are strictly ascending
      for (let i = 0; i < book.asks.length - 1; i++) {
        expect(book.asks[i][0]).toBeLessThan(book.asks[i + 1][0]);
      }
    });
  });

  describe('placeOrder', () => {
    it('executes a BUY order, checking buying power and reserving balance via ledger', async () => {
      mockWalletService.getOrCreateAccount
        .mockResolvedValueOnce({ id: 'acc-cash', balance: '50000.00' }) // Sufficient cash
        .mockResolvedValueOnce({ id: 'acc-invested', balance: '0.00' });

      mockPrisma.stockPosition.findFirst.mockResolvedValue(null); // New position
      mockPrisma.stockPosition.create.mockResolvedValue({ id: 'pos-nvda' });
      mockPrisma.stockOrder.create.mockResolvedValue({
        id: 'ord-001',
        symbol: 'NVDA',
        side: 'BUY',
        orderType: 'MARKET',
        shares: 100,
        status: 'FILLED',
        createdAt: new Date(),
      });

      const res = await stocksService.placeOrder(testUserId, {
        symbol: 'NVDA',
        side: 'BUY',
        orderType: 'MARKET',
        shares: 100,
      });

      expect(res.success).toBe(true);
      expect(res.order.symbol).toBe('NVDA');
      expect(res.order.shares).toBe(100);
      expect(mockWalletService.recordLedgerTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'TRADE',
          entries: expect.arrayContaining([
            expect.objectContaining({ accountId: 'acc-cash', amount: expect.any(Number) }),
            expect.objectContaining({ accountId: 'acc-invested', amount: expect.any(Number) }),
          ]),
        }),
      );
    });

    it('rejects BUY order with InsufficientAvailableBalanceException if buying power is exceeded', async () => {
      mockWalletService.getOrCreateAccount
        .mockResolvedValueOnce({ id: 'acc-cash', balance: '500.00' }) // Only $500 available
        .mockResolvedValueOnce({ id: 'acc-invested', balance: '0.00' });

      // 100 shares of NVDA @ ~$128 = ~$12,840
      await expect(
        stocksService.placeOrder(testUserId, {
          symbol: 'NVDA',
          side: 'BUY',
          orderType: 'MARKET',
          shares: 100,
        }),
      ).rejects.toThrow(InsufficientAvailableBalanceException);

      expect(mockWalletService.recordLedgerTransaction).not.toHaveBeenCalled();
    });

    it('rejects SELL order if user has insufficient shares', async () => {
      mockPrisma.stockPosition.findFirst.mockResolvedValue({
        id: 'pos-msft',
        symbol: 'MSFT',
        shares: 20, // Owns only 20 shares
      });

      await expect(
        stocksService.placeOrder(testUserId, {
          symbol: 'MSFT',
          side: 'SELL',
          orderType: 'MARKET',
          shares: 50, // Attempts to sell 50
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelOrder', () => {
    it('cancels a PENDING order', async () => {
      mockPrisma.stockOrder.findUnique.mockResolvedValue({
        id: 'ord-pending',
        userId: testUserId,
        symbol: 'AAPL',
        shares: 50,
        status: 'PENDING',
      });
      mockPrisma.stockOrder.update.mockResolvedValue({
        id: 'ord-pending',
        status: 'CANCELLED',
      });

      const res = await stocksService.cancelOrder(testUserId, 'ord-pending');

      expect(res.success).toBe(true);
      expect(res.status).toBe('CANCELLED');
    });

    it('rejects cancellation of an already FILLED order', async () => {
      mockPrisma.stockOrder.findUnique.mockResolvedValue({
        id: 'ord-filled',
        userId: testUserId,
        status: 'FILLED',
      });

      await expect(
        stocksService.cancelOrder(testUserId, 'ord-filled'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if order does not exist', async () => {
      mockPrisma.stockOrder.findUnique.mockResolvedValue(null);

      await expect(
        stocksService.cancelOrder(testUserId, 'ord-none'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleDrip', () => {
    it('updates position dripEnabled flag', async () => {
      mockPrisma.stockPosition.findUnique.mockResolvedValue({
        id: 'pos-01',
        userId: testUserId,
        symbol: 'NVDA',
        dripEnabled: false,
      });
      mockPrisma.stockPosition.update.mockResolvedValue({
        id: 'pos-01',
        symbol: 'NVDA',
        dripEnabled: true,
      });

      const res = await stocksService.toggleDrip(testUserId, 'pos-01', true);

      expect(res.dripEnabled).toBe(true);
    });
  });
});
