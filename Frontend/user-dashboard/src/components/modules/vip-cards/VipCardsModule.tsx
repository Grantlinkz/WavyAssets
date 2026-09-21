import React from 'react';
import {
  Sparkles,
  ArrowUpRight,
  Headphones,
  Award,
} from 'lucide-react';
import { ObsidianMetalCard } from './ObsidianMetalCard';
import { CardSpendingLimits } from './CardSpendingLimits';
import { BiometricRevealModal } from './BiometricRevealModal';
import { GlobalConciergeModal } from './GlobalConciergeModal';
import { VIP_CARD_TIERS, VIP_CARD_PRIVILEGES } from '../../../lib/governanceAssetData';
import { formatMaskedCurrency } from '../../../lib/calculations';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useGovernanceStore } from '../../../store/useGovernanceStore';

interface VipCardsModuleProps {
  maskBalances?: boolean;
}

export const VipCardsModule: React.FC<VipCardsModuleProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const { openConciergeModal } = useGovernanceStore();

  const netWorth = 14820450.0;
  const nextTierAum = 25000000.0;
  const progressPct = 59.3;

  return (
    <div
      data-testid="vip-cards-module"
      className="min-h-[540px] w-full space-y-6 select-none"
    >
      {/* 1. Header & Navigation Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-outline tracking-wider uppercase">
            <span>Portfolio</span>
            <span>/</span>
            <span>Treasury & Cards</span>
            <span>/</span>
            <span className="text-primary font-semibold">Global VIP Metal Cards & Concierge</span>
          </div>
          <h1 className="font-serif text-xl font-bold text-on-surface tracking-tight mt-1">
            Obsidian Metal Card & Global Concierge
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="open-concierge-btn"
            onClick={openConciergeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-surface hover:bg-primary-hover font-mono text-xs font-bold uppercase tracking-wider rounded-DEFAULT transition-colors shadow-sm cursor-pointer"
          >
            <Headphones className="w-4 h-4" />
            <span>Launch Concierge Desk</span>
          </button>
        </div>
      </div>

      {/* 2. 3-Tier Global AUM Progression Bar */}
      <section
        data-testid="tier-progression-bar"
        className="bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-4 space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-on-surface uppercase">
              Current Standing: Obsidian Elite Tier (42g Tungsten)
            </span>
          </div>
          <div className="text-[11px] text-outline">
            <span>{formatMaskedCurrency(netWorth, maskBalances)} / {formatMaskedCurrency(nextTierAum, false)}: </span>
            <strong className="text-secondary tabular-nums font-bold">
              {progressPct}% Completed
            </strong>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-2 bg-surface-container rounded-DEFAULT overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* 3 Tier Markers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
          {VIP_CARD_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`p-2.5 rounded-DEFAULT border ${
                tier.status === 'CURRENT'
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'bg-surface-container-low border-border-hairline text-outline'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{tier.name}</span>
                <span className="text-[10px] uppercase font-semibold">
                  {tier.status === 'CURRENT' ? 'ACTIVE TIER' : tier.status}
                </span>
              </div>
              <div className="text-on-surface font-semibold mt-1 tabular-nums">
                {formatMaskedCurrency(tier.minAum, false)} AUM
              </div>
              <div className="text-[10px] text-outline mt-0.5">
                {tier.cashbackPct}% Unlimited Cashback • {tier.material}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Card Showcase & Spending Controls Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ObsidianMetalCard maskBalances={maskBalances} />
        </div>
        <div className="lg:col-span-5">
          <CardSpendingLimits maskBalances={maskBalances} />
        </div>
      </section>

      {/* 4. Global Cardholder Privileges & Services Grid */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-on-surface">
            Institutional Privileges & Bespoke Services
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {VIP_CARD_PRIVILEGES.map((priv) => (
            <div
              key={priv.id}
              className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between hover:bg-surface-container transition-colors"
            >
              <div>
                <span className="font-mono text-[9px] text-primary uppercase font-bold tracking-wider block">
                  {priv.category}
                </span>
                <h3 className="font-serif text-sm font-semibold text-on-surface mt-1">
                  {priv.title}
                </h3>
                <p className="font-sans text-xs text-outline mt-1.5 leading-relaxed">
                  {priv.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-border-hairline flex items-center justify-between text-[10px] font-mono text-tertiary">
                <span>INCLUDED IN TIER</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Modals */}
      <BiometricRevealModal />
      <GlobalConciergeModal />
    </div>
  );
};
