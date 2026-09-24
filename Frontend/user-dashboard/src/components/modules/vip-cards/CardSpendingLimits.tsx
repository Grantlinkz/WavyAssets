import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Sliders, ShieldCheck } from 'lucide-react';
import { formatMaskedCurrency, isSsrOrTestEnv } from '../../../lib/calculations';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import { useLiquidStore } from '../../../store/useLiquidStore';
import { updateCardSpendingLimitApi } from '../../../lib/api';

interface CardSpendingLimitsProps {
  maskBalances?: boolean;
}

const KYC_TIER_CONFIG = {
  TIER_1: { min: 1000, max: 10000, step: 1000, label: 'Tier 1 (Basic)' },
  TIER_2: { min: 10000, max: 250000, step: 10000, label: 'Tier 2 (Gov ID Verified)' },
  TIER_3: { min: 50000, max: 2000000, step: 50000, label: 'Tier 3 (Proof of Address / Utility)' },
} as const;

export const CardSpendingLimits: React.FC<CardSpendingLimitsProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const isSsr = isSsrOrTestEnv();
  const storeUser = useAuthStore((s) => s.user);
  const storeAvailableCash = usePortfolioStore((s) => s.availableCash);
  const storeTransactions = useLiquidStore((s) => s.transactions);

  const user = isSsr ? useAuthStore.getState().user : storeUser;
  const availableCash = isSsr ? usePortfolioStore.getState().availableCash : storeAvailableCash;
  const transactions = isSsr ? useLiquidStore.getState().transactions : storeTransactions;

  const kycTier = user?.kycTier || 'TIER_2';
  const tierConfig = KYC_TIER_CONFIG[kycTier] || KYC_TIER_CONFIG.TIER_2;

  const [dailyLimit, setDailyLimit] = useState<number>(tierConfig.max);

  // Clamp dailyLimit if KYC tier changes
  useEffect(() => {
    setDailyLimit((prev) => {
      if (prev > tierConfig.max) return tierConfig.max;
      if (prev < tierConfig.min) return tierConfig.min;
      return prev;
    });
  }, [tierConfig.max, tierConfig.min]);

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateNotice, setUpdateNotice] = useState<string | null>(null);

  const availableToday = Math.min(dailyLimit, Math.max(0, availableCash));

  const thirtyDayBillingTotal = useMemo(() => {
    const cardTxs = transactions.filter(
      (tx) => tx.type === 'SWEEP' || tx.vertical === 'CASH' || tx.description.toLowerCase().includes('card')
    );
    const total = cardTxs.reduce((sum, tx) => sum + (tx.amountUsd || 0), 0);
    return total > 0 ? total : 0;
  }, [transactions]);

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setDailyLimit(Math.min(tierConfig.max, Math.max(tierConfig.min, val)));
  };

  const handleCommitLimit = async () => {
    if (dailyLimit > tierConfig.max) {
      setUpdateNotice(`Cap exceeds ${kycTier} max allowance of $${tierConfig.max.toLocaleString()}.`);
      setTimeout(() => setUpdateNotice(null), 3500);
      return;
    }

    setIsUpdating(true);
    try {
      await updateCardSpendingLimitApi(dailyLimit);
      setUpdateNotice(`Daily spending cap committed to HSM Enclave & Database (${kycTier} Verified).`);
    } catch {
      setUpdateNotice('Failed to update spending cap on server. Please try again.');
    } finally {
      setIsUpdating(false);
      setTimeout(() => setUpdateNotice(null), 3000);
    }
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
            Card Spending Caps &amp; Liquidity Reserve Rails
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-DEFAULT uppercase font-semibold">
            {tierConfig.label}
          </span>
          <span className="text-[10px] font-mono text-tertiary bg-tertiary/10 border border-tertiary/30 px-2 py-0.5 rounded-DEFAULT">
            COLLATERALIZED 1:1
          </span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-surface-container-low p-3 rounded-DEFAULT border border-border-hairline flex flex-col justify-between min-w-0 overflow-hidden">
          <span className="font-mono text-[10px] text-outline uppercase tracking-wider truncate">
            Daily Single-Swipe Cap
          </span>
          <div className="font-mono text-sm sm:text-base font-bold text-on-surface tabular-nums mt-1 truncate">
            {formatMaskedCurrency(dailyLimit, maskBalances)}
          </div>
          <span className="font-mono text-[10px] text-tertiary mt-1 flex items-center gap-1 truncate">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            <span>2-of-3 HSM Guarded</span>
          </span>
        </div>

        <div className="bg-surface-container-low p-3 rounded-DEFAULT border border-border-hairline flex flex-col justify-between min-w-0 overflow-hidden">
          <span className="font-mono text-[10px] text-outline uppercase tracking-wider truncate">
            Available Today
          </span>
          <div className="font-mono text-sm sm:text-base font-bold text-primary tabular-nums mt-1 truncate">
            {formatMaskedCurrency(availableToday, maskBalances)}
          </div>
          <span className="font-mono text-[10px] text-outline mt-1 truncate">
            Settled Real-Time DvP
          </span>
        </div>

        <div className="bg-surface-container-low p-3 rounded-DEFAULT border border-border-hairline flex flex-col justify-between min-w-0 overflow-hidden">
          <span className="font-mono text-[10px] text-outline uppercase tracking-wider truncate">
            30-Day Billing Total
          </span>
          <div className="font-mono text-sm sm:text-base font-bold text-on-surface tabular-nums mt-1 truncate">
            {formatMaskedCurrency(thirtyDayBillingTotal, maskBalances)}
          </div>
          <span className="font-mono text-[10px] text-tertiary mt-1 truncate">
            Geneva Vault: 0.00% Risk
          </span>
        </div>
      </div>

      {/* Interactive Spending Cap Slider */}
      <div className="p-3.5 bg-surface-container rounded-DEFAULT border border-border-hairline space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-1.5 text-on-surface font-semibold">
            <Sliders className="w-3.5 h-3.5 text-secondary" />
            <span>Adjust Active Daily Allowance ({kycTier})</span>
          </div>
          <span className="text-secondary font-bold tabular-nums">
            {`${formatMaskedCurrency(dailyLimit, maskBalances)} / Day`}
          </span>
        </div>

        <input
          type="range"
          min={tierConfig.min}
          max={tierConfig.max}
          step={tierConfig.step}
          data-testid="daily-limit-slider"
          value={dailyLimit}
          onChange={handleLimitChange}
          className="w-full h-1.5 bg-surface-container-high rounded-DEFAULT appearance-none cursor-pointer accent-primary"
        />

        <div className="flex items-center justify-between text-[10px] font-mono text-outline">
          <span>{`Min: ${formatMaskedCurrency(tierConfig.min, false)}`}</span>
          <span>{`Baseline: $500,000.00`}</span>
          <span className="text-primary font-semibold">{`KYC Max: ${formatMaskedCurrency(tierConfig.max, false)}`}</span>
          <span>Approved Ceiling</span>
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
