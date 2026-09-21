import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import {
  useTerminalStore,
  type AssetVerticalId,
  type MegaMenuCategory,
} from '../../store/useTerminalStore';
import { CategoryFilter } from './CategoryFilter';
import { MegaMenuDiagnostics } from './MegaMenuDiagnostics';
import {
  Crypto3DVectorIcon,
  Stocks3DVectorIcon,
  AiFunds3DVectorIcon,
  RealEstate3DVectorIcon,
  Cars3DVectorIcon,
  VipCards3DVectorIcon,
  Wallet3DVectorIcon,
} from './icons/Asset3DVectorIcons';

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
  ctaText: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  span2?: boolean;
}

const VERTICALS: AssetVerticalConfig[] = [
  {
    id: 'crypto',
    name: 'High-Yield Crypto Staking & Cold Storage',
    category: 'liquid-digital',
    categoryLabel: 'CRYPTO INVESTMENTS',
    badge: '+18.4% APY YIELD',
    badgeType: 'emerald',
    subheading: 'Multi-Key Security • Offline Cold Storage • Daily Payouts',
    description:
      'Earn industry-leading staking returns on Bitcoin, Ethereum, and Solana with automated downside protection and multi-signature offline cold storage.',
    sla: 'Instant Zero-Fee Settlement',
    ctaText: 'Sign In to Invest',
    icon: Crypto3DVectorIcon,
  },
  {
    id: 'stocks',
    name: 'Global Stocks & Pre-IPO Tech Shares',
    category: 'dma-equities',
    categoryLabel: 'STOCK MARKET & EQUITIES',
    badge: '40+ EXCHANGES',
    badgeType: 'neutral',
    subheading: 'Direct Market Access • Buy SpaceX & Stripe Before IPO',
    description:
      'Trade top public stocks across New York, London, and Tokyo with low commissions. Access exclusive allocations in unicorn pre-IPO private companies.',
    sla: 'Direct Market Execution',
    ctaText: 'Sign In to Trade',
    icon: Stocks3DVectorIcon,
  },
  {
    id: 'ai-funds',
    name: 'AI Infrastructure Funds & GPU Compute',
    category: 'liquid-digital',
    categoryLabel: 'QUANTITATIVE AI INVESTING',
    badge: '14.8% APY TARGET',
    badgeType: 'gold',
    subheading: 'Enterprise Nvidia H100 Clusters • Hands-Free Compounding',
    description:
      'Invest in high-performance computing clusters leased to Fortune 500 AI developers. Generate automated monthly income backed by physical GPU hardware.',
    sla: 'Enterprise Data Centers',
    ctaText: 'Sign In to Access Funds',
    icon: AiFunds3DVectorIcon,
  },
  {
    id: 'real-estate',
    name: 'Fractional Prime Commercial Real Estate',
    category: 'physical-vaults',
    categoryLabel: 'TOKENIZED PROPERTY',
    badge: '6.4% NET RENTAL YIELD',
    badgeType: 'emerald',
    subheading: 'Quarterly Cash Distributions • Prime Tier-1 City Buildings',
    description:
      'Acquire fractional equity in luxury commercial properties across London, Zurich, and Manhattan. Receive notarized ownership deeds and passive quarterly rent.',
    sla: 'Notarized Title Deeds',
    ctaText: 'Sign In to View Properties',
    icon: RealEstate3DVectorIcon,
  },
  {
    id: 'cars',
    name: 'Exotic Collector Cars & Rare Horology Vault',
    category: 'physical-vaults',
    categoryLabel: 'LUXURY COLLECTIBLE VAULT',
    badge: '$348M INSURED',
    badgeType: 'neutral',
    subheading: "Climate-Controlled Vaults • 100% Lloyd's Insured",
    description:
      'Invest in hypercars, vintage Ferrari collectibles, and Patek Philippe timepieces stored in bonded Swiss vaults with third-party appraisals.',
    sla: 'Swiss Freeport Storage',
    ctaText: 'Sign In to Vault',
    icon: Cars3DVectorIcon,
  },
  {
    id: 'vip-cards',
    name: 'VIP Titanium Metal Concierge Cards',
    category: 'liquid-digital',
    categoryLabel: 'Global CARD & CREDIT',
    badge: '$5M INSTANT LIMIT',
    badgeType: 'emerald',
    subheading: 'Zero International Fees • Asset-Backed Liquidity Line',
    description:
      'Spend your investment returns globally with bespoke titanium metal cards. Enjoy 24/7 global concierge service and zero foreign transaction fees.',
    sla: 'Worldwide Mastercard Priority',
    ctaText: 'Sign In to Claim Card',
    icon: VipCards3DVectorIcon,
  },
  {
    id: 'wallet',
    name: 'Multi-Currency Global Digital Wallet',
    category: 'all',
    categoryLabel: 'SECURE DIGITAL WALLET',
    badge: 'MULTI-KEY MPC PROTECTION',
    badgeType: 'gold',
    subheading: 'Multi-Currency Treasury • Send & Receive in Seconds',
    description:
      'Consolidate US Dollars, Euros, British Pounds, and digital assets into a single high-security institutional account with instant zero-loss conversions.',
    sla: 'Bank-Grade MPC Custody',
    ctaText: 'Sign In to Open Wallet',
    icon: Wallet3DVectorIcon,
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
  const openAuthModal = useTerminalStore((state) => state.openAuthModal);

  const isMegaMenuOpen = isOpen !== undefined ? isOpen : storeIsOpen;
  const megaMenuCategory = category !== undefined ? category : storeCategory;

  const overlayRef = useRef<HTMLDivElement>(null);
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

  // Close on click outside (backdrop only)
  useEffect(() => {
    if (!isMegaMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const navTrigger = document.getElementById('services-nav-trigger');
      if (navTrigger && navTrigger.contains(e.target as Node)) {
        return;
      }
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      if (overlayRef.current && e.target === overlayRef.current) {
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

  const handleVerticalClick = (vertId: AssetVerticalId) => {
    setActiveAssetId(vertId);
    setMegaMenuOpen(false);
    openAuthModal('institutional', 'login');
  };

  if (!isMegaMenuOpen) return null;

  return (
    <div
      ref={overlayRef}
      key="services-mega-menu-overlay"
      className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-black/80 backdrop-blur-md overflow-y-auto custom-scrollbar px-3 sm:px-6 pt-3 pb-32"
      data-testid="services-mega-menu"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setMegaMenuOpen(false);
        }
      }}
    >
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-7xl mx-auto bg-surface-container-lowest/98 backdrop-blur-2xl rounded-md shadow-2xl p-5 sm:p-6 pb-8 relative overflow-hidden border border-outline/40 mb-16"
      >
        {/* Ambient Substrate Glow */}
        <div className="absolute -top-24 left-1/4 w-96 h-32 bg-primary/10 blur-3xl pointer-events-none" />

        {/* 1. Header Bar: Multi-Asset Execution Fabric */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-5 border-b border-outline/30 gap-4 bg-surface-container-low/90 px-4 py-3 rounded-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm uppercase text-on-surface tracking-wider font-semibold font-sans">
                Explore Wealth Services &amp; Asset Classes
              </span>
            </div>
            <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-sm bg-primary/20 text-primary border border-primary/30 font-semibold">
              100% ASSET-BACKED
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-on-surface-variant font-mono text-[10px]">
            <span className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> SOC-2 &amp; FINMA COMPLIANT
            </span>
            <span className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> FIPS 140-3 MPC STORAGE
            </span>
            <span className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-sm text-on-surface font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" /> INSTANT SETTLEMENT
            </span>
          </div>
        </div>

        {/* 2. Category Selector Ribbon */}
        <CategoryFilter />

        {/* 3. Main Grid: 7 Verticals + Active Diagnostics Rail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Asset Cards Grid */}
          <div
            data-testid="services-scroll-container"
            className="lg:col-span-8 custom-scrollbar"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-4">
              {filteredVerticals.map((vert) => {
                const Icon = vert.icon;
                const isCurrentActive = activeAssetId === vert.id;

                return (
                  <div
                    key={vert.id}
                    onClick={() => handleVerticalClick(vert.id)}
                    data-testid={`vertical-card-${vert.id}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleVerticalClick(vert.id);
                      }
                    }}
                    className={`group relative bg-surface-container-low hover:bg-surface-container p-4 rounded-sm transition-all cursor-pointer border flex flex-col justify-between ${
                      isCurrentActive
                        ? 'border-primary shadow-sm bg-surface-container'
                        : 'border-outline/20 hover:border-primary/40'
                    } ${vert.span2 ? 'md:col-span-2' : ''}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded-sm bg-surface-container-high/60 border border-outline/20 group-hover:border-primary/40 transition-colors">
                            <Icon className="w-10 h-10" />
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-outline uppercase tracking-widest block">
                              {vert.categoryLabel}
                            </span>
                            <div className="text-sm font-semibold text-on-surface pt-0.5 group-hover:text-primary transition-colors">
                              {vert.name}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded-sm font-semibold shrink-0 ${
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

                      <div className="space-y-1">
                        <div className="font-mono text-[11px] text-secondary">
                          {vert.subheading}
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                          {vert.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-outline/20 flex items-center justify-between text-on-surface-variant font-mono text-[10px]">
                      <span className="uppercase tracking-wider text-outline">{vert.sla}</span>
                      <span className="text-primary flex items-center gap-1 font-semibold uppercase text-[10px] group-hover:translate-x-0.5 transition-transform">
                        {vert.ctaText} <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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
          <div className="text-outline">CLICK ANY SERVICE TO SIGN IN • ESC TO CLOSE</div>
        </div>
      </motion.div>
    </div>
  );
};
