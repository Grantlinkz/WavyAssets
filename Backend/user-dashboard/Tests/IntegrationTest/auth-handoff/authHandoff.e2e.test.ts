import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { CryptoUtils } from '../../../src/common/utils/crypto.utils';

describe('E2E Integration — Auth Handoff & Session Lifecycle', () => {
  let app: INestApplication;
  const handoffSecret = process.env.HANDOFF_TICKET_SECRET || 'test-handoff-secret-key-2026';
  const rawTicket = 'sovereign-ticket-integration-e2e-12345';
  const computedHash = CryptoUtils.hashHmacSha256(rawTicket, handoffSecret);

  const mockUser = {
    id: 'usr-e2e-001',
    email: 'executive@wavyassets.com',
    fullName: 'Alexander Wright',
    tier: 'INSTITUTIONAL',
    kycTier: 'TIER_3',
    isCorporate: true,
    isActive: true,
  };

  const mockSession = {
    id: 'sess-e2e-001',
    userId: mockUser.id,
    handoffTicketHash: computedHash,
    refreshTokenHash: 'initial-refresh-hash',
    expiresAt: new Date(Date.now() + 60000),
    user: mockUser,
  };

  const mockPrisma = {
    session: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue(mockUser),
    },
    cryptoHolding: { findMany: vi.fn().mockResolvedValue([]) },
    stockPosition: { findMany: vi.fn().mockResolvedValue([]) },
    aiFundPosition: { findMany: vi.fn().mockResolvedValue([]) },
    realEstateShare: { findMany: vi.fn().mockResolvedValue([]) },
    carShare: { findMany: vi.fn().mockResolvedValue([]) },
    ledgerAccount: { findMany: vi.fn().mockResolvedValue([]) },
    whitelistDestination: { findMany: vi.fn().mockResolvedValue([]) },
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/exchange-ticket', () => {
    it('exchanges valid ticket, issues JWT in response envelope, and sets HttpOnly cookie', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(mockSession);
      mockPrisma.session.updateMany.mockResolvedValue({ count: 1 });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/exchange-ticket')
        .send({ ticket: rawTicket })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('executive@wavyassets.com');
      expect(res.body.data.user.tier).toBe('INSTITUTIONAL');

      // Verify HttpOnly cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('wavy_refresh_token=');
      expect(cookies[0]).toContain('HttpOnly');
      expect(cookies[0]).toContain('SameSite=Lax');
    });

    it('rejects invalid or already burned ticket with 401 and ERR_INVALID_HANDOFF_TICKET', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/exchange-ticket')
        .send({ ticket: 'burned-or-tampered-ticket' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(401);
      expect(res.body.errorCode).toBe('ERR_INVALID_HANDOFF_TICKET');
      expect(res.body.correlationId).toBeDefined();
    });

    it('rejects malformed payload missing ticket with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/exchange-ticket')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(400);
    });
  });

  describe('Authenticated Protected Route Access', () => {
    it('grants access to protected dashboard endpoint with exchanged access token', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(mockSession);
      mockPrisma.session.updateMany.mockResolvedValue({ count: 1 });

      // Step 1: Exchange ticket
      const exchangeRes = await request(app.getHttpServer())
        .post('/api/v1/auth/exchange-ticket')
        .send({ ticket: rawTicket });

      const token = exchangeRes.body.data.accessToken;

      // Step 2: Access protected command-bar endpoint
      const dashboardRes = await request(app.getHttpServer())
        .get('/api/v1/dashboard/command-bar')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(dashboardRes.body.success).toBe(true);
      expect(dashboardRes.body.data.consolidatedNetWorth).toBeDefined();
      expect(dashboardRes.body.data.allocationMatrix).toBeDefined();
    });

    it('denies access to protected endpoint when token is missing', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/command-bar')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(401);
      expect(res.body.errorCode).toBe('ERR_UNAUTHORIZED');
    });
  });
});
