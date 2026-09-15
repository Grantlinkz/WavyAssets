import type { TimeframeOption } from '../store/useDashboardStore';

export interface PnLMetrics {
  timeframe: TimeframeOption;
  absoluteDelta: number;
  percentageDelta: number;
  isPositive: boolean;
  label: string;
}

export interface VerticalAllocation {
  id: string;
  name: string;
  shortName: string;
  color: string;
  actualValue: number;
  actualPct: number;
  targetPct: number;
  deltaLabel: string;
  isGain: boolean;
}

export const TIMEFRAME_PNL_DATA: Record<TimeframeOption, PnLMetrics> = {
  '1D': {
    timeframe: '1D',
    absoluteDelta: 184210.40,
    percentageDelta: 1.26,
    isPositive: true,
    label: '+$184,210.40 (+1.26%)',
  },
  '1W': {
    timeframe: '1W',
    absoluteDelta: 412850.00,
    percentageDelta: 2.86,
    isPositive: true,
    label: '+$412,850.00 (+2.86%)',
  },
  '1M': {
    timeframe: '1M',
    absoluteDelta: 920400.00,
    percentageDelta: 6.62,
    isPositive: true,
    label: '+$920,400.00 (+6.62%)',
  },
  '1Y': {
    timeframe: '1Y',
    absoluteDelta: 2480120.00,
    percentageDelta: 20.09,
    isPositive: true,
    label: '+$2,480,120.00 (+20.09%)',
  },
  'ALL': {
    timeframe: 'ALL',
    absoluteDelta: 5240650.00,
    percentageDelta: 54.70,
    isPositive: true,
    label: '+$5,240,650.00 (+54.70%)',
  },
};

export const DEFAULT_ALLOCATIONS: VerticalAllocation[] = [
  {
    id: 'crypto',
    name: 'Crypto & Liquid Digital Assets',
    shortName: 'Crypto',
    color: '#f2ca50', // primary gold
    actualValue: 5187157.50,
    actualPct: 35.0,
    targetPct: 35.0,
    deltaLabel: '+2.40%',
    isGain: true,
  },
  {
    id: 'stocks',
    name: 'Global Equities & Structured SPVs',
    shortName: 'Equities',
    color: '#ecc160', // secondary amber
    actualValue: 2964090.00,
    actualPct: 20.0,
    targetPct: 20.0,
    deltaLabel: '+0.82%',
    isGain: true,
  },
  {
    id: 'real-estate',
    name: 'Tokenized Real Estate (Zurich / Dubai)',
    shortName: 'Real Estate',
    color: '#5fe7a2', // tertiary emerald
    actualValue: 2964090.00,
    actualPct: 20.0,
    targetPct: 20.0,
    deltaLabel: 'STABLE',
    isGain: true,
  },
  {
    id: 'ai-funds',
    name: 'Private AI Compute & VC Secondaries',
    shortName: 'AI Funds',
    color: '#99907c', // outline muted
    actualValue: 1482045.00,
    actualPct: 10.0,
    targetPct: 10.0,
    deltaLabel: '+5.12%',
    isGain: true,
  },
  {
    id: 'vault',
    name: 'Physical Allocated Gold (Geneva Freezone)',
    shortName: 'Gold Vault',
    color: '#d4af37', // primary container
    actualValue: 1482045.00,
    actualPct: 10.0,
    targetPct: 10.0,
    deltaLabel: '+0.40%',
    isGain: true,
  },
  {
    id: 'cars',
    name: 'Exotic & Heritage Cars (Monaco Vault)',
    shortName: 'Cars',
    color: '#e9c349', // primary fixed dim
    actualValue: 741022.50,
    actualPct: 5.0,
    targetPct: 5.0,
    deltaLabel: 'AUDITED Q1',
    isGain: true,
  },
];

export const TOTAL_SOVEREIGN_NET_WORTH = 14820450.00;

/**
 * Format a number as currency, or return a masked placeholder if maskBalances is enabled.
 */
export function formatMaskedCurrency(
  value: number,
  masked: boolean,
  fractionDigits: number = 2
): string {
  if (masked) {
    return '••••••••';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Calculates sum and percentage breakdown of asset classes.
 */
export function calculateAllocationTotals(allocations: VerticalAllocation[]) {
  const totalValue = allocations.reduce((acc, item) => acc + item.actualValue, 0);
  return {
    totalValue,
    allocations: allocations.map((item) => ({
      ...item,
      computedPct: totalValue > 0 ? (item.actualValue / totalValue) * 100 : 0,
    })),
  };
}
