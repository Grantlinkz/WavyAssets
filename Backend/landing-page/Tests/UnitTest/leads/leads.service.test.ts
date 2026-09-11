import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { LeadsService } from '../../../src/modules/leads/leads.service';
import { PrismaService } from '../../../src/modules/prisma/prisma.service';
import { CryptoService } from '../../../src/common/utils/crypto.service';
import { TelegramService } from '../../../src/modules/auth/services/telegram.service';

describe('LeadsService Unit Tests', () => {
  let leadsService: LeadsService;
  let mockPrisma: any;
  let mockCrypto: any;
  let mockTelegram: any;

  beforeEach(() => {
    mockPrisma = {
      leadInquiry: {
        create: vi.fn().mockImplementation((args) =>
          Promise.resolve({
            id: 'mock-lead-id-123',
            ...args.data,
            createdAt: new Date(),
          }),
        ),
        update: vi.fn().mockResolvedValue({}),
      },
    };

    mockCrypto = {
      encryptField: vi.fn().mockImplementation((val) => `encrypted_${val}`),
      hashBlindIndex: vi.fn().mockImplementation((val) => `hash_${val}`),
    };

    mockTelegram = {
      sendSecurityAlert: vi.fn().mockResolvedValue(true),
    };

    leadsService = new LeadsService(
      mockPrisma as PrismaService,
      mockCrypto as CryptoService,
      mockTelegram as TelegramService,
    );
  });

  it('should reject inquiries with disposable email addresses with BadRequestException', async () => {
    await expect(
      leadsService.processInquiry({
        fullName: 'Bot User',
        workEmail: 'spammer@tempmail.com',
        companyName: 'Bot Corp',
        service: 'CRYPTO',
        allocationRange: '$1M - $5M',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockPrisma.leadInquiry.create).not.toHaveBeenCalled();
  });

  it('should accept valid corporate inquiries, encrypt PII, and score authentic corporate domains at 1.0', async () => {
    const result = await leadsService.processInquiry({
      fullName: 'Dr. Beatrix Fischer',
      workEmail: 'beatrix@fischer-familyoffice.ch',
      companyName: 'Fischer Family Office AG',
      websiteUrl: 'https://fischer-familyoffice.ch',
      telegram: '@beatrix_fischer',
      service: 'AI_FUNDS',
      allocationRange: '$5M - $10M',
    });

    expect(result.inquiryId).toBe('mock-lead-id-123');
    expect(result.priority).toBe(true);
    expect(result.status).toBe('PRIORITY_REVIEW');

    expect(mockCrypto.encryptField).toHaveBeenCalledWith('Dr. Beatrix Fischer');
    expect(mockCrypto.encryptField).toHaveBeenCalledWith('beatrix@fischer-familyoffice.ch');
    expect(mockCrypto.hashBlindIndex).toHaveBeenCalledWith('beatrix@fischer-familyoffice.ch');

    expect(mockPrisma.leadInquiry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          domainScore: 1.0,
          allocationRange: '$5M - $10M',
          isSpam: false,
        }),
      }),
    );

    // Verify priority telegram alert dispatched
    expect(mockTelegram.sendSecurityAlert).toHaveBeenCalled();
  });

  it('should flag inquiry as spam if honeypot field is filled without throwing exception', async () => {
    const result = await leadsService.processInquiry({
      fullName: 'Automated Scraper',
      workEmail: 'lead@legitimatecorp.com',
      companyName: 'Scraper Corp',
      service: 'STOCKS',
      allocationRange: '$500K - $1M',
      honeypot: 'I am a bot filling hidden inputs',
    });

    expect(result.inquiryId).toBe('mock-lead-id-123');
    expect(mockPrisma.leadInquiry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isSpam: true,
        }),
      }),
    );

    // Telegram alert should NOT be sent for spam
    expect(mockTelegram.sendSecurityAlert).not.toHaveBeenCalled();
  });
});
