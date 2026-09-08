import React from 'react';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { Lock, Cpu, Server, CheckCircle2, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';

export const AiFundsPanel: React.FC = () => {
  const { openAuthModal } = useTerminalStore();

  const clusters = [
    {
      id: 'h100-lon',
      name: 'NVIDIA H100 SXM5 80GB Cluster (1,024 Nodes)',
      datacenter: 'Equinix LD4 (Slough, UK)',
      client: 'Tier-1 AI Frontier Lab Multi-Year Lease',
      yieldRate: '14.8% APY',
      contractValue: '$52.0M Committed',
      status: 'Active Lease',
      badgeStatus: 'active',
    },
    {
      id: 'b200-fra',
      name: 'NVIDIA Blackwell B200 Compute Grid (512 Nodes)',
      datacenter: 'Equinix FR2 (Frankfurt, DE)',
      client: 'European Sovereign AI Research Consortium',
      yieldRate: '17.2% APY',
      contractValue: '$68.5M Committed',
      status: 'Under Setup',
      badgeStatus: 'pending',
    },
    {
      id: 'quant-mesh',
      name: 'Systematic High-Frequency Arbitrage Mesh',
      datacenter: 'Equinix NY4 / CME Aurora Cross-Connect',
      client: 'WavyAssets Proprietary Quant Syndicate',
      yieldRate: '21.4% Alpha',
      contractValue: '$40.0M Allocation',
      status: 'Completed Review',
      badgeStatus: 'settled',
    },
  ];

  return (
    <div className="w-full space-y-6" data-testid="panel-ai-funds">
      {/* Hero Section */}
      <div className="w-full bg-surface-container-low p-6 rounded-sm border border-outline/30 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-surface-container-high text-primary font-mono text-[10px] uppercase tracking-widest rounded-sm border border-outline/20">
                [ SMART AUTOMATED INVESTING // AI COMPUTE FUNDS ]
              </span>
              <span className="px-2 py-0.5 bg-secondary/15 text-secondary font-mono text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1 border border-secondary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                BACKED BY PHYSICAL HARDWARE
              </span>
            </div>

            <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Put your money to work with smart automated investing
            </h1>

            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Grow your wealth with automated strategies backed by real data center computing hardware.
              Set your rules once, and let our system handle the rest.
            </p>

            <div className="text-[11px] font-mono text-outline">
              Asset Category: <span className="text-on-surface font-semibold">AI Systematic Funds &amp; GPU Compute Mesh</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="btn-allocate-gpu"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-sans text-xs uppercase rounded-sm hover:bg-primary-hover transition-colors font-bold shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Start Hands-Free Investing</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface font-sans text-xs uppercase rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer border border-outline/20"
              >
                <Server className="w-3.5 h-3.5 text-primary" />
                <span>Explore Compute Facilities</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-container-lowest p-4 rounded-sm border border-outline/20 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-outline/20">
              <span className="font-sans text-[11px] uppercase text-outline tracking-wider font-semibold">
                HARDWARE PERFORMANCE
              </span>
              <span className="font-mono text-[10px] text-secondary font-semibold">
                99.98% UTILIZATION
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">CONTRACTED YIELD</div>
                <div className="font-mono text-xl font-bold text-primary pt-0.5">14.8%</div>
                <div className="font-mono text-[9px] text-secondary">Take-or-Pay Net</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">ONLINE GPUS</div>
                <div className="font-mono text-xl font-bold text-on-surface pt-0.5">1,536</div>
                <div className="font-mono text-[9px] text-outline">H100 &amp; B200</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">LEASE COMMITMENT</div>
                <div className="font-mono text-xl font-bold text-secondary pt-0.5">$160.5M</div>
                <div className="font-mono text-[9px] text-outline">Top Tech Clients</div>
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
            HOW OUR SMART INVESTING HELPS YOU GROW
          </h2>
          <div className="group relative cursor-pointer">
            <span className="font-mono text-[11px] text-outline flex items-center gap-1 hover:text-primary transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              What are smart rules?
            </span>
            <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-72 p-2.5 bg-surface-container-highest text-on-surface text-xs rounded-sm border border-outline shadow-lg z-20">
              Smart rules automatically balance your investment amount so you don&apos;t have to watch charts all day.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Backed by Real Hardware</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Your money supports working Nvidia compute centers leased to trusted technology companies.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary/15 text-secondary text-[10px] font-mono font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Smart Automated Rules</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Take the emotion out of investing with automated rules that protect your balance when markets shift.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-primary/15 text-primary text-[10px] font-mono font-semibold">
                Hands-Free Mode
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Daily Earned Returns</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Track your daily returns in your dashboard and withdraw your earnings whenever you want.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary/15 text-secondary text-[10px] font-mono font-semibold">
                Settled Daily
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clusters List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            AVAILABLE COMPUTE FACILITIES &amp; EARNING DETAILS
          </span>
          <span className="font-mono text-[10px] text-outline">
            POWER HOSTING: EQUINIX EMEA
          </span>
        </div>

        <div className="w-full bg-surface-container-low rounded-sm border border-outline/20 divide-y divide-outline/20">
          {clusters.map((c) => (
            <div
              key={c.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-semibold text-sm text-on-surface">{c.name}</span>
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.2 rounded-sm font-semibold ${
                      c.badgeStatus === 'active'
                        ? 'bg-secondary/15 text-secondary border border-secondary/20'
                        : c.badgeStatus === 'pending'
                        ? 'bg-primary/15 text-primary border border-primary/20'
                        : 'bg-surface-container-high text-on-surface-variant border border-outline/20'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="font-mono text-xs text-outline flex items-center gap-2">
                  <span>{c.datacenter}</span>
                  <span>&bull;</span>
                  <span className="text-on-surface-variant">{c.client}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end sm:self-center">
                <div className="text-right">
                  <div className="font-mono text-[10px] text-outline uppercase">Investment Amount</div>
                  <div className="font-mono text-sm font-bold text-on-surface">
                    {c.contractValue}
                  </div>
                </div>
                <div className="text-right min-w-[80px]">
                  <div className="font-mono text-[10px] text-outline uppercase">Net Annual Return</div>
                  <div className="font-mono text-base font-bold text-primary">{c.yieldRate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
