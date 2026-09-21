/**
 * WavyAssets Global Governance, VIP Cards, Compliance & Security Datasets
 * Aligned with Prototypes #7, #9, and #10 and Institutional Specifications.
 */

// ==========================================
// VIP & MEMBERSHIP CARDS TYPES & DATA
// ==========================================

export interface CardTier {
  id: string;
  name: string;
  minAum: number;
  cashbackPct: number;
  dailyLimitUsd: number;
  material: string;
  weightGrams: number;
  status: 'UNLOCKED' | 'CURRENT' | 'UPCOMING';
  description: string;
}

export interface CardPrivilege {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
}

export const VIP_CARD_TIERS: CardTier[] = [
  {
    id: 'tier-silver',
    name: 'Silver Foundation',
    minAum: 1000000,
    cashbackPct: 1.5,
    dailyLimitUsd: 50000,
    material: 'Brushed Titanium',
    weightGrams: 18,
    status: 'UNLOCKED',
    description: 'Entry wealth tier for qualified private allocators with automated DCA and fiat treasury rails.',
  },
  {
    id: 'tier-obsidian',
    name: 'Obsidian Elite',
    minAum: 10000000,
    cashbackPct: 2.5,
    dailyLimitUsd: 500000,
    material: 'Obsidian Coated 42g Tungsten',
    weightGrams: 42,
    status: 'CURRENT',
    description: 'Institutional heavy metal card backed by segregated multi-currency liquidity reserves and 2-of-3 HSM multisig.',
  },
  {
    id: 'tier-black-fiduciary',
    name: 'Black Fiduciary',
    minAum: 25000000,
    cashbackPct: 3.5,
    dailyLimitUsd: 2500000,
    material: 'Laser-Etched Space-Grade Alloy',
    weightGrams: 48,
    status: 'UPCOMING',
    description: 'Global single-family office echelon with zero-limit dark pool settlement, direct bespoke charter desk, and private aviation.',
  },
];

export const VIP_CARD_PRIVILEGES: CardPrivilege[] = [
  {
    id: 'priv-1',
    title: 'Zero FX Interbank Margin',
    category: 'TREASURY FX',
    description: 'Execute instant multi-currency spot conversions across USD, EUR, CHF, GBP, and SGD at pure wholesale interbank tick rates.',
    icon: 'percent',
  },
  {
    id: 'priv-2',
    title: 'Geneva FreePort Vault Depository',
    category: 'PHYSICAL CUSTODY',
    description: 'Complimentary bonded climate-controlled storage for allocated bullion, horology assets, and hypercar collections with bonded logistics.',
    icon: 'shield',
  },
  {
    id: 'priv-3',
    title: 'Pre-IPO & SPV Syndicate Rights',
    category: 'PRIVATE EQUITY',
    description: 'Guaranteed secondary allocation access into SpaceX, Anthropic, and Tier-1 systematic quantum funds with zero syndicate management surcharge.',
    icon: 'rocket',
  },
  {
    id: 'priv-4',
    title: '24/7 Dedicated Private Banker Desk',
    category: 'EXECUTIVE CONCIERGE',
    description: 'Direct PGP-encrypted Signal and phone hotline to senior Zurich private bankers for atomic wire execution and high-value collateral authorizations.',
    icon: 'support_agent',
  },
];

// ==========================================
// COMPLIANCE, KYC & TAX DATA
// ==========================================

export interface KycTierLevel {
  level: number;
  name: string;
  tag: string;
  dailyLiquidityCap: string;
  status: 'COMPLETED' | 'ACTIVE_TIER';
  clearingProtocol: string;
  auditStamp: string;
  hash: string;
}

export interface BeneficialOwner {
  name: string;
  initials: string;
  role: string;
  ownershipPct?: number;
  passportNo?: string;
  credentialId?: string;
  keyStatus: string;
  keyIndex: string;
  isArmed: boolean;
}

export interface VerifiedCredential {
  id: string;
  title: string;
  authority: string;
  expiry: string;
  status: 'VERIFIED' | '100% CLEAN';
}

export interface TaxDossierMetric {
  id: string;
  verticalTitle: string;
  amountUsd: number;
  treatment: string;
  subMetricLabel: string;
  subMetricValue: string;
}

export interface RegulatoryCorridor {
  countryCode: string;
  countryName: string;
  status: 'ACTIVE' | 'CLEARED';
  framework: string;
  settlementChannel: string;
}

export const KYC_TIERS: KycTierLevel[] = [
  {
    level: 1,
    name: 'Standard Individual',
    tag: 'Tier 01 Baseline',
    dailyLiquidityCap: '$10,000 USD',
    status: 'COMPLETED',
    clearingProtocol: 'Automated Daily Batch',
    auditStamp: 'Geneva Digital Notary',
    hash: '0x4a8f...91e3',
  },
  {
    level: 2,
    name: 'Enhanced Private Wealth',
    tag: 'Tier 02 Qualified',
    dailyLiquidityCap: '$250,000 USD',
    status: 'COMPLETED',
    clearingProtocol: 'Zurich Private Banking RTGS',
    auditStamp: 'Zurich Private Banking Desk',
    hash: '0x38b2...ca19',
  },
  {
    level: 3,
    name: 'Accredited Institution & Global SPV',
    tag: 'Tier 03 Active',
    dailyLiquidityCap: 'UNLIMITED / ATOMIC DvP',
    status: 'ACTIVE_TIER',
    clearingProtocol: 'Perpetual Multi-Asset Enclave',
    auditStamp: 'Swiss FINMA Regulated Enclave',
    hash: '0x7c21...8b54',
  },
];

export const CORPORATE_ENTITY_PROFILE = {
  legalName: 'Grant Global Holdings AG',
  uidJurisdiction: 'CHE-382.910.442',
  canton: 'Kanton Zürich, Switzerland',
  entityStructure: 'Aktiengesellschaft (AG)',
  spvType: 'Single-Family Office SPV',
  trustee: 'Treuhand Zurich AG',
  trusteeReg: 'Regulated FINMA Fiduciary',
  quorum: '2 of 3 Required Keys',
  quorumDesc: 'HSM Cold Quorum Threshold',
  lei: '5493006M9ZE8FQ4',
  leiStatus: 'Validated via GLEIF API',
  riskScore: '99.8 / 100',
  riskClass: 'Tier-1 Prime (Lowest Fiduciary Risk)',
  supervisoryBody: 'FINMA & VQF Canton Zurich',
  taxId: 'CHE-382.910.442 MWST',
  taxAdmin: 'Federal Tax Administration (ESTV)',
};

export const BENEFICIAL_SIGNERS: BeneficialOwner[] = [
  {
    name: 'Marcus Aurelius Grant',
    initials: 'M',
    role: 'Primary Global Beneficiary',
    ownershipPct: 100,
    passportNo: 'CH-7492102-X',
    keyStatus: 'HARDWARE HSM ARMED',
    keyIndex: 'Key 1 of 3 (Primary Admin)',
    isArmed: true,
  },
  {
    name: 'Beatrix von Werra',
    initials: 'B',
    role: 'Fiduciary Trustee — Swiss Bar & Treuhand Zurich Partner',
    credentialId: 'ZH-BAR-994',
    keyStatus: 'SECONDARY SIGNER ACTIVE',
    keyIndex: 'Key 2 of 3 (Executive Fiduciary)',
    isArmed: true,
  },
  {
    name: 'Dr. Hans-Peter Keller',
    initials: 'H',
    role: 'Supervisory Custodian — Independent Zurich Escrow Arbiter',
    credentialId: 'FINMA Regulated Arbiter',
    keyStatus: 'STANDBY ARBITER COLD',
    keyIndex: 'Key 3 of 3 (Emergency Recovery)',
    isArmed: false,
  },
];

export const VERIFIED_CREDENTIALS: VerifiedCredential[] = [
  {
    id: 'cred-1',
    title: 'Passport & Biometric Notarization',
    authority: 'Geneva Notary Public • Exp: Nov 2028',
    expiry: 'Nov 2028',
    status: 'VERIFIED',
  },
  {
    id: 'cred-2',
    title: 'Proof of Tax Residency & Substance',
    authority: 'Canton Zurich Certificate • Exp: Dec 2025',
    expiry: 'Dec 2025',
    status: 'VERIFIED',
  },
  {
    id: 'cred-3',
    title: 'Certificate of Incumbency & Apostille',
    authority: 'State Chancellery of Zurich • Issued Mar 2025',
    expiry: 'Perpetual Standing',
    status: 'VERIFIED',
  },
  {
    id: 'cred-4',
    title: 'AMLA Art. 9 Sanctions Screening',
    authority: 'OFAC, SECO, EU Lists • Automated 24/7 (0 Hits)',
    expiry: 'Live Real-Time',
    status: '100% CLEAN',
  },
];

export const MULTI_ASSET_TAX_DOSSIER: Record<'2024' | '2025', TaxDossierMetric[]> = {
  '2024': [
    {
      id: 'tax-1',
      verticalTitle: 'Crypto & Equities Gains',
      amountUsd: 384120.0,
      treatment: 'FIFO Realized • Form 8949 Ready',
      subMetricLabel: 'Swaps & Spot',
      subMetricValue: '342 Executions',
    },
    {
      id: 'tax-2',
      verticalTitle: 'Global Stock Dividends',
      amountUsd: 62450.0,
      treatment: 'CH-US DTT 15% Reclaim Status',
      subMetricLabel: 'DA-1 Reclaimable',
      subMetricValue: '$9,367.50 USD',
    },
    {
      id: 'tax-3',
      verticalTitle: 'Real Estate Net Rental',
      amountUsd: 205200.0,
      treatment: '4 SPVs (Zurich, Geneva, London)',
      subMetricLabel: 'Depreciation Adj.',
      subMetricValue: 'Applied (Straight-Line)',
    },
    {
      id: 'tax-4',
      verticalTitle: 'Staking & Quant Yield',
      amountUsd: 266800.0,
      treatment: 'Ordinary Income Treatment',
      subMetricLabel: 'Avg Protocol APY',
      subMetricValue: '7.84% Composite',
    },
    {
      id: 'tax-5',
      verticalTitle: 'Tangible Fleet Yield',
      amountUsd: 34000.0,
      treatment: 'Exotic Cars & Vault Lease Comps',
      subMetricLabel: 'Specialty Assets',
      subMetricValue: 'Geneva Vault Staged',
    },
  ],
  '2025': [
    {
      id: 'tax-1',
      verticalTitle: 'Crypto & Equities Gains',
      amountUsd: 142850.0,
      treatment: 'Accruing MTD • Real-Time Mark',
      subMetricLabel: 'Swaps & Spot',
      subMetricValue: '118 Executions',
    },
    {
      id: 'tax-2',
      verticalTitle: 'Global Stock Dividends',
      amountUsd: 28400.0,
      treatment: 'Accruing DA-1 Credit',
      subMetricLabel: 'DA-1 Reclaimable',
      subMetricValue: '$4,260.00 USD',
    },
    {
      id: 'tax-3',
      verticalTitle: 'Real Estate Net Rental',
      amountUsd: 74200.0,
      treatment: 'Q1 Distribution Cleared',
      subMetricLabel: 'Occupancy Rate',
      subMetricValue: '98.4% Sustained',
    },
    {
      id: 'tax-4',
      verticalTitle: 'Staking & Quant Yield',
      amountUsd: 91450.0,
      treatment: 'Validator Nodes Active',
      subMetricLabel: 'Blended APY',
      subMetricValue: '7.42% Net',
    },
    {
      id: 'tax-5',
      verticalTitle: 'Tangible Fleet Yield',
      amountUsd: 12500.0,
      treatment: 'Horology Comps Accruing',
      subMetricLabel: 'Depository Vault',
      subMetricValue: 'Zurich FreePort',
    },
  ],
};

export const REGULATORY_CORRIDORS: RegulatoryCorridor[] = [
  {
    countryCode: 'CH',
    countryName: 'Switzerland',
    status: 'ACTIVE',
    framework: 'FINMA / AMLA Art. 9 Exemption',
    settlementChannel: 'SIC / SIX RTGS',
  },
  {
    countryCode: 'US',
    countryName: 'United States',
    status: 'ACTIVE',
    framework: 'Regulation S / Rule 144A Qualified',
    settlementChannel: 'Fedwire / DTC Segregated',
  },
  {
    countryCode: 'UK',
    countryName: 'United Kingdom',
    status: 'ACTIVE',
    framework: 'FCA Professional Investor Mandate',
    settlementChannel: 'CHAPS / Crest DvP',
  },
  {
    countryCode: 'SG',
    countryName: 'Singapore',
    status: 'ACTIVE',
    framework: 'MAS Global Wealth Exemption',
    settlementChannel: 'MEPS+ RTGS Channel',
  },
];

// ==========================================
// SECURITY COMMAND CENTER & TIME-LOCK DATA
// ==========================================

export interface HardwareKeyToken {
  id: string;
  name: string;
  badge: string;
  serial: string;
  registeredDate: string;
  algorithm: string;
  lastTouch: string;
  icon: string;
  isPrimary: boolean;
}

export interface ClientSession {
  id: string;
  deviceName: string;
  clientBadge: string;
  location: string;
  ipAddress: string;
  cipherSuite: string;
  latencyPing: string;
  lastActive: string;
  isCurrent: boolean;
  icon: string;
}

export interface WhitelistedDestination {
  id: string;
  assetRail: string;
  assetName: string;
  railBadge: string;
  icon: string;
  destinationLabel: string;
  beneficiaryOrg: string;
  addressOrIban: string;
  isTimeLocked: boolean;
  quarantineHoursTotal: number;
  quarantineHoursRemaining: number;
  remainingDisplay: string;
  signersSummary: string;
  signersDetails: string;
  status: 'MATURED' | 'QUARANTINE';
}

export const HARDWARE_SECURITY_KEYS: HardwareKeyToken[] = [
  {
    id: 'key-1',
    name: 'Primary YubiKey 5C NFC',
    badge: 'PRIMARY SIGNER',
    serial: 'YK-849204-CH',
    registeredDate: 'Oct 14, 2024',
    algorithm: 'ECDSA P-256 / SHA-256',
    lastTouch: '12m ago (LMAX Spot)',
    icon: 'usb',
    isPrimary: true,
  },
  {
    id: 'key-2',
    name: 'Backup Ledger Nano S Plus',
    badge: 'VERIFIED IN VAULT',
    serial: 'LDG-99381-SEC',
    registeredDate: 'Jan 03, 2025',
    algorithm: 'Ed25519 / secp256k1',
    lastTouch: 'Zurich Safe #419',
    icon: 'lock',
    isPrimary: false,
  },
  {
    id: 'key-3',
    name: 'Apple Touch ID / Secure Enclave',
    badge: 'LOCAL RECOVERY KEY',
    serial: 'MacBook Pro M3 Max',
    registeredDate: 'Nov 12, 2024',
    algorithm: 'Hardware Bound UUID C02G...7MD6',
    lastTouch: 'Cryptographic Integrity OK',
    icon: 'fingerprint',
    isPrimary: false,
  },
];

export const INITIAL_CLIENT_SESSIONS: ClientSession[] = [
  {
    id: 'sess-1',
    deviceName: 'MacBook Pro 16" — Chrome 124.0',
    clientBadge: 'CURRENT SESSION',
    location: 'Zurich, Switzerland 🇨🇭',
    ipAddress: 'Segregated Fiber (185.192.68.14)',
    cipherSuite: 'TLS 1.3 (AES-256-GCM)',
    latencyPing: 'Sub-12ms FIX Online',
    lastActive: 'First Seen: 4h ago',
    isCurrent: true,
    icon: 'laptop_mac',
  },
  {
    id: 'sess-2',
    deviceName: 'iPhone 15 Pro — Global iOS Enclave',
    clientBadge: 'BIOMETRIC ARMED',
    location: 'Geneva, Switzerland 🇨🇭',
    ipAddress: 'Swisscom 5G SA (178.238.224.50)',
    cipherSuite: 'Push Token Verified',
    latencyPing: 'Standby Quorum Ready',
    lastActive: 'Active 42m ago',
    isCurrent: false,
    icon: 'smartphone',
  },
  {
    id: 'sess-3',
    deviceName: 'Dedicated FIX Trading Terminal — Linux',
    clientBadge: 'API / FIX GATEWAY',
    location: 'Frankfurt, Germany 🇩🇪',
    ipAddress: 'Equinix FR2 Direct (194.209.12.8)',
    cipherSuite: 'DvP Routing Read/Write',
    latencyPing: 'Keep-Alive Heartbeat: 1000ms',
    lastActive: 'Active 1m ago',
    isCurrent: false,
    icon: 'terminal',
  },
];

export const INITIAL_WHITELIST_DESTINATIONS: WhitelistedDestination[] = [
  {
    id: 'wl-1',
    assetRail: 'Bitcoin',
    assetName: 'BTC Native Taproot',
    railBadge: 'BTC',
    icon: 'currency_bitcoin',
    destinationLabel: 'Cold Storage SPV Vault',
    beneficiaryOrg: 'Geneva Freeport (Deep Cold)',
    addressOrIban: 'bc1p0x79a834f8e...938d4c9',
    isTimeLocked: false,
    quarantineHoursTotal: 48,
    quarantineHoursRemaining: 0,
    remainingDisplay: 'MATURED & ACTIVE',
    signersSummary: '3 of 3 Signers',
    signersDetails: 'M. Grant, B. von Werra, H. Keller',
    status: 'MATURED',
  },
  {
    id: 'wl-2',
    assetRail: 'Ethereum',
    assetName: 'ETH & USDC ERC-20',
    railBadge: 'ETH',
    icon: 'account_balance',
    destinationLabel: 'Institutional Treasury Safe',
    beneficiaryOrg: 'Treuhand Zurich Multisig',
    addressOrIban: '0x4838B106FC...0BAD5f97',
    isTimeLocked: false,
    quarantineHoursTotal: 48,
    quarantineHoursRemaining: 0,
    remainingDisplay: 'MATURED & ACTIVE',
    signersSummary: '2 of 3 Signers',
    signersDetails: 'Threshold Met',
    status: 'MATURED',
  },
  {
    id: 'wl-3',
    assetRail: 'USD Wire',
    assetName: 'Fedwire / JPMorgan Segregated',
    railBadge: 'USD',
    icon: 'payments',
    destinationLabel: 'JPMorgan Private Bank NY',
    beneficiaryOrg: 'Escrow Operating Account',
    addressOrIban: '021000021-••••8819',
    isTimeLocked: false,
    quarantineHoursTotal: 48,
    quarantineHoursRemaining: 0,
    remainingDisplay: 'MATURED & ACTIVE',
    signersSummary: '2 of 3 Signers',
    signersDetails: 'Corporate Seal Valid',
    status: 'MATURED',
  },
  {
    id: 'wl-4',
    assetRail: 'Solana',
    assetName: 'SOL Custody Rail',
    railBadge: 'SOL',
    icon: 'hourglass_top',
    destinationLabel: 'Autonomous Quant Execution Vault #04',
    beneficiaryOrg: 'Wintermute SPV Settlement',
    addressOrIban: '9xQeWvG816b...rpZb9PusVFin',
    isTimeLocked: true,
    quarantineHoursTotal: 48,
    quarantineHoursRemaining: 21.64,
    remainingDisplay: '21h 38m 42s REMAINING',
    signersSummary: 'Pending 2nd Hardware Key',
    signersDetails: '1 of 2 Signed',
    status: 'QUARANTINE',
  },
  {
    id: 'wl-5',
    assetRail: 'CHF Wire',
    assetName: 'Swiss SIC RTGS Rail',
    railBadge: 'CHF',
    icon: 'account_balance_wallet',
    destinationLabel: 'Pictet & Cie Private Bankers',
    beneficiaryOrg: 'Secondary Asset Purchase Escrow',
    addressOrIban: 'CH54 0076 2011 4820 9014 A',
    isTimeLocked: true,
    quarantineHoursTotal: 48,
    quarantineHoursRemaining: 38.2,
    remainingDisplay: '38h 12m 10s REMAINING',
    signersSummary: 'Pending 2nd Hardware Key',
    signersDetails: '1 of 2 Signed',
    status: 'QUARANTINE',
  },
];
