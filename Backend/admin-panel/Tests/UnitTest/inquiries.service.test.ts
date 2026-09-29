import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InquiriesService } from '../../src/modules/inquiries/inquiries.service';
import { InquiryStatus } from '../../src/modules/inquiries/dto/update-status.dto';
import { UserTier, KycTier } from '../../src/modules/users/dto/create-user.dto';

describe('InquiriesService', () => {
  let inquiriesService: InquiriesService;
  let mockPrisma: any;
  let mockCryptoService: any;

  beforeEach(() => {
    mockPrisma = {
      leadInquiry: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      ledgerAccount: {
        upsert: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        return callback(mockPrisma);
      }),
    };

    mockCryptoService = {
      encrypt: vi.fn().mockImplementation((val) => `enc:${val}`),
      decrypt: vi.fn().mockImplementation((val) => {
        if (typeof val === 'string' && val.startsWith('enc:')) {
          return val.replace('enc:', '');
        }
        return val;
      }),
      hashPassword: vi.fn().mockResolvedValue('argon2_temp_hash'),
    };

    inquiriesService = new InquiriesService(mockPrisma, mockCryptoService);
  });

  describe('findAll', () => {
    it('should return decrypted lead inquiries conforming to UI contract', async () => {
      const mockDbLead = {
        id: 'inq-lead-01',
        fullNameEncrypted: 'enc:Lars Von Essen',
        workEmailEncrypted: 'enc:l.essen@nordic-Supreme.se',
        telegramEncrypted: 'enc:@nordic_lars',
        companyName: 'Nordic Supreme Fund',
        service: 'AI_FUNDS',
        allocationRange: '$10M+',
        domainScore: 98.0,
        status: 'NEW',
        notes: 'Initial inquiry',
        location: 'Stockholm, Sweden',
        createdAt: new Date('2026-09-20T10:00:00Z'),
      };

      mockPrisma.leadInquiry.findMany.mockResolvedValue([mockDbLead]);

      const leads = await inquiriesService.findAll();

      expect(leads.length).toBe(1);
      const lead = leads[0];
      expect(lead.id).toBe('inq-lead-01');
      expect(lead.dossierId).toBe('INQ-INQ-LEAD');
      expect(lead.contactName).toBe('Lars Von Essen');
      expect(lead.email).toBe('l.essen@nordic-Supreme.se');
      expect(lead.telegram).toBe('@nordic_lars');
      expect(lead.company).toBe('Nordic Supreme Fund');
      expect(lead.trustScore).toBe(98);
      expect(lead.isDomainVerified).toBe(true);
      expect(lead.status).toBe('NEW');
    });
  });

  describe('updateStatus', () => {
    it('should update inquiry status and record desk operator notes', async () => {
      const existingLead = {
        id: 'inq-lead-02',
        fullNameEncrypted: 'enc:Klaus Reinhardt',
        workEmailEncrypted: 'enc:klaus@zurich.ch',
        status: 'NEW',
        notes: 'Initial mandate note',
      };

      mockPrisma.leadInquiry.findUnique.mockResolvedValue(existingLead);
      mockPrisma.leadInquiry.update.mockImplementation(async ({ data }: any) => ({
        ...existingLead,
        status: data.status,
        notes: data.notes,
      }));

      const updated = await inquiriesService.updateStatus(
        'inq-lead-02',
        { status: InquiryStatus.IN_REVIEW, notes: 'Operator reviewing KYC documentation' },
        'Alexander Wright',
      );

      expect(updated.status).toBe('IN_REVIEW');
      expect(updated.notes).toContain('Alexander Wright');
      expect(updated.notes).toContain('Operator reviewing KYC documentation');
    });
  });

  describe('convertLeadToUser', () => {
    it('should atomically create User and initialize LedgerAccounts', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'usr-new-001',
        email: 'l.essen@nordic.se',
        fullName: 'Lars Von Essen',
      });
      mockPrisma.leadInquiry.findUnique.mockResolvedValue({
        id: 'inq-lead-01',
        status: 'NEW',
      });
      mockPrisma.leadInquiry.update.mockResolvedValue({});

      const result = await inquiriesService.convertLeadToUser(
        {
          fullName: 'Lars Von Essen',
          email: 'l.essen@nordic.se',
          accessTier: UserTier.INSTITUTIONAL,
          initialKycTier: KycTier.TIER_3,
          startingCashBalance: 1000000.0,
        },
        'inq-lead-01',
      );

      expect(result.success).toBe(true);
      expect(result.userId).toBe('usr-new-001');
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.ledgerAccount.upsert).toHaveBeenCalledTimes(2); // CASH & INVESTED
    });
  });
});
