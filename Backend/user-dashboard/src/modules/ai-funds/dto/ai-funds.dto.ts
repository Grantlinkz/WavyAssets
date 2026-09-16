import {
  IsString,
  IsIn,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class SetRiskTierDto {
  @IsString()
  @IsIn(['preservation', 'balanced', 'high-vol'], {
    message: 'strategyTier must be one of: preservation, balanced, high-vol',
  })
  strategyTier!: 'preservation' | 'balanced' | 'high-vol';
}

export class ToggleCircuitBreakerDto {
  @IsBoolean()
  circuitBreaker!: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class SimulateRebalanceDto {
  @IsOptional()
  @IsString()
  asset?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amountUsd?: number;
}

export interface QuantMetricsResponse {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdownPct: number;
  annualAlphaPct: number;
  winRatePct: number;
  dailyVaR99Pct: number;
  portfolioBeta: number;
  strategyTier: string;
  totalAllocatedUsd: number;
  unrealizedAlphaUsd: number;
  circuitBreakerActive: boolean;
  benchmark: {
    sp500AnnualReturnPct: number;
    alphaSpreadPct: number;
  };
}

export interface RationaleLogItem {
  id: string;
  strategy: string;
  actionType: string;
  asset: string;
  rationale: string;
  slippageBps: number;
  confidence: number;
  createdAt: string;
}

export interface ComputeYieldResponse {
  clusterTelemetry: {
    clusterName: string;
    accelerator: string;
    totalNodes: number;
    activeNodes: number;
    utilizationPct: number;
    computeUptimePct: number;
    clusterTflops: number;
  };
  userYield: {
    pendingYieldUsd: number;
    claimedYieldUsd: number;
    dailyAccrualRateUsd: number;
    lastCalculatedAt: string;
  };
}

export interface ClaimYieldResponse {
  success: boolean;
  claimedAmountUsd: number;
  transactionReferenceId: string;
  walletBalanceUpdated: boolean;
  timestamp: string;
}
