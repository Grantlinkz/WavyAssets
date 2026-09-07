import React from 'react';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { Lock, Building2, Globe2 } from 'lucide-react';

export const StocksPanel: React.FC = () => {
  const { openAuthModal } = useTerminalStore();

  const blocks = [
    {
      id: 'block-1',
      ticker: 'SPACEX',
      company: 'Space Exploration Technologies Corp.',
      type: 'Secondary Series N Common Shares',
      valuation: '$210B Implied',
      available: '$18.5M Block',
      discount: '-4.8% vs Primary',
    },
    {
      id: 'block-2',
      ticker: 'STRIPE',
      company: 'Stripe, Inc.',
      type: 'Direct Private Secondary SPV',
      valuation: '$70B Implied',
      available: '$12.0M Block',
      discount: '-6.2% vs Tender',
    },
    {
      id: 'block-3',
      ticker: 'ANTHROPIC',
      company: 'Anthropic PBC',
      type: 'Preferred Convertible Note Series C',
      valuation: '$18.5B Implied',
      available: '$25.0M Block',
      discount: 'Direct Allocation',
    },
    {
      id: 'block-4',
      ticker: 'BYTEDANCE',
      company: 'ByteDance Ltd.',
      type: 'Global Institutional Offshore SPV',
      valuation: '$268B Implied',
      available: '$30.0M Block',
      discount: '-8.5% Net',
    },
  ];

  return (
    <div className="w-full space-y-6" data-testid="panel-stocks">
      {/* Hero */}
      <div className="w-full bg-surface-container-low p-6 rounded-sm border border-outline/30 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-surface-container-high text-primary font-mono text-[10px] uppercase tracking-widest rounded-sm border border-outline/20">
                [ DMA EQUITIES // PRE-IPO SECONDARIES // DTCC DIRECT ]
              </span>
              <span className="px-2 py-0.5 bg-secondary/15 text-secondary font-mono text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1 border border-secondary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                BNY MELLON TRI-PARTY CUSTODIED
              </span>
            </div>

            <h3 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Global Stocks &amp; Pre-IPO Direct Market Access
            </h3>

            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Sub-millisecond smart order routing into NYSE, Nasdaq, and European venues via Equinix
              NY4 / LD4 cross-connects. Proprietary secondary pipelines for late-stage venture equity
              and pre-IPO block syndication.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="btn-request-block"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-sans text-xs uppercase rounded-sm hover:bg-primary-hover transition-colors font-bold shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Request Block Allocation</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface font-sans text-xs uppercase rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer border border-outline/20"
              >
                <Globe2 className="w-3.5 h-3.5 text-outline" />
                <span>Inspect Execution Dark Pools</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-container-lowest p-4 rounded-sm border border-outline/20 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-outline/20">
              <span className="font-sans text-[11px] uppercase text-outline tracking-wider font-semibold">
                DMA ROUTING BENCHMARK
              </span>
              <span className="font-mono text-[10px] text-secondary font-semibold">
                EQUINIX NY4
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">EXECUTION SPEED</div>
                <div className="font-mono text-xl font-bold text-secondary pt-0.5">0.038ms</div>
                <div className="font-mono text-[9px] text-outline">FIX 4.4 Feed</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">AVAILABLE BLOCKS</div>
                <div className="font-mono text-xl font-bold text-on-surface pt-0.5">$85.5M</div>
                <div className="font-mono text-[9px] text-primary">Pre-IPO Equity</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">CLEARING CYCLE</div>
                <div className="font-mono text-xl font-bold text-primary pt-0.5">T+0</div>
                <div className="font-mono text-[9px] text-outline">Real-Time DVP</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blocks Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            CURRENT PRE-IPO ALLOCATION BLOCKS
          </span>
          <span className="font-mono text-[10px] text-outline">
            SETTLEMENT: BNY MELLON TRI-PARTY DVP
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blocks.map((b) => (
            <div
              key={b.id}
              className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/50 transition-colors flex flex-col justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-sm text-primary">{b.ticker}</span>
                  <span className="font-mono text-xs font-bold text-secondary bg-secondary/15 px-2 py-0.5 rounded-sm border border-secondary/20">
                    {b.discount}
                  </span>
                </div>
                <div className="font-sans font-semibold text-sm text-on-surface">{b.company}</div>
                <p className="font-sans text-xs text-outline">{b.type}</p>
              </div>

              <div className="pt-3 border-t border-outline/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-[10px] text-outline uppercase block">
                    Implied Valuation
                  </span>
                  <span className="font-mono font-semibold text-on-surface">{b.valuation}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-outline uppercase block">
                    Block Available
                  </span>
                  <span className="font-mono text-base font-bold text-primary">{b.available}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
