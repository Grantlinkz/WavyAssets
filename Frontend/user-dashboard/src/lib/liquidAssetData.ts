export type CustodyBadge = 'SOVEREIGN_CUSTODY' | 'EXTERNAL_WEB3' | 'STAKING_LOCKUP';

export interface CryptoHolding {
  symbol: string;
  name: string;
  enclave: string;
  custodyType: CustodyBadge;
  custodyLabel: string;
  balance: number;
  unit: string;
  entryPrice: number;
  spotPrice: number;
  unrealizedPnl: number;
  pnlPct: number;
  riskRating: string;
  stakingApy?: number;
}

export interface StockHolding {
  symbol: string;
  name: string;
  category: string;
  custodian: string;
  shares: number;
  entryMark: number;
  currentMark: number;
  unrealizedPnl: number;
  pnlPct: number;
  beta: number;
  dripEnabled: boolean;
  isPreIpo: boolean;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
  depthPct: number;
}

export interface DcaScheduleItem {
  id: string;
  asset: string;
  frequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  amountUsd: number;
  sourceAccount: string;
  nextExecution: string;
  active: boolean;
}

export interface WalletTransaction {
  id: string;
  timestamp: string;
  vertical: 'CRYPTO' | 'STOCKS' | 'REAL_ESTATE' | 'CASH' | 'FEE';
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'SWAP' | 'DIVIDEND' | 'SWEEP';
  description: string;
  amountUsd: number;
  status: 'CLEARED' | 'PENDING' | 'SETTLING';
  reference: string;
}

export const CRYPTO_HOLDINGS_DATA: CryptoHolding[] = [
  {
    symbol: 'BTC',
    name: 'BTC-USD COLD (VAULT-01)',
    enclave: 'Geneva Bunker Alpha',
    custodyType: 'SOVEREIGN_CUSTODY',
    custodyLabel: 'Sovereign MPC Cold',
    balance: 42.5,
    unit: 'BTC',
    entryPrice: 62100.0,
    spotPrice: 89420.0,
    unrealizedPnl: 1161100.0,
    pnlPct: 43.99,
    riskRating: 'AA+',
  },
  {
    symbol: 'ETH',
    name: 'ETH STAKING (LIDO / ROCKET)',
    enclave: 'Zurich Node 04',
    custodyType: 'STAKING_LOCKUP',
    custodyLabel: 'Staking Validator',
    balance: 380.0,
    unit: 'ETH',
    entryPrice: 2840.0,
    spotPrice: 3410.5,
    unrealizedPnl: 216790.0,
    pnlPct: 20.09,
    riskRating: 'AAA',
    stakingApy: 3.82,
  },
  {
    symbol: 'SOL',
    name: 'SOL HIGH-YIELD VALIDATOR',
    enclave: 'Singapore SG-01',
    custodyType: 'STAKING_LOCKUP',
    custodyLabel: 'Staking Validator',
    balance: 2400.0,
    unit: 'SOL',
    entryPrice: 135.0,
    spotPrice: 182.4,
    unrealizedPnl: 113760.0,
    pnlPct: 35.11,
    riskRating: 'AA',
    stakingApy: 7.42,
  },
  {
    symbol: 'USDC',
    name: 'USDC CIRCLE CASH POT',
    enclave: 'New York NY-03',
    custodyType: 'EXTERNAL_WEB3',
    custodyLabel: 'Treasury Web3',
    balance: 1115337.5,
    unit: 'USDC',
    entryPrice: 1.0,
    spotPrice: 1.0,
    unrealizedPnl: 0.0,
    pnlPct: 0.0,
    riskRating: 'AAA',
    stakingApy: 5.2,
  },
  {
    symbol: 'AVAX',
    name: 'AVALANCHE SUBNET CORE',
    enclave: 'Geneva Bunker Beta',
    custodyType: 'SOVEREIGN_CUSTODY',
    custodyLabel: 'Sovereign MPC Cold',
    balance: 8500.0,
    unit: 'AVAX',
    entryPrice: 24.5,
    spotPrice: 32.8,
    unrealizedPnl: 70550.0,
    pnlPct: 33.88,
    riskRating: 'A+',
    stakingApy: 5.9,
  },
];

export const STOCKS_HOLDINGS_DATA: StockHolding[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA CORP DMA BLOCK',
    category: 'Global Tech Infrastructure',
    custodian: 'DTCC / Euroclear CH',
    shares: 4200,
    entryMark: 112.4,
    currentMark: 138.85,
    unrealizedPnl: 111090.0,
    pnlPct: 23.53,
    beta: 1.15,
    dripEnabled: true,
    isPreIpo: false,
  },
  {
    symbol: 'MSFT',
    name: 'MICROSOFT CORP DMA SHARES',
    category: 'Enterprise Cloud & AI',
    custodian: 'BNY Mellon Custody',
    shares: 2500,
    entryMark: 395.0,
    currentMark: 442.1,
    unrealizedPnl: 117750.0,
    pnlPct: 11.92,
    beta: 0.88,
    dripEnabled: true,
    isPreIpo: false,
  },
  {
    symbol: 'SPACEX',
    name: 'SPACE EXPLORATION TECHNOLOGIES',
    category: 'Aerospace & Starlink SPV',
    custodian: 'Delaware Private SPV III',
    shares: 1000,
    entryMark: 650.0,
    currentMark: 820.0,
    unrealizedPnl: 170000.0,
    pnlPct: 26.15,
    beta: 0.72,
    dripEnabled: false,
    isPreIpo: true,
  },
  {
    symbol: 'ANTHROPIC',
    name: 'ANTHROPIC SERIES C NOTES',
    category: 'Foundational AI Research',
    custodian: 'Geneva SPV Series II',
    shares: 500,
    entryMark: 1200.0,
    currentMark: 1480.0,
    unrealizedPnl: 140000.0,
    pnlPct: 23.33,
    beta: 0.65,
    dripEnabled: false,
    isPreIpo: true,
  },
];

export const LEVEL_2_ORDER_BOOK: { bids: OrderBookEntry[]; asks: OrderBookEntry[] } = {
  bids: [
    { price: 138.82, size: 2400, total: 2400, depthPct: 75 },
    { price: 138.8, size: 3100, total: 5500, depthPct: 88 },
    { price: 138.78, size: 1800, total: 7300, depthPct: 62 },
    { price: 138.75, size: 5200, total: 12500, depthPct: 95 },
    { price: 138.72, size: 1400, total: 13900, depthPct: 45 },
  ],
  asks: [
    { price: 138.85, size: 1900, total: 1900, depthPct: 68 },
    { price: 138.88, size: 2800, total: 4700, depthPct: 82 },
    { price: 138.9, size: 4100, total: 8800, depthPct: 92 },
    { price: 138.94, size: 1200, total: 10000, depthPct: 40 },
    { price: 138.98, size: 3500, total: 13500, depthPct: 85 },
  ],
};

export const INITIAL_DCA_SCHEDULES: DcaScheduleItem[] = [
  {
    id: 'dca-btc-01',
    asset: 'BTC',
    frequency: 'WEEKLY',
    amountUsd: 25000,
    sourceAccount: 'USD Fedwire Treasury',
    nextExecution: 'In 3 days (Monday 00:00 UTC)',
    active: true,
  },
  {
    id: 'dca-eth-02',
    asset: 'ETH',
    frequency: 'MONTHLY',
    amountUsd: 50000,
    sourceAccount: 'USDC Cash Pot',
    nextExecution: 'In 14 days (1st of month)',
    active: true,
  },
  {
    id: 'dca-sol-03',
    asset: 'SOL',
    frequency: 'DAILY',
    amountUsd: 5000,
    sourceAccount: 'CHF SIC Cash Pot',
    nextExecution: 'In 8 hours',
    active: false,
  },
];

export const WALLET_TRANSACTIONS_DATA: WalletTransaction[] = [
  {
    id: 'tx-9941',
    timestamp: 'Today, 14:02 CET',
    vertical: 'CASH',
    type: 'SWEEP',
    description: 'Auto-Sweep Idle Cash into 5.20% Money Market',
    amountUsd: 48500.0,
    status: 'CLEARED',
    reference: 'MMF-SWEEP-0941',
  },
  {
    id: 'tx-9940',
    timestamp: 'Yesterday, 18:24 CET',
    vertical: 'CRYPTO',
    type: 'SWAP',
    description: 'Executed Sovereign OTC Swap: 50,000 USDC -> 0.559 BTC',
    amountUsd: 50000.0,
    status: 'CLEARED',
    reference: 'OTC-FIX-7721',
  },
  {
    id: 'tx-9939',
    timestamp: '12 Sep 2026',
    vertical: 'STOCKS',
    type: 'DIVIDEND',
    description: 'NVIDIA Q3 Dividend Credit (Auto-DRIP Reinvested)',
    amountUsd: 1420.0,
    status: 'CLEARED',
    reference: 'DIV-NVDA-8812',
  },
  {
    id: 'tx-9938',
    timestamp: '10 Sep 2026',
    vertical: 'REAL_ESTATE',
    type: 'DIVIDEND',
    description: 'Zurich Prime Commercial Net Monthly Rental Distribution',
    amountUsd: 37500.0,
    status: 'CLEARED',
    reference: 'SPV-RENT-4401',
  },
  {
    id: 'tx-9937',
    timestamp: '08 Sep 2026',
    vertical: 'CASH',
    type: 'DEPOSIT',
    description: 'Fedwire Inbound Escrow Clearing via JPMorgan',
    amountUsd: 500000.0,
    status: 'CLEARED',
    reference: 'FEDWIRE-49120',
  },
];
