import React from 'react';
import { useDashboardStore, type AssetVertical } from '../../store/useDashboardStore';
import { Skeleton } from '../ui/skeleton';
import { Shield, ArrowUpRight } from 'lucide-react';
import { Button } from '../ui/button';

interface VerticalInfo {
  title: string;
  category: string;
  tag: string;
  description: string;
}

const VERTICAL_METADATA: Record<AssetVertical, VerticalInfo> = {
  overview: {
    title: 'Consolidated Executive Overview',
    category: 'Universal Terminal',
    tag: 'ACTIVE ALLOCATOR',
    description: 'Multi-asset wealth orchestration across 7 sovereign verticals with real-time mark-to-market valuations and institutional risk telemetry.',
  },
  crypto: {
    title: 'Crypto Investment & Staking Yield',
    category: 'Liquid Digital Vaults',
    tag: '19.4% MAX APY',
    description: 'Direct spot holdings, non-custodial MPC versus external Web3 separation, automated DCA schedules, and FIFO/LIFO tax lot exports.',
  },
  stocks: {
    title: 'Global Stocks & Pre-IPO Allocations',
    category: 'Direct Market Access',
    tag: 'LEVEL-2 DEPTH',
    description: 'Ultra-low-latency direct market access across NYSE, NASDAQ, LSE, and Zurich SIX with pre/post-market pricing and position analytics.',
  },
  'ai-funds': {
    title: 'AI Systematic & Quantitative Strategies',
    category: 'Autonomous Alpha',
    tag: 'SHARPE 2.84',
    description: 'Delta-neutral market making, high-frequency liquidation sweeps, transparent execution rationale log, and 1-click emergency circuit breaker.',
  },
  'real-estate': {
    title: 'Tokenized Prime Real Estate & Infrastructure',
    category: 'Physical Asset Backing',
    tag: 'SPV FRACTIONAL',
    description: 'Legally registered SPV property decks, monthly automated net rental distributions, occupancy SLAs, and secondary P2P trading bulletin board.',
  },
  cars: {
    title: 'Exotic Vehicles & Horology Vault',
    category: 'Alternative Luxury Depository',
    tag: 'HAGERTY BENCHMARK',
    description: 'Geneva FreePort & London bonded vault telemetry, Hagerty valuation indexing, Sotheby’s/Gooding auction comps, and drive reservation calendar.',
  },
  'vip-cards': {
    title: 'Obsidian VIP Metal Cards & Concierge',
    category: 'Fiduciary Privilege',
    tag: 'BLACK OBSIDIAN',
    description: 'Heavy metal debit/charge cards backed by multi-currency treasury reserves, biometric CVV/PIN reveal, and 24/7 dedicated concierge desk.',
  },
  wallet: {
    title: 'Sovereign MPC Custody & Multi-Currency Wallet',
    category: 'Core Treasury Rails',
    tag: '5.2% CASH SWEEP',
    description: 'Segregated Available vs Invested capital split, fiat wire on/off-ramp (Fedwire/SEPA/SWIFT), instant spot FX, and automated monthly tax packets.',
  },
  compliance: {
    title: 'Tiered KYC/AML & Unified Tax Command',
    category: 'Regulatory Infrastructure',
    tag: 'TIER 3 ACCREDITED',
    description: 'Multi-jurisdictional compliance checklist, Form 8949 / Schedule D automated tax statement generation, and source of wealth notarization.',
  },
  security: {
    title: 'Security Command Center & Access Vault',
    category: 'Zero-Trust Operations',
    tag: '24-48H LOCK ACTIVE',
    description: 'Active session diagnostics with 1-click remote revocation, FIDO2 / YubiKey hardware registration, and strict 24–48h withdrawal address lock.',
  },
};

export interface VerticalPlaceholderProps {
  vertical?: AssetVertical;
}

export const VerticalPlaceholder: React.FC<VerticalPlaceholderProps> = ({ vertical }) => {
  const storeVertical = useDashboardStore((s) => s.activeVertical);
  const activeVertical = vertical ?? storeVertical;
  const info = VERTICAL_METADATA[activeVertical] || VERTICAL_METADATA.overview;

  return (
    <div
      data-testid={`vertical-view-${activeVertical}`}
      className="min-h-[540px] w-full p-6 space-y-6 flex flex-col justify-between"
    >
      {/* View Header */}
      <div className="border-b border-border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
              {info.category}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-primary/10 border border-primary/30 text-primary font-bold">
              {info.tag}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-on-surface tracking-tight mt-1">
            {info.title}
          </h1>
          <p className="text-xs text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
            {info.description}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="space-x-1 font-mono">
            <span>Documentation</span>
            <ArrowUpRight className="h-3 w-3" />
          </Button>
          <Button variant="default" size="sm" className="font-mono font-semibold">
            Execute Mandate
          </Button>
        </div>
      </div>

      {/* Grid of Skeleton Modules (Ensures zero CLS and pre-dimensioned frame) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        <div className="rounded-sm border border-border-hairline bg-surface-container-low p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-semibold text-on-surface">Telemetry Feed</span>
            <Shield className="h-3.5 w-3.5 text-primary" />
          </div>
          <Skeleton className="h-28 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>

        <div className="rounded-sm border border-border-hairline bg-surface-container-low p-4 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-semibold text-on-surface">Order Execution & Position Depth</span>
            <span className="text-[10px] font-mono text-secondary font-semibold">LIVE</span>
          </div>
          <Skeleton className="h-28 w-full" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="h-8 rounded-xs border border-border-hairline/80 bg-surface-container-lowest px-3 flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
        <div className="flex items-center space-x-2">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
          <span>Sovereign Enclave Status: Nominal</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Latency: 0.03ms</span>
          <span>Zero CLS Enforced</span>
        </div>
      </div>
    </div>
  );
};
