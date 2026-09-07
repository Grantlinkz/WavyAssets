import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  TrendingUp,
  Cpu,
  Building2,
  Car,
  CreditCard,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import {
  useTerminalStore,
  type AssetVerticalId,
  type MegaMenuCategory,
} from '../../store/useTerminalStore';
import { CategoryFilter } from './CategoryFilter';
import { MegaMenuDiagnostics } from './MegaMenuDiagnostics';

interface AssetVerticalConfig {
  id: AssetVerticalId;
  name: string;
  category: MegaMenuCategory;
  categoryLabel: string;
  badge: string;
  badgeType: 'emerald' | 'gold' | 'neutral';
  subheading: string;
  description: string;
  sla: string;
  icon: LucideIcon;
  span2?: boolean;
}

const VERTICALS: AssetVerticalConfig[] = [
  {
    id: 'crypto',
    name: 'Crypto Yields & Cold Storage',
    category: 'liquid-digital',
    categoryLabel: 'DIGITAL ASSETS',
    badge: '+18.4% APY',
    badgeType: 'emerald',
    subheading: 'MPC Multi-Sig • Liquid Staking • Basis Arbitrage',
    description:
      'Institutional cold storage staking, delta-neutral basis arbitrage, and sub-second CeDeFi liquidity pools with instant collateral swap.',
    sla: 'SLA: 0.02MS FIX 4.4',
    icon: Coins,
  },
  {
    id: 'stocks',
    name: 'Global Stocks & DMA',
    category: 'dma-equities',
    categoryLabel: 'SYSTEMATIC EQUITIES',
    badge: '42 EXCHANGES',
    badgeType: 'neutral',
    subheading: '0.04ms Equinix NY4 • Dark Pool Internalized',
    description:
      'Direct DMA access across 42 global exchanges. Algorithmic VWAP/TWAP order slicing with dark pool internalized routing and cross-broker net fills.',
    sla: 'NYSE / LSE / SIX / HKEX',
    icon: TrendingUp,
  },
  {
    id: 'ai-funds',
    name: 'AI Systematic Funds & H100 Mesh',
    category: 'liquid-digital',
    categoryLabel: 'COMPUTE INFRASTRUCTURE',
    badge: '12,400 H100s',
    badgeType: 'gold',
    subheading: '99.98% Utilization • Nordic Hydro-Powered',
    description:
      'Hardware-backed compute yield syndication paired with non-linear neural network predictive momentum strategies collateralized on real silicon.',
    sla: 'ENTERPRISE TIER-IV',
    icon: Cpu,
  },
  {
    id: 'real-estate',
    name: 'Fractional Prime Real Estate',
    category: 'physical-vaults',
    categoryLabel: 'TOKENIZED REAL ESTATE',
    badge: '6.4% NET YIELD',
    badgeType: 'emerald',
    subheading: 'Zurich Freehold & Manhattan Class-A • SPV Audited',
    description:
      'Tokenized prime commercial Class-A towers and freehold Geneva residences with automatic daily USDC rental sweeps and cross-collateral rights.',
    sla: 'AUDITED CADASTRE PROOF',
    icon: Building2,
  },
  {
    id: 'cars',
    name: 'Exotic Hypercar & Horology Depots',
    category: 'physical-vaults',
    categoryLabel: 'VAULTED PHYSICAL ASSETS',
    badge: '$348M VAULTED',
    badgeType: 'neutral',
    subheading: 'Geneva & Zurich Freeports • Zero-Tax Custody',
    description:
      'Climate-monitored historical hypercars located in Geneva & Singapore freeports, biometric retinal access, and fractional on-chain ownership tokens.',
    sla: 'SGS LLOYDS UNDERWRITTEN',
    icon: Car,
  },
  {
    id: 'vip-cards',
    name: 'VIP Titanium Concierge Cards',
    category: 'liquid-digital',
    categoryLabel: 'SOVEREIGN LIQUIDITY',
    badge: '$5M INSTANT LINE',
    badgeType: 'emerald',
    subheading: '0% FX Overspread • Multi-Currency Ledger',
    description:
      'Pure physical titanium sovereign cards backed by dynamic collateral NAV. Instant multi-currency liquidity without foreign exchange markup.',
    sla: 'GLOBAL MASTERCARD TIER-1',
    icon: CreditCard,
  },
  {
    id: 'wallet',
    name: 'Sovereign Wallet & Core Global Finance',
    category: 'all',
    categoryLabel: 'CONSOLIDATED TREASURY LAYER',
    badge: '24/7 DUAL-SIGNATURE',
    badgeType: 'gold',
    subheading: 'SWIFT • Fedwire • SEPA Instant • Merkle MPC',
    description:
      'Hierarchical multi-party computation (MPC) treasury management with zero single point of failure. Direct SWIFT, Fedwire, and SEPA Instant rails bridged seamlessly with crypto liquidity and consolidated multi-entity ledger.',
    sla: 'ENCLAVE POLICIES ACTIVE ACROSS 12 JURISDICTIONS',
    icon: Wallet,
    span2: true,
  },
];

export interface ServicesMegaMenuProps {
  isOpen?: boolean;
  category?: MegaMenuCategory;
}

export const ServicesMegaMenu: React.FC<ServicesMegaMenuProps> = ({
  isOpen,
  category,
}) => {
  const storeIsOpen = useTerminalStore((state) => state.isMegaMenuOpen);
  const setMegaMenuOpen = useTerminalStore((state) => state.setMegaMenuOpen);
  const storeCategory = useTerminalStore((state) => state.megaMenuCategory);
  const setActiveAssetId = useTerminalStore((state) => state.setActiveAssetId);
  const activeAssetId = useTerminalStore((state) => state.activeAssetId);

  const isMegaMenuOpen = isOpen !== undefined ? isOpen : storeIsOpen;
  const megaMenuCategory = category !== undefined ? category : storeCategory;

  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMegaMenuOpen) {
        setMegaMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMegaMenuOpen, setMegaMenuOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isMegaMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Only close if target isn't the nav trigger
        const navTrigger = document.getElementById('services-nav-trigger');
        if (navTrigger && navTrigger.contains(e.target as Node)) {
          return;
        }
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMegaMenuOpen, setMegaMenuOpen]);

  // Filter verticals
  const filteredVerticals = VERTICALS.filter((vert) => {
    if (megaMenuCategory === 'all') return true;
    if (vert.id === 'wallet') return true; // Treasury layer is always relevant
    return vert.category === megaMenuCategory;
  });

  if (!isMegaMenuOpen) return null;

  return (
    <motion.div
      key="services-mega-menu-overlay"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="w-full absolute top-16 left-0 right-0 z-40 px-4 sm:px-6 pt-2 pb-6"
      data-testid="services-mega-menu"
    >
      <div
        ref={menuRef}
        className="max-w-7xl mx-auto bg-surface-container-lowest/98 backdrop-blur-2xl rounded-md shadow-2xl p-5 sm:p-6 relative overflow-hidden border border-outline/40"
      >
            {/* Ambient Substrate Glow */}
            <div className="absolute -top-24 left-1/4 w-96 h-32 bg-primary/10 blur-3xl pointer-events-none" />

            {/* 1. Header Bar: Multi-Asset Execution Fabric */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-5 border-b border-outline/30 gap-4 bg-surface-container-low/90 px-4 py-3 rounded-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-sm uppercase text-on-surface tracking-wider font-semibold font-sans">
                    Sovereign Multi-Asset Custody &amp; Execution Verticals
                  </span>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-sm bg-primary/20 text-primary border border-primary/30 font-semibold">
                  7 ACTIVE ENCLAVES
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-on-surface-variant font-mono text-[10px]">
                <span className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> MERKLE PROOFS: HOURLY
                </span>
                <span className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> FIPS 140-3 HSM VERIFIED
                </span>
                <span className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-sm text-on-surface font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> CROSS-MARGIN: 1:1 CONSOLIDATED
                </span>
              </div>
            </div>

            {/* 2. Category Selector Ribbon */}
            <CategoryFilter />

            {/* 3. Main Grid: 7 Verticals + Active Diagnostics Rail */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Asset Cards Grid */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredVerticals.map((vert) => {
                  const Icon = vert.icon;
                  const isCurrentActive = activeAssetId === vert.id;

                  return (
                    <div
                      key={vert.id}
                      onClick={() => setActiveAssetId(vert.id)}
                      data-testid={`vertical-card-${vert.id}`}
                      className={`group relative bg-surface-container-low hover:bg-surface-container p-4 rounded-sm transition-all cursor-pointer border flex flex-col justify-between ${
                        isCurrentActive
                          ? 'border-primary shadow-sm bg-surface-container'
                          : 'border-outline/20 hover:border-primary/40'
                      } ${vert.span2 ? 'md:col-span-2' : ''}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-sm bg-surface-container-high text-primary inline-flex">
                              <Icon className="w-4 h-4" />
                            </span>
                            <span className="font-mono text-[10px] text-outline uppercase tracking-widest">
                              {vert.categoryLabel}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-[10px] px-2 py-0.5 rounded-sm font-semibold ${
                              vert.badgeType === 'emerald'
                                ? 'bg-secondary/15 text-secondary'
                                : vert.badgeType === 'gold'
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-surface-container-highest text-on-surface'
                            }`}
                          >
                            {vert.badge}
                          </span>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-on-surface pt-1 group-hover:text-primary transition-colors">
                            {vert.name}
                          </div>
                          <div className="font-mono text-[10px] text-secondary mt-0.5">
                            {vert.subheading}
                          </div>
                        </div>

                        <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                          {vert.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-outline/20 flex items-center justify-between text-on-surface-variant font-mono text-[10px]">
                        <span className="uppercase tracking-wider text-outline">{vert.sla}</span>
                        {vert.span2 ? (
                          <span className="text-primary flex items-center gap-1 font-semibold uppercase text-[10px]">
                            Inspect Architecture <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Diagnostics Telemetry Panel */}
              <MegaMenuDiagnostics />
            </div>

            {/* 4. Footer Bar */}
            <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-4 text-on-surface-variant font-mono text-[10px] border-t border-outline/20">
              <div className="flex flex-wrap items-center gap-6">
                <span>SEC CUSTODY REG: #801-128491</span>
                <span>ZURICH FREEPORT VAULT DEPOSIT: AUDITED MAR 2024</span>
                <span className="text-secondary font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> ALL MATRICES SYNCHRONIZED
                </span>
              </div>
              <div className="text-outline">PRESS ESC OR CLICK ANYWHERE OUTSIDE TO COLLAPSE</div>
            </div>
          </div>
        </motion.div>
  );
};
