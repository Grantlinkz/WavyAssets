import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    tabNumber: ' • CRYPTO',
    tabLabel: 'Crypto Investment',
    title: 'Simple Crypto Investing & Insured Vault Storage',
    badge: 'OFFLINE COLD STORAGE',
    description:
      'Buy and hold Bitcoin and Ethereum with bank-grade offline vaults. Earn steady, predictable returns without complicated technical setup.',
    navAum: '$540,200,000',
    settlementRail: 'Instant On-Chain Transfer',
    slaMetric: '19.4% Blended Return',
    custodyAuditor: 'Insured Offline Vault',
    icon: Coins,
  },
  {
    id: 'stocks',
    tabNumber: ' • EQUITIES',
    tabLabel: 'Global Stocks',
    title: 'Invest in Stocks Online & Pre-IPO Shares',
    badge: '42 GLOBAL EXCHANGES',
    description:
      'Trade public shares across 42 global stock exchanges with transparent pricing. Access shares of private market leaders like SpaceX and Stripe before they go public.',
    navAum: '$820,500,000',
    settlementRail: 'Same-Day Clearing',
    slaMetric: '0.04ms Direct Connection',
    custodyAuditor: 'SEC & FINMA Registered',
    icon: TrendingUp,
  },
  {
    id: 'ai-funds',
    tabNumber: ' • COMPUTE',
    tabLabel: 'AI Systematic Funds',
    title: 'Smart Automated Investing Backed by AI Hardware',
    badge: '12,400 GPUS LEASED',
    description:
      'Put your money to work with hands-free investing backed by physical Nvidia data center clusters leased to leading enterprise technology companies.',
    navAum: '$312,000,000',
    settlementRail: 'Daily Return Deposit',
    slaMetric: '99.98% Hardware Uptime',
    custodyAuditor: 'Verified Green Hydro Power',
    icon: Cpu,
  },
  {
    id: 'real-estate',
    tabNumber: ' • ESTATES',
    tabLabel: 'Real Estate',
    title: 'Prime Commercial Property Shares & Rental Income',
    badge: 'NOTARIZED PROPERTY TITLE',
    description:
      'Invest in landmark commercial buildings in Zurich, London, and Manhattan. Receive quarterly rental deposits directly into your cash account.',
    navAum: '$485,000,000',
    settlementRail: 'Quarterly Rental Payout',
    slaMetric: '6.4% Net Annual Return',
    custodyAuditor: 'PwC & Land Registry Certified',
    icon: Building2,
  },
  {
    id: 'cars',
    tabNumber: ' • DEPOSITORY',
    tabLabel: 'Cars Inventory',
    title: 'Browse & Invest in Collector Cars',
    badge: '38 CARS IN CLIMATE VAULT',
    description:
      'Own fractional shares in rare classic Ferraris and McLarens kept in climate-regulated storage. Diversify with physical assets that have proven historical growth.',
    navAum: '$348,000,000',
    settlementRail: 'Secure Vault Title Transfer',
    slaMetric: '100% Climate Monitored',
    custodyAuditor: 'Lloyds Underwritten Insurance',
    icon: Car,
  },
  {
    id: 'vip-cards',
    tabNumber: ' • PRIVILEGE',
    tabLabel: 'VIP Cards & Escrow',
    title: 'Solid Titanium Card Backed by Your Portfolio',
    badge: 'WORLDWIDE MASTERCARD',
    description:
      'Spend your investment balance worldwide with zero foreign transaction fees. Use your portfolio as a flexible line of credit without selling your assets.',
    navAum: '$120,000,000 Line',
    settlementRail: 'Instant Global Payments',
    slaMetric: '0% Foreign Exchange Markup',
    custodyAuditor: 'Regulated Global Card Rail',
    icon: CreditCard,
  },
  {
    id: 'wallet',
    tabNumber: ' • TREASURY',
    tabLabel: 'Wallet & Finance',
    title: 'Digital Money Wallet for Daily Cash & Transfers',
    badge: 'MULTI-KEY SECURITY',
    description:
      'Hold dollars, euros, and pounds in one place. Send money worldwide in seconds with bank-grade multi-signature protection that guarantees you stay in control.',
    navAum: '$1,248,500,000 Cap',
    settlementRail: 'Wire, SWIFT & Instant Bank',
    slaMetric: 'Under 1-Second Verification',
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
          <span>DISCOVERY VERTICALS • VERIFIED ASSET VAULTS</span>
        </div>
        <div className="font-mono text-[11px] text-secondary flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span>ALL ONLINE</span>
        </div>
      </div>

      {/* Horizontal Segmented Tabs with Shared Layout Glide Indicator */}
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
                className={`relative px-3.5 py-2 rounded-sm text-left transition-colors border ${
                  isSelected
                    ? 'border-transparent text-primary'
                    : 'bg-surface-container hover:bg-surface-container-high border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {/* Smooth Gliding Tab Indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="activeVaultTabIndicator"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-sm bg-surface-container-high border border-primary ring-1 ring-primary/40 shadow-[0_0_12px_rgba(212,175,55,0.18)]"
                  />
                )}

                <div className="relative z-10">
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
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Vault Depository Overview Card with Staggered Transition */}
      <div
        data-testid="active-depository-panel"
        className="bg-surface-container rounded-md p-6 lg:p-8 shadow-xl border border-outline/30 min-h-[340px] overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeVertical.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="space-y-6"
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

            {/* Depository Quantitative Diagnostics with Micro-Hover */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="bg-surface-container-low p-3.5 rounded-sm border border-outline/20 space-y-1"
              >
                <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
                  TOTAL ASSETS TRACKED
                </div>
                <div className="font-mono text-base sm:text-lg font-semibold text-on-surface">
                  {activeVertical.navAum}
                </div>
                <div className="text-[10px] text-secondary font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Fiduciary Bonded
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="bg-surface-container-low p-3.5 rounded-sm border border-outline/20 space-y-1"
              >
                <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
                  PAYMENT &amp; SETTLEMENT
                </div>
                <div className="font-mono text-xs sm:text-sm font-semibold text-on-surface truncate">
                  {activeVertical.settlementRail}
                </div>
                <div className="text-[10px] text-on-surface-variant font-mono">
                  Transparent Transfer
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="bg-surface-container-low p-3.5 rounded-sm border border-outline/20 space-y-1"
              >
                <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
                  TARGET PERFORMANCE
                </div>
                <div className="font-mono text-xs sm:text-sm font-semibold text-secondary truncate">
                  {activeVertical.slaMetric}
                </div>
                <div className="text-[10px] text-on-surface-variant font-mono">
                  Verified Metric
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="bg-surface-container-low p-3.5 rounded-sm border border-outline/20 space-y-1"
              >
                <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
                  SECURITY &amp; AUDIT PROOF
                </div>
                <div className="font-mono text-xs sm:text-sm font-semibold text-primary truncate">
                  {activeVertical.custodyAuditor}
                </div>
                <div className="text-[10px] text-on-surface-variant font-mono">
                  Independently Verified
                </div>
              </motion.div>
            </div>

            {/* Action Strip */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline/20">
              <div className="text-on-surface-variant font-mono text-[11px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span>DIRECT DASHBOARD VIEW ACTIVE • {`#/services/${activeVertical.id}`}</span>
              </div>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                href={`#/services/${activeVertical.id}`}
                onClick={() => setActiveAssetId(activeVertical.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-primary-container text-on-primary-container text-xs uppercase font-bold tracking-wider hover:bg-primary-hover transition-colors shadow-sm"
              >
                <span>View Portfolio Service</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
