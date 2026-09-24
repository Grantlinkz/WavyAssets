export interface ReturnPeriodMetrics {
  dollarChange: number;
  percentageChange: number;
}

export interface ReturnsSummary {
  '1D': ReturnPeriodMetrics;
  '1W': ReturnPeriodMetrics;
  '1M': ReturnPeriodMetrics;
  '1Y': ReturnPeriodMetrics;
  ALL: ReturnPeriodMetrics;
}

export interface AllocationMatrixItem {
  id: string;
  name: string;
  actualValue: number;
  actualPct: number;
  targetPct: number;
  color: string;
}

export interface KycStatusSummary {
  tier: string;
  dailyLimit: string;
  status: string;
}

export interface CommandBarResponse {
  consolidatedNetWorth: number;
  currency: string;
  accountBalance?: number;
  availableCash?: number;
  returns: ReturnsSummary;
  allocationMatrix: AllocationMatrixItem[];
  kycStatus: KycStatusSummary;
  privacyMaskActive: boolean;
  lastUpdated: string;
}

