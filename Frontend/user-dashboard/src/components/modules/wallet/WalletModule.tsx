import React from 'react';
import {
  FileText,
  CreditCard,
  Sliders,
  TrendingUp,
} from 'lucide-react';
import { LedgerSplitCards } from './LedgerSplitCards';
import { FiatRampWizard } from './FiatRampWizard';
import { CashSweepPot } from './CashSweepPot';
import { TxHistoryTable } from './TxHistoryTable';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { formatMaskedCurrency } from '../../../lib/calculations';

interface WalletModuleProps {
  maskBalances?: boolean;
}

export const WalletModule: React.FC<WalletModuleProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  return (
    <div
      data-testid="wallet-module"
      className="min-h-[540px] w-full space-y-6 select-none"
    >
      {/* TOP CONTEXT COMMAND BAR */}
      <section className="bg-surface-container-lowest px-4 py-3 border border-border-hairline rounded-DEFAULT flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-on-surface-variant font-mono text-[11px] uppercase tracking-wider">
          <span className="text-outline">Portfolio</span>
          <span className="text-outline/40">/</span>
          <span className="text-outline">Treasury & Cards</span>
          <span className="text-outline/40">/</span>
          <span className="text-primary font-semibold">Wallets & Sovereign Finance</span>
          <span className="hidden md:inline text-outline/30 mx-1">|</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container text-tertiary rounded-DEFAULT text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              CLEARING: SWISS INTERBANK RTGS // SIC
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-DEFAULT text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              FEDWIRE CO-LOCATED
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container text-tertiary rounded-DEFAULT text-[10px]">
              LMAX SPOT FX 0.00%
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container text-secondary rounded-DEFAULT text-[10px]">
              T+0 ATOMIC DvP
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container text-on-surface hover:bg-surface-container-high rounded-DEFAULT font-mono text-[11px] uppercase tracking-wider transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Monthly Audit PDF</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container text-on-surface hover:bg-surface-container-high rounded-DEFAULT font-mono text-[11px] uppercase tracking-wider transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-outline" />
            <span>Manage IBANs</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-surface font-semibold rounded-DEFAULT font-mono text-[11px] uppercase tracking-wider hover:bg-primary-hover transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settlement Limits</span>
          </button>
        </div>
      </section>

      {/* MAIN SCENIC METRIC RIBBON & MASTER BALANCE SUMMARY */}
      <section className="bg-surface-container-low px-4 py-4 border border-border-hairline rounded-DEFAULT">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest">
                Consolidated Platform Net Wealth
              </span>
              <span className="px-1.5 py-0.5 bg-primary/20 text-primary font-mono text-[10px] rounded-DEFAULT">
                TIER 3 AUDITED ENCLAVE
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl lg:text-3xl font-mono text-on-surface tracking-tight tabular-nums font-bold">
                {formatMaskedCurrency(14820450.0, maskBalances)}
              </span>
              <span className="text-sm font-mono text-tertiary tabular-nums font-semibold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {maskBalances ? '••••••••' : '+$184,210.40 (24h DvP Inflow)'}
              </span>
            </div>
          </div>

          {/* Quick Treasury Barometer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface-container-lowest px-3 py-2 rounded-DEFAULT border border-border-hairline">
              <span className="text-[10px] font-mono text-outline uppercase block">
                Sweep Yield APY
              </span>
              <span className="text-sm font-mono text-tertiary tabular-nums font-bold">
                5.20% Net
              </span>
            </div>
            <div className="bg-surface-container-lowest px-3 py-2 rounded-DEFAULT border border-border-hairline">
              <span className="text-[10px] font-mono text-outline uppercase block">
                Liquid Ratio
              </span>
              <span className="text-sm font-mono text-primary tabular-nums font-bold">
                12.28%
              </span>
            </div>
            <div className="bg-surface-container-lowest px-3 py-2 rounded-DEFAULT border border-border-hairline">
              <span className="text-[10px] font-mono text-outline uppercase block">
                Fedwire SLA
              </span>
              <span className="text-sm font-mono text-on-surface tabular-nums font-semibold">
                &lt;15 Mins
              </span>
            </div>
            <div className="bg-surface-container-lowest px-3 py-2 rounded-DEFAULT border border-border-hairline">
              <span className="text-[10px] font-mono text-outline uppercase block">
                Swiss SIC Gate
              </span>
              <span className="text-sm font-mono text-tertiary tabular-nums font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> ONLINE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* DUAL SPLIT MASTER LEDGER: AVAILABLE LIQUID VS INVESTED/LOCKED */}
      <LedgerSplitCards maskBalances={maskBalances} />

      {/* OPERATIONAL GRID: TRANSFER MODULE + SWEEP POT & SPOT FX */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <FiatRampWizard maskBalances={maskBalances} />
        </div>
        <div className="lg:col-span-6">
          <CashSweepPot maskBalances={maskBalances} />
        </div>
      </section>

      {/* UNIFIED HISTORICAL ACTIVITY LEDGER */}
      <section>
        <TxHistoryTable maskBalances={maskBalances} />
      </section>
    </div>
  );
};
