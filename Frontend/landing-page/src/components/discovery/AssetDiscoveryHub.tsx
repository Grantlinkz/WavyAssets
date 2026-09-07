import React from 'react';
import {
  useTerminalStore,
  type AssetVerticalId,
} from '../../store/useTerminalStore';
import {
  Coins,
  TrendingUp,
  Cpu,
  Building2,
  Car,
  CreditCard,
  Wallet,
  ShieldCheck,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

interface DiscoveryVertical {
  id: AssetVerticalId;
  tabNumber: string;
  tabLabel: string;
  title: string;
  badge: string;
  description: string;
  navAum: string;
  settlementRail: string;
  slaMetric: string;
  custodyAuditor: string;
  icon: LucideIcon;
}

const DISCOVERY_VERTICALS: DiscoveryVertical[] = [
  {
    id: 'crypto',
    tabNumber: '01 // CRYPTO',
    tabLabel: 'Crypto Investment',
    title: 'Crypto Yields & Cold Storage Vaults',
    badge: 'MPC COLD STORAGE',
    description:
      'Institutional multi-party computation staking, delta-neutral basis arbitrage, and isolated sub-second CeDeFi liquidity pools backed by algorithmic risk controls.',
    navAum: '$540,200,000',
    settlementRail: 'Instant On-Chain Merkle Hash',
    slaMetric: '0.02ms Internal FIX 4.4',
    custodyAuditor: 'FIPS 140-3 HSM Verified',
    icon: Coins,
  },
  {
    id: 'stocks',
    tabNumber: '02 // EQUITIES',
    tabLabel: 'Global Stocks',
    title: 'Direct Market Access Equities & Pre-IPO Allocations',
    badge: '42 EXCHANGES DMA',
    description:
      'Direct order routing across NYSE, LSE, SIX Swiss Exchange, and dark pools. Algorithmic VWAP order slicing with cross-broker net fills and zero information leakage.',
    navAum: '$820,500,000',
    settlementRail: 'DTCC / Euroclear Direct',
    slaMetric: '0.04ms Equinix NY4 Cross-Connect',
    custodyAuditor: 'SEC & FINMA Registered',
    icon: TrendingUp,
  },
  {
    id: 'ai-funds',
    tabNumber: '03 // COMPUTE',
    tabLabel: 'AI Systematic Funds',
    title: 'Hardware-Backed AI Compute Yield Syndication',
    badge: '12,400 H100s CLUSTERED',
    description:
      'Enterprise compute cluster leasing backed by physical Nvidia H100 hardware in Nordic hydro-powered data centers, combined with deep neural momentum trading algorithms.',
    navAum: '$312,000,000',
    settlementRail: 'Continuous Epoch Hash-Sweep',
    slaMetric: '99.98% GPU Cluster Uptime',
    custodyAuditor: 'Tier-IV Nordic Hydro Audit',
    icon: Cpu,
  },
  {
    id: 'real-estate',
    tabNumber: '04 // ESTATES',
    tabLabel: 'Real Estate',
    title: 'Tokenized Prime Commercial & Freehold Real Estate',
    badge: 'CADASTRE VERIFIED',
    description:
      'Tokenized ownership in trophy commercial properties in Manhattan, Zurich, and Geneva. Automated daily rental yield distribution directly into private USDC/EUR ledgers.',
    navAum: '$485,000,000',
    settlementRail: 'Daily Automated USDC Sweep',
    slaMetric: '6.4% Net Annualized Yield',
    custodyAuditor: 'PwC / Swiss Notarial Cadastre',
    icon: Building2,
  },
  {
    id: 'cars',
    tabNumber: '05 // DEPOSITORY',
    tabLabel: 'Cars Inventory',
    title: 'Exotic Hypercars & Horology Freeport Vaults',
    badge: 'FREEPORT AUDITED (38 UNITS)',
    description:
      'Climate-monitored, tax-free Zurich & Geneva bonded freeport vaults. Fractionalized allocations or whole-chassis custody with biometric retina access protocol and SGS Lloyd underwriting.',
    navAum: '$348,000,000',
    settlementRail: 'Freeport Bonded Transfer',
    slaMetric: '100% Climate / Humidity Monitored',
    custodyAuditor: 'SGS / Lloyds Underwritten',
    icon: Car,
  },
  {
    id: 'vip-cards',
    tabNumber: '06 // PRIVILEGE',
    tabLabel: 'VIP Cards & Escrow',
    title: 'Sovereign Titanium Concierge & Dynamic Credit Line',
    badge: 'MASTERCARD WORLD ELITE',
    description:
      'Physical solid titanium black cards linked to dynamic portfolio collateral. Instant global liquidity with 0% foreign exchange markups, private jet charters, and fine art escrow.',
    navAum: '$120,000,000 Line',
    settlementRail: 'Multi-Currency Real-Time FX',
    slaMetric: 'Zero FX Overspread',
    custodyAuditor: 'FCA & BaFin Regulated Rail',
    icon: CreditCard,
  },
  {
    id: 'wallet',
    tabNumber: '07 // TREASURY',
    tabLabel: 'Wallet & Finance',
    title: 'Consolidated Institutional Multi-Sig MPC Treasury',
    badge: '24/7 DUAL-SIGNATURE',
    description:
      'Hierarchical key management with multi-signature policies across Zurich, Singapore, and New York. Instant bridges to Fedwire, SWIFT, SEPA, and institutional crypto exchanges.',
    navAum: '$1,248,500,000 Cap',
    settlementRail: 'Fedwire / SWIFT / SEPA / Blockchain',
    slaMetric: 'Sub-Second Quorum Signing',
    custodyAuditor: 'SOC-2 Type II Certified',
    icon: Wallet,
  },
];

export interface AssetDiscoveryHubProps {
  activeId?: AssetVerticalId;
}

export const AssetDiscoveryHub: React.FC<AssetDiscoveryHubProps> = ({ activeId }) => {
  const storeActiveAssetId = useTerminalStore((state) => state.activeAssetId);
  const setActiveAssetId = useTerminalStore((state) => state.setActiveAssetId);

  const activeAssetId = activeId ?? storeActiveAssetId;

  const activeVertical =
    DISCOVERY_VERTICALS.find((v) => v.id === activeAssetId) || DISCOVERY_VERTICALS[4]; // Default cars

  const handleSelectVertical = (id: AssetVerticalId) => {
    setActiveAssetId(id);
  };

  const IconComponent = activeVertical.icon;

  return (
    <div className="w-full space-y-6">
      {/* Section Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline/30 pb-3">
        <div className="font-mono text-[11px] text-outline uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>[ DISCOVERY VERTICALS // VERIFIED PHYSICAL &amp; DIGITAL VAULTS ]</span>
        </div>
        <div className="font-mono text-[11px] text-secondary flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span>7 VAULT CLASSES ONLINE</span>
        </div>
      </div>

      {/* Horizontal Segmented Tabs */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {DISCOVERY_VERTICALS.map((vert) => {
            const isSelected = activeAssetId === vert.id;
            return (
              <button
                key={vert.id}
                type="button"
                data-testid={`discovery-tab-${vert.id}`}
                onClick={() => handleSelectVertical(vert.id)}
                className={`px-3.5 py-2 rounded-sm text-left transition-all border ${
                  isSelected
                    ? 'bg-surface-container-high border-primary text-primary shadow-sm ring-1 ring-primary/40'
                    : 'bg-surface-container hover:bg-surface-container-high border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <div
                  className={`font-mono text-[10px] ${
                    isSelected ? 'text-primary font-bold' : 'text-outline'
                  }`}
                >
                  {vert.tabNumber}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-on-surface">
                  {vert.tabLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Vault Depository Overview Card */}
      <div
        data-testid="active-depository-panel"
        className="bg-surface-container rounded-md p-6 lg:p-8 space-y-6 shadow-xl border border-outline/30"
      >
        {/* Depository Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-outline/20">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-sm bg-surface-container-high text-primary inline-flex">
                <IconComponent className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight">
                {activeVertical.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {activeVertical.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-sm bg-primary/15 text-primary border border-primary/30 font-semibold uppercase">
              {activeVertical.badge}
            </span>
          </div>
        </div>

        {/* Depository Quantitative Diagnostics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-container-low p-3.5 rounded-sm border border-outline/20 space-y-1">
            <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
              ALLOCATED VAULT NAV
            </div>
            <div className="font-mono text-base sm:text-lg font-semibold text-on-surface">
              {activeVertical.navAum}
            </div>
            <div className="text-[10px] text-secondary font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Fiduciary Bonded
            </div>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded-sm border border-outline/20 space-y-1">
            <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
              SETTLEMENT RAIL
            </div>
            <div className="font-mono text-xs sm:text-sm font-semibold text-on-surface truncate">
              {activeVertical.settlementRail}
            </div>
            <div className="text-[10px] text-on-surface-variant font-mono">
              Continuous Ledger
            </div>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded-sm border border-outline/20 space-y-1">
            <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
              SLA / BENCHMARK
            </div>
            <div className="font-mono text-xs sm:text-sm font-semibold text-secondary truncate">
              {activeVertical.slaMetric}
            </div>
            <div className="text-[10px] text-on-surface-variant font-mono">
              Audited Metric
            </div>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded-sm border border-outline/20 space-y-1">
            <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
              LEGAL &amp; CUSTODY PROOF
            </div>
            <div className="font-mono text-xs sm:text-sm font-semibold text-primary truncate">
              {activeVertical.custodyAuditor}
            </div>
            <div className="text-[10px] text-on-surface-variant font-mono">
              Enclave Verified
            </div>
          </div>
        </div>

        {/* Action Strip */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline/20">
          <div className="text-on-surface-variant font-mono text-[11px] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span>DIRECT ENCLAVE ROUTING ACTIVE • HASH: {`#/services/${activeVertical.id}`}</span>
          </div>

          <a
            href={`#/services/${activeVertical.id}`}
            onClick={() => setActiveAssetId(activeVertical.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-primary-container text-on-primary-container text-xs uppercase font-bold tracking-wider hover:bg-primary-hover transition-colors shadow-sm"
          >
            <span>Inspect Full Asset Enclave</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
