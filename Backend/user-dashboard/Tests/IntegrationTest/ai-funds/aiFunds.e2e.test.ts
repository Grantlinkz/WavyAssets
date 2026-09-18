import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('E2E Integration — AI Systematic Funds API (/api/v1/ai-funds)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const testUser = {
    id: 'usr-ai-e2e-001',
    email: 'quant@wavyassets.com',
    fullName: 'David Sterling',
    tier: 'INSTITUTIONAL',
    kycTier: 'TIER_3',
    isCorporate: true,
    isActive: true,
  };

  const mockPrisma = {
    user: { findUnique: vi.fn() },
    session: { findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn() },
    cryptoHolding: { findMany: vi.fn().mockResolvedValue([]) },
    stockPosition: { findMany: vi.fn().mockResolvedValue([]) },
    stockOrder: { findMany: vi.fn().mockResolvedValue([]) },
    aiFundPosition: {
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    aiRationaleLog: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    realEstateShare: { findMany: vi.fn().mockResolvedValue([]) },
    carShare: { findMany: vi.fn().mockResolvedValue([]) },
    ledgerAccount: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'acc-created', ...args?.data })),
      update: vi.fn().mockImplementation((args) => Promise.resolve({ id: args?.where?.id, ...args?.data })),
    },
    ledgerTransaction: {
      create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'tx-created', ...args?.data })),
    },
    ledgerEntry: {
      create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'entry-created', ...args?.data })),
    },
    $transaction: vi.fn((cb) => cb(mockPrisma)),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    jwtService = moduleRef.get<JwtService>(JwtService);
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

    mockPrisma.user.findUnique.mockResolvedValue(testUser);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/ai-funds/metrics', () => {
    it('returns 401 Unauthorized without bearer token', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/ai-funds/metrics');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns live quant metrics and benchmark telemetry', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-ai-001',
        userId: testUser.id,
        strategyTier: 'balanced',
        allocatedUsd: 2500000.0,
        unrealizedAlpha: 142850.0,
        circuitBreaker: false,
        claimedYield: 34200.0,
        pendingYield: 1845.5,
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/ai-funds/metrics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.strategyTier).toBe('balanced');
      expect(res.body.data.sharpeRatio).toBe(3.12);
      expect(res.body.data.maxDrawdownPct).toBe(-4.2);
      expect(res.body.data.benchmark.sp500AnnualReturnPct).toBe(12.4);
    });
  });

  describe('POST /api/v1/ai-funds/risk-tier', () => {
    it('rejects invalid strategy tier with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ai-funds/risk-tier')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ strategyTier: 'ultra-degenerate' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('successfully calibrates strategy tier to preservation', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-ai-001',
        userId: testUser.id,
        strategyTier: 'balanced',
      });
      mockPrisma.aiFundPosition.update.mockResolvedValue({
        id: 'pos-ai-001',
        strategyTier: 'preservation',
        updatedAt: new Date('2026-09-16T04:30:00.000Z'),
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/ai-funds/risk-tier')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ strategyTier: 'preservation' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.strategyTier).toBe('preservation');
    });
  });

  describe('GET /api/v1/ai-funds/rationale-feed', () => {
    it('returns immutable algorithmic rationale audit logs', async () => {
      mockPrisma.aiRationaleLog.findMany.mockResolvedValue([
        {
          id: 'log-001',
          strategy: 'Cross-Venue Statistical Arbitrage',
          actionType: 'ARBITRAGE',
          asset: 'BTC/USD',
          rationale: 'Identified 18bps spread dislocation with depth.',
          slippageBps: 1.2,
          confidence: 0.96,
          createdAt: new Date('2026-09-16T04:15:00.000Z'),
        },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/ai-funds/rationale-feed?limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].actionType).toBe('ARBITRAGE');
    });
  });

  describe('GET & POST /api/v1/ai-funds/compute-yield & claim-yield', () => {
    it('returns H100 cluster status and user yield', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-ai-001',
        userId: testUser.id,
        pendingYield: 1845.5,
        claimedYield: 34200.0,
        updatedAt: new Date('2026-09-16T04:00:00.000Z'),
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/ai-funds/compute-yield')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.clusterTelemetry.accelerator).toContain('H100');
      expect(res.body.data.userYield.pendingYieldUsd).toBe(1845.5);
    });

    it('claims pending compute yield via double-entry transaction', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-ai-001',
        userId: testUser.id,
        pendingYield: 1845.5,
        claimedYield: 34200.0,
      });
      mockPrisma.aiFundPosition.update.mockResolvedValue({});
      mockPrisma.ledgerAccount.findUnique.mockResolvedValue({
        id: 'acc-cash',
        userId: testUser.id,
        accountType: 'AVAILABLE_CASH',
        currency: 'USD',
        balance: 100000.0,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/ai-funds/claim-yield')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.claimedAmountUsd).toBe(1845.5);
      expect(res.body.data.walletBalanceUpdated).toBe(true);
    });
  });

  describe('Circuit Breaker & Rebalance Protection', () => {
    it('toggles emergency circuit breaker', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-ai-001',
        userId: testUser.id,
        circuitBreaker: false,
      });
      mockPrisma.aiFundPosition.update.mockResolvedValue({
        id: 'pos-ai-001',
        circuitBreaker: true,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/ai-funds/circuit-breaker')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ circuitBreaker: true, reason: 'Extreme market volatility spike' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.circuitBreakerActive).toBe(true);
    });

    it('rebalance endpoint returns 403 ERR_CIRCUIT_BREAKER_ACTIVE when circuit breaker is tripped', async () => {
      mockPrisma.aiFundPosition.findFirst.mockResolvedValue({
        id: 'pos-ai-001',
        userId: testUser.id,
        circuitBreaker: true, // Active
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/ai-funds/rebalance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ asset: 'BTC', amountUsd: 50000 });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('ERR_CIRCUIT_BREAKER_ACTIVE');
    });
  });
});
