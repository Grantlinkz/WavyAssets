import React, { useState, useMemo } from 'react';
import { FileText, ArrowLeftRight, DollarSign, Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { EXOTIC_ASSETS, type ExoticAsset } from '../../../lib/alternativeAssetData';
import { VehicleActionModal } from './VehicleActionModal';

interface AssetInventoryDeckProps {
  maskBalances?: boolean;
}

export const AssetInventoryDeck: React.FC<AssetInventoryDeckProps> = ({
  maskBalances: propMask,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const userHoldings = useAlternativeStore((s) => s.userVehicleHoldings);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'vehicle' | 'horology'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const [actionAsset, setActionAsset] = useState<ExoticAsset | null>(null);
  const [actionMode, setActionMode] = useState<'buy' | 'rent'>('buy');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openAction = (asset: ExoticAsset, mode: 'buy' | 'rent') => {
    setActionAsset(asset);
    setActionMode(mode);
    setIsModalOpen(true);
  };

  const filteredAssets = useMemo(() => {
    return EXOTIC_ASSETS.filter((asset) => {
      const matchesCat = categoryFilter === 'ALL' || asset.type === categoryFilter;
      if (!matchesCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        asset.title.toLowerCase().includes(q) ||
        asset.subtitle.toLowerCase().includes(q) ||
        asset.vaultLocation.toLowerCase().includes(q) ||
        asset.type.toLowerCase().includes(q)
      );
    });
  }, [categoryFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedAssets = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredAssets.slice(start, start + PAGE_SIZE);
  }, [filteredAssets, safeCurrentPage]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 bg-primary"></span>
          <h2 className="font-serif font-semibold text-on-surface text-base">
            Tier-1 Vaulted Tangible Assets
          </h2>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
            <input
              type="text"
              data-testid="exotic-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Porsche, Patek, Rolex..."
              aria-label="Search luxury vaulted assets"
              className="w-full pl-8 pr-7 py-1 bg-surface border border-border-hairline rounded text-xs font-mono text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs font-mono px-1"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {(['ALL', 'vehicle', 'horology'] as const).map((cat) => {
              const isSelected = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 font-mono text-xs rounded uppercase transition-colors ${
                    isSelected
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'bg-surface-container border border-border-hairline text-outline hover:text-on-surface'
                  }`}
                >
                  {cat === 'ALL' ? 'All' : cat === 'vehicle' ? 'Vehicles' : 'Horology'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {paginatedAssets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-outline font-mono text-xs bg-surface-container rounded border border-border-hairline">
            No luxury assets found matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          paginatedAssets.map((asset) => (
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
                  {userHoldings[asset.id]?.owned && (
                    <span className="px-2 py-0.5 bg-primary/20 text-primary font-mono text-[10px] font-bold uppercase tracking-wider rounded border border-primary/40">
                      OWNED TITLE
                    </span>
                  )}
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
                      <span className="text-on-surface font-mono font-medium truncate block">
                        {attr.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Performance Track & Alpha Benchmark */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-surface rounded border border-border-hairline flex flex-col justify-between">
                    <div className="text-[10px] font-mono text-outline uppercase tracking-wider">
                      Mark-to-Market Valuation
                    </div>
                    <div className="text-base font-mono font-bold text-on-surface my-1 tabular-nums">
                      {maskBalances
                        ? '••••••••'
                        : `$${asset.fairMarketValue.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}`}
                    </div>
                    <div className="text-xs font-mono text-tertiary flex items-center gap-1 font-semibold">
                      <span>
                        {maskBalances
                          ? '••••••'
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

            {/* Card Action Footer */}
            <div className="p-3 pt-0 space-y-2.5">
              {/* User holdings badge */}
              {userHoldings[asset.id] &&
                (userHoldings[asset.id].owned ||
                  userHoldings[asset.id].purchaseType ||
                  (userHoldings[asset.id].leases && userHoldings[asset.id].leases.length > 0)) && (
                <div className="p-1.5 bg-primary/10 border border-primary/20 rounded text-[10px] font-mono text-primary flex justify-between">
                  <span>
                    Your Position:{' '}
                    {userHoldings[asset.id].purchaseType === 'full' ||
                    (userHoldings[asset.id].owned && !userHoldings[asset.id].purchaseType)
                      ? '100% Full Legal Title'
                      : userHoldings[asset.id].purchaseType === 'fractional'
                      ? `${userHoldings[asset.id].fractionalPct}% Syndicate Share`
                      : 'Fractional Vault Allocation'}
                  </span>
                  {userHoldings[asset.id].leases?.length > 0 && (
                    <span className="text-tertiary font-bold">
                      {userHoldings[asset.id].leases.length} Active Lease{userHoldings[asset.id].leases.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => openAction(asset, 'buy')}
                  className="py-1.5 px-2 bg-primary text-on-primary font-mono text-xs font-semibold uppercase tracking-wider rounded hover:bg-primary-container transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <DollarSign className="w-3 h-3" />
                  <span>Buy / Syndicate</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAction(asset, 'rent')}
                  className="py-1.5 px-2 bg-surface border border-border-hairline text-on-surface hover:bg-surface-container-high font-mono text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Calendar className="w-3 h-3 text-tertiary" />
                  <span>Rent / Club Lease</span>
                </button>
              </div>

              <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-[11px] font-mono text-outline">
                <div className="flex items-center gap-1.5 truncate">
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="truncate">Proven Title &amp; Assay</span>
                </div>
                <div className="flex items-center gap-1 text-tertiary shrink-0">
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Vault Depository</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      </div>

      {/* Pagination Controls */}
      <div className="p-3 bg-surface-container border border-border-hairline rounded flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="text-outline text-[11px]">
          Showing{' '}
          <span className="text-on-surface font-semibold">
            {filteredAssets.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1}
          </span>
          -
          <span className="text-on-surface font-semibold">
            {Math.min(safeCurrentPage * PAGE_SIZE, filteredAssets.length)}
          </span>{' '}
          of{' '}
          <span className="text-on-surface font-semibold">{filteredAssets.length}</span>{' '}
          luxury vaulted assets
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="exotic-pagination-prev"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 rounded bg-surface border border-border-hairline text-outline hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 text-[11px]"
          >
            <ChevronLeft className="w-3 h-3" />
            <span>PREV</span>
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === safeCurrentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-6 h-6 rounded text-[11px] font-semibold flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface border border-border-hairline text-outline hover:text-on-surface'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            data-testid="exotic-pagination-next"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 rounded bg-surface border border-border-hairline text-outline hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 text-[11px]"
          >
            <span>NEXT</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <VehicleActionModal
        asset={actionAsset}
        mode={actionMode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
