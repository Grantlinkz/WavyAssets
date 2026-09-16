import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { DashboardService } from '../../../src/modules/dashboard/dashboard.service';
import { QuarantineTimeLockException, LedgerImbalanceException } from '../../../src/common/exceptions';

describe('E2E Integration — Two-Tier Error Handling & Zero-Leakage Shield', () => {
  let app: INestApplication;
  let dashboardService: DashboardService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: { findUnique: vi.fn() },
    session: { findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
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

    dashboardService = moduleFixture.get<DashboardService>(DashboardService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('RFC 7807 Standardized Error Envelopes', () => {
    it('returns RFC 7807 envelope with ERR_NOT_FOUND on non-existent endpoints', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/non-existent-route')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(404);
      expect(res.body.errorCode).toBe('ERR_NOT_FOUND');
      expect(res.body.correlationId).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.path).toBe('/api/v1/non-existent-route');
    });

    it('returns RFC 7807 envelope with correlationId on DTO validation failures', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/exchange-ticket')
        .send({ unknownField: 'forbidden' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(400);
      expect(res.body.errorCode).toBe('ERR_BAD_REQUEST');
      expect(res.body.correlationId).toBeDefined();
    });

    it('translates QuarantineTimeLockException into HTTP 403 with ERR_DESTINATION_QUARANTINED', async () => {
      const unlockDate = new Date(Date.now() + 48 * 3600 * 1000);
      vi.spyOn(dashboardService, 'getActionRail').mockRejectedValueOnce(
        new QuarantineTimeLockException('0x1234567890abcdef', unlockDate),
      );

      const token = await jwtService.signAsync(
        {
          id: 'usr-test-err',
          email: 'test@wavyassets.com',
          tier: 'INSTITUTIONAL',
          kycTier: 'TIER_3',
          isCorporate: true,
        },
        { issuer: 'wavyassets.com', audience: 'wavyassets-client' },
      );

      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/action-rail')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(403);
      expect(res.body.errorCode).toBe('ERR_DESTINATION_QUARANTINED');
      expect(res.body.correlationId).toBeDefined();
      expect(res.body.message).toContain('0x1234567890abcdef');
    });

    it('translates LedgerImbalanceException into HTTP 422 with ERR_LEDGER_IMBALANCE', async () => {
      vi.spyOn(dashboardService, 'getCommandBarData').mockRejectedValueOnce(
        new LedgerImbalanceException('Ledger imbalance detected', 5.0),
      );

      const token = await jwtService.signAsync(
        {
          id: 'usr-test-err',
          email: 'test@wavyassets.com',
          tier: 'INSTITUTIONAL',
          kycTier: 'TIER_3',
          isCorporate: true,
        },
        { issuer: 'wavyassets.com', audience: 'wavyassets-client' },
      );

      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/command-bar')
        .set('Authorization', `Bearer ${token}`)
        .expect(422);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.errorCode).toBe('ERR_LEDGER_IMBALANCE');
      expect(res.body.correlationId).toBeDefined();
    });
  });

  describe('Zero Internal Diagnostic Leakage Shield', () => {
    it('redacts internal error messages, stack traces, and database schemas on 500 errors', async () => {
      vi.spyOn(dashboardService, 'getCommandBarData').mockRejectedValueOnce(
        new Error('FATAL: Database connection failed: postgres://admin:secret@db.internal:5432/core at Table ledger_entries line 42'),
      );

      const token = await jwtService.signAsync(
        {
          id: 'usr-test-err',
          email: 'test@wavyassets.com',
          tier: 'INSTITUTIONAL',
          kycTier: 'TIER_3',
          isCorporate: true,
        },
        { issuer: 'wavyassets.com', audience: 'wavyassets-client' },
      );

      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/command-bar')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(500);
      expect(res.body.errorCode).toBe('ERR_INTERNAL_SERVER');
      expect(res.body.correlationId).toBeDefined();

      // Ensure zero leakage of secret connection string, internal paths, or stack traces
      expect(res.body.message).toBe(
        'An unexpected error occurred while processing your request. Please quote the reference ID to support.',
      );
      expect(JSON.stringify(res.body)).not.toContain('postgres://');
      expect(JSON.stringify(res.body)).not.toContain('db.internal');
      expect(JSON.stringify(res.body)).not.toContain('line 42');
      expect(JSON.stringify(res.body)).not.toContain('stack');
      expect(res.body.details).toBeNull();
    });
  });
});
