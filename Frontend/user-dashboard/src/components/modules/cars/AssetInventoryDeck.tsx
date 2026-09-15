import React from 'react';
import { FileText, ArrowLeftRight } from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { EXOTIC_ASSETS } from '../../../lib/alternativeAssetData';

interface AssetInventoryDeckProps {
  maskBalances?: boolean;
}

export const AssetInventoryDeck: React.FC<AssetInventoryDeckProps> = ({
  maskBalances: propMask,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 bg-primary"></span>
          <h2 className="font-serif font-semibold text-on-surface text-base">
            Tier-1 Vaulted Tangible Assets
          </h2>
          <span className="text-outline text-xs font-mono">• Physical Holdings</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-outline">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span> Bonded In-Vault
          </span>
          <span>•</span>
          <span>Last Fiduciary Assay: 48h ago</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {EXOTIC_ASSETS.map((asset) => (
          <div
            key={asset.id}
            className="bg-surface-container border border-border-hairline rounded flex flex-col overflow-hidden justify-between hover:border-primary/40 transition-colors"
          >
            <div>
              {/* Asset Hero Image */}
              <div className="relative h-64 w-full bg-surface-container-lowest overflow-hidden">
                <img
                  src={asset.imageUrl}
                  alt={asset.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-black/60"></div>
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-surface/90 text-primary font-mono text-[10px] font-bold uppercase tracking-wider rounded border border-border-hairline">
                    BONDED
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 bg-surface/90 text-tertiary font-mono text-[10px] rounded border border-border-hairline flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                    {asset.vaultLocation}
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
                  <div className="max-w-[65%]">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                      {asset.type === 'vehicle' ? 'Homologation Series' : 'Grand Complications'}
                    </span>
                    <h3 className="font-serif text-lg text-white font-medium truncate">
                      {asset.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-outline">
                      Fair Market Value
                    </span>
                    <div className="text-lg font-mono text-white font-bold tabular-nums">
                      {maskBalances
                        ? '••••••••'
                        : `$${asset.fairMarketValue.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Details Body */}
              <div className="p-3 space-y-3">
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  {asset.subtitle}
                </div>

                {/* Identification Bar */}
                <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-surface text-xs rounded border border-border-hairline">
                  {asset.primaryAttributes.map((attr, idx) => (
                    <div key={idx}>
                      <span className="text-outline uppercase text-[10px] font-mono tracking-wider block">
                        {attr.label}
                      </span>
                      <span className="text-on-surface font-mono font-medium truncate block mt-0.5">
                        {attr.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Valuation & Index Trajectory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-2.5 bg-surface rounded border border-border-hairline flex flex-col justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-outline">
                      Capital Position
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xs text-outline font-mono">Acquisition:</span>
                      <span className="text-xs font-semibold text-on-surface font-mono tabular-nums">
                        {maskBalances
                          ? '••••••••'
                          : `$${asset.acquisitionPrice.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}`}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs font-mono">
                      <span className="text-outline">Unrealized Gain:</span>
                      <span className="text-tertiary font-bold tabular-nums">
                        {maskBalances
                          ? '••••••••'
                          : `+$${asset.unrealizedGain.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })} (+${asset.gainPct.toFixed(1)}%)`}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-surface rounded border border-border-hairline flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[10px] font-mono text-outline uppercase tracking-wider">
                      <span>{asset.indexBenchmark}</span>
                      <span className="text-tertiary">5-Yr: +{asset.indexTrend5YrPct}%</span>
                    </div>
                    {/* SVG Sparkline */}
                    <div className="py-1">
                      <svg className="w-full h-8 overflow-visible" fill="none" viewBox="0 0 200 32">
                        <path
                          d="M0 26 L40 22 L80 18 L120 14 L160 8 L200 2"
                          stroke="#5fe7a2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        ></path>
                        <path
                          d="M0 26 L40 22 L80 18 L120 14 L160 8 L200 2 L200 32 L0 32 Z"
                          fill="#5fe7a2"
                          fillOpacity="0.12"
                        ></path>
                        <circle cx="200" cy="2" fill="#5fe7a2" r="3"></circle>
                      </svg>
                    </div>
                    <div className="flex justify-between text-[9px] text-outline font-mono">
                      <span>Historical Baseline</span>
                      <span className="text-tertiary font-semibold">Top Decile Collector Alpha</span>
                    </div>
                  </div>
                </div>

                {/* Climate & Storage Telemetry */}
                <div className="p-2 bg-surface text-xs rounded border border-border-hairline space-y-1">
                  <div className="flex items-center justify-between text-outline text-[10px] uppercase tracking-wider font-mono">
                    <span>Enclave Telemetry &amp; Inert Atmosphere</span>
                    <span className="text-tertiary flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span> Sealed &amp; Monitored
                    </span>
                  </div>
                  <div className="text-on-surface-variant flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px]">
                    <span>
                      <strong className="text-on-surface">Condition:</strong> {asset.conditionLabel}
                    </span>
                    <span>
                      <strong className="text-on-surface">Climate:</strong> {asset.climateTelemetry}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-3 pt-0 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 py-1.5 px-2.5 bg-primary text-on-primary font-mono text-xs font-semibold uppercase tracking-wider rounded hover:bg-primary-container transition-colors flex items-center justify-center gap-1.5 cursor-pointer truncate"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Archives &amp; Title</span>
              </button>
              <button
                type="button"
                className="py-1.5 px-2.5 bg-surface border border-border-hairline text-on-surface hover:bg-surface-container-high font-mono text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
                <span>Vault Transfer</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
