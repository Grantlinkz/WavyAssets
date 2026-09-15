import React from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { REAL_ESTATE_SUMMARY_CARDS } from '../../../lib/alternativeAssetData';
import { PropertyDeck } from './PropertyDeck';
import { RentalDistributionBlotter } from './RentalDistributionBlotter';
import { TenantCreditMatrix } from './TenantCreditMatrix';
import { SecondaryOtcBulletin } from './SecondaryOtcBulletin';

interface RealEstateModuleProps {
  maskBalances?: boolean;
}

export const RealEstateModule: React.FC<RealEstateModuleProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  return (
    <div data-testid="real-estate-module" className="space-y-4 min-h-[540px] animate-fade-in">
      {/* Telemetry Bar / Institutional Breadcrumb */}
      <div className="w-full bg-surface-container border border-border-hairline px-4 py-2.5 rounded flex flex-wrap items-center justify-between gap-3 text-on-surface">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-xs text-outline tracking-wider uppercase">Portfolio</span>
          <span className="text-border-hairline text-xs font-mono">/</span>
          <span className="font-mono text-xs text-outline tracking-wider uppercase">Alternative Assets</span>
          <span className="text-border-hairline text-xs font-mono">/</span>
          <span className="font-mono text-xs text-primary font-semibold tracking-wider uppercase">
            Tokenized Real Estate &amp; Infrastructure
          </span>
          <div className="h-3.5 w-px bg-border-hairline mx-1 hidden sm:block"></div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface border border-border-hairline rounded text-on-surface-variant font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              DLT CADASTRE: SWISS LAND REGISTRY VERIFIED
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface border border-border-hairline rounded text-on-surface-variant font-mono text-[11px]">
              <span className="material-symbols-outlined text-[13px] text-primary">shield</span>
              ZURICH SPV ENCLAVE 04
            </span>
          </div>
        </div>

        {/* Right Operational Downloads */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border-hairline hover:border-primary/50 text-on-surface-variant hover:text-on-surface font-mono text-xs rounded transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">archive</span>
            <span>Consolidated Deeds</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border-hairline hover:border-primary/50 text-on-surface-variant hover:text-on-surface font-mono text-xs rounded transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">description</span>
            <span>Q3 RICS Appraisal</span>
          </button>
        </div>
      </div>

      {/* Top Executive Summary Performance Matrix (4-card modular split pane) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REAL_ESTATE_SUMMARY_CARDS.map((card, idx) => (
          <div
            key={idx}
            className="bg-surface-container border border-border-hairline rounded p-3.5 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
                  {card.label}
                </span>
                <span className="text-xs text-on-surface-variant mt-0.5">{card.subLabel}</span>
              </div>
              {card.badge && (
                <span className="px-1.5 py-0.5 bg-tertiary/10 border border-tertiary/30 text-tertiary font-mono text-[10px] rounded font-semibold tabular-nums">
                  {card.badge}
                </span>
              )}
            </div>

            <div className="my-2.5 flex items-baseline justify-between">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-xl text-on-surface font-bold tabular-nums tracking-tight">
                    {(card.label.includes('EQUITY') || card.label.includes('YIELD')) && maskBalances
                      ? '••••••••'
                      : card.value}
                  </span>
                  {card.unit && (
                    <span className="font-mono text-xs text-outline">{card.unit}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 font-mono text-xs">
                  <span className="text-tertiary tabular-nums font-semibold">{card.delta}</span>
                  {card.deltaSub && (
                    <span className="text-[10px] text-outline uppercase">{card.deltaSub}</span>
                  )}
                </div>
              </div>

              {card.extraMetric && (
                <div className="text-right flex flex-col items-end">
                  <span className="font-mono text-sm font-bold text-on-surface tabular-nums">
                    {card.extraMetric}
                  </span>
                  <span className="text-[10px] font-mono text-outline uppercase">
                    {card.extraMetricLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-[11px] font-mono text-outline tabular-nums">
              <span>{card.footerKey}</span>
              <span className="text-on-surface-variant font-medium">{card.footerVal}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Property Inventory Deck */}
      <PropertyDeck maskBalances={maskBalances} />

      {/* Split Bottom Row: Distribution Blotter + Credit Matrix (8 cols) vs Secondary OTC Bulletin (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 space-y-4">
          <RentalDistributionBlotter maskBalances={maskBalances} />
          <TenantCreditMatrix />
        </div>

        <div className="lg:col-span-4">
          <SecondaryOtcBulletin maskBalances={maskBalances} />
        </div>
      </div>
    </div>
  );
};
