import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('E2E Integration — Wallet, Custody & Double-Entry Ledger API', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const testUser = {
    id: 'usr-wallet-e2e-001',
    email: 'treasury@wavyassets.com',
    fullName: 'David Sterling',
    tier: 'INSTITUTIONAL',
    kycTier: 'TIER_3',
    isCorporate: true,
    isActive: true,
  };

  const mockPrisma = {
    user: { findUnique: vi.fn() },
    session: { findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
    cryptoHolding: { findMany: vi.fn().mockResolvedValue([]) },
    stockPosition: { findMany: vi.fn().mockResolvedValue([]) },
    aiFundPosition: { findMany: vi.fn().mockResolvedValue([]) },
    realEstateShare: { findMany: vi.fn().mockResolvedValue([]) },
    carShare: { findMany: vi.fn().mockResolvedValue([]) },
    whitelistDestination: { findUnique: vi.fn() },
    ledgerAccount: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'acc-created', ...args?.data })),
      update: vi.fn().mockImplementation((args) => Promise.resolve({ id: args?.where?.id, ...args?.data })),
    },
    ledgerTransaction: {
      create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'tx-created', referenceId: args?.data?.referenceId, ...args?.data })),
    },
    ledgerEntry: {
      create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'entry-created', ...args?.data })),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    $transaction: vi.fn((cb) => cb(mockPrisma)),
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

    jwtService = moduleFixture.get<JwtService>(JwtService);
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/wallet/balances', () => {
    it('returns segregated balance breakdown across cash, invested, and staking', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(testUser);
      mockPrisma.ledgerAccount.findMany.mockResolvedValue([
        { accountType: 'AVAILABLE_CASH', currency: 'USD', balance: '150000.00' },
        { accountType: 'INVESTED_CAPITAL', currency: 'USD', balance: '500000.00' },
        { accountType: 'STAKING_ESCROW', currency: 'ETH', balance: '20.00' },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/wallet/balances')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUsd).toBeGreaterThan(0);
      expect(res.body.data.availableCash).toHaveLength(1);
      expect(res.body.data.investedCapital).toHaveLength(1);
      expect(res.body.data.stakingEscrow).toHaveLength(1);
    });
  });

  describe('POST /api/v1/wallet/fiat-ramp', () => {
    it('executes settled deposit via double-entry journal', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(testUser);
      mockPrisma.ledgerAccount.findUnique
        .mockResolvedValueOnce({ id: 'acc-cash-usd', balance: '0' })
        .mockResolvedValueOnce({ id: 'acc-clearing', balance: '0' });

      mockPrisma.ledgerTransaction.create.mockResolvedValue({
        id: 'tx-ramp-dep',
        referenceId: 'ref-ramp-001',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/wallet/fiat-ramp')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 25000,
          currency: 'USD',
          direction: 'DEPOSIT',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SETTLED');
      expect(res.body.data.amount).toBe(25000);
      expect(res.body.data.referenceId).toBe('ref-ramp-001');
    });

    it('rejects withdrawal to quarantined destination with 403 ERR_DESTINATION_QUARANTINED', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(testUser);
      mockPrisma.whitelistDestination.findUnique.mockResolvedValue({
        id: 'dest-quarantine',
        userId: testUser.id,
        status: 'QUARANTINE',
        quarantineUntil: new Date(Date.now() + 48 * 3600 * 1000),
        addressOrIban: 'GB29NWBK60161331926819',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/wallet/fiat-ramp')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 5000,
          currency: 'USD',
          direction: 'WITHDRAWAL',
          destinationId: 'dest-quarantine',
        })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('ERR_DESTINATION_QUARANTINED');
    });
  });

  describe('POST /api/v1/wallet/cash-sweep', () => {
    it('sweeps idle cash above threshold into invested capital yield account', async () => {
      mockPrisma.ledgerAccount.findUnique
        .mockResolvedValueOnce({ id: 'acc-cash', balance: '120000.00' })
        .mockResolvedValueOnce({ id: 'acc-invested', balance: '0.00' });

      mockPrisma.ledgerTransaction.create.mockResolvedValue({
        id: 'tx-sw',
        referenceId: 'ref-sw-001',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/wallet/cash-sweep')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          threshold: 50000,
          sweepAmount: 70000,
          currency: 'USD',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.swept).toBe(true);
      expect(res.body.data.amountSwept).toBe(70000);
    });
  });

  describe('POST /api/v1/wallet/fx-convert', () => {
    it('executes spot FX conversion between USD and EUR', async () => {
      mockPrisma.ledgerAccount.findUnique
        .mockResolvedValueOnce({ id: 'acc-usd', balance: '10000.00' })
        .mockResolvedValueOnce({ id: 'acc-eur', balance: '0.00' });

      mockPrisma.ledgerTransaction.create.mockResolvedValue({
        id: 'tx-fx',
        referenceId: 'ref-fx-001',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/wallet/fx-convert')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          amount: 5000,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.fromCurrency).toBe('USD');
      expect(res.body.data.toCurrency).toBe('EUR');
      expect(res.body.data.amountSold).toBe(5000);
      expect(res.body.data.amountBought).toBeGreaterThan(0);
    });
  });
});
