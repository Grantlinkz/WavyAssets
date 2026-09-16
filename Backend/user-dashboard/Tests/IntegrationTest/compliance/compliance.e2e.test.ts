import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('E2E Integration — Tiered KYC & Compliance Dossier API (/api/v1/compliance)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const testUser = {
    id: 'usr-compliance-e2e-001',
    email: 'compliance.officer@wavyassets.com',
    fullName: 'Dr. Beatrix von Haller',
    tier: 'INSTITUTIONAL',
    kycTier: 'TIER_2',
    isCorporate: true,
    isActive: true,
  };

  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: { findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn() },
    cryptoHolding: { findMany: vi.fn().mockResolvedValue([]) },
    stockPosition: { findMany: vi.fn().mockResolvedValue([]) },
    stockOrder: { findMany: vi.fn().mockResolvedValue([]) },
    aiFundPosition: { findMany: vi.fn().mockResolvedValue([]) },
    realEstateShare: { findMany: vi.fn().mockResolvedValue([]) },
    exoticCar: { findMany: vi.fn().mockResolvedValue([]) },
    carShare: { findMany: vi.fn().mockResolvedValue([]) },
    ledgerAccount: { findMany: vi.fn().mockResolvedValue([]) },
    kycDocument: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: 'audit-001' }),
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'log-001',
          action: 'COMPLIANCE_DOSSIER_UPLOADED',
          createdAt: new Date(),
          metadata: JSON.stringify({ docType: 'PASSPORT' }),
        },
      ]),
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

  describe('GET /api/v1/compliance/status', () => {
    it('returns 401 Unauthorized without bearer token', async () => {
      await request(app.getHttpServer()).get('/api/v1/compliance/status').expect(401);
    });

    it('returns KYC status, limits, and document checklist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUser.id,
        email: testUser.email,
        kycTier: 'TIER_2',
        kycDocuments: [
          { id: 'doc-001', docType: 'PASSPORT', fileUrl: 'https://docs.wavyassets.com/passport.pdf', isVerified: true },
          { id: 'doc-002', docType: 'UTILITY_BILL', fileUrl: 'https://docs.wavyassets.com/bill.pdf', isVerified: true },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/compliance/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.kycTier).toBe('TIER_2');
      expect(response.body.data.limits.dailyLimitUsd).toBe(250000);
      expect(response.body.data.documents.length).toBe(2);
    });
  });

  describe('POST /api/v1/compliance/dossier-upload', () => {
    it('persists uploaded document with verified status', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: testUser.id });
      mockPrisma.kycDocument.create.mockResolvedValue({
        id: 'doc-003',
        userId: testUser.id,
        docType: 'ARTICLES_OF_INC',
        fileUrl: 'https://vault.wavyassets.com/charter.pdf',
        isVerified: true,
        uploadedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/compliance/dossier-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          docType: 'ARTICLES_OF_INC',
          fileUrl: 'https://vault.wavyassets.com/charter.pdf',
          notes: 'Incorporation filings registered in Canton Zurich',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.docType).toBe('ARTICLES_OF_INC');
    });

    it('rejects upload with suspicious malware signature', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: testUser.id });

      const response = await request(app.getHttpServer())
        .post('/api/v1/compliance/dossier-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          docType: 'PASSPORT',
          fileUrl: 'https://infected.org/eicar.com',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('ERR_BAD_REQUEST');
    });
  });

  describe('POST /api/v1/compliance/upgrade-tier', () => {
    it('upgrades tier when prerequisite documents exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUser.id,
        kycTier: 'TIER_2',
        kycDocuments: [
          { docType: 'PASSPORT' },
          { docType: 'UTILITY_BILL' },
          { docType: 'ARTICLES_OF_INC' },
        ],
      });

      mockPrisma.user.update.mockResolvedValue({
        id: testUser.id,
        kycTier: 'TIER_3',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/compliance/upgrade-tier')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          targetTier: 'TIER_3',
          declarationAcknowledged: true,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentTier).toBe('TIER_3');
    });
  });

  describe('GET /api/v1/compliance/tax/pack', () => {
    it('generates Form 8949 / Schedule D summary bundle', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/compliance/tax/pack?year=2024&format=JSON')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.taxYear).toBe(2024);
      expect(response.body.data.form8949Summary.totalNetCapitalGains).toBeGreaterThan(0);
    });

    it('generates CSV formatted tax export', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/compliance/tax/pack?year=2024&format=CSV')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.format).toBe('CSV');
      expect(response.body.data.content).toContain('Category,Description,Date Acquired');
    });
  });

  describe('GET /api/v1/compliance/audit-logs', () => {
    it('returns paginated audit trail for compliance review', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/compliance/audit-logs?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.pagination.page).toBe(1);
    });
  });
});
