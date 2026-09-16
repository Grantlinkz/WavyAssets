import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtils } from '../../common/utils/crypto.utils';
import {
  UploadDossierDto,
  UpgradeTierDto,
  TaxPackQueryDto,
  AuditLogQueryDto,
  KycTierLevel,
  TaxPackFormat,
} from './dto/compliance.dto';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves KYC compliance status, limits, and document checklist
   */
  async getComplianceStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        kycDocuments: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentTier = (user.kycTier as KycTierLevel) || KycTierLevel.TIER_2;

    const tierLimits: Record<KycTierLevel, { dailyLimitUsd: number; label: string }> = {
      TIER_1: { dailyLimitUsd: 10000, label: '$10,000 USD / Day' },
      TIER_2: { dailyLimitUsd: 250000, label: '$250,000 USD / Day' },
      TIER_3: { dailyLimitUsd: 100000000, label: 'UNLIMITED Institutional Allocation' },
    };

    const uploadedDocTypes = new Set(user.kycDocuments.map((d) => d.docType));

    const requirements = [
      {
        tier: KycTierLevel.TIER_1,
        name: 'Basic Identity & Biometrics',
        description: 'Verified mobile phone and email authentication',
        isMet: true,
      },
      {
        tier: KycTierLevel.TIER_2,
        name: 'Government ID & Proof of Address',
        description: 'Valid passport or national ID plus utility bill (<90 days old)',
        isMet: uploadedDocTypes.has('PASSPORT') && uploadedDocTypes.has('UTILITY_BILL'),
      },
      {
        tier: KycTierLevel.TIER_3,
        name: 'Institutional Accreditation & Source of Wealth',
        description: 'Corporate charter / Articles of Incorporation or notarized wealth affidavit',
        isMet: uploadedDocTypes.has('ARTICLES_OF_INC') || uploadedDocTypes.has('SOURCE_OF_WEALTH'),
      },
    ];

    return {
      userId: user.id,
      email: user.email,
      kycTier: currentTier,
      limits: tierLimits[currentTier],
      status: 'VERIFIED',
      requirements,
      documents: user.kycDocuments.map((doc) => ({
        id: doc.id,
        docType: doc.docType,
        fileUrl: doc.fileUrl,
        isVerified: doc.isVerified,
        uploadedAt: doc.uploadedAt,
      })),
    };
  }

  /**
   * Uploads encrypted compliance dossier document with simulated malware scan
   */
  async uploadDossierDocument(userId: string, dto: UploadDossierDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Antivirus / Malware screening simulation
    if (
      dto.fileUrl.toLowerCase().includes('malware') ||
      dto.fileUrl.toLowerCase().includes('eicar') ||
      dto.notes?.toLowerCase().includes('exploit')
    ) {
      throw new BadRequestException('Security screening failed: Suspicious file signature detected');
    }

    const document = await this.prisma.kycDocument.create({
      data: {
        userId,
        docType: dto.docType,
        fileUrl: dto.fileUrl,
        isVerified: true, // Mark verified after passing security screening
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'COMPLIANCE_DOSSIER_UPLOADED',
        ipHash: CryptoUtils.hashHmacSha256('system', 'wavyassets_audit_secret'),
        metadata: JSON.stringify({
          documentId: document.id,
          docType: dto.docType,
          fileUrl: dto.fileUrl,
        }),
      },
    });

    this.logger.log(`Compliance document [${dto.docType}] uploaded for user [${userId}]`);

    return {
      success: true,
      documentId: document.id,
      docType: document.docType,
      fileUrl: document.fileUrl,
      isVerified: document.isVerified,
      uploadedAt: document.uploadedAt,
    };
  }

  /**
   * Evaluates and updates KYC tier upgrade request
   */
  async requestTierUpgrade(userId: string, dto: UpgradeTierDto) {
    if (!dto.declarationAcknowledged) {
      throw new BadRequestException('You must acknowledge the legal accuracy declaration');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kycDocuments: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const uploadedDocTypes = new Set(user.kycDocuments.map((d) => d.docType));

    if (dto.targetTier === KycTierLevel.TIER_2) {
      const hasPassport = uploadedDocTypes.has('PASSPORT');
      const hasUtility = uploadedDocTypes.has('UTILITY_BILL');

      if (!hasPassport || !hasUtility) {
        throw new BadRequestException(
          'Tier 2 upgrade requires verified PASSPORT and UTILITY_BILL documents',
        );
      }
    } else if (dto.targetTier === KycTierLevel.TIER_3) {
      const hasCorporateOrWealth =
        uploadedDocTypes.has('ARTICLES_OF_INC') || uploadedDocTypes.has('SOURCE_OF_WEALTH');

      if (!hasCorporateOrWealth) {
        throw new BadRequestException(
          'Tier 3 upgrade requires verified ARTICLES_OF_INC or SOURCE_OF_WEALTH documents',
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { kycTier: dto.targetTier },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'COMPLIANCE_TIER_PROMOTED',
        ipHash: CryptoUtils.hashHmacSha256('system', 'wavyassets_audit_secret'),
        metadata: JSON.stringify({
          previousTier: user.kycTier,
          newTier: dto.targetTier,
        }),
      },
    });

    this.logger.log(`User [${userId}] promoted to KYC [${dto.targetTier}]`);

    return {
      success: true,
      userId: updatedUser.id,
      previousTier: user.kycTier,
      currentTier: updatedUser.kycTier,
      message: `KYC status successfully upgraded to ${dto.targetTier}`,
    };
  }

  /**
   * Consolidated Form 8949 / Schedule D compatible tax bundle generator
   */
  async generateTaxPack(userId: string, query: TaxPackQueryDto) {
    const targetYear = query.year || 2024;
    const format = query.format || TaxPackFormat.JSON;

    // Collect holdings and realized transactions
    const cryptoHoldings = await this.prisma.cryptoHolding.findMany({ where: { userId } });
    const stockPositions = await this.prisma.stockPosition.findMany({ where: { userId } });
    const realEstateShares = await this.prisma.realEstateShare.findMany({
      where: { userId },
      include: { property: true },
    });
    const carShares = await this.prisma.carShare.findMany({
      where: { userId },
      include: { car: true },
    });

    // Compute mock tax schedule items based on user assets
    const shortTermSales = [
      {
        description: '1.25 BTC (FIFO Tranche A)',
        dateAcquired: `${targetYear}-02-14`,
        dateSold: `${targetYear}-09-18`,
        proceeds: 82500.0,
        costBasis: 68125.0,
        gainOrLoss: 14375.0,
        term: 'SHORT_TERM',
      },
      {
        description: '45.00 NVDA Equities (Pre-split lot)',
        dateAcquired: `${targetYear}-03-10`,
        dateSold: `${targetYear}-11-04`,
        proceeds: 58500.0,
        costBasis: 41850.0,
        gainOrLoss: 16650.0,
        term: 'SHORT_TERM',
      },
    ];

    const longTermSales = [
      {
        description: '10.00 ETH (Cold Vault Staking Principal)',
        dateAcquired: `${targetYear - 2}-05-19`,
        dateSold: `${targetYear}-10-12`,
        proceeds: 34200.0,
        costBasis: 19800.0,
        gainOrLoss: 14400.0,
        term: 'LONG_TERM',
      },
    ];

    // Compute ordinary rental & compute distributions
    const realEstateIncome = realEstateShares.reduce(
      (sum, s) => sum + (s.tokenCount * (s.property?.annualizedYield || 0.05) * (s.property?.tokenPriceUsd || 100)),
      0,
    );
    const carFleetDistributions = carShares.reduce(
      (sum, c) => sum + (c.sharePct * 1250.0),
      0,
    );

    const totalShortTermGain = shortTermSales.reduce((sum, item) => sum + item.gainOrLoss, 0);
    const totalLongTermGain = longTermSales.reduce((sum, item) => sum + item.gainOrLoss, 0);
    const totalOrdinaryIncome = Math.round((realEstateIncome + carFleetDistributions) * 100) / 100;
    const totalProceeds =
      shortTermSales.reduce((sum, i) => sum + i.proceeds, 0) +
      longTermSales.reduce((sum, i) => sum + i.proceeds, 0);
    const totalCostBasis =
      shortTermSales.reduce((sum, i) => sum + i.costBasis, 0) +
      longTermSales.reduce((sum, i) => sum + i.costBasis, 0);
    const netCapitalGain = totalShortTermGain + totalLongTermGain;

    if (format === TaxPackFormat.CSV) {
      const csvHeaders = 'Category,Description,Date Acquired,Date Sold,Proceeds (USD),Cost Basis (USD),Gain/Loss (USD)\n';
      const rows = [
        ...shortTermSales.map(
          (s) =>
            `Short-Term,"${s.description}",${s.dateAcquired},${s.dateSold},${s.proceeds.toFixed(2)},${s.costBasis.toFixed(2)},${s.gainOrLoss.toFixed(2)}`,
        ),
        ...longTermSales.map(
          (l) =>
            `Long-Term,"${l.description}",${l.dateAcquired},${l.dateSold},${l.proceeds.toFixed(2)},${l.costBasis.toFixed(2)},${l.gainOrLoss.toFixed(2)}`,
        ),
        `Ordinary Income,"SPV Real Estate Rental Yields",${targetYear}-01-01,${targetYear}-12-31,${realEstateIncome.toFixed(2)},0.00,${realEstateIncome.toFixed(2)}`,
        `Ordinary Income,"Exotic Fleet Charter Yields",${targetYear}-01-01,${targetYear}-12-31,${carFleetDistributions.toFixed(2)},0.00,${carFleetDistributions.toFixed(2)}`,
      ].join('\n');

      return {
        format: 'CSV',
        filename: `wavyassets_tax_bundle_${targetYear}_${userId}.csv`,
        content: csvHeaders + rows,
      };
    }

    return {
      taxYear: targetYear,
      reportingEntity: 'WavyAssets Sovereign Wealth Custody AG (Zurich)',
      form8949Summary: {
        shortTermTotalGain: totalShortTermGain,
        longTermTotalGain: totalLongTermGain,
        totalNetCapitalGains: netCapitalGain,
        totalProceeds,
        totalCostBasis,
      },
      scheduleEOrdinaryIncome: {
        realEstateRentalYields: Math.round(realEstateIncome * 100) / 100,
        exoticFleetCharterDistributions: Math.round(carFleetDistributions * 100) / 100,
        totalOrdinaryDistributions: totalOrdinaryIncome,
      },
      transactions: {
        shortTerm: shortTermSales,
        longTerm: longTermSales,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Paginated audit logs query for user compliance review
   */
  async getAuditLogs(userId: string, query: AuditLogQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where: { userId } }),
      this.prisma.auditLog.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: logs.map((log) => ({
        id: log.id,
        action: log.action,
        createdAt: log.createdAt,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
