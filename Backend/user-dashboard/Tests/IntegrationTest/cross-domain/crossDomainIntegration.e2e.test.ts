import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { CryptoUtils } from '../../../src/common/utils/crypto.utils';

describe('E2E Integration — Monorepo Cross-Domain Authentication & Multi-Asset Handoff', () => {
  let app: INestApplication;

  const handoffSecret = 'wavy_Global_cross_domain_handoff_ticket_secret_key_2026';
  const rawTicket = 'a9f7d2e4b8c105634827164928374619a9f7d2e4b8c105634827164928374619';
  const ticketHash = CryptoUtils.hashHmacSha256(rawTicket, handoffSecret);

  const testUser = {
    id: 'usr-cross-domain-001',
    email: 'marcus.vance@vance-capital.ch',
    fullName: 'Marcus Vance',
    tier: 'INSTITUTIONAL',
    kycTier: 'TIER_3',
    isCorporate: true,
    isActive: true,
  };

  interface SessionRecord {
    id: string;
    userId: string;
    tokenHash: string;
    handoffTicketHash: string | null;
    refreshTokenHash: string | null;
    ticketExpiresAt: Date | null;
    ipAddress: string;
    userAgent: string;
    expiresAt: Date;
    user: typeof testUser;
  }

  const testSession: SessionRecord = {
    id: 'sess-cross-domain-001',
    userId: testUser.id,
    tokenHash: 'init-token-hash-placeholder',
    handoffTicketHash: ticketHash,
    refreshTokenHash: null,
    ticketExpiresAt: new Date(Date.now() + 60000), // Valid for 60 seconds
    ipAddress: '127.0.0.1',
    userAgent: 'WavyAssets Monorepo Integration Test Runner',
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    user: testUser,
  };

  let sessionState: SessionRecord = { ...testSession };

  const mockPrisma = {
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    isHealthy: vi.fn().mockResolvedValue(true),
    user: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (where.id === testUser.id) return Promise.resolve(testUser);
        return Promise.resolve(null);
      }),
    },
    session: {
      findFirst: vi.fn().mockImplementation(({ where }) => {
        if (where.handoffTicketHash && where.handoffTicketHash === sessionState.handoffTicketHash) {
          return Promise.resolve(sessionState);
        }
        if (where.refreshTokenHash && where.refreshTokenHash === sessionState.refreshTokenHash) {
          return Promise.resolve(sessionState);
        }
        return Promise.resolve(null);
      }),
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (where.id === sessionState.id) return Promise.resolve(sessionState);
        if (where.refreshTokenHash && where.refreshTokenHash === sessionState.refreshTokenHash) {
          return Promise.resolve(sessionState);
        }
        return Promise.resolve(null);
      }),
      updateMany: vi.fn().mockImplementation(({ where, data }) => {
        if (where.id === sessionState.id) {
          sessionState = {
            ...sessionState,
            ...data,
          };
          return Promise.resolve({ count: 1 });
        }
        return Promise.resolve({ count: 0 });
      }),
      update: vi.fn().mockImplementation(({ where, data }) => {
        sessionState = { ...sessionState, ...data };
        return Promise.resolve(sessionState);
      }),
      deleteMany: vi.fn().mockImplementation(() => {
        sessionState = { ...sessionState, refreshTokenHash: 'revoked' };
        return Promise.resolve({ count: 1 });
      }),
    },
    cryptoHolding: { findMany: vi.fn().mockResolvedValue([]) },
    stockPosition: { findMany: vi.fn().mockResolvedValue([]) },
    aiFundPosition: { findMany: vi.fn().mockResolvedValue([]) },
    realEstateShare: { findMany: vi.fn().mockResolvedValue([]) },
    carShare: { findMany: vi.fn().mockResolvedValue([]) },
    ledgerAccount: {
      findMany: vi.fn().mockResolvedValue([
        { accountType: 'AVAILABLE_CASH', balance: 5000000.0 },
        { accountType: 'INVESTED_CAPITAL', balance: 20000000.0 },
      ]),
    },
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

  let accessToken: string;
  let refreshTokenCookie: string;

  it('Step 1: Exchange ephemeral single-use Authentication for JWT tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/exchange-ticket')
      .send({ ticket: rawTicket })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data.user.tier).toBe('INSTITUTIONAL');

    accessToken = response.body.data.accessToken;

    // Verify Set-Cookie header contains HttpOnly refresh token
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const refreshCookie = (cookies as unknown as string[]).find((c: string) => c.startsWith('wavy_refresh_token='));
    expect(refreshCookie).toBeDefined();
    refreshTokenCookie = refreshCookie!.split(';')[0];
  });

  it('Step 2: Prevent replay attacks — re-exchanging burned ticket must fail (HTTP 401)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/exchange-ticket')
      .send({ ticket: rawTicket })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe('ERR_INVALID_HANDOFF_TICKET');
  });

  it('Step 3: Access authenticated Command Bar aggregate with exchanged JWT', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/dashboard/command-bar')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.currency).toBe('USD');
    expect(response.body.data.consolidatedNetWorth).toBeGreaterThanOrEqual(0);
    expect(response.body.data.returns).toBeDefined();
    expect(response.body.data.allocationMatrix).toHaveLength(6);
  });

  it('Step 4: Access double-entry wallet balances with exchanged JWT', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/wallet/balances')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.totalUsd).toBe(25000000.0);
    expect(response.body.data.availableCash[0].amount).toBe(5000000.0);
    expect(response.body.data.investedCapital[0].amount).toBe(20000000.0);
  });

  it('Step 5: Refresh session token using HttpOnly cookie', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', refreshTokenCookie)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    // Update active accessToken
    accessToken = response.body.data.accessToken;

    // Capture rotated Set-Cookie value
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      refreshTokenCookie = Array.isArray(cookies) ? cookies : [cookies];
    }
  });

  it('Step 6: Revoke session on user logout', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', refreshTokenCookie)
      .expect(200);

    expect(response.body.success).toBe(true);

    // Verify revoked refresh cookie returns 401 Unauthorized
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', refreshTokenCookie)
      .expect(401);
  });
});
