import React, { useState, useMemo } from 'react';
import { Calendar, Search, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { AI_STRATEGY_ASSETS, type AiStrategyAsset } from '../../../lib/alternativeAssetData';
import { AiActionModal } from './AiActionModal';

const CATEGORIES = [
  'ALL CATEGORIES',
  'GPU CLUSTERS',
  'ROBOTICS & AGVS',
  'DATA CENTERS',
  'AI CHIPS & ASICS',
  'INFRASTRUCTURE',
];

interface AiAssetDeckProps {
  maskBalances?: boolean;
}

export const AiAssetDeck: React.FC<AiAssetDeckProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const selectedCategory = useAlternativeStore((s) => s.selectedAiCategoryFilter || 'ALL CATEGORIES');
  const setCategory = useAlternativeStore((s) => s.setAiCategoryFilter);
  const userHoldings = useAlternativeStore((s) => s.userAiHoldings || {});

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const [actionAsset, setActionAsset] = useState<AiStrategyAsset | null>(null);
  const [actionMode, setActionMode] = useState<'buy' | 'lease'>('buy');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openAction = (asset: AiStrategyAsset, mode: 'buy' | 'lease') => {
    setActionAsset(asset);
    setActionMode(mode);
    setIsModalOpen(true);
  };

  const filteredAssets = useMemo(() => {
    return AI_STRATEGY_ASSETS.filter((asset) => {
      const matchesCategory =
        selectedCategory === 'ALL CATEGORIES' ||
        asset.category.toUpperCase() === selectedCategory.toUpperCase();
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.facility.toLowerCase().includes(q) ||
        asset.hardwareCode.toLowerCase().includes(q) ||
        asset.specs.toLowerCase().includes(q) ||
        asset.category.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedAssets = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredAssets.slice(start, start + PAGE_SIZE);
  }, [filteredAssets, safeCurrentPage]);

  return (
    <section className="flex flex-col gap-3" data-testid="ai-asset-deck">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 bg-primary"></span>
          <h2 className="font-serif font-semibold text-on-surface text-base">
            Institutional Asset Inventory
          </h2>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
            <input
              type="text"
              data-testid="ai-asset-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search GPU, robot, data center..."
              aria-label="Search AI assets"
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

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-outline font-mono text-[11px] uppercase mr-1">Vertical:</span>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 font-mono text-xs rounded transition-colors ${
                    isSelected
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'bg-surface-container border border-border-hairline text-outline hover:text-on-surface'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {paginatedAssets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-outline font-mono text-xs bg-surface-container rounded border border-border-hairline">
            No assets found matching &ldquo;{searchQuery}&rdquo; in {selectedCategory}
          </div>
        ) : (
          paginatedAssets.map((asset) => {
            const holding = userHoldings[asset.id];
            const hasTokens = holding && holding.tokens > 0;
            const hasLeases = holding && holding.leases && holding.leases.length > 0;

            return (
              <div
                key={asset.id}
                data-testid={`ai-asset-card-${asset.id}`}
                className="bg-surface-container border border-border-hairline rounded overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div>
                  {/* Asset Header Image with Badges */}
                  <div className="relative h-40 w-full bg-surface-container-lowest overflow-hidden">
                    <img
                      src={asset.imageUrl}
                      alt={asset.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-surface/90 border border-border-hairline text-primary rounded font-mono text-[10px] font-bold uppercase tracking-wider">
                        {asset.hardwareCode}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="px-1.5 py-0.5 bg-surface/90 text-tertiary rounded font-mono text-[10px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        {asset.clusterUtilizationPct}% Util.
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-[10px] font-mono text-primary uppercase tracking-wider block truncate">
                        {asset.facility}
                      </span>
                      <h3 className="font-serif font-medium text-white text-sm truncate">
                        {asset.name}
                      </h3>
                    </div>
                  </div>

                  {/* Asset Specs Body */}
                  <div className="p-3 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono uppercase text-outline">
                          Asset Valuation
                        </span>
                        <span className="font-mono text-base font-bold text-on-surface tabular-nums">
                          {maskBalances
                            ? '••••••••'
                            : `$${asset.valuation.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                              })}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-outline">Net Yield</span>
                        <span className="font-mono text-sm font-bold text-tertiary block tabular-nums">
                          {asset.netYieldApy}% APY
                        </span>
                      </div>
                    </div>

                    <div className="p-2 bg-surface rounded border border-border-hairline space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between text-on-surface-variant">
                        <span>Token Price:</span>
                        <span className="text-on-surface font-semibold tabular-nums">
                          ${asset.tokenPrice.toFixed(2)} USD
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-on-surface-variant">
                        <span>Lease Rate:</span>
                        <span className="text-primary font-semibold tabular-nums">
                          ${asset.hourlyRate.toFixed(2)} / hr
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-on-surface-variant">
                        <span>SLA Standard:</span>
                        <span className="text-on-surface truncate max-w-[140px] text-[10px]">
                          {asset.slaStandard}
                        </span>
                      </div>
                    </div>

                    {/* Holding Status Pill */}
                    {(hasTokens || hasLeases) && (
                      <div className="px-2 py-1 bg-tertiary/10 border border-tertiary/20 rounded flex items-center justify-between text-[11px] font-mono text-tertiary">
                        <span>ACTIVE POSITION</span>
                        <span className="font-bold">
                          {hasTokens ? `${holding.tokens} Tokens` : ''}
                          {hasTokens && hasLeases ? ' • ' : ''}
                          {hasLeases ? `${holding.leases.length} Leases` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAction(asset, 'buy')}
                    className="flex-1 py-1.5 bg-primary text-surface hover:bg-primary-hover font-mono text-xs font-bold rounded transition-colors uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Acquire Tokens</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAction(asset, 'lease')}
                    className="flex-1 py-1.5 bg-surface-container-high border border-border-hairline hover:border-tertiary text-on-surface font-mono text-xs rounded transition-colors uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-tertiary" />
                    <span>Lease Compute</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-border-hairline font-mono text-xs text-outline">
        <span>
          Showing {paginatedAssets.length} of {filteredAssets.length} Assets (Page {safeCurrentPage} of {totalPages})
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded bg-surface border border-border-hairline hover:border-primary disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-on-surface" />
          </button>
          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded bg-surface border border-border-hairline hover:border-primary disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-on-surface" />
          </button>
        </div>
      </div>

      {/* Modal Trigger */}
      {actionAsset && (
        <AiActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          asset={actionAsset}
          mode={actionMode}
        />
      )}
    </section>
  );
};
