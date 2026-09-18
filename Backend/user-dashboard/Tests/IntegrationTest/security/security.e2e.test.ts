import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('E2E Integration — Security Command Center & Inviolable 48h Time-Lock API (/api/v1/security)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const testUser = {
    id: 'usr-security-e2e-001',
    email: 'ciso@wavyassets.com',
    fullName: 'Sovereign CISO',
    tier: 'INSTITUTIONAL',
    kycTier: 'TIER_3',
    isCorporate: true,
    isActive: true,
  };

  const mockPrisma = {
    user: { findUnique: vi.fn() },
    session: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
    },
    cryptoHolding: { findMany: vi.fn().mockResolvedValue([]) },
    stockPosition: { findMany: vi.fn().mockResolvedValue([]) },
    stockOrder: { findMany: vi.fn().mockResolvedValue([]) },
    aiFundPosition: { findMany: vi.fn().mockResolvedValue([]) },
    realEstateShare: { findMany: vi.fn().mockResolvedValue([]) },
    exoticCar: { findMany: vi.fn().mockResolvedValue([]) },
    carShare: { findMany: vi.fn().mockResolvedValue([]) },
    ledgerAccount: { findMany: vi.fn().mockResolvedValue([]) },
    webAuthnCredential: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    whitelistDestination: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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

  describe('Session Governance', () => {
    it('GET /api/v1/security/sessions returns list of active sessions', async () => {
      mockPrisma.session.findMany.mockResolvedValue([
        {
          id: 'sess-active-01',
          ipAddress: '85.214.132.10',
          userAgent: 'Mozilla/5.0 macOS',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
        },
      ]);

      const response = await request(app.getHttpServer())
        .get('/api/v1/security/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].isCurrentSession).toBe(true);
    });

    it('DELETE /api/v1/security/sessions/:id terminates specific session', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        id: 'sess-to-delete',
        userId: testUser.id,
      });

      const response = await request(app.getHttpServer())
        .delete('/api/v1/security/sessions/sess-to-delete')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.revokedSessionId).toBe('sess-to-delete');
    });

    it('POST /api/v1/security/sessions/revoke-others revokes all concurrent sessions', async () => {
      mockPrisma.session.findMany.mockResolvedValue([
        { id: 'sess-current' },
        { id: 'sess-remote-1' },
        { id: 'sess-remote-2' },
      ]);
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 2 });

      const response = await request(app.getHttpServer())
        .post('/api/v1/security/sessions/revoke-others')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.revokedCount).toBe(2);
    });
  });

  describe('WebAuthn FIDO2 Ceremonies', () => {
    it('POST /api/v1/security/webauthn/register-challenge issues valid challenge options', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUser.id,
        email: testUser.email,
        fullName: testUser.fullName,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/security/webauthn/register-challenge')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.challenge).toBeDefined();
      expect(response.body.data.rp.id).toBe('wavyassets.com');
    });

    it('POST /api/v1/security/webauthn/register-verify registers hardware credential', async () => {
      mockPrisma.webAuthnCredential.findUnique.mockResolvedValue(null);
      mockPrisma.webAuthnCredential.create.mockResolvedValue({
        credentialId: 'yubikey-sec-01',
        deviceLabel: 'YubiKey 5C NFC FIDO2',
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/security/webauthn/register-verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          credentialId: 'yubikey-sec-01',
          publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuL',
          deviceLabel: 'YubiKey 5C NFC FIDO2',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.credentialId).toBe('yubikey-sec-01');
    });
  });

  describe('Inviolable 48-Hour Withdrawal Whitelist Time-Lock', () => {
    it('POST /api/v1/security/whitelist-destinations puts destination strictly into QUARANTINE', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: testUser.id });
      const futureQuarantine = new Date(Date.now() + 48 * 3600 * 1000);
      mockPrisma.whitelistDestination.create.mockResolvedValue({
        id: 'dest-quarantine-01',
        userId: testUser.id,
        assetRail: 'WIRE_IBAN',
        destinationLabel: 'Credit Suisse Zurich Escrow',
        beneficiaryOrg: 'Sovereign Escrow AG',
        addressOrIban: 'CH9300762011623852957',
        status: 'QUARANTINE',
        quarantineUntil: futureQuarantine,
        signersRequired: 2,
        signersCompleted: 1,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/security/whitelist-destinations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assetRail: 'WIRE_IBAN',
          destinationLabel: 'Credit Suisse Zurich Escrow',
          beneficiaryOrg: 'Sovereign Escrow AG',
          addressOrIban: 'CH9300762011623852957',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.destination.status).toBe('QUARANTINE');
      expect(response.body.data.destination.signersRequired).toBe(2);
      expect(response.body.data.destination.signersCompleted).toBe(1);
    });

    it('POST /api/v1/security/whitelist-destinations/:id/sign records signature but maintains QUARANTINE if 48h not elapsed', async () => {
      const futureQuarantine = new Date(Date.now() + 36 * 3600 * 1000); // 36 hours remaining
      mockPrisma.whitelistDestination.findUnique.mockResolvedValue({
        id: 'dest-quarantine-01',
        userId: testUser.id,
        status: 'QUARANTINE',
        quarantineUntil: futureQuarantine,
        signersRequired: 2,
        signersCompleted: 1,
      });

      mockPrisma.whitelistDestination.update.mockResolvedValue({
        id: 'dest-quarantine-01',
        signersCompleted: 2,
        signersRequired: 2,
        status: 'QUARANTINE', // Maintained QUARANTINE!
        quarantineUntil: futureQuarantine,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/security/whitelist-destinations/dest-quarantine-01/sign')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          signatureConfirmation: true,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.signersCompleted).toBe(2);
      expect(response.body.data.status).toBe('QUARANTINE');
      expect(response.body.data.timeLockElapsed).toBe(false);
    });

    it('DELETE /api/v1/security/whitelist-destinations/:id revokes destination', async () => {
      mockPrisma.whitelistDestination.findUnique.mockResolvedValue({
        id: 'dest-quarantine-01',
        userId: testUser.id,
      });
      mockPrisma.whitelistDestination.update.mockResolvedValue({
        id: 'dest-quarantine-01',
        status: 'REVOKED',
      });

      const response = await request(app.getHttpServer())
        .delete('/api/v1/security/whitelist-destinations/dest-quarantine-01')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REVOKED');
    });
  });
});
