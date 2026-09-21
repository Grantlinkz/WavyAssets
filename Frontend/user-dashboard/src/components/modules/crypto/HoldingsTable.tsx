import React, { useState, useMemo, useEffect } from 'react';
import { Shield, ExternalLink, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CRYPTO_HOLDINGS_DATA,
  INITIAL_DCA_SCHEDULES,
  type CustodyBadge,
} from '../../../lib/liquidAssetData';
import { formatMaskedCurrency } from '../../../lib/calculations';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useLiquidStore } from '../../../store/useLiquidStore';
import { fetchLiveCryptoPrices, calculateLiveHoldingMetrics } from '../../../lib/priceService';

const getBadgeStyles = (type: CustodyBadge) => {
  switch (type) {
    case 'Global_CUSTODY':
      return 'bg-primary/15 border-primary/30 text-primary';
    case 'STAKING_LOCKUP':
      return 'bg-tertiary/15 border-tertiary/30 text-tertiary';
    case 'EXTERNAL_WEB3':
      return 'bg-secondary/15 border-secondary/30 text-secondary';
    default:
      return 'bg-surface-container text-outline';
  }
};

export const HoldingsTable: React.FC<{ maskBalances?: boolean }> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const {
    dcaSchedules,
    targetDcaAsset,
    setTargetDcaAsset,
    livePrices,
    setLivePrices,
  } = useLiquidStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchLiveCryptoPrices().then((prices) => {
      setLivePrices(prices);
    });
  }, [setLivePrices]);

  const activeScheduleMap = useMemo(() => {
    const map: Record<string, number> = {};
    const effectiveSchedules =
      dcaSchedules.length > 0
        ? dcaSchedules.filter((s) => s.active)
        : INITIAL_DCA_SCHEDULES.filter((s) => s.active);

    effectiveSchedules.forEach((s) => {
      map[s.asset] = (map[s.asset] || 0) + s.amountUsd;
    });
    return map;
  }, [dcaSchedules]);

  const liveHoldings = useMemo(() => {
    return CRYPTO_HOLDINGS_DATA.map((item) => {
      const balanceUsd = activeScheduleMap[item.symbol] || 0;
      const metrics = calculateLiveHoldingMetrics(
        item.symbol,
        balanceUsd,
        livePrices[item.symbol]
      );
      return {
        ...item,
        balance: metrics.units,
        balanceUsd,
        spotPrice: metrics.spotPrice,
        entryPrice: metrics.entryMark,
        unrealizedPnl: metrics.unrealizedPnl,
        pnlPct: metrics.pnlPct,
      };
    });
  }, [activeScheduleMap, livePrices]);

  const filteredHoldings = useMemo(() => {
    if (!searchQuery.trim()) return liveHoldings;
    const q = searchQuery.toLowerCase().trim();
    return liveHoldings.filter(
      (item) =>
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.enclave.toLowerCase().includes(q) ||
        item.custodyLabel.toLowerCase().includes(q)
    );
  }, [searchQuery, liveHoldings]);

  const totalPages = Math.max(1, Math.ceil(filteredHoldings.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedHoldings = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredHoldings.slice(start, start + PAGE_SIZE);
  }, [filteredHoldings, safeCurrentPage]);

  return (
    <div className="bg-surface-container-low rounded-DEFAULT border border-border-hairline overflow-hidden" data-testid="crypto-holdings-table">
      {/* Table Header Controls with Search */}
      <div className="p-3.5 bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary shrink-0" />
          <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-on-surface">
            Live Spot Holdings &amp; Global Custody Matrix
          </h2>
        </div>

        {/* Search Bar matching symbol (BTC) or name (Bitcoin) */}
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
            <input
              type="text"
              data-testid="crypto-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search symbol (BTC) or name (Bitcoin)..."
              aria-label="Search crypto holdings"
              className="w-full pl-8 pr-7 py-1.5 bg-surface border border-border-hairline rounded text-xs font-mono text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
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
        </div>
      </div>

      {/* Dense Institutional Blotter */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-border-hairline text-[10px] text-outline uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Asset / Contract</th>
              <th className="py-2.5 px-3 font-semibold">Custody Badge</th>
              <th className="py-2.5 px-3 text-right font-semibold">Balance</th>
              <th className="py-2.5 px-3 text-right font-semibold">Entry Mark</th>
              <th className="py-2.5 px-3 text-right font-semibold">Spot Price</th>
              <th className="py-2.5 px-3 text-right font-semibold">Unrealized P&amp;L</th>
              <th className="py-2.5 px-3 text-right font-semibold">P&amp;L (%)</th>
              <th className="py-2.5 px-3 text-center font-semibold">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-hairline font-sans text-xs">
            {paginatedHoldings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-outline font-mono text-xs">
                  No crypto assets matching &ldquo;{searchQuery}&rdquo;
                </td>
              </tr>
            ) : (
              paginatedHoldings.map((item) => {
                return (
                  <tr
                    key={item.symbol}
                    className={`hover:bg-surface-container/60 transition-colors ${
                      targetDcaAsset === item.symbol ? 'bg-primary/5' : ''
                    }`}
                    data-testid={`crypto-holding-row-${item.symbol}`}
                  >
                    <td
                      className="py-3 px-4 whitespace-nowrap cursor-pointer group"
                      data-testid={`crypto-asset-contract-cell-${item.symbol}`}
                      onClick={() => {
                        setTargetDcaAsset(item.symbol);
                        const dcaElem = document.querySelector('[data-testid="dca-scheduler"]');
                        if (dcaElem) {
                          dcaElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }}
                      title={`Click to target ${item.name} in DCA Scheduler`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            targetDcaAsset === item.symbol ? 'bg-primary scale-125' : 'bg-primary'
                          } group-hover:scale-125 transition-transform`}
                        />
                        <div>
                          <span className="font-bold text-on-surface font-mono tracking-tight block group-hover:text-primary transition-colors">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-outline font-mono flex items-center gap-1">
                            <span>{item.enclave}</span>
                            <span className="text-primary/70 text-[9px] font-sans opacity-0 group-hover:opacity-100 transition-opacity">
                              • Target in DCA
                            </span>
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        data-testid={`custody-badge-${item.symbol}`}
                        className={`px-1.5 py-0.5 rounded-xs border text-[10px] font-mono font-semibold ${getBadgeStyles(
                          item.custodyType
                        )}`}
                      >
                        {item.custodyLabel}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-on-surface font-medium whitespace-nowrap">
                      <div>
                        {maskBalances
                          ? '••••••••'
                          : item.balanceUsd > 0
                            ? item.balance < 1
                              ? `${item.balance.toFixed(4)} ${item.unit}`
                              : `${item.balance.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 4,
                                })} ${item.unit}`
                            : `0 ${item.unit}`}
                      </div>
                      <div className="text-[10px] text-outline">
                        {formatMaskedCurrency(item.balanceUsd, maskBalances)}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-outline whitespace-nowrap">
                      {formatMaskedCurrency(item.entryPrice, maskBalances)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-on-surface font-semibold whitespace-nowrap">
                      {formatMaskedCurrency(item.spotPrice, maskBalances)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold whitespace-nowrap text-tertiary">
                      {maskBalances
                        ? '••••••••'
                        : item.balanceUsd > 0
                          ? `+${formatMaskedCurrency(item.unrealizedPnl, false)}`
                          : '$0.00'}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-medium whitespace-nowrap text-tertiary">
                      {maskBalances
                        ? '••••'
                        : item.balanceUsd > 0
                          ? `+${item.pnlPct.toFixed(2)}%`
                          : '—'}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded-xs bg-tertiary/10 text-tertiary text-[10px] font-mono font-bold border border-tertiary/30">
                        {item.riskRating}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-3 bg-surface-container border-t border-border-hairline flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="text-outline text-[11px]">
          Showing{' '}
          <span className="text-on-surface font-semibold">
            {filteredHoldings.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1}
          </span>
          -
          <span className="text-on-surface font-semibold">
            {Math.min(safeCurrentPage * PAGE_SIZE, filteredHoldings.length)}
          </span>{' '}
          of{' '}
          <span className="text-on-surface font-semibold">{filteredHoldings.length}</span>{' '}
          crypto assets &amp; validators
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="crypto-pagination-prev"
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
            data-testid="crypto-pagination-next"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 rounded bg-surface border border-border-hairline text-outline hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 text-[11px]"
          >
            <span>NEXT</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Footer Status */}
      <div className="p-2.5 bg-surface-container-lowest border-t border-border-hairline flex items-center justify-between text-[11px] font-mono text-outline">
        <span>SETTLEMENT: ZERO-KNOWLEDGE PROOF OF RESERVES VERIFIED</span>
        <span className="flex items-center gap-1 text-primary cursor-pointer hover:underline">
          <span>Audit Log</span>
          <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
