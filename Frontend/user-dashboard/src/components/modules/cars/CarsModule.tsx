import React, { useMemo } from 'react';
import { Lock, ShieldCheck, FileText, Scale } from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import { EXOTIC_ASSETS } from '../../../lib/alternativeAssetData';
import { AssetInventoryDeck } from './AssetInventoryDeck';
import { DriveBookingEngine } from './DriveBookingEngine';
import { CustodyLedger } from './CustodyLedger';

interface CarsModuleProps {
  maskBalances?: boolean;
}

export const CarsModule: React.FC<CarsModuleProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const storeHoldings = useAlternativeStore((s) => s.userVehicleHoldings);
  const userHoldings = Object.keys(storeHoldings).length > 0 ? storeHoldings : useAlternativeStore.getState().userVehicleHoldings;
  const storeNetWorth = usePortfolioStore((s) => s.netWorth);
  const netWorth = storeNetWorth > 0 ? storeNetWorth : usePortfolioStore.getState().netWorth;

  const dynamicMetrics = useMemo(() => {
    let totalValuation = 0;
    let totalAcquisition = 0;
    let totalInsuredValue = 0;
    let weightedGrowthSum = 0;
    const heldLocations = new Set<string>();

    Object.entries(userHoldings).forEach(([assetId, holding]) => {
      const isOwned = holding.owned || (holding.totalInvested && holding.totalInvested > 0);
      const hasLeases = (holding.leases || []).length > 0;
      if (!isOwned && !hasLeases) return;

      const asset = EXOTIC_ASSETS.find((a) => a.id === assetId);
      if (!asset) return;

      let buyVal = 0;
      let buyBasis = 0;
      if (isOwned) {
        if (holding.purchaseType === 'fractional') {
          buyVal = holding.totalInvested || ((holding.fractionalPct || 100) / 100) * asset.fairMarketValue;
          buyBasis = holding.totalInvested || ((holding.fractionalPct || 100) / 100) * asset.acquisitionPrice;
        } else {
          buyVal = asset.fairMarketValue;
          buyBasis = holding.totalInvested || asset.acquisitionPrice;
        }
      }

      const leaseVal = (holding.leases || []).reduce((sum, l) => sum + (l.cost || 0), 0);
      const assetTotalVal = buyVal + leaseVal;

      totalValuation += assetTotalVal;
      totalAcquisition += buyBasis + leaseVal;
      totalInsuredValue += asset.insuredValue;
      weightedGrowthSum += (asset.gainPct || 14.2) * assetTotalVal;
      heldLocations.add(asset.vaultLocation);
    });

    if (totalValuation <= 0) {
      return [
        {
          label: 'VAULTED VALUATION',
          badge: '0.0% Consolidated NAV',
          value: '$0.00',
          delta: '+$0.00 (+0.00%)',
          footerKey: 'Consolidated NAV Basis: $0.00M',
          footerVal: 'Zero Active Vault Holdings',
        },
        {
          label: '1-YEAR INDEX GROWTH',
          badge: 'Benchmark Standby',
          value: '+0.0%',
          delta: 'Hagerty Blue Chip',
          footerKey: 'Vintage Collector Alpha',
          footerVal: 'Baseline Zero',
        },
        {
          label: 'ACTIVE INSURED LIMIT',
          badge: 'Policy Standby',
          value: '$0.00',
          delta: 'Agreed Value (Lloyds Specie)',
          footerKey: 'Lloyds Syndicate 2003',
          footerVal: 'Standby',
        },
        {
          label: 'PHYSICAL VAULT TELEMETRY',
          badge: 'Sensors Standby',
          value: '0 Vaults Active',
          delta: 'Geneva: -- | Zurich: --',
          footerKey: 'Preservation Standard',
          footerVal: 'DIN 14096 Ready',
        },
      ];
    }

    const totalUnrealizedGain = totalValuation - totalAcquisition;
    const totalGainPct = totalAcquisition > 0 ? (totalUnrealizedGain / totalAcquisition) * 100 : 0;

    const effectiveNetWorth = netWorth > 0 ? netWorth : totalValuation;
    const navPct = (totalValuation / effectiveNetWorth) * 100;

    const weightedGrowth = weightedGrowthSum / totalValuation;
    const sign = totalUnrealizedGain >= 0 ? '+' : '-';

    const telemetryString = heldLocations.has('Geneva Freeport Vault #4B') && heldLocations.has('Zurich Vault #02')
      ? 'Geneva: 19.5°C | Zurich: 20.0°C'
      : heldLocations.has('Geneva Freeport Vault #4B')
      ? 'Geneva: 19.5°C / 48% RH'
      : heldLocations.has('Zurich Vault #02')
      ? 'Zurich: 20.0°C / 45% N₂'
      : Array.from(heldLocations)[0] || 'Dual Vaults Active';

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
        value: `${heldLocations.size} Vault${heldLocations.size > 1 ? 's' : ''}`,
        delta: telemetryString,
        footerKey: 'Preservation Standard',
        footerVal: 'DIN 14096 Certified',
      },
    ];
  }, [userHoldings, netWorth]);

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
