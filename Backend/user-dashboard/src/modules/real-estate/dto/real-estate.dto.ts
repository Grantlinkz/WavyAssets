import { IsString, IsOptional } from 'class-validator';

export class ExecuteOtcOrderDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export interface PropertyItemResponse {
  id: string;
  title: string;
  region: string;
  totalValuation: number;
  totalTokens: number;
  tokenPriceUsd: number;
  annualizedYield: number;
  occupancyRate: number;
  spvContractUrl: string;
  userHolding: {
    tokenCount: number;
    equityUsd: number;
    ownershipPct: number;
  };
  valuationHistory: {
    year: number;
    valuation: number;
  }[];
}

export interface RentalDistributionsResponse {
  projectedAnnualYieldUsd: number;
  monthlyPayoutUsd: number;
  accruedUnpaidDividendsUsd: number;
  distributionCadence: string;
  nextPayoutDate: string;
  distributionHistory: {
    id: string;
    propertyTitle: string;
    amountUsd: number;
    payoutDate: string;
    status: string;
  }[];
}

export interface OccupancyResponse {
  portfolioOccupancyPct: number;
  waultYears: number; // Weighted Average Unexpired Lease Term
  totalTenants: number;
  tenants: {
    propertyTitle: string;
    tenantName: string;
    sector: string;
    leaseExpiry: string;
    occupancySharePct: number;
    slaPerformancePct: number;
  }[];
}

export interface OtcOrderResponse {
  id: string;
  propertyId: string;
  propertyTitle: string;
  orderType: 'BID' | 'OFFER';
  tokenAmount: number;
  pricePerToken: number;
  totalOrderValueUsd: number;
  yieldSpreadBps: number;
  status: string;
  createdAt: string;
}

export interface PresignedDocumentResponse {
  docId: string;
  title: string;
  documentType: string;
  downloadUrl: string;
  expiresAt: string;
  signature: string;
  mimeType: string;
}
