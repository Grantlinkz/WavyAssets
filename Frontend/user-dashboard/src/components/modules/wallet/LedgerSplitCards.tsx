import React from 'react';
import {
  Wallet,
  Lock,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
} from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import { formatMaskedCurrency, isSsrOrTestEnv } from '../../../lib/calculations';

interface LedgerSplitCardsProps {
  maskBalances?: boolean;
}

export const LedgerSplitCards: React.FC<LedgerSplitCardsProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const isSsr = isSsrOrTestEnv();
  const rawAvailableCash = usePortfolioStore((s) => s.availableCash);
  const rawNetWorth = usePortfolioStore((s) => s.netWorth);
  const rawAllocations = usePortfolioStore((s) => s.allocations);
  const openModal = usePortfolioStore((s) => s.openModal);

  const availableCash = isSsr ? usePortfolioStore.getState().availableCash : rawAvailableCash;
  const netWorth = isSsr ? usePortfolioStore.getState().netWorth : rawNetWorth;
  const storeAllocations = isSsr ? usePortfolioStore.getState().allocations : rawAllocations;

  const investedCapital = Math.max(0, netWorth - availableCash);

  const usdcBalance = availableCash * 0.6127;
  const usdCashBalance = availableCash * 0.1518;
  const chfCashBalance = availableCash * 0.1366;
  const eurCashBalance = availableCash * 0.0989;

  const investedAllocations = storeAllocations.map((alloc) => {
    let colorClass = 'bg-primary';
    let dotColorClass = 'bg-primary';
    if (alloc.id === 'stocks') {
      colorClass = 'bg-secondary';
      dotColorClass = 'bg-secondary';
    } else if (alloc.id === 'real-estate') {
      colorClass = 'bg-tertiary';
      dotColorClass = 'bg-tertiary';
    } else if (alloc.id === 'ai-funds') {
      colorClass = 'bg-outline';
      dotColorClass = 'bg-outline';
    } else if (alloc.id === 'cars') {
      colorClass = 'bg-primary-container';
      dotColorClass = 'bg-primary-container';
    }

    return {
      name: alloc.name,
      amount: alloc.actualValue,
      pct: alloc.actualPct,
      color: colorClass,
      dotColor: dotColorClass,
    };
  });

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* CARD A: ACCOUNT BALANCE (UNENCUMBERED CASH) */}
      <div className="lg:col-span-6 bg-surface-container-lowest border-2 border-primary/60 rounded-DEFAULT p-4 flex flex-col justify-between shadow-lg">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-mono text-on-surface uppercase tracking-wider font-semibold">
                Card A: Account Balance
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/40 rounded-DEFAULT shrink-0">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-wider">
                Unencumbered & Instant Spendable
              </span>
            </div>
          </div>
          <p className="text-xs font-sans text-outline max-w-xl mb-3">
            Liquid unencumbered cash & stablecoins ready for immediate withdrawal, OTC execution, or card funding.
          </p>

          <div className="flex items-baseline gap-2 mb-4 pb-3 border-b border-border-hairline">
            <span className="text-2xl font-mono text-primary tabular-nums font-bold tracking-tight">
              {formatMaskedCurrency(availableCash, maskBalances)}
            </span>
            <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
              USD Equivalent
            </span>
          </div>

          {/* Four-Way Liquidity Sub-Ledger */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
              <div className="flex items-center justify-between text-outline text-[11px] font-mono">
                <span>USDC Circle</span>
                <span className="text-tertiary">99.9%</span>
              </div>
              <div className="text-sm font-mono text-on-surface tabular-nums font-semibold mt-0.5">
                {formatMaskedCurrency(usdcBalance, maskBalances)}
              </div>
              <span className="text-[10px] font-sans text-outline">Native ERC-20</span>
            </div>

            <div className="bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
              <div className="flex items-center justify-between text-outline text-[11px] font-mono">
                <span>USD Cash</span>
                <span className="text-primary font-semibold">Fedwire</span>
              </div>
              <div className="text-sm font-mono text-on-surface tabular-nums font-semibold mt-0.5">
                {formatMaskedCurrency(usdCashBalance, maskBalances)}
              </div>
              <span className="text-[10px] font-sans text-outline">JPMorgan Segregated</span>
            </div>

            <div className="bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
              <div className="flex items-center justify-between text-outline text-[11px] font-mono">
                <span>CHF Cash</span>
                <span className="text-tertiary font-semibold">SIC RTGS</span>
              </div>
              <div className="text-sm font-mono text-on-surface tabular-nums font-semibold mt-0.5">
                {formatMaskedCurrency(chfCashBalance, maskBalances)}
              </div>
              <span className="text-[10px] font-sans text-outline">
                {maskBalances ? '•••••• CHF' : `${Math.round(chfCashBalance * 0.887).toLocaleString()} CHF`}
              </span>
            </div>

            <div className="bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
              <div className="flex items-center justify-between text-outline text-[11px] font-mono">
                <span>EUR Cash</span>
                <span className="text-outline">SEPA Inst</span>
              </div>
              <div className="text-sm font-mono text-on-surface tabular-nums font-semibold mt-0.5">
                {formatMaskedCurrency(eurCashBalance, maskBalances)}
              </div>
              <span className="text-[10px] font-sans text-outline">
                {maskBalances ? '•••••• EUR' : `€${Math.round(eurCashBalance * 0.923).toLocaleString()} EUR`}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => openModal('withdraw')}
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-surface font-mono text-xs font-bold rounded-DEFAULT hover:bg-primary-hover transition-colors uppercase tracking-wider cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw to Bank</span>
          </button>
          <button
            type="button"
            onClick={() => openModal('deposit')}
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface-container border border-border-hairline text-on-surface hover:bg-surface-container-high font-mono text-xs rounded-DEFAULT transition-colors uppercase tracking-wider cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4 text-tertiary" />
            <span>Deposit Capital</span>
          </button>
          <button
            type="button"
            onClick={() => openModal('trade')}
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface-container border border-border-hairline text-on-surface hover:bg-surface-container-high font-mono text-xs rounded-DEFAULT transition-colors uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 text-secondary" />
            <span>Internal Transfer</span>
          </button>
        </div>
      </div>

      {/* CARD B: CONSOLIDATED PLATFORM NET WORTH */}
      <div className="lg:col-span-6 bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-4 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-outline shrink-0" />
              <span className="text-xs font-mono text-on-surface uppercase tracking-wider font-semibold">
                Card B: Invested &amp; Locked Capital
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface-container border border-border-hairline rounded-DEFAULT shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-tertiary" />
              <span className="text-[10px] font-mono text-tertiary uppercase font-medium tracking-wider">
                All Vaults Bonded &amp; Collateralized
              </span>
            </div>
          </div>
          <p className="text-xs font-sans text-outline max-w-xl mb-3">
            Fiduciary capital locked in real estate SPVs, exotic vehicles, horology, equities, &amp; validator staking.
          </p>

          <div className="flex items-baseline gap-2 mb-4 pb-3 border-b border-border-hairline">
            <span className="text-2xl font-mono text-on-surface tabular-nums font-bold tracking-tight">
              {formatMaskedCurrency(investedCapital, maskBalances)}
            </span>
            <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
              Bonded Asset Valuation
            </span>
          </div>

          {/* Five Horizontal Asset Bars */}
          <div className="space-y-2.5 mb-3">
            {investedAllocations.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-xs font-sans text-on-surface mb-0.5">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                    {item.name}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {formatMaskedCurrency(item.amount, maskBalances)} ({item.pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-DEFAULT overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-300`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-[11px] font-mono text-outline">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-tertiary" />
            Bank Julius Bär Escrow
          </span>
          <span className="text-primary hover:underline uppercase tracking-wider font-semibold cursor-pointer">
            Inspect Vault Smart Contracts →
          </span>
        </div>
      </div>
    </section>
  );
};
