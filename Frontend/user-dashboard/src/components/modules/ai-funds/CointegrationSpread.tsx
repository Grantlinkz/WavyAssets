import React from 'react';
import { Activity } from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';

interface CointegrationSpreadProps {
  maskBalances?: boolean;
}

export const CointegrationSpread: React.FC<CointegrationSpreadProps> = ({
  maskBalances: propMask,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  return (
    <div className="bg-surface-container border border-border-hairline rounded p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary shrink-0" />
          <span className="font-serif font-semibold text-on-surface text-base">
            Statistical Arbitrage Cointegration Spread
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-outline">
            Z-Score: <strong className="text-tertiary tabular-nums">+1.42σ</strong> (Mean: 0.00)
          </span>
          <span className="text-outline">
            Trigger Threshold: <strong className="text-rose-300 tabular-nums">±2.00σ</strong>
          </span>
        </div>
      </div>

      {/* Statistical Monitor Visualization */}
      <div className="mt-4 space-y-3">
        <div className="relative h-14 bg-surface border border-border-hairline rounded p-2 flex flex-col justify-between overflow-hidden">
          {/* Threshold markers */}
          <div
            className="absolute inset-y-0 left-1/2 w-0.5 bg-outline/40"
            title="Mean Equilibrium"
          ></div>
          <div
            className="absolute inset-y-0 left-[20%] w-0.5 bg-rose-500/40 border-l border-dashed border-rose-500"
            title="-2.0 Sigma Lower Band"
          ></div>
          <div
            className="absolute inset-y-0 right-[20%] w-0.5 bg-rose-500/40 border-r border-dashed border-rose-500"
            title="+2.0 Sigma Upper Band"
          ></div>

          {/* Live Spread SVG Curve */}
          <svg className="w-full h-8" fill="none" preserveAspectRatio="none" viewBox="0 0 500 40">
            <path
              d="M0,20 Q60,10 125,25 T250,18 T375,12 T440,8 L500,10"
              fill="none"
              stroke="#53DC98"
              strokeWidth="2"
            ></path>
            <circle
              cx="440"
              cy="8"
              fill="#D4AF37"
              r="4"
              stroke="#08090B"
              strokeWidth="1.5"
            ></circle>
          </svg>

          <div className="flex justify-between text-[9px] font-mono text-outline uppercase tracking-wider">
            <span>-2.0σ Oversold Trigger</span>
            <span>Equilibrium (Z=0.0)</span>
            <span>+2.0σ Overbought Trigger</span>
          </div>
        </div>

        {/* Portfolio Net Exposures Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <div className="p-2.5 bg-surface rounded border border-border-hairline">
            <div className="font-mono text-xs text-outline uppercase">Net Portfolio Delta</div>
            <div className="mt-1 font-mono font-bold text-on-surface text-sm tabular-nums flex items-center justify-between">
              <span>{maskBalances ? '••••••••' : '+0.04 BTC'}</span>
              <span className="text-[10px] text-tertiary">Neutralized</span>
            </div>
          </div>
          <div className="p-2.5 bg-surface rounded border border-border-hairline">
            <div className="font-mono text-xs text-outline uppercase">Gross Notional</div>
            <div className="mt-1 font-mono font-bold text-on-surface text-sm tabular-nums">
              {maskBalances ? '••••••••' : '$2,102,500.00'}
            </div>
          </div>
          <div className="p-2.5 bg-surface rounded border border-border-hairline">
            <div className="font-mono text-xs text-outline uppercase">Net Exposure</div>
            <div className="mt-1 font-mono font-bold text-tertiary text-sm tabular-nums flex items-center justify-between">
              <span>{maskBalances ? '••••••••' : '$142,000.00'}</span>
              <span className="text-[10px] text-outline">6.7%</span>
            </div>
          </div>
          <div className="p-2.5 bg-surface rounded border border-border-hairline">
            <div className="font-mono text-xs text-outline uppercase">Daily Funding Delta</div>
            <div className="mt-1 font-mono font-bold text-tertiary text-sm tabular-nums">
              {maskBalances ? '••••••••' : '+$480.00 / day'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
