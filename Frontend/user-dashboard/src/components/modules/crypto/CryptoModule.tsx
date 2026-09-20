import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { HoldingsTable } from './HoldingsTable';
import { DcaScheduler } from './DcaScheduler';
import { StakingTelemetry } from './StakingTelemetry';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { formatMaskedCurrency } from '../../../lib/calculations';
import { CRYPTO_HOLDINGS_DATA } from '../../../lib/liquidAssetData';

interface CryptoModuleProps {
  maskBalances?: boolean;
}

export const CryptoModule: React.FC<CryptoModuleProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  // Dynamically compute accurate real values directly from user's active holdings (balance > 0)
  const heldCrypto = useMemo(() => CRYPTO_HOLDINGS_DATA.filter((h) => h.balance > 0), []);

  const totalCryptoNav = useMemo(() => {
    return heldCrypto.reduce((sum, h) => sum + h.balance * h.spotPrice, 0);
  }, [heldCrypto]);

  const totalUnrealizedPnl = useMemo(() => {
    return heldCrypto.reduce((sum, h) => sum + h.unrealizedPnl, 0);
  }, [heldCrypto]);

  const totalCostBasis = useMemo(() => {
    return heldCrypto.reduce((sum, h) => sum + h.balance * h.entryPrice, 0);
  }, [heldCrypto]);

  const totalPnlPct = totalCostBasis > 0 ? (totalUnrealizedPnl / totalCostBasis) * 100 : 0;

  const stakedHoldings = useMemo(() => {
    return heldCrypto.filter((h) => h.custodyType === 'STAKING_LOCKUP');
  }, [heldCrypto]);

  const totalStakedCapital = useMemo(() => {
    return stakedHoldings.reduce((sum, h) => sum + h.balance * h.spotPrice, 0);
  }, [stakedHoldings]);

  const stakedPctOfCrypto = totalCryptoNav > 0 ? (totalStakedCapital / totalCryptoNav) * 100 : 0;

  const blendedApy = useMemo(() => {
    if (totalStakedCapital === 0) return 0;
    const weightedSum = stakedHoldings.reduce(
      (sum, h) => sum + h.balance * h.spotPrice * (h.stakingApy || 0),
      0
    );
    return weightedSum / totalStakedCapital;
  }, [stakedHoldings, totalStakedCapital]);

  const dailyRunRate = (totalStakedCapital * (blendedApy / 100)) / 365;
  const accruedYield = 18492.3;

  return (
    <div
      data-testid="crypto-module"
      className="min-h-[540px] w-full space-y-6 select-none"
    >
      {/* 4-KPI Institutional Summary Ribbon */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* KPI 1: Crypto NAV */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest block">
                CRYPTO NET ASSET VALUE
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-mono font-bold text-on-surface tabular-nums">
                  {formatMaskedCurrency(totalCryptoNav, maskBalances)}
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-mono rounded-DEFAULT uppercase">
              37.1% PORTFOLIO
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-tertiary font-mono text-xs tabular-nums font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {maskBalances
                ? '•••••• (••••%) UNREALIZED P&L'
                : `+$${totalUnrealizedPnl.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} (+${totalPnlPct.toFixed(2)}%) UNREALIZED P&L`}
            </span>
          </div>
        </div>

        {/* KPI 2: Total Staked */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest block">
                TOTAL STAKED CAPITAL
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-mono font-bold text-on-surface tabular-nums">
                  {formatMaskedCurrency(totalStakedCapital, maskBalances)}
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-mono rounded-DEFAULT uppercase">
              ACTIVE YIELD
            </span>
          </div>
          <div className="text-[11px] font-mono text-outline mt-2">
            {stakedPctOfCrypto.toFixed(1)}% of Crypto Assets Bonded across {stakedHoldings.length} Validators
          </div>
        </div>

        {/* KPI 3: Blended APY */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest block">
                BLENDED STAKING APY
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-mono font-bold text-primary tabular-nums">
                  {blendedApy.toFixed(2)}% NET
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-mono rounded-DEFAULT uppercase">
              FEE: 3.5%
            </span>
          </div>
          <div className="text-[11px] font-mono text-tertiary font-medium mt-2">
            Daily run-rate: {maskBalances ? '••••••' : `+$${dailyRunRate.toFixed(2)}`} / day
          </div>
        </div>

        {/* KPI 4: Unclaimed Rewards */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest block">
                ACCRUED UNCLAIMED YIELD
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-mono font-bold text-tertiary tabular-nums">
                  {formatMaskedCurrency(accruedYield, maskBalances)}
                </span>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-mono text-tertiary">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              LIVE ACCRUAL
            </span>
          </div>
          <div className="text-[11px] font-mono text-outline mt-2">
            Auto-compound pool synced to Geneva Enclave
          </div>
        </div>
      </section>

      {/* Main Table: Spot Holdings Blotter */}
      <HoldingsTable maskBalances={maskBalances} />

      {/* Lower Split: DCA Automation & Staking Telemetry */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DcaScheduler maskBalances={maskBalances} />
        <StakingTelemetry maskBalances={maskBalances} />
      </section>
    </div>
  );
};
