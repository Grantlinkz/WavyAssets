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
import { formatMaskedCurrency } from '../../../lib/calculations';

interface LedgerSplitCardsProps {
  maskBalances?: boolean;
}

export const LedgerSplitCards: React.FC<LedgerSplitCardsProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const investedAllocations = [
    {
      name: 'Crypto & Validator Staking',
      amount: 4890000.0,
      pct: 37.6,
      color: 'bg-primary',
      dotColor: 'bg-primary',
    },
    {
      name: 'Global Equities & Pre-IPO SPVs',
      amount: 2960000.0,
      pct: 22.8,
      color: 'bg-secondary',
      dotColor: 'bg-secondary',
    },
    {
      name: 'Tokenized Real Estate SPVs (Zurich/London)',
      amount: 2850000.0,
      pct: 21.9,
      color: 'bg-tertiary',
      dotColor: 'bg-tertiary',
    },
    {
      name: 'Private AI Quant Funds (Autonomous Enclaves)',
      amount: 1450000.0,
      pct: 11.2,
      color: 'bg-outline',
      dotColor: 'bg-outline',
    },
    {
      name: 'Exotic Heritage Cars & Horology Vault',
      amount: 850000.0,
      pct: 6.5,
      color: 'bg-primary-container',
      dotColor: 'bg-primary-container',
    },
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* CARD A: AVAILABLE LIQUID BALANCE (UNENCUMBERED CASH) */}
      <div className="lg:col-span-6 bg-surface-container-lowest border-2 border-primary/60 rounded-DEFAULT p-4 flex flex-col justify-between relative shadow-lg">
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/40 rounded-DEFAULT">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-wider">
            Unencumbered & Instant Spendable
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-on-surface uppercase tracking-wider font-semibold">
              Card A: Available Liquid Balance
            </span>
          </div>
          <p className="text-xs font-sans text-outline max-w-xl mb-3">
            Liquid unencumbered cash & stablecoins ready for immediate withdrawal, OTC execution, or card funding.
          </p>

          <div className="flex items-baseline gap-2 mb-4 pb-3 border-b border-border-hairline">
            <span className="text-2xl font-mono text-primary tabular-nums font-bold tracking-tight">
              {formatMaskedCurrency(1820450.0, maskBalances)}
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
                {formatMaskedCurrency(1115337.5, maskBalances)}
              </div>
              <span className="text-[10px] font-sans text-outline">Native ERC-20</span>
            </div>

            <div className="bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
              <div className="flex items-center justify-between text-outline text-[11px] font-mono">
                <span>USD Cash</span>
                <span className="text-primary font-semibold">Fedwire</span>
              </div>
              <div className="text-sm font-mono text-on-surface tabular-nums font-semibold mt-0.5">
                {formatMaskedCurrency(276400.0, maskBalances)}
              </div>
              <span className="text-[10px] font-sans text-outline">JPMorgan Segregated</span>
            </div>

            <div className="bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
              <div className="flex items-center justify-between text-outline text-[11px] font-mono">
                <span>CHF Cash</span>
                <span className="text-tertiary font-semibold">SIC RTGS</span>
              </div>
              <div className="text-sm font-mono text-on-surface tabular-nums font-semibold mt-0.5">
                {formatMaskedCurrency(248712.5, maskBalances)}
              </div>
              <span className="text-[10px] font-sans text-outline">
                {maskBalances ? '•••••• CHF' : '220,650.00 CHF'}
              </span>
            </div>

            <div className="bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
              <div className="flex items-center justify-between text-outline text-[11px] font-mono">
                <span>EUR Cash</span>
                <span className="text-outline">SEPA Inst</span>
              </div>
              <div className="text-sm font-mono text-on-surface tabular-nums font-semibold mt-0.5">
                {maskBalances ? '••••••••' : '≈ $180,000.00'}
              </div>
              <span className="text-[10px] font-sans text-outline">
                {maskBalances ? '•••••• EUR' : '€166,200.00 EUR'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-surface font-mono text-xs font-bold rounded-DEFAULT hover:bg-primary-hover transition-colors uppercase tracking-wider"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw to Bank</span>
          </button>
          <button
            type="button"
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface-container border border-border-hairline text-on-surface hover:bg-surface-container-high font-mono text-xs rounded-DEFAULT transition-colors uppercase tracking-wider"
          >
            <ArrowDownLeft className="w-4 h-4 text-tertiary" />
            <span>Deposit Capital</span>
          </button>
          <button
            type="button"
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface-container border border-border-hairline text-on-surface hover:bg-surface-container-high font-mono text-xs rounded-DEFAULT transition-colors uppercase tracking-wider"
          >
            <ArrowLeftRight className="w-4 h-4 text-secondary" />
            <span>Internal Transfer</span>
          </button>
        </div>
      </div>

      {/* CARD B: INVESTED & LOCKED FIDUCIARY CAPITAL */}
      <div className="lg:col-span-6 bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-4 flex flex-col justify-between relative">
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-surface-container border border-border-hairline rounded-DEFAULT">
          <ShieldCheck className="w-3.5 h-3.5 text-tertiary" />
          <span className="text-[10px] font-mono text-tertiary uppercase font-medium tracking-wider">
            All Vaults Bonded & Collateralized
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-outline" />
            <span className="text-xs font-mono text-on-surface uppercase tracking-wider font-semibold">
              Card B: Invested & Locked Capital
            </span>
          </div>
          <p className="text-xs font-sans text-outline max-w-xl mb-3">
            Fiduciary capital locked in real estate SPVs, exotic vehicles, horology, equities, & validator staking.
          </p>

          <div className="flex items-baseline gap-2 mb-4 pb-3 border-b border-border-hairline">
            <span className="text-2xl font-mono text-on-surface tabular-nums font-bold tracking-tight">
              {formatMaskedCurrency(13000000.0, maskBalances)}
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
            Swiss Fiduciary Custody // Bank Julius Bär Escrow
          </span>
          <span className="text-primary hover:underline uppercase tracking-wider font-semibold cursor-pointer">
            Inspect Vault Smart Contracts →
          </span>
        </div>
      </div>
    </section>
  );
};
