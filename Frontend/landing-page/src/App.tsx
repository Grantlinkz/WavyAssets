import React from 'react';
import { GlobalHeader } from './components/nav/GlobalHeader';
import { ServicesMegaMenu } from './components/nav/ServicesMegaMenu';
import { AmbientCanvas } from './components/canvas/AmbientCanvas';
import { WavyBackground } from './components/canvas/WavyBackground';
import { PortfolioSimulator } from './components/simulator/PortfolioSimulator';
import { AssetDiscoveryHub } from './components/discovery/AssetDiscoveryHub';
import { AssetContainer } from './components/panels/AssetContainer';
import { UnifiedAuthModal } from './components/auth/UnifiedAuthModal';
import { TrustInfrastructure } from './components/trust/TrustInfrastructure';
import { ClientVoices } from './components/trust/ClientVoices';
import { CustodyNetworkGrid } from './components/trust/CustodyNetworkGrid';
import { InstitutionalFooter } from './components/footer/InstitutionalFooter';
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
      {/* Default Seamless Looping Sine-Wave Background (#08090B & #0F1115) */}
      <WavyBackground />

      {/* 3D Decoupled Ambient Mesh Canvas */}
      <AmbientCanvas />

      {/* 1. Institutional Fixed Global Header */}
      <GlobalHeader />

      {/* 2. 7-Vertical Services Mega-Menu Flyout (Docked directly under header) */}
      <ServicesMegaMenu />

      {/* 2. Global Syndicate Live Ticker Stream (Continuous Infinite Sliding Marquee) */}
      <div
        data-testid="syndicate-ticker-bar"
        className="relative w-full bg-surface-container-low border-b border-outline py-2 overflow-hidden whitespace-nowrap"
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 text-xs font-mono relative">
          {/* Static Title Badge */}
          <div className="flex items-center gap-2 shrink-0 text-primary font-bold uppercase tracking-wider text-[11px] bg-surface-container-low z-10 pr-3 border-r border-outline/30">
            <Activity className="w-3.5 h-3.5 text-secondary animate-pulse shrink-0" />
            <span className="hidden sm:inline">LIVE MARKET RATES</span>
            <span className="sm:hidden">RATES</span>
          </div>

          {/* Marquee Viewport with Left/Right Gradient Fade Masks */}
          <div className="relative flex-1 overflow-hidden">
            {/* Left fade edge */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-surface-container-low to-transparent z-10" />

            {/* Right fade edge */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface-container-low to-transparent z-10" />

            {/* Continuous Sliding Ribbon (Duplicated for seamless infinite loop) */}
            <div
              data-testid="syndicate-ticker-track"
              className="animate-ticker-continuous flex items-center gap-3 py-0.5"
            >
              {[...syndicateFeeds, ...syndicateFeeds].map((feed, idx) => (
                <div
                  key={`${feed.pair}-${idx}`}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-surface-container border border-outline shrink-0 hover:border-primary/50 transition-colors"
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
                  SYSTEM ACTIVE
                </span>
              </div>
              <span className="font-mono text-outline select-none">/</span>
              <span className="font-mono text-[11px] text-on-surface-variant truncate">
                LIVE SECURE STREAM • VERIFIED MERKLE PROOF
              </span>
              <span className="hidden md:inline font-mono text-outline select-none">/</span>
              <span className="hidden md:inline font-mono text-[11px] text-outline">
                SPEED: 0.28ms
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-sm border border-outline/20">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>MULTI-KEY VAULT AUDITED</span>
              </div>
              <a
                href="#portfolio-simulator"
                className="px-3 py-1 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface font-mono text-[11px] uppercase transition-colors border border-outline/20"
              >
                Portfolio Simulator
              </a>
            </div>
          </div>
        </section>

        {/* Section Hero: Eyebrow & Value Proposition */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-surface-container border border-outline/30 font-mono text-[11px] text-primary uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span>SMART ASSET ALLOCATION • REAL-TIME ESTIMATES</span>
            </div>

            <h1 className="font-headline-xl text-3xl sm:text-4xl text-on-surface font-bold tracking-tight">
              Smart Multi-Asset Wealth &amp; Digital Money Wallet
            </h1>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Grow and protect your money across stocks, smart AI funds, classic cars, and commercial
              properties. Model your balance with our interactive calculator, or open an account in minutes.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-4 bg-surface-container-low p-3.5 rounded-sm border border-outline/20 self-start md:self-auto shrink-0">
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
                Total Assets Tracked
              </div>
              <div className="font-mono text-lg font-bold text-on-surface">
                $1.482B
              </div>
            </div>
            <div className="w-px h-8 bg-surface-container-highest" />
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
                Average Annual Return
              </div>
              <div className="font-mono text-lg font-bold text-secondary">
                14.2%
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

        {/* Dynamic Standardized Asset Sub-Views Terminal (#/services/:assetId) */}
        <section id="asset-terminal" className="w-full pt-4">
          <AssetContainer />
        </section>

        {/* Institutional Trust Infrastructure: Audited Returns & Enclave Telemetry */}
        <section id="trust-infrastructure" className="w-full pt-4 scroll-mt-20">
          <TrustInfrastructure />
        </section>

        {/* Client Voices: Verified Allocator Endorsements (Specular 3D Cards) */}
        <section id="client-voices" className="w-full pt-4 scroll-mt-20">
          <ClientVoices />
        </section>

        {/* Institutional Clearing & Custody Network */}
        <section className="w-full pt-4 pb-4">
          <CustodyNetworkGrid />
        </section>
      </main>

      {/* 4. Global Compliance-Ready Multi-Column Institutional Footer */}
      <InstitutionalFooter />

      {/* 5. Globally Mounted Unified 2FA Auth & Mandate Modal */}
      <UnifiedAuthModal />
    </div>
  );
};

export default App;
