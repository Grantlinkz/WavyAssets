import React, { useMemo } from 'react';
import { Lock, ShieldCheck, FileText, Scale } from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import { EXOTIC_ASSETS } from '../../../lib/alternativeAssetData';
import { TOTAL_Global_NET_WORTH } from '../../../lib/calculations';
import { AssetInventoryDeck } from './AssetInventoryDeck';
import { DriveBookingEngine } from './DriveBookingEngine';
import { CustodyLedger } from './CustodyLedger';

interface CarsModuleProps {
  maskBalances?: boolean;
}

export const CarsModule: React.FC<CarsModuleProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const userHoldings = useAlternativeStore((s) => s.userVehicleHoldings);
  const netWorth = usePortfolioStore((s) => s.netWorth);

  // Dynamically compute individual values directly from vaulted assets in user's collection
  const vaultedAssets = useMemo(() => {
    const ownedIds = Object.keys(userHoldings).filter((id) => userHoldings[id]?.owned);
    if (ownedIds.length > 0) {
      return EXOTIC_ASSETS.filter((a) => ownedIds.includes(a.id));
    }
    // Default Global vaulted collection (car-1 Porsche 911 GT2 & watch-1 Patek Philippe 5270P)
    return EXOTIC_ASSETS.filter((a) => a.id === 'car-1' || a.id === 'watch-1');
  }, [userHoldings]);

  const dynamicMetrics = useMemo(() => {
    const totalValuation = vaultedAssets.reduce((sum, a) => sum + a.fairMarketValue, 0);
    const totalAcquisition = vaultedAssets.reduce((sum, a) => sum + a.acquisitionPrice, 0);
    const totalUnrealizedGain = totalValuation - totalAcquisition;
    const totalGainPct = totalAcquisition > 0 ? (totalUnrealizedGain / totalAcquisition) * 100 : 0;
    const totalInsuredValue = vaultedAssets.reduce((sum, a) => sum + a.insuredValue, 0);

    const effectiveNetWorth = netWorth > 0 ? netWorth : TOTAL_Global_NET_WORTH;
    const navPct = effectiveNetWorth > 0 ? (totalValuation / effectiveNetWorth) * 100 : 5.7;

    // 1-Year Index Growth calculated from collection asset gains
    const weightedGrowth = totalValuation > 0
      ? vaultedAssets.reduce((sum, a) => sum + (a.gainPct || 14.2) * a.fairMarketValue, 0) / totalValuation
      : 14.2;

    const sign = totalUnrealizedGain >= 0 ? '+' : '-';

    return [
      {
        label: 'VAULTED VALUATION',
        badge: `${navPct.toFixed(1)}% Consolidated NAV`,
        value: `$${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        delta: `${sign}$${Math.abs(totalUnrealizedGain).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${sign}${totalGainPct.toFixed(2)}%)`,
        footerKey: `Consolidated NAV Basis: $${(effectiveNetWorth / 1e6).toFixed(2)}M`,
        footerVal: 'Marked Uncompromised',
      },
      {
        label: '1-YEAR INDEX GROWTH',
        badge: '+8.1% vs Benchmark',
        value: `+${weightedGrowth.toFixed(1)}%`,
        delta: 'Hagerty Blue Chip',
        footerKey: 'Vintage Collector Alpha',
        footerVal: 'Top Decile Trajectory',
      },
      {
        label: 'ACTIVE INSURED LIMIT',
        badge: 'Policy #LL-CH-892401',
        value: `$${totalInsuredValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        delta: 'Agreed Value (Lloyds Specie)',
        footerKey: 'Lloyds Syndicate 2003',
        footerVal: 'Active & Bonded',
      },
      {
        label: 'PHYSICAL VAULT TELEMETRY',
        badge: 'Dual Sensor Feed',
        value: 'Dual Vaults',
        delta: 'Geneva: 19.5°C | Zurich: 20.0°C',
        footerKey: 'Preservation Standard',
        footerVal: 'DIN 14096 Certified',
      },
    ];
  }, [vaultedAssets, netWorth]);

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
        {dynamicMetrics.map((metric, idx) => (
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
