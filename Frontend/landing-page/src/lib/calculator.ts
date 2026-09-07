export interface AssetWeight {
  id: string;
  name: string;
  percentage: number;
  color: string;
  dashOffset: number;
  dashLength: number;
}

export interface PostureConfig {
  level: number;
  name: string;
  targetApy: number;
  description: string;
  maxDrawdown: number;
  sharpeRatio: number;
  capitalShield: string;
  weights: AssetWeight[];
}

export interface PortfolioSimulationResult {
  capital: number;
  aggressiveness: number;
  posture: PostureConfig;
  blendedApy: number;
  annualReturn: number;
  monthlyRunrate: number;
  projectedTotalValue: number;
}

// Circumference of radius 38 is 2 * PI * 38 ≈ 238.76
const CIRCUMFERENCE = 238.76;

function computeSvgDashes(percentages: number[]): { dashLength: number; dashOffset: number }[] {
  let accumulatedOffset = 0;
  return percentages.map((pct) => {
    const dashLength = Number(((pct / 100) * CIRCUMFERENCE).toFixed(1));
    const dashOffset = -accumulatedOffset;
    accumulatedOffset += dashLength;
    return { dashLength, dashOffset };
  });
}

const preservationDashes = computeSvgDashes([50, 20, 30]);
const balancedDashes = computeSvgDashes([35, 40, 25]);
const alphaDashes = computeSvgDashes([20, 55, 25]);

export const POSTURES: Record<number, PostureConfig> = {
  1: {
    level: 1,
    name: 'Capital Preservation',
    targetApy: 8.6,
    description: 'Ultra-low volatility sovereign treasury with physical gold & freehold collateral.',
    maxDrawdown: -1.8,
    sharpeRatio: 3.42,
    capitalShield: 'Tier-1 Lloyds',
    weights: [
      {
        id: 'cars-gold',
        name: 'Bonded Hypercars & Gold',
        percentage: 50,
        color: '#d4af37', // Sovereign Gold
        dashOffset: preservationDashes[0].dashOffset,
        dashLength: preservationDashes[0].dashLength,
      },
      {
        id: 'gpu-lease',
        name: 'AI H100 GPU Lease Arbitrage',
        percentage: 20,
        color: '#00c086', // Yield Teal
        dashOffset: preservationDashes[1].dashOffset,
        dashLength: preservationDashes[1].dashLength,
      },
      {
        id: 'equities-staking',
        name: 'DMA Equities & Swiss Staking',
        percentage: 30,
        color: '#42dfa3', // Secondary Emerald
        dashOffset: preservationDashes[2].dashOffset,
        dashLength: preservationDashes[2].dashLength,
      },
    ],
  },
  2: {
    level: 2,
    name: 'Balanced Growth',
    targetApy: 14.2,
    description: 'Equally weighted physical collateral, compute hardware lease, and market-neutral basis trading.',
    maxDrawdown: -3.2,
    sharpeRatio: 2.86,
    capitalShield: 'Tier-1 Lloyds',
    weights: [
      {
        id: 'cars-gold',
        name: 'Bonded Hypercars & Gold',
        percentage: 35,
        color: '#d4af37',
        dashOffset: balancedDashes[0].dashOffset,
        dashLength: balancedDashes[0].dashLength,
      },
      {
        id: 'gpu-lease',
        name: 'AI H100 GPU Lease Arbitrage',
        percentage: 40,
        color: '#00c086',
        dashOffset: balancedDashes[1].dashOffset,
        dashLength: balancedDashes[1].dashLength,
      },
      {
        id: 'equities-staking',
        name: 'DMA Equities & Swiss Staking',
        percentage: 25,
        color: '#42dfa3',
        dashOffset: balancedDashes[2].dashOffset,
        dashLength: balancedDashes[2].dashLength,
      },
    ],
  },
  3: {
    level: 3,
    name: 'Maximum Alpha',
    targetApy: 22.4,
    description: 'High-density H100 GPU compute clustering and non-linear neural network momentum strategies.',
    maxDrawdown: -6.4,
    sharpeRatio: 2.28,
    capitalShield: 'Tier-1 Swiss Re',
    weights: [
      {
        id: 'cars-gold',
        name: 'Bonded Hypercars & Gold',
        percentage: 20,
        color: '#d4af37',
        dashOffset: alphaDashes[0].dashOffset,
        dashLength: alphaDashes[0].dashLength,
      },
      {
        id: 'gpu-lease',
        name: 'AI H100 GPU Lease Arbitrage',
        percentage: 55,
        color: '#00c086',
        dashOffset: alphaDashes[1].dashOffset,
        dashLength: alphaDashes[1].dashLength,
      },
      {
        id: 'equities-staking',
        name: 'DMA Equities & Swiss Staking',
        percentage: 25,
        color: '#42dfa3',
        dashOffset: alphaDashes[2].dashOffset,
        dashLength: alphaDashes[2].dashLength,
      },
    ],
  },
};

export function calculatePortfolioMetrics(
  capital: number,
  aggressiveness: number = 2
): PortfolioSimulationResult {
  // Normalize aggressiveness to 1, 2, or 3
  const normalizedLevel = Math.min(Math.max(Math.round(aggressiveness), 1), 3);
  const posture = POSTURES[normalizedLevel] || POSTURES[2];

  const blendedApy = posture.targetApy;
  const annualReturn = Math.round(capital * (blendedApy / 100));
  const monthlyRunrate = Math.round(annualReturn / 12);
  const projectedTotalValue = capital + annualReturn;

  return {
    capital,
    aggressiveness: normalizedLevel,
    posture,
    blendedApy,
    annualReturn,
    monthlyRunrate,
    projectedTotalValue,
  };
}
