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

describe('Admin API Endpoints (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cryptoService: CryptoService;
  let superAdminToken: string;
  let testLeadId: string;

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
      where: { email: 'superadmin.test@wavyassets.ch' },
      update: {
        passphraseHash: passwordHash,
        isActive: true,
      },
      create: {
        id: 'op-superadmin-test',
        email: 'superadmin.test@wavyassets.ch',
        fullName: 'Alexander Test Wright',
        role: AdminRole.SUPER_ADMIN,
        passphraseHash: passwordHash,
        isActive: true,
      },
    });

    // Create a sample lead inquiry for testing
    const sampleLead = await prisma.leadInquiry.create({
      data: {
        fullNameEncrypted: cryptoService.encrypt('Test Lead Person'),
        workEmailEncrypted: cryptoService.encrypt('lead.test@sovereign-lp.ch'),
        workEmailHash: cryptoService.hashBlindIndex('lead.test@sovereign-lp.ch'),
        companyName: 'Alpine Sovereign Wealth',
        service: 'CRYPTO',
        allocationRange: '$10M+',
        domainScore: 95.0,
        status: 'NEW',
        location: 'Geneva, Switzerland',
      },
    });
    testLeadId = sampleLead.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testLeadId && prisma?.leadInquiry) {
      await prisma.leadInquiry.delete({ where: { id: testLeadId } }).catch(() => {});
    }
    if (prisma?.adminUser) {
      await prisma.adminUser.delete({ where: { id: 'op-superadmin-test' } }).catch(() => {});
    }
    if (app) {
      await app.close();
    }
  });

  describe('Authentication Flow (/api/v1/admin/auth)', () => {
    it('POST /login — should reject invalid credentials with 401 and error envelope', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        .send({
          email: 'superadmin.test@wavyassets.ch',
          password: 'IncorrectPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });

    it('POST /login — should authenticate valid operator and return JWT token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        .send({
          email: 'superadmin.test@wavyassets.ch',
          password: 'Sovereign2026!#Vault',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.operator.email).toBe('superadmin.test@wavyassets.ch');
      expect(res.body.data.operator.role).toBe(AdminRole.SUPER_ADMIN);
      expect(res.body.data.permissions).toContain('canFreezePlatform');

      superAdminToken = res.body.data.accessToken;
    });

    it('GET /me — should return operator identity for authenticated bearer session', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/auth/me')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.operator.id).toBe('op-superadmin-test');
      expect(res.body.data.operator.fullName).toBe('Alexander Test Wright');
    });

    it('GET /me — should reject request missing Authorization header with 401', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/admin/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Executive Overview & Telemetry Deck (/api/v1/overview)', () => {
    it('GET /metrics — should return aggregated telemetry metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/overview/metrics')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalVaultBalance).toBeGreaterThan(0);
      expect(res.body.data.liquidSettlementCapital).toBeGreaterThan(0);
      expect(res.body.data.vaultBalanceChange24h).toBe(3.4);
      expect(res.body.data.nodeTelemetry).toBeDefined();
      expect(res.body.data.nodeTelemetry.shardLatencyMs).toBe(18);
    });

    it('GET /settlements — should return filterable settlement transactions stream', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/overview/settlements')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Investor Inquiries & Lead Conversion (/api/v1/inquiries)', () => {
    it('GET /inquiries — should retrieve decrypted lead inquiries', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/inquiries')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const created = res.body.data.find((i: any) => i.id === testLeadId);
      expect(created).toBeDefined();
      expect(created.contactName).toBe('Test Lead Person');
      expect(created.email).toBe('lead.test@sovereign-lp.ch');
      expect(created.status).toBe('NEW');
    });

    it('PATCH /inquiries/:id/status — should transition status to IN_REVIEW and append notes', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/inquiries/${testLeadId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          status: 'IN_REVIEW',
          notes: 'Dossier flagged for AML Tier 2 verification',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('IN_REVIEW');
      expect(res.body.data.notes).toContain('Dossier flagged for AML Tier 2 verification');
    });

    it('POST /users/convert — should atomically convert qualified lead to User and LedgerAccount', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/users/convert')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          fullName: 'Test Lead Person',
          email: 'lead.test@sovereign-lp.ch',
          accessTier: 'INSTITUTIONAL',
          initialKycTier: 'TIER_2',
          startingCashBalance: 500000.0,
          inquiryId: testLeadId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBeDefined();

      // Verify User in DB
      const user = await prisma.user.findUnique({
        where: { id: res.body.data.userId },
        include: { ledgerAccounts: true },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe('lead.test@sovereign-lp.ch');
      expect(user?.tier).toBe('INSTITUTIONAL');

      const cashAcc = user?.ledgerAccounts.find((a) => a.accountType === 'AVAILABLE_CASH');
      expect(cashAcc).toBeDefined();
      expect(Number(cashAcc?.balance)).toBe(500000.0);

      // Clean up created user and ledger accounts
      await prisma.user.delete({ where: { id: user!.id } }).catch(() => {});
    });
  });
});
