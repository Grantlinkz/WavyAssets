// Telemetry feeds, contracts, and benchmarks for Alternative Asset Verticals
// Modules: AI Systematic Funds, Tokenized Real Estate, and Exotic Vehicles & Horology

export interface StrategyMetric {
  label: string;
  badge?: string;
  badgeType?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'error';
  value: string;
  subValue: string;
  subValueColor?: string;
  footerLabel: string;
  footerValue: string;
  sparkline?: boolean;
}

export interface RiskTier {
  id: 'preservation' | 'balanced' | 'high-vol';
  tierLabel: string;
  leverage: string;
  title: string;
  description: string;
  targetApy: string;
  volBand?: string;
  active?: boolean;
}

export interface ExecutionRationaleEvent {
  id: string;
  timeUtc: string;
  category: string;
  categoryColor: 'primary' | 'secondary' | 'tertiary';
  venue: string;
  summary: string;
  rationale: string;
  metrics: string[];
  txHash: string;
  pnlYield: string;
}

export interface GpuClusterTelemetry {
  clusterName: string;
  facility: string;
  specs: string;
  utilizationRate: number; // 94.2%
  dedicatedInferenceRate: number; // 78%
  quantOptimizationRate: number; // 16.2%
  standbyReserveRate: number; // 5.8%
  onlineGpus: number; // 151
  totalGpus: number; // 160
  hourlyRate: number; // 18.42
  monthlyCashFlow: number; // 13262.40
  hardwareApy: number; // 15.2%
  activeTenant: string;
  taskDescription: string;
  avgCoreTemp: string;
  powerSource: string;
  pendingYieldUsdc: number; // 1842.10
}

export interface RealEstateAsset {
  id: string;
  name: string;
  region: 'Switzerland' | 'United Kingdom' | 'Germany';
  location: string;
  spvCode: string;
  valuation: number;
  unrealizedUpliftPct: number;
  tokenCount: number;
  tokenPrice: number;
  occupancyPct: number;
  netRentalYieldApy: number;
  waltYears: number;
  legalEntity: string;
  imageUrl: string;
  appraisalStandard: string;
}

export interface RentalDistributionItem {
  id: string;
  period: string;
  projected: number;
  actual: number;
  varianceDelta: number;
  settlementHash: string;
  status: 'CLEARED' | 'PENDING';
}

export interface SecondaryOtcOrder {
  id: string;
  type: 'BID' | 'OFFER';
  propertyName: string;
  tokenCount: number;
  pricePerToken: number;
  navPremiumDiscountPct: number;
  counterpartyEnclave: string;
  totalUsd: number;
}

export interface ExoticAsset {
  id: string;
  type: 'vehicle' | 'horology';
  title: string;
  subtitle: string;
  fairMarketValue: number;
  acquisitionPrice: number;
  unrealizedGain: number;
  gainPct: number;
  indexTrend5YrPct: number;
  indexBenchmark: string;
  vaultLocation: string;
  custodyEnclave: string;
  conditionScore: number;
  conditionLabel: string;
  primaryAttributes: { label: string; value: string }[];
  climateTelemetry: string;
  underwritingPolicy: string;
  insuredValue: number;
  imageUrl: string;
}

export interface DriveBookingSlot {
  day: number;
  dateStr: string;
  status: 'available' | 'booked' | 'maintenance' | 'past';
  title?: string;
}

// -------------------------------------------------------------------------
// AI FUNDS TELEMETRY
// -------------------------------------------------------------------------

export const AI_FUNDS_METRICS: StrategyMetric[] = [
  {
    label: 'Capital Deployed',
    badge: '9.8% NAV',
    badgeType: 'primary',
    value: '$1,450,000.00',
    subValue: 'USDC Collateral Base: 100% On-Chain',
    footerLabel: 'Active Contracts',
    footerValue: '14 Perp / 2 Basis',
  },
  {
    label: 'Net Strategy APY',
    value: '18.40%',
    subValue: '+$732.14 / day',
    subValueColor: 'text-tertiary',
    footerLabel: 'Annualized Return',
    footerValue: '+266,800.00 USD',
    sparkline: true,
  },
  {
    label: 'Sharpe Ratio',
    badge: 'T-Bill Rf: 4.85%',
    badgeType: 'outline',
    value: '2.84',
    subValue: 'Top Decile Tier-1 (vs S&P 0.94)',
    subValueColor: 'text-tertiary',
    footerLabel: 'Rolling 365-Day',
    footerValue: 'Calmar: 4.38',
  },
  {
    label: 'Sortino Ratio',
    badge: 'Institutional',
    badgeType: 'primary',
    value: '3.12',
    subValue: 'Zero Skew Downside Penalization',
    footerLabel: 'Downside Std Dev',
    footerValue: '2.14%',
  },
  {
    label: 'Max Drawdown',
    badge: 'Recovery: 9 Days',
    badgeType: 'outline',
    value: '-4.20%',
    subValue: 'Peak: August 05, 2024',
    subValueColor: 'text-rose-400',
    footerLabel: 'VaR Limit (99%)',
    footerValue: '1.27% Passed',
  },
];

export const AI_RISK_TIERS: RiskTier[] = [
  {
    id: 'preservation',
    tierLabel: 'Tier 1 (Low)',
    leverage: '1.0x',
    title: 'Capital Preservation',
    description: 'Market-neutral delta hedging. Synthetic USD basis capture with negative beta bias.',
    targetApy: '8.0% - 12.0%',
  },
  {
    id: 'balanced',
    tierLabel: 'Tier 2 (Selected)',
    leverage: '1.45x',
    title: 'Balanced Trend',
    description: 'Statistical momentum, cross-market cointegration & automated gamma scalp.',
    targetApy: '14.0% - 20.0% APY',
    volBand: '6.8%',
    active: true,
  },
  {
    id: 'high-vol',
    tierLabel: 'Tier 3 (Dynamic)',
    leverage: '2.5x',
    title: 'High-Volatility Alpha',
    description: 'Cross-venue liquidation hunting, flash TWAP arbitrage & DEX-CEX spreads.',
    targetApy: '22.0% - 30.0%',
  },
];

export const AI_RATIONALE_EVENTS: ExecutionRationaleEvent[] = [
  {
    id: 'evt-1',
    timeUtc: '14:22:01 UTC',
    category: 'Delta Hedging',
    categoryColor: 'tertiary',
    venue: 'Deribit ETH-PERP',
    summary: 'Shorted 12.4 ETH perpetual futures ($42,780.20) against spot staking stash.',
    rationale: 'Funding rate divergence (>0.041% / 8h) exceeded mean spread threshold.',
    metrics: ['Hedge Efficiency: 99.40%', 'Slippage: 0.012%', 'Fee: $8.40'],
    txHash: '0x8a1c...e411',
    pnlYield: '+0.041% / 8h',
  },
  {
    id: 'evt-2',
    timeUtc: '13:58:14 UTC',
    category: 'Stat Arb',
    categoryColor: 'primary',
    venue: 'Binance / Coinbase Prime',
    summary: 'Detected 48 bps price spread between Binance and Coinbase BTC spot. Executed atomic TWAP across 3.2 BTC.',
    rationale: 'Z-score +2.18σ mean-reversion opportunity triggered sub-150ms execution window.',
    metrics: ['Alpha: +$1,368.50', 'Execution Window: 140ms', 'Zero Exposure Lag'],
    txHash: '0x3d7b...99ca',
    pnlYield: '+$1,368.50',
  },
  {
    id: 'evt-3',
    timeUtc: '11:15:30 UTC',
    category: 'Funding Capture',
    categoryColor: 'secondary',
    venue: 'DVOL Index > 62.1%',
    summary: 'Implied Volatility spiked past threshold. Automatically transferred $250,000.00 from momentum pool to tokenized Swiss T-Bills.',
    rationale: 'Fiduciary risk preservation protocol triggered by macro volatility spike.',
    metrics: ['Beta: 0.18', 'Delta: -0.02', 'Risk Mitigated: Level 2'],
    txHash: '0x44f1...bb72',
    pnlYield: '$250k Reallocated',
  },
  {
    id: 'evt-4',
    timeUtc: '09:04:12 UTC',
    category: 'Funding Capture',
    categoryColor: 'tertiary',
    venue: 'Uniswap v3 ETH/USDC',
    summary: 'Readjusted concentrated liquidity tick range ($3,380 - $3,520) capturing optimal trading fee volume.',
    rationale: 'Autonomous market maker rebalance minimizing impermanent loss risk.',
    metrics: ['Tick Centering: +0.02%', 'IL Risk: Hedged', 'Fee Yield: Continuous'],
    txHash: '0xee92...a381',
    pnlYield: '+$412.80 Fee',
  },
  {
    id: 'evt-5',
    timeUtc: '06:30:00 UTC',
    category: 'Delta Hedging',
    categoryColor: 'primary',
    venue: 'Monte-Carlo 10,000 Runs',
    summary: '99% 1-Day Value-at-Risk calculated at $18,400.00 (1.27% of portfolio). Stress testing passed with 0% liquidation probability.',
    rationale: 'Daily Global risk audit verification against flash crash scenarios.',
    metrics: ['Max Tolerated Stress: 4.8x', 'Solvency Confidence: 99.98%'],
    txHash: '0x7c21...8b54',
    pnlYield: 'Audit Passed',
  },
];

export const GPU_CLUSTER_TELEMETRY: GpuClusterTelemetry = {
  clusterName: '160x NVIDIA H100 SXM5 80GB',
  facility: 'Facility #02 CH (Valais Hydro Grid)',
  specs: 'Dual SXM5 Octa-Chassis (3.2 Tbps InfiniBand NDR)',
  utilizationRate: 94.2,
  dedicatedInferenceRate: 78.0,
  quantOptimizationRate: 16.2,
  standbyReserveRate: 5.8,
  onlineGpus: 151,
  totalGpus: 160,
  hourlyRate: 18.42,
  monthlyCashFlow: 13262.40,
  hardwareApy: 15.2,
  activeTenant: 'Tier-1 Global AI Lab',
  taskDescription: 'Distributed LoRA Tuning (Llama-3 70B Quantized)',
  avgCoreTemp: '42°C Avg Core (PUE: 1.12 Hydro)',
  powerSource: '100% Swiss Hydroelectric',
  pendingYieldUsdc: 1842.10,
};

// -------------------------------------------------------------------------
// REAL ESTATE TELEMETRY
// -------------------------------------------------------------------------

export const REAL_ESTATE_SUMMARY_CARDS = [
  {
    label: 'TOTAL PROPERTY EQUITY',
    subLabel: 'Featured Enclave Holdings (4 SPVs)',
    value: '$2,850,000.00',
    delta: '+$270,000.00 (+10.46%)',
    deltaSub: 'Unrealized Uplift',
    footerKey: 'Acquisition Basis',
    footerVal: '$2,580,000.00',
  },
  {
    label: 'NET RENTAL YIELD',
    subLabel: 'T+0 Continuous Cash Flow',
    value: '$17,100.00',
    unit: '/ mo',
    delta: '$205,200.00 / yr',
    deltaSub: 'Annualized',
    badge: '+3.2% vs Pro-Forma',
    footerKey: 'Settlement Enclave',
    footerVal: 'Auto-Swap USDC / CHF',
  },
  {
    label: 'AVERAGE NET CAP RATE',
    subLabel: 'Unlevered Weighted Yield',
    value: '7.20%',
    delta: '+305 bps',
    deltaSub: 'Spread over Prime CH (4.15%)',
    extraMetric: '6.2 Yrs',
    extraMetricLabel: 'WALT Duration',
    footerKey: 'Valuation Standard',
    footerVal: 'Red Book RICS Qualified',
  },
  {
    label: 'PORTFOLIO OCCUPANCY',
    subLabel: '4 Prime Real Estate SPVs',
    value: '98.4%',
    delta: '1.6% Scheduled Turnover',
    badge: '100% INSTITUTIONAL',
    footerKey: 'Arrears / Defaults',
    footerVal: '0.00% (Triple-Net NNN)',
  },
];

export const REAL_ESTATE_ASSETS: RealEstateAsset[] = [
  {
    "id": "re-1",
    "name": "One Zurich Financial Center",
    "region": "Switzerland",
    "location": "Zurich: Bleicherweg 10",
    "spvCode": "CH-SPV-ZUR-08",
    "valuation": 1200000,
    "unrealizedUpliftPct": 12.4,
    "tokenCount": 2400,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 6.85,
    "waltYears": 7.5,
    "legalEntity": "Zürich Prime Office AG",
    "imageUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "RICS Red Book (CBRE Zurich)"
  },
  {
    "id": "re-2",
    "name": "London Mayfair Luxury Mews",
    "region": "United Kingdom",
    "location": "Mayfair: Chesterfield Gardens 4",
    "spvCode": "UK-SPV-LON-14",
    "valuation": 750000,
    "unrealizedUpliftPct": 8.7,
    "tokenCount": 1500,
    "tokenPrice": 500,
    "occupancyPct": 96.8,
    "netRentalYieldApy": 7.4,
    "waltYears": 4.8,
    "legalEntity": "Mayfair Global Holdings Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Knight Frank Mayfair Advisory"
  },
  {
    "id": "re-3",
    "name": "Geneva Lakeside Diplomatic Villa",
    "region": "Switzerland",
    "location": "Cologny: Route de la Capite",
    "spvCode": "CH-SPV-GEN-02",
    "valuation": 550000,
    "unrealizedUpliftPct": 14.1,
    "tokenCount": 1100,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 6.2,
    "waltYears": 8,
    "legalEntity": "Cologny Enclave Immobilière SA",
    "imageUrl": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Wüest Partner Geneva"
  },
  {
    "id": "re-4",
    "name": "Frankfurt Hyperscale Data Hub",
    "region": "Germany",
    "location": "Frankfurt: Hanauer Landstrasse",
    "spvCode": "DE-SPV-FRA-22",
    "valuation": 350000,
    "unrealizedUpliftPct": 9.3,
    "tokenCount": 700,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 8.5,
    "waltYears": 10,
    "legalEntity": "DE Data Infra GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "JLL Industrial Advisory"
  },
  {
    "id": "re-5",
    "name": "Munich Brienner Quartier Flagship",
    "region": "Germany",
    "location": "Munich: Brienner Strasse 14",
    "spvCode": "DE-SPV-MUC-05",
    "valuation": 850000,
    "unrealizedUpliftPct": 7.8,
    "tokenCount": 1700,
    "tokenPrice": 500,
    "occupancyPct": 98.2,
    "netRentalYieldApy": 7.15,
    "waltYears": 6.2,
    "legalEntity": "Bavaria Prime Retail GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Savills Germany Advisory"
  },
  {
    "id": "re-6",
    "name": "Basel Bio-Campus Life Sciences Hub",
    "region": "Switzerland",
    "location": "Basel: Hochbergerstrasse 60",
    "spvCode": "CH-SPV-BSL-11",
    "valuation": 1450000,
    "unrealizedUpliftPct": 11.2,
    "tokenCount": 2900,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.6,
    "waltYears": 9.5,
    "legalEntity": "Novartis Tech Park Enclave AG",
    "imageUrl": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "CBRE Basel Healthcare"
  },
  {
    "id": "re-7",
    "name": "Canary Wharf Grade-A Tier-1 Tower",
    "region": "United Kingdom",
    "location": "London: 25 Bank Street",
    "spvCode": "UK-SPV-CAN-03",
    "valuation": 1950000,
    "unrealizedUpliftPct": 6.4,
    "tokenCount": 3900,
    "tokenPrice": 500,
    "occupancyPct": 97.4,
    "netRentalYieldApy": 6.95,
    "waltYears": 8,
    "legalEntity": "Canary Wharf Prime Capital Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "JLL London City Desk"
  },
  {
    "id": "re-8",
    "name": "Zug Crypto Valley Headquarters",
    "region": "Switzerland",
    "location": "Zug: Baarerstrasse 45",
    "spvCode": "CH-SPV-ZUG-09",
    "valuation": 920000,
    "unrealizedUpliftPct": 15.6,
    "tokenCount": 1840,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.8,
    "waltYears": 5.5,
    "legalEntity": "Zug FinTech Enclave SA",
    "imageUrl": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Wüest Partner Central CH"
  },
  {
    "id": "re-9",
    "name": "Berlin Mitte Technology Innovation Lofts",
    "region": "Germany",
    "location": "Berlin: Friedrichstrasse 110",
    "spvCode": "DE-SPV-BER-18",
    "valuation": 680000,
    "unrealizedUpliftPct": 10.5,
    "tokenCount": 1360,
    "tokenPrice": 500,
    "occupancyPct": 99,
    "netRentalYieldApy": 8.1,
    "waltYears": 6.8,
    "legalEntity": "Berlin Digital Real Estate GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Knight Frank Berlin"
  },
  {
    "id": "re-10",
    "name": "Kensington Palace Gardens Residences",
    "region": "United Kingdom",
    "location": "London: Kensington Palace Gardens 8",
    "spvCode": "UK-SPV-KEN-01",
    "valuation": 2400000,
    "unrealizedUpliftPct": 9.1,
    "tokenCount": 4800,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 5.85,
    "waltYears": 12,
    "legalEntity": "Royal Borough Global SPV Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Knight Frank Prime London"
  },
  {
    "id": "re-11",
    "name": "St. Moritz Corviglia Alpine Chalet Resort",
    "region": "Switzerland",
    "location": "St. Moritz: Via Serlas 22",
    "spvCode": "CH-SPV-STM-04",
    "valuation": 1650000,
    "unrealizedUpliftPct": 16.8,
    "tokenCount": 3300,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 6.4,
    "waltYears": 10,
    "legalEntity": "Engadin Alpine Luxury Estates AG",
    "imageUrl": "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "CBRE Luxury Resort Valuation"
  },
  {
    "id": "re-12",
    "name": "Hamburg HafenCity Maritime Logistics Center",
    "region": "Germany",
    "location": "Hamburg: Am Sandtorkai 34",
    "spvCode": "DE-SPV-HAM-07",
    "valuation": 890000,
    "unrealizedUpliftPct": 8.4,
    "tokenCount": 1780,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.75,
    "waltYears": 8.5,
    "legalEntity": "Elbe Infrastructure GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Colliers Germany Logistics"
  },
  {
    "id": "re-13",
    "name": "Edinburgh Charlotte Square Private Bank HQ",
    "region": "United Kingdom",
    "location": "Edinburgh: Charlotte Square 12",
    "spvCode": "UK-SPV-EDI-06",
    "valuation": 720000,
    "unrealizedUpliftPct": 7.2,
    "tokenCount": 1440,
    "tokenPrice": 500,
    "occupancyPct": 98,
    "netRentalYieldApy": 7.3,
    "waltYears": 7,
    "legalEntity": "Scottish Heritage Capital Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Ryden Commercial Edinburgh"
  },
  {
    "id": "re-14",
    "name": "Lausanne EPFL Innovation Park Lab",
    "region": "Switzerland",
    "location": "Lausanne: Route Cantonale 101",
    "spvCode": "CH-SPV-LAU-15",
    "valuation": 1100000,
    "unrealizedUpliftPct": 13,
    "tokenCount": 2200,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.45,
    "waltYears": 9,
    "legalEntity": "Vaud Biotech Enclave SA",
    "imageUrl": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Wüest Partner Romandie"
  },
  {
    "id": "re-15",
    "name": "Stuttgart Porscheplatz Industrial Complex",
    "region": "Germany",
    "location": "Stuttgart: Porscheplatz 1",
    "spvCode": "DE-SPV-STU-02",
    "valuation": 980000,
    "unrealizedUpliftPct": 6.9,
    "tokenCount": 1960,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 8.2,
    "waltYears": 11,
    "legalEntity": "Baden-Württemberg Automotive SPV",
    "imageUrl": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "JLL Stuttgart Industrial"
  },
  {
    "id": "re-16",
    "name": "Oxford Science Park Genomics Center",
    "region": "United Kingdom",
    "location": "Oxford: Robert Robinson Ave",
    "spvCode": "UK-SPV-OXF-09",
    "valuation": 1250000,
    "unrealizedUpliftPct": 10.8,
    "tokenCount": 2500,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.5,
    "waltYears": 10.5,
    "legalEntity": "Oxford Life Sciences Enclave Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Bidwells Oxford Advisory"
  },
  {
    "id": "re-17",
    "name": "Lucerne Lakefront Heritage Grand Hotel",
    "region": "Switzerland",
    "location": "Lucerne: Haldenstrasse 4",
    "spvCode": "CH-SPV-LUC-07",
    "valuation": 1800000,
    "unrealizedUpliftPct": 12,
    "tokenCount": 3600,
    "tokenPrice": 500,
    "occupancyPct": 95.5,
    "netRentalYieldApy": 6.6,
    "waltYears": 14,
    "legalEntity": "Vierwaldstättersee Hospitality AG",
    "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "PwC Swiss Hospitality"
  },
  {
    "id": "re-18",
    "name": "Dusseldorf Königsallee Luxury Arcade",
    "region": "Germany",
    "location": "Dusseldorf: Königsallee 60",
    "spvCode": "DE-SPV-DUS-14",
    "valuation": 1150000,
    "unrealizedUpliftPct": 8.5,
    "tokenCount": 2300,
    "tokenPrice": 500,
    "occupancyPct": 99.2,
    "netRentalYieldApy": 6.9,
    "waltYears": 7.2,
    "legalEntity": "Kö High-Street Retail GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Cushman & Wakefield Germany"
  },
  {
    "id": "re-19",
    "name": "Cambridge Biomedical Campus Laboratory",
    "region": "United Kingdom",
    "location": "Cambridge: Francis Crick Ave",
    "spvCode": "UK-SPV-CAM-05",
    "valuation": 1350000,
    "unrealizedUpliftPct": 11.5,
    "tokenCount": 2700,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.35,
    "waltYears": 12.5,
    "legalEntity": "Cambridge Bio-Cluster Holdings Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Savills Cambridge Advisory"
  },
  {
    "id": "re-20",
    "name": "Bern Bundesplatz Diplomatic Chambers",
    "region": "Switzerland",
    "location": "Bern: Bundesplatz 3",
    "spvCode": "CH-SPV-BRN-01",
    "valuation": 820000,
    "unrealizedUpliftPct": 9.4,
    "tokenCount": 1640,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 6.7,
    "waltYears": 8,
    "legalEntity": "Helvetia Diplomatic Properties AG",
    "imageUrl": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Wüest Partner Bern"
  },
  {
    "id": "re-21",
    "name": "Frankfurt Westend Tower Office",
    "region": "Germany",
    "location": "Frankfurt: Bockenheimer Landstr 24",
    "spvCode": "DE-SPV-FRA-31",
    "valuation": 1400000,
    "unrealizedUpliftPct": 9.8,
    "tokenCount": 2800,
    "tokenPrice": 500,
    "occupancyPct": 98.5,
    "netRentalYieldApy": 7.2,
    "waltYears": 8.4,
    "legalEntity": "Westend Skyline GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "CBRE Frankfurt Prime"
  },
  {
    "id": "re-22",
    "name": "London Soho Media & Film Studios",
    "region": "United Kingdom",
    "location": "London: Wardour Street 88",
    "spvCode": "UK-SPV-SOH-19",
    "valuation": 880000,
    "unrealizedUpliftPct": 14.2,
    "tokenCount": 1760,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.9,
    "waltYears": 6,
    "legalEntity": "Soho Creative Enclave Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Colliers Central London"
  },
  {
    "id": "re-23",
    "name": "Lugano Lakefront Private Banking Villa",
    "region": "Switzerland",
    "location": "Lugano: Riva Caccia 12",
    "spvCode": "CH-SPV-LUG-03",
    "valuation": 760000,
    "unrealizedUpliftPct": 10.1,
    "tokenCount": 1520,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 6.5,
    "waltYears": 7.5,
    "legalEntity": "Ticino Wealth Management SA",
    "imageUrl": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Fidinam Lugano Real Estate"
  },
  {
    "id": "re-24",
    "name": "Cologne MediaPark Telecommunications Center",
    "region": "Germany",
    "location": "Cologne: Im MediaPark 5",
    "spvCode": "DE-SPV-CGN-08",
    "valuation": 640000,
    "unrealizedUpliftPct": 7.4,
    "tokenCount": 1280,
    "tokenPrice": 500,
    "occupancyPct": 96,
    "netRentalYieldApy": 8.05,
    "waltYears": 6.5,
    "legalEntity": "Rhein Telecom Infrastructure GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "BNP Paribas Real Estate DE"
  },
  {
    "id": "re-25",
    "name": "Manchester MediaCityUK Broadcast Complex",
    "region": "United Kingdom",
    "location": "Manchester: Broadway Salford",
    "spvCode": "UK-SPV-MAN-12",
    "valuation": 910000,
    "unrealizedUpliftPct": 8.9,
    "tokenCount": 1820,
    "tokenPrice": 500,
    "occupancyPct": 98.8,
    "netRentalYieldApy": 8.3,
    "waltYears": 9,
    "legalEntity": "Northern Digital Infrastructure Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Avison Young Manchester"
  },
  {
    "id": "re-26",
    "name": "Zermatt Matterhorn Luxury Ski Chalet",
    "region": "Switzerland",
    "location": "Zermatt: Riedweg 44",
    "spvCode": "CH-SPV-ZER-02",
    "valuation": 1500000,
    "unrealizedUpliftPct": 18.2,
    "tokenCount": 3000,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 6.3,
    "waltYears": 12,
    "legalEntity": "Valais Alpine Global AG",
    "imageUrl": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Engel & Völkers Luxury CH"
  },
  {
    "id": "re-27",
    "name": "Munich Schwabing Smart Mobility Campus",
    "region": "Germany",
    "location": "Munich: Leopoldstrasse 180",
    "spvCode": "DE-SPV-MUC-19",
    "valuation": 1100000,
    "unrealizedUpliftPct": 11,
    "tokenCount": 2200,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.4,
    "waltYears": 8,
    "legalEntity": "Isar Tech Valley GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "JLL Munich Corporate"
  },
  {
    "id": "re-28",
    "name": "London Shoreditch Tech City Accelerator",
    "region": "United Kingdom",
    "location": "London: Old Street 200",
    "spvCode": "UK-SPV-SHO-04",
    "valuation": 830000,
    "unrealizedUpliftPct": 13.5,
    "tokenCount": 1660,
    "tokenPrice": 500,
    "occupancyPct": 97.2,
    "netRentalYieldApy": 8.15,
    "waltYears": 5.8,
    "legalEntity": "East London Digital Property Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Knight Frank City Tech"
  },
  {
    "id": "re-29",
    "name": "Basel St. Alban Private Medical Clinic",
    "region": "Switzerland",
    "location": "Basel: St. Alban-Vorstadt 15",
    "spvCode": "CH-SPV-BSL-04",
    "valuation": 960000,
    "unrealizedUpliftPct": 8.7,
    "tokenCount": 1920,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.1,
    "waltYears": 11,
    "legalEntity": "Rhein Healthcare Infrastructure AG",
    "imageUrl": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Wüest Partner Medical"
  },
  {
    "id": "re-30",
    "name": "Berlin Potsdamer Platz Mixed-Use Tower",
    "region": "Germany",
    "location": "Berlin: Potsdamer Platz 1",
    "spvCode": "DE-SPV-BER-09",
    "valuation": 1750000,
    "unrealizedUpliftPct": 9.6,
    "tokenCount": 3500,
    "tokenPrice": 500,
    "occupancyPct": 98,
    "netRentalYieldApy": 7.05,
    "waltYears": 9.5,
    "legalEntity": "Spree Metropolitan Real Estate GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Savills Berlin Advisory"
  },
  {
    "id": "re-31",
    "name": "Bristol Harbourside Sustainable Office",
    "region": "United Kingdom",
    "location": "Bristol: Anchor Road 10",
    "spvCode": "UK-SPV-BRI-07",
    "valuation": 590000,
    "unrealizedUpliftPct": 6.8,
    "tokenCount": 1180,
    "tokenPrice": 500,
    "occupancyPct": 95,
    "netRentalYieldApy": 8.4,
    "waltYears": 7.5,
    "legalEntity": "Avon Green Commercial Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Alder King Bristol"
  },
  {
    "id": "re-32",
    "name": "Zurich Seefeld Lakeside Executive Suites",
    "region": "Switzerland",
    "location": "Zurich: Dufourstrasse 48",
    "spvCode": "CH-SPV-ZUR-22",
    "valuation": 1320000,
    "unrealizedUpliftPct": 14.5,
    "tokenCount": 2640,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 6.55,
    "waltYears": 8,
    "legalEntity": "Seefeld Waterfront Living AG",
    "imageUrl": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "CBRE Zurich Prime"
  },
  {
    "id": "re-33",
    "name": "Leipzig LogistikPark DHL Airport Hub",
    "region": "Germany",
    "location": "Leipzig: Terminalring 12",
    "spvCode": "DE-SPV-LEJ-03",
    "valuation": 780000,
    "unrealizedUpliftPct": 8.2,
    "tokenCount": 1560,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 8.6,
    "waltYears": 12,
    "legalEntity": "Saxony Freight Hubs GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "JLL Logistics East Germany"
  },
  {
    "id": "re-34",
    "name": "London Knightsbridge Harrods Mews",
    "region": "United Kingdom",
    "location": "London: Hans Crescent 14",
    "spvCode": "UK-SPV-KNI-11",
    "valuation": 2100000,
    "unrealizedUpliftPct": 11.4,
    "tokenCount": 4200,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 5.95,
    "waltYears": 10,
    "legalEntity": "Brompton Global Realty Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Knight Frank Knightsbridge"
  },
  {
    "id": "re-35",
    "name": "Geneva Rue du Rhône Luxury Retail Vault",
    "region": "Switzerland",
    "location": "Geneva: Rue du Rhône 42",
    "spvCode": "CH-SPV-GEN-18",
    "valuation": 1900000,
    "unrealizedUpliftPct": 13.8,
    "tokenCount": 3800,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 6.15,
    "waltYears": 15,
    "legalEntity": "Rhône Haute Horlogerie Real Estate SA",
    "imageUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "CBRE Geneva Retail"
  },
  {
    "id": "re-36",
    "name": "Nuremberg Automation & Robotics Park",
    "region": "Germany",
    "location": "Nuremberg: Frankenstrasse 150",
    "spvCode": "DE-SPV-NUE-05",
    "valuation": 620000,
    "unrealizedUpliftPct": 7.1,
    "tokenCount": 1240,
    "tokenPrice": 500,
    "occupancyPct": 99,
    "netRentalYieldApy": 8.35,
    "waltYears": 8.5,
    "legalEntity": "Franconia Industry Hub GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Colliers Industrial Bavaria"
  },
  {
    "id": "re-37",
    "name": "Birmingham Curzon Street HS2 Interchange",
    "region": "United Kingdom",
    "location": "Birmingham: Curzon Street 5",
    "spvCode": "UK-SPV-BIR-02",
    "valuation": 840000,
    "unrealizedUpliftPct": 9.2,
    "tokenCount": 1680,
    "tokenPrice": 500,
    "occupancyPct": 97,
    "netRentalYieldApy": 8.25,
    "waltYears": 10,
    "legalEntity": "Midlands Transit Infrastructure Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "CBRE Birmingham Desk"
  },
  {
    "id": "re-38",
    "name": "Baden ABB Power Electronics Campus",
    "region": "Switzerland",
    "location": "Baden: Brown Boveri Strasse 6",
    "spvCode": "CH-SPV-BAD-08",
    "valuation": 870000,
    "unrealizedUpliftPct": 10.2,
    "tokenCount": 1740,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.7,
    "waltYears": 9.5,
    "legalEntity": "Aargau Energy Technology Park AG",
    "imageUrl": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Wüest Partner Commercial"
  },
  {
    "id": "re-39",
    "name": "Dresden Silicon Saxony Semiconductor Fab",
    "region": "Germany",
    "location": "Dresden: Koenigsbruecker Landstr 159",
    "spvCode": "DE-SPV-DRS-01",
    "valuation": 1250000,
    "unrealizedUpliftPct": 12.5,
    "tokenCount": 2500,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 8.45,
    "waltYears": 14,
    "legalEntity": "Saxony Microelectronics Infra GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "JLL Advanced Manufacturing"
  },
  {
    "id": "re-40",
    "name": "London Fitzrovia Creative Media Hub",
    "region": "United Kingdom",
    "location": "London: Charlotte Street 33",
    "spvCode": "UK-SPV-FIT-08",
    "valuation": 970000,
    "unrealizedUpliftPct": 8.6,
    "tokenCount": 1940,
    "tokenPrice": 500,
    "occupancyPct": 98.2,
    "netRentalYieldApy": 7.45,
    "waltYears": 6.5,
    "legalEntity": "West End Media Estates Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Knight Frank West End"
  },
  {
    "id": "re-41",
    "name": "Interlaken Jungfrau Alpine Luxury Hotel",
    "region": "Switzerland",
    "location": "Interlaken: Höheweg 41",
    "spvCode": "CH-SPV-INT-06",
    "valuation": 1150000,
    "unrealizedUpliftPct": 15.1,
    "tokenCount": 2300,
    "tokenPrice": 500,
    "occupancyPct": 96.4,
    "netRentalYieldApy": 6.8,
    "waltYears": 12,
    "legalEntity": "Berner Oberland Hospitality AG",
    "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Swiss Hotel Advisory Group"
  },
  {
    "id": "re-42",
    "name": "Bonn UN Diplomatic Enclave Office",
    "region": "Germany",
    "location": "Bonn: Platz der Vereinten Nationen 1",
    "spvCode": "DE-SPV-BNN-04",
    "valuation": 580000,
    "unrealizedUpliftPct": 6.2,
    "tokenCount": 1160,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.85,
    "waltYears": 9,
    "legalEntity": "Rhein Diplomatic Real Estate GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "BNP Paribas Bonn Advisory"
  },
  {
    "id": "re-43",
    "name": "Leeds Financial Quarter Grade-A Hub",
    "region": "United Kingdom",
    "location": "Leeds: Wellington Place 6",
    "spvCode": "UK-SPV-LEE-03",
    "valuation": 760000,
    "unrealizedUpliftPct": 7.9,
    "tokenCount": 1520,
    "tokenPrice": 500,
    "occupancyPct": 97.8,
    "netRentalYieldApy": 8.1,
    "waltYears": 8,
    "legalEntity": "Yorkshire Prime Commercial Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Knight Frank Leeds Desk"
  },
  {
    "id": "re-44",
    "name": "Neuchâtel Micro-Technology Silicon Lab",
    "region": "Switzerland",
    "location": "Neuchâtel: Rue Jaquet-Droz 1",
    "spvCode": "CH-SPV-NEU-09",
    "valuation": 790000,
    "unrealizedUpliftPct": 9.8,
    "tokenCount": 1580,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.55,
    "waltYears": 8.5,
    "legalEntity": "CSEM Precision Technology Enclave SA",
    "imageUrl": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Wüest Partner Jura"
  },
  {
    "id": "re-45",
    "name": "Mannheim Green Logistics & Rail Hub",
    "region": "Germany",
    "location": "Mannheim: Turbinenstrasse 20",
    "spvCode": "DE-SPV-MAN-11",
    "valuation": 670000,
    "unrealizedUpliftPct": 8,
    "tokenCount": 1340,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 8.3,
    "waltYears": 10,
    "legalEntity": "Neckar Multi-Modal Logistics GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Colliers Industrial Rhine-Neckar"
  },
  {
    "id": "re-46",
    "name": "London City Leadenhall Institutional Center",
    "region": "United Kingdom",
    "location": "London: 122 Leadenhall Street",
    "spvCode": "UK-SPV-LEA-15",
    "valuation": 2250000,
    "unrealizedUpliftPct": 10.2,
    "tokenCount": 4500,
    "tokenPrice": 500,
    "occupancyPct": 99,
    "netRentalYieldApy": 6.75,
    "waltYears": 11.5,
    "legalEntity": "City of London Global Estates Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "CBRE City of London"
  },
  {
    "id": "re-47",
    "name": "Winterthur Sulzer High-Tech Innovation Park",
    "region": "Switzerland",
    "location": "Winterthur: Zürcherstrasse 39",
    "spvCode": "CH-SPV-WIN-07",
    "valuation": 830000,
    "unrealizedUpliftPct": 11.4,
    "tokenCount": 1660,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.65,
    "waltYears": 8,
    "legalEntity": "Sulzer Legacy Technology AG",
    "imageUrl": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "CBRE Winterthur Desk"
  },
  {
    "id": "re-48",
    "name": "Karlsruhe Energy & AI Cloud Data Center",
    "region": "Germany",
    "location": "Karlsruhe: Am Fasanengarten 5",
    "spvCode": "DE-SPV-KAR-02",
    "valuation": 910000,
    "unrealizedUpliftPct": 9.5,
    "tokenCount": 1820,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 8.55,
    "waltYears": 11,
    "legalEntity": "Baden Green Data Enclave GmbH",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "JLL Hyperscale Advisory"
  },
  {
    "id": "re-49",
    "name": "Glasgow George Square Global Chambers",
    "region": "United Kingdom",
    "location": "Glasgow: George Square 14",
    "spvCode": "UK-SPV-GLA-05",
    "valuation": 680000,
    "unrealizedUpliftPct": 7,
    "tokenCount": 1360,
    "tokenPrice": 500,
    "occupancyPct": 96.5,
    "netRentalYieldApy": 8.2,
    "waltYears": 7.5,
    "legalEntity": "Clyde Institutional Properties Ltd",
    "imageUrl": "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Ryden Glasgow Commercial"
  },
  {
    "id": "re-50",
    "name": "Fribourg Agri-Food BioTech Campus",
    "region": "Switzerland",
    "location": "Fribourg: Passage du Cardinal 1",
    "spvCode": "CH-SPV-FRI-10",
    "valuation": 740000,
    "unrealizedUpliftPct": 8.9,
    "tokenCount": 1480,
    "tokenPrice": 500,
    "occupancyPct": 100,
    "netRentalYieldApy": 7.9,
    "waltYears": 8.5,
    "legalEntity": "Fribourg Bio-Valley Holdings SA",
    "imageUrl": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
    "appraisalStandard": "Wüest Partner Western CH"
  }
];

export const RENTAL_DISTRIBUTION_HISTORY: RentalDistributionItem[] = [
  {
    id: 'dist-mar-25',
    period: 'March 2025 (Current)',
    projected: 16950.0,
    actual: 17100.0,
    varianceDelta: 150.0,
    settlementHash: '0x9c41...b72f',
    status: 'CLEARED',
  },
  {
    id: 'dist-feb-25',
    period: 'February 2025',
    projected: 16950.0,
    actual: 17100.0,
    varianceDelta: 150.0,
    settlementHash: '0x81b2...99ca',
    status: 'CLEARED',
  },
  {
    id: 'dist-jan-25',
    period: 'January 2025',
    projected: 16950.0,
    actual: 17100.0,
    varianceDelta: 150.0,
    settlementHash: '0x34aa...e018',
    status: 'CLEARED',
  },
  {
    id: 'dist-dec-24',
    period: 'December 2024',
    projected: 16700.0,
    actual: 16850.0,
    varianceDelta: 150.0,
    settlementHash: '0x72ef...15ad',
    status: 'CLEARED',
  },
  {
    id: 'dist-nov-24',
    period: 'November 2024',
    projected: 16700.0,
    actual: 16850.0,
    varianceDelta: 150.0,
    settlementHash: '0x11ab...6389',
    status: 'CLEARED',
  },
  {
    id: 'dist-oct-24',
    period: 'October 2024',
    projected: 16500.0,
    actual: 16650.0,
    varianceDelta: 150.0,
    settlementHash: '0x44dc...819e',
    status: 'CLEARED',
  },
];

export const INITIAL_OTC_ORDERS: SecondaryOtcOrder[] = [
  {
    id: 'otc-1',
    type: 'OFFER',
    propertyName: 'One Zurich Financial Center',
    tokenCount: 250,
    pricePerToken: 508.0,
    navPremiumDiscountPct: 1.6,
    counterpartyEnclave: 'Enclave #0981 (Zurich Family Office)',
    totalUsd: 127000.0,
  },
  {
    id: 'otc-2',
    type: 'BID',
    propertyName: 'London Mayfair Luxury Mews',
    tokenCount: 500,
    pricePerToken: 495.0,
    navPremiumDiscountPct: -1.0,
    counterpartyEnclave: 'Swiss Family Office #04',
    totalUsd: 247500.0,
  },
  {
    id: 'otc-3',
    type: 'OFFER',
    propertyName: 'Frankfurt Hyperscale Data Hub',
    tokenCount: 150,
    pricePerToken: 512.0,
    navPremiumDiscountPct: 2.4,
    counterpartyEnclave: 'Nordic Global Vault #12',
    totalUsd: 76800.0,
  },
  {
    id: 'otc-4',
    type: 'BID',
    propertyName: 'Geneva Lakeside Villa',
    tokenCount: 300,
    pricePerToken: 505.0,
    navPremiumDiscountPct: 1.0,
    counterpartyEnclave: 'Geneva Private Bank Desk',
    totalUsd: 151500.0,
  },
];

// -------------------------------------------------------------------------
// EXOTIC VEHICLES & HOROLOGY TELEMETRY
// -------------------------------------------------------------------------

export const CARS_SUMMARY_METRICS = [
  {
    label: 'VAULTED VALUATION',
    badge: '5.7% Consolidated NAV',
    value: '$850,000.00',
    delta: '+$106,000.00 (+14.24%)',
    footerKey: 'Consolidated NAV Basis: $14.82M',
    footerVal: 'Marked Uncompromised',
  },
  {
    label: '1-YEAR INDEX GROWTH',
    badge: '+8.1% vs Benchmark',
    value: '+14.2%',
    delta: 'Hagerty Blue Chip',
    footerKey: 'Vintage Collector Alpha',
    footerVal: 'Top Decile Trajectory',
  },
  {
    label: 'ACTIVE INSURED LIMIT',
    badge: 'Policy #LL-CH-892401',
    value: '$1,200,000.00',
    delta: 'Agreed Value (Lloyds Specie)',
    footerKey: 'Lloyds Syndicate 2003',
    footerVal: 'Active & Bonded',
  },
  {
    label: 'PHYSICAL VAULT TELEMETRY',
    badge: 'Dual Sensor Feed',
    value: 'Dual Vaults',
    delta: 'Geneva: 19.5°C | Zurich: 20.0°C',
    footerKey: 'Preservation Standard',
    footerVal: 'DIN 14096 Certified',
  },
];

export const EXOTIC_ASSETS: ExoticAsset[] = [
  {
    "id": "car-1",
    "type": "vehicle",
    "title": "1997 Porsche 911 GT2 (993) Clubsport",
    "subtitle": "1 of 57 Street-Legal Homologation Specials • Air-Cooled 3.6L Twin-Turbo 430hp • Arctic Silver",
    "fairMarketValue": 580000,
    "acquisitionPrice": 495000,
    "unrealizedGain": 85000,
    "gainPct": 17.17,
    "indexTrend5YrPct": 61.1,
    "indexBenchmark": "Hagerty Valuation Index",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 99.4,
    "conditionLabel": "Concours Gold Standard",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "WP0ZZZ99ZTS390412"
      },
      {
        "label": "Engine Code",
        "value": "M64/60-61 Matching"
      },
      {
        "label": "Certified Odo",
        "value": "14,820 km"
      }
    ],
    "climateTelemetry": "19.5°C / 48% RH (Geneva Enclave Auto)",
    "underwritingPolicy": "Lloyds of London Specie #LL-CH-892401",
    "insuredValue": 800000,
    "imageUrl": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-1",
    "type": "horology",
    "title": "Patek Philippe Grand Complications 5270P",
    "subtitle": "Perpetual Calendar Chronograph in 950 Platinum with Emerald Green Sunburst Dial",
    "fairMarketValue": 270000,
    "acquisitionPrice": 235000,
    "unrealizedGain": 35000,
    "gainPct": 14.89,
    "indexTrend5YrPct": 42.4,
    "indexBenchmark": "Phillips / WatchCharts Index: AAA",
    "vaultLocation": "Zurich Old Town Bank Enclave (Class IX Safe)",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "Factory Blister / Unworn Sealed",
    "primaryAttributes": [
      {
        "label": "Movement Serial",
        "value": "CH 29-535 PS Q"
      },
      {
        "label": "Case Number",
        "value": "5892104 / 950 Pt"
      },
      {
        "label": "Registry Extract",
        "value": "Confirmed Archive"
      }
    ],
    "climateTelemetry": "20.0°C / 45% N2 Inerte Sealed",
    "underwritingPolicy": "Lloyds Specie Syndicate 2003",
    "insuredValue": 400000,
    "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-2",
    "type": "vehicle",
    "title": "1961 Ferrari 250 GT California Spider SWB",
    "subtitle": "Covered Headlights • Scaglietti Steel Coachwork • Tipo 168 Comp V12 • Rosso Corsa",
    "fairMarketValue": 14500000,
    "acquisitionPrice": 12800000,
    "unrealizedGain": 1700000,
    "gainPct": 13.28,
    "indexTrend5YrPct": 78.4,
    "indexBenchmark": "Hagerty Historic Ferrari Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #1A",
    "custodyEnclave": "CH-FREEPORT-GEN-01A",
    "conditionScore": 99.8,
    "conditionLabel": "Ferrari Classiche Certified Red Book",
    "primaryAttributes": [
      {
        "label": "Chassis Number",
        "value": "2871 GT"
      },
      {
        "label": "Classiche Cert",
        "value": "Factory Archive Verified"
      },
      {
        "label": "Matching Numbers",
        "value": "Engine & Gearbox #168"
      }
    ],
    "climateTelemetry": "19.8°C / 46% RH Controlled",
    "underwritingPolicy": "Lloyds Specie Blue Chip #LL-CH-91024",
    "insuredValue": 16000000,
    "imageUrl": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-3",
    "type": "vehicle",
    "title": "1995 McLaren F1 Road Car (Chassis #029)",
    "subtitle": "Gordon Murray Masterpiece • Central Driving Position • BMW S70/2 6.1L V12 627hp • Creighton Brown",
    "fairMarketValue": 22000000,
    "acquisitionPrice": 19500000,
    "unrealizedGain": 2500000,
    "gainPct": 12.82,
    "indexTrend5YrPct": 92.6,
    "indexBenchmark": "McLaren F1 Heritage Benchmark",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 99.6,
    "conditionLabel": "MSO Heritage Certified Provenance",
    "primaryAttributes": [
      {
        "label": "Chassis Number",
        "value": "F1-029"
      },
      {
        "label": "Odometer",
        "value": "3,840 km Documented"
      },
      {
        "label": "Faceted Tool Roll",
        "value": "Titanium Original Complete"
      }
    ],
    "climateTelemetry": "20.1°C / 44% RH Nitrogen Buffer",
    "underwritingPolicy": "Lloyds Specie Global Hypercar #LL-CH-99411",
    "insuredValue": 25000000,
    "imageUrl": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-2",
    "type": "horology",
    "title": "Rolex Daytona \"Paul Newman\" Exotic Dial Ref. 6239",
    "subtitle": "Valjoux 722 Chronograph • Three-Color White/Black/Red Dial • Stepped Sub-Dials • Steel Case",
    "fairMarketValue": 1850000,
    "acquisitionPrice": 1550000,
    "unrealizedGain": 300000,
    "gainPct": 19.35,
    "indexTrend5YrPct": 54.2,
    "indexBenchmark": "Phillips Vintage Rolex Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 98.9,
    "conditionLabel": "Unpolished Bevels & Original Lume",
    "primaryAttributes": [
      {
        "label": "Serial Number",
        "value": "2.005.xxx (1969)"
      },
      {
        "label": "Movement Caliber",
        "value": "Valjoux 722 17J"
      },
      {
        "label": "Bracelet Ref",
        "value": "7205 Riveted C+I"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 2200000,
    "imageUrl": "https://images.unsplash.com/photo-1547996160-71dfa6358248?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-4",
    "type": "vehicle",
    "title": "1955 Mercedes-Benz 300 SL Gullwing Coupe",
    "subtitle": "Direct Mechanical Fuel Injection • Rudge Knock-Off Wheels • Fitted Luggage • Silver Metallic / Red Leather",
    "fairMarketValue": 2400000,
    "acquisitionPrice": 2050000,
    "unrealizedGain": 350000,
    "gainPct": 17.07,
    "indexTrend5YrPct": 48.9,
    "indexBenchmark": "Hagerty German Collector Index",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 99.1,
    "conditionLabel": "Mercedes-Benz Classic Center Stuttgart Cert",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "198.040.5500642"
      },
      {
        "label": "Engine Code",
        "value": "M198 Matching Numbers"
      },
      {
        "label": "Restoration",
        "value": "Kienle Automobiltechnik Concours"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Historic Specie #LL-CH-88210",
    "insuredValue": 2800000,
    "imageUrl": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-3",
    "type": "horology",
    "title": "Richard Mille RM 50-03 McLaren F1 Tourbillon",
    "subtitle": "Split-Seconds Chronograph • Graph TPT Ultralight (40g) • 30-Piece Limited Series • Skeletonized",
    "fairMarketValue": 1250000,
    "acquisitionPrice": 1050000,
    "unrealizedGain": 200000,
    "gainPct": 19.05,
    "indexTrend5YrPct": 38.5,
    "indexBenchmark": "WatchCharts Ultra-Complication Index",
    "vaultLocation": "Zurich Old Town Bank Enclave (Class IX Safe)",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 99.7,
    "conditionLabel": "Mint Complete Box & Papers",
    "primaryAttributes": [
      {
        "label": "Limited Number",
        "value": "18 / 30"
      },
      {
        "label": "Case Material",
        "value": "Graph TPT Carbon"
      },
      {
        "label": "Power Reserve",
        "value": "70 Hours Dual Barrel"
      }
    ],
    "climateTelemetry": "20.0°C / 45% N2 Inerte Sealed",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 1500000,
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-5",
    "type": "vehicle",
    "title": "1987 Ferrari F40 LM Competizione",
    "subtitle": "Michelotto Factory Prepared • Twin-Turbo 2.9L Tipo F120B V8 720hp • GTC Spec Aerodynamics",
    "fairMarketValue": 6200000,
    "acquisitionPrice": 5400000,
    "unrealizedGain": 800000,
    "gainPct": 14.81,
    "indexTrend5YrPct": 69.4,
    "indexBenchmark": "Ferrari Supercar Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #2",
    "custodyEnclave": "CH-FREEPORT-GEN-02",
    "conditionScore": 99.3,
    "conditionLabel": "Factory Michelotto Heritage Extract",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "ZFFGJ34B000079890"
      },
      {
        "label": "Race Pedigree",
        "value": "IMSA GTO / Le Mans Tested"
      },
      {
        "label": "Dyno Verified",
        "value": "720 bhp @ 7,500 rpm"
      }
    ],
    "climateTelemetry": "19.4°C / 48% RH Auto",
    "underwritingPolicy": "Lloyds Motorsport Heritage #LL-RACE-1987",
    "insuredValue": 7000000,
    "imageUrl": "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-4",
    "type": "horology",
    "title": "F.P. Journe Chronomètre Bleu Tantalum",
    "subtitle": "Mirror-Polished Blue Chrome Dial • 39mm Tantalum Case • 18K Rose Gold Hand-Wound Movement",
    "fairMarketValue": 98000,
    "acquisitionPrice": 78000,
    "unrealizedGain": 20000,
    "gainPct": 25.64,
    "indexTrend5YrPct": 112.4,
    "indexBenchmark": "F.P. Journe Independent Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Collector Safe Sealed Mint",
    "primaryAttributes": [
      {
        "label": "Movement Serial",
        "value": "Calibre 1304 Rose Gold"
      },
      {
        "label": "Case Number",
        "value": "No. 892-CB"
      },
      {
        "label": "Warranty Card",
        "value": "Geneva Salon 2021"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 125000,
    "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-6",
    "type": "vehicle",
    "title": "2004 Porsche Carrera GT (Fayence Yellow)",
    "subtitle": "Naturally Aspirated 5.7L V10 605hp • 6-Speed Manual with Beechwood Shifter • Carbon Monocoque",
    "fairMarketValue": 1950000,
    "acquisitionPrice": 1650000,
    "unrealizedGain": 300000,
    "gainPct": 18.18,
    "indexTrend5YrPct": 82.5,
    "indexBenchmark": "Hagerty Modern Classic Index",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 99.7,
    "conditionLabel": "Weissach Factory Major Service Cleared",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "WP0ZZZ98Z4L001249"
      },
      {
        "label": "Odometer",
        "value": "4,120 km Verified"
      },
      {
        "label": "Clutch Wear",
        "value": "3.1 mm (95% Life Remaining)"
      }
    ],
    "climateTelemetry": "20.1°C / 44% RH Nitrogen Buffer",
    "underwritingPolicy": "Lloyds Modern Collector #LL-PORSCHE-04",
    "insuredValue": 2300000,
    "imageUrl": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-5",
    "type": "horology",
    "title": "Audemars Piguet Royal Oak Concept Split-Seconds GMT",
    "subtitle": "Flyback Chronograph • Forged Carbon & Ceramic 43mm Case • Self-Winding Calibre 4407",
    "fairMarketValue": 245000,
    "acquisitionPrice": 210000,
    "unrealizedGain": 35000,
    "gainPct": 16.67,
    "indexTrend5YrPct": 44,
    "indexBenchmark": "Audemars Piguet Concept Index",
    "vaultLocation": "Zurich Old Town Bank Enclave (Class IX Safe)",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 99.8,
    "conditionLabel": "Le Brassus Heritage Complete Set",
    "primaryAttributes": [
      {
        "label": "Case Number",
        "value": "AP-RO-89104C"
      },
      {
        "label": "Calibre Ref",
        "value": "4407 Integrated Flyback"
      },
      {
        "label": "Material",
        "value": "Forged Carbon / Blue Ceramic"
      }
    ],
    "climateTelemetry": "20.0°C / 45% N2 Inerte Sealed",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 300000,
    "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-7",
    "type": "vehicle",
    "title": "2021 Bugatti Chiron Pur Sport",
    "subtitle": "1 of 60 Built • Quad-Turbo 8.0L W16 1,500hp • Fixed Rear Wing • Magnesum Wheels • Jaune Molsheim",
    "fairMarketValue": 4800000,
    "acquisitionPrice": 4200000,
    "unrealizedGain": 600000,
    "gainPct": 14.29,
    "indexTrend5YrPct": 41.2,
    "indexBenchmark": "Bugatti Molsheim Global Benchmark",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 99.9,
    "conditionLabel": "Factory Flying Doctor Inspected",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "VF9CC8145M0795021"
      },
      {
        "label": "Limited Plate",
        "value": "Pur Sport No. 14 / 60"
      },
      {
        "label": "Factory Warranty",
        "value": "Bugatti Passeport Tranquillité"
      }
    ],
    "climateTelemetry": "19.5°C / 48% RH (Geneva Enclave Auto)",
    "underwritingPolicy": "Lloyds Global Hypercar #LL-BUGATTI-21",
    "insuredValue": 5500000,
    "imageUrl": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-6",
    "type": "horology",
    "title": "A. Lange & Söhne Zeitwerk Minute Repeater in Platinum",
    "subtitle": "Decimal Minute Repeater • Mechanical Digital Jumping Numerals Display • Glashütte In-House Calibre L043.5",
    "fairMarketValue": 520000,
    "acquisitionPrice": 450000,
    "unrealizedGain": 70000,
    "gainPct": 15.56,
    "indexTrend5YrPct": 51.8,
    "indexBenchmark": "Lange High-Complication Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Factory Sealed Double Boxed",
    "primaryAttributes": [
      {
        "label": "Movement No",
        "value": "112.490 Glashütte"
      },
      {
        "label": "Case Number",
        "value": "232.025 Platinum 950"
      },
      {
        "label": "Acoustic Tune",
        "value": "Decimal Chime Tested"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 650000,
    "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-8",
    "type": "vehicle",
    "title": "2015 Ferrari LaFerrari Aperta",
    "subtitle": "HY-KERS 6.3L V12 Hybrid 963hp • Carbon Fiber Removable Roof • 1 of 210 Worldwide • Nero Daytona",
    "fairMarketValue": 5900000,
    "acquisitionPrice": 5100000,
    "unrealizedGain": 800000,
    "gainPct": 15.69,
    "indexTrend5YrPct": 58.6,
    "indexBenchmark": "Ferrari Aperta Collector Benchmark",
    "vaultLocation": "Geneva Freeport Sub-Vault #1A",
    "custodyEnclave": "CH-FREEPORT-GEN-01A",
    "conditionScore": 99.8,
    "conditionLabel": "Maranello Classiche Attestation",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "ZFF80RPB000214890"
      },
      {
        "label": "Delivery Odo",
        "value": "980 km Delivery Mileage"
      },
      {
        "label": "Battery Health",
        "value": "HY-KERS Cell 99.2%"
      }
    ],
    "climateTelemetry": "19.8°C / 46% RH Controlled",
    "underwritingPolicy": "Lloyds Specie Hypercar #LL-LAF-015",
    "insuredValue": 6800000,
    "imageUrl": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-7",
    "type": "horology",
    "title": "Patek Philippe Nautilus Ref. 5711/1P 40th Anniversary",
    "subtitle": "Solid 950 Platinum Case & Bracelet • Diamond Hour Markers • Embossed Commemorative Dial 1976-2016",
    "fairMarketValue": 480000,
    "acquisitionPrice": 410000,
    "unrealizedGain": 70000,
    "gainPct": 17.07,
    "indexTrend5YrPct": 65,
    "indexBenchmark": "Patek Philippe Nautilus Index",
    "vaultLocation": "Zurich Old Town Bank Enclave (Class IX Safe)",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 99.9,
    "conditionLabel": "Double Sealed Cork Box Complete",
    "primaryAttributes": [
      {
        "label": "Case Number",
        "value": "5921840 / 950 Pt"
      },
      {
        "label": "Dial Signature",
        "value": "40 1976-2016 Embossed"
      },
      {
        "label": "Bezel Diamond",
        "value": "Top Wesselton 6 o'clock"
      }
    ],
    "climateTelemetry": "20.0°C / 45% N2 Inerte Sealed",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 580000,
    "imageUrl": "https://images.unsplash.com/photo-1547996160-71dfa6358248?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-9",
    "type": "vehicle",
    "title": "1963 Aston Martin DB5 James Bond Vantage Spec",
    "subtitle": "Tadek Marek 4.0L DOHC Inline-6 • Triple Weber Carburetors • 5-Speed ZF Manual • Silver Birch",
    "fairMarketValue": 1400000,
    "acquisitionPrice": 1180000,
    "unrealizedGain": 220000,
    "gainPct": 18.64,
    "indexTrend5YrPct": 45.2,
    "indexBenchmark": "Hagerty British Classic Index",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 99.2,
    "conditionLabel": "Aston Martin Works Heritage Restored",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "DB5/1489/R"
      },
      {
        "label": "Engine",
        "value": "400/1489 Vantage Spec"
      },
      {
        "label": "Heritage Certificate",
        "value": "Gaydon Archive Certified"
      }
    ],
    "climateTelemetry": "20.1°C / 44% RH Nitrogen Buffer",
    "underwritingPolicy": "Lloyds British Heritage #LL-ASTON-63",
    "insuredValue": 1700000,
    "imageUrl": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-8",
    "type": "horology",
    "title": "MB&F Legacy Machine Perpetual Palladium",
    "subtitle": "Stephen McDonnell Revolutionary Perpetual Calendar Engine • 14mm Flying Balance Wheel • Palladium 950",
    "fairMarketValue": 195000,
    "acquisitionPrice": 168000,
    "unrealizedGain": 27000,
    "gainPct": 16.07,
    "indexTrend5YrPct": 52,
    "indexBenchmark": "Independent Horology Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Factory New Sealed 25-Piece Series",
    "primaryAttributes": [
      {
        "label": "Series Number",
        "value": "Piece No. 07 / 25"
      },
      {
        "label": "Mechanical Processor",
        "value": "Default 28-day baseline"
      },
      {
        "label": "Case Metal",
        "value": "Palladium 950"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 240000,
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-10",
    "type": "vehicle",
    "title": "1971 Lamborghini Miura P400SV",
    "subtitle": "Split-Sump V12 385hp • Bertone Masterpiece • Ventilated Discs • Giallo Miura with Gold Sills",
    "fairMarketValue": 3850000,
    "acquisitionPrice": 3300000,
    "unrealizedGain": 550000,
    "gainPct": 16.67,
    "indexTrend5YrPct": 71,
    "indexBenchmark": "Hagerty Italian Exotic Index",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 99.5,
    "conditionLabel": "Polo Storico Lamborghini Certified",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "4878"
      },
      {
        "label": "Engine Number",
        "value": "30642 Split Sump"
      },
      {
        "label": "Production Record",
        "value": "1 of 150 SV Built"
      }
    ],
    "climateTelemetry": "19.5°C / 48% RH (Geneva Enclave Auto)",
    "underwritingPolicy": "Lloyds Classic Exotic #LL-LAMBO-71",
    "insuredValue": 4400000,
    "imageUrl": "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-11",
    "type": "vehicle",
    "title": "2010 Pagani Zonda Cinque Roadster",
    "subtitle": "7.3L AMG V12 678hp • 1 of 5 Worldwide • Carbon-Titanium Carbo-Triax Tub",
    "fairMarketValue": 11500000,
    "acquisitionPrice": 9800000,
    "unrealizedGain": 1700000,
    "gainPct": 17.35,
    "indexTrend5YrPct": 88.4,
    "indexBenchmark": "Pagani Collector Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #1A",
    "custodyEnclave": "CH-FREEPORT-GEN-01A",
    "conditionScore": 99.9,
    "conditionLabel": "Pagani Rinascimento Certified",
    "primaryAttributes": [
      {
        "label": "VIN",
        "value": "ZA9ZONDA05"
      },
      {
        "label": "Engine",
        "value": "AMG M120 No. 05"
      },
      {
        "label": "Odo",
        "value": "1,240 km"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 13225000,
    "imageUrl": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-9",
    "type": "horology",
    "title": "Vacheron Constantin Overseas Tourbillon Skeleton",
    "subtitle": "Titanium 42.5mm Case • Ultra-Thin Calibre 2160SQ • Geneva Seal Hallmark",
    "fairMarketValue": 165000,
    "acquisitionPrice": 142000,
    "unrealizedGain": 23000,
    "gainPct": 16.2,
    "indexTrend5YrPct": 36.5,
    "indexBenchmark": "Vacheron Constantin Index",
    "vaultLocation": "Zurich Old Town Bank Enclave",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "Poinçon de Genève Certified",
    "primaryAttributes": [
      {
        "label": "Movement No",
        "value": "5410920"
      },
      {
        "label": "Case",
        "value": "Grade 5 Titanium"
      },
      {
        "label": "Bracelet",
        "value": "3-Interchangeable System"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 189750,
    "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-12",
    "type": "vehicle",
    "title": "2023 Koenigsegg Jesko Attack",
    "subtitle": "5.0L Twin-Turbo V8 1,600hp on E85 • Light Speed Transmission (LST) 9-Speed",
    "fairMarketValue": 4200000,
    "acquisitionPrice": 3650000,
    "unrealizedGain": 550000,
    "gainPct": 15.07,
    "indexTrend5YrPct": 39.5,
    "indexBenchmark": "Koenigsegg Benchmark",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 99.9,
    "conditionLabel": "Ängelholm Factory Certified",
    "primaryAttributes": [
      {
        "label": "Chassis",
        "value": "YT9JESKO04"
      },
      {
        "label": "Aero Downforce",
        "value": "1,400 kg"
      },
      {
        "label": "Odo",
        "value": "480 km"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 4830000,
    "imageUrl": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-10",
    "type": "horology",
    "title": "Rolex Submariner \"MilSub\" Ref. 5517 Royal Navy",
    "subtitle": "Fixed Spring Bars • Sword Hands • Fully Graduated 60-Min Bezel • MOD Dial",
    "fairMarketValue": 240000,
    "acquisitionPrice": 205000,
    "unrealizedGain": 35000,
    "gainPct": 17.07,
    "indexTrend5YrPct": 49,
    "indexBenchmark": "Military Watch Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 98.4,
    "conditionLabel": "MOD Provenance Verified Archive",
    "primaryAttributes": [
      {
        "label": "Serial",
        "value": "3.92x.xxx (1974)"
      },
      {
        "label": "Caseback",
        "value": "0552/923-7697"
      },
      {
        "label": "Lume",
        "value": "Tritium Circle T Original"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 276000,
    "imageUrl": "https://images.unsplash.com/photo-1547996160-71dfa6358248?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-13",
    "type": "vehicle",
    "title": "1998 McLaren F1 GTR Longtail (Chassis #28R)",
    "subtitle": "BMW Motorsport 6.0L V12 • FIA GT Championship Winner • Gulf / Davidoff Livery",
    "fairMarketValue": 18500000,
    "acquisitionPrice": 16200000,
    "unrealizedGain": 2300000,
    "gainPct": 14.2,
    "indexTrend5YrPct": 75,
    "indexBenchmark": "McLaren Racing Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #2",
    "custodyEnclave": "CH-FREEPORT-GEN-02",
    "conditionScore": 99.4,
    "conditionLabel": "MSO Heritage Race Certification",
    "primaryAttributes": [
      {
        "label": "Chassis",
        "value": "28R FIA GT"
      },
      {
        "label": "Weight",
        "value": "915 kg Dry"
      },
      {
        "label": "Logbook",
        "value": "FIA Historic Pass"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 21275000,
    "imageUrl": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-11",
    "type": "horology",
    "title": "Cartier Crash London Dial 1991 Limited Series",
    "subtitle": "Yellow Gold Asymmetrical Case • Mechanical Calibre 841 • London Hallmark",
    "fairMarketValue": 285000,
    "acquisitionPrice": 240000,
    "unrealizedGain": 45000,
    "gainPct": 18.75,
    "indexTrend5YrPct": 84,
    "indexBenchmark": "Cartier Vintage Index",
    "vaultLocation": "Zurich Old Town Bank Enclave",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 99.5,
    "conditionLabel": "Cartier Heritage Extract",
    "primaryAttributes": [
      {
        "label": "Hallmark",
        "value": "London 1991"
      },
      {
        "label": "Deployant",
        "value": "Original 18K Gold"
      },
      {
        "label": "Dial",
        "value": "Cartier Paris Signature"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 327750,
    "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-14",
    "type": "vehicle",
    "title": "2019 Porsche 911 GT2 RS Weissach Package",
    "subtitle": "3.8L Twin-Turbo Boxer-6 700hp • Carbon Magnesium Roof • Nürburgring Record Spec",
    "fairMarketValue": 520000,
    "acquisitionPrice": 445000,
    "unrealizedGain": 75000,
    "gainPct": 16.85,
    "indexTrend5YrPct": 34,
    "indexBenchmark": "Porsche GT Registry",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 99.8,
    "conditionLabel": "Porsche Approved 111-Point Check",
    "primaryAttributes": [
      {
        "label": "VIN",
        "value": "WP0AF2A97KS189210"
      },
      {
        "label": "Weight",
        "value": "Weissach Magnesium Pkg"
      },
      {
        "label": "Odo",
        "value": "2,150 km"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 598000,
    "imageUrl": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-12",
    "type": "horology",
    "title": "Audemars Piguet Royal Oak Jumbo Extra-Thin 16202ST",
    "subtitle": "50th Anniversary Rotor • Bleu Nuit Nuage 50 Dial • In-House Calibre 7121",
    "fairMarketValue": 95000,
    "acquisitionPrice": 78000,
    "unrealizedGain": 17000,
    "gainPct": 21.79,
    "indexTrend5YrPct": 41.5,
    "indexBenchmark": "Royal Oak Blue Chip Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Factory Sealed Le Brassus",
    "primaryAttributes": [
      {
        "label": "Case",
        "value": "50th Anniv Engraved"
      },
      {
        "label": "Thickness",
        "value": "8.1 mm"
      },
      {
        "label": "Calibre",
        "value": "7121 Extra-Thin"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 109250,
    "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-15",
    "type": "vehicle",
    "title": "1967 Ferrari 275 GTB/4 Scaglietti Berlinetta",
    "subtitle": "Four-Cam 3.3L Colombo V12 300hp • Six Weber Carburetors • Grigio Argento",
    "fairMarketValue": 3950000,
    "acquisitionPrice": 3400000,
    "unrealizedGain": 550000,
    "gainPct": 16.18,
    "indexTrend5YrPct": 62.4,
    "indexBenchmark": "Ferrari 275 Index",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 99.6,
    "conditionLabel": "Ferrari Classiche Certified",
    "primaryAttributes": [
      {
        "label": "Chassis",
        "value": "10451 GT"
      },
      {
        "label": "Gearbox",
        "value": "5-Speed Transaxle Matching"
      },
      {
        "label": "Original Interior",
        "value": "Nero Connolly"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 4542500,
    "imageUrl": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-13",
    "type": "horology",
    "title": "Patek Philippe Aquanaut Chronograph Ref. 5968G",
    "subtitle": "Midnight Blue Embossed Dial • 18K White Gold • Flyback Chrono Calibre CH 28-520",
    "fairMarketValue": 88000,
    "acquisitionPrice": 74000,
    "unrealizedGain": 14000,
    "gainPct": 18.92,
    "indexTrend5YrPct": 33,
    "indexBenchmark": "Patek Aquanaut Index",
    "vaultLocation": "Zurich Old Town Bank Enclave",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "Full Set Geneva Boutique",
    "primaryAttributes": [
      {
        "label": "Case",
        "value": "42.2 mm White Gold"
      },
      {
        "label": "Calibre",
        "value": "CH 28-520 C Auto"
      },
      {
        "label": "Straps",
        "value": "Blue & Black Composite"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 101200,
    "imageUrl": "https://images.unsplash.com/photo-1547996160-71dfa6358248?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-16",
    "type": "vehicle",
    "title": "2008 Alfa Romeo 8C Competizione",
    "subtitle": "4.7L Ferrari-Built V8 450hp • Carbon Fiber Bodywork • 1 of 500 • Rosso 8C Competizione",
    "fairMarketValue": 340000,
    "acquisitionPrice": 285000,
    "unrealizedGain": 55000,
    "gainPct": 19.3,
    "indexTrend5YrPct": 28.5,
    "indexBenchmark": "Alfa Romeo Heritage Index",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 99.5,
    "conditionLabel": "Museo Storico Alfa Romeo Cert",
    "primaryAttributes": [
      {
        "label": "VIN",
        "value": "ZAR920000*00000184"
      },
      {
        "label": "Luggage",
        "value": "Schedoni 8C Complete"
      },
      {
        "label": "Odo",
        "value": "3,950 km"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 391000,
    "imageUrl": "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-14",
    "type": "horology",
    "title": "De Bethune DB28 Starry Varius Titanium",
    "subtitle": "Titanium 3D Moon Phase • Mirror-Polished Starry Sky Dial • Floating Lugs Calibre DB2105",
    "fairMarketValue": 145000,
    "acquisitionPrice": 120000,
    "unrealizedGain": 25000,
    "gainPct": 20.83,
    "indexTrend5YrPct": 46,
    "indexBenchmark": "Independent Haute Horlogerie Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 99.8,
    "conditionLabel": "L'Auberson Manufacture Cert",
    "primaryAttributes": [
      {
        "label": "Balance",
        "value": "Silicon/White Gold"
      },
      {
        "label": "Moon Phase",
        "value": "1-day error in 1112 yrs"
      },
      {
        "label": "Power Reserve",
        "value": "6 Days Dual"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 166750,
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-17",
    "type": "vehicle",
    "title": "1992 Jaguar XJ220 Le Mans Homologation",
    "subtitle": "Twin-Turbo 3.5L V6 542hp • Group B Provenance • Spa Silver / Smoke Grey Leather",
    "fairMarketValue": 620000,
    "acquisitionPrice": 530000,
    "unrealizedGain": 90000,
    "gainPct": 16.98,
    "indexTrend5YrPct": 42,
    "indexBenchmark": "British Supercar Index",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 99.1,
    "conditionLabel": "Don Law Racing Specialist Rebuilt",
    "primaryAttributes": [
      {
        "label": "Chassis",
        "value": "SA9AB12D3NA220642"
      },
      {
        "label": "Fuel Cell",
        "value": "FIA FT3 Renewed 2024"
      },
      {
        "label": "Odo",
        "value": "4,890 km"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 713000,
    "imageUrl": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-15",
    "type": "horology",
    "title": "Richard Mille RM 11-03 Jean Todt Chronograph",
    "subtitle": "Blue & White Quartz TPT • Flyback Chronograph • Carbon Skeletonized Calibre RMAC3",
    "fairMarketValue": 420000,
    "acquisitionPrice": 360000,
    "unrealizedGain": 60000,
    "gainPct": 16.67,
    "indexTrend5YrPct": 31.5,
    "indexBenchmark": "Richard Mille TPT Index",
    "vaultLocation": "Zurich Old Town Bank Enclave",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 99.7,
    "conditionLabel": "Jean Todt 150-Piece Limited Cert",
    "primaryAttributes": [
      {
        "label": "Case",
        "value": "Quartz TPT 50x44.5 mm"
      },
      {
        "label": "Rotor",
        "value": "Variable Geometry Titanium"
      },
      {
        "label": "Warranty",
        "value": "RM Service Warranty"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 483000,
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-18",
    "type": "vehicle",
    "title": "2016 Aston Martin Vulcan AMR Pro",
    "subtitle": "Track-Only 7.0L Naturally Aspirated V12 820hp • Carbon Tub • 1 of 24 Worldwide",
    "fairMarketValue": 2900000,
    "acquisitionPrice": 2500000,
    "unrealizedGain": 400000,
    "gainPct": 16,
    "indexTrend5YrPct": 36,
    "indexBenchmark": "Aston Martin Track Supercars",
    "vaultLocation": "Geneva Freeport Sub-Vault #2",
    "custodyEnclave": "CH-FREEPORT-GEN-02",
    "conditionScore": 99.8,
    "conditionLabel": "Aston Martin Racing Factory Pass",
    "primaryAttributes": [
      {
        "label": "Chassis",
        "value": "AMR-VULCAN-018"
      },
      {
        "label": "Aero",
        "value": "AMR Pro High-Downforce"
      },
      {
        "label": "Hours",
        "value": "14.5 Engine Operating Hrs"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 3335000,
    "imageUrl": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-16",
    "type": "horology",
    "title": "Rolex GMT-Master \"Bakelite\" Ref. 6542",
    "subtitle": "Bakelite Radium Bezel • Gilt Dial • Calibre 1030 • No Crown Guards (1956)",
    "fairMarketValue": 320000,
    "acquisitionPrice": 275000,
    "unrealizedGain": 45000,
    "gainPct": 16.36,
    "indexTrend5YrPct": 44,
    "indexBenchmark": "Vintage Rolex Sports Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 98.7,
    "conditionLabel": "Original Bakelite Geigercounter Tested",
    "primaryAttributes": [
      {
        "label": "Serial",
        "value": "189.xxx (1956)"
      },
      {
        "label": "Bezel",
        "value": "Original Bakelite Intact"
      },
      {
        "label": "Dial",
        "value": "OCC Swiss-Only Gilt"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 368000,
    "imageUrl": "https://images.unsplash.com/photo-1547996160-71dfa6358248?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-19",
    "type": "vehicle",
    "title": "1973 Porsche 911 Carrera 2.7 RS Lightweight (M471)",
    "subtitle": "Mechanical Fuel Injected 2.7L Flat-6 210hp • Thin-Gauge Steel Body • Grand Prix White/Blue",
    "fairMarketValue": 1650000,
    "acquisitionPrice": 1400000,
    "unrealizedGain": 250000,
    "gainPct": 17.86,
    "indexTrend5YrPct": 55,
    "indexBenchmark": "Hagerty Carrera RS Index",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 99.4,
    "conditionLabel": "Porsche Classic Certificate of Authenticity",
    "primaryAttributes": [
      {
        "label": "Chassis",
        "value": "911 360 0891"
      },
      {
        "label": "Code",
        "value": "M471 Factory Lightweight"
      },
      {
        "label": "Original Ducktail",
        "value": "Verified Magnesium"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 1897500,
    "imageUrl": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-17",
    "type": "horology",
    "title": "Patek Philippe Celestial Ref. 6102P Platinum",
    "subtitle": "Sky Moon Astronomical Display • Celestial Northern Hemisphere Chart • Calibre 240 LU CL C",
    "fairMarketValue": 390000,
    "acquisitionPrice": 335000,
    "unrealizedGain": 55000,
    "gainPct": 16.42,
    "indexTrend5YrPct": 38,
    "indexBenchmark": "Patek Grand Complications Index",
    "vaultLocation": "Zurich Old Town Bank Enclave",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "Geneva Salon Sealed Package",
    "primaryAttributes": [
      {
        "label": "Movement",
        "value": "Micro-Rotor 22K Gold"
      },
      {
        "label": "Case",
        "value": "44mm 950 Platinum"
      },
      {
        "label": "Sapphire Discs",
        "value": "3 Metallized Crystals"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 448500,
    "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-20",
    "type": "vehicle",
    "title": "2011 Ferrari 599 GTO",
    "subtitle": "6.0L V12 661hp • 1 of 599 • F1 SuperFast 60ms Gearbox • Corsa Red with Matte Silver Roof",
    "fairMarketValue": 980000,
    "acquisitionPrice": 840000,
    "unrealizedGain": 140000,
    "gainPct": 16.67,
    "indexTrend5YrPct": 39.5,
    "indexBenchmark": "Ferrari Modern Classic V12 Index",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 99.7,
    "conditionLabel": "Classiche Certified Red Book",
    "primaryAttributes": [
      {
        "label": "Chassis",
        "value": "ZFF70RJB000174120"
      },
      {
        "label": "Odo",
        "value": "2,400 km Documented"
      },
      {
        "label": "Carbon Pack",
        "value": "Full Engine & Aero"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 1127000,
    "imageUrl": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-18",
    "type": "horology",
    "title": "Audemars Piguet Royal Oak Tourbillon Extra-Thin Purple",
    "subtitle": "Plum Tapisserie Dial • 18K White Gold • Baguette Diamond Bezel (32 Diamonds 3.04ct)",
    "fairMarketValue": 295000,
    "acquisitionPrice": 250000,
    "unrealizedGain": 45000,
    "gainPct": 18,
    "indexTrend5YrPct": 42,
    "indexBenchmark": "Audemars Piguet Gemset Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 99.9,
    "conditionLabel": "Full Factory Diamonds Certified",
    "primaryAttributes": [
      {
        "label": "Case",
        "value": "41mm White Gold"
      },
      {
        "label": "Thickness",
        "value": "9.0 mm Extra-Thin"
      },
      {
        "label": "Calibre",
        "value": "2924 Hand-Wound Tourbillon"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 339250,
    "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-21",
    "type": "vehicle",
    "title": "1965 Shelby Cobra 427 S/C (Semi-Competition)",
    "subtitle": "Ford 427ci Side-Oiler V8 485hp • Halibrand Knock-Off Wheels • Guardsman Blue / White Stripes",
    "fairMarketValue": 2800000,
    "acquisitionPrice": 2400000,
    "unrealizedGain": 400000,
    "gainPct": 16.67,
    "indexTrend5YrPct": 60,
    "indexBenchmark": "Shelby American Registry Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #1A",
    "custodyEnclave": "CH-FREEPORT-GEN-01A",
    "conditionScore": 99.3,
    "conditionLabel": "SAAC Registry Documented Original",
    "primaryAttributes": [
      {
        "label": "Chassis",
        "value": "CSX 3042 S/C"
      },
      {
        "label": "Carburetors",
        "value": "Dual Holley 4-Barrel"
      },
      {
        "label": "Exhaust",
        "value": "Side-Pipe Ceramic Coated"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 3220000,
    "imageUrl": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-19",
    "type": "horology",
    "title": "Greubel Forsey Double Tourbillon 30° Technique",
    "subtitle": "Patented Bi-Axial Inclined Tourbillon • Openworked Architecture • 120h Power Reserve Platinum",
    "fairMarketValue": 310000,
    "acquisitionPrice": 265000,
    "unrealizedGain": 45000,
    "gainPct": 16.98,
    "indexTrend5YrPct": 35,
    "indexBenchmark": "Ultra-High End Independent Index",
    "vaultLocation": "Zurich Old Town Bank Enclave",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "La Chaux-de-Fonds Archive Extract",
    "primaryAttributes": [
      {
        "label": "Tourbillon",
        "value": "30° Inclined Cage (60s/4m)"
      },
      {
        "label": "Case",
        "value": "47.5mm Platinum 950"
      },
      {
        "label": "Power",
        "value": "4 Co-Axial Fast-Rotating Barrels"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 356500,
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-22",
    "type": "vehicle",
    "title": "2005 Ford GT Heritage Edition (Gulf Livery)",
    "subtitle": "Supercharged 5.4L DOHC V8 550hp • Ricardo 6-Speed Manual • Heritage Paint Code",
    "fairMarketValue": 640000,
    "acquisitionPrice": 545000,
    "unrealizedGain": 95000,
    "gainPct": 17.43,
    "indexTrend5YrPct": 44,
    "indexBenchmark": "American Modern Collectibles",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 99.8,
    "conditionLabel": "Ford GT Registry Documented",
    "primaryAttributes": [
      {
        "label": "VIN",
        "value": "1FAFP90S95Y401824"
      },
      {
        "label": "Options",
        "value": "4-Option BB Wheels & McIntosh"
      },
      {
        "label": "Odo",
        "value": "1,180 Miles"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 736000,
    "imageUrl": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-20",
    "type": "horology",
    "title": "Rolex Day-Date 40 \"Olive Dial\" 60th Anniv Ref. 228235",
    "subtitle": "Everose Gold 18K • Fluted Bezel • President Bracelet • Calibre 3255 Chronometer",
    "fairMarketValue": 58000,
    "acquisitionPrice": 49000,
    "unrealizedGain": 9000,
    "gainPct": 18.37,
    "indexTrend5YrPct": 28,
    "indexBenchmark": "Rolex Classic Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Green Tag Superlative Chronometer",
    "primaryAttributes": [
      {
        "label": "Dial",
        "value": "Sunburst Olive Green Roman"
      },
      {
        "label": "Precision",
        "value": "-2/+2 sec/day Superlative"
      },
      {
        "label": "Bracelet",
        "value": "Ceramic Inserts in Links"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 66700,
    "imageUrl": "https://images.unsplash.com/photo-1547996160-71dfa6358248?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-23",
    "type": "vehicle",
    "title": "1989 Porsche 911 Speedster (G-Series)",
    "subtitle": "Air-Cooled 3.2L Flat-6 • Turbo-Look Widebody • G50 5-Speed Manual • Guards Red",
    "fairMarketValue": 295000,
    "acquisitionPrice": 250000,
    "unrealizedGain": 45000,
    "gainPct": 18,
    "indexTrend5YrPct": 48,
    "indexBenchmark": "Porsche Air-Cooled Index",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 99.3,
    "conditionLabel": "Porsche Classic Zuffenhausen Verified",
    "primaryAttributes": [
      {
        "label": "VIN",
        "value": "WP0ZZZ91ZKS151890"
      },
      {
        "label": "Production",
        "value": "1 of 823 US/Euro Wide"
      },
      {
        "label": "Odo",
        "value": "8,420 km"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 339250,
    "imageUrl": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-21",
    "type": "horology",
    "title": "F.P. Journe Tourbillon Souverain Vertical Tantalum",
    "subtitle": "Vertical Tourbillon Revolving Every 30 Seconds • Constant-Force Remontoir d'Egalité",
    "fairMarketValue": 490000,
    "acquisitionPrice": 420000,
    "unrealizedGain": 70000,
    "gainPct": 16.67,
    "indexTrend5YrPct": 58,
    "indexBenchmark": "F.P. Journe High Complications",
    "vaultLocation": "Zurich Old Town Bank Enclave",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "Invenit et Fecit Certificate",
    "primaryAttributes": [
      {
        "label": "Tourbillon",
        "value": "Vertical 30s Cage"
      },
      {
        "label": "Remontoir",
        "value": "1-second Dead-Beat Seconds"
      },
      {
        "label": "Movement",
        "value": "18K Rose Gold Hand-Beveled"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 563500,
    "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-24",
    "type": "vehicle",
    "title": "2018 Ferrari 488 Pista Piloti Ferrari",
    "subtitle": "Tailor Made Spec for Ferrari Challenge Drivers • 3.9L Twin-Turbo V8 710hp • Argento Nürburgring",
    "fairMarketValue": 580000,
    "acquisitionPrice": 495000,
    "unrealizedGain": 85000,
    "gainPct": 17.17,
    "indexTrend5YrPct": 36.5,
    "indexBenchmark": "Ferrari Track Special Index",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 99.8,
    "conditionLabel": "Ferrari Atelier & Piloti Provenance",
    "primaryAttributes": [
      {
        "label": "VIN",
        "value": "ZFF88HLA000238410"
      },
      {
        "label": "Livery",
        "value": "WEC World Championship Tricolore"
      },
      {
        "label": "Odo",
        "value": "1,840 km"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 667000,
    "imageUrl": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-22",
    "type": "horology",
    "title": "Patek Philippe World Time Chronograph Ref. 5930P",
    "subtitle": "Platinum 39.5mm Case • Emerald Green Guilloché Dial • 24 Time Zones with Day/Night",
    "fairMarketValue": 115000,
    "acquisitionPrice": 98000,
    "unrealizedGain": 17000,
    "gainPct": 17.35,
    "indexTrend5YrPct": 29,
    "indexBenchmark": "Patek World Time Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Complete Official Certificate",
    "primaryAttributes": [
      {
        "label": "Calibre",
        "value": "CH 28-520 HU Automatic"
      },
      {
        "label": "Guilloché",
        "value": "Circular Hand-Crafted"
      },
      {
        "label": "Diamond",
        "value": "Top Wesselton at 6 o'clock"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 132250,
    "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-25",
    "type": "vehicle",
    "title": "2006 Mercedes-Benz SLR McLaren 722 Edition",
    "subtitle": "Supercharged 5.4L M155 V8 641hp • Tribute to Stirling Moss 1955 Mille Miglia Victory",
    "fairMarketValue": 790000,
    "acquisitionPrice": 680000,
    "unrealizedGain": 110000,
    "gainPct": 16.18,
    "indexTrend5YrPct": 38,
    "indexBenchmark": "SLR McLaren Heritage Benchmark",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 99.6,
    "conditionLabel": "McLaren Special Operations Heritage Insp",
    "primaryAttributes": [
      {
        "label": "Chassis",
        "value": "WDD1993761M001489"
      },
      {
        "label": "Carbon Fiber Aero",
        "value": "722 Front Splitter"
      },
      {
        "label": "Odo",
        "value": "3,420 km"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 908500,
    "imageUrl": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-23",
    "type": "horology",
    "title": "Kari Voutilainen Vingt-8 Hand-Crafted Enamel",
    "subtitle": "In-House Free-Sprung Balance • Direct Impulse Escapement • Grand Feu Enamel Dial",
    "fairMarketValue": 185000,
    "acquisitionPrice": 155000,
    "unrealizedGain": 30000,
    "gainPct": 19.35,
    "indexTrend5YrPct": 62,
    "indexBenchmark": "Voutilainen Artisan Benchmark",
    "vaultLocation": "Zurich Old Town Bank Enclave",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "Môtiers Workshop Signed Extract",
    "primaryAttributes": [
      {
        "label": "Escapement",
        "value": "Dual Escape Wheel Direct"
      },
      {
        "label": "Dial",
        "value": "Grand Feu Enamel Hand-Turned"
      },
      {
        "label": "Balance",
        "value": "In-House Grossmann Hairspring"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 212750,
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-26",
    "type": "vehicle",
    "title": "1994 Bugatti EB110 Super Sport (SS)",
    "subtitle": "Quad-Turbo 3.5L 60-Valve V12 603hp • AWD • Carbon Monocoque by Aérospatiale",
    "fairMarketValue": 3200000,
    "acquisitionPrice": 2750000,
    "unrealizedGain": 450000,
    "gainPct": 16.36,
    "indexTrend5YrPct": 68,
    "indexBenchmark": "Bugatti Campogalliano Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #1A",
    "custodyEnclave": "CH-FREEPORT-GEN-01A",
    "conditionScore": 99.4,
    "conditionLabel": "Bugatti Campogalliano Register Authenticated",
    "primaryAttributes": [
      {
        "label": "Chassis",
        "value": "ZA9AB02E0RCD39018"
      },
      {
        "label": "Production",
        "value": "1 of 30 Super Sport"
      },
      {
        "label": "Odo",
        "value": "5,600 km"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 3680000,
    "imageUrl": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-24",
    "type": "horology",
    "title": "Rolex Cosmograph Daytona \"Rainbow\" Ref. 116595RBOW",
    "subtitle": "18K Everose Gold • 36 Baguette Rainbow Sapphires • 56 Diamonds on Lugs • Gold Crystal Dials",
    "fairMarketValue": 450000,
    "acquisitionPrice": 380000,
    "unrealizedGain": 70000,
    "gainPct": 18.42,
    "indexTrend5YrPct": 54,
    "indexBenchmark": "Rolex Gemset Super-Collectible",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 99.9,
    "conditionLabel": "Full Factory Gemset Guarantee",
    "primaryAttributes": [
      {
        "label": "Gemstones",
        "value": "36 Baguette Cut Sapphires"
      },
      {
        "label": "Pave",
        "value": "56 Brilliant Cut Diamonds"
      },
      {
        "label": "Sub-Dials",
        "value": "Pink Gold Crystallized"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global #LL-SPECIE-2025",
    "insuredValue": 517500,
    "imageUrl": "https://images.unsplash.com/photo-1547996160-71dfa6358248?auto=format&fit=crop&w=800&q=80"
  }
];

export const INITIAL_DRIVE_SLOTS: DriveBookingSlot[] = [
  { day: 1, dateStr: '2025-04-01', status: 'past' },
  { day: 2, dateStr: '2025-04-02', status: 'past' },
  { day: 3, dateStr: '2025-04-03', status: 'past' },
  { day: 4, dateStr: '2025-04-04', status: 'past' },
  { day: 5, dateStr: '2025-04-05', status: 'past' },
  { day: 6, dateStr: '2025-04-06', status: 'past' },
  { day: 7, dateStr: '2025-04-07', status: 'past' },
  { day: 8, dateStr: '2025-04-08', status: 'past' },
  { day: 9, dateStr: '2025-04-09', status: 'maintenance', title: 'Porsche Classic Fluid Inspection' },
  { day: 10, dateStr: '2025-04-10', status: 'past' },
  { day: 11, dateStr: '2025-04-11', status: 'available', title: 'Available Member Slot' },
  { day: 12, dateStr: '2025-04-12', status: 'available', title: 'Available Member Slot' },
  { day: 13, dateStr: '2025-04-13', status: 'booked', title: 'Filming Reservation' },
  { day: 14, dateStr: '2025-04-14', status: 'available' },
  { day: 15, dateStr: '2025-04-15', status: 'available' },
  { day: 16, dateStr: '2025-04-16', status: 'available' },
  { day: 17, dateStr: '2025-04-17', status: 'available' },
  { day: 18, dateStr: '2025-04-18', status: 'available' },
  { day: 19, dateStr: '2025-04-19', status: 'available', title: 'Available Member Slot' },
  { day: 20, dateStr: '2025-04-20', status: 'available', title: 'Available Member Slot' },
  { day: 21, dateStr: '2025-04-21', status: 'available' },
  { day: 22, dateStr: '2025-04-22', status: 'available' },
  { day: 23, dateStr: '2025-04-23', status: 'maintenance', title: 'Brembo Brake Assay' },
  { day: 24, dateStr: '2025-04-24', status: 'available' },
  { day: 25, dateStr: '2025-04-25', status: 'available' },
  { day: 26, dateStr: '2025-04-26', status: 'available' },
  { day: 27, dateStr: '2025-04-27', status: 'available' },
  { day: 28, dateStr: '2025-04-28', status: 'available' },
  { day: 29, dateStr: '2025-04-29', status: 'available' },
  { day: 30, dateStr: '2025-04-30', status: 'available' },
];
