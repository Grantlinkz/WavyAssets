import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { CryptoUtils } from '../../../src/common/utils/crypto.utils';
import * as argon2 from 'argon2';

describe('E2E Integration — VIP & Metal Membership Cards API (/api/v1/vip-cards)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const testUser = {
    id: 'usr-vip-e2e-001',
    email: 'vip.investor@wavyassets.com',
    fullName: 'Lady Genevieve de Zurich',
    tier: 'INSTITUTIONAL',
    kycTier: 'TIER_3',
    isCorporate: true,
    isActive: true,
  };

  const testKeyHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  const mockPrisma = {
    user: { findUnique: vi.fn() },
    session: { findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn() },
    cryptoHolding: { findMany: vi.fn().mockResolvedValue([]) },
    stockPosition: { findMany: vi.fn().mockResolvedValue([]) },
    stockOrder: { findMany: vi.fn().mockResolvedValue([]) },
    aiFundPosition: { findMany: vi.fn().mockResolvedValue([]) },
    realEstateShare: { findMany: vi.fn().mockResolvedValue([]) },
    exoticCar: { findMany: vi.fn().mockResolvedValue([]) },
    carShare: { findMany: vi.fn().mockResolvedValue([]) },
    ledgerAccount: { findMany: vi.fn().mockResolvedValue([]) },
    webAuthnCredential: { count: vi.fn().mockResolvedValue(1) },
    vipCard: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: 'audit-001' }),
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
    if (app) await app.close();
  });

  describe('GET /api/v1/vip-cards/status', () => {
    it('returns 401 Unauthorized without bearer token', async () => {
      await request(app.getHttpServer()).get('/api/v1/vip-cards/status').expect(401);
    });

    it('returns card details, masked PAN, and tier progression with valid bearer token', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValue({
        id: 'card-black-001',
        userId: testUser.id,
        cardNumberLast4: '8842',
        cardType: 'PHYSICAL',
        tier: 'BLACK',
        isFrozen: false,
        dailySpendLimit: 250000.0,
        pinEncrypted: 'mock-pin',
        shippingStatus: 'DELIVERED',
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/vip-cards/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tier).toBe('BLACK');
      expect(response.body.data.cardNumberMasked).toContain('8842');
      expect(response.body.data.dailySpendLimit).toBe(250000.0);
    });
  });

  describe('PATCH /api/v1/vip-cards/controls', () => {
    it('updates card freeze status and spend limits', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValue({
        id: 'card-black-001',
        userId: testUser.id,
        tier: 'BLACK',
        isFrozen: false,
        dailySpendLimit: 250000.0,
      });

      mockPrisma.vipCard.update.mockResolvedValue({
        id: 'card-black-001',
        isFrozen: true,
        cardType: 'PHYSICAL',
        dailySpendLimit: 300000.0,
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .patch('/api/v1/vip-cards/controls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          isFrozen: true,
          dailySpendLimit: 300000.0,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isFrozen).toBe(true);
      expect(response.body.data.dailySpendLimit).toBe(300000.0);
    });
  });

  describe('POST /api/v1/vip-cards/reveal-sensitive', () => {
    it('reveals decrypted PIN and dynamic 60s CVV upon valid passphrase', async () => {
      const pin = '9912';
      const pinEncrypted = CryptoUtils.encryptAes256Gcm(pin, testKeyHex);
      const passphraseHash = await argon2.hash('InstitutionalGlobal2026!');

      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUser.id,
        passphraseHash,
      });

      mockPrisma.vipCard.findUnique.mockResolvedValue({
        id: 'card-black-001',
        userId: testUser.id,
        pinEncrypted,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/vip-cards/reveal-sensitive')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          passphrase: 'InstitutionalGlobal2026!',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pin).toBe('9912');
      expect(response.body.data.cvv).toMatch(/^\d{3}$/);
      expect(response.body.data.timeRemainingSeconds).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/vip-cards/privileges & shipping-tracker', () => {
    it('returns fee schedule and courier tracking information', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValue({
        userId: testUser.id,
        tier: 'BLACK',
        shippingStatus: 'DELIVERED',
      });

      const privResponse = await request(app.getHttpServer())
        .get('/api/v1/vip-cards/privileges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(privResponse.body.success).toBe(true);
      expect(privResponse.body.data.makerFeePct).toBe(0.0);

      const trackResponse = await request(app.getHttpServer())
        .get('/api/v1/vip-cards/shipping-tracker')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(trackResponse.body.success).toBe(true);
      expect(trackResponse.body.data.status).toBe('DELIVERED');
    });
  });

  describe('POST /api/v1/vip-cards/concierge', () => {
    it('creates and dispatches a concierge request ticket', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/vip-cards/concierge')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'Geneva Private Suite Access',
          category: 'TRAVEL',
          urgency: 'PRIORITY',
          message: 'Booking terminal VIP suite for flight LX18 arrival on Friday.',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticketId).toMatch(/^CCG-/);
      expect(response.body.data.assignedOfficer).toContain('Geneva');
    });
  });
});
