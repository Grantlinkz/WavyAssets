import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CarsService } from '../../../src/modules/cars/cars.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('CarsService — Vehicle Inventory, Hagerty Valuations, Vault Logistics & Drive Concurrency', () => {
  let carsService: CarsService;
  let mockPrisma: {
    exoticCar: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
    };
    driveBooking: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };
  let mockGateway: {
    broadcastAllocationRebalanced: ReturnType<typeof vi.fn>;
  };
  let mockDashboardService: {
    invalidateCache: ReturnType<typeof vi.fn>;
  };

  const testUserId = 'usr-institutional-001';

  beforeEach(() => {
    mockPrisma = {
      exoticCar: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      driveBooking: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };

    mockGateway = {
      broadcastAllocationRebalanced: vi.fn(),
    };

    mockDashboardService = {
      invalidateCache: vi.fn(),
    };

    carsService = new CarsService(
      mockPrisma as unknown as PrismaService,
      mockGateway as any,
      mockDashboardService as any,
    );
  });

  describe('getInventory & getValuations', () => {
    it('returns vehicle inventory and user fractional equity valuation', async () => {
      mockPrisma.exoticCar.findMany.mockResolvedValue([
        {
          id: 'car-ferrari-001',
          vin: '250GT-BERLINETTA-1961-0428',
          make: 'Ferrari',
          model: '250 GT SWB Berlinetta',
          year: 1961,
          vaultLocation: 'Geneva FreePort Bonded Vault',
          insuredValue: 8500000.0,
          hagertyIndex: 142.8,
          shares: [{ sharePct: 14.12 }],
        },
      ]);

      const inventory = await carsService.getInventory(testUserId);
      expect(inventory).toHaveLength(1);
      expect(inventory[0].make).toBe('Ferrari');
      expect(inventory[0].userHolding.sharePct).toBe(14.12);
      expect(inventory[0].userHolding.equityUsd).toBe(1200200.0);
    });

    it('returns Hagerty benchmark indices and recent auction comps', async () => {
      const valuations = await carsService.getValuations();
      expect(valuations.benchmarkIndex).toContain('Hagerty');
      expect(valuations.oneYearDeltaPct).toBe(8.7);
      expect(valuations.auctionComps.length).toBeGreaterThan(0);
      expect(valuations.auctionComps[0].auctionHouse).toBe("RM Sotheby's");
    });
  });

  describe('getVaultLogistics & getFleetMonetization', () => {
    it('returns climate telemetry and Lloyd’s insurance limits for Swiss bonded vaults', async () => {
      const logistics = await carsService.getVaultLogistics();
      expect(logistics.vaultFacilities).toHaveLength(2);
      expect(logistics.vaultFacilities[0].temperatureCelsius).toBe(21.2);
      expect(logistics.vaultFacilities[0].relativeHumidityPct).toBe(45.0);
      expect(logistics.vaultFacilities[0].lloydsInsuranceLimitUsd).toBe(150000000.0);
    });

    it('returns fleet rental commercial logs and user dividend fraction', async () => {
      mockPrisma.exoticCar.findMany.mockResolvedValue([
        {
          id: 'car-ferrari-001',
          insuredValue: 8500000.0,
          shares: [{ sharePct: 14.12 }],
        },
      ]);

      const monetization = await carsService.getFleetMonetization(testUserId);
      expect(monetization.grossYieldUsd).toBe(185000.0);
      expect(monetization.totalCharterDays).toBe(28);
      expect(monetization.userDividendUsd).toBeGreaterThan(0);
    });
  });

  describe('Drive Booking Engine & Concurrency Locking Invariant', () => {
    it('throws NotFoundException if car does not exist', async () => {
      mockPrisma.exoticCar.findUnique.mockResolvedValue(null);

      await expect(
        carsService.bookDriveSlot(testUserId, {
          carId: 'car-nonexistent',
          trackLocation: 'Monaco GP Circuit',
          bookingDate: '2026-10-15T00:00:00.000Z',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if booking date is invalid', async () => {
      mockPrisma.exoticCar.findUnique.mockResolvedValue({
        id: 'car-001',
        make: 'Ferrari',
        model: '250 GT',
      });

      await expect(
        carsService.bookDriveSlot(testUserId, {
          carId: 'car-001',
          trackLocation: 'Monaco GP Circuit',
          bookingDate: 'invalid-date-string',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException (HTTP 409) if the vehicle is already booked for the target date', async () => {
      mockPrisma.exoticCar.findUnique.mockResolvedValue({
        id: 'car-001',
        vin: '250GT-001',
        make: 'Ferrari',
        model: '250 GT',
      });
      // Existing booking found on this date
      mockPrisma.driveBooking.findFirst.mockResolvedValue({
        id: 'booking-existing',
        carId: 'car-001',
        bookingDate: new Date('2026-10-15T00:00:00.000Z'),
        status: 'CONFIRMED',
      });

      await expect(
        carsService.bookDriveSlot(testUserId, {
          carId: 'car-001',
          trackLocation: 'Monaco GP Circuit',
          bookingDate: '2026-10-15T00:00:00.000Z',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('successfully reserves drive session when no conflict exists', async () => {
      mockPrisma.exoticCar.findUnique.mockResolvedValue({
        id: 'car-001',
        vin: '250GT-001',
        make: 'Ferrari',
        model: '250 GT',
        year: 1961,
      });
      mockPrisma.driveBooking.findFirst.mockResolvedValue(null); // No conflict
      mockPrisma.driveBooking.create.mockResolvedValue({
        id: 'booking-new-001',
        carId: 'car-001',
        trackLocation: 'Silverstone Grand Prix Circuit',
        bookingDate: new Date('2026-11-05T00:00:00.000Z'),
        status: 'CONFIRMED',
        createdAt: new Date('2026-09-16T04:00:00.000Z'),
      });

      const booking = await carsService.bookDriveSlot(testUserId, {
        carId: 'car-001',
        trackLocation: 'Silverstone Grand Prix Circuit',
        bookingDate: '2026-11-05T00:00:00.000Z',
      });

      expect(booking.id).toBe('booking-new-001');
      expect(booking.status).toBe('CONFIRMED');
      expect(booking.trackLocation).toBe('Silverstone Grand Prix Circuit');
      expect(booking.vehicle).toBe('Ferrari 250 GT (1961)');
    });
  });

  describe('getVehicleProvenance', () => {
    it('returns cryptographically verified maintenance history with SHA-256 integrity hashes', async () => {
      mockPrisma.exoticCar.findUnique.mockResolvedValue({
        id: 'car-001',
        vin: '250GT-BERLINETTA-1961-0428',
        make: 'Ferrari',
        model: '250 GT SWB Berlinetta',
        year: 1961,
      });

      const provenance = await carsService.getVehicleProvenance('car-001');
      expect(provenance.vin).toBe('250GT-BERLINETTA-1961-0428');
      expect(provenance.matchingNumbers).toBe(true);
      expect(provenance.certificates).toHaveLength(2);
      expect(provenance.certificates[0].verificationHash).toHaveLength(64);
    });
  });
});
