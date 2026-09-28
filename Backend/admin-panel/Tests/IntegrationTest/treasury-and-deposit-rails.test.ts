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
import { SignOffAction } from '../../src/modules/treasury/dto/sign-off-withdrawal.dto';

describe('Treasury & Deposit Rails Modules (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cryptoService: CryptoService;

  let superAdminToken: string;
  let treasuryOfficerToken: string;

  let testUserId: string;
  let testAccountId: string;

  let testDepositId: string;
  let testDepositRejectId: string;
  let testSmallWithdrawalId: string;
  let testLargeWithdrawalId: string;
  let testRefundWithdrawalId: string;

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

    // Setup integration test operators
    const passwordHash = await cryptoService.hashPassword('Sovereign2026!#Vault');

    await prisma.adminUser.upsert({
      where: { email: 'superadmin.sprint3@wavyassets.ch' },
      update: { passphraseHash: passwordHash, isActive: true },
      create: {
        id: 'op-superadmin-sprint3',
        email: 'superadmin.sprint3@wavyassets.ch',
        fullName: 'Alexander Sprint 3 Admin',
        role: AdminRole.SUPER_ADMIN,
        passphraseHash: passwordHash,
        isActive: true,
      },
    });

    await prisma.adminUser.upsert({
      where: { email: 'treasury2.sprint3@wavyassets.ch' },
      update: { passphraseHash: passwordHash, isActive: true },
      create: {
        id: 'op-treasury2-sprint3',
        email: 'treasury2.sprint3@wavyassets.ch',
        fullName: 'Eleanor Sprint 3 Officer',
        role: AdminRole.TREASURY_OFFICER,
        passphraseHash: passwordHash,
        isActive: true,
      },
    });

    // Obtain access tokens
    const login1 = await request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'superadmin.sprint3@wavyassets.ch',
        password: 'Sovereign2026!#Vault',
      });
    superAdminToken = login1.body.data.accessToken;

    const login2 = await request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'treasury2.sprint3@wavyassets.ch',
        password: 'Sovereign2026!#Vault',
      });
    treasuryOfficerToken = login2.body.data.accessToken;

    // Seed test client user
    const userPassHash = await cryptoService.hashPassword('ClientVault2026!');
    const clientUser = await prisma.user.create({
      data: {
        email: 'treasury.client@sovereign-vault.ch',
        fullName: 'Geneva Treasury Client',
        passphraseHash: userPassHash,
        tier: 'INSTITUTIONAL',
        kycTier: 'TIER_3',
        isActive: true,
      },
    });
    testUserId = clientUser.id;

    const cashAccount = await prisma.ledgerAccount.create({
      data: {
        userId: testUserId,
        accountType: 'AVAILABLE_CASH',
        currency: 'USD',
        balance: 1000000.0,
      },
    });
    testAccountId = cashAccount.id;

    // Seed test pending deposit
    const dep1 = await prisma.ledgerTransaction.create({
      data: {
        referenceId: `DEP-INT-${Date.now()}-1`,
        type: 'DEPOSIT',
        status: 'PENDING',
        description: 'Institutional Wire Deposit Clearance',
        amount: 250000.0,
        currency: 'USD',
        rail: 'SWISS_SIC',
        counterparty: 'Lombard Odier Geneva',
        accountNumber: testUserId,
        entries: {
          create: {
            accountId: testAccountId,
            amount: 250000.0,
          },
        },
      },
    });
    testDepositId = dep1.id;

    // Seed test pending deposit for rejection
    const dep2 = await prisma.ledgerTransaction.create({
      data: {
        referenceId: `DEP-INT-${Date.now()}-2`,
        type: 'DEPOSIT',
        status: 'PENDING',
        description: 'Unverified Inbound Deposit',
        amount: 50000.0,
        currency: 'USD',
        rail: 'FEDWIRE',
      },
    });
    testDepositRejectId = dep2.id;

    // Seed test small withdrawal (<= $100k)
    const wd1 = await prisma.ledgerTransaction.create({
      data: {
        referenceId: `WD-INT-${Date.now()}-SMALL`,
        type: 'WITHDRAWAL',
        status: 'PENDING',
        description: 'Standard Client Payout',
        amount: 80000.0,
        currency: 'USD',
        rail: 'SWISS_SIC',
        accountNumber: testUserId,
        entries: {
          create: {
            accountId: testAccountId,
            amount: -80000.0,
          },
        },
      },
    });
    testSmallWithdrawalId = wd1.id;

    // Seed test large institutional withdrawal (> $100k, FINMA dual sign-off)
    const wd2 = await prisma.ledgerTransaction.create({
      data: {
        referenceId: `WD-INT-${Date.now()}-LARGE`,
        type: 'WITHDRAWAL',
        status: 'PENDING',
        description: 'Institutional Liquidity Payout',
        amount: 500000.0,
        currency: 'USD',
        rail: 'SWISS_SIC',
        accountNumber: testUserId,
        entries: {
          create: {
            accountId: testAccountId,
            amount: -500000.0,
          },
        },
      },
    });
    testLargeWithdrawalId = wd2.id;

    // Seed test withdrawal for rejection and refund
    const wd3 = await prisma.ledgerTransaction.create({
      data: {
        referenceId: `WD-INT-${Date.now()}-REFUND`,
        type: 'WITHDRAWAL',
        status: 'PENDING',
        description: 'Withdrawal flagged for compliance refund',
        amount: 150000.0,
        currency: 'USD',
        rail: 'FEDWIRE',
        accountNumber: testUserId,
        entries: {
          create: {
            accountId: testAccountId,
            amount: -150000.0,
          },
        },
      },
    });
    testRefundWithdrawalId = wd3.id;
  }, 90000);

  afterAll(async () => {
    // Cascading cleanup of all seeded test entities
    const txIds = [
      testDepositId,
      testDepositRejectId,
      testSmallWithdrawalId,
      testLargeWithdrawalId,
      testRefundWithdrawalId,
    ].filter(Boolean);

    for (const txId of txIds) {
      await prisma.treasurySignOff.deleteMany({ where: { withdrawalId: txId } }).catch(() => {});
      await prisma.ledgerEntry.deleteMany({ where: { transactionId: txId } }).catch(() => {});
      await prisma.ledgerTransaction.delete({ where: { id: txId } }).catch(() => {});
    }

    if (testAccountId) {
      await prisma.ledgerEntry.deleteMany({ where: { accountId: testAccountId } }).catch(() => {});
      await prisma.ledgerAccount.delete({ where: { id: testAccountId } }).catch(() => {});
    }

    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }

    await prisma.adminUser.deleteMany({
      where: { email: { in: ['superadmin.sprint3@wavyassets.ch', 'treasury2.sprint3@wavyassets.ch'] } },
    }).catch(() => {});

    if (app) {
      await app.close();
    }
  });

  describe('Deposit Rails Governance (/api/v1/admin/deposit-rails)', () => {
    it('GET / — should return active fiat parameters and crypto rails matrix', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/deposit-rails')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fiat).toBeDefined();
      expect(res.body.data.crypto).toBeDefined();
      expect(res.body.data.metadata).toBeDefined();
    });

    it('GET /api/v1/public/deposit-rails — should return public rails without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/public/deposit-rails');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fiat.beneficiaryName).toBeDefined();
      expect(Array.isArray(res.body.data.crypto)).toBe(true);
    });

    it('PUT /fiat — should update fiat coordinates with operator attribution', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/admin/deposit-rails/fiat')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          beneficiaryName: 'WavyAssets Custody Zurich AG',
          swissIban: 'CH93 0023 8812 4019 8821 0',
          bicSwift: 'UBSWCHZH80A',
          clearingRail: 'Swiss SIC RTGS / Fedwire DvP',
          memoFormat: 'WY-{USER_REF}-TREASURY-03',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.beneficiaryName).toBe('WavyAssets Custody Zurich AG');
    });

    it('PUT /crypto — should upsert crypto vault network coordinates', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/admin/deposit-rails/crypto')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          asset: 'USDC',
          network: 'Arbitrum',
          vaultAddress: '0x94A8D19F200c9261a81eC97669d0339dE78E916B',
          minDepositUsd: 250.0,
          confirmations: 10,
          isActive: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.network).toBe('Arbitrum');
      expect(res.body.data.asset).toBe('USDC');
    });
  });

  describe('Treasury Operations Hub (/api/v1/admin/treasury)', () => {
    it('GET /pending-deposits — should list unverified inbound deposits', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/treasury/pending-deposits')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.summary.totalPendingCount).toBeGreaterThanOrEqual(1);
    });

    it('POST /deposits/:id/approve — should 1-click approve deposit and credit AVAILABLE_CASH balance', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/treasury/deposits/${testDepositId}/approve`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ notes: 'Swiss SIC wire match verified' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SETTLED');
      expect(res.body.data.amount).toBe(250000.0);
      expect(res.body.data.newBalance).toBe(1250000.0);
    });

    it('POST /deposits/:id/reject — should reject unverified deposit with reason', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/treasury/deposits/${testDepositRejectId}/reject`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Invalid wire reference' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('FAILED');
    });

    it('GET /pending-withdrawals — should list pending withdrawals with sign-off counts', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/treasury/pending-withdrawals')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('POST /withdrawals/:id/sign-off (Small <= $100k) — settles immediately on single sign-off', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/treasury/withdrawals/${testSmallWithdrawalId}/sign-off`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ action: SignOffAction.APPROVE, notes: 'Small withdrawal verified' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requiresDualSignOff).toBe(false);
      expect(res.body.data.isFullySettled).toBe(true);
      expect(res.body.data.status).toBe('SETTLED');
    });

    it('POST /withdrawals/:id/sign-off (Institutional > $100k) — 1st sign-off transitions to PENDING_SECOND_SIGN_OFF', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/treasury/withdrawals/${testLargeWithdrawalId}/sign-off`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ action: SignOffAction.APPROVE, notes: 'SuperAdmin 1st sign-off' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requiresDualSignOff).toBe(true);
      expect(res.body.data.isFullySettled).toBe(false);
      expect(res.body.data.status).toBe('PENDING_SECOND_SIGN_OFF');
      expect(res.body.data.signOffCount).toBe(1);
    });

    it('POST /withdrawals/:id/sign-off (Institutional > $100k) — blocks duplicate sign-off by same officer with 409', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/treasury/withdrawals/${testLargeWithdrawalId}/sign-off`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ action: SignOffAction.APPROVE, notes: 'Attempting duplicate sign-off' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /withdrawals/:id/sign-off (Institutional > $100k) — 2nd distinct officer completes settlement', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/treasury/withdrawals/${testLargeWithdrawalId}/sign-off`)
        .set('Authorization', `Bearer ${treasuryOfficerToken}`)
        .send({ action: SignOffAction.APPROVE, notes: 'Treasury Officer 2nd sign-off' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFullySettled).toBe(true);
      expect(res.body.data.status).toBe('SETTLED');
      expect(res.body.data.signOffCount).toBe(2);
    });

    it('POST /withdrawals/:id/reject-and-refund — cancels withdrawal and returns reserved capital to ledger balance', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/treasury/withdrawals/${testRefundWithdrawalId}/reject-and-refund`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Beneficiary compliance check flagged' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('FAILED');
      expect(res.body.data.refunded).toBe(true);
      expect(res.body.data.refundedAmount).toBe(150000.0);
    });
  });
});
