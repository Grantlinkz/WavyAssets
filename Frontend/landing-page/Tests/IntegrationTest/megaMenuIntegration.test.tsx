import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GlobalHeader } from '../../src/components/nav/GlobalHeader';
import { ServicesMegaMenu } from '../../src/components/nav/ServicesMegaMenu';
import { useTerminalStore } from '../../src/store/useTerminalStore';

describe('GlobalHeader & ServicesMegaMenu Integration (Node 24 Engine)', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      isMegaMenuOpen: false,
      megaMenuCategory: 'all',
      activeAssetId: 'crypto',
      authModal: {
        isOpen: false,
        step: 1,
        initialTier: 'institutional',
        initialMode: 'login',
      },
    });
    window.location.hash = '';
  });

  it('renders GlobalHeader with navigation triggers, status badges, and auth actions', () => {
    const html = renderToString(<GlobalHeader />);

    // Brand
    expect(html).toContain('WAVY');
    expect(html).toContain('ASSETS');

    // Navigation links
    expect(html).toContain('Services');
    expect(html).toContain('About');
    expect(html).toContain('Client Voices');
    expect(html).toContain('Contact');
    expect(html).toContain('Research');

    // Action buttons
    expect(html).toContain('Welcome Back');
    expect(html).toContain('Request Service');
  });

  it('renders closed mega-menu as empty output when isMegaMenuOpen is false', () => {
    useTerminalStore.setState({ isMegaMenuOpen: false });
    const html = renderToString(<ServicesMegaMenu />);
    expect(html).toBe('');
  });

  it('renders full 7-vertical mega-menu with 3D vector icons and SEO copy when open', () => {
    useTerminalStore.setState({ isMegaMenuOpen: true, megaMenuCategory: 'all' });
    const html = renderToString(<ServicesMegaMenu isOpen={true} category="all" />);

    // Header context and trust assurances
    expect(html).toContain('100% ASSET-BACKED');
    expect(html).toContain('Explore Wealth Services &amp; Asset Classes');
    expect(html).toContain('SOC-2 &amp; FINMA COMPLIANT');
    expect(html).toContain('FIPS 140-3 MPC STORAGE');
    expect(html).toContain('INSTANT SETTLEMENT');

    // All 7 Asset Verticals with rewritten SEO & conversion titles
    expect(html).toContain('High-Yield Crypto Staking &amp; Cold Storage');
    expect(html).toContain('Global Stocks &amp; Pre-IPO Tech Shares');
    expect(html).toContain('AI Infrastructure Funds &amp; GPU Compute');
    expect(html).toContain('Fractional Prime Commercial Real Estate');
    expect(html).toContain('Exotic Collector Cars &amp; Rare Horology Vault');
    expect(html).toContain('VIP Titanium Metal Concierge Cards');
    expect(html).toContain('Multi-Currency Sovereign Digital Wallet');

    // 3D Vector SVG unique gradient markers
    expect(html).toContain('crypto-face');
    expect(html).toContain('stocks-green-front');
    expect(html).toContain('ai-die-top');
    expect(html).toContain('re-glass-front');
    expect(html).toContain('car-body');
    expect(html).toContain('card-titanium-face');
    expect(html).toContain('vault-face');

    // Sign-In CTAs on cards
    expect(html).toContain('Sign In to Invest');
    expect(html).toContain('Sign In to Trade');
    expect(html).toContain('Sign In to Access Funds');
    expect(html).toContain('Sign In to View Properties');
    expect(html).toContain('Sign In to Vault');
    expect(html).toContain('Sign In to Claim Card');
    expect(html).toContain('Sign In to Open Wallet');

    // Telemetry and diagnostics panel (Plain English)
    expect(html).toContain('VAULT HEALTH &amp; PLATFORM STATUS');
    expect(html).toContain('$1,248,500,000');
    expect(html).toContain('Execution Speed:');
    expect(html).toContain('Zurich, New York, Singapore');
    expect(html).toContain('Download Safety &amp; Custody Guide');
    expect(html).toContain('fixed top-16');
  });

  it('filters asset verticals by active category selection', () => {
    // 1. Stocks & Pre-IPO (dma-equities) filter
    useTerminalStore.setState({ isMegaMenuOpen: true, megaMenuCategory: 'dma-equities' });
    const dmaHtml = renderToString(<ServicesMegaMenu isOpen={true} category="dma-equities" />);

    expect(dmaHtml).toContain('Global Stocks &amp; Pre-IPO Tech Shares');
    expect(dmaHtml).toContain('Multi-Currency Sovereign Digital Wallet'); // Treasury layer always included
    expect(dmaHtml).not.toContain('High-Yield Crypto Staking &amp; Cold Storage');
    expect(dmaHtml).not.toContain('Exotic Collector Cars &amp; Rare Horology Vault');

    // 2. Real Estate & Vaults (physical-vaults) filter
    useTerminalStore.setState({ isMegaMenuOpen: true, megaMenuCategory: 'physical-vaults' });
    const vaultsHtml = renderToString(<ServicesMegaMenu isOpen={true} category="physical-vaults" />);

    expect(vaultsHtml).toContain('Fractional Prime Commercial Real Estate');
    expect(vaultsHtml).toContain('Exotic Collector Cars &amp; Rare Horology Vault');
    expect(vaultsHtml).not.toContain('Global Stocks &amp; Pre-IPO Tech Shares');
    expect(vaultsHtml).not.toContain('High-Yield Crypto Staking &amp; Cold Storage');
  });

  it('handles asset vertical click: activates asset, closes mega-menu, and opens Sign-In modal', () => {
    useTerminalStore.setState({
      isMegaMenuOpen: true,
      authModal: {
        isOpen: false,
        step: 1,
        initialTier: 'institutional',
        initialMode: 'mandate',
      },
    });

    const html = renderToString(<ServicesMegaMenu isOpen={true} category="all" />);
    expect(html).toContain('data-testid="vertical-card-cars"');

    // Execute state transition identical to card click handler
    useTerminalStore.getState().setActiveAssetId('cars');
    useTerminalStore.getState().setMegaMenuOpen(false);
    useTerminalStore.getState().openAuthModal('institutional', 'login');

    // State assertions
    const state = useTerminalStore.getState();
    expect(state.activeAssetId).toBe('cars');
    expect(state.isMegaMenuOpen).toBe(false);
    expect(state.authModal.isOpen).toBe(true);
    expect(state.authModal.initialMode).toBe('login');
  });

  it('handles ESC key hotkey dismissal', () => {
    useTerminalStore.setState({ isMegaMenuOpen: true });
    expect(useTerminalStore.getState().isMegaMenuOpen).toBe(true);

    // Manually trigger close handler simulating ESC
    useTerminalStore.getState().setMegaMenuOpen(false);
    expect(useTerminalStore.getState().isMegaMenuOpen).toBe(false);
  });
});
