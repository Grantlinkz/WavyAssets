import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('E2E Integration — Tokenized Real Estate API (/api/v1/real-estate)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const testUser = {
    id: 'usr-re-e2e-001',
    email: 'realty@wavyassets.com',
    fullName: 'Alexander Von Berg',
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
    aiFundPosition: { findMany: vi.fn().mockResolvedValue([]) },
    realEstateProperty: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
    realEstateShare: {
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
    },
    realEstateOtcOrder: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
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

  describe('GET /api/v1/real-estate/properties', () => {
    it('returns fractional properties catalog with user holdings', async () => {
      mockPrisma.realEstateProperty.findMany.mockResolvedValue([
        {
          id: 'prop-001',
          title: 'Zurich Prime Commercial',
          region: 'SWITZERLAND',
          totalValuation: 45000000.0,
          totalTokens: 100000,
          tokenPriceUsd: 450.0,
          annualizedYield: 8.4,
          occupancyRate: 98.5,
          spvContractUrl: 'https://docs.wavyassets.com/spv/zurich.pdf',
          shares: [{ tokenCount: 4666 }],
        },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/real-estate/properties')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].userHolding.tokenCount).toBe(4666);
    });
  });

  describe('GET /api/v1/real-estate/rental-distributions & occupancy', () => {
    it('returns projected rental yields and monthly distribution schedule', async () => {
      mockPrisma.realEstateProperty.findMany.mockResolvedValue([
        {
          id: 'prop-001',
          title: 'Zurich Prime Commercial',
          region: 'SWITZERLAND',
          totalValuation: 45000000.0,
          totalTokens: 100000,
          tokenPriceUsd: 450.0,
          annualizedYield: 8.4,
          occupancyRate: 98.5,
          spvContractUrl: 'https://docs.wavyassets.com/spv/zurich.pdf',
          shares: [{ tokenCount: 4666 }],
        },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/real-estate/rental-distributions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.distributionCadence).toBe('MONTHLY_FIRST_BUSINESS_DAY');
      expect(res.body.data.projectedAnnualYieldUsd).toBeGreaterThan(0);
    });

    it('returns portfolio tenant occupancy profiles and WAULT', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/real-estate/occupancy')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.waultYears).toBe(6.8);
      expect(res.body.data.portfolioOccupancyPct).toBe(97.4);
    });
  });

  describe('OTC Secondary Market (/api/v1/real-estate/otc-market)', () => {
    it('returns active secondary liquidity order book', async () => {
      mockPrisma.realEstateOtcOrder.findMany.mockResolvedValue([
        {
          id: 'order-re-001',
          propertyId: 'prop-001',
          orderType: 'OFFER',
          tokenAmount: 100,
          pricePerToken: 450.0,
          status: 'OPEN',
          createdAt: new Date('2026-09-16T04:00:00.000Z'),
          property: { title: 'Zurich Prime', tokenPriceUsd: 450.0 },
        },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/real-estate/otc-market')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].orderType).toBe('OFFER');
    });

    it('executes secondary OTC share settlement atomically', async () => {
      mockPrisma.realEstateOtcOrder.findUnique.mockResolvedValue({
        id: 'order-re-001',
        propertyId: 'prop-001',
        orderType: 'OFFER',
        tokenAmount: 50,
        pricePerToken: 450.0,
        status: 'OPEN',
        property: { title: 'Zurich Prime' },
      });
      mockPrisma.ledgerAccount.findUnique.mockResolvedValue({
        id: 'acc-cash',
        userId: testUser.id,
        accountType: 'AVAILABLE_CASH',
        currency: 'USD',
        balance: 100000.0,
      });
      mockPrisma.realEstateShare.findFirst.mockResolvedValue({
        id: 'share-001',
        userId: testUser.id,
        tokenCount: 100,
      });
      mockPrisma.realEstateShare.update.mockResolvedValue({});
      mockPrisma.realEstateOtcOrder.update.mockResolvedValue({
        id: 'order-re-001',
        status: 'FILLED',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/real-estate/otc-market/order-re-001/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('FILLED');
      expect(res.body.data.tokensTransferred).toBe(50);
      expect(res.body.data.totalSettlementUsd).toBe(22500.0);
    });
  });

  describe('Pre-Signed Document Vault (/api/v1/real-estate/documents/:docId)', () => {
    it('generates secure time-limited HMAC download token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/real-estate/documents/spv-zurich-deed-001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.downloadUrl).toContain('vault.wavyassets.com');
      expect(res.body.data.signature).toHaveLength(64);
      expect(res.body.data.mimeType).toBe('application/pdf');
    });
  });
});
