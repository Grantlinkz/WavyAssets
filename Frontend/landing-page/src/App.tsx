import React from 'react';
import { GlobalHeader } from './components/nav/GlobalHeader';
import { ServicesMegaMenu } from './components/nav/ServicesMegaMenu';
import { AmbientCanvas } from './components/canvas/AmbientCanvas';
import { useTerminalStore } from './store/useTerminalStore';
import {
  formatCurrency,
  formatPercent,
  formatBps,
  formatCompactNumber,
  getDeltaColorClass,
} from './lib/formatters';
import { ShieldCheck, Activity, Cpu, ArrowUpRight } from 'lucide-react';

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
  const resolvedTheme = useTerminalStore((state) => state.resolvedTheme);
  const activeAssetId = useTerminalStore((state) => state.activeAssetId);

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

      {/* 3. Hero & Foundation Status Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-surface-container border border-outline text-xs text-primary font-sans font-semibold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            <span>Sprint 1 Baseline Active</span>
            <span className="text-on-surface-variant">•</span>
            <span className="text-on-surface">Obsidian &amp; Fiduciary Light Ready</span>
          </div>

          <h1 className="font-headline-xl text-3xl sm:text-4xl text-on-surface font-bold tracking-tight">
            Cross-Asset Sovereign Custody &amp; Terminal Execution
          </h1>

          <p className="text-sm sm:text-base text-on-surface-variant font-sans leading-relaxed">
            Unified order execution and quantitative wealth orchestration spanning liquid digital
            assets, systematic equities, physical exotic vehicle vaults, AI compute infrastructure,
            and institutional prime real estate.
          </p>
        </section>

        {/* Diagnostic Metrics Matrix */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-md bg-surface-container-low border border-outline space-y-2">
            <div className="flex items-center justify-between text-xs uppercase font-label-caps text-on-surface-variant">
              <span>Audited Multi-Asset AUM</span>
              <span className="w-2 h-2 rounded-full bg-secondary" />
            </div>
            <div className="font-data-metric-lg text-2xl text-on-surface">
              {formatCompactNumber(4820000000)}
            </div>
            <div className="text-xs font-mono text-secondary flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% YoY Institutional Inflow</span>
            </div>
          </div>

          <div className="p-4 rounded-md bg-surface-container-low border border-outline space-y-2">
            <div className="flex items-center justify-between text-xs uppercase font-label-caps text-on-surface-variant">
              <span>DMA Routing Latency</span>
              <Cpu className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="font-data-metric-lg text-2xl text-on-surface">
              0.42 <span className="text-sm font-sans text-on-surface-variant">ms</span>
            </div>
            <div className="text-xs font-mono text-on-surface-variant">
              Sub-50ms Panel Swap Target: <span className="text-secondary">READY</span>
            </div>
          </div>

          <div className="p-4 rounded-md bg-surface-container-low border border-outline space-y-2">
            <div className="flex items-center justify-between text-xs uppercase font-label-caps text-on-surface-variant">
              <span>Active Theme &amp; Route</span>
              <span className="text-xs font-mono text-primary uppercase">{resolvedTheme}</span>
            </div>
            <div className="font-data-metric-lg text-2xl text-on-surface capitalize">
              {activeAssetId}
            </div>
            <div className="text-xs font-mono text-on-surface-variant">
              Sovereign Chamfer: <span className="text-primary">4px / 8px (0 pills)</span>
            </div>
          </div>
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
