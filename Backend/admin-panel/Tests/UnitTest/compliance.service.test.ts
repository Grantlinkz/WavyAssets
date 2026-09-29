import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComplianceService } from '../../src/modules/compliance/compliance.service';
import { KycTargetTier } from '../../src/modules/compliance/dto/upgrade-kyc-tier.dto';
import { NotFoundException } from '@nestjs/common';

describe('ComplianceService (Unit)', () => {
  let service: ComplianceService;
  let mockPrisma: any;
  let mockCryptoService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      kycDocument: {
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      adminAuditLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockCryptoService = {
      hashBlindIndex: vi.fn().mockReturnValue('mock_blind_sig_9918'),
      hashIpAddress: vi.fn().mockReturnValue('mock_ip_hash'),
    };

    service = new ComplianceService(mockPrisma, mockCryptoService);
  });

  describe('getQueue', () => {
    it('should aggregate pending dossiers and telemetry', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([
        {
          id: 'usr-kyc-1',
          fullName: 'Baroness Beatrice von Berg',
          email: 'b.vonberg@zurich-private.ch',
          tier: 'PRIVATE_WEALTH',
          kycTier: 'TIER_2',
          isCorporate: false,
          createdAt: new Date(),
          kycDocuments: [
            { id: 'doc-1', docType: 'PASSPORT', fileUrl: '/docs/p1.pdf', isVerified: true, uploadedAt: new Date() },
            { id: 'doc-2', docType: 'TAX_AFFIDAVIT', fileUrl: '/docs/tax.pdf', isVerified: false, uploadedAt: new Date() },
          ],
          ledgerAccounts: [{ balance: 8450200.0 }],
        },
      ]);

      const result = await service.getQueue();

      expect(result.queue).toHaveLength(1);
      const dossier = result.queue[0];
      expect(dossier.unverifiedCount).toBe(1);
      expect(dossier.hasPendingReview).toBe(true);
      expect(dossier.requestedTier).toBe('TIER_3');
      expect(result.telemetry.dossierBacklog).toBe(1);
      expect(result.telemetry.processingVelocityMinutes).toBe(18);
    });
  });

  describe('getDocument', () => {
    it('should return signed inspection URL and client details', async () => {
      mockPrisma.kycDocument.findUnique.mockResolvedValueOnce({
        id: 'doc-passport-1',
        docType: 'PASSPORT',
        fileUrl: '/api/v1/compliance/dossiers/doc-passport-01.pdf',
        isVerified: false,
        uploadedAt: new Date(),
        user: {
          id: 'usr-1',
          email: 'client@wavyassets.ch',
          fullName: 'Aethelgard Capital LP',
          tier: 'INSTITUTIONAL',
          kycTier: 'TIER_3',
        },
      });

      const result = await service.getDocument('doc-passport-1');

      expect(result.documentId).toBe('doc-passport-1');
      expect(result.signedInspectionUrl).toContain('sig=mock_blind_sig_9918');
      expect(result.client.email).toBe('client@wavyassets.ch');
    });

    it('should throw NotFoundException if document does not exist', async () => {
      mockPrisma.kycDocument.findUnique.mockResolvedValueOnce(null);

      await expect(service.getDocument('invalid-doc')).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyDocument', () => {
    it('should update document verification status and record audit log', async () => {
      mockPrisma.kycDocument.findUnique.mockResolvedValueOnce({
        id: 'doc-to-verify',
        userId: 'usr-1',
        docType: 'PASSPORT',
        isVerified: false,
      });

      mockPrisma.kycDocument.update.mockResolvedValueOnce({
        id: 'doc-to-verify',
        userId: 'usr-1',
        docType: 'PASSPORT',
        isVerified: true,
      });

      const dto = {
        documentId: 'doc-to-verify',
        isVerified: true,
      };

      const result = await service.verifyDocument(dto, 'compliance-officer-1');

      expect(result.isVerified).toBe(true);
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalled();
    });
  });

  describe('upgradeTier', () => {
    it('should atomically elevate user tier to INSTITUTIONAL and mark docs verified', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'usr-elevate-1',
        email: 'applicant@geneva.ch',
        fullName: 'Geneva Applicant',
        tier: 'PRIVATE_WEALTH',
        kycTier: 'TIER_2',
        kycDocuments: [{ id: 'doc-1' }],
      });

      mockPrisma.user.update.mockResolvedValueOnce({
        id: 'usr-elevate-1',
        email: 'applicant@geneva.ch',
        fullName: 'Geneva Applicant',
        tier: 'INSTITUTIONAL',
        kycTier: 'TIER_3',
        updatedAt: new Date(),
      });

      const dto = {
        userId: 'usr-elevate-1',
        targetTier: KycTargetTier.INSTITUTIONAL,
        approvalNotes: 'Validated commercial register UID CHE-381.992.104 and certified estate.',
        checklist: ['Passport Valid', 'UID Active', 'Source of wealth validated'],
      };

      const result = await service.upgradeTier('usr-elevate-1', dto, 'compliance-officer-1');

      expect(result.newTier).toBe('INSTITUTIONAL');
      expect(result.newKycTier).toBe('TIER_3');
      expect(result.status).toBe('UPGRADED');
      expect(mockPrisma.kycDocument.updateMany).toHaveBeenCalledWith({
        where: { userId: 'usr-elevate-1' },
        data: { isVerified: true },
      });
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalled();
    });
  });
});
