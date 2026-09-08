import React from 'react';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { Lock, Activity, Zap, Sparkles, HelpCircle, ShieldCheck, CheckCircle2, Shield } from 'lucide-react';

export const CryptoPanel: React.FC = () => {
  const { openAuthModal } = useTerminalStore();

  const yieldStreams = [
    {
      id: 'btc-basis',
      name: 'Bitcoin Basis Growth Yield Account',
      apy: '14.8% APY',
      tvl: '$320.0M',
      risk: 'Ultra Low Risk',
      status: 'Confirmed',
    },
    {
      id: 'eth-lst',
      name: 'Ethereum Staking & Security Rewards',
      apy: '9.2% APY',
      tvl: '$280.0M',
      risk: 'Principal Protected',
      status: 'Confirmed',
    },
    {
      id: 'sol-mev',
      name: 'Solana High-Performance Staking',
      apy: '18.6% APY',
      tvl: '$140.0M',
      risk: 'Automated Rules',
      status: 'Active',
    },
    {
      id: 'quant-yield',
      name: 'Multi-Asset Market-Neutral Yield',
      apy: '24.5% APY',
      tvl: '$200.5M',
      risk: 'Instant Settlement',
      status: 'Confirmed',
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
                SECURE CRYPTO VAULT • PREDICTABLE YIELDS
              </span>
              <span className="px-2 py-0.5 bg-secondary/15 text-secondary font-mono text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1 border border-secondary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                100% OFFLINE VAULT BACKED
              </span>
            </div>

            <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Simple crypto investing with bank-grade vault protection
            </h1>

            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Buy, hold, and earn yield on major cryptocurrencies without complicated keys or risky
              guesswork. Your digital assets are backed by offline cold storage.
            </p>

            <div className="text-[11px] font-mono text-outline">
              Strategy Category: <span className="text-on-surface font-semibold">Crypto Yield &amp; Smart Automated Rules</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="btn-deploy-crypto"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-sans text-xs uppercase rounded-sm hover:bg-primary-hover transition-colors font-bold shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Deposit Crypto Securely</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface font-sans text-xs uppercase rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer border border-outline/20"
              >
                <Activity className="w-3.5 h-3.5 text-secondary" />
                <span>Compare Yield Rates</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-container-lowest p-4 rounded-sm border border-outline/20 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-outline/20">
              <span className="font-sans text-[11px] uppercase text-outline tracking-wider font-semibold">
                CRYPTO YIELD BENCHMARK
              </span>
              <span className="font-mono text-[10px] text-secondary flex items-center gap-1 font-semibold">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                AVERAGE ANNUAL RETURN
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">NET ANNUAL YIELD</div>
                <div className="font-mono text-xl font-bold text-primary pt-0.5">19.4%</div>
                <div className="font-mono text-[9px] text-secondary">30-Day Average</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">PROTECTED VALUE</div>
                <div className="font-mono text-xl font-bold text-on-surface pt-0.5">$940.5M</div>
                <div className="font-mono text-[9px] text-outline">Cold Storage</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">SAFETY RATING</div>
                <div className="font-mono text-xl font-bold text-secondary pt-0.5">AAA</div>
                <div className="font-mono text-[9px] text-outline">Audited Reserves</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Features Breakdown: 3 Plain Benefit Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            STRESS-FREE CRYPTO CUSTODY AND YIELD
          </h2>
          <div className="group relative cursor-pointer">
            <span className="font-mono text-[11px] text-outline flex items-center gap-1 hover:text-primary transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              What is cold storage?
            </span>
            <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-72 p-2.5 bg-surface-container-highest text-on-surface text-xs rounded-sm border border-outline shadow-lg z-20">
              Cold storage keeps crypto private keys on disconnected physical hardware devices, protecting them from online hackers.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Offline Cold Storage</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              100% of reserves are stored in offline vaults that are never connected to the open internet.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary/15 text-secondary text-[10px] font-mono font-semibold">
                <CheckCircle2 className="w-3 h-3" /> FIPS Certified
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Steady Yield Programs</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Earn interest on your Bitcoin and Ethereum with verified low-risk staking strategies.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-primary/15 text-primary text-[10px] font-mono font-semibold">
                Automated Payouts
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Clear Proof of Reserves</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Verify your exact coin balance on the blockchain at any time of day with public proof.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary/15 text-secondary text-[10px] font-mono font-semibold">
                100% Backed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Yield Matrix Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            AVAILABLE CRYPTO SAVINGS &amp; YIELD ACCOUNTS
          </span>
          <span className="font-mono text-[10px] text-outline">
            PAYOUT SCHEDULE: HOURLY ACCRUAL
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
                  <div className="font-mono text-[10px] text-outline uppercase">Total In Vault</div>
                  <div className="font-mono text-sm font-bold text-on-surface">{stream.tvl}</div>
                </div>
                <div className="text-right min-w-[80px]">
                  <div className="font-mono text-[10px] text-outline uppercase">Net Annual APY</div>
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
