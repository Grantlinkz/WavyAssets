import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('E2E Integration — Crypto Holdings, Gas Preview & DCA API', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const testUser = {
    id: 'usr-crypto-e2e-001',
    email: 'crypto.treasury@wavyassets.com',
    fullName: 'Lucas Vance',
    tier: 'INSTITUTIONAL',
    kycTier: 'TIER_3',
    isCorporate: true,
    isActive: true,
  };

  const mockPrisma = {
    user: { findUnique: vi.fn() },
    session: { findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
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
    stockPosition: { findMany: vi.fn().mockResolvedValue([]) },
    aiFundPosition: { findMany: vi.fn().mockResolvedValue([]) },
    realEstateShare: { findMany: vi.fn().mockResolvedValue([]) },
    carShare: { findMany: vi.fn().mockResolvedValue([]) },
    whitelistDestination: { findUnique: vi.fn() },
    ledgerAccount: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    ledgerTransaction: { create: vi.fn() },
    ledgerEntry: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
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

  describe('GET /api/v1/crypto/holdings', () => {
    it('returns multi-custody holdings with valuation and P&L metrics', async () => {
      mockPrisma.cryptoHolding.findMany.mockResolvedValue([
        {
          id: 'h-1',
          userId: testUser.id,
          symbol: 'BTC',
          custodyType: 'SOVEREIGN_VAULT',
          quantity: 5.0,
          avgBuyPrice: 58000.0,
          stakedAmount: 0.0,
          pendingReward: 0.0,
          apy: 0.0,
          updatedAt: new Date(),
        },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/crypto/holdings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.holdings).toHaveLength(1);
      expect(data.holdings[0].symbol).toBe('BTC');
      expect(data.summary.totalCryptoUsd).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/crypto/gas-preview', () => {
    it('returns EIP-1559 gas preview parameters', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/crypto/gas-preview?network=ethereum&actionType=TRANSFER')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.network).toBe('ethereum');
      expect(data.baseFeeGwei).toBeDefined();
      expect(data.estimatedCostUsd).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/crypto/dca-schedules', () => {
    it('creates an automated DCA recurring buy schedule', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(testUser);
      mockPrisma.dcaSchedule.create.mockResolvedValue({
        id: 'dca-sch-1',
        userId: testUser.id,
        symbol: 'ETH',
        amountUsd: 1000,
        frequency: 'MONTHLY',
        isActive: true,
        nextRunAt: new Date(Date.now() + 30 * 86400000),
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/crypto/dca-schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          symbol: 'ETH',
          amountUsd: 1000,
          frequency: 'MONTHLY',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.schedule.symbol).toBe('ETH');
      expect(res.body.data.schedule.amountUsd).toBe(1000);
    });
  });

  describe('PATCH /api/v1/crypto/dca-schedules/:id/toggle', () => {
    it('toggles DCA active status', async () => {
      mockPrisma.dcaSchedule.findUnique.mockResolvedValue({
        id: 'dca-sch-1',
        userId: testUser.id,
        symbol: 'ETH',
        isActive: true,
      });

      mockPrisma.dcaSchedule.update.mockResolvedValue({
        id: 'dca-sch-1',
        symbol: 'ETH',
        isActive: false,
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/crypto/dca-schedules/dca-sch-1/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);
    });
  });

  describe('POST /api/v1/crypto/staking/compound', () => {
    it('compounds accrued staking rewards into staked principal', async () => {
      mockPrisma.cryptoHolding.findFirst.mockResolvedValue({
        id: 'h-staked-sol',
        userId: testUser.id,
        symbol: 'SOL',
        custodyType: 'STAKED',
        quantity: 100.0,
        stakedAmount: 100.0,
        pendingReward: 2.5,
      });

      mockPrisma.cryptoHolding.update.mockResolvedValue({
        id: 'h-staked-sol',
        symbol: 'SOL',
        stakedAmount: 102.5,
        quantity: 102.5,
        pendingReward: 0.0,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/crypto/staking/compound')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symbol: 'SOL' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.compoundedAmount).toBe(2.5);
      expect(res.body.data.newStakedPrincipal).toBe(102.5);
    });
  });

  describe('GET /api/v1/crypto/tax-lot-export', () => {
    it('exports CSV tax lots with attachment headers', async () => {
      mockPrisma.cryptoHolding.findMany.mockResolvedValue([
        {
          symbol: 'BTC',
          custodyType: 'SOVEREIGN_VAULT',
          quantity: 2.0,
          avgBuyPrice: 55000,
          updatedAt: new Date(),
        },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/crypto/tax-lot-export')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Timestamp,Asset,CustodyType,Quantity');
      expect(res.text).toContain('BTC');
    });
  });
});
