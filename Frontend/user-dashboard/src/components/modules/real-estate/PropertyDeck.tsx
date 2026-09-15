import React from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore, type RealEstateRegionFilter } from '../../../store/useAlternativeStore';
import { REAL_ESTATE_ASSETS } from '../../../lib/alternativeAssetData';

const REGIONS: RealEstateRegionFilter[] = [
  'ALL REGIONS',
  'SWITZERLAND',
  'UNITED KINGDOM',
  'GERMANY',
];

interface PropertyDeckProps {
  maskBalances?: boolean;
}

export const PropertyDeck: React.FC<PropertyDeckProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const selectedRegion = useAlternativeStore((s) => s.selectedRegionFilter);
  const setRegion = useAlternativeStore((s) => s.setRegionFilter);

  const filteredAssets = REAL_ESTATE_ASSETS.filter((asset) => {
    if (selectedRegion === 'ALL REGIONS') return true;
    return asset.region.toUpperCase() === selectedRegion.toUpperCase();
  });

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 bg-primary"></span>
          <h2 className="font-serif font-semibold text-on-surface text-base">
            Institutional Asset Inventory
          </h2>
          <span className="text-outline font-mono text-xs uppercase tracking-wider ml-1">
            {`${REAL_ESTATE_ASSETS.length} Enclave Holdings`}
          </span>
        </div>

        {/* Region Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-outline font-mono text-[11px] uppercase mr-1">Region:</span>
          {REGIONS.map((reg) => {
            const isSelected = selectedRegion === reg;
            return (
              <button
                key={reg}
                type="button"
                onClick={() => setRegion(reg)}
                className={`px-2 py-0.5 font-mono text-xs rounded transition-colors ${
                  isSelected
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container border border-border-hairline text-outline hover:text-on-surface'
                }`}
              >
                {reg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {filteredAssets.map((property) => (
          <div
            key={property.id}
            className="bg-surface-container border border-border-hairline rounded overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-colors"
          >
            <div>
              {/* Asset Header Image with Badges */}
              <div className="relative h-40 w-full bg-surface-container-lowest overflow-hidden">
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-surface/90 border border-border-hairline text-primary rounded font-mono text-[10px] font-bold uppercase tracking-wider">
                    {property.spvCode}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-1.5 py-0.5 bg-surface/90 text-tertiary rounded font-mono text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                    {property.occupancyPct}% Occ.
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-[10px] font-mono text-primary uppercase tracking-wider block truncate">
                    {property.location}
                  </span>
                  <h3 className="font-serif font-medium text-white text-sm truncate">
                    {property.name}
                  </h3>
                </div>
              </div>

              {/* Property Specs Body */}
              <div className="p-3 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase text-outline">
                      Equity Valuation
                    </span>
                    <span className="font-mono text-base font-bold text-on-surface tabular-nums">
                      {maskBalances
                        ? '••••••••'
                        : `$${property.valuation.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-outline">Net Yield</span>
                    <span className="font-mono text-sm font-bold text-tertiary block tabular-nums">
                      {property.netRentalYieldApy}% APY
                    </span>
                  </div>
                </div>

                <div className="p-2 bg-surface rounded border border-border-hairline space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span>Tokens Held:</span>
                    <span className="text-on-surface font-semibold tabular-nums">
                      {property.tokenCount.toLocaleString()} ({property.tokenPrice.toFixed(2)} USD)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span>WALT Lease:</span>
                    <span className="text-on-surface font-semibold tabular-nums">
                      {property.waltYears} Years
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span>SPV Entity:</span>
                    <span className="text-on-surface truncate max-w-[140px]">
                      {property.legalEntity}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="p-3 pt-0">
              <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-[11px] font-mono text-outline">
                <span className="truncate">{property.appraisalStandard}</span>
                <span className="text-tertiary shrink-0">Cadastre Verified</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
