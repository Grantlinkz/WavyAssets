import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RealEstateService } from '../../../src/modules/real-estate/real-estate.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { WalletService } from '../../../src/modules/wallet/wallet.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('RealEstateService — Fractional Properties, Rental Distributions, OTC Settlement & HMAC Vault', () => {
  let realEstateService: RealEstateService;
  let mockPrisma: {
    realEstateProperty: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
    };
    realEstateShare: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    realEstateOtcOrder: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      createMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
    };
    user: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let mockWalletService: {
    getOrCreateAccount: ReturnType<typeof vi.fn>;
    recordLedgerTransaction: ReturnType<typeof vi.fn>;
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
      realEstateProperty: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        upsert: vi.fn(),
      },
      realEstateShare: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      realEstateOtcOrder: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        createMany: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: testUserId }),
      },
      $transaction: vi.fn(async (cb) => (typeof cb === 'function' ? cb(mockPrisma) : Promise.all(cb))),
    };

    mockWalletService = {
      getOrCreateAccount: vi.fn().mockImplementation((userId, accountType, currency) =>
        Promise.resolve({
          id: `acc-${userId}-${accountType}`,
          userId,
          accountType,
          currency,
          balance: 500000.0,
        }),
      ),
      recordLedgerTransaction: vi.fn().mockResolvedValue({ id: 'tx-re-otc' }),
    };

    mockGateway = {
      broadcastAllocationRebalanced: vi.fn(),
    };

    mockDashboardService = {
      invalidateCache: vi.fn(),
    };

    const mockConfigService = {
      get: vi.fn().mockReturnValue('wavy_Global_document_vault_hmac_secret_2026'),
    };

    realEstateService = new RealEstateService(
      mockPrisma as unknown as PrismaService,
      mockWalletService as unknown as WalletService,
      mockConfigService as any,
      mockGateway as any,
      mockDashboardService as any,
    );
  });

  describe('getProperties & getRentalDistributions', () => {
    it('returns fractional properties with user holdings and equity valuation', async () => {
      mockPrisma.realEstateProperty.findMany.mockResolvedValue([
        {
          id: 'prop-zurich-001',
          title: 'Zurich Prime Commercial',
          region: 'SWITZERLAND',
          totalValuation: 45000000.0,
          totalTokens: 100000,
          tokenPriceUsd: 450.0,
          annualizedYield: 8.4,
          occupancyRate: 98.5,
          spvContractUrl: 'https://docs.wavyassets.com/spv/zurich.pdf',
          shares: [{ tokenCount: 4666 }],
        },
      ]);

      const properties = await realEstateService.getProperties(testUserId);
      expect(properties).toHaveLength(1);
      expect(properties[0].userHolding.tokenCount).toBe(4666);
      expect(properties[0].userHolding.equityUsd).toBe(2099700.0);
      expect(properties[0].userHolding.ownershipPct).toBe(4.67);
    });

    it('calculates dynamic rental yield distributions and monthly payouts', async () => {
      mockPrisma.realEstateProperty.findMany.mockResolvedValue([
        {
          id: 'prop-zurich-001',
          title: 'Zurich Prime Commercial',
          region: 'SWITZERLAND',
          totalValuation: 45000000.0,
          totalTokens: 100000,
          tokenPriceUsd: 450.0,
          annualizedYield: 8.4,
          occupancyRate: 98.5,
          spvContractUrl: 'https://docs.wavyassets.com/spv/zurich.pdf',
          shares: [{ tokenCount: 2000 }],
        },
      ]);

      const dist = await realEstateService.getRentalDistributions(testUserId);
      expect(dist.projectedAnnualYieldUsd).toBe(75600.0);
      expect(dist.monthlyPayoutUsd).toBe(6300.0);
      expect(dist.distributionCadence).toBe('MONTHLY_FIRST_BUSINESS_DAY');
    });
  });

  describe('executeOtcOrder', () => {
    it('throws NotFoundException if order does not exist', async () => {
      mockPrisma.realEstateOtcOrder.findUnique.mockResolvedValue(null);

      await expect(realEstateService.executeOtcOrder(testUserId, 'order-nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException if order is not OPEN', async () => {
      mockPrisma.realEstateOtcOrder.findUnique.mockResolvedValue({
        id: 'order-001',
        status: 'FILLED',
      });

      await expect(realEstateService.executeOtcOrder(testUserId, 'order-001')).rejects.toThrow(
        ConflictException,
      );
    });

    it('executes OFFER order: debits buyer cash, credits seller/vault, and increments buyer tokens', async () => {
      mockPrisma.realEstateOtcOrder.findUnique.mockResolvedValue({
        id: 'order-offer-001',
        propertyId: 'prop-001',
        orderType: 'OFFER',
        tokenAmount: 100,
        pricePerToken: 450.0,
        status: 'OPEN',
        property: { title: 'Zurich Prime' },
      });
      mockPrisma.realEstateShare.findFirst.mockResolvedValue({
        id: 'share-001',
        userId: testUserId,
        tokenCount: 50,
      });
      mockPrisma.realEstateShare.update.mockResolvedValue({});
      mockPrisma.realEstateOtcOrder.update.mockResolvedValue({
        id: 'order-offer-001',
        status: 'FILLED',
      });

      const res = await realEstateService.executeOtcOrder(testUserId, 'order-offer-001');
      expect(res.success).toBe(true);
      expect(res.status).toBe('FILLED');
      expect(res.totalSettlementUsd).toBe(45000.0);
      expect(mockWalletService.recordLedgerTransaction).toHaveBeenCalledTimes(1);
      expect(mockDashboardService.invalidateCache).toHaveBeenCalledWith(testUserId);
      expect(mockGateway.broadcastAllocationRebalanced).toHaveBeenCalledWith(testUserId, {
        trigger: 'REAL_ESTATE_OTC_EXECUTED',
        assetId: 'real-estate',
      });
    });

    it('rejects BID execution if selling user owns insufficient shares', async () => {
      mockPrisma.realEstateOtcOrder.findUnique.mockResolvedValue({
        id: 'order-bid-002',
        propertyId: 'prop-001',
        orderType: 'BID',
        tokenAmount: 200,
        pricePerToken: 440.0,
        status: 'OPEN',
        property: { title: 'Zurich Prime' },
      });
      mockPrisma.realEstateShare.findFirst.mockResolvedValue({
        id: 'share-001',
        userId: testUserId,
        tokenCount: 50, // Insufficient tokens (needs 200)
      });

      await expect(realEstateService.executeOtcOrder(testUserId, 'order-bid-002')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Pre-Signed Document Vault & HMAC Invariants', () => {
    it('generates secure 900s time-limited  pre-signed download URL', async () => {
      const doc = await realEstateService.getPresignedDocumentUrl(testUserId, 'spv-zurich-deed-001');
      expect(doc.docId).toBe('spv-zurich-deed-001');
      expect(doc.downloadUrl).toContain('vault.wavyassets.com');
      expect(doc.downloadUrl).toContain('sig=');
      expect(doc.signature).toHaveLength(64); // SHA256 hex string
    });

    it('verifies valid HMAC signature and rejects expired or tampered signatures', async () => {
      const doc = await realEstateService.getPresignedDocumentUrl(testUserId, 'spv-zurich-deed-001');
      const expiresAt = Math.floor(new Date(doc.expiresAt).getTime() / 1000);

      // Authentic signature passes
      const isValid = realEstateService.verifyDocumentSignature(
        'spv-zurich-deed-001',
        testUserId,
        expiresAt,
        doc.signature,
      );
      expect(isValid).toBe(true);

      // Tampered doc ID fails
      const isTampered = realEstateService.verifyDocumentSignature(
        'spv-unauthorized-doc',
        testUserId,
        expiresAt,
        doc.signature,
      );
      expect(isTampered).toBe(false);

      // Expired signature fails
      const pastTime = Math.floor(Date.now() / 1000) - 100;
      const isExpired = realEstateService.verifyDocumentSignature(
        'spv-zurich-deed-001',
        testUserId,
        pastTime,
        doc.signature,
      );
      expect(isExpired).toBe(false);
    });
  });
});
