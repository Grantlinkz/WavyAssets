import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('E2E Integration — Stocks, Pre-IPO & Order Matching API', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const testUser = {
    id: 'usr-stocks-e2e-001',
    email: 'trader@wavyassets.com',
    fullName: 'Sophia Bennett',
    tier: 'INSTITUTIONAL',
    kycTier: 'TIER_3',
    isCorporate: true,
    isActive: true,
  };

  const mockPrisma = {
    user: { findUnique: vi.fn() },
    session: { findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
    cryptoHolding: { findMany: vi.fn().mockResolvedValue([]) },
    stockPosition: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    stockOrder: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    aiFundPosition: { findMany: vi.fn().mockResolvedValue([]) },
    realEstateShare: { findMany: vi.fn().mockResolvedValue([]) },
    carShare: { findMany: vi.fn().mockResolvedValue([]) },
    whitelistDestination: { findUnique: vi.fn() },
    ledgerAccount: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'acc-created', ...args?.data })),
      update: vi.fn().mockImplementation((args) => Promise.resolve({ id: args?.where?.id, ...args?.data })),
    },
    ledgerTransaction: {
      create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'tx-created', referenceId: args?.data?.referenceId, ...args?.data })),
    },
    ledgerEntry: {
      create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'entry-created', ...args?.data })),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    $transaction: vi.fn((cb) => cb(mockPrisma)),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    authToken = await jwtService.signAsync(
      {
        id: testUser.id,
        email: testUser.email,
        fullName: testUser.fullName,
        tier: testUser.tier,
        kycTier: testUser.kycTier,
        isCorporate: testUser.isCorporate,
      },
      { issuer: 'wavyassets.com', audience: 'wavyassets-client' },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/stocks/order-book', () => {
    it('returns Level-2 depth with bids, asks, spread, and VWAP', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/stocks/order-book?symbol=NVDA')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.symbol).toBe('NVDA');
      expect(data.bids).toHaveLength(10);
      expect(data.asks).toHaveLength(10);
      expect(data.spread).toBeGreaterThan(0);
      expect(data.vwap).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/stocks/positions', () => {
    it('returns active positions with DMA metrics', async () => {
      mockPrisma.stockPosition.findMany.mockResolvedValue([
        {
          id: 'pos-nvda-1',
          userId: testUser.id,
          symbol: 'NVDA',
          exchange: 'NASDAQ',
          shares: 500,
          avgCostBasis: 110.0,
          dripEnabled: true,
          updatedAt: new Date(),
        },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/stocks/positions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.positions).toHaveLength(1);
      expect(data.positions[0].symbol).toBe('NVDA');
      expect(data.positions[0].dripEnabled).toBe(true);
      expect(data.totalPortfolioValueUsd).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/stocks/orders', () => {
    it('places a market BUY order with buying power check and ledger reservation', async () => {
      mockPrisma.ledgerAccount.findUnique
        .mockResolvedValueOnce({ id: 'acc-cash', balance: '100000.00' })
        .mockResolvedValueOnce({ id: 'acc-invested', balance: '0.00' });

      mockPrisma.stockPosition.findFirst.mockResolvedValue(null);
      mockPrisma.stockPosition.create.mockResolvedValue({ id: 'pos-new' });
      mockPrisma.stockOrder.create.mockResolvedValue({
        id: 'ord-buy-001',
        symbol: 'NVDA',
        side: 'BUY',
        orderType: 'MARKET',
        shares: 50,
        status: 'FILLED',
        createdAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/stocks/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          symbol: 'NVDA',
          side: 'BUY',
          orderType: 'MARKET',
          shares: 50,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.order.symbol).toBe('NVDA');
      expect(res.body.data.order.shares).toBe(50);
      expect(res.body.data.order.status).toBe('FILLED');
    });
  });

  describe('DELETE /api/v1/stocks/orders/:id', () => {
    it('cancels a pending order', async () => {
      mockPrisma.stockOrder.findUnique.mockResolvedValue({
        id: 'ord-pending-1',
        userId: testUser.id,
        symbol: 'MSFT',
        status: 'PENDING',
        shares: 10,
      });

      mockPrisma.stockOrder.update.mockResolvedValue({
        id: 'ord-pending-1',
        status: 'CANCELLED',
      });

      const res = await request(app.getHttpServer())
        .delete('/api/v1/stocks/orders/ord-pending-1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('returns 404 and does not update when attempting to cancel another user order', async () => {
      mockPrisma.stockOrder.findUnique.mockResolvedValue({
        id: 'ord-other-user',
        userId: 'different-user-id',
        symbol: 'MSFT',
        status: 'PENDING',
        shares: 10,
      });

      const res = await request(app.getHttpServer())
        .delete('/api/v1/stocks/orders/ord-other-user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('ERR_NOT_FOUND');
      expect(mockPrisma.stockOrder.update).not.toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ord-other-user' } }),
      );
    });
  });

  describe('PATCH /api/v1/stocks/positions/:id/drip', () => {
    it('toggles DRIP on position', async () => {
      mockPrisma.stockPosition.findUnique.mockResolvedValue({
        id: 'pos-drip-1',
        userId: testUser.id,
        symbol: 'AAPL',
        dripEnabled: false,
      });

      mockPrisma.stockPosition.update.mockResolvedValue({
        id: 'pos-drip-1',
        symbol: 'AAPL',
        dripEnabled: true,
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/stocks/positions/pos-drip-1/drip')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ enabled: true })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.dripEnabled).toBe(true);
    });
  });

  describe('GET /api/v1/stocks/corporate-actions', () => {
    it('returns corporate actions feed', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/stocks/corporate-actions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
