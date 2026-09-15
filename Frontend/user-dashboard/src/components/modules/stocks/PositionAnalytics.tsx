import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { useLiquidStore } from '../../../store/useLiquidStore';

import { STOCKS_HOLDINGS_DATA } from '../../../lib/liquidAssetData';
import { useDashboardStore } from '../../../store/useDashboardStore';

export const PositionAnalytics: React.FC<{ maskBalances?: boolean }> = ({ maskBalances: propMask }) => {
  const { selectedStock, dripSettings, toggleDrip, isPreMarket, togglePreMarket } = useLiquidStore();
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const dripActive = dripSettings[selectedStock] ?? false;
  const holding = STOCKS_HOLDINGS_DATA.find((s) => s.symbol === selectedStock) || STOCKS_HOLDINGS_DATA[0];
  const beta = holding.beta.toFixed(2);
  const vwap = holding.entryMark.toFixed(2);
  const pnlPct = holding.pnlPct.toFixed(1);

  return (
    <div className="bg-surface-container-low rounded-DEFAULT border border-border-hairline p-4 space-y-4" data-testid="position-analytics">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-secondary" />
          <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-on-surface">
            Institutional Position Analytics & DRIP Controls
          </h2>
        </div>
        <button
          type="button"
          data-testid="pre-market-toggle-btn"
          onClick={togglePreMarket}
          className={`px-2 py-0.5 rounded-DEFAULT text-[10px] font-mono font-bold transition-colors cursor-pointer ${
            isPreMarket
              ? 'bg-tertiary/15 text-tertiary border border-tertiary/30'
              : 'bg-surface-container text-outline border border-border-hairline'
          }`}
        >
          {isPreMarket ? 'PRE-MARKET LIVE' : 'REGULAR HOURS'}
        </button>
      </div>

      {/* Grid of Key Quant Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
        <div className="p-2.5 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
          <span className="text-[10px] text-outline uppercase block">Beta (vs S&P 500)</span>
          <span className="text-base font-bold text-on-surface tabular-nums mt-0.5 block">{beta}</span>
          <span className="text-[10px] text-tertiary">{holding.isPreIpo ? 'Pre-IPO Allocation' : 'Defensive Tech'}</span>
        </div>

        <div className="p-2.5 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
          <span className="text-[10px] text-outline uppercase block">VWAP (30D)</span>
          <span className="text-base font-bold text-on-surface tabular-nums mt-0.5 block">
            {maskBalances ? '••••' : `$${vwap}`}
          </span>
          <span className="text-[10px] text-tertiary">
            {maskBalances ? '•••• vs Entry' : `+${pnlPct}% vs Entry`}
          </span>
        </div>

        <div className="p-2.5 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
          <span className="text-[10px] text-outline uppercase block">52-Week Range</span>
          <span className="text-base font-bold text-on-surface tabular-nums mt-0.5 block">
            {holding.symbol === 'NVDA' ? '$45 - $140' : holding.symbol === 'MSFT' ? '$310 - $468' : holding.symbol === 'SPACEX' ? '$520 - $850' : '$900 - $1,550'}
          </span>
          <span className="text-[10px] text-outline">98.2% of Peak</span>
        </div>

        <div className="p-2.5 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
          <span className="text-[10px] text-outline uppercase block">Dividend Yield</span>
          <span className="text-base font-bold text-tertiary tabular-nums mt-0.5 block">
            {holding.isPreIpo ? '0.00%' : '0.85%'}
          </span>
          <span className="text-[10px] text-outline">{holding.isPreIpo ? 'Capital Appreciation' : 'Next: 15 Oct'}</span>
        </div>
      </div>

      {/* DRIP (Dividend Reinvestment Plan) Controller */}
      <div className="p-3 bg-surface-container rounded-DEFAULT border border-border-hairline flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-primary" />
          <div>
            <span className="font-mono text-xs font-semibold text-on-surface block">
              Automated Dividend Re-Investment Plan (DRIP)
            </span>
            <span className="text-[11px] font-sans text-outline">
              Automatically deploy dividend payouts into fractional DMA shares at market open without execution commission.
            </span>
          </div>
        </div>

        <button
          type="button"
          data-testid="toggle-drip-btn"
          onClick={() => toggleDrip(selectedStock)}
          className={`px-3 py-1 rounded-DEFAULT text-xs font-mono font-bold transition-all cursor-pointer ${
            dripActive
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container-high text-outline border border-border-hairline'
          }`}
        >
          {dripActive ? 'DRIP ACTIVE' : 'DRIP OFF'}
        </button>
      </div>
    </div>
  );
};
