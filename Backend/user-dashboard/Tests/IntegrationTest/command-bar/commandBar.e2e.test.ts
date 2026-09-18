import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('E2E Integration — Command Bar Aggregator & Action Rail API', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const testUser = {
    id: 'usr-e2e-cmd-001',
    email: 'fundmanager@wavyassets.com',
    fullName: 'Victoria Sterling',
    tier: 'INSTITUTIONAL',
    kycTier: 'TIER_3',
    isCorporate: true,
    isActive: true,
  };

  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
    },
    cryptoHolding: { findMany: vi.fn() },
    stockPosition: { findMany: vi.fn() },
    aiFundPosition: { findMany: vi.fn() },
    realEstateShare: { findMany: vi.fn() },
    carShare: { findMany: vi.fn() },
    ledgerAccount: { findMany: vi.fn() },
    whitelistDestination: { findMany: vi.fn() },
    session: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
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
      {
        issuer: 'wavyassets.com',
        audience: 'wavyassets-client',
      },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /dashboard/command-bar', () => {
    it('returns full 7-vertical consolidated financial aggregate matching UI data contracts', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(testUser);

      // Populate positions across all 7 asset classes
      mockPrisma.cryptoHolding.findMany.mockResolvedValue([
        { quantity: 10.0, avgBuyPrice: 65000.0 }, // $650,000
      ]);
      mockPrisma.stockPosition.findMany.mockResolvedValue([
        { shares: 1000, avgCostBasis: 150.0 }, // $150,000
      ]);
      mockPrisma.aiFundPosition.findMany.mockResolvedValue([
        { allocatedUsd: 180000.0, unrealizedAlpha: 20000.0 }, // $200,000
      ]);
      mockPrisma.realEstateShare.findMany.mockResolvedValue([
        { tokenCount: 400, property: { tokenPriceUsd: 250.0 } }, // $100,000
      ]);
      mockPrisma.carShare.findMany.mockResolvedValue([
        { sharePct: 20.0, car: { insuredValue: 500000.0 } }, // $100,000
      ]);
      mockPrisma.ledgerAccount.findMany.mockResolvedValue([
        { balance: '100000.00' }, // $100,000
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/command-bar')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.timestamp).toBeDefined();

      const data = res.body.data;
      // Net Worth: 650k + 150k + 200k + 100k + 100k + 100k = $1,300,000
      expect(data.consolidatedNetWorth).toBe(1300000.0);
      expect(data.currency).toBe('USD');

      // Check allocation matrix items and colors
      expect(data.allocationMatrix).toHaveLength(6);
      const colorMap = new Map(data.allocationMatrix.map((a: { id: string; color: string }) => [a.id, a.color]));
      expect(colorMap.get('crypto')).toBe('#E5C158');
      expect(colorMap.get('stocks')).toBe('#53DC98');
      expect(colorMap.get('ai-funds')).toBe('#926F13');
      expect(colorMap.get('real-estate')).toBe('#D4AF37');
      expect(colorMap.get('cars')).toBe('#BA1A1A');
      expect(colorMap.get('wallet')).toBe('#8B9BB4');

      // Check returns breakdown
      expect(data.returns['1D'].percentageChange).toBe(1.26);
      expect(data.returns['1W'].percentageChange).toBe(2.86);
      expect(data.returns['1M'].percentageChange).toBe(7.08);
      expect(data.returns['1Y'].percentageChange).toBe(23.71);
      expect(data.returns.ALL.percentageChange).toBe(57.65);

      // Check KYC status
      expect(data.kycStatus).toEqual({
        tier: 'TIER_3',
        dailyLimit: 'UNLIMITED',
        status: 'VERIFIED',
      });
    });

    it('denies access with expired or invalid Bearer token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/command-bar')
        .set('Authorization', 'Bearer invalid-token-string')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('GET /dashboard/action-rail', () => {
    it('returns operational status, daily limits, and destination time-lock metrics', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...testUser,
        whitelistAddresses: [
          { status: 'QUARANTINE', quarantineUntil: new Date(Date.now() + 86400000) },
        ],
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/action-rail')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.kycTier).toBe('TIER_3');
      expect(data.dailyDepositLimit).toBe('UNLIMITED');
      expect(data.dailyWithdrawalLimit).toBe('UNLIMITED');
      expect(data.quarantinedDestinationsCount).toBe(1);
      expect(data.depositEligible).toBe(true);
      expect(data.requiresHardwareSignature).toBe(true);
    });
  });
});
