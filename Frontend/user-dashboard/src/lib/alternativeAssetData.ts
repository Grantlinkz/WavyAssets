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


export interface AiStrategyAsset {
  id: string;
  name: string;
  category: 'GPU Clusters' | 'Robotics & AGVs' | 'Data Centers' | 'AI Chips & ASICs' | 'Infrastructure';
  facility: string;
  hardwareCode: string;
  valuation: number;
  unrealizedAlphaPct: number;
  tokenCount: number;
  tokenPrice: number;
  clusterUtilizationPct: number;
  netYieldApy: number;
  leaseTermMonths: number;
  hourlyRate: number;
  specs: string;
  slaStandard: string;
  imageUrl: string;
}

export interface AiDistributionItem {
  id: string;
  period: string;
  projected: number;
  actual: number;
  varianceDelta: number;
  settlementHash: string;
  status: 'CLEARED' | 'PENDING';
}

export interface AiTenantCreditItem {
  id: string;
  tenantName: string;
  tier: string;
  creditRating: string;
  allocatedCapacity: string;
  monthlyCommitment: number;
  status: 'CURRENT' | 'ACTIVE';
}

export interface AiSecondaryOtcOrder {
  id: string;
  type: 'BID' | 'OFFER';
  assetName: string;
  tokenCount: number;
  pricePerToken: number;
  navPremiumDiscountPct: number;
  counterpartyEnclave: string;
  totalUsd: number;
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

// -------------------------------------------------------------------------
// AI STRATEGY INVENTORY & TELEMETRY (50 ASSETS)
// -------------------------------------------------------------------------

export const AI_STRATEGY_ASSETS: AiStrategyAsset[] = [
  {
    "id": "ai-1",
    "name": "NVIDIA H100 SXM5 80GB Octa-Chassis Cluster",
    "category": "GPU Clusters",
    "facility": "Valais Hydro Compute Pod #02, Switzerland",
    "hardwareCode": "NV-H100-SXM5-80G",
    "valuation": 3200000,
    "unrealizedAlphaPct": 18.4,
    "tokenCount": 6400,
    "tokenPrice": 500,
    "clusterUtilizationPct": 98.4,
    "netYieldApy": 19.85,
    "leaseTermMonths": 12,
    "hourlyRate": 18.5,
    "specs": "8x SXM5 H100 (3.2 Tbps InfiniBand NDR), 640GB HBM3 VRAM, 80 PFLOPS FP8 AI",
    "slaStandard": "Tier-IV 99.999% SLA (Equinix Zurich Enclave)",
    "imageUrl": "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-2",
    "name": "NVIDIA H200 SuperPOD Tensor Core Matrix",
    "category": "GPU Clusters",
    "facility": "Reykjavik Geothermal AI Hub, Iceland",
    "hardwareCode": "NV-H200-SP-141G",
    "valuation": 4800000,
    "unrealizedAlphaPct": 22.1,
    "tokenCount": 8000,
    "tokenPrice": 600,
    "clusterUtilizationPct": 99.2,
    "netYieldApy": 22.4,
    "leaseTermMonths": 24,
    "hourlyRate": 26.8,
    "specs": "141GB HBM3e Memory per Node, 4.8 TB/s Bandwidth, Liquid Immersion Cooled",
    "slaStandard": "100% Geothermal Green Tier-IV Redundant",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-3",
    "name": "NVIDIA B200 Blackwell NVL72 Rack Unit",
    "category": "GPU Clusters",
    "facility": "Zurich Green Hyperscale Enclave, Switzerland",
    "hardwareCode": "NV-B200-NVL72",
    "valuation": 7500000,
    "unrealizedAlphaPct": 26.5,
    "tokenCount": 7500,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 99.8,
    "netYieldApy": 24.5,
    "leaseTermMonths": 36,
    "hourlyRate": 42,
    "specs": "72x B200 GPUs Liquid-Cooled, 1.44 Exaflops FP4 AI, 13.5 TB HBM3e Memory",
    "slaStandard": "Swiss Banking FINMA Compliant Dedicated Vault",
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-4",
    "name": "NVIDIA Grace Hopper GH200 Unified Pod",
    "category": "GPU Clusters",
    "facility": "Munich HPC Science Cluster, Germany",
    "hardwareCode": "NV-GH200-UNIFIED",
    "valuation": 2900000,
    "unrealizedAlphaPct": 16.8,
    "tokenCount": 5800,
    "tokenPrice": 500,
    "clusterUtilizationPct": 96.5,
    "netYieldApy": 18.2,
    "leaseTermMonths": 18,
    "hourlyRate": 16.2,
    "specs": "Grace CPU 72-Core + H100 96GB, 900 GB/s NVLink-C2C Chip-to-Chip Interconnect",
    "slaStandard": "ISO 27001 & TISAX High-Security Cleared",
    "imageUrl": "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-5",
    "name": "AMD Instinct MI300X 192GB Accelerator Bank",
    "category": "GPU Clusters",
    "facility": "Frankfurt Equinix FR2 AI Vault, Germany",
    "hardwareCode": "AMD-MI300X-192G",
    "valuation": 2600000,
    "unrealizedAlphaPct": 15.2,
    "tokenCount": 5200,
    "tokenPrice": 500,
    "clusterUtilizationPct": 95.8,
    "netYieldApy": 17.6,
    "leaseTermMonths": 12,
    "hourlyRate": 14.8,
    "specs": "8x MI300X OAM, 1.5TB HBM3 per Node, ROCm 6.0 Enterprise Open AI Stack",
    "slaStandard": "Sub-10ms Direct European Financial FIX Gateway",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-6",
    "name": "NVIDIA L40S Enterprise Generative AI Cluster",
    "category": "GPU Clusters",
    "facility": "London Slough LD4 Interconnect Hub, UK",
    "hardwareCode": "NV-L40S-GENAI",
    "valuation": 1850000,
    "unrealizedAlphaPct": 14,
    "tokenCount": 7400,
    "tokenPrice": 250,
    "clusterUtilizationPct": 94.2,
    "netYieldApy": 16.5,
    "leaseTermMonths": 12,
    "hourlyRate": 11.2,
    "specs": "32x L40S 48GB Ada Lovelace GPUs, Omniverse Multi-Modal Diffusion Acceleration",
    "slaStandard": "FCA Dual-Signatory Audited Facility",
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-7",
    "name": "NVIDIA A100 SXM4 80GB Fine-Tuning Swarm",
    "category": "GPU Clusters",
    "facility": "Geneva CERN Data Center Enclave, Switzerland",
    "hardwareCode": "NV-A100-SXM4-80G",
    "valuation": 2100000,
    "unrealizedAlphaPct": 13.5,
    "tokenCount": 4200,
    "tokenPrice": 500,
    "clusterUtilizationPct": 93.8,
    "netYieldApy": 15.9,
    "leaseTermMonths": 18,
    "hourlyRate": 12.5,
    "specs": "64x A100 80GB GPUs, NVLink 600 GB/s Mesh, ZK-Verified Distributed LoRA",
    "slaStandard": "Swiss Academic Research Consortium Approved",
    "imageUrl": "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-8",
    "name": "Intel Gaudi 3 AI Multi-Node Accelerator Pod",
    "category": "GPU Clusters",
    "facility": "Stockholm EcoDataCenter, Sweden",
    "hardwareCode": "INTC-GAUDI-3-POD",
    "valuation": 2400000,
    "unrealizedAlphaPct": 16,
    "tokenCount": 4800,
    "tokenPrice": 500,
    "clusterUtilizationPct": 95,
    "netYieldApy": 17.8,
    "leaseTermMonths": 24,
    "hourlyRate": 13.9,
    "specs": "128GB HBM2e per Node, Integrated 24x 200Gbps RoCE v2 Ports per Gaudi 3",
    "slaStandard": "100% Fossil-Free Nordic Green Energy Standard",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-9",
    "name": "Cerebras CS-3 Wafer-Scale AI Engine #01",
    "category": "GPU Clusters",
    "facility": "Zurich Swisscom High-Density AI Hall, Switzerland",
    "hardwareCode": "CEREBRAS-CS3-WSE",
    "valuation": 6200000,
    "unrealizedAlphaPct": 24.2,
    "tokenCount": 6200,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 98.9,
    "netYieldApy": 23.1,
    "leaseTermMonths": 36,
    "hourlyRate": 35,
    "specs": "4 Trillion Transistors, 900,000 AI Cores on Single Wafer, 44GB On-Chip SRAM",
    "slaStandard": "Zero-Latency Ultra-Scale Neural Network Matrix",
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-10",
    "name": "Tenstorrent Wormhole n300 Open Compute Array",
    "category": "GPU Clusters",
    "facility": "Austin Hyperscale Modular Vault, USA",
    "hardwareCode": "TT-WORMHOLE-N300",
    "valuation": 1750000,
    "unrealizedAlphaPct": 14.8,
    "tokenCount": 7000,
    "tokenPrice": 250,
    "clusterUtilizationPct": 92.4,
    "netYieldApy": 16.8,
    "leaseTermMonths": 12,
    "hourlyRate": 10.5,
    "specs": "RISC-V Tensix Architecture, 100GbE Switched Mesh on Board, Open Model Weights",
    "slaStandard": "Open Compute Project (OCP) Compliant",
    "imageUrl": "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-11",
    "name": "Autonomous Warehouse AGV Swarm Fleet (120 Units)",
    "category": "Robotics & AGVs",
    "facility": "Rotterdam Euro-Port Robotic Logistics Terminal, Netherlands",
    "hardwareCode": "ROBOT-AGV-SWARM-120",
    "valuation": 3800000,
    "unrealizedAlphaPct": 19.5,
    "tokenCount": 7600,
    "tokenPrice": 500,
    "clusterUtilizationPct": 98.1,
    "netYieldApy": 20.2,
    "leaseTermMonths": 24,
    "hourlyRate": 22,
    "specs": "120x Omni-Directional LiDAR AGVs, Fleet AI Central Orchestrator, 24/7 Continuous Pallet Sort",
    "slaStandard": "CE / TUV Rheinland Automated Transport Safety Standard",
    "imageUrl": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-12",
    "name": "Boston Dynamics Spot Enterprise AI Inspection Unit",
    "category": "Robotics & AGVs",
    "facility": "Valais Hydro-Power Dam Sub-Station, Switzerland",
    "hardwareCode": "BD-SPOT-ENT-AI",
    "valuation": 950000,
    "unrealizedAlphaPct": 15,
    "tokenCount": 3800,
    "tokenPrice": 250,
    "clusterUtilizationPct": 94.6,
    "netYieldApy": 18.4,
    "leaseTermMonths": 12,
    "hourlyRate": 8.5,
    "specs": "Quadruped Agile Robot with 30x Optical Zoom, Thermal FLIR Cam & Acoustic Gas Leak AI Sensor",
    "slaStandard": "ATEX Zone 2 Intrinsically Safe Certified",
    "imageUrl": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-13",
    "name": "Cybernetic Micro-Precision Surgical Robot Node",
    "category": "Robotics & AGVs",
    "facility": "Zurich University Hospital MedTech Incubator, Switzerland",
    "hardwareCode": "SURG-AI-MICRON-06",
    "valuation": 4200000,
    "unrealizedAlphaPct": 21,
    "tokenCount": 8400,
    "tokenPrice": 500,
    "clusterUtilizationPct": 97.4,
    "netYieldApy": 21.5,
    "leaseTermMonths": 36,
    "hourlyRate": 28,
    "specs": "Sub-Millimeter 7-DoF Haptic Arms, Neural Vision Stereo Endoscope, Real-Time Tremor Cancellation",
    "slaStandard": "Swissmedic / FDA Class III Medical Device Cleared",
    "imageUrl": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-14",
    "name": "Autonomous Security Patrol Droid Mesh (Geneva Freeport)",
    "category": "Robotics & AGVs",
    "facility": "Geneva FreePort Bonded Perimeter, Switzerland",
    "hardwareCode": "SEC-DROID-MESH-GEN",
    "valuation": 1400000,
    "unrealizedAlphaPct": 14.2,
    "tokenCount": 5600,
    "tokenPrice": 250,
    "clusterUtilizationPct": 99.5,
    "netYieldApy": 17.1,
    "leaseTermMonths": 12,
    "hourlyRate": 9.8,
    "specs": "8x Wheeled Autonomous Sentinel Units, 360° Night-Vision LiDAR, Facial Recognition Quorum",
    "slaStandard": "Swiss Federal Bonded Freezone Security Level 5",
    "imageUrl": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-15",
    "name": "High-Throughput Robotic Chemistry Synthesis Cell",
    "category": "Robotics & AGVs",
    "facility": "Basel Roche BioTech Campus, Switzerland",
    "hardwareCode": "BIO-SYNTH-ROBOT-08",
    "valuation": 3100000,
    "unrealizedAlphaPct": 18.9,
    "tokenCount": 6200,
    "tokenPrice": 500,
    "clusterUtilizationPct": 96.8,
    "netYieldApy": 19.4,
    "leaseTermMonths": 24,
    "hourlyRate": 21.5,
    "specs": "Dual 6-Axis Stäubli Cleanroom Arms, Automated Liquid Chromatography, AI Molecule Optimization",
    "slaStandard": "GMP Grade A / ISO 14644 Cleanroom Attested",
    "imageUrl": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-16",
    "name": "Autonomous Solar Farm Panel Cleaning Bot Array",
    "category": "Robotics & AGVs",
    "facility": "Andalusia Megawatt Solar Field, Spain",
    "hardwareCode": "SOLAR-CLEAN-ROBOT-50",
    "valuation": 1200000,
    "unrealizedAlphaPct": 13.8,
    "tokenCount": 4800,
    "tokenPrice": 250,
    "clusterUtilizationPct": 95.2,
    "netYieldApy": 16.9,
    "leaseTermMonths": 12,
    "hourlyRate": 8.2,
    "specs": "50x Water-Free Microfiber Crawler Bots, Edge Solar Yield AI Diagnostic, Autonomous Docking",
    "slaStandard": "IP68 Dust & Water Proof Heavy-Duty Industrial Standard",
    "imageUrl": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-17",
    "name": "Autonomous Sub-Terranean Utility Inspection Crawler",
    "category": "Robotics & AGVs",
    "facility": "Zurich Municipal Infrastructure Enclave, Switzerland",
    "hardwareCode": "SUBTER-CRAWL-BOT-02",
    "valuation": 850000,
    "unrealizedAlphaPct": 12.5,
    "tokenCount": 3400,
    "tokenPrice": 250,
    "clusterUtilizationPct": 93,
    "netYieldApy": 15.8,
    "leaseTermMonths": 12,
    "hourlyRate": 6.8,
    "specs": "Magnetic Pipe Track Crawler, Ultrasonic Wall Thickness Sonar, Structural Crack Prediction AI",
    "slaStandard": "DIN 1986 European Underground Pipeline Compliance",
    "imageUrl": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-18",
    "name": "Precision Semiconductor Die-Sort Robotic Gantry",
    "category": "Robotics & AGVs",
    "facility": "Dresden Silicon Saxony Fab 4, Germany",
    "hardwareCode": "FAB-DIE-SORT-GANTRY",
    "valuation": 2750000,
    "unrealizedAlphaPct": 17.5,
    "tokenCount": 5500,
    "tokenPrice": 500,
    "clusterUtilizationPct": 97.9,
    "netYieldApy": 18.9,
    "leaseTermMonths": 24,
    "hourlyRate": 19.2,
    "specs": "Sub-Micron Linear Motor Gantry, 40,000 Units/Hour Pick-and-Place, Machine Vision Yield Sorter",
    "slaStandard": "SEMI S2 / S8 Environmental Health & Safety Standard",
    "imageUrl": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-19",
    "name": "Autonomous Heavy-Lift Port Container Crane System",
    "category": "Robotics & AGVs",
    "facility": "Antwerp Gateway Terminal #1700, Belgium",
    "hardwareCode": "PORT-CRANE-AI-AUTO",
    "valuation": 5200000,
    "unrealizedAlphaPct": 20.4,
    "tokenCount": 5200,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 98.6,
    "netYieldApy": 21,
    "leaseTermMonths": 36,
    "hourlyRate": 32,
    "specs": "65-Ton Dual-Hoist Electric Straddle, AI Vessel Container Slot Stacking Optimization",
    "slaStandard": "Lloyds Maritime Cargo Handling Machinery Classed",
    "imageUrl": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-20",
    "name": "Autonomous High-Speed Last-Mile Delivery Drone Mesh",
    "category": "Robotics & AGVs",
    "facility": "Singapore Sentosa Urban Mobility Corridor, Singapore",
    "hardwareCode": "DRONE-MESH-SG-DELIV",
    "valuation": 2200000,
    "unrealizedAlphaPct": 16.5,
    "tokenCount": 4400,
    "tokenPrice": 500,
    "clusterUtilizationPct": 96,
    "netYieldApy": 17.9,
    "leaseTermMonths": 18,
    "hourlyRate": 14.5,
    "specs": "30x Octocopter Heavy-Lift Drones, Beyond-Visual-Line-of-Sight (BVLOS) 5G SA Mesh",
    "slaStandard": "Civil Aviation Authority of Singapore (CAAS) Approved",
    "imageUrl": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-21",
    "name": "Nordic Hydro AI Hyper-Facility (Valais Phase I)",
    "category": "Data Centers",
    "facility": "Sion, Canton Valais, Switzerland",
    "hardwareCode": "DC-VALAIS-HYDRO-I",
    "valuation": 12500000,
    "unrealizedAlphaPct": 25,
    "tokenCount": 12500,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 99.4,
    "netYieldApy": 22.8,
    "leaseTermMonths": 48,
    "hourlyRate": 65,
    "specs": "40 MW Direct Hydroelectric Feed, PUE 1.08 River Water Direct Cooling, 1,200 Server Racks",
    "slaStandard": "Swiss Federal Critical Infrastructure Tier-IV Plus",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-22",
    "name": "Iceland Geothermal Deep Compute Vault (Reykjavik)",
    "category": "Data Centers",
    "facility": "Reykjavik Geothermal Rift Zone, Iceland",
    "hardwareCode": "DC-ICE-GEO-VAULT",
    "valuation": 9800000,
    "unrealizedAlphaPct": 23.4,
    "tokenCount": 9800,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 98.9,
    "netYieldApy": 21.6,
    "leaseTermMonths": 36,
    "hourlyRate": 54,
    "specs": "Zero-Carbon Geothermal Steam Turbines, Natural Sub-Zero Ambient Free Air Chilling",
    "slaStandard": "100% Renewable EU Green Taxonomy Certified",
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-23",
    "name": "Zurich Equinix Tier-IV Green AI Enclave (ZH4)",
    "category": "Data Centers",
    "facility": "Zurich-West Digital Exchange District, Switzerland",
    "hardwareCode": "DC-ZH4-EQUINIX-T4",
    "valuation": 8200000,
    "unrealizedAlphaPct": 20.8,
    "tokenCount": 8200,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 99.1,
    "netYieldApy": 20.4,
    "leaseTermMonths": 24,
    "hourlyRate": 48,
    "specs": "Direct Sub-1ms SIX Swiss Exchange Cross-Connect, N+2 Power & Chill Resiliency",
    "slaStandard": "Uptime Institute Tier IV Fault-Tolerant Facility",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-24",
    "name": "Singapore Hyper-Scale Subsea Fiber Hub (Tuas)",
    "category": "Data Centers",
    "facility": "Tuas Mega-Hub Datacenter Park, Singapore",
    "hardwareCode": "DC-TUAS-SUBSEA-SG",
    "valuation": 14000000,
    "unrealizedAlphaPct": 26.2,
    "tokenCount": 14000,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 99.7,
    "netYieldApy": 23.5,
    "leaseTermMonths": 48,
    "hourlyRate": 72,
    "specs": "Landing Station for 8 Trans-Pacific Subsea Fiber Cables, 60 MW Liquid Cooled AI Hall",
    "slaStandard": "BCA-IMDA Green Mark Platinum Datacenter Standard",
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-25",
    "name": "Frankfurt Main-Cube AI Sovereign Center (FR5)",
    "category": "Data Centers",
    "facility": "Frankfurt am Main Telecom Corridor, Germany",
    "hardwareCode": "DC-FR5-MAIN-CUBE",
    "valuation": 7400000,
    "unrealizedAlphaPct": 19.5,
    "tokenCount": 7400,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 98.4,
    "netYieldApy": 19.8,
    "leaseTermMonths": 24,
    "hourlyRate": 41.5,
    "specs": "Direct Peering into DE-CIX (Largest Global Internet Exchange), 100% Biometric Quorum",
    "slaStandard": "BSI C5 & GDPR Sovereign European Data Protection Compliant",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-26",
    "name": "Tokyo High-Density Liquid-Cooled AI Vault (Otemachi)",
    "category": "Data Centers",
    "facility": "Tokyo Financial District, Otemachi, Japan",
    "hardwareCode": "DC-TYO-OTEMACHI-AI",
    "valuation": 8900000,
    "unrealizedAlphaPct": 21.5,
    "tokenCount": 8900,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 98.8,
    "netYieldApy": 21.2,
    "leaseTermMonths": 36,
    "hourlyRate": 49,
    "specs": "Direct Sub-Millisecond JPX Tokyo Stock Exchange Link, Seismic Base-Isolated Building",
    "slaStandard": "FISC Japanese Financial Information Security Class A",
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-27",
    "name": "Stockholm Arctic Low-PUE AI Data Fortress",
    "category": "Data Centers",
    "facility": "Kista Science City, Stockholm, Sweden",
    "hardwareCode": "DC-ARCTIC-FORTRESS",
    "valuation": 6700000,
    "unrealizedAlphaPct": 18.2,
    "tokenCount": 6700,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 97.6,
    "netYieldApy": 19.1,
    "leaseTermMonths": 24,
    "hourlyRate": 38,
    "specs": "Excess Heat Fed to Municipal District Heating Grid, PUE 1.05 Sustainable Compute",
    "slaStandard": "Nordic Swan Ecolabel Certified Data Center",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-28",
    "name": "Dublin Renewable AI Facility Enclave (Clondalkin)",
    "category": "Data Centers",
    "facility": "Clondalkin Tech Corridor, Dublin, Ireland",
    "hardwareCode": "DC-DUB-RENEWABLE-AI",
    "valuation": 6100000,
    "unrealizedAlphaPct": 17.8,
    "tokenCount": 6100,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 96.9,
    "netYieldApy": 18.7,
    "leaseTermMonths": 18,
    "hourlyRate": 34,
    "specs": "Direct Offshore Wind Farm PPA, High-Density 45kW per Rack Immersion Infrastructure",
    "slaStandard": "ISO 50001 Energy Management Standard",
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-29",
    "name": "London Docklands AI Interconnect Fortress (Telehouse)",
    "category": "Data Centers",
    "facility": "London Docklands, East India Quay, UK",
    "hardwareCode": "DC-LON-DOCKLANDS-TH",
    "valuation": 7900000,
    "unrealizedAlphaPct": 20,
    "tokenCount": 7900,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 99,
    "netYieldApy": 20.5,
    "leaseTermMonths": 24,
    "hourlyRate": 44,
    "specs": "Core Gateway for London Internet Exchange (LINX), Tier-IV Multi-Tenant Enclave",
    "slaStandard": "UK CPNI Centre for the Protection of National Infrastructure",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-30",
    "name": "Geneva CERN-Adjacent AI Science Data Vault",
    "category": "Data Centers",
    "facility": "Meyrin CERN Innovation Campus, Switzerland",
    "hardwareCode": "DC-CERN-MEYRIN-VAULT",
    "valuation": 5800000,
    "unrealizedAlphaPct": 17.1,
    "tokenCount": 5800,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 97.2,
    "netYieldApy": 18.2,
    "leaseTermMonths": 18,
    "hourlyRate": 31.5,
    "specs": "Dedicated Terabit Fiber Link to Worldwide LHC Computing Grid (WLCG)",
    "slaStandard": "Swiss Scientific Foundation Fiduciary Standard",
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-31",
    "name": "Google Cloud TPU v5p Pod Slices (8,960 Chips)",
    "category": "AI Chips & ASICs",
    "facility": "GCP Saint-Ghislain Carbon-Free Pod, Belgium",
    "hardwareCode": "TPU-V5P-POD-8960",
    "valuation": 6500000,
    "unrealizedAlphaPct": 23.8,
    "tokenCount": 6500,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 99.3,
    "netYieldApy": 22,
    "leaseTermMonths": 24,
    "hourlyRate": 36,
    "specs": "4x FLOPS per Chip vs v4, Optical Circuit Switch (OCS) Dynamic Topology, 4,800 Gbps ICI",
    "slaStandard": "Google Cloud Institutional Alpha Enterprise SLA",
    "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-32",
    "name": "Groq LPU Ultra-Low-Latency Inference Rack (64 LPUs)",
    "category": "AI Chips & ASICs",
    "facility": "Zurich FIX Low-Latency Gateway Vault, Switzerland",
    "hardwareCode": "GROQ-LPU-RACK-64",
    "valuation": 1950000,
    "unrealizedAlphaPct": 21.5,
    "tokenCount": 3900,
    "tokenPrice": 500,
    "clusterUtilizationPct": 98.5,
    "netYieldApy": 21.4,
    "leaseTermMonths": 12,
    "hourlyRate": 13.5,
    "specs": "Deterministic Tensor Streaming Processor, 500 Tokens/sec Llama-3 70B Generation, Zero Jitter",
    "slaStandard": "Sub-15ms Financial Derivative Order Pricing SLA",
    "imageUrl": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-33",
    "name": "SambaNova SN40L Reconfigurable Dataflow Node",
    "category": "AI Chips & ASICs",
    "facility": "London Mayfair FinTech AI Lab, UK",
    "hardwareCode": "SAMBA-SN40L-RACK",
    "valuation": 1600000,
    "unrealizedAlphaPct": 17.2,
    "tokenCount": 3200,
    "tokenPrice": 500,
    "clusterUtilizationPct": 95.4,
    "netYieldApy": 18.6,
    "leaseTermMonths": 12,
    "hourlyRate": 11.8,
    "specs": "3-Tier Memory System (64GB HBM, 1.5TB DDR5, SSD), True 5 Trillion Parameter Model Native Execution",
    "slaStandard": "FCA High-Value Algorithmic Trading Certification",
    "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-34",
    "name": "Untether AI Boomerang At-the-Memory Inference Blade",
    "category": "AI Chips & ASICs",
    "facility": "Munich Automotive Autonomous Lab, Germany",
    "hardwareCode": "UNTETHER-BOOM-AI",
    "valuation": 1100000,
    "unrealizedAlphaPct": 15,
    "tokenCount": 4400,
    "tokenPrice": 250,
    "clusterUtilizationPct": 93.8,
    "netYieldApy": 16.8,
    "leaseTermMonths": 12,
    "hourlyRate": 7.9,
    "specs": "Spatial Near-Memory Compute, 2 PFLOPS FP8 per PCIe Card at 120W Ultra-Low Power Consumption",
    "slaStandard": "ISO 26262 Automotive Safety Integrity Level ASIL-D",
    "imageUrl": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-35",
    "name": "Mythic Analog Matrix Processing Compute Blade",
    "category": "AI Chips & ASICs",
    "facility": "Cambridge Quantum Computing Incubator, UK",
    "hardwareCode": "MYTHIC-ANALOG-AMP",
    "valuation": 920000,
    "unrealizedAlphaPct": 14.2,
    "tokenCount": 3680,
    "tokenPrice": 250,
    "clusterUtilizationPct": 92.6,
    "netYieldApy": 16.2,
    "leaseTermMonths": 12,
    "hourlyRate": 6.5,
    "specs": "Flash Memory Analog Compute Arrays, 25 TOPS/Watt Zero Latency Visual Neural Processing",
    "slaStandard": "Defense / Aerospace MIL-STD-810H Compliant",
    "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-36",
    "name": "D-Wave Advantage Quantum-Classical Hybrid Co-Processor",
    "category": "AI Chips & ASICs",
    "facility": "Geneva Quantum Information Vault, Switzerland",
    "hardwareCode": "DWAVE-ADVANTAGE-QC",
    "valuation": 4500000,
    "unrealizedAlphaPct": 22.4,
    "tokenCount": 4500,
    "tokenPrice": 1000,
    "clusterUtilizationPct": 97.8,
    "netYieldApy": 22.5,
    "leaseTermMonths": 24,
    "hourlyRate": 31,
    "specs": "5,000+ Qubits, 15-Way Pegasus Connectivity Graph, Superconducting Cryogenic 15 Millikelvin",
    "slaStandard": "Swiss National Science Foundation Quantum Protocol",
    "imageUrl": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-37",
    "name": "Lightmatter Envise Photonic Computing Electro-Optic Array",
    "category": "AI Chips & ASICs",
    "facility": "Stockholm Kista Photonics Enclave, Sweden",
    "hardwareCode": "LIGHTMATTER-ENVISE",
    "valuation": 3400000,
    "unrealizedAlphaPct": 19.8,
    "tokenCount": 6800,
    "tokenPrice": 500,
    "clusterUtilizationPct": 96.5,
    "netYieldApy": 20.1,
    "leaseTermMonths": 18,
    "hourlyRate": 23.5,
    "specs": "Mach-Zehnder Laser Interferometers, Compute with Light Speed at 1/10th Electrical Power",
    "slaStandard": "Zero Carbon Opto-Electronic Benchmark",
    "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-38",
    "name": "Hailo-8 Deep Learning Processor High-Density Matrix",
    "category": "AI Chips & ASICs",
    "facility": "Paris Saclay AI Cluster, France",
    "hardwareCode": "HAILO-8-MATRIX-64",
    "valuation": 1350000,
    "unrealizedAlphaPct": 15.6,
    "tokenCount": 5400,
    "tokenPrice": 250,
    "clusterUtilizationPct": 94,
    "netYieldApy": 17.2,
    "leaseTermMonths": 12,
    "hourlyRate": 9.2,
    "specs": "Structure-Defined Neural Core Architecture, 1,664 TOPS Across Dense 64-Chip Blade",
    "slaStandard": "ANSSI French Cyber Security Agency Cleared",
    "imageUrl": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-39",
    "name": "FuriosaAI Warboy Multi-Vision Transformer Card Rack",
    "category": "AI Chips & ASICs",
    "facility": "Tokyo Pangaea AI Accelerator Hall, Japan",
    "hardwareCode": "FURIOSA-WARBOY-RACK",
    "valuation": 1550000,
    "unrealizedAlphaPct": 16.4,
    "tokenCount": 6200,
    "tokenPrice": 250,
    "clusterUtilizationPct": 94.8,
    "netYieldApy": 17.5,
    "leaseTermMonths": 12,
    "hourlyRate": 10.4,
    "specs": "Optimized for Multi-Modal Vision Transformers & Diffusion, Sub-2ms 4K Video Upscaling",
    "slaStandard": "Japanese METI Industrial Standards Verified",
    "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-40",
    "name": "Apple Silicon Neural Engine M3 Max Cluster Rack",
    "category": "AI Chips & ASICs",
    "facility": "Zurich Google-Adjacent Creative Hub, Switzerland",
    "hardwareCode": "APPLE-M3MAX-RACK-32",
    "valuation": 1250000,
    "unrealizedAlphaPct": 14.9,
    "tokenCount": 5000,
    "tokenPrice": 250,
    "clusterUtilizationPct": 93.5,
    "netYieldApy": 16.5,
    "leaseTermMonths": 12,
    "hourlyRate": 8.8,
    "specs": "32x M3 Max Units with 4TB Unified High-Speed Memory, 512 Neural Engine Acceleration Cores",
    "slaStandard": "Enterprise iOS & macOS On-Device LLM Pre-Distribution",
    "imageUrl": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-41",
    "name": "Sovereign LLM InfiniBand Quantum-2 NDR Switch Fabric",
    "category": "Infrastructure",
    "facility": "Geneva Freeport Secured Interconnect #08, Switzerland",
    "hardwareCode": "NET-IB-NDR-64P",
    "valuation": 2800000,
    "unrealizedAlphaPct": 18.2,
    "tokenCount": 5600,
    "tokenPrice": 500,
    "clusterUtilizationPct": 99.4,
    "netYieldApy": 19.5,
    "leaseTermMonths": 24,
    "hourlyRate": 18,
    "specs": "64-Port Quantum-2 400Gbps InfiniBand Switching Fabric, Sub-100ns Latency Switch-to-Switch",
    "slaStandard": "Swiss Banking FINMA Compliant Dedicated Network",
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-42",
    "name": "Optically Switched AI Memory Pool Array (CXL 3.0)",
    "category": "Infrastructure",
    "facility": "Frankfurt Cyber-Bunker Vault, Germany",
    "hardwareCode": "CXL-OPTICAL-POOL-3",
    "valuation": 3100000,
    "unrealizedAlphaPct": 19,
    "tokenCount": 6200,
    "tokenPrice": 500,
    "clusterUtilizationPct": 98.2,
    "netYieldApy": 19.8,
    "leaseTermMonths": 24,
    "hourlyRate": 20.5,
    "specs": "64 TB Shared Disaggregated Optical CXL Memory Pool, Dynamic Cache-Coherent Memory Injection",
    "slaStandard": "ISO 27001 Cryptographic Hardware Attested",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-43",
    "name": "Autonomous Distributed RL Training Mesh Node",
    "category": "Infrastructure",
    "facility": "Zurich Swiss Federal Institute of Technology (ETH), Switzerland",
    "hardwareCode": "ETH-RL-MESH-NODE-4",
    "valuation": 2400000,
    "unrealizedAlphaPct": 16.8,
    "tokenCount": 4800,
    "tokenPrice": 500,
    "clusterUtilizationPct": 96.4,
    "netYieldApy": 18.1,
    "leaseTermMonths": 18,
    "hourlyRate": 15.6,
    "specs": "Distributed Multi-Agent Reinforcement Learning Cluster, Zero-Knowledge Checkpointing Protocol",
    "slaStandard": "ETH Zurich Academic Research Excellence Seal",
    "imageUrl": "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-44",
    "name": "ZK-STARK Verifiable Inference Oracle Node",
    "category": "Infrastructure",
    "facility": "Zug Crypto Valley Secure Datacenter, Switzerland",
    "hardwareCode": "ZK-STARK-ORACLE-01",
    "valuation": 1900000,
    "unrealizedAlphaPct": 20.5,
    "tokenCount": 7600,
    "tokenPrice": 250,
    "clusterUtilizationPct": 97.5,
    "netYieldApy": 21,
    "leaseTermMonths": 12,
    "hourlyRate": 12.8,
    "specs": "Cryptographic Hardware Prover for On-Chain Execution of AI Output Proofs, Sub-Second STARK Verification",
    "slaStandard": "Ethereum Mainnet & Swiss DLT Act Verified",
    "imageUrl": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-45",
    "name": "Liquid Immersion Cooling CDU Array Tier-IV",
    "category": "Infrastructure",
    "facility": "Valais Hydro Hydrothermal Cooling Station, Switzerland",
    "hardwareCode": "COOL-CDU-IMMERSION-4",
    "valuation": 2100000,
    "unrealizedAlphaPct": 15.4,
    "tokenCount": 4200,
    "tokenPrice": 500,
    "clusterUtilizationPct": 99,
    "netYieldApy": 17.5,
    "leaseTermMonths": 24,
    "hourlyRate": 14,
    "specs": "Dielectric Fluoropolymer Two-Phase Immersion Coolant, Supports 150 kW/Rack Thermal Dissipation",
    "slaStandard": "ASHRAE TC 9.9 Mission Critical Standard",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-46",
    "name": "High-Throughput NVMe-oF AI Vector Storage Pod",
    "category": "Infrastructure",
    "facility": "Zurich Old Town Bank Enclave (Class IX Safe), Switzerland",
    "hardwareCode": "NVME-OF-VECTOR-2PB",
    "valuation": 2600000,
    "unrealizedAlphaPct": 17.6,
    "tokenCount": 5200,
    "tokenPrice": 500,
    "clusterUtilizationPct": 98,
    "netYieldApy": 18.9,
    "leaseTermMonths": 18,
    "hourlyRate": 17.2,
    "specs": "2.5 Petabyte Gen5 NVMe-over-Fabrics Storage, 120 GB/s Read Throughput for Billion-Scale Vector RAG",
    "slaStandard": "FIPS 140-3 Cryptographic Storage Certification",
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-47",
    "name": "Neuromorphic Event-Camera Vision Sensor Matrix",
    "category": "Infrastructure",
    "facility": "Munich Robotics Vision Testing Facility, Germany",
    "hardwareCode": "NEURO-VISION-CAM-10",
    "valuation": 1450000,
    "unrealizedAlphaPct": 16,
    "tokenCount": 5800,
    "tokenPrice": 250,
    "clusterUtilizationPct": 94.5,
    "netYieldApy": 17.4,
    "leaseTermMonths": 12,
    "hourlyRate": 9.6,
    "specs": "Microsecond Event-Based Asynchronous Pixels, 10,000 Frames/sec Equivalent Zero Motion Blur",
    "slaStandard": "Fraunhofer Institute Certified Optics",
    "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-48",
    "name": "Decentralized GPU Zero-Knowledge Proof Node",
    "category": "Infrastructure",
    "facility": "London Shoreditch Cryptographic Enclave, UK",
    "hardwareCode": "D-GPU-ZK-PROVER-08",
    "valuation": 1750000,
    "unrealizedAlphaPct": 18,
    "tokenCount": 7000,
    "tokenPrice": 250,
    "clusterUtilizationPct": 96.2,
    "netYieldApy": 19.2,
    "leaseTermMonths": 12,
    "hourlyRate": 11.5,
    "specs": "Hardware-Accelerated MSM (Multi-Scalar Multiplication) & NTT for Fast ZK-SNARK Prover Networks",
    "slaStandard": "Zero-Knowledge Proof Consortium Benchmark",
    "imageUrl": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-49",
    "name": "Megawatt Clean Energy AI Microgrid Inverter Node",
    "category": "Infrastructure",
    "facility": "Valais Alpine Hydro Station, Switzerland",
    "hardwareCode": "MICROGRID-AI-2MW",
    "valuation": 2300000,
    "unrealizedAlphaPct": 15.8,
    "tokenCount": 4600,
    "tokenPrice": 500,
    "clusterUtilizationPct": 99.6,
    "netYieldApy": 17.8,
    "leaseTermMonths": 24,
    "hourlyRate": 15,
    "specs": "2.4 MW Solid-State Silicon Carbide Transformer, Sub-Cycle Autonomous Grid Islanding and Frequency Regulation",
    "slaStandard": "Swissgrid Swiss Transmission Grid Compliance",
    "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "ai-50",
    "name": "Photonic Interconnect Terabit Switching Node",
    "category": "Infrastructure",
    "facility": "Geneva Internet Exchange (CIXP) Vault, Switzerland",
    "hardwareCode": "PHOTONIC-SWITCH-8T",
    "valuation": 3500000,
    "unrealizedAlphaPct": 21,
    "tokenCount": 7000,
    "tokenPrice": 500,
    "clusterUtilizationPct": 98.9,
    "netYieldApy": 21.5,
    "leaseTermMonths": 36,
    "hourlyRate": 24,
    "specs": "800 Gbps per Fiber Core, DWDM Silicon Photonics Co-Packaged Optics (CPO) Switching Core",
    "slaStandard": "IEEE 802.3ck Terabit Optical Standard",
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"
  }
];

export const AI_DISTRIBUTION_ITEMS: AiDistributionItem[] = [
  { id: 'ai-dist-1', period: 'February 2025', projected: 18400, actual: 18450, varianceDelta: 50, settlementHash: '0x94fa...11c2', status: 'CLEARED' },
  { id: 'ai-dist-2', period: 'January 2025', projected: 18200, actual: 18200, varianceDelta: 0, settlementHash: '0x88ea...90fb', status: 'CLEARED' },
  { id: 'ai-dist-3', period: 'December 2024', projected: 17900, actual: 17920, varianceDelta: 20, settlementHash: '0x32cc...44ab', status: 'CLEARED' },
  { id: 'ai-dist-4', period: 'November 2024', projected: 17500, actual: 17480, varianceDelta: -20, settlementHash: '0x71dd...88fe', status: 'CLEARED' },
  { id: 'ai-dist-5', period: 'October 2024', projected: 17000, actual: 17050, varianceDelta: 50, settlementHash: '0x12ac...55e1', status: 'CLEARED' },
  { id: 'ai-dist-6', period: 'March 2025 (Projected)', projected: 18600, actual: 0, varianceDelta: 0, settlementHash: 'Pending Clearing', status: 'PENDING' },
];

export const AI_TENANT_CREDIT_MATRIX: AiTenantCreditItem[] = [
  { id: 'tenant-1', tenantName: 'OpenAI API Compute Enclave', tier: 'Enterprise Tier-1', creditRating: 'AAA', allocatedCapacity: '35% Cluster VRAM', monthlyCommitment: 84000, status: 'CURRENT' },
  { id: 'tenant-2', tenantName: 'Anthropic Claude Model Hub', tier: 'Research Syndicate', creditRating: 'AAA', allocatedCapacity: '25% Cluster VRAM', monthlyCommitment: 62000, status: 'CURRENT' },
  { id: 'tenant-3', tenantName: 'Mistral AI Sovereign Matrix', tier: 'European Core', creditRating: 'AA+', allocatedCapacity: '20% Cluster VRAM', monthlyCommitment: 49000, status: 'CURRENT' },
  { id: 'tenant-4', tenantName: 'Swisscom Enterprise AI Labs', tier: 'Telco Tier-1', creditRating: 'AAA', allocatedCapacity: '12% Cluster VRAM', monthlyCommitment: 28500, status: 'CURRENT' },
  { id: 'tenant-5', tenantName: 'Roche AI Molecular Discovery', tier: 'BioPharma Global', creditRating: 'AAA', allocatedCapacity: '8% Cluster VRAM', monthlyCommitment: 19800, status: 'CURRENT' },
];

export const AI_SECONDARY_OTC_ORDERS: AiSecondaryOtcOrder[] = [
  { id: 'ai-otc-1', type: 'BID', assetName: 'NVIDIA H100 SXM5 80GB Cluster', tokenCount: 200, pricePerToken: 520, navPremiumDiscountPct: 4.0, counterpartyEnclave: 'Geneva Institutional Desk', totalUsd: 104000 },
  { id: 'ai-otc-2', type: 'OFFER', assetName: 'NVIDIA B200 Blackwell NVL72 Rack', tokenCount: 150, pricePerToken: 1050, navPremiumDiscountPct: 5.0, counterpartyEnclave: 'Zurich Multi-Family Office', totalUsd: 157500 },
  { id: 'ai-otc-3', type: 'BID', assetName: 'Nordic Hydro AI Hyper-Facility', tokenCount: 300, pricePerToken: 1020, navPremiumDiscountPct: 2.0, counterpartyEnclave: 'Frankfurt Liquidity Provider', totalUsd: 306000 },
  { id: 'ai-otc-4', type: 'OFFER', assetName: 'Google Cloud TPU v5p Pod Slices', tokenCount: 250, pricePerToken: 990, navPremiumDiscountPct: -1.0, counterpartyEnclave: 'London Systematic Macro', totalUsd: 247500 },
  { id: 'ai-otc-5', type: 'BID', assetName: 'Swarm Autonomous Guided Vehicle (AGV)', tokenCount: 400, pricePerToken: 510, navPremiumDiscountPct: 2.0, counterpartyEnclave: 'Singapore Sovereign SPV', totalUsd: 204000 },
];

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
    "title": "2023 Porsche 911 GT3 RS (992)",
    "subtitle": "Active DRS Aerodynamics • 4.0L Naturally Aspirated Flat-6 518hp • Weissach Package • Ice Grey Metallic",
    "fairMarketValue": 580000,
    "acquisitionPrice": 495000,
    "unrealizedGain": 85000,
    "gainPct": 17.17,
    "indexTrend5YrPct": 61.1,
    "indexBenchmark": "Hagerty Modern Supercar Index",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 99.9,
    "conditionLabel": "Factory Delivery Mileage / Full PPF",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "WP0AF2A97PS294810"
      },
      {
        "label": "Engine Code",
        "value": "MA275 Factory Dyno"
      },
      {
        "label": "Certified Odo",
        "value": "480 km"
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
    "title": "2022 Patek Philippe Grand Complications 5270P",
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
    "conditionLabel": "Factory Sealed Double Boxed",
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
        "value": "Confirmed Archive 2022"
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
    "title": "2022 Ferrari Daytona SP3 Icona Series",
    "subtitle": "Naturally Aspirated 6.5L V12 829hp • Targa Carbon Monocoque • 1 of 599 Worldwide • Rosso Corsa",
    "fairMarketValue": 4500000,
    "acquisitionPrice": 3800000,
    "unrealizedGain": 700000,
    "gainPct": 18.42,
    "indexTrend5YrPct": 78.4,
    "indexBenchmark": "Ferrari Icona Series Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #1A",
    "custodyEnclave": "CH-FREEPORT-GEN-01A",
    "conditionScore": 100,
    "conditionLabel": "Factory Delivery Condition Sealed",
    "primaryAttributes": [
      {
        "label": "Chassis Number",
        "value": "ZFF99SP300028710"
      },
      {
        "label": "Classiche Cert",
        "value": "Maranello Attestation"
      },
      {
        "label": "Power Output",
        "value": "829 hp @ 9,500 rpm"
      }
    ],
    "climateTelemetry": "19.8°C / 46% RH Controlled",
    "underwritingPolicy": "Lloyds Specie Blue Chip #LL-CH-91024",
    "insuredValue": 5200000,
    "imageUrl": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-3",
    "type": "vehicle",
    "title": "2021 McLaren Speedtail Hyper-GT",
    "subtitle": "Central Driving Position • Twin-Turbo 4.0L V8 Hybrid 1,036hp • 250 mph Streamliner • 1 of 106",
    "fairMarketValue": 3200000,
    "acquisitionPrice": 2800000,
    "unrealizedGain": 400000,
    "gainPct": 14.29,
    "indexTrend5YrPct": 52.6,
    "indexBenchmark": "McLaren Ultimate Series Benchmark",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 99.8,
    "conditionLabel": "MSO Bespoke Certified Provenance",
    "primaryAttributes": [
      {
        "label": "Chassis Number",
        "value": "Speedtail #072"
      },
      {
        "label": "Odometer",
        "value": "620 km Documented"
      },
      {
        "label": "Body Spec",
        "value": "Titanium Deposition Carbon"
      }
    ],
    "climateTelemetry": "20.1°C / 44% RH Nitrogen Buffer",
    "underwritingPolicy": "Lloyds Specie Global Hypercar #LL-CH-99411",
    "insuredValue": 3800000,
    "imageUrl": "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-2",
    "type": "horology",
    "title": "2023 Rolex Daytona \"Le Mans\" 100th Anniv Ref. 126529LN",
    "subtitle": "18K White Gold • Black Cerachrom Bezel with Red \"100\" Marker • Calibre 4132 with 24H Counter",
    "fairMarketValue": 285000,
    "acquisitionPrice": 240000,
    "unrealizedGain": 45000,
    "gainPct": 18.75,
    "indexTrend5YrPct": 54.2,
    "indexBenchmark": "Rolex High-Complication Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Unworn Double Sealed with Box & Papers",
    "primaryAttributes": [
      {
        "label": "Reference",
        "value": "126529LN 18K WG"
      },
      {
        "label": "Movement Caliber",
        "value": "Calibre 4132 (24H)"
      },
      {
        "label": "Dial Detail",
        "value": "Reverse Panda Exotic Sub-Dials"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 350000,
    "imageUrl": "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-4",
    "type": "vehicle",
    "title": "2023 Mercedes-AMG ONE Formula 1 Hypercar",
    "subtitle": "F1-Derived 1.6L Turbo V6 with 4 Electric Motors 1,049hp • Carbon Monocoque • 1 of 275 Worldwide",
    "fairMarketValue": 4200000,
    "acquisitionPrice": 3600000,
    "unrealizedGain": 600000,
    "gainPct": 16.67,
    "indexTrend5YrPct": 48.9,
    "indexBenchmark": "Hagerty Hypercar Benchmark",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 100,
    "conditionLabel": "Affalterbach Handover Verification",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "WMEONE992PA000142"
      },
      {
        "label": "Engine Code",
        "value": "PU106C Hybrid F1"
      },
      {
        "label": "Aero System",
        "value": "Hydraulic Active Aerodynamics"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Historic Specie #LL-CH-88210",
    "insuredValue": 4900000,
    "imageUrl": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-3",
    "type": "horology",
    "title": "2022 Richard Mille RM 50-03 McLaren F1 Tourbillon",
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
    "title": "2023 Ferrari SF90 XX Stradale",
    "subtitle": "Twin-Turbo 4.0L V8 Hybrid 1,016hp • Fixed Carbon Rear Wing • 1 of 799 Built • Grigio NART",
    "fairMarketValue": 1400000,
    "acquisitionPrice": 1180000,
    "unrealizedGain": 220000,
    "gainPct": 18.64,
    "indexTrend5YrPct": 69.4,
    "indexBenchmark": "Ferrari XX Programme Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #2",
    "custodyEnclave": "CH-FREEPORT-GEN-02",
    "conditionScore": 99.9,
    "conditionLabel": "Factory Delivery Mileage",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "ZFF99XXS000298142"
      },
      {
        "label": "Engine Type",
        "value": "F154FB Twin-Turbo V8"
      },
      {
        "label": "Downforce",
        "value": "530 kg @ 250 km/h"
      }
    ],
    "climateTelemetry": "19.4°C / 48% RH Auto",
    "underwritingPolicy": "Lloyds Motorsport Heritage #LL-RACE-2023",
    "insuredValue": 1700000,
    "imageUrl": "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-4",
    "type": "horology",
    "title": "2021 F.P. Journe Chronomètre Bleu Tantalum",
    "subtitle": "Mirror-Polished Blue Chrome Dial • 39mm Tantalum Case • 18K Rose Gold Hand-Wound Movement",
    "fairMarketValue": 115000,
    "acquisitionPrice": 92000,
    "unrealizedGain": 23000,
    "gainPct": 25,
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
    "insuredValue": 145000,
    "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-6",
    "type": "vehicle",
    "title": "2024 Porsche 911 S/T 60th Anniversary",
    "subtitle": "Naturally Aspirated 4.0L GT3 RS Engine 518hp • 6-Speed Manual • Magnesium Wheels • 1 of 1,963",
    "fairMarketValue": 720000,
    "acquisitionPrice": 590000,
    "unrealizedGain": 130000,
    "gainPct": 22.03,
    "indexTrend5YrPct": 82.5,
    "indexBenchmark": "Porsche Heritage Index",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 100,
    "conditionLabel": "Factory Delivery Sealed",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "WP0ZZZ99ZRS298412"
      },
      {
        "label": "Curb Weight",
        "value": "1,380 kg (Lightest 992)"
      },
      {
        "label": "Heritage Package",
        "value": "Shoreblue Metallic / Cognac"
      }
    ],
    "climateTelemetry": "20.1°C / 44% RH Nitrogen Buffer",
    "underwritingPolicy": "Lloyds Modern Collector #LL-PORSCHE-24",
    "insuredValue": 880000,
    "imageUrl": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-5",
    "type": "horology",
    "title": "2023 Audemars Piguet Royal Oak Concept Split-Seconds GMT",
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
    "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-7",
    "type": "vehicle",
    "title": "2021 Bugatti Chiron Pur Sport",
    "subtitle": "1 of 60 Built • Quad-Turbo 8.0L W16 1,500hp • Fixed Rear Wing • Magnesium Wheels • Jaune Molsheim",
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
        "value": "Bugatti Passeport Tranquillite"
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
    "title": "2022 A. Lange & Söhne Zeitwerk Minute Repeater in Platinum",
    "subtitle": "Decimal Minute Repeater • Mechanical Digital Jumping Numerals Display • Glashütte Calibre L043.5",
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
    "title": "2024 Ferrari 499P Modificata",
    "subtitle": "Le Mans Winner Track Hypercar • 3.0L Twin-Turbo V6 Hybrid 858hp • Corse Clienti Privileges",
    "fairMarketValue": 5400000,
    "acquisitionPrice": 4800000,
    "unrealizedGain": 600000,
    "gainPct": 12.5,
    "indexTrend5YrPct": 68.6,
    "indexBenchmark": "Ferrari Track Car Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #1A",
    "custodyEnclave": "CH-FREEPORT-GEN-01A",
    "conditionScore": 100,
    "conditionLabel": "Maranello Corse Clienti Certified",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "ZFF499PM000021489"
      },
      {
        "label": "Drivetrain",
        "value": "AWD Hybrid Electric Front Axle"
      },
      {
        "label": "FIA Homologation",
        "value": "LMH Le Mans Prototype Spec"
      }
    ],
    "climateTelemetry": "19.8°C / 46% RH Controlled",
    "underwritingPolicy": "Lloyds Specie Blue Chip #LL-CH-91024",
    "insuredValue": 6200000,
    "imageUrl": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-7",
    "type": "horology",
    "title": "2023 Patek Philippe Nautilus Ref. 5811/1G White Gold",
    "subtitle": "41mm Solid White Gold Case • Sunburst Blue Dial with Black-Gradient Rim • Calibre 26-330 S C",
    "fairMarketValue": 165000,
    "acquisitionPrice": 138000,
    "unrealizedGain": 27000,
    "gainPct": 19.57,
    "indexTrend5YrPct": 45.8,
    "indexBenchmark": "Patek Philippe Nautilus Index",
    "vaultLocation": "Zurich Old Town Bank Enclave (Class IX Safe)",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "Unworn Factory Double Sealed",
    "primaryAttributes": [
      {
        "label": "Reference",
        "value": "5811/1G-001"
      },
      {
        "label": "Movement Caliber",
        "value": "26-330 S C Automatic"
      },
      {
        "label": "Clasp Ref",
        "value": "Patented Fold-Over Lock"
      }
    ],
    "climateTelemetry": "20.0°C / 45% N2 Inerte Sealed",
    "underwritingPolicy": "Lloyds Specie Syndicate 2003",
    "insuredValue": 210000,
    "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-9",
    "type": "vehicle",
    "title": "2022 Aston Martin Valkyrie AMR Pro",
    "subtitle": "Cosworth 6.5L Naturally Aspirated V12 1,000hp @ 11,000rpm • Extreme Downforce • 1 of 40 Built",
    "fairMarketValue": 3900000,
    "acquisitionPrice": 3400000,
    "unrealizedGain": 500000,
    "gainPct": 14.71,
    "indexTrend5YrPct": 58.2,
    "indexBenchmark": "Aston Martin Special Projects Index",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 100,
    "conditionLabel": "Gaydon Special Operations Delivery",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "SCFVAMRPRO000018"
      },
      {
        "label": "Aerodynamics",
        "value": "Ground Effect Venturi Tunnels"
      },
      {
        "label": "Top Speed",
        "value": "362 km/h Track Limited"
      }
    ],
    "climateTelemetry": "19.5°C / 48% RH (Geneva Enclave Auto)",
    "underwritingPolicy": "Lloyds Motorsport Heritage #LL-AMR-2022",
    "insuredValue": 4600000,
    "imageUrl": "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-8",
    "type": "horology",
    "title": "2022 MB&F Legacy Machine Perpetual Palladium",
    "subtitle": "Stephen McDonnell Perpetual Calendar Engine • Palladium 44mm Case • Aquamarine Dial Plate • 1 of 25",
    "fairMarketValue": 195000,
    "acquisitionPrice": 165000,
    "unrealizedGain": 30000,
    "gainPct": 18.18,
    "indexTrend5YrPct": 62.4,
    "indexBenchmark": "Independent Horology Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Mint Complete Box & Papers",
    "primaryAttributes": [
      {
        "label": "Material",
        "value": "950 Palladium"
      },
      {
        "label": "Complication",
        "value": "Mechanical Processor Calendar"
      },
      {
        "label": "Production",
        "value": "25 Pieces Limited"
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
    "title": "2023 Lamborghini Revuelto",
    "subtitle": "Naturally Aspirated 6.5L V12 Plug-In Hybrid 1,001hp • Monofuselage Carbon Chassis • Arancio Apodis",
    "fairMarketValue": 750000,
    "acquisitionPrice": 620000,
    "unrealizedGain": 130000,
    "gainPct": 20.97,
    "indexTrend5YrPct": 45,
    "indexBenchmark": "Lamborghini V12 Flagship Index",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 100,
    "conditionLabel": "Sant'Agata Bolognese Factory Handover",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "ZA9R12V12PLA00412"
      },
      {
        "label": "Transmission",
        "value": "8-Speed Dual-Clutch Transverse"
      },
      {
        "label": "0-100 km/h",
        "value": "2.5 Seconds"
      }
    ],
    "climateTelemetry": "20.1°C / 44% RH Nitrogen Buffer",
    "underwritingPolicy": "Lloyds Modern Collector #LL-LAMBO-23",
    "insuredValue": 920000,
    "imageUrl": "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-11",
    "type": "vehicle",
    "title": "2024 Pagani Utopia",
    "subtitle": "Mercedes-AMG 6.0L Twin-Turbo V12 852hp • 7-Speed Xtrac Manual Gate • Carbo-Titanium Monocoque",
    "fairMarketValue": 3600000,
    "acquisitionPrice": 3100000,
    "unrealizedGain": 500000,
    "gainPct": 16.13,
    "indexTrend5YrPct": 64.2,
    "indexBenchmark": "Pagani Atelier Benchmark",
    "vaultLocation": "Geneva Freeport Sub-Vault #2",
    "custodyEnclave": "CH-FREEPORT-GEN-02",
    "conditionScore": 100,
    "conditionLabel": "Horacio Pagani Signed Delivery",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "ZA9UTOPIA20240019"
      },
      {
        "label": "Gearbox",
        "value": "Pure Mechanical Gated 7-Speed"
      },
      {
        "label": "Dry Weight",
        "value": "1,280 kg Carbon-Titanium"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Specie Global Hypercar #LL-CH-99411",
    "insuredValue": 4200000,
    "imageUrl": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-9",
    "type": "horology",
    "title": "2022 Vacheron Constantin Overseas Tourbillon Skeleton",
    "subtitle": "Grade 5 Titanium 42.5mm Case • Ultra-Thin Calibre 2160SQ Skeleton • 80h Power Reserve",
    "fairMarketValue": 185000,
    "acquisitionPrice": 155000,
    "unrealizedGain": 30000,
    "gainPct": 19.35,
    "indexTrend5YrPct": 36.4,
    "indexBenchmark": "Vacheron Constantin Haute Horlogerie Index",
    "vaultLocation": "Zurich Old Town Bank Enclave (Class IX Safe)",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "Hallmark of Geneva Sealed Set",
    "primaryAttributes": [
      {
        "label": "Reference",
        "value": "6000V/110T-B935"
      },
      {
        "label": "Hallmark",
        "value": "Poincon de Geneve Certified"
      },
      {
        "label": "Interchangeable Straps",
        "value": "Titanium / Rubber / Calfskin"
      }
    ],
    "climateTelemetry": "20.0°C / 45% N2 Inerte Sealed",
    "underwritingPolicy": "Lloyds Specie Syndicate 2003",
    "insuredValue": 230000,
    "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-12",
    "type": "vehicle",
    "title": "2023 Koenigsegg Jesko Attack",
    "subtitle": "5.0L Twin-Turbo Flat-Plane V8 1,600hp (E85) • 9-Speed Light Speed Transmission • 1,400kg Downforce",
    "fairMarketValue": 3800000,
    "acquisitionPrice": 3250000,
    "unrealizedGain": 550000,
    "gainPct": 16.92,
    "indexTrend5YrPct": 55,
    "indexBenchmark": "Koenigsegg Angelholm Benchmark",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 100,
    "conditionLabel": "Factory Handover Provenance",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "YT9JESKO23000142"
      },
      {
        "label": "Transmission",
        "value": "Koenigsegg LST 9-Speed"
      },
      {
        "label": "Aero Spec",
        "value": "High-Downforce Attack Wing"
      }
    ],
    "climateTelemetry": "19.5°C / 48% RH (Geneva Enclave Auto)",
    "underwritingPolicy": "Lloyds Global Hypercar #LL-KOENIG-23",
    "insuredValue": 4500000,
    "imageUrl": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-10",
    "type": "horology",
    "title": "2024 Rolex Submariner Date \"Kermit\" Ref. 126610LV",
    "subtitle": "Oystersteel 41mm Case • Green Cerachrom Ceramic Bezel • Calibre 3235 with Chronergy Escapement",
    "fairMarketValue": 16800,
    "acquisitionPrice": 14200,
    "unrealizedGain": 2600,
    "gainPct": 18.31,
    "indexTrend5YrPct": 28.5,
    "indexBenchmark": "Rolex Professional Sports Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Unworn 2024 Card & Double Boxed",
    "primaryAttributes": [
      {
        "label": "Reference",
        "value": "126610LV-0002"
      },
      {
        "label": "Water Resistance",
        "value": "300m / 1,000 ft"
      },
      {
        "label": "Bezel",
        "value": "Green Cerachrom Unidirectional"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 22000,
    "imageUrl": "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-13",
    "type": "vehicle",
    "title": "2022 Bugatti Bolide",
    "subtitle": "Track-Only 8.0L Quad-Turbo W16 1,825hp • Extreme Aerodynamics • Weight-to-Power 0.67 kg/hp • 1 of 40",
    "fairMarketValue": 4600000,
    "acquisitionPrice": 4000000,
    "unrealizedGain": 600000,
    "gainPct": 15,
    "indexTrend5YrPct": 52.4,
    "indexBenchmark": "Bugatti Track Benchmark",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 100,
    "conditionLabel": "Molsheim Track Program Delivery",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "VF9BOLIDE000040"
      },
      {
        "label": "Weight",
        "value": "1,450 kg Dry Weight"
      },
      {
        "label": "Downforce",
        "value": "3,000 kg @ 320 km/h"
      }
    ],
    "climateTelemetry": "19.5°C / 48% RH (Geneva Enclave Auto)",
    "underwritingPolicy": "Lloyds Global Hypercar #LL-BUGATTI-22",
    "insuredValue": 5300000,
    "imageUrl": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-11",
    "type": "horology",
    "title": "2021 Cartier Crash Radieuse Limited Edition",
    "subtitle": "Asymmetrical 18K Yellow Gold Case • Concentric Faded Roman Numerals • Calibre 8970 MC",
    "fairMarketValue": 175000,
    "acquisitionPrice": 145000,
    "unrealizedGain": 30000,
    "gainPct": 20.69,
    "indexTrend5YrPct": 88.4,
    "indexBenchmark": "Cartier Shape Watch Index",
    "vaultLocation": "Zurich Old Town Bank Enclave (Class IX Safe)",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 99.8,
    "conditionLabel": "Complete London Atelier Set",
    "primaryAttributes": [
      {
        "label": "Case Design",
        "value": "Original Asymmetric Sculpture"
      },
      {
        "label": "Movement",
        "value": "Hand-Wound Calibre 8970 MC"
      },
      {
        "label": "Hallmarks",
        "value": "Swiss & French Assay Marks"
      }
    ],
    "climateTelemetry": "20.0°C / 45% N2 Inerte Sealed",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 220000,
    "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-14",
    "type": "vehicle",
    "title": "2024 Porsche 911 Dakar (Roughroads Edition)",
    "subtitle": "Twin-Turbo 3.0L Boxer-6 473hp • All-Terrain Lift Suspension (191mm clearance) • 1 of 2,500 Built",
    "fairMarketValue": 340000,
    "acquisitionPrice": 285000,
    "unrealizedGain": 55000,
    "gainPct": 19.3,
    "indexTrend5YrPct": 48,
    "indexBenchmark": "Porsche Heritage Rally Index",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 100,
    "conditionLabel": "Weissach Delivery Sealed",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "WP0AD2A98RS291048"
      },
      {
        "label": "Tires",
        "value": "Pirelli Scorpion All-Terrain Plus"
      },
      {
        "label": "Livery",
        "value": "Rallye Design Package 1984"
      }
    ],
    "climateTelemetry": "20.1°C / 44% RH Nitrogen Buffer",
    "underwritingPolicy": "Lloyds Modern Collector #LL-PORSCHE-24",
    "insuredValue": 420000,
    "imageUrl": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-12",
    "type": "horology",
    "title": "2022 Audemars Piguet Royal Oak Jumbo Extra-Thin 16202ST",
    "subtitle": "50th Anniversary Edition • Bleue Nuit Petite Tapisserie Dial • Self-Winding Calibre 7121",
    "fairMarketValue": 92000,
    "acquisitionPrice": 78000,
    "unrealizedGain": 14000,
    "gainPct": 17.95,
    "indexTrend5YrPct": 38.6,
    "indexBenchmark": "Royal Oak 50th Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "50th Anniversary Rotor Engraved",
    "primaryAttributes": [
      {
        "label": "Reference",
        "value": "16202ST.OO.1240ST.01"
      },
      {
        "label": "Thickness",
        "value": "8.1 mm Ultra-Thin"
      },
      {
        "label": "Rotor Spec",
        "value": "50 Years Gold Rotor"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 120000,
    "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-15",
    "type": "vehicle",
    "title": "2023 Ferrari 296 GTB Assetto Fiorano",
    "subtitle": "Twin-Turbo 120° V6 Hybrid 819hp • Multimatic Dampers • Carbon Fiber Wheels • Rosso Imola",
    "fairMarketValue": 460000,
    "acquisitionPrice": 390000,
    "unrealizedGain": 70000,
    "gainPct": 17.95,
    "indexTrend5YrPct": 41.5,
    "indexBenchmark": "Ferrari Mid-Rear Berlinetta Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #1A",
    "custodyEnclave": "CH-FREEPORT-GEN-01A",
    "conditionScore": 100,
    "conditionLabel": "Assetto Fiorano Track Package Cleared",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "ZFF99GTB000298104"
      },
      {
        "label": "Engine Type",
        "value": "Tipo F163 120° V6 Hybrid"
      },
      {
        "label": "Weight Reduction",
        "value": "-15 kg Assetto Fiorano"
      }
    ],
    "climateTelemetry": "19.8°C / 46% RH Controlled",
    "underwritingPolicy": "Lloyds Specie Blue Chip #LL-CH-91024",
    "insuredValue": 560000,
    "imageUrl": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-13",
    "type": "horology",
    "title": "2021 Patek Philippe Aquanaut Chronograph Ref. 5968G",
    "subtitle": "Midnight Blue Embossed Dial • 42.2mm 18K White Gold Case • Flyback Chronograph Calibre CH 28-520 C",
    "fairMarketValue": 88000,
    "acquisitionPrice": 72000,
    "unrealizedGain": 16000,
    "gainPct": 22.22,
    "indexTrend5YrPct": 52.8,
    "indexBenchmark": "Patek Philippe Aquanaut Index",
    "vaultLocation": "Zurich Old Town Bank Enclave (Class IX Safe)",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "Factory Double Sealed with Both Straps",
    "primaryAttributes": [
      {
        "label": "Reference",
        "value": "5968G-001"
      },
      {
        "label": "Movement",
        "value": "CH 28-520 C Automatic"
      },
      {
        "label": "Water Resistance",
        "value": "120 m Screw-Down Crown"
      }
    ],
    "climateTelemetry": "20.0°C / 45% N2 Inerte Sealed",
    "underwritingPolicy": "Lloyds Specie Syndicate 2003",
    "insuredValue": 110000,
    "imageUrl": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-16",
    "type": "vehicle",
    "title": "2024 Mercedes-AMG GT Black Series P One Edition",
    "subtitle": "Flat-Plane Crank 4.0L Twin-Turbo V8 720hp • Carbon Dual-Blade Rear Wing • Reserved for AMG ONE Owners",
    "fairMarketValue": 680000,
    "acquisitionPrice": 570000,
    "unrealizedGain": 110000,
    "gainPct": 19.3,
    "indexTrend5YrPct": 46.2,
    "indexBenchmark": "Mercedes-AMG Black Series Index",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 100,
    "conditionLabel": "Delivery Mileage P One Spec",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "WDB1903821A00412"
      },
      {
        "label": "Engine Code",
        "value": "M178 LS2 Flat-Plane"
      },
      {
        "label": "Nürburgring Record",
        "value": "6:43.616 Production Lap"
      }
    ],
    "climateTelemetry": "19.5°C / 45% RH Auto Sensor",
    "underwritingPolicy": "Lloyds Historic Specie #LL-CH-88210",
    "insuredValue": 820000,
    "imageUrl": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-14",
    "type": "horology",
    "title": "2022 De Bethune DB28 Starry Varius Titanium",
    "subtitle": "Custom Milky Way Star-Studded Titanium Dial with Gold Leaf Pins • Floating Lugs • Calibre DB2105",
    "fairMarketValue": 145000,
    "acquisitionPrice": 120000,
    "unrealizedGain": 25000,
    "gainPct": 20.83,
    "indexTrend5YrPct": 76.5,
    "indexBenchmark": "Independent High-Horology Benchmark",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "L'Auberson Manufacture Certificate",
    "primaryAttributes": [
      {
        "label": "Dial Constellation",
        "value": "Custom Latitude 46°N Sky"
      },
      {
        "label": "Case Material",
        "value": "Grade 5 Mirror Polished Titanium"
      },
      {
        "label": "Power Reserve",
        "value": "6 Days Self-Regulating Twin Barrel"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 185000,
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-17",
    "type": "vehicle",
    "title": "2023 Koenigsegg Gemera Early Reserve",
    "subtitle": "Mega-GT 2,300hp Hot V8 Hybrid • 4-Seater Full Carbon Monocoque • Direct Drive AWD",
    "fairMarketValue": 2800000,
    "acquisitionPrice": 2400000,
    "unrealizedGain": 400000,
    "gainPct": 16.67,
    "indexTrend5YrPct": 56.4,
    "indexBenchmark": "Koenigsegg Mega-GT Benchmark",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 100,
    "conditionLabel": "Factory Allocation Slot Confirmed",
    "primaryAttributes": [
      {
        "label": "Chassis Allocation",
        "value": "Gemera Chassis #018"
      },
      {
        "label": "Drivetrain",
        "value": "HV8 5.0L Twin-Turbo + Dark Matter"
      },
      {
        "label": "Total Torque",
        "value": "2,750 Nm Combined"
      }
    ],
    "climateTelemetry": "19.5°C / 48% RH (Geneva Enclave Auto)",
    "underwritingPolicy": "Lloyds Global Hypercar #LL-KOENIG-23",
    "insuredValue": 3300000,
    "imageUrl": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-15",
    "type": "horology",
    "title": "2020 Richard Mille RM 11-03 Jean Todt Chronograph",
    "subtitle": "Blue Quartz TPT Flyback Chronograph • Skeletonized Automatic Movement • 150-Piece Limited Series",
    "fairMarketValue": 490000,
    "acquisitionPrice": 410000,
    "unrealizedGain": 80000,
    "gainPct": 19.51,
    "indexTrend5YrPct": 48,
    "indexBenchmark": "Richard Mille Limited Series Index",
    "vaultLocation": "Zurich Old Town Bank Enclave (Class IX Safe)",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 99.7,
    "conditionLabel": "Complete Box, Papers & Winding Box",
    "primaryAttributes": [
      {
        "label": "Case Material",
        "value": "Blue & White Quartz TPT"
      },
      {
        "label": "Calibre",
        "value": "RMAC3 Titanium Flyback"
      },
      {
        "label": "Series",
        "value": "No. 42 / 150"
      }
    ],
    "climateTelemetry": "20.0°C / 45% N2 Inerte Sealed",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 600000,
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-18",
    "type": "vehicle",
    "title": "2023 McLaren Solus GT",
    "subtitle": "Single-Seat Track Weapon • 5.2L Naturally Aspirated V10 829hp @ 10,000rpm • 1 of 25 Worldwide",
    "fairMarketValue": 3800000,
    "acquisitionPrice": 3300000,
    "unrealizedGain": 500000,
    "gainPct": 15.15,
    "indexTrend5YrPct": 49.5,
    "indexBenchmark": "McLaren Motorsport Series Index",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 100,
    "conditionLabel": "MSO Factory Handover Complete",
    "primaryAttributes": [
      {
        "label": "Chassis Number",
        "value": "Solus GT #07 of 25"
      },
      {
        "label": "Aerodynamic Downforce",
        "value": "1,200 kg at max speed"
      },
      {
        "label": "Weight",
        "value": "Sub-1,000 kg Dry"
      }
    ],
    "climateTelemetry": "20.1°C / 44% RH Nitrogen Buffer",
    "underwritingPolicy": "Lloyds Motorsport Heritage #LL-MCLAREN-23",
    "insuredValue": 4500000,
    "imageUrl": "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-16",
    "type": "horology",
    "title": "2023 Rolex GMT-Master II \"Pepsi\" Meteorite Dial Ref. 126719BLRO",
    "subtitle": "18K White Gold • Gibeon Meteorite Dial • Cerachrom Red/Blue Ceramic Bezel • Calibre 3285",
    "fairMarketValue": 68000,
    "acquisitionPrice": 56000,
    "unrealizedGain": 12000,
    "gainPct": 21.43,
    "indexTrend5YrPct": 35.8,
    "indexBenchmark": "Rolex Meteorite Collection Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Unworn 2023 Card & Tags Attached",
    "primaryAttributes": [
      {
        "label": "Reference",
        "value": "126719BLRO-0002"
      },
      {
        "label": "Dial Material",
        "value": "Iron-Nickel Gibeon Meteorite"
      },
      {
        "label": "Case Metal",
        "value": "18K White Gold Monobloc"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 85000,
    "imageUrl": "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-19",
    "type": "vehicle",
    "title": "2023 Porsche 718 Cayman GT4 RS",
    "subtitle": "Mid-Mounted 4.0L Naturally Aspirated Flat-6 493hp • Carbon Induction Airbox in Quarter Windows",
    "fairMarketValue": 295000,
    "acquisitionPrice": 245000,
    "unrealizedGain": 50000,
    "gainPct": 20.41,
    "indexTrend5YrPct": 44.5,
    "indexBenchmark": "Porsche Motorsport RS Benchmark",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 100,
    "conditionLabel": "Weissach Package / Ceramic Composite Brakes",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "WP0AC2A87PS289140"
      },
      {
        "label": "Exhaust",
        "value": "Titanium Tailpipes Weissach"
      },
      {
        "label": "Rev Limit",
        "value": "9,000 rpm"
      }
    ],
    "climateTelemetry": "20.1°C / 44% RH Nitrogen Buffer",
    "underwritingPolicy": "Lloyds Modern Collector #LL-PORSCHE-23",
    "insuredValue": 360000,
    "imageUrl": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-17",
    "type": "horology",
    "title": "2021 Patek Philippe Celestial Ref. 6102P Platinum",
    "subtitle": "Sky Moon Celestial Chart of Geneva Night Sky • Sapphire Crystal Discs • Self-Winding Calibre 240 LU CL C",
    "fairMarketValue": 385000,
    "acquisitionPrice": 325000,
    "unrealizedGain": 60000,
    "gainPct": 18.46,
    "indexTrend5YrPct": 42,
    "indexBenchmark": "Patek Philippe Grand Complications Index",
    "vaultLocation": "Zurich Old Town Bank Enclave (Class IX Safe)",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "Museum Mint Condition Sealed",
    "primaryAttributes": [
      {
        "label": "Reference",
        "value": "6102P-001"
      },
      {
        "label": "Display",
        "value": "Geneva Meridian Celestial Motion"
      },
      {
        "label": "Case Metal",
        "value": "950 Platinum with Inset Diamond"
      }
    ],
    "climateTelemetry": "20.0°C / 45% N2 Inerte Sealed",
    "underwritingPolicy": "Lloyds Specie Syndicate 2003",
    "insuredValue": 480000,
    "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-20",
    "type": "vehicle",
    "title": "2022 Ferrari 812 Competizione",
    "subtitle": "Naturally Aspirated 6.5L V12 819hp @ 9,500rpm • Aluminum Rear Screen with Vortex Generators • 1 of 999",
    "fairMarketValue": 1850000,
    "acquisitionPrice": 1550000,
    "unrealizedGain": 300000,
    "gainPct": 19.35,
    "indexTrend5YrPct": 54,
    "indexBenchmark": "Ferrari V12 Special Series Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #1A",
    "custodyEnclave": "CH-FREEPORT-GEN-01A",
    "conditionScore": 100,
    "conditionLabel": "Tailor Made Atelier Certified",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "ZFF90CPB000291404"
      },
      {
        "label": "Steering",
        "value": "Independent 4-Wheel Steering"
      },
      {
        "label": "Carbon Wheels",
        "value": "Full Carbon Composite Rims"
      }
    ],
    "climateTelemetry": "19.8°C / 46% RH Controlled",
    "underwritingPolicy": "Lloyds Specie Blue Chip #LL-CH-91024",
    "insuredValue": 2200000,
    "imageUrl": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-18",
    "type": "horology",
    "title": "2023 Audemars Piguet Royal Oak Flying Tourbillon Openworked",
    "subtitle": "18K Pink Gold 41mm Case • Openworked Calibre 2972 • Double Micro-Blasted Bridges",
    "fairMarketValue": 310000,
    "acquisitionPrice": 260000,
    "unrealizedGain": 50000,
    "gainPct": 19.23,
    "indexTrend5YrPct": 41,
    "indexBenchmark": "Audemars Piguet High Complication Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Factory Sealed Le Brassus Guarantee",
    "primaryAttributes": [
      {
        "label": "Reference",
        "value": "26735OR.OO.1320OR.01"
      },
      {
        "label": "Tourbillon",
        "value": "Flying Tourbillon 1 Minute"
      },
      {
        "label": "Finishing",
        "value": "Haute Horlogerie Hand-Polished Angles"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 380000,
    "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-21",
    "type": "vehicle",
    "title": "2024 Mercedes-Maybach S 680 Haute Voiture",
    "subtitle": "Handcrafted 6.0L Twin-Turbo V12 621hp • Two-Tone Nautical Blue / Rose Gold • Boucle Fabric Interior",
    "fairMarketValue": 420000,
    "acquisitionPrice": 350000,
    "unrealizedGain": 70000,
    "gainPct": 20,
    "indexTrend5YrPct": 35,
    "indexBenchmark": "Maybach Bespoke Luxury Index",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 100,
    "conditionLabel": "Limited 1 of 150 Collector Edition",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "WDD2231761A002914"
      },
      {
        "label": "Luggage Set",
        "value": "Matched Haute Voiture Weekender"
      },
      {
        "label": "Audio",
        "value": "Burmester 4D High-End Surround"
      }
    ],
    "climateTelemetry": "20.1°C / 44% RH Nitrogen Buffer",
    "underwritingPolicy": "Lloyds Historic Specie #LL-CH-88210",
    "insuredValue": 510000,
    "imageUrl": "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-19",
    "type": "horology",
    "title": "2022 Greubel Forsey Double Tourbillon 30° Technique",
    "subtitle": "Patented 30° Inclined Bi-Axial Tourbillon • Grade 5 Titanium 47.5mm Case • 120h Chronometric Power",
    "fairMarketValue": 360000,
    "acquisitionPrice": 300000,
    "unrealizedGain": 60000,
    "gainPct": 20,
    "indexTrend5YrPct": 45.2,
    "indexBenchmark": "Greubel Forsey Invention Index",
    "vaultLocation": "Zurich Old Town Bank Enclave (Class IX Safe)",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "La Chaux-de-Fonds Archive Attested",
    "primaryAttributes": [
      {
        "label": "Invention 1",
        "value": "Double Tourbillon 30°"
      },
      {
        "label": "Power Reserve",
        "value": "120 Hours Quadruple Barrel"
      },
      {
        "label": "Finishing Level",
        "value": "Black-Polished Steel Bridges"
      }
    ],
    "climateTelemetry": "20.0°C / 45% N2 Inerte Sealed",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 440000,
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-22",
    "type": "vehicle",
    "title": "2022 Ford GT Carbon Edition",
    "subtitle": "Twin-Turbo 3.5L EcoBoost V6 660hp • Carbon Wheels & Exposed Weave Stripe • Akrapovic Titanium Exhaust",
    "fairMarketValue": 1250000,
    "acquisitionPrice": 1050000,
    "unrealizedGain": 200000,
    "gainPct": 19.05,
    "indexTrend5YrPct": 51,
    "indexBenchmark": "Ford Performance Supercar Index",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 100,
    "conditionLabel": "Multimatic Factory Fresh",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "2FMGTA879N0000412"
      },
      {
        "label": "Odometer",
        "value": "310 km Delivery Only"
      },
      {
        "label": "Active Aero",
        "value": "Hydraulic Wing & Gurney Flap"
      }
    ],
    "climateTelemetry": "19.5°C / 48% RH (Geneva Enclave Auto)",
    "underwritingPolicy": "Lloyds Specie Global Hypercar #LL-CH-99411",
    "insuredValue": 1500000,
    "imageUrl": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-20",
    "type": "horology",
    "title": "2023 Rolex Day-Date 40 \"Puzzle Dial\" Platinum Ref. 128236",
    "subtitle": "Champleve Enamel Jigsaw Dial • 10 Baguette-Cut Sapphire Markers • Emojis Daily Date Wheel",
    "fairMarketValue": 240000,
    "acquisitionPrice": 195000,
    "unrealizedGain": 45000,
    "gainPct": 23.08,
    "indexTrend5YrPct": 62,
    "indexBenchmark": "Rolex Rare Handcrafts Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "VIP Allocation Double Sealed",
    "primaryAttributes": [
      {
        "label": "Reference",
        "value": "128236-0014 Platinum"
      },
      {
        "label": "Dial Technique",
        "value": "Champleve Grand Feu Enamel"
      },
      {
        "label": "Date Disc",
        "value": "31 Customized Emoji Icons"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 295000,
    "imageUrl": "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-23",
    "type": "vehicle",
    "title": "2024 Lamborghini Countach LPI 800-4",
    "subtitle": "Naturally Aspirated 6.5L V12 Hybrid 803hp with Supercapacitor • Retro Wedge Carbon Body • 1 of 112",
    "fairMarketValue": 2900000,
    "acquisitionPrice": 2450000,
    "unrealizedGain": 450000,
    "gainPct": 18.37,
    "indexTrend5YrPct": 58,
    "indexBenchmark": "Lamborghini Few-Off Collector Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #2",
    "custodyEnclave": "CH-FREEPORT-GEN-02",
    "conditionScore": 100,
    "conditionLabel": "Few-Off Series Handover Documented",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "ZA9C8004PA000088"
      },
      {
        "label": "Hybrid System",
        "value": "48V Electric Motor & Supercapacitor"
      },
      {
        "label": "Production Number",
        "value": "No. 88 / 112"
      }
    ],
    "climateTelemetry": "19.4°C / 48% RH Auto",
    "underwritingPolicy": "Lloyds Global Hypercar #LL-LAMBO-24",
    "insuredValue": 3450000,
    "imageUrl": "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-21",
    "type": "horology",
    "title": "2022 F.P. Journe Tourbillon Souverain Vertical Tantalum",
    "subtitle": "Vertical Tourbillon Revolving Every 30 Seconds • Constant-Force Remontoir d'Egalite • Deadbeat Seconds",
    "fairMarketValue": 380000,
    "acquisitionPrice": 310000,
    "unrealizedGain": 70000,
    "gainPct": 22.58,
    "indexTrend5YrPct": 72,
    "indexBenchmark": "F.P. Journe Invenit et Fecit Benchmark",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Manufacturer Vault Delivery Unworn",
    "primaryAttributes": [
      {
        "label": "Movement",
        "value": "Calibre 1519 18K Rose Gold"
      },
      {
        "label": "Complication",
        "value": "Vertical Tourbillon & Remontoir"
      },
      {
        "label": "Case Metal",
        "value": "Tantalum 42mm"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 460000,
    "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-24",
    "type": "vehicle",
    "title": "2023 Ferrari SP-8 Special Projects One-Off",
    "subtitle": "Bespoke Roadster Based on F8 Spider 710hp • Unique Unpainted Carbon Fiber Nose • Commissioned One-Off",
    "fairMarketValue": 4900000,
    "acquisitionPrice": 4200000,
    "unrealizedGain": 700000,
    "gainPct": 16.67,
    "indexTrend5YrPct": 75,
    "indexBenchmark": "Ferrari Special Projects One-Off Index",
    "vaultLocation": "Geneva Freeport Sub-Vault #1A",
    "custodyEnclave": "CH-FREEPORT-GEN-01A",
    "conditionScore": 100,
    "conditionLabel": "One-Off Maranello Special Projects Certificate",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "ZFFSP8ONEOFF2023"
      },
      {
        "label": "Design Atelier",
        "value": "Flavio Manzoni Centro Stile Ferrari"
      },
      {
        "label": "Roof Concept",
        "value": "Pure Windscreen-Less Roadster"
      }
    ],
    "climateTelemetry": "19.8°C / 46% RH Controlled",
    "underwritingPolicy": "Lloyds Specie Blue Chip #LL-CH-91024",
    "insuredValue": 5800000,
    "imageUrl": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-22",
    "type": "horology",
    "title": "2022 Patek Philippe World Time Chronograph Ref. 5930P",
    "subtitle": "Green Guilloche Dial in 950 Platinum • 24 Timezones & Instant Chronograph Flyback Calibre CH 28-520 HU",
    "fairMarketValue": 125000,
    "acquisitionPrice": 105000,
    "unrealizedGain": 20000,
    "gainPct": 19.05,
    "indexTrend5YrPct": 34,
    "indexBenchmark": "Patek Philippe Complications Index",
    "vaultLocation": "Zurich Old Town Bank Enclave (Class IX Safe)",
    "custodyEnclave": "CH-ZUR-VAULT-02",
    "conditionScore": 100,
    "conditionLabel": "Double Factory Sealed Package",
    "primaryAttributes": [
      {
        "label": "Reference",
        "value": "5930P-001"
      },
      {
        "label": "City Ring",
        "value": "World Time 24 Global Hubs"
      },
      {
        "label": "Platinum Marker",
        "value": "Top Wesselton Diamond at 6 O'clock"
      }
    ],
    "climateTelemetry": "20.0°C / 45% N2 Inerte Sealed",
    "underwritingPolicy": "Lloyds Specie Syndicate 2003",
    "insuredValue": 155000,
    "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-25",
    "type": "vehicle",
    "title": "2024 Bugatti Tourbillon Pre-Series",
    "subtitle": "All-New Naturally Aspirated 8.3L V16 with Cosworth + 3 Electric Motors 1,800hp • Swiss Watchmaker Dial Cluster",
    "fairMarketValue": 4600000,
    "acquisitionPrice": 4100000,
    "unrealizedGain": 500000,
    "gainPct": 12.2,
    "indexTrend5YrPct": 50,
    "indexBenchmark": "Bugatti Next-Gen Hypercar Index",
    "vaultLocation": "Geneva Freeport Vault #4B",
    "custodyEnclave": "CH-FREEPORT-GEN-04B",
    "conditionScore": 100,
    "conditionLabel": "Molsheim Allocation Priority #007",
    "primaryAttributes": [
      {
        "label": "Chassis Slot",
        "value": "Tourbillon Priority 007 / 250"
      },
      {
        "label": "Instrument Cluster",
        "value": "Titanium Skeletal Watch-Grade Instruments"
      },
      {
        "label": "Top Speed",
        "value": "445 km/h"
      }
    ],
    "climateTelemetry": "19.5°C / 48% RH (Geneva Enclave Auto)",
    "underwritingPolicy": "Lloyds Global Hypercar #LL-BUGATTI-24",
    "insuredValue": 5400000,
    "imageUrl": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-23",
    "type": "horology",
    "title": "2022 Kari Voutilainen Vingt-8 Hand-Crafted Enamel",
    "subtitle": "Direct Impulse Escapement with Two Wheels • Engine-Turned Grand Feu Enamel Dial • 1 of 8 Unique",
    "fairMarketValue": 195000,
    "acquisitionPrice": 160000,
    "unrealizedGain": 35000,
    "gainPct": 21.88,
    "indexTrend5YrPct": 68,
    "indexBenchmark": "Independent Master Watchmaker Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Môtiers Workshop Signed Attestation",
    "primaryAttributes": [
      {
        "label": "Escapement",
        "value": "Dual Balance-Spring Direct Impulse"
      },
      {
        "label": "Dial Craft",
        "value": "Hand Guilloche & Grand Feu Enamel"
      },
      {
        "label": "Case Metal",
        "value": "18K White Gold 39mm"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 240000,
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "car-26",
    "type": "vehicle",
    "title": "2023 Aston Martin DBS 770 Ultimate",
    "subtitle": "5.2L Twin-Turbo V12 759hp • Solid Mounted Steering Column • Carbon Ceramic Brakes • 1 of 300 Coupes",
    "fairMarketValue": 480000,
    "acquisitionPrice": 400000,
    "unrealizedGain": 80000,
    "gainPct": 20,
    "indexTrend5YrPct": 42,
    "indexBenchmark": "Aston Martin V12 Final Edition Benchmark",
    "vaultLocation": "Zurich Vault Enclave #01",
    "custodyEnclave": "CH-ZUR-FREEPORT-01",
    "conditionScore": 100,
    "conditionLabel": "Gaydon Delivery Specimen",
    "primaryAttributes": [
      {
        "label": "Chassis VIN",
        "value": "SCFEV770ULT202319"
      },
      {
        "label": "Torque",
        "value": "900 Nm @ 1,800 rpm"
      },
      {
        "label": "Carbon Styling",
        "value": "Full Twill Carbon Aerodynamic Package"
      }
    ],
    "climateTelemetry": "20.1°C / 44% RH Nitrogen Buffer",
    "underwritingPolicy": "Lloyds Motorsport Heritage #LL-AMR-2023",
    "insuredValue": 580000,
    "imageUrl": "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": "watch-24",
    "type": "horology",
    "title": "2022 Rolex Daytona \"Eye of the Tiger\" Ref. 116588TBR",
    "subtitle": "18K Yellow Gold • Diamond-Paved Tiger Stripe Dial • 36 Trapeze-Cut Diamonds on Bezel • Oysterflex",
    "fairMarketValue": 260000,
    "acquisitionPrice": 215000,
    "unrealizedGain": 45000,
    "gainPct": 20.93,
    "indexTrend5YrPct": 56,
    "indexBenchmark": "Rolex Gem-Set Daytona Index",
    "vaultLocation": "Geneva Freeport Watch Safe #12",
    "custodyEnclave": "CH-GEN-HORO-12",
    "conditionScore": 100,
    "conditionLabel": "Unworn 2022 Card Double Boxed",
    "primaryAttributes": [
      {
        "label": "Reference",
        "value": "116588TBR-0001"
      },
      {
        "label": "Gem-Set",
        "value": "36 Trapeze Diamonds Bezel"
      },
      {
        "label": "Strap Ref",
        "value": "High-Performance Oysterflex"
      }
    ],
    "climateTelemetry": "19.2°C / 40% RH Inert Vault",
    "underwritingPolicy": "Lloyds Horology Specie #LL-HORO-5512",
    "insuredValue": 320000,
    "imageUrl": "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=800&q=80"
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
