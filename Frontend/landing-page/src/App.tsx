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
import { InstitutionalFooter } from './components/footer/InstitutionalFooter';
import { HeroAssetGyroscope } from './components/canvas/HeroAssetGyroscope';
import { KineticHeroTypography } from './components/hero/KineticHeroTypography';
import { AboutSection } from './components/about/AboutSection';
import { ContactModal } from './components/contact/ContactModal';
import { NotFoundPage } from './components/common/NotFoundPage';
import { TerminalErrorBoundary } from './components/error/TerminalErrorBoundary';
import { useTerminalStore } from './store/useTerminalStore';
import { initSystemLanguage } from './lib/locale';
import {
  formatCurrency,
  formatPercent,
  formatBps,
  getDeltaColorClass,
} from './lib/formatters';
import { Activity } from 'lucide-react';
import { telemetryApi } from './lib/api';

export interface TickerFeedItem {
  pair: string;
  price?: number;
  delta?: number;
  apy?: number;
  capRate?: number;
  yieldRate?: number;
  bps?: number;
  type?: string;
}

const syndicateFeeds: TickerFeedItem[] = [
  { pair: 'BTC/USD', price: 94240.5, delta: 2.84, type: 'crypto' },
  { pair: 'ETH/USD', price: 3420.1, delta: 1.91, type: 'crypto' },
  { pair: 'SPX 500', price: 5980.2, delta: 0.42, type: 'stocks' },
  { pair: 'AI GPU H100 YIELD', apy: 14.8, type: 'yield' },
  { pair: 'PRIME RE CAP', capRate: 7.2, type: 'real-estate' },
  { pair: 'FERRARI GTO INDEX', delta: 18.4, type: 'exotics' },
  { pair: 'US 10Y SOV', yieldRate: 4.62, bps: -3, type: 'treasury' },
];

export interface AppProps {
  is404?: boolean;
}

export const App: React.FC<AppProps> = ({ is404: is404Prop }) => {
  const [liveFeeds, setLiveFeeds] = React.useState<TickerFeedItem[]>(syndicateFeeds);
  const storeIs404 = useTerminalStore((state) => state.is404);
  const is404 =
    is404Prop !== undefined
      ? is404Prop
      : storeIs404 || useTerminalStore.getState().is404;
  const setIs404 = useTerminalStore((state) => state.setIs404);
  const activeAssetId = useTerminalStore((state) => state.activeAssetId);
  const syncFromHash = useTerminalStore((state) => state.syncFromHash);

  const openAuthModal = useTerminalStore((state) => state.openAuthModal);

  // Initialize system language and listen to hash / popstate routing changes
  React.useEffect(() => {
    initSystemLanguage();
    syncFromHash();
    const handleRoutingChange = () => syncFromHash();
    window.addEventListener('hashchange', handleRoutingChange);
    window.addEventListener('popstate', handleRoutingChange);

    // Detect ?auth=signin or ?auth=mandate from User Dashboard redirection
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const authParam = urlParams.get('auth');
      if (authParam === 'signin' || authParam === 'login' || authParam === 'mandate' || authParam === 'register') {
        if (authParam === 'signin' || authParam === 'login') {
          openAuthModal('institutional', 'login');
        } else {
          openAuthModal('institutional', 'mandate');
        }
        urlParams.delete('auth');
        const remainingQuery = urlParams.toString();
        const cleanUrl =
          window.location.pathname +
          (remainingQuery ? `?${remainingQuery}` : '') +
          window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }

    return () => {
      window.removeEventListener('hashchange', handleRoutingChange);
      window.removeEventListener('popstate', handleRoutingChange);
    };
  }, [syncFromHash, openAuthModal]);

  // Fetch real-time market benchmark quotes from telemetry gateway
  React.useEffect(() => {
    let isMounted = true;
    const fetchQuotes = async () => {
      try {
        const res = await telemetryApi.getTickerQuotes();
        if (res.data?.quotes && res.data.quotes.length > 0 && isMounted) {
          const mapped: TickerFeedItem[] = res.data.quotes.map((q) => {
            const deltaVal = parseFloat(q.change24h.replace(/[^0-9.-]/g, '')) || 0;
            return {
              pair: q.symbol,
              price: q.price,
              delta: deltaVal,
              type: q.category.toLowerCase(),
            };
          });
          setLiveFeeds(mapped);
        }
      } catch {
        // Resilient silent fallback to default syndicate benchmarks
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <TerminalErrorBoundary sectionName="Global Terminal Shell">
      <div className="min-h-screen bg-surface text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary-container relative">
        {/* WCAG 2.1 AA Keyboard Accessibility: Skip to Main Content Link */}
        <a
          href="#main-content"
          data-testid="skip-to-content-link"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:font-semibold focus:text-xs focus:rounded-sm focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>

        {/* Screen Reader ARIA Live Region for Route Announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          data-testid="screen-reader-live-announcements"
        >
          {is404
            ? 'Page or vault record not found. Error 404.'
            : `Terminal active view: ${activeAssetId}`}
        </div>
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
              {[...liveFeeds, ...liveFeeds].map((feed, idx) => (
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
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-12 relative z-10 min-h-[540px] focus:outline-none"
      >
        {is404 ? (
          <NotFoundPage onReset={() => setIs404(false)} />
        ) : (
          <>
            {/* Section Hero: Kinetic Typography & Interactive 3D Asset Gyroscope */}
            <section
              data-testid="hero-section"
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-2"
            >
              {/* Left: Kinetic Typography Entrance */}
              <KineticHeroTypography />

              {/* Right: Interactive 3D Web Asset Hero Gyroscope Container */}
              <HeroAssetGyroscope />
            </section>

            {/* About Section: 3D Vault Canvas (Left) & Institutional Editorial Write-Up (Right) */}
            <AboutSection />

            {/* 2-Column Obsidian Console: Portfolio Simulator */}
            <section id="portfolio-simulator" className="w-full scroll-mt-20">
              <PortfolioSimulator />
            </section>

            {/* Dynamic Asset Discovery Verticals Hub */}
            <section className="w-full pt-4">
              <AssetDiscoveryHub />
            </section>

            {/* Dynamic Standardized Asset Sub-Views Terminal (#/services/:assetId) */}
            <section id="asset-terminal" className="w-full pt-4 scroll-mt-20">
              <AssetContainer />
            </section>

            {/* Institutional Trust Infrastructure: Audited Returns & Enclave Telemetry */}
            <section id="trust-infrastructure" className="w-full pt-4 scroll-mt-20">
              <TrustInfrastructure />
            </section>

            {/* Client Voices: Verified Allocator Endorsements (Specular 3D Cards) */}
            <section id="client-voices" className="w-full pt-4 pb-4 scroll-mt-20">
              <ClientVoices />
            </section>
          </>
        )}
      </main>

      {/* 4. Global Compliance-Ready Multi-Column Institutional Footer */}
      <InstitutionalFooter />

      {/* 5. Globally Mounted Unified 2FA Auth & Mandate Modal */}
      <UnifiedAuthModal />

      {/* 6. Globally Mounted Institutional B2B Contact Modal */}
      <ContactModal />
    </div>
  </TerminalErrorBoundary>
  );
};

export default App;
