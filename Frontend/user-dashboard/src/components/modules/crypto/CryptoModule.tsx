import React from 'react';
import { TrendingUp } from 'lucide-react';
import { HoldingsTable } from './HoldingsTable';
import { DcaScheduler } from './DcaScheduler';
import { StakingTelemetry } from './StakingTelemetry';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { formatMaskedCurrency } from '../../../lib/calculations';

interface CryptoModuleProps {
  maskBalances?: boolean;
}

export const CryptoModule: React.FC<CryptoModuleProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

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
                  {formatMaskedCurrency(5187157.5, maskBalances)}
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-mono rounded-DEFAULT uppercase">
              35.0% PORTFOLIO
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-tertiary font-mono text-xs tabular-nums font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+$94,240.10 (+1.85%) 24H</span>
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
                  {formatMaskedCurrency(3200000.0, maskBalances)}
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-mono rounded-DEFAULT uppercase">
              ACTIVE YIELD
            </span>
          </div>
          <div className="text-[11px] font-mono text-outline mt-2">
            61.7% of Crypto Assets Bonded across 3 Validators
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
                  7.42% NET
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-mono rounded-DEFAULT uppercase">
              FEE: 3.5%
            </span>
          </div>
          <div className="text-[11px] font-mono text-tertiary font-medium mt-2">
            Daily run-rate: +$650.52 / day
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
                  {formatMaskedCurrency(18492.3, maskBalances)}
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
        <DcaScheduler />
        <StakingTelemetry maskBalances={maskBalances} />
      </section>
    </div>
  );
};
