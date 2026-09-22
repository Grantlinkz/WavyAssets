import React, { useState, useMemo } from 'react';
import { TrendingUp, BarChart3, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { OrderBookTable } from './OrderBookTable';
import { PositionAnalytics } from './PositionAnalytics';
import { ActiveOrdersHub } from './ActiveOrdersHub';
import { STOCKS_HOLDINGS_DATA } from '../../../lib/liquidAssetData';
import { useLiquidStore } from '../../../store/useLiquidStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import { formatMaskedCurrency, isSsrOrTestEnv } from '../../../lib/calculations';

interface StocksModuleProps {
  maskBalances?: boolean;
}

export const StocksModule: React.FC<StocksModuleProps> = ({ maskBalances: propMask }) => {
  const { selectedStock, setSelectedStock, isPreMarket, dripSettings } = useLiquidStore();
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const storeNetWorth = usePortfolioStore((s) => s.netWorth);

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const storeActiveOrders = useLiquidStore((s) => s.activeOrders);
  const isSsr = isSsrOrTestEnv();
  const activeOrders = isSsr ? useLiquidStore.getState().activeOrders : storeActiveOrders;
  const netWorth = isSsr ? usePortfolioStore.getState().netWorth : storeNetWorth;

  // Map user active limit orders by ticker symbol
  const activeOrderMap = useMemo(() => {
    const map: Record<
      string,
      { totalShares: number; totalCostBasis: number; avgLimitPrice: number; orderCount: number }
    > = {};
    activeOrders
      .filter((o) => o.status !== 'CANCELLED')
      .forEach((order) => {
        const existing = map[order.symbol] || {
          totalShares: 0,
          totalCostBasis: 0,
          avgLimitPrice: 0,
          orderCount: 0,
        };
        existing.totalShares += order.shares;
        existing.totalCostBasis += order.shares * order.limitPrice;
        existing.orderCount += 1;
        existing.avgLimitPrice =
          existing.totalShares > 0
            ? existing.totalCostBasis / existing.totalShares
            : order.limitPrice;
        map[order.symbol] = existing;
      });
    return map;
  }, [activeOrders]);

  // Dynamically compute user's stock holdings reflecting Active Limit Orders & Execution Desk
  const dynamicStocks = useMemo(() => {
    return STOCKS_HOLDINGS_DATA.map((s) => {
      const orderData = activeOrderMap[s.symbol];
      const userShares = orderData ? orderData.totalShares : 0;
      const entryMark =
        orderData && orderData.totalShares > 0 ? orderData.avgLimitPrice : s.entryMark;
      const currentMark = s.currentMark;
      const unrealizedPnl =
        userShares > 0 ? Number(((currentMark - entryMark) * userShares).toFixed(2)) : 0;
      const pnlPct =
        userShares > 0 && entryMark > 0
          ? Number((((currentMark - entryMark) / entryMark) * 100).toFixed(2))
          : 0;

      return {
        ...s,
        shares: userShares,
        entryMark,
        currentMark,
        unrealizedPnl,
        pnlPct,
      };
    });
  }, [activeOrderMap]);

  const heldStocks = useMemo(() => dynamicStocks.filter((s) => s.shares > 0), [dynamicStocks]);

  const totalEquitiesNav = useMemo(() => {
    return heldStocks.reduce((sum, s) => sum + s.shares * s.currentMark, 0);
  }, [heldStocks]);

  // Synchronize equities allocation with portfolio store
  React.useEffect(() => {
    usePortfolioStore.getState().updateAllocation('stocks', totalEquitiesNav);
  }, [totalEquitiesNav]);

  const totalCostBasis = useMemo(() => {
    return heldStocks.reduce((sum, s) => sum + s.shares * s.entryMark, 0);
  }, [heldStocks]);

  const totalUnrealizedPnl = useMemo(() => {
    return heldStocks.reduce((sum, s) => sum + s.unrealizedPnl, 0);
  }, [heldStocks]);

  const totalPnlPct = totalCostBasis > 0 ? (totalUnrealizedPnl / totalCostBasis) * 100 : 0;

  const listedDmaVal = useMemo(() => {
    return heldStocks
      .filter((s) => !s.isPreIpo)
      .reduce((sum, s) => sum + s.shares * s.currentMark, 0);
  }, [heldStocks]);

  const preIpoVal = useMemo(() => {
    return heldStocks
      .filter((s) => s.isPreIpo)
      .reduce((sum, s) => sum + s.shares * s.currentMark, 0);
  }, [heldStocks]);

  const listedDmaPct = totalEquitiesNav > 0 ? (listedDmaVal / totalEquitiesNav) * 100 : 0;
  const preIpoPct = totalEquitiesNav > 0 ? (preIpoVal / totalEquitiesNav) * 100 : 0;
  const extendedHoursGain = totalEquitiesNav * 0.0018;
  const effectiveNetWorth = netWorth > 0 ? netWorth : totalEquitiesNav;
  const equitiesPortfolioPct =
    effectiveNetWorth > 0 ? (totalEquitiesNav / effectiveNetWorth) * 100 : 0;

  const weightedBeta = useMemo(() => {
    if (totalEquitiesNav <= 0) return 0.94;
    const weightedSum = heldStocks.reduce(
      (sum, s) => sum + s.beta * s.shares * s.currentMark,
      0
    );
    return weightedSum / totalEquitiesNav;
  }, [heldStocks, totalEquitiesNav]);

  const activePoolsCount = (listedDmaVal > 0 ? 1 : 0) + (preIpoVal > 0 ? 1 : 0);

  // Search Filtering: Matches ticker/symbol OR company name (e.g. AMZN or Amazon)
  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return dynamicStocks;
    const q = searchQuery.toLowerCase().trim();
    return dynamicStocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.isPreIpo ? 'pre-ipo spv' : 'listed dma').includes(q)
    );
  }, [searchQuery, dynamicStocks]);

  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedStocks = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredStocks.slice(start, start + PAGE_SIZE);
  }, [filteredStocks, safeCurrentPage]);

  return (
    <div
      data-testid="stocks-module"
      className="min-h-[540px] w-full space-y-6 select-none"
    >
      {/* 4-KPI Institutional Summary Ribbon */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* KPI 1: Equities NAV */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest block">
                GLOBAL EQUITIES NAV
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-mono font-bold text-on-surface tabular-nums">
                  {formatMaskedCurrency(totalEquitiesNav, maskBalances)}
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 bg-secondary/10 text-secondary text-[10px] font-mono rounded-DEFAULT uppercase">
              {equitiesPortfolioPct.toFixed(1)}% PORTFOLIO
            </span>
          </div>
          <div className="text-[11px] font-mono text-outline mt-2">
            DTCC / Euroclear CH Segregated Vault
          </div>
        </div>

        {/* KPI 2: Day Gain */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest block">
                DAY GAIN / UNREALIZED P&L
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-mono font-bold text-tertiary tabular-nums">
                  {maskBalances
                    ? '••••••••'
                    : `+$${totalUnrealizedPnl.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </span>
              </div>
            </div>
            <span className="flex items-center gap-0.5 text-xs font-mono text-tertiary font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              +{totalPnlPct.toFixed(2)}%
            </span>
          </div>
          <div className="text-[11px] font-mono text-outline mt-2">
            Realized MTD: {maskBalances ? '••••••••' : totalEquitiesNav > 0 ? '+$48,150.00' : '$0.00'} • Beta {weightedBeta.toFixed(2)}
          </div>
        </div>

        {/* KPI 3: Extended Hours */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest block">
                EXTENDED TRADING HOURS
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-mono font-bold text-on-surface tabular-nums">
                  {totalEquitiesNav > 0 ? '+0.18%' : '+0.00%'}
                </span>
                <span className="text-xs font-mono text-tertiary">
                  {maskBalances ? '••••••' : `+$${extendedHoursGain.toFixed(2)}`}
                </span>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-mono text-tertiary">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              {isPreMarket ? 'PRE-MARKET' : 'OPEN'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-outline mt-2">
            NASDAQ Session Open: 09:30 EST
          </div>
        </div>

        {/* KPI 4: Public vs Pre-IPO Split */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-mono text-outline uppercase tracking-widest block">
              LIQUIDITY VERTICAL SPLIT
            </span>
            <span className="text-[10px] font-mono text-outline">{activePoolsCount} POOLS</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-on-surface">Listed DMA ({listedDmaPct.toFixed(1)}%)</span>
              <span className="text-primary">Pre-IPO SPVs ({preIpoPct.toFixed(1)}%)</span>
            </div>
            <div className="h-2 w-full bg-surface-container-lowest rounded-DEFAULT flex overflow-hidden gap-0.5">
              <div className="h-full bg-secondary" style={{ width: `${listedDmaPct.toFixed(1)}%` }} />
              <div className="h-full bg-primary" style={{ width: `${preIpoPct.toFixed(1)}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Holdings Blotter with Asset Selection, Search, and Pagination */}
      <section className="bg-surface-container-low rounded-DEFAULT border border-border-hairline overflow-hidden">
        <div className="p-3.5 bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-hairline">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-secondary shrink-0" />
            <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-on-surface">
              Direct Market Access Equities &amp; Pre-IPO SPVs
            </h2>
          </div>

          {/* Search Bar matching symbol or company name */}
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
              <input
                type="text"
                data-testid="stocks-search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search symbol (AMZN) or name (Amazon)..."
                aria-label="Search equities and SPVs"
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-border-hairline text-[10px] text-outline uppercase tracking-wider">
                <th className="py-2.5 px-4">Ticker / Name</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3 text-right">Shares / Qty</th>
                <th className="py-2.5 px-3 text-right">Entry Mark</th>
                <th className="py-2.5 px-3 text-right">Current Mark</th>
                <th className="py-2.5 px-3 text-right">Unrealized P&amp;L</th>
                <th className="py-2.5 px-3 text-right">P&amp;L (%)</th>
                <th className="py-2.5 px-3 text-center">DRIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline font-sans text-xs">
              {paginatedStocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-outline font-mono text-xs">
                    No global stocks or SPVs matching &ldquo;{searchQuery}&rdquo;
                  </td>
                </tr>
              ) : (
                paginatedStocks.map((stock) => {
                  const isSelected = selectedStock === stock.symbol;
                  return (
                    <tr
                      key={stock.symbol}
                      data-testid={`stock-row-${stock.symbol}`}
                      onClick={() => {
                        setSelectedStock(stock.symbol);
                        const desk = document.querySelector('[data-testid="active-orders-hub"]');
                        if (desk) {
                          desk.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-container-high/80 border-l-2 border-primary'
                          : 'hover:bg-surface-container/60'
                      }`}
                    >
                      <td
                        className="py-3 px-4 whitespace-nowrap cursor-pointer group"
                        data-testid={`stock-ticker-cell-${stock.symbol}`}
                        title={`Click to target ${stock.symbol} in Execution Desk`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              stock.isPreIpo ? 'bg-primary' : 'bg-secondary'
                            }`}
                          />
                          <div>
                            <span className="font-bold text-on-surface font-mono tracking-tight block group-hover:text-primary transition-colors">
                              {stock.symbol}
                            </span>
                            <span className="text-[10px] text-outline font-mono flex items-center gap-1">
                              <span>{stock.name}</span>
                              <span className="text-primary/70 text-[9px] font-sans opacity-0 group-hover:opacity-100 transition-opacity">
                                • Target in Desk
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-semibold border ${
                            stock.isPreIpo
                              ? 'bg-primary/15 border-primary/30 text-primary'
                              : 'bg-secondary/15 border-secondary/30 text-secondary'
                          }`}
                        >
                          {stock.isPreIpo ? 'PRE-IPO SPV' : 'LISTED DMA'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-on-surface whitespace-nowrap">
                        {maskBalances ? '•••• SHRS' : `${stock.shares.toLocaleString()} SHRS`}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-outline whitespace-nowrap">
                        {maskBalances ? '••••' : `$${stock.entryMark.toFixed(2)}`}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-on-surface font-semibold whitespace-nowrap">
                        ${stock.currentMark.toFixed(2)}
                      </td>

                      <td
                        className={`py-3 px-3 text-right font-mono tabular-nums font-semibold whitespace-nowrap ${
                          stock.unrealizedPnl < 0 ? 'text-error' : 'text-tertiary'
                        }`}
                      >
                        {maskBalances
                          ? '••••••••'
                          : stock.shares > 0
                            ? `${stock.unrealizedPnl > 0 ? '+' : ''}${formatMaskedCurrency(stock.unrealizedPnl, false)}`
                            : '$0.00'}
                      </td>

                      <td
                        className={`py-3 px-3 text-right font-mono tabular-nums font-medium whitespace-nowrap ${
                          stock.pnlPct < 0 ? 'text-error' : 'text-tertiary'
                        }`}
                      >
                        {maskBalances
                          ? '••••'
                          : stock.shares > 0
                            ? `${stock.pnlPct > 0 ? '+' : ''}${stock.pnlPct.toFixed(2)}%`
                            : '—'}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {(() => {
                          const isDripOn = dripSettings[stock.symbol] ?? stock.dripEnabled;
                          return (
                            <span
                              className={`px-1.5 py-0.2 rounded-xs text-[10px] font-mono font-bold ${
                                isDripOn
                                  ? 'bg-tertiary/10 text-tertiary border border-tertiary/30'
                                  : 'bg-surface-container text-outline'
                              }`}
                            >
                              {isDripOn ? 'AUTO' : 'OFF'}
                            </span>
                          );
                        })()}
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
              {filteredStocks.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1}
            </span>
            -
            <span className="text-on-surface font-semibold">
              {Math.min(safeCurrentPage * PAGE_SIZE, filteredStocks.length)}
            </span>{' '}
            of{' '}
            <span className="text-on-surface font-semibold">{filteredStocks.length}</span>{' '}
            global equities &amp; SPVs
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="stocks-pagination-prev"
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
              data-testid="stocks-pagination-next"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1 rounded bg-surface border border-border-hairline text-outline hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 text-[11px]"
            >
              <span>NEXT</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Lower 2-Column Split: DMA Level-2 Order Book & Position Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OrderBookTable />
        <PositionAnalytics maskBalances={maskBalances} />
      </section>

      {/* Active Orders Desk */}
      <ActiveOrdersHub maskBalances={maskBalances} />
    </div>
  );
};
