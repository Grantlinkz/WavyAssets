import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  Optional,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { WalletService } from '../wallet/wallet.service';
import { PortfolioGateway } from '../websocket/portfolio.gateway';
import { DashboardService } from '../dashboard/dashboard.service';
import {
  ExecuteOtcOrderDto,
  PropertyItemResponse,
  RentalDistributionsResponse,
  OccupancyResponse,
  OtcOrderResponse,
  PresignedDocumentResponse,
} from './dto/real-estate.dto';
import { createHmac, randomUUID } from 'crypto';

@Injectable()
export class RealEstateService {
  private readonly logger = new Logger(RealEstateService.name);
  private readonly HMAC_SECRET: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    @Optional() private readonly configService?: ConfigService,
    @Optional() @Inject(PortfolioGateway) private readonly portfolioGateway?: PortfolioGateway,
    @Optional() @Inject(DashboardService) private readonly dashboardService?: DashboardService,
  ) {
    const secret =
      this.configService?.get<string>('DOCUMENT_HMAC_SECRET') ||
      process.env.DOCUMENT_HMAC_SECRET;
    if (!secret || secret.trim() === '') {
      throw new Error('DOCUMENT_HMAC_SECRET is mandatory and must not be empty');
    }
    this.HMAC_SECRET = secret;
  }

  /**
   * Fractional prime real estate property catalog with user equity positions
   */
  async getProperties(userId: string): Promise<PropertyItemResponse[]> {
    let properties = await this.prisma.realEstateProperty.findMany({
      include: {
        shares: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Seed default properties if catalog is empty
    if (properties.length === 0) {
      const defaultProps = [
        {
          id: 'prop-zurich-prime-001',
          title: 'Zurich Prime Financial Commercial Center',
          region: 'SWITZERLAND',
          totalValuation: 45000000.0,
          totalTokens: 100000,
          tokenPriceUsd: 450.0,
          annualizedYield: 8.4,
          occupancyRate: 98.5,
          spvContractUrl: 'https://docs.wavyassets.com/spv/zurich-prime-001.pdf',
        },
        {
          id: 'prop-mayfair-res-002',
          title: 'Mayfair Global Luxury Residences',
          region: 'UNITED KINGDOM',
          totalValuation: 62000000.0,
          totalTokens: 124000,
          tokenPriceUsd: 500.0,
          annualizedYield: 7.2,
          occupancyRate: 96.0,
          spvContractUrl: 'https://docs.wavyassets.com/spv/mayfair-002.pdf',
        },
      ];

      for (const p of defaultProps) {
        await this.prisma.realEstateProperty.upsert({
          where: { id: p.id },
          update: {},
          create: p,
        });
      }

      properties = await this.prisma.realEstateProperty.findMany({
        include: {
          shares: {
            where: { userId },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return properties.map((prop) => {
      const share = prop.shares[0];
      const tokenCount = share ? share.tokenCount : 0;
      const equityUsd = Number((tokenCount * prop.tokenPriceUsd).toFixed(2));
      const ownershipPct =
        prop.totalTokens > 0
          ? Number(((tokenCount / prop.totalTokens) * 100).toFixed(2))
          : 0.0;

      return {
        id: prop.id,
        title: prop.title,
        region: prop.region,
        totalValuation: prop.totalValuation,
        totalTokens: prop.totalTokens,
        tokenPriceUsd: prop.tokenPriceUsd,
        annualizedYield: prop.annualizedYield,
        occupancyRate: prop.occupancyRate,
        spvContractUrl: prop.spvContractUrl,
        userHolding: {
          tokenCount,
          equityUsd,
          ownershipPct,
        },
        valuationHistory: [
          { year: 2022, valuation: Number((prop.totalValuation * 0.88).toFixed(0)) },
          { year: 2023, valuation: Number((prop.totalValuation * 0.94).toFixed(0)) },
          { year: 2024, valuation: Number((prop.totalValuation * 0.98).toFixed(0)) },
          { year: 2025, valuation: prop.totalValuation },
        ],
      };
    });
  }

  /**
   * Rental yield distributions and dividend history
   */
  async getRentalDistributions(userId: string): Promise<RentalDistributionsResponse> {
    const properties = await this.getProperties(userId);

    let totalEquity = 0;
    let weightedAnnualYield = 0;

    for (const prop of properties) {
      if (prop.userHolding.equityUsd > 0) {
        totalEquity += prop.userHolding.equityUsd;
        weightedAnnualYield += prop.userHolding.equityUsd * (prop.annualizedYield / 100);
      }
    }

    const projectedAnnualYieldUsd = Number(weightedAnnualYield.toFixed(2));
    const monthlyPayoutUsd = Number((projectedAnnualYieldUsd / 12).toFixed(2));
    const accruedUnpaidDividendsUsd = Number((monthlyPayoutUsd * 0.82).toFixed(2));

    const now = new Date();
    const nextPayout = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    if (nextPayout.getUTCDay() === 6) {
      nextPayout.setUTCDate(nextPayout.getUTCDate() + 2);
    } else if (nextPayout.getUTCDay() === 0) {
      nextPayout.setUTCDate(nextPayout.getUTCDate() + 1);
    }

    return {
      projectedAnnualYieldUsd,
      monthlyPayoutUsd,
      accruedUnpaidDividendsUsd,
      distributionCadence: 'MONTHLY_FIRST_BUSINESS_DAY',
      nextPayoutDate: nextPayout.toISOString().split('T')[0],
      distributionHistory: [
        {
          id: 'rent-dist-2026-08',
          propertyTitle: 'Zurich Prime Financial Commercial Center',
          amountUsd: Number((monthlyPayoutUsd * 0.65).toFixed(2)),
          payoutDate: '2026-08-01',
          status: 'SETTLED',
        },
        {
          id: 'rent-dist-2026-07',
          propertyTitle: 'Zurich Prime Financial Commercial Center',
          amountUsd: Number((monthlyPayoutUsd * 0.65).toFixed(2)),
          payoutDate: '2026-07-01',
          status: 'SETTLED',
        },
      ],
    };
  }

  /**
   * Portfolio tenant occupancy profiles and lease terms
   */
  async getOccupancy(): Promise<OccupancyResponse> {
    return {
      portfolioOccupancyPct: 97.4,
      waultYears: 6.8,
      totalTenants: 14,
      tenants: [
        {
          propertyTitle: 'Zurich Prime Financial Commercial Center',
          tenantName: 'UBS Global Asset Management AG',
          sector: 'Wealth Management & Private Banking',
          leaseExpiry: '2033-12-31',
          occupancySharePct: 42.5,
          slaPerformancePct: 99.8,
        },
        {
          propertyTitle: 'Zurich Prime Financial Commercial Center',
          tenantName: 'Swiss Re Financial Products Ltd',
          sector: 'Reinsurance & Risk Underwriting',
          leaseExpiry: '2031-06-30',
          occupancySharePct: 35.0,
          slaPerformancePct: 99.4,
        },
        {
          propertyTitle: 'Mayfair Global Luxury Residences',
          tenantName: 'Mayfair Diplomatic Mission Services',
          sector: 'Institutional Consular Office',
          leaseExpiry: '2030-09-30',
          occupancySharePct: 48.0,
          slaPerformancePct: 100.0,
        },
      ],
    };
  }

  /**
   * Secondary P2P OTC Order Book
   */
  async getOtcOrders(): Promise<OtcOrderResponse[]> {
    let orders = await this.prisma.realEstateOtcOrder.findMany({
      where: { status: 'OPEN' },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });

    if (orders.length === 0) {
      const prop = await this.prisma.realEstateProperty.findFirst();
      if (prop) {
        await this.prisma.realEstateOtcOrder.createMany({
          data: [
            {
              propertyId: prop.id,
              orderType: 'OFFER',
              tokenAmount: 150,
              pricePerToken: 445.0,
              status: 'OPEN',
            },
            {
              propertyId: prop.id,
              orderType: 'BID',
              tokenAmount: 200,
              pricePerToken: 440.0,
              status: 'OPEN',
            },
          ],
        });

        orders = await this.prisma.realEstateOtcOrder.findMany({
          where: { status: 'OPEN' },
          include: { property: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    }

    return orders.map((order) => {
      const totalOrderValueUsd = Number((order.tokenAmount * order.pricePerToken).toFixed(2));
      const baselinePrice = order.property?.tokenPriceUsd || order.pricePerToken;
      const yieldSpreadBps = Number(
        (((order.pricePerToken - baselinePrice) / baselinePrice) * 10000).toFixed(0),
      );

      return {
        id: order.id,
        propertyId: order.propertyId,
        propertyTitle: order.property?.title || 'Unknown Property',
        orderType: order.orderType as 'BID' | 'OFFER',
        tokenAmount: order.tokenAmount,
        pricePerToken: order.pricePerToken,
        totalOrderValueUsd,
        yieldSpreadBps,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      };
    });
  }

  /**
   * Executes secondary market share transfer with atomic double-entry ledger settlement
   */
  async executeOtcOrder(userId: string, orderId: string, _dto?: ExecuteOtcOrderDto) {
    const order = await this.prisma.realEstateOtcOrder.findUnique({
      where: { id: orderId },
      include: { property: true },
    });

    if (!order) {
      throw new NotFoundException(`OTC Order with ID ${orderId} not found`);
    }

    if (order.status !== 'OPEN') {
      throw new ConflictException(`OTC Order ${orderId} is no longer active (status: ${order.status})`);
    }

    const totalCost = Number((order.tokenAmount * order.pricePerToken).toFixed(2));
    const txRefId = `otc-re-${orderId}`;

    await this.prisma.$transaction(async (tx) => {
      // Atomically claim OPEN order to prevent concurrent duplicate settlement
      const claimResult = await tx.realEstateOtcOrder.updateMany({
        where: { id: orderId, status: 'OPEN' },
        data: { status: 'FILLED' },
      });

      if (claimResult.count === 0) {
        throw new ConflictException(`OTC Order ${orderId} is no longer active (status: ${order.status})`);
      }

      // Ledger settlement: buyer pays, seller/escrow receives
      const userAccount = await this.walletService.getOrCreateAccount(userId, 'AVAILABLE_CASH', 'USD', tx);
      const clearingAccount = await this.walletService.getOrCreateAccount('ESCROW_VAULT', 'INVESTED_CAPITAL', 'USD', tx);

      if (order.orderType === 'OFFER') {
        // User is BUYING tokens
        await this.walletService.recordLedgerTransaction(
          {
            referenceId: txRefId,
            type: 'TRADE',
            description: `OTC Real Estate Share Purchase: ${order.tokenAmount} tokens of ${order.property?.title}`,
            entries: [
              { accountId: userAccount.id, amount: -totalCost },
              { accountId: clearingAccount.id, amount: totalCost },
            ],
          },
          tx,
        );

        // Transfer / Upsert RealEstateShare
        const existingShare = await tx.realEstateShare.findFirst({
          where: { userId, propertyId: order.propertyId },
        });

        if (existingShare) {
          await tx.realEstateShare.update({
            where: { id: existingShare.id },
            data: { tokenCount: { increment: order.tokenAmount } },
          });
        } else {
          await tx.realEstateShare.create({
            data: {
              userId,
              propertyId: order.propertyId,
              tokenCount: order.tokenAmount,
            },
          });
        }
      } else {
        // User is SELLING tokens (order is BID)
        const userShare = await tx.realEstateShare.findFirst({
          where: { userId, propertyId: order.propertyId },
        });

        if (!userShare || userShare.tokenCount < order.tokenAmount) {
          throw new BadRequestException(
            `Insufficient shares owned. Required: ${order.tokenAmount}, Available: ${userShare?.tokenCount || 0}`,
          );
        }

        await this.walletService.recordLedgerTransaction(
          {
            referenceId: txRefId,
            type: 'TRADE',
            description: `OTC Real Estate Share Liquidation: ${order.tokenAmount} tokens of ${order.property?.title}`,
            entries: [
              { accountId: userAccount.id, amount: totalCost },
              { accountId: clearingAccount.id, amount: -totalCost },
            ],
          },
          tx,
        );

        await tx.realEstateShare.update({
          where: { id: userShare.id },
          data: { tokenCount: { decrement: order.tokenAmount } },
        });
      }
    });

    this.logger.log(
      `OTC Order [${orderId}] filled by user [${userId}]. Total settlement: $${totalCost} USD. TxRef: [${txRefId}]`,
    );

    if (this.dashboardService) {
      this.dashboardService.invalidateCache(userId);
    }
    if (this.portfolioGateway) {
      this.portfolioGateway.broadcastAllocationRebalanced(userId, {
        trigger: 'REAL_ESTATE_OTC_EXECUTED',
        assetId: 'real-estate',
      });
    }

    return {
      success: true,
      orderId: order.id,
      propertyTitle: order.property?.title,
      orderType: order.orderType,
      tokensTransferred: order.tokenAmount,
      pricePerTokenUsd: order.pricePerToken,
      totalSettlementUsd: totalCost,
      status: 'FILLED',
      txReferenceId: txRefId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Pre-signed secure document vault URL generation
   * Inviolable Invariant: 900-second expiration with  signature
   */
  async getPresignedDocumentUrl(userId: string, docId: string): Promise<PresignedDocumentResponse> {
    const validDocs: Record<string, { title: string; docType: string; mimeType: string }> = {
      'spv-zurich-deed-001': {
        title: 'Zurich Prime Commercial SPV Notarized Title Deed & Land Registry Extract',
        docType: 'DEED_OF_TRUST',
        mimeType: 'application/pdf',
      },
      'spv-mayfair-appraisal-002': {
        title: 'Mayfair Global Luxury Residences Independent Savills RICS Appraisal',
        docType: 'RICS_APPRAISAL',
        mimeType: 'application/pdf',
      },
      'spv-tax-audit-2025': {
        title: 'Annual SPV KPMG Audit & Fiscal Dossier 2025',
        docType: 'AUDIT_DOSSIER',
        mimeType: 'application/pdf',
      },
    };

    const doc = validDocs[docId];
    if (!doc) {
      throw new NotFoundException(`Document with ID ${docId} not found`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found or unauthorized`);
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 900; // 15 minutes
    const payload = `${docId}:${userId}:${expiresAt}`;
    const signature = createHmac('sha256', this.HMAC_SECRET).update(payload).digest('hex');

    const downloadUrl = `https://vault.wavyassets.com/api/v1/documents/${docId}/download?userId=${userId}&expires=${expiresAt}&sig=${signature}`;

    return {
      docId,
      title: doc.title,
      documentType: doc.docType,
      downloadUrl,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      signature,
      mimeType: doc.mimeType,
    };
  }

  /**
   * Verifies an HMAC signature on a document vault download request
   */
  verifyDocumentSignature(docId: string, userId: string, expiresAt: number, signature: string): boolean {
    const now = Math.floor(Date.now() / 1000);
    if (now > expiresAt) {
      return false; // Expired
    }

    const payload = `${docId}:${userId}:${expiresAt}`;
    const expected = createHmac('sha256', this.HMAC_SECRET).update(payload).digest('hex');
    return expected === signature;
  }

  /**
   * Buy fractional real estate property tokens and debit ledger
   */
  async buyProperty(userId: string, dto: { propertyId: string; tokens: number; tokenPrice?: number }) {
    if (!dto.tokens || dto.tokens <= 0) {
      throw new BadRequestException('Tokens to acquire must be positive.');
    }

    const property = await this.prisma.realEstateProperty.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException(`Real estate property ${dto.propertyId} not found`);
    }

    const tokenPrice = property.tokenPriceUsd;
    const totalCost = dto.tokens * tokenPrice;
    const cashAccount = await this.walletService.getOrCreateAccount(userId, 'AVAILABLE_CASH', 'USD');
    const currentBalance = Number(cashAccount.balance);

    if (currentBalance < totalCost) {
      throw new BadRequestException(
        `Insufficient Account Balance ($${currentBalance}) to purchase ${dto.tokens} property tokens ($${totalCost}).`
      );
    }

    const investedAccount = await this.walletService.getOrCreateAccount(userId, 'INVESTED_CAPITAL', 'USD');
    await this.walletService.recordLedgerTransaction({
      type: 'TRADE',
      description: `Real Estate Fractional Share Acquisition: ${dto.propertyId} (${dto.tokens} tokens @ $${tokenPrice})`,
      entries: [
        { accountId: cashAccount.id, amount: -totalCost },
        { accountId: investedAccount.id, amount: totalCost },
      ],
    });

    let share = await this.prisma.realEstateShare.findFirst({
      where: { userId, propertyId: dto.propertyId },
    });

    if (!share) {
      share = await this.prisma.realEstateShare.create({
        data: {
          userId,
          propertyId: dto.propertyId,
          tokenCount: dto.tokens,
        },
      });
    } else {
      share = await this.prisma.realEstateShare.update({
        where: { id: share.id },
        data: {
          tokenCount: share.tokenCount + dto.tokens,
        },
      });
    }

    this.dashboardService?.invalidateCache(userId);
    return {
      success: true,
      share,
      totalCost,
    };
  }

  /**
   * Sell fractional real estate property tokens and credit ledger
   */
  async sellProperty(userId: string, dto: { propertyId: string; tokensToSell: number; pricePerToken?: number }) {
    if (!dto.tokensToSell || dto.tokensToSell <= 0) {
      throw new BadRequestException('Tokens to sell must be positive.');
    }

    const property = await this.prisma.realEstateProperty.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException(`Real estate property ${dto.propertyId} not found`);
    }

    const share = await this.prisma.realEstateShare.findFirst({
      where: { userId, propertyId: dto.propertyId },
    });

    if (!share || share.tokenCount < dto.tokensToSell) {
      throw new BadRequestException('Insufficient property shares to sell.');
    }

    const resolvedPrice = property.tokenPriceUsd;
    const proceeds = dto.tokensToSell * resolvedPrice;

    const cashAccount = await this.walletService.getOrCreateAccount(userId, 'AVAILABLE_CASH', 'USD');
    const investedAccount = await this.walletService.getOrCreateAccount(userId, 'INVESTED_CAPITAL', 'USD');

    await this.walletService.recordLedgerTransaction({
      type: 'TRADE',
      description: `Real Estate Fractional Share Liquidation: ${dto.propertyId} (${dto.tokensToSell} tokens @ $${resolvedPrice})`,
      entries: [
        { accountId: cashAccount.id, amount: proceeds },
        { accountId: investedAccount.id, amount: -proceeds },
      ],
    });

    const remaining = share.tokenCount - dto.tokensToSell;
    if (remaining <= 0) {
      await this.prisma.realEstateShare.delete({ where: { id: share.id } });
    } else {
      await this.prisma.realEstateShare.update({
        where: { id: share.id },
        data: { tokenCount: remaining },
      });
    }

    this.dashboardService?.invalidateCache(userId);
    return {
      success: true,
      remainingTokens: Math.max(0, remaining),
      proceeds,
    };
  }
}

