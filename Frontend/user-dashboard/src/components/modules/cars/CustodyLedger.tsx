import React, { useState, useMemo } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { EXOTIC_ASSETS } from '../../../lib/alternativeAssetData';

export const CustodyLedger: React.FC = () => {
  const storeHoldings = useAlternativeStore((s) => s.userVehicleHoldings);
  const userHoldings = Object.keys(storeHoldings).length > 0 ? storeHoldings : useAlternativeStore.getState().userVehicleHoldings;
  const sellVehicleAsset = useAlternativeStore((s) => s.sellVehicleAsset);
  const [notification, setNotification] = useState<string | null>(null);

  const ownedAssets = useMemo(() => {
    return Object.entries(userHoldings)
      .filter(([, h]) => h.owned || (h.totalInvested && h.totalInvested > 0))
      .map(([assetId, h]) => {
        const asset = EXOTIC_ASSETS.find((a) => a.id === assetId);
        return {
          asset,
          holding: h,
        };
      })
      .filter((item): item is { asset: (typeof EXOTIC_ASSETS)[0]; holding: typeof item.holding } => Boolean(item.asset));
  }, [userHoldings]);

  const handleSell = (assetId: string, title: string) => {
    sellVehicleAsset(assetId);
    setNotification(`Successfully liquidated ${title}. Physical title transferred back to vault.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="bg-surface-container border border-border-hairline rounded p-4 flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-border-hairline">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <h3 className="font-serif font-semibold text-on-surface text-base">
              Custody &amp; Underwriting
            </h3>
          </div>
          <span className="text-[10px] font-mono text-tertiary font-bold">LL-SPECIE-2003</span>
        </div>

        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
          Continuous cryptographic audit and multi-jurisdiction fiduciary coverage architecture.
        </p>

        {notification && (
          <div className="mt-2 p-2 bg-tertiary/10 border border-tertiary/30 text-tertiary text-xs font-mono rounded flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-tertiary shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {ownedAssets.length === 0 ? (
          <div className="mt-3 py-8 px-4 text-center text-xs font-mono text-outline bg-surface rounded border border-dashed border-border-hairline">
            No tangible luxury assets under custody. Acquire vehicles or horology timepieces in Tier-1 Vaulted Tangible Assets to activate custody inspection and underwriting.
          </div>
        ) : (
          <>
            {/* Condition Inspection Scores */}
            <div className="mt-3 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">
                Condition Inspection Scores
              </span>

              {ownedAssets.map(({ asset, holding }) => (
                <div key={asset.id} className="p-2.5 bg-surface rounded border border-border-hairline space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface font-medium truncate max-w-[65%]">
                      {asset.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-sm font-bold text-tertiary tabular-nums">{asset.conditionScore.toFixed(1)}</span>
                        <span className="text-outline text-[11px]">/ 100</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSell(asset.id, asset.title)}
                        className="px-2 py-0.5 bg-error/20 hover:bg-error text-error hover:text-white font-mono text-[10px] font-bold rounded uppercase transition-colors cursor-pointer border border-error/30"
                      >
                        SELL
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-outline font-mono flex items-center justify-between">
                    <span className="truncate">{asset.custodyEnclave}</span>
                    <span className="text-primary font-semibold truncate">{asset.conditionLabel}</span>
                  </div>
                  {holding.purchaseType === 'fractional' && (
                    <div className="text-[10px] text-tertiary font-mono">
                      {holding.fractionalPct}% Syndicate Share (${(holding.totalInvested || 0).toLocaleString()} USD)
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Underwriting Policy Breakdown */}
            <div className="mt-3 space-y-1.5 text-xs font-mono">
              <span className="text-[10px] uppercase tracking-wider text-outline block">
                Lloyds Specie Policies
              </span>

              <div className="p-2 bg-surface rounded border border-border-hairline space-y-1">
                {ownedAssets.map(({ asset }) => (
                  <div key={`pol-${asset.id}`} className="flex items-center justify-between">
                    <span className="text-outline truncate max-w-[60%]">{asset.vaultLocation}:</span>
                    <span className="text-on-surface font-semibold">
                      ${(asset.insuredValue / 1000).toFixed(0)}k ({asset.underwritingPolicy.split('#')[0].trim() || 'Specie'})
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1 border-t border-border-hairline">
                  <span className="text-outline">In-Transit Enclosed Flatbed:</span>
                  <span className="text-tertiary font-semibold">Covered ($2M Umbrella)</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="pt-2 border-t border-border-hairline">
        <div className="flex items-center justify-between text-[11px] font-mono text-outline">
          <span>Last Audit: 12 March 2025</span>
          <span className="text-tertiary font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-tertiary shrink-0" /> 0 Deficiencies
          </span>
        </div>
      </div>
    </div>
  );
};
