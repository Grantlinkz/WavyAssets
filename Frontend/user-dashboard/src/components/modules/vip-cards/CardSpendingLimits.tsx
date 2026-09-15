import React, { useState } from 'react';
import { CreditCard, Sliders, ShieldCheck } from 'lucide-react';
import { formatMaskedCurrency } from '../../../lib/calculations';
import { useDashboardStore } from '../../../store/useDashboardStore';

interface CardSpendingLimitsProps {
  maskBalances?: boolean;
}

export const CardSpendingLimits: React.FC<CardSpendingLimitsProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const [dailyLimit, setDailyLimit] = useState<number>(500000);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateNotice, setUpdateNotice] = useState<string | null>(null);

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDailyLimit(Number(e.target.value));
  };

  const handleCommitLimit = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setUpdateNotice('Daily spending cap committed to HSM Enclave.');
      setTimeout(() => setUpdateNotice(null), 3000);
    }, 600);
  };

  return (
    <div
      data-testid="card-spending-limits-panel"
      className="bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-5 flex flex-col justify-between space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-on-surface">
            Card Spending Caps & Liquidity Reserve Rails
          </h2>
        </div>
        <span className="text-[10px] font-mono text-tertiary bg-tertiary/10 border border-tertiary/30 px-2 py-0.5 rounded-DEFAULT">
          COLLATERALIZED 1:1
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
            Daily Single-Swipe Cap
          </span>
          <div className="font-mono text-lg font-bold text-on-surface tabular-nums mt-1">
            {formatMaskedCurrency(dailyLimit, maskBalances)}
          </div>
          <span className="font-mono text-[10px] text-tertiary mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            2-of-3 HSM Guarded
          </span>
        </div>

        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
            Available Today
          </span>
          <div className="font-mono text-lg font-bold text-primary tabular-nums mt-1">
            {formatMaskedCurrency(428650.0, maskBalances)}
          </div>
          <span className="font-mono text-[10px] text-outline mt-1">
            Settled Real-Time DvP
          </span>
        </div>

        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
            30-Day Billing Total
          </span>
          <div className="font-mono text-lg font-bold text-on-surface tabular-nums mt-1">
            {formatMaskedCurrency(142390.0, maskBalances)}
          </div>
          <span className="font-mono text-[10px] text-tertiary mt-1">
            Geneva Vault: 0.00% Risk
          </span>
        </div>
      </div>

      {/* Interactive Spending Cap Slider */}
      <div className="p-3.5 bg-surface-container rounded-DEFAULT border border-border-hairline space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-1.5 text-on-surface font-semibold">
            <Sliders className="w-3.5 h-3.5 text-secondary" />
            <span>Adjust Active Daily Allowance</span>
          </div>
          <span className="text-secondary font-bold tabular-nums">
            {formatMaskedCurrency(dailyLimit, maskBalances)} / Day
          </span>
        </div>

        <input
          type="range"
          min="50000"
          max="2000000"
          step="50000"
          data-testid="daily-limit-slider"
          value={dailyLimit}
          onChange={handleLimitChange}
          className="w-full h-1.5 bg-surface-container-high rounded-DEFAULT appearance-none cursor-pointer accent-primary"
        />

        <div className="flex items-center justify-between text-[10px] font-mono text-outline">
          <span>Min: $50,000</span>
          <span>Baseline: $500,000</span>
          <span>Max: $2,000,000</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          {updateNotice ? (
            <span className="text-xs font-mono text-tertiary font-medium">
              {updateNotice}
            </span>
          ) : (
            <span className="text-[11px] font-sans text-outline">
              Requires YubiKey hardware confirmation for caps above $1,000,000.
            </span>
          )}

          <button
            type="button"
            data-testid="commit-limit-btn"
            disabled={isUpdating}
            onClick={handleCommitLimit}
            className="px-3 py-1 bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono text-xs font-bold uppercase rounded-DEFAULT transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? 'Committing...' : 'Commit Cap'}
          </button>
        </div>
      </div>
    </div>
  );
};
