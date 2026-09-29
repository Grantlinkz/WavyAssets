import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { UpdateInquiryStatusDto } from './dto/update-status.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

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
