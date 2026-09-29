import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';
import { ResponseEnvelopeInterceptor } from '../../src/common/interceptors/response-envelope.interceptor';
import { PrismaService } from '../../src/common/services/prisma.service';
import { CryptoService } from '../../src/common/services/crypto.service';
import { AdminRole } from '../../src/common/constants/roles.constant';

describe('Users & Compliance Modules (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cryptoService: CryptoService;
  let superAdminToken: string;
  let createdUserId: string;
  let cascadeDeleteUser: (filter: { email?: string; id?: string }) => Promise<void>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    cryptoService = moduleFixture.get<CryptoService>(CryptoService);

    // Setup an integration test operator in database
    const passwordHash = await cryptoService.hashPassword('Sovereign2026!#Vault');
    await prisma.adminUser.upsert({
      where: { email: 'superadmin.sprint2@wavyassets.ch' },
      update: {
        passphraseHash: passwordHash,
        isActive: true,
      },
      create: {
        id: 'op-superadmin-sprint2',
        email: 'superadmin.sprint2@wavyassets.ch',
        fullName: 'Alexander Sprint 2 SuperAdmin',
        role: AdminRole.SUPER_ADMIN,
        passphraseHash: passwordHash,
        isActive: true,
      },
    });

    // Obtain access token
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'superadmin.sprint2@wavyassets.ch',
        password: 'Sovereign2026!#Vault',
      });

    superAdminToken = loginRes.body.data.accessToken;

    // Helper to cascade delete test user fixture
    cascadeDeleteUser = async (filter: { email?: string; id?: string }) => {
      const u = await prisma.user.findFirst({
        where: filter.email ? { email: filter.email } : { id: filter.id },
        include: { ledgerAccounts: true },
      });
      if (u) {
        for (const acc of u.ledgerAccounts) {
          await prisma.ledgerEntry.deleteMany({ where: { accountId: acc.id } }).catch(() => {});
        }
        await prisma.ledgerAccount.deleteMany({ where: { userId: u.id } }).catch(() => {});
        await prisma.kycDocument.deleteMany({ where: { userId: u.id } }).catch(() => {});
        await prisma.vipCard.deleteMany({ where: { userId: u.id } }).catch(() => {});
        await prisma.session.deleteMany({ where: { userId: u.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: u.id } });
      }
    };

    await cascadeDeleteUser({ email: 'founder.integration@alpine-wealth.ch' });
  }, 90000);

  afterAll(async () => {
    if (createdUserId) {
      await cascadeDeleteUser({ id: createdUserId });
    }
    await prisma.adminUser.delete({ where: { email: 'superadmin.sprint2@wavyassets.ch' } }).catch(() => {});
    if (app) {
      await app.close();
    }
  });

  describe('User Lifecycle & Directory (/api/v1/admin/users)', () => {
    it('POST / — should create a new sovereign client account with initial cash balance', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          email: 'founder.integration@alpine-wealth.ch',
          fullName: 'Alpine Wealth Founder',
          tier: 'PRIVATE_WEALTH',
          kycTier: 'TIER_1',
          startingCashBalance: 250000.0,
          isCorporate: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('founder.integration@alpine-wealth.ch');
      expect(res.body.data.startingCashBalance).toBe(250000.0);
      createdUserId = res.body.data.id;
    });

    it('GET / — should list users with aggregated balances and summary statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.summaryStats).toBeDefined();

      const found = res.body.data.items.find((u: any) => u.id === createdUserId);
      expect(found).toBeDefined();
      expect(found.availableCash).toBe(250000.0);
      expect(found.status).toBe('Active');
    });

    it('GET /:id — should return full institutional dossier', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdUserId);
      expect(res.body.data.balances.availableCash).toBe(250000.0);
    });

    it('POST /:id/fund-balance — should credit balance atomically via double-entry ledger', async () => {
      const refId = `TX-INT-CREDIT-${Date.now()}`;
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/users/${createdUserId}/fund-balance`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          accountType: 'AVAILABLE_CASH',
          currency: 'USD',
          amount: 50000.0,
          direction: 'CREDIT',
          auditReason: 'Wire settlement Ref #SIC-8921-UBS integration test',
          referenceId: refId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.direction).toBe('CREDIT');
      expect(res.body.data.previousBalance).toBe(250000.0);
      expect(res.body.data.newBalance).toBe(300000.0);
    });

    it('PATCH /:id/suspend — should lock account with immediate kill-switch', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${createdUserId}/suspend`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);
      expect(res.body.data.status).toBe('Locked');
    });

    it('POST /:id/fund-balance — should reject funding on suspended account with 403', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/users/${createdUserId}/fund-balance`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          accountType: 'AVAILABLE_CASH',
          currency: 'USD',
          amount: 10000.0,
          direction: 'CREDIT',
          auditReason: 'Attempting credit on locked account',
          referenceId: `TX-FAIL-LOCKED-${Date.now()}`,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('PATCH /:id/unsuspend — should restore account operational status', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${createdUserId}/unsuspend`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(true);
      expect(res.body.data.status).toBe('Active');
    });
  });

  describe('Compliance & FINMA AML Verification (/api/v1/admin/compliance)', () => {
    let testDocId: string;

    beforeAll(async () => {
      const doc = await prisma.kycDocument.create({
        data: {
          userId: createdUserId,
          docType: 'PASSPORT',
          fileUrl: '/api/v1/compliance/dossiers/alpine-passport.pdf',
          isVerified: false,
        },
      });
      testDocId = doc.id;
    });

    it('GET /queue — should list pending verification dossiers and telemetry stats', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/compliance/queue')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.queue)).toBe(true);
      expect(res.body.data.telemetry).toBeDefined();
      expect(res.body.data.telemetry.globalWatchlistsStatus).toContain('World-Check');
    });

    it('GET /documents/:docId — should return signed document preview URL', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/compliance/documents/${testDocId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.signedInspectionUrl).toContain('sig=');
    });

    it('POST /verify-document — should verify individual KYC document', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/compliance/verify-document')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          documentId: testDocId,
          isVerified: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isVerified).toBe(true);
    });

    it('POST /upgrade-tier — should elevate user tier to INSTITUTIONAL', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/compliance/upgrade-tier')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          userId: createdUserId,
          targetTier: 'INSTITUTIONAL',
          approvalNotes: 'Validated Cantonal register and source of wealth.',
          checklist: ['Valid Passport', 'UID Active', 'Source of wealth validated'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.newTier).toBe('INSTITUTIONAL');
      expect(res.body.data.newKycTier).toBe('TIER_3');
      expect(res.body.data.status).toBe('UPGRADED');
    });
  });
});
