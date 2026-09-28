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
import { EmergencyService } from '../../src/modules/emergency/emergency.service';

describe('VIP Cards, Emergency Freeze & Audit Modules (Integration)', () => {
  let moduleFixture: TestingModule;
  let app: INestApplication;
  let prisma: PrismaService;
  let cryptoService: CryptoService;
  let superAdminToken: string;
  let testUserId: string;
  let mintedCardId: string;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
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

    // Setup integration test operator
    const passwordHash = await cryptoService.hashPassword('Sovereign2026!#Vault');
    await prisma.adminUser.upsert({
      where: { email: 'superadmin.sprint4@wavyassets.ch' },
      update: {
        passphraseHash: passwordHash,
        isActive: true,
        role: AdminRole.SUPER_ADMIN,
      },
      create: {
        id: 'op-superadmin-sprint4',
        email: 'superadmin.sprint4@wavyassets.ch',
        fullName: 'Eleanor Vance SuperAdmin',
        role: AdminRole.SUPER_ADMIN,
        passphraseHash: passwordHash,
        isActive: true,
      },
    });

    // Obtain access token
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'superadmin.sprint4@wavyassets.ch',
        password: 'Sovereign2026!#Vault',
      });

    superAdminToken = loginRes.body.data.accessToken;

    // Create test user fixture
    const testUser = await prisma.user.upsert({
      where: { email: 'client.vip.card@swiss-custody.ch' },
      update: {},
      create: {
        id: 'usr-vip-test-01',
        email: 'client.vip.card@swiss-custody.ch',
        fullName: 'Baroness Caroline Von Bern',
        tier: 'INSTITUTIONAL',
        kycTier: 'TIER_3',
        passphraseHash: passwordHash,
      },
    });
    testUserId = testUser.id;

    // Clean up any existing card for this test user
    await prisma.vipCard.deleteMany({
      where: { userId: testUserId },
    });
  });

  afterAll(async () => {
    if (mintedCardId) {
      await prisma.vipCard.deleteMany({ where: { id: mintedCardId } });
    }
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.adminAuditLog.deleteMany({
      where: {
        action: { in: ['PLATFORM_EMERGENCY_FREEZE', 'PLATFORM_EMERGENCY_UNFREEZE'] },
      },
    });
    const emergencyService = moduleFixture.get<EmergencyService>(EmergencyService);
    emergencyService.resetState();
    await app.close();
  });

  describe('VIP Obsidian Metal Cards (/api/v1/admin/vip-cards)', () => {
    it('POST /mint — should mint new metal card with encrypted PIN and zero plaintext leakage', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/vip-cards/mint')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          userId: testUserId,
          tier: 'OBSIDIAN',
          cardType: 'PHYSICAL',
          dailySpendLimit: 100000.0,
          temporaryPin: '8492',
          cardNumberLast4: '0041',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.cardNumberLast4).toBe('0041');
      expect(res.body.data.tier).toBe('OBSIDIAN');
      expect(res.body.data.isFrozen).toBe(false);
      expect(res.body.data.dailySpendLimit).toBe(100000.0);
      // Absolute invariant: zero plaintext or ciphertext PIN in client payload
      expect(res.body.data.pinEncrypted).toBeUndefined();

      mintedCardId = res.body.data.id;
    });

    it('GET / — should list catalog with summary statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/vip-cards')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cards).toBeInstanceOf(Array);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.totalIssued).toBeGreaterThanOrEqual(1);
      expect(res.body.data.summary.totalDailyLimitVolume).toBeGreaterThan(0);
    });

    it('PATCH /:id/toggle-freeze — 1-click lock/unlock toggle', async () => {
      const freezeRes = await request(app.getHttpServer())
        .patch(`/api/v1/admin/vip-cards/${mintedCardId}/toggle-freeze`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Precautionary lock due to travel alert' });

      expect(freezeRes.status).toBe(200);
      expect(freezeRes.body.success).toBe(true);
      expect(freezeRes.body.data.isFrozen).toBe(true);

      const unfreezeRes = await request(app.getHttpServer())
        .patch(`/api/v1/admin/vip-cards/${mintedCardId}/toggle-freeze`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(unfreezeRes.status).toBe(200);
      expect(unfreezeRes.body.data.isFrozen).toBe(false);
    });

    it('PATCH /:id/parameters — updates daily limit and shipping status', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/vip-cards/${mintedCardId}/parameters`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          dailySpendLimit: 250000.0,
          shippingStatus: 'DELIVERED',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dailySpendLimit).toBe(250000.0);
      expect(res.body.data.shippingStatus).toBe('DELIVERED');
    });
  });

  describe('Emergency Platform Freeze & Kill-Switch (/api/v1/admin/emergency)', () => {
    it('GET /status — returns operational telemetry and standby protocol', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/emergency/status')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFrozen).toBe(false);
      expect(res.body.data.defconLevel).toBe(5);
      expect(res.body.data.telemetry).toBeDefined();
    });

    it('POST /freeze — enforces verification phrase and enters Defcon 1 freeze', async () => {
      // Invalid phrase should fail
      const badPhraseRes = await request(app.getHttpServer())
        .post('/api/v1/admin/emergency/freeze')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          verificationPhrase: 'WRONG PHRASE',
          reason: 'Emergency testing shutdown for integration suite',
        });

      expect(badPhraseRes.status).toBe(400);

      // Valid phrase executes freeze
      const freezeRes = await request(app.getHttpServer())
        .post('/api/v1/admin/emergency/freeze')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          verificationPhrase: 'CONFIRM EMERGENCY PLATFORM FREEZE',
          reason: 'Statutory FINMA containment protocol — suspect anomalous node outbound spike',
        });

      expect(freezeRes.status).toBe(201);
      expect(freezeRes.body.success).toBe(true);
      expect(freezeRes.body.data.isFrozen).toBe(true);
      expect(freezeRes.body.data.defconLevel).toBe(1);
      expect(freezeRes.body.data.protocol).toBe('HALT-ZERO-TIER1');
    });

    it('EmergencyLockdownGuard — halts mutating operations during platform freeze', async () => {
      // Attempting to update VIP card parameters while platform is frozen
      const blockedRes = await request(app.getHttpServer())
        .patch(`/api/v1/admin/vip-cards/${mintedCardId}/parameters`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ dailySpendLimit: 500000.0 });

      expect(blockedRes.status).toBe(403);
      expect(blockedRes.body.errorCode).toBe('ERR_PLATFORM_EMERGENCY_FREEZE');

      // Read requests should still be allowed
      const readRes = await request(app.getHttpServer())
        .get('/api/v1/admin/emergency/status')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(readRes.status).toBe(200);
      expect(readRes.body.data.isFrozen).toBe(true);
    });

    it('POST /unfreeze — lifts platform lockdown and restores nominal operations', async () => {
      const unfreezeRes = await request(app.getHttpServer())
        .post('/api/v1/admin/emergency/unfreeze')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          verificationPhrase: 'CONFIRM EMERGENCY PLATFORM UNFREEZE',
          reason: 'All nodes integrity verified and FINMA containment audit completed',
        });

      expect(unfreezeRes.status).toBe(201);
      expect(unfreezeRes.body.success).toBe(true);
      expect(unfreezeRes.body.data.isFrozen).toBe(false);
      expect(unfreezeRes.body.data.defconLevel).toBe(5);

      // Mutations should now succeed again
      const unblockedRes = await request(app.getHttpServer())
        .patch(`/api/v1/admin/vip-cards/${mintedCardId}/parameters`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ dailySpendLimit: 300000.0 });

      expect(unblockedRes.status).toBe(200);
      expect(unblockedRes.body.data.dailySpendLimit).toBe(300000.0);
    });
  });

  describe('Immutable Audit Trail (/api/v1/admin/audit)', () => {
    it('GET / — returns paginated audit records with differential state diffs', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/audit')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.logs).toBeInstanceOf(Array);
      expect(res.body.data.logs.length).toBeGreaterThan(0);
      expect(res.body.data.summary.totalLogs).toBeGreaterThan(0);

      // Verify at least one emergency or vip card audit log is present
      const actions = res.body.data.logs.map((l: any) => l.action);
      expect(
        actions.some((a: string) =>
          [
            'VIP_CARD_MINT',
            'VIP_CARD_FREEZE_TOGGLE',
            'PLATFORM_EMERGENCY_FREEZE',
            'PLATFORM_EMERGENCY_UNFREEZE',
          ].includes(a),
        ),
      ).toBe(true);
    });

    it('GET /export — generates statutory compliance export dataset', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/audit/export')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.exportMetadata).toBeDefined();
      expect(res.body.data.exportMetadata.regulatorStandard).toContain('FINMA AMLA');
      expect(res.body.data.records).toBeInstanceOf(Array);
    });
  });
});
