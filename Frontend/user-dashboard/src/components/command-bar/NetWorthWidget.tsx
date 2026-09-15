import React from 'react';
import { useDashboardStore, type TimeframeOption } from '../../store/useDashboardStore';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { formatMaskedCurrency, TIMEFRAME_PNL_DATA } from '../../lib/calculations';

const TIMEFRAMES: TimeframeOption[] = ['1D', '1W', '1M', '1Y', 'ALL'];

export interface NetWorthWidgetProps {
  maskBalances?: boolean;
  timeframe?: TimeframeOption;
}

export const NetWorthWidget: React.FC<NetWorthWidgetProps> = ({
  maskBalances: propMask,
  timeframe: propTimeframe,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const storeTimeframe = useDashboardStore((s) => s.timeframe);
  const setTimeframe = useDashboardStore((s) => s.setTimeframe);
  const netWorth = usePortfolioStore((s) => s.netWorth);

  const maskBalances = propMask !== undefined ? propMask : storeMask;
  const timeframe = propTimeframe !== undefined ? propTimeframe : storeTimeframe;

  const pnl = TIMEFRAME_PNL_DATA[timeframe] || TIMEFRAME_PNL_DATA['1D'];

  return (
    <div className="flex items-center gap-3 shrink-0" data-testid="net-worth-widget">
      <div className="flex flex-col">
        <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-medium">
          CONSOLIDATED NET ASSETS
        </span>
        <div className="flex items-baseline gap-2">
          <span
            data-testid="net-worth-value"
            className="text-lg sm:text-xl font-bold font-mono tracking-tight tabular-nums text-on-surface"
          >
            {formatMaskedCurrency(netWorth, maskBalances)}
          </span>
          <span
            data-testid="pnl-delta-indicator"
            className={`text-xs font-mono font-medium tabular-nums ${
              pnl.isPositive ? 'text-tertiary' : 'text-error'
            }`}
          >
            {maskBalances ? '••••••••' : pnl.label}
          </span>
        </div>
      </div>

      {/* Dynamic Timeframe Chips */}
      <div
        className="flex items-center bg-[#08090B] border border-border-hairline rounded-DEFAULT p-0.5 ml-2"
        role="group"
        aria-label="Timeframe selector"
      >
        {TIMEFRAMES.map((tf) => {
          const isActive = timeframe === tf;
          return (
            <button
              key={tf}
              type="button"
              data-testid={`timeframe-btn-${tf}`}
              onClick={() => setTimeframe(tf)}
              className={`px-1.5 py-0.5 text-[11px] font-mono rounded-DEFAULT transition-colors ${
                isActive
                  ? 'bg-surface-container text-primary-container font-semibold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              {tf}
            </button>
          );
        })}
      </div>
    </div>
  );
};
