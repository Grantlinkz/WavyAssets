import React from 'react';
import { GlobalHeader } from './components/nav/GlobalHeader';
import { ServicesMegaMenu } from './components/nav/ServicesMegaMenu';
import { AmbientCanvas } from './components/canvas/AmbientCanvas';
import { PortfolioSimulator } from './components/simulator/PortfolioSimulator';
import { AssetDiscoveryHub } from './components/discovery/AssetDiscoveryHub';
import {
  formatCurrency,
  formatPercent,
  formatBps,
  getDeltaColorClass,
} from './lib/formatters';
import { ShieldCheck, Activity } from 'lucide-react';

const syndicateFeeds = [
  { pair: 'BTC/USD', price: 94240.5, delta: 2.84, type: 'crypto' },
  { pair: 'ETH/USD', price: 3420.1, delta: 1.91, type: 'crypto' },
  { pair: 'SPX 500', price: 5980.2, delta: 0.42, type: 'stocks' },
  { pair: 'AI GPU H100 YIELD', apy: 14.8, type: 'yield' },
  { pair: 'PRIME RE CAP', capRate: 7.2, type: 'real-estate' },
  { pair: 'FERRARI GTO INDEX', delta: 18.4, type: 'exotics' },
  { pair: 'US 10Y SOV', yieldRate: 4.62, bps: -3, type: 'treasury' },
];

export const App: React.FC = () => {

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary-container relative">
      {/* 3D Decoupled Ambient Mesh Canvas */}
      <AmbientCanvas />

      {/* 1. Institutional Fixed Global Header */}
      <GlobalHeader />

      {/* 2. 7-Vertical Services Mega-Menu Flyout (Docked directly under header) */}
      <ServicesMegaMenu />

      {/* 2. Global Syndicate Live Ticker Stream */}
      <div className="w-full bg-surface-container-low border-b border-outline py-2 overflow-x-auto whitespace-nowrap">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 shrink-0 text-primary font-bold uppercase tracking-wider text-[11px]">
            <Activity className="w-3.5 h-3.5 text-secondary animate-pulse" />
            <span>GLOBAL SYNDICATE FEED</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto py-0.5">
            {syndicateFeeds.map((feed, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-surface-container border border-outline"
              >
                <span className="text-on-surface-variant font-medium">{feed.pair}</span>
                {feed.price && (
                  <span className="text-on-surface font-semibold">
                    {formatCurrency(feed.price)}
                  </span>
                )}
                {feed.delta !== undefined && (
                  <span className={`font-semibold ${getDeltaColorClass(feed.delta)}`}>
                    {formatPercent(feed.delta)}
                  </span>
                )}
                {feed.apy !== undefined && (
                  <span className="text-primary font-semibold">
                    {formatPercent(feed.apy, false)} APY
                  </span>
                )}
                {feed.capRate !== undefined && (
                  <span className="text-secondary font-semibold">
                    {formatPercent(feed.capRate, false)} NET
                  </span>
                )}
                {feed.yieldRate !== undefined && (
                  <span className="text-on-surface font-semibold">
                    {formatPercent(feed.yieldRate, false)}
                  </span>
                )}
                {feed.bps !== undefined && (
                  <span className={`font-semibold ${getDeltaColorClass(-feed.bps)}`}>
                    {formatBps(feed.bps)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Terminal Command Deck & Interactive Simulator */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-12 relative z-10 min-h-[540px]">
        {/* Status Breadcrumb Strip */}
        <section className="w-full bg-surface-container-lowest/80 backdrop-blur-md px-4 py-2.5 rounded-sm border border-outline/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-secondary font-semibold">
                  TERMINAL ONLINE
                </span>
              </div>
              <span className="font-mono text-outline select-none">/</span>
              <span className="font-mono text-[11px] text-on-surface-variant truncate">
                FIX 4.4 STREAM ROUTE: NY4.EQUINIX • MERKLE: 0x8F92...C41A
              </span>
              <span className="hidden md:inline font-mono text-outline select-none">/</span>
              <span className="hidden md:inline font-mono text-[11px] text-outline">
                LATENCY: 0.28ms
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-sm border border-outline/20">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>TIER-1 MULTI-CUSTODY AUDITED</span>
              </div>
              <a
                href="#portfolio-simulator"
                className="px-3 py-1 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface font-mono text-[11px] uppercase transition-colors border border-outline/20"
              >
                Simulator Mode
              </a>
            </div>
          </div>
        </section>

        {/* Section Hero: Eyebrow & Institutional Framing */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-surface-container border border-outline/30 font-mono text-[11px] text-primary uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span>[ INTERACTIVE ENGINE // REAL-TIME CROSS-ASSET YIELD MATRIX ]</span>
            </div>

            <h1 className="font-headline-xl text-3xl sm:text-4xl text-on-surface font-bold tracking-tight">
              Institutional Portfolio Simulator &amp; Asset Discovery
            </h1>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Dynamic cross-collateralized modeling across sovereign bonded hypercars, GPU compute
              lease clusters, and liquid Swiss multi-asset staking. Programmed for sovereign
              balance sheets and family office treasuries.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-4 bg-surface-container-low p-3.5 rounded-sm border border-outline/20 self-start md:self-auto shrink-0">
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
                AUM Mapped
              </div>
              <div className="font-mono text-lg font-bold text-on-surface">
                $1.482B
              </div>
            </div>
            <div className="w-px h-8 bg-surface-container-highest" />
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
                Mean 3Y Sharpe
              </div>
              <div className="font-mono text-lg font-bold text-secondary">
                2.91
              </div>
            </div>
          </div>
        </section>

        {/* 2-Column Obsidian Console: Portfolio Simulator */}
        <section id="portfolio-simulator" className="w-full scroll-mt-20">
          <PortfolioSimulator />
        </section>

        {/* Dynamic Asset Discovery Verticals Hub */}
        <section className="w-full pt-4">
          <AssetDiscoveryHub />
        </section>
      </main>

      {/* 4. Institutional Terminal Status Footer Strip */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline py-4 px-4 text-xs font-mono text-on-surface-variant">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>VALIANCE_OS // NODE_09.NY // QUORUM_ACTIVE</div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>SOC-2 TYPE II AUDITED</span>
            <span>•</span>
            <span>MPC MERKLE RESERVES VERIFIED</span>
            <span>•</span>
            <span>ZERO CLS ARCHITECTURE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
