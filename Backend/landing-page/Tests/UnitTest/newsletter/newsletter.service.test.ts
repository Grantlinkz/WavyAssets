import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NewsletterService } from '../../../src/modules/newsletter/newsletter.service';
import { PrismaService } from '../../../src/modules/prisma/prisma.service';
import { CryptoService } from '../../../src/common/utils/crypto.service';
import { EmailService } from '../../../src/modules/auth/services/email.service';

describe('NewsletterService Unit Tests', () => {
  let newsletterService: NewsletterService;
  let mockPrisma: any;
  let mockCrypto: any;
  let mockEmail: any;
  let mockConfig: any;

  beforeEach(() => {
    mockPrisma = {
      newsletterSubscriber: {
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue({ id: 'sub-1' }),
        update: vi.fn().mockResolvedValue({ id: 'sub-1' }),
        delete: vi.fn().mockResolvedValue({ id: 'sub-1' }),
      },
    };

    mockCrypto = {
      generateRandomToken: vi.fn().mockReturnValue('mocknewslettertoken456'),
    };

    mockEmail = {
      sendNewsletterVerificationEmail: vi.fn().mockResolvedValue(true),
    };

    mockConfig = {
      get: vi.fn().mockReturnValue('http://localhost:5173'),
    };

    newsletterService = new NewsletterService(
      mockPrisma as PrismaService,
      mockCrypto as CryptoService,
      mockEmail as EmailService,
      mockConfig as ConfigService,
    );
  });

  it('should reject disposable emails for newsletter subscriptions', async () => {
    await expect(
      newsletterService.subscribe({ email: 'user@trashmail.com' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should initiate double opt-in subscription and dispatch verification email', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null);

    const result = await newsletterService.subscribe({ email: 'allocator@bern-capital.ch' });

    expect(result.isConfirmed).toBe(false);
    expect(mockPrisma.newsletterSubscriber.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'allocator@bern-capital.ch',
          verificationToken: 'mocknewslettertoken456',
          isConfirmed: false,
        }),
      }),
    );

    expect(mockEmail.sendNewsletterVerificationEmail).toHaveBeenCalledWith(
      'allocator@bern-capital.ch',
      'http://localhost:5173/newsletter/verify?token=mocknewslettertoken456',
    );
  });

  it('should confirm subscriber when valid token is provided', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({
      id: 'sub-1',
      email: 'allocator@bern-capital.ch',
      verificationToken: 'valid-token',
      isConfirmed: false,
    });

    const result = await newsletterService.verifySubscription('valid-token');

    expect(result.isConfirmed).toBe(true);
    expect(mockPrisma.newsletterSubscriber.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-1' },
        data: expect.objectContaining({
          isConfirmed: true,
          verificationToken: null,
        }),
      }),
    );
  });

  it('should throw NotFoundException on invalid verification token', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null);

    await expect(
      newsletterService.verifySubscription('invalid-token'),
    ).rejects.toThrow(NotFoundException);
  });
});
