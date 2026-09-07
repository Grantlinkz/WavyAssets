import React from 'react';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { Lock, Activity, Zap } from 'lucide-react';

export const CryptoPanel: React.FC = () => {
  const { openAuthModal } = useTerminalStore();

  const yieldStreams = [
    {
      id: 'btc-basis',
      name: 'BTC Institutional Basis Arbitrage (CME vs Spot)',
      apy: '14.8% APY',
      tvl: '$320.0M',
      risk: 'Ultra Low Delta-Neutral',
      status: 'Active Allocating',
    },
    {
      id: 'eth-lst',
      name: 'ETH Layer-1 Validator & EigenLayer Restaking',
      apy: '9.2% APY',
      tvl: '$280.0M',
      risk: 'Staking Principal Guaranteed',
      status: 'Active Allocating',
    },
    {
      id: 'sol-mev',
      name: 'SOL Institutional MEV Engine & Jito Sol Vault',
      apy: '18.6% APY',
      tvl: '$140.0M',
      risk: 'Algorithmic Capture',
      status: 'High Volume',
    },
    {
      id: 'quant-yield',
      name: 'Multi-Asset Cross-Exchange Market Neutral Spread',
      apy: '24.5% APY',
      tvl: '$200.5M',
      risk: 'Automated Microsecond FIX 4.4',
      status: 'Sub-0.05ms Route',
    },
  ];

  return (
    <div className="w-full space-y-6" data-testid="panel-crypto">
      {/* 1. Hero Block */}
      <div className="w-full bg-surface-container-low p-6 rounded-sm border border-outline/30 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-surface-container-high text-primary font-mono text-[10px] uppercase tracking-widest rounded-sm border border-outline/20">
                [ LIQUID DIGITAL ASSET VERTICAL // DIRECT EXECUTION MESH ]
              </span>
              <span className="px-2 py-0.5 bg-secondary/15 text-secondary font-mono text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1 border border-secondary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                MPC COLD ENCLAVE CUSTODIED
              </span>
            </div>

            <h3 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Crypto Yield &amp; Algorithmic Execution
            </h3>

            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Algorithmic basis trading, liquid staking derivatives (LST), and non-directional
              market-neutral yield aggregation across Bitcoin, Ethereum, and Solana. Backed by
              segregated MPC multi-sig cold storage under Swiss VQF regulatory compliance.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="btn-deploy-crypto"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-sans text-xs uppercase rounded-sm hover:bg-primary-hover transition-colors font-bold shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Deploy Capital Pool</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface font-sans text-xs uppercase rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer border border-outline/20"
              >
                <Activity className="w-3.5 h-3.5 text-secondary" />
                <span>Inspect Yield Flow Telemetry</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-container-lowest p-4 rounded-sm border border-outline/20 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-outline/20">
              <span className="font-sans text-[11px] uppercase text-outline tracking-wider font-semibold">
                SYSTEMATIC YIELD BENCHMARK
              </span>
              <span className="font-mono text-[10px] text-secondary flex items-center gap-1 font-semibold">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                BLENDED APY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">NET YIELD</div>
                <div className="font-mono text-xl font-bold text-primary pt-0.5">19.4%</div>
                <div className="font-mono text-[9px] text-secondary">30D Moving Mean</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">TOTAL VALUE</div>
                <div className="font-mono text-xl font-bold text-on-surface pt-0.5">$940.5M</div>
                <div className="font-mono text-[9px] text-outline">Liquid Custody</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">3Y SHARPE</div>
                <div className="font-mono text-xl font-bold text-secondary pt-0.5">3.42</div>
                <div className="font-mono text-[9px] text-outline">Zero Max Drawdown</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Yield Matrix Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            ACTIVE INSTITUTIONAL YIELD FLOWS
          </span>
          <span className="font-mono text-[10px] text-outline">
            SETTLEMENT CYCLE: CONTINUOUS HOURLY MERKLE
          </span>
        </div>

        <div className="w-full bg-surface-container-low rounded-sm border border-outline/20 overflow-hidden divide-y divide-outline/20">
          {yieldStreams.map((stream) => (
            <div
              key={stream.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container transition-colors"
            >
              <div className="space-y-1">
                <div className="font-sans font-semibold text-sm text-on-surface">
                  {stream.name}
                </div>
                <div className="font-mono text-xs text-outline flex items-center gap-3">
                  <span>{stream.risk}</span>
                  <span>&bull;</span>
                  <span className="text-secondary font-semibold">{stream.status}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end sm:self-center">
                <div className="text-right">
                  <div className="font-mono text-[10px] text-outline uppercase">TVL Allocated</div>
                  <div className="font-mono text-sm font-bold text-on-surface">{stream.tvl}</div>
                </div>
                <div className="text-right min-w-[80px]">
                  <div className="font-mono text-[10px] text-outline uppercase">Net APY</div>
                  <div className="font-mono text-base font-bold text-primary">{stream.apy}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
