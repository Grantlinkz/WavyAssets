import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../../common/utils/crypto.service';
import { TelegramService } from '../auth/services/telegram.service';
import { LeadInquiryDto, LeadInquiryResponseDto } from './dto/lead.dto';
import { maskEmail } from '../../common/interceptors/pii-redaction.interceptor';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'trashmail.com',
  'sharklasers.com',
  'yopmail.com',
  'dispostable.com',
  'getairmail.com',
  'throwawaymail.com',
  'temp-mail.org',
  'fakeinbox.com',
  'maildrop.cc',
]);

const FREE_EMAIL_PROVIDERS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
]);

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * Validates corporate email domain and calculates institutional domain score.
   */
  private evaluateDomain(email: string): { domain: string; score: number; isDisposable: boolean } {
    const domain = email.split('@')[1]?.toLowerCase().trim() || '';
    if (!domain) {
      return { domain: '', score: 0, isDisposable: true };
    }

    if (DISPOSABLE_DOMAINS.has(domain)) {
      return { domain, score: 0, isDisposable: true };
    }

    if (FREE_EMAIL_PROVIDERS.has(domain)) {
      return { domain, score: 0.5, isDisposable: false };
    }

    return { domain, score: 1.0, isDisposable: false };
  }

  /**
   * Ingests, validates, encrypts, and processes institutional mandate inquiries.
   */
  async processInquiry(
    dto: LeadInquiryDto,
    requesterIp = 'unknown',
  ): Promise<LeadInquiryResponseDto> {
    const normalizedEmail = dto.workEmail.toLowerCase().trim();
    const domainEval = this.evaluateDomain(normalizedEmail);

    if (domainEval.isDisposable) {
      this.logger.warn(`Rejected inquiry with disposable email domain: ${domainEval.domain}`);
      throw new BadRequestException(
        'Disposable or temporary email addresses are not permitted for institutional mandates',
      );
    }

    // Anti-spam Honeypot Check
    const isSpam = Boolean(dto.honeypot && dto.honeypot.trim().length > 0);
    if (isSpam) {
      this.logger.warn(`Honeypot triggered for inquiry submission from IP: ${requesterIp}`);
    }

    // Determine priority mandate tier
    const isPriority =
      dto.allocationRange === '$5M - $10M' ||
      dto.allocationRange === '$10M+' ||
      dto.allocationRange === 'CUSTOM';

    // AES-256-GCM Field-Level Encryption & Blind Index
    const fullNameEncrypted = this.crypto.encryptField(dto.fullName.trim());
    const workEmailEncrypted = this.crypto.encryptField(normalizedEmail);
    const workEmailHash = this.crypto.hashBlindIndex(normalizedEmail);
    const telegramEncrypted = dto.telegram?.trim()
      ? this.crypto.encryptField(dto.telegram.trim())
      : null;

    // Persist to Prisma LeadInquiry model
    const leadRecord = await this.prisma.leadInquiry.create({
      data: {
        fullNameEncrypted,
        workEmailEncrypted,
        workEmailHash,
        companyName: dto.companyName.trim(),
        websiteUrl: dto.websiteUrl?.trim() || null,
        telegramEncrypted,
        service: dto.service,
        allocationRange: dto.allocationRange,
        domainScore: domainEval.score,
        isSpam,
        crmDispatched: false,
      },
    });

    // Dual Notification for Priority Institutional Mandates
    if (isPriority && !isSpam) {
      try {
        const priorityAlert = `🏛️ [PRIORITY MANDATE] ${dto.companyName.trim()} submitted inquiry for ${dto.service} with allocation ${dto.allocationRange} (Domain: ${domainEval.domain}, Score: ${domainEval.score})`;
        await this.telegramService.sendSecurityAlert(priorityAlert);
        await this.prisma.leadInquiry.update({
          where: { id: leadRecord.id },
          data: { crmDispatched: true },
        });
      } catch (err) {
        this.logger.error('Failed to dispatch priority mandate alert to Telegram Enclave', err);
      }
    }

    this.logger.log(
      `Ingested institutional lead inquiry: ${leadRecord.id} [Priority: ${isPriority}, Spam: ${isSpam}, Email: ${maskEmail(normalizedEmail)}]`,
    );

    return {
      inquiryId: leadRecord.id,
      status: isPriority ? 'PRIORITY_REVIEW' : 'ACCEPTED',
      priority: isPriority,
      receivedAt: leadRecord.createdAt.toISOString(),
      message: isPriority
        ? 'Your institutional mandate inquiry has been prioritized and routed to executive custody partners.'
        : 'Your mandate inquiry has been safely ingested and queued for desk review.',
    };
  }
}
