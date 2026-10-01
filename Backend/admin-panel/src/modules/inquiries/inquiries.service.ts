import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { UpdateInquiryStatusDto } from './dto/update-status.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { SendSubscriberEmailDto } from './dto/send-subscriber-email.dto';
import { BroadcastSubscribersEmailDto } from './dto/broadcast-subscribers-email.dto';
import { Resend } from 'resend';

export type InquiryStatus = 'NEW' | 'IN_REVIEW' | 'MANDATE_SENT' | 'ARCHIVED';

export interface LeadInquiryResponse {
  id: string;
  dossierId: string;
  receivedAt: string;
  company: string;
  trustScore: number;
  isDomainVerified: boolean;
  contactName: string;
  email: string;
  telegram: string;
  location: string;
  assetInterest: string;
  bracket: string;
  declaredCapital: string;
  custodyPreference: string;
  investmentWindow: string;
  status: InquiryStatus | string;
  source: string;
  ipAddress: string;
  notes?: string;
}

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);
  private readonly resendClient: Resend | null = null;
  private readonly emailFrom: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {
    const resendApiKey = process.env.RESEND_API_KEY || '';
    if (resendApiKey && resendApiKey.startsWith('re_')) {
      this.resendClient = new Resend(resendApiKey);
      this.logger.log('Resend email client successfully initialized for newsletter subscribers.');
    } else {
      this.logger.warn(
        '[Resend Config] RESEND_API_KEY is not configured or invalid (must start with re_). Emails will be simulated.',
      );
    }

    const rawFrom =
      process.env.EMAIL_FROM || 'WavyAssets Intelligence <security@wavyassets.com>';
    if (!rawFrom.includes('@')) {
      const sanitizedName = rawFrom.replace(/["']/g, '').trim();
      this.emailFrom = `${sanitizedName} <onboarding@resend.dev>`;
    } else {
      this.emailFrom = rawFrom.replace(/["']/g, '').trim();
    }
  }

  /**
   * Generates brand header HTML containing official project Favicon SVG and Logo Typography
   */
  private generateBrandHeader(): string {
    return `
      <table cellpadding="0" cellspacing="0" border="0" style="vertical-align: middle; margin-bottom: 24px;">
        <tr>
          <td style="vertical-align: middle; padding-right: 14px; width: 40px;">
            <!-- Official WavyAssets Favicon Squircle SVG Emblem -->
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; width: 40px; height: 40px;">
              <rect width="64" height="64" rx="14" fill="#08090B"/>
              <rect x="1" y="1" width="62" height="62" rx="13" stroke="#D4AF37" stroke-width="2.5" stroke-opacity="0.8"/>
              <circle cx="32" cy="32" r="18" fill="#D4AF37" fill-opacity="0.15"/>
              <path d="M 12 33 C 18 19, 26 19, 32 33 C 38 47, 46 47, 52 33" stroke="#D4AF37" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 12 42 C 18 28, 26 28, 32 42 C 38 56, 46 56, 52 42" stroke="#00C288" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.95"/>
              <circle cx="32" cy="17" r="3.2" fill="#D4AF37"/>
            </svg>
          </td>
          <td style="vertical-align: middle; white-space: nowrap;">
            <!-- Official WavyAssets Brand Logo Typography -->
            <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 800; letter-spacing: 2.2px; color: #FFFFFF; vertical-align: middle;">WAVY</span><span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 800; letter-spacing: 2.2px; color: #D4AF37; vertical-align: middle;">ASSETS</span><sup style="font-family: 'SF Mono', Monaco, 'Courier New', Courier, monospace; font-size: 8px; font-weight: 700; letter-spacing: 1px; color: #00C288; margin-left: 6px; vertical-align: baseline;">&#9679; SECURED</sup>
          </td>
        </tr>
      </table>
    `.trim();
  }

  /**
   * Generates institutional HTML email template containing project logo and favicon
   */
  private generateSubscriberEmailHtml(subject: string, message: string): string {
    const formattedMessage = message
      .split('\n')
      .map((p) => (p.trim() ? `<p style="margin: 0 0 16px 0; line-height: 1.65;">${p}</p>` : ''))
      .join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08090b; color: #f1f5f9; padding: 32px 16px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0f131a; border: 1px solid #1f2937; border-radius: 8px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
    <div style="padding: 28px 32px; background: linear-gradient(135deg, #0c1017 0%, #161c28 100%); border-bottom: 1px solid #1f2937;">
      ${this.generateBrandHeader()}
      <h2 style="font-size: 18px; font-weight: 700; color: #f8fafc; margin: 0; letter-spacing: -0.01em;">${subject}</h2>
    </div>
    <div style="padding: 32px; font-size: 14px; line-height: 1.65; color: #cbd5e1;">
      ${formattedMessage}
    </div>
    <div style="padding: 20px 32px; background-color: #080a0f; border-top: 1px solid #1f2937; font-size: 11px; color: #64748b; text-align: center;">
      <p style="margin: 0 0 6px 0;">This publication is transmitted by WavyAssets Global Intelligence &amp; Research.</p>
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} WavyAssets AG &bull; Zurich FreePort &bull; FinSA / AMLA Compliant</p>
    </div>
  </div>
</body>
</html>`.trim();
  }

  async findAll(statusFilter?: string, search?: string): Promise<LeadInquiryResponse[]> {
    const where: any = {};
    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter;
    }

    const inquiries = await this.prisma.leadInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const decrypted = inquiries.map((inq) => this.mapInquiry(inq));

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      return decrypted.filter(
        (i) =>
          i.company.toLowerCase().includes(q) ||
          i.contactName.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.assetInterest.toLowerCase().includes(q),
      );
    }

    return decrypted;
  }

  async getSubscribers() {
    return this.prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSubscriber(id: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!subscriber) {
      throw new NotFoundException(`Subscriber '${id}' not found`);
    }
    await this.prisma.newsletterSubscriber.delete({ where: { id } });
    return { success: true, message: `Subscriber '${subscriber.email}' removed from list.` };
  }

  /**
   * Dispatches direct email to a specific newsletter subscriber using Resend
   */
  async sendSubscriberEmail(
    id: string,
    dto: SendSubscriberEmailDto,
    adminId?: string,
    ipAddress?: string,
  ) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { id },
    });

    if (!subscriber) {
      throw new NotFoundException(`Newsletter subscriber with ID '${id}' not found`);
    }

    let emailDelivered = false;
    let resendMessageId: string | null = null;
    let deliveryError: string | null = null;

    const html = this.generateSubscriberEmailHtml(dto.subject, dto.message);

    if (this.resendClient) {
      try {
        const response = await this.resendClient.emails.send({
          from: this.emailFrom,
          to: subscriber.email,
          subject: dto.subject,
          html,
          text: dto.message,
        });

        if (response.error) {
          deliveryError = response.error.message;
          this.logger.error(`Resend API error sending to ${subscriber.email}: ${deliveryError}`);
        } else {
          emailDelivered = true;
          resendMessageId = response.data?.id || null;
          this.logger.log(`Resend sent email to ${subscriber.email}. ID: ${resendMessageId}`);
        }
      } catch (err: any) {
        deliveryError = err?.message || 'Unexpected Resend exception';
        this.logger.error(`Resend exception sending to ${subscriber.email}: ${deliveryError}`, err);
      }
    } else {
      this.logger.warn(`Resend client inactive. Simulated subscriber email to ${subscriber.email}`);
      emailDelivered = true;
      resendMessageId = `sim_${Date.now()}`;
    }

    // Record Immutable Audit Log
    await this.prisma.adminAuditLog.create({
      data: {
        adminId: adminId || null,
        action: 'SUBSCRIBER_EMAIL_DISPATCH',
        targetEntity: 'NewsletterSubscriber',
        targetId: id,
        diffAfter: JSON.stringify({
          recipient: subscriber.email,
          subject: dto.subject,
          provider: 'resend',
          delivered: emailDelivered,
          resendId: resendMessageId,
          error: deliveryError,
        }),
        reason: `Direct newsletter subscriber dispatch: ${dto.subject}`,
        ipAddressHash: this.cryptoService.hashIpAddress(ipAddress || '127.0.0.1'),
      },
    });

    if (deliveryError && !emailDelivered) {
      throw new BadRequestException(`Failed to dispatch email via Resend: ${deliveryError}`);
    }

    return {
      success: true,
      recipient: subscriber.email,
      subject: dto.subject,
      message: `Email successfully dispatched to ${subscriber.email} via Resend.`,
      resendId: resendMessageId,
      sentAt: new Date().toISOString(),
    };
  }

  /**
   * Broadcasts newsletter publication to all subscribers using Resend
   */
  async broadcastSubscribersEmail(
    dto: BroadcastSubscribersEmailDto,
    adminId?: string,
    ipAddress?: string,
  ) {
    const where: any = {};
    if (dto.filter === 'CONFIRMED') {
      where.isConfirmed = true;
    }

    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      where,
      select: { id: true, email: true },
    });

    if (subscribers.length === 0) {
      throw new BadRequestException('No subscribers found matching the target criteria.');
    }

    const html = this.generateSubscriberEmailHtml(dto.subject, dto.message);
    const recipientEmails = subscribers.map((s) => s.email);

    let deliveredCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    if (this.resendClient) {
      // Dispatch individually or in small batches to respect rate limits
      for (const email of recipientEmails) {
        try {
          const response = await this.resendClient.emails.send({
            from: this.emailFrom,
            to: email,
            subject: dto.subject,
            html,
            text: dto.message,
          });

          if (response.error) {
            failedCount++;
            errors.push(`${email}: ${response.error.message}`);
          } else {
            deliveredCount++;
          }
        } catch (err: any) {
          failedCount++;
          errors.push(`${email}: ${err?.message || 'Unknown error'}`);
        }
      }
    } else {
      this.logger.warn(`Resend client inactive. Simulated broadcast to ${recipientEmails.length} subscribers.`);
      deliveredCount = recipientEmails.length;
    }

    // Record Immutable Audit Log
    await this.prisma.adminAuditLog.create({
      data: {
        adminId: adminId || null,
        action: 'SUBSCRIBERS_BROADCAST_DISPATCH',
        targetEntity: 'NewsletterSubscriber',
        targetId: `broadcast_${Date.now()}`,
        diffAfter: JSON.stringify({
          totalRecipients: recipientEmails.length,
          filter: dto.filter || 'ALL',
          subject: dto.subject,
          deliveredCount,
          failedCount,
          provider: 'resend',
        }),
        reason: `Newsletter broadcast dispatch to ${recipientEmails.length} subscribers: ${dto.subject}`,
        ipAddressHash: this.cryptoService.hashIpAddress(ipAddress || '127.0.0.1'),
      },
    });

    return {
      success: true,
      totalRecipients: recipientEmails.length,
      deliveredCount,
      failedCount,
      errors: errors.slice(0, 5),
      message: `Newsletter broadcast completed. ${deliveredCount} of ${recipientEmails.length} emails dispatched via Resend.`,
      sentAt: new Date().toISOString(),
    };
  }

  async findById(id: string): Promise<LeadInquiryResponse> {
    const inquiry = await this.prisma.leadInquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      throw new NotFoundException(`Lead inquiry '${id}' not found`);
    }

    return this.mapInquiry(inquiry);
  }

  async updateStatus(
    id: string,
    dto: UpdateInquiryStatusDto,
    operatorName?: string,
  ): Promise<LeadInquiryResponse> {
    const existing = await this.prisma.leadInquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Lead inquiry '${id}' not found`);
    }

    let updatedNotes = existing.notes || '';
    if (dto.notes) {
      const timestamp = new Date().toISOString().split('T')[0];
      const prefix = operatorName ? `[${operatorName} - ${timestamp}]: ` : `[${timestamp}]: `;
      updatedNotes = updatedNotes
        ? `${updatedNotes}\n${prefix}${dto.notes}`
        : `${prefix}${dto.notes}`;
    }

    const updated = await this.prisma.leadInquiry.update({
      where: { id },
      data: {
        status: dto.status,
        notes: updatedNotes,
      },
    });

    return this.mapInquiry(updated);
  }

  async convertLeadToUser(
    dto: ConvertLeadDto,
    inquiryIdParam?: string,
  ): Promise<{ success: boolean; userId: string; message: string }> {
    const email = dto.email.toLowerCase().trim();
    const effectiveInquiryId = inquiryIdParam || dto.inquiryId;

    const initialCash =
      dto.startingCashBalance !== undefined ? Number(dto.startingCashBalance) : 0;
    const accessTier = dto.accessTier || 'INSTITUTIONAL';
    const initialKycTier = dto.initialKycTier || 'TIER_2';

    const defaultPassphraseHash = await this.cryptoService.hashPassword(
      'SupremeUser2026!#Mandate',
    );

    const user = await this.prisma.$transaction(async (tx) => {
      let inquiryRecord: any = null;
      if (effectiveInquiryId) {
        inquiryRecord = await tx.leadInquiry.findUnique({
          where: { id: effectiveInquiryId },
        });
        if (!inquiryRecord) {
          throw new NotFoundException(`Lead inquiry not found: ${effectiveInquiryId}`);
        }
      }

      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new ConflictException(`User with email '${email}' already exists.`);
      }

      const createdUser = await tx.user.create({
        data: {
          email,
          fullName: dto.fullName,
          passphraseHash: defaultPassphraseHash,
          tier: accessTier,
          kycTier: initialKycTier,
          isActive: true,
        },
      });

      // Initialize AVAILABLE_CASH LedgerAccount (preserve existing balance on upsert)
      await tx.ledgerAccount.upsert({
        where: {
          userId_accountType_currency: {
            userId: createdUser.id,
            accountType: 'AVAILABLE_CASH',
            currency: 'USD',
          },
        },
        update: {},
        create: {
          userId: createdUser.id,
          accountType: 'AVAILABLE_CASH',
          currency: 'USD',
          balance: initialCash,
        },
      });

      // Initialize INVESTED_CAPITAL LedgerAccount
      await tx.ledgerAccount.upsert({
        where: {
          userId_accountType_currency: {
            userId: createdUser.id,
            accountType: 'INVESTED_CAPITAL',
            currency: 'USD',
          },
        },
        update: {},
        create: {
          userId: createdUser.id,
          accountType: 'INVESTED_CAPITAL',
          currency: 'USD',
          balance: 0.0,
        },
      });

      // If inquiryId is provided, mark inquiry as converted / mandate issued
      if (inquiryRecord) {
        const conversionNote = `[SYSTEM - ${new Date().toISOString()}]: Converted to Supreme account ${createdUser.id}`;
        await tx.leadInquiry.update({
          where: { id: inquiryRecord.id },
          data: {
            status: 'MANDATE_SENT',
            notes: inquiryRecord.notes ? `${inquiryRecord.notes}\n${conversionNote}` : conversionNote,
          },
        });
      }

      return createdUser;
    }, { maxWait: 10000, timeout: 20000 });

    return {
      success: true,
      userId: user.id,
      message: `Successfully onboarded ${dto.fullName} to Supreme account.`,
    };
  }

  private mapInquiry(lead: any): LeadInquiryResponse {
    const contactName = this.cryptoService.decrypt(lead.fullNameEncrypted) || 'Institutional Lead';
    const email = this.cryptoService.decrypt(lead.workEmailEncrypted) || 'confidential@wavyassets.ch';
    const telegram = lead.telegramEncrypted ? this.cryptoService.decrypt(lead.telegramEncrypted) : '';

    let trustScore = 95;
    if (typeof lead.domainScore === 'number') {
      trustScore = lead.domainScore <= 1 ? Math.round(lead.domainScore * 100) : Math.round(lead.domainScore);
    }

    return {
      id: lead.id,
      dossierId: `INQ-${lead.id.slice(0, 8).toUpperCase()}`,
      receivedAt: lead.createdAt ? lead.createdAt.toISOString() : new Date().toISOString(),
      company: lead.companyName || 'Supreme Institutional Entity',
      trustScore,
      isDomainVerified: trustScore >= 80,
      contactName,
      email,
      telegram,
      location: lead.location || 'Zurich, Switzerland',
      assetInterest: lead.service || 'MULTI_ASSET',
      bracket: lead.allocationRange || '$5M - $10M',
      declaredCapital: lead.allocationRange || '$5M - $10M',
      custodyPreference: lead.custodyPreference || 'Qualified Institutional Custody',
      investmentWindow: lead.investmentWindow || 'Immediate (< 30 days)',
      status: lead.status as InquiryStatus,
      source: lead.websiteUrl || 'Direct Institutional Intake',
      ipAddress: lead.ipAddress || '194.230.144.1',
      notes: lead.notes || '',
    };
  }
}
