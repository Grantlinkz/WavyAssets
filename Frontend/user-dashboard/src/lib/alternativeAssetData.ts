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
    tierLabel: 'Tier 1 // Low',
    leverage: '1.0x',
    title: 'Capital Preservation',
    description: 'Market-neutral delta hedging. Synthetic USD basis capture with negative beta bias.',
    targetApy: '8.0% - 12.0%',
  },
  {
    id: 'balanced',
    tierLabel: 'Tier 2 // Selected',
    leverage: '1.45x',
    title: 'Balanced Trend',
    description: 'Statistical momentum, cross-market cointegration & automated gamma scalp.',
    targetApy: '14.0% - 20.0% APY',
    volBand: '6.8%',
    active: true,
  },
  {
    id: 'high-vol',
    tierLabel: 'Tier 3 // Dynamic',
    leverage: '2.5x',
    title: 'High-Vol Arbitrage',
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
    rationale: 'Daily sovereign risk audit verification against flash crash scenarios.',
    metrics: ['Max Tolerated Stress: 4.8x', 'Solvency Confidence: 99.98%'],
    txHash: '0x7c21...8b54',
    pnlYield: 'Audit Passed',
  },
];

export const GPU_CLUSTER_TELEMETRY: GpuClusterTelemetry = {
  clusterName: '160x NVIDIA H100 SXM5 80GB',
  facility: 'Facility #02 CH (Valais Hydro Grid)',
  specs: 'Dual SXM5 Octa-Chassis // 3.2 Tbps InfiniBand NDR',
  utilizationRate: 94.2,
  dedicatedInferenceRate: 78.0,
  quantOptimizationRate: 16.2,
  standbyReserveRate: 5.8,
  onlineGpus: 151,
  totalGpus: 160,
  hourlyRate: 18.42,
  monthlyCashFlow: 13262.40,
  hardwareApy: 15.2,
  activeTenant: 'Tier-1 Sovereign AI Lab',
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
    subLabel: '19.2% of Consolidated NAV',
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
    id: 're-1',
    name: 'One Zurich Financial Center',
    region: 'Switzerland',
    location: 'Zurich Financial District // Bleicherweg 10',
    spvCode: 'CH-SPV-ZUR-08',
    valuation: 1200000.0,
    unrealizedUpliftPct: 12.4,
    tokenCount: 2400,
    tokenPrice: 500.0,
    occupancyPct: 100.0,
    netRentalYieldApy: 6.85,
    waltYears: 7.5,
    legalEntity: 'Zürich Prime Office AG',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    appraisalStandard: 'RICS Red Book (CBRE Zurich)',
  },
  {
    id: 're-2',
    name: 'London Mayfair Luxury Mews',
    region: 'United Kingdom',
    location: 'Mayfair // Chesterfield Gardens 4',
    spvCode: 'UK-SPV-LON-14',
    valuation: 750000.0,
    unrealizedUpliftPct: 8.7,
    tokenCount: 1500,
    tokenPrice: 500.0,
    occupancyPct: 96.8,
    netRentalYieldApy: 7.40,
    waltYears: 4.8,
    legalEntity: 'Mayfair Sovereign Holdings Ltd',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    appraisalStandard: 'Knight Frank Mayfair Advisory',
  },
  {
    id: 're-3',
    name: 'Geneva Lakeside Diplomatic Villa',
    region: 'Switzerland',
    location: 'Cologny // Route de la Capite',
    spvCode: 'CH-SPV-GEN-02',
    valuation: 550000.0,
    unrealizedUpliftPct: 14.1,
    tokenCount: 1100,
    tokenPrice: 500.0,
    occupancyPct: 100.0,
    netRentalYieldApy: 6.20,
    waltYears: 8.0,
    legalEntity: 'Cologny Enclave Immobilière SA',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
    appraisalStandard: 'Wüest Partner Geneva',
  },
  {
    id: 're-4',
    name: 'Frankfurt Hyperscale Data Hub',
    region: 'Germany',
    location: 'Frankfurt am Main // Hanauer Landstrasse',
    spvCode: 'DE-SPV-FRA-22',
    valuation: 350000.0,
    unrealizedUpliftPct: 9.3,
    tokenCount: 700,
    tokenPrice: 500.0,
    occupancyPct: 100.0,
    netRentalYieldApy: 8.50,
    waltYears: 10.0,
    legalEntity: 'DE Data Infra GmbH',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    appraisalStandard: 'JLL Industrial Advisory',
  },
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
    pricePerToken: 396.0,
    navPremiumDiscountPct: -1.0,
    counterpartyEnclave: 'Swiss Family Office #04',
    totalUsd: 198000.0,
  },
  {
    id: 'otc-3',
    type: 'OFFER',
    propertyName: 'Frankfurt Hyperscale Data Hub',
    tokenCount: 150,
    pricePerToken: 512.0,
    navPremiumDiscountPct: 2.4,
    counterpartyEnclave: 'Nordic Sovereign Vault #12',
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
    id: 'car-1',
    type: 'vehicle',
    title: '1997 Porsche 911 GT2 (993) Clubsport',
    subtitle: '1 of 57 Street-Legal Homologation Specials • Air-Cooled 3.6L Twin-Turbo 430hp • Arctic Silver',
    fairMarketValue: 580000.0,
    acquisitionPrice: 495000.0,
    unrealizedGain: 85000.0,
    gainPct: 17.17,
    indexTrend5YrPct: 61.1,
    indexBenchmark: 'Hagerty Valuation Index',
    vaultLocation: 'Geneva Freeport Vault #4B',
    custodyEnclave: 'CH-FREEPORT-GEN-04B',
    conditionScore: 99.4,
    conditionLabel: 'Concours Gold Standard',
    primaryAttributes: [
      { label: 'Chassis VIN', value: 'WP0ZZZ99ZTS390412' },
      { label: 'Engine Code', value: 'M64/60-61 Matching' },
      { label: 'Certified Odo', value: '14,820 km' },
    ],
    climateTelemetry: '19.5°C / 48% RH (Geneva Enclave Auto)',
    underwritingPolicy: 'Lloyds of London Specie #LL-CH-892401',
    insuredValue: 800000.0,
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'watch-1',
    type: 'horology',
    title: 'Patek Philippe Grand Complications 5270P',
    subtitle: 'Perpetual Calendar Chronograph in 950 Platinum with Emerald Green Sunburst Dial',
    fairMarketValue: 270000.0,
    acquisitionPrice: 235000.0,
    unrealizedGain: 35000.0,
    gainPct: 14.89,
    indexTrend5YrPct: 42.4,
    indexBenchmark: 'Phillips / WatchCharts Index: AAA',
    vaultLocation: 'Zurich Old Town Bank Enclave (Class IX Safe)',
    custodyEnclave: 'CH-ZUR-VAULT-02',
    conditionScore: 100.0,
    conditionLabel: 'Factory Blister / Unworn Sealed',
    primaryAttributes: [
      { label: 'Movement Serial', value: 'CH 29-535 PS Q' },
      { label: 'Case Number', value: '5892104 / 950 Pt' },
      { label: 'Registry Extract', value: 'Confirmed Archive' },
    ],
    climateTelemetry: '20.0°C / 45% N2 Inerte Sealed',
    underwritingPolicy: 'Lloyds Specie Syndicate 2003',
    insuredValue: 400000.0,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  },
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
