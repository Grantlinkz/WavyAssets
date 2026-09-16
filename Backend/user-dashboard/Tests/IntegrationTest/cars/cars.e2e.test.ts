import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('E2E Integration — Exotic Vehicles & Horology Vault API (/api/v1/cars)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const testUser = {
    id: 'usr-cars-e2e-001',
    email: 'collector@wavyassets.com',
    fullName: 'Julian Rossi',
    tier: 'INSTITUTIONAL',
    kycTier: 'TIER_3',
    isCorporate: true,
    isActive: true,
  };

  const mockPrisma = {
    user: { findUnique: vi.fn() },
    session: { findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn() },
    cryptoHolding: { findMany: vi.fn().mockResolvedValue([]) },
    stockPosition: { findMany: vi.fn().mockResolvedValue([]) },
    stockOrder: { findMany: vi.fn().mockResolvedValue([]) },
    aiFundPosition: { findMany: vi.fn().mockResolvedValue([]) },
    realEstateShare: { findMany: vi.fn().mockResolvedValue([]) },
    exoticCar: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    carShare: {
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    driveBooking: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    ledgerAccount: { findMany: vi.fn().mockResolvedValue([]) },
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
    await app.close();
  });

  describe('GET /api/v1/cars/inventory', () => {
    it('returns vehicle vault inventory with user holdings', async () => {
      mockPrisma.exoticCar.findMany.mockResolvedValue([
        {
          id: 'car-001',
          vin: '250GT-001',
          make: 'Ferrari',
          model: '250 GT SWB',
          year: 1961,
          vaultLocation: 'Geneva FreePort Bonded Vault',
          insuredValue: 8500000.0,
          hagertyIndex: 142.8,
          shares: [{ sharePct: 14.12 }],
        },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/cars/inventory')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].make).toBe('Ferrari');
      expect(res.body.data[0].userHolding.sharePct).toBe(14.12);
    });
  });

  describe('GET /api/v1/cars/valuations & logistics & fleet-monetization', () => {
    it('returns dynamic Hagerty index tracking and auction benchmarks', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cars/valuations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.benchmarkIndex).toContain('Hagerty');
      expect(res.body.data.oneYearDeltaPct).toBe(8.7);
    });

    it('returns bonded vault climate telemetry and Lloyd’s coverage', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cars/logistics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vaultFacilities[0].location).toContain('Geneva');
      expect(res.body.data.vaultFacilities[0].temperatureCelsius).toBe(21.2);
    });

    it('returns fleet rental monetization logs and dividend accruals', async () => {
      mockPrisma.exoticCar.findMany.mockResolvedValue([
        {
          id: 'car-001',
          insuredValue: 8500000.0,
          shares: [{ sharePct: 14.12 }],
        },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/cars/fleet-monetization')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.grossYieldUsd).toBe(185000.0);
      expect(res.body.data.rentalLogs.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/cars/drive-bookings', () => {
    it('successfully books track day when slot is available', async () => {
      mockPrisma.exoticCar.findUnique.mockResolvedValue({
        id: 'car-001',
        vin: '250GT-001',
        make: 'Ferrari',
        model: '250 GT SWB',
        year: 1961,
      });
      mockPrisma.driveBooking.findFirst.mockResolvedValue(null); // No conflict
      mockPrisma.driveBooking.create.mockResolvedValue({
        id: 'booking-001',
        carId: 'car-001',
        trackLocation: 'Monaco GP Circuit',
        bookingDate: new Date('2026-10-15T00:00:00.000Z'),
        status: 'CONFIRMED',
        createdAt: new Date('2026-09-16T04:00:00.000Z'),
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/cars/drive-bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          carId: 'car-001',
          trackLocation: 'Monaco GP Circuit',
          bookingDate: '2026-10-15T00:00:00.000Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CONFIRMED');
      expect(res.body.data.trackLocation).toBe('Monaco GP Circuit');
    });

    it('rejects duplicate booking with 409 ConflictException when vehicle slot is already reserved', async () => {
      mockPrisma.exoticCar.findUnique.mockResolvedValue({
        id: 'car-001',
        vin: '250GT-001',
        make: 'Ferrari',
        model: '250 GT SWB',
        year: 1961,
      });
      // Slot already occupied
      mockPrisma.driveBooking.findFirst.mockResolvedValue({
        id: 'booking-conflict',
        carId: 'car-001',
        bookingDate: new Date('2026-10-15T00:00:00.000Z'),
        status: 'CONFIRMED',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/cars/drive-bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          carId: 'car-001',
          trackLocation: 'Monaco GP Circuit',
          bookingDate: '2026-10-15T00:00:00.000Z',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('ERR_CONFLICT');
    });
  });

  describe('GET /api/v1/cars/:carId/provenance', () => {
    it('returns cryptographically verified maintenance provenance', async () => {
      mockPrisma.exoticCar.findUnique.mockResolvedValue({
        id: 'car-001',
        vin: '250GT-BERLINETTA-1961-0428',
        make: 'Ferrari',
        model: '250 GT SWB',
        year: 1961,
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/cars/car-001/provenance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vin).toBe('250GT-BERLINETTA-1961-0428');
      expect(res.body.data.certificates).toHaveLength(2);
    });
  });
});
