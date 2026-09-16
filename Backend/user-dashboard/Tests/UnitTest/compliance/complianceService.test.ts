import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComplianceService } from '../../../src/modules/compliance/compliance.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { KycDocumentType, KycTierLevel, TaxPackFormat } from '../../../src/modules/compliance/dto/compliance.dto';

describe('ComplianceService — Tiered KYC, Dossier Uploads, Tier Promotion & Tax Pack Generator', () => {
  let complianceService: ComplianceService;
  let mockPrisma: any;

  const testUserId = 'usr-institutional-001';

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      kycDocument: {
        create: vi.fn(),
      },
      cryptoHolding: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      stockPosition: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      realEstateShare: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      carShare: {
        findMany: vi.fn().mockResolvedValue([]),
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
    };

    complianceService = new ComplianceService(mockPrisma as unknown as PrismaService);
  });

  describe('getComplianceStatus', () => {
    it('returns user KYC status, daily limits, and checklist completeness', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        email: 'investor@institutional.ch',
        kycTier: 'TIER_2',
        kycDocuments: [
          { id: 'doc-001', docType: 'PASSPORT', fileUrl: 'https://vault.wavyassets.com/docs/passport.pdf', isVerified: true },
          { id: 'doc-002', docType: 'UTILITY_BILL', fileUrl: 'https://vault.wavyassets.com/docs/utility.pdf', isVerified: true },
        ],
      });

      const result = await complianceService.getComplianceStatus(testUserId);

      expect(result.kycTier).toBe(KycTierLevel.TIER_2);
      expect(result.limits.dailyLimitUsd).toBe(250000);
      expect(result.requirements[1].isMet).toBe(true); // Tier 2 requirements met
      expect(result.requirements[2].isMet).toBe(false); // Tier 3 missing articles of inc
      expect(result.documents.length).toBe(2);
    });

    it('throws NotFoundException if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(complianceService.getComplianceStatus('missing-usr')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadDossierDocument', () => {
    it('successfully uploads and marks verified for clean documents', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: testUserId });
      mockPrisma.kycDocument.create.mockResolvedValue({
        id: 'doc-new-001',
        userId: testUserId,
        docType: 'ARTICLES_OF_INC',
        fileUrl: 'https://vault.wavyassets.com/corporate_charter.pdf',
        isVerified: true,
        uploadedAt: new Date(),
      });

      const result = await complianceService.uploadDossierDocument(testUserId, {
        docType: KycDocumentType.ARTICLES_OF_INC,
        fileUrl: 'https://vault.wavyassets.com/corporate_charter.pdf',
      });

      expect(result.success).toBe(true);
      expect(result.docType).toBe('ARTICLES_OF_INC');
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('rejects upload when simulated malware signature is detected', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: testUserId });

      await expect(
        complianceService.uploadDossierDocument(testUserId, {
          docType: KycDocumentType.PASSPORT,
          fileUrl: 'https://malicious.org/eicar_standard_test_string.pdf',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('requestTierUpgrade', () => {
    it('promotes user to Tier 3 when corporate or wealth documents exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        kycTier: 'TIER_2',
        kycDocuments: [
          { docType: 'PASSPORT' },
          { docType: 'UTILITY_BILL' },
          { docType: 'ARTICLES_OF_INC' },
        ],
      });

      mockPrisma.user.update.mockResolvedValue({
        id: testUserId,
        kycTier: 'TIER_3',
      });

      const result = await complianceService.requestTierUpgrade(testUserId, {
        targetTier: KycTierLevel.TIER_3,
        declarationAcknowledged: true,
      });

      expect(result.success).toBe(true);
      expect(result.currentTier).toBe('TIER_3');
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('rejects promotion if required prerequisite documents are missing', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        kycTier: 'TIER_1',
        kycDocuments: [{ docType: 'PASSPORT' }], // Missing UTILITY_BILL
      });

      await expect(
        complianceService.requestTierUpgrade(testUserId, {
          targetTier: KycTierLevel.TIER_2,
          declarationAcknowledged: true,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateTaxPack', () => {
    it('generates Form 8949 and Schedule D summary with capital gains and yields', async () => {
      mockPrisma.realEstateShare.findMany.mockResolvedValue([
        {
          tokenCount: 100,
          property: { annualizedYield: 0.06, tokenPriceUsd: 1000 },
        },
      ]);
      mockPrisma.carShare.findMany.mockResolvedValue([
        { sharePct: 0.10, car: { model: 'Bugatti Chiron' } },
      ]);

      const pack = (await complianceService.generateTaxPack(testUserId, {
        year: 2024,
        format: TaxPackFormat.JSON,
      })) as any;

      expect(pack.taxYear).toBe(2024);
      expect(pack.reportingEntity).toContain('WavyAssets Sovereign Wealth');
      expect(pack.form8949Summary.totalNetCapitalGains).toBeGreaterThan(0);
      expect(pack.scheduleEOrdinaryIncome.totalOrdinaryDistributions).toBeGreaterThan(0);
      expect(pack.transactions.shortTerm.length).toBe(2);
      expect(pack.transactions.longTerm.length).toBe(1);
    });

    it('generates downloadable CSV export format', async () => {
      const csvResult = (await complianceService.generateTaxPack(testUserId, {
        year: 2024,
        format: TaxPackFormat.CSV,
      })) as { format: string; filename: string; content: string };

      expect(csvResult.format).toBe('CSV');
      expect(csvResult.filename).toContain('wavyassets_tax_bundle_2024');
      expect(csvResult.content).toContain('Category,Description,Date Acquired');
      expect(csvResult.content).toContain('Short-Term');
      expect(csvResult.content).toContain('Ordinary Income');
    });
  });

  describe('getAuditLogs', () => {
    it('returns paginated audit logs', async () => {
      const logs = await complianceService.getAuditLogs(testUserId, { page: 1, limit: 10 });
      expect(logs.data.length).toBe(1);
      expect(logs.pagination.total).toBe(1);
    });
  });
});
