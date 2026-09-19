import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { OrderBookTable } from './OrderBookTable';
import { PositionAnalytics } from './PositionAnalytics';
import { ActiveOrdersHub } from './ActiveOrdersHub';
import { STOCKS_HOLDINGS_DATA } from '../../../lib/liquidAssetData';
import { useLiquidStore } from '../../../store/useLiquidStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { formatMaskedCurrency } from '../../../lib/calculations';

interface StocksModuleProps {
  maskBalances?: boolean;
}

export const StocksModule: React.FC<StocksModuleProps> = ({ maskBalances: propMask }) => {
  const { selectedStock, setSelectedStock, isPreMarket, dripSettings } = useLiquidStore();
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  // Dynamically compute accurate values directly from STOCKS_HOLDINGS_DATA
  const totalEquitiesNav = React.useMemo(() => {
    return STOCKS_HOLDINGS_DATA.reduce((sum, s) => sum + s.shares * s.currentMark, 0);
  }, []);

  const totalCostBasis = React.useMemo(() => {
    return STOCKS_HOLDINGS_DATA.reduce((sum, s) => sum + s.shares * s.entryMark, 0);
  }, []);

  const totalUnrealizedPnl = React.useMemo(() => {
    return STOCKS_HOLDINGS_DATA.reduce((sum, s) => sum + s.unrealizedPnl, 0);
  }, []);

  const totalPnlPct = totalCostBasis > 0 ? (totalUnrealizedPnl / totalCostBasis) * 100 : 0;

  const listedDmaVal = React.useMemo(() => {
    return STOCKS_HOLDINGS_DATA.filter((s) => !s.isPreIpo).reduce(
      (sum, s) => sum + s.shares * s.currentMark,
      0
    );
  }, []);

  const preIpoVal = React.useMemo(() => {
    return STOCKS_HOLDINGS_DATA.filter((s) => s.isPreIpo).reduce(
      (sum, s) => sum + s.shares * s.currentMark,
      0
    );
  }, []);

  const listedDmaPct = totalEquitiesNav > 0 ? (listedDmaVal / totalEquitiesNav) * 100 : 0;
  const preIpoPct = totalEquitiesNav > 0 ? (preIpoVal / totalEquitiesNav) * 100 : 0;
  const extendedHoursGain = totalEquitiesNav * 0.0018;

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
              17.4% PORTFOLIO
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
            Realized MTD: {maskBalances ? '••••••••' : '+$48,150.00'} • Beta 0.94
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
                  +0.18%
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
            <span className="text-[10px] font-mono text-outline">2 POOLS</span>
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

      {/* Holdings Blotter with Asset Selection */}
      <section className="bg-surface-container-low rounded-DEFAULT border border-border-hairline overflow-hidden">
        <div className="p-3.5 bg-surface-container flex items-center justify-between border-b border-border-hairline">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-secondary" />
            <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-on-surface">
              Direct Market Access Equities & Pre-IPO SPVs
            </h2>
          </div>
          <span className="text-[10px] font-mono text-outline uppercase bg-surface-container-high px-2 py-0.5 rounded-DEFAULT">
            CLICK ROW TO FOCUS ORDER BOOK
          </span>
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
                <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
                <th className="py-2.5 px-3 text-right">P&L (%)</th>
                <th className="py-2.5 px-3 text-center">DRIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline font-sans text-xs">
              {STOCKS_HOLDINGS_DATA.map((stock) => {
                const isSelected = selectedStock === stock.symbol;
                return (
                  <tr
                    key={stock.symbol}
                    data-testid={`stock-row-${stock.symbol}`}
                    onClick={() => setSelectedStock(stock.symbol)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-surface-container-high/80 border-l-2 border-primary'
                        : 'hover:bg-surface-container/60'
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            stock.isPreIpo ? 'bg-primary' : 'bg-secondary'
                          }`}
                        />
                        <div>
                          <span className="font-bold text-on-surface font-mono tracking-tight block">
                            {stock.symbol}
                          </span>
                          <span className="text-[10px] text-outline font-mono">
                            {stock.name}
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

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold whitespace-nowrap text-tertiary">
                      {maskBalances
                        ? '••••••••'
                        : `+${formatMaskedCurrency(stock.unrealizedPnl, false)}`}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-medium whitespace-nowrap text-tertiary">
                      {maskBalances ? '••••' : `+${stock.pnlPct.toFixed(2)}%`}
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
              })}
            </tbody>
          </table>
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
