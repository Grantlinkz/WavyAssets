import React from 'react';
import { Lock, ShieldCheck, FileText, Scale } from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { CARS_SUMMARY_METRICS } from '../../../lib/alternativeAssetData';
import { AssetInventoryDeck } from './AssetInventoryDeck';
import { DriveBookingEngine } from './DriveBookingEngine';
import { CustodyLedger } from './CustodyLedger';

interface CarsModuleProps {
  maskBalances?: boolean;
}

export const CarsModule: React.FC<CarsModuleProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  return (
    <div data-testid="cars-module" className="space-y-4 min-h-[540px] animate-fade-in">
      {/* Sub-Header & Breadcrumb Bar */}
      <div className="bg-surface-container border border-border-hairline px-4 py-2.5 rounded flex flex-wrap items-center justify-between gap-3 text-on-surface">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-mono text-xs text-outline uppercase tracking-wider">
            <span>Portfolio</span>
            <span className="text-border-hairline">/</span>
            <span>Tangible Luxury Assets</span>
            <span className="text-border-hairline">/</span>
            <span className="text-primary font-semibold">
              Exotic Vehicles &amp; Horology Vault
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface border border-border-hairline text-[11px] font-mono text-on-surface-variant rounded">
              <Lock className="w-3 h-3 text-tertiary shrink-0" />
              <span>GENEVA FREEPORT &amp; ZURICH HOROLOGY VAULT</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface border border-border-hairline text-[11px] font-mono text-on-surface-variant rounded">
              <ShieldCheck className="w-3 h-3 text-primary shrink-0" />
              <span>LLOYDS SPECIE SYNDICATE 2003</span>
            </div>
          </div>
        </div>

        {/* Quick Action Binders */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border-hairline hover:bg-surface-container-high text-on-surface font-mono text-xs uppercase tracking-wider rounded transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Insurance Binder</span>
          </button>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary font-mono text-xs rounded border border-primary/20">
            <Scale className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-semibold uppercase tracking-wider">Bonded Freeport Status</span>
          </div>
        </div>
      </div>

      {/* Physical Asset Executive Overview Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
        {CARS_SUMMARY_METRICS.map((metric, idx) => (
          <div
            key={idx}
            className="p-3 bg-surface-container border border-border-hairline rounded flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-outline uppercase tracking-wider">
                {metric.label}
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-surface border border-border-hairline text-primary rounded">
                {metric.badge}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-xl text-on-surface tabular-nums font-bold">
                {(metric.value.includes('$') || metric.label.includes('VALUATION')) && maskBalances
                  ? '••••••••'
                  : metric.value}
              </span>
              <span className="font-mono text-xs text-tertiary tabular-nums font-medium">
                {metric.delta.includes('$') && maskBalances ? '••••' : metric.delta}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-border-hairline text-[11px] font-mono text-outline flex items-center justify-between">
              <span>{metric.footerKey}</span>
              <span className="text-tertiary">
                {metric.footerVal.includes('$') && maskBalances ? '••••••••' : metric.footerVal}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Asset Inventory Deck */}
      <AssetInventoryDeck maskBalances={maskBalances} />

      {/* Split Bottom Row: Fleet Yield & Booking (8 cols) vs Custody Ledger (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-8">
          <DriveBookingEngine maskBalances={maskBalances} />
        </div>
        <div className="lg:col-span-4">
          <CustodyLedger />
        </div>
      </div>
    </div>
  );
};
