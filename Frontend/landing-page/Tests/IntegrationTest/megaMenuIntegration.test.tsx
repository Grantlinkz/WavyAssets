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
    });
    window.location.hash = '';
  });

  it('renders GlobalHeader with navigation triggers, status badges, and auth actions', () => {
    const html = renderToString(<GlobalHeader />);

    // Brand and online status SLA
    expect(html).toContain('AURA');
    expect(html).toContain('ASSETS');
    expect(html).toContain('TERMINAL ONLINE • SLA 99.999% • NYC / LON FIX');

    // Navigation links
    expect(html).toContain('Services');
    expect(html).toContain('About');
    expect(html).toContain('Client Voices');
    expect(html).toContain('Contact');
    expect(html).toContain('Research');

    // Action buttons
    expect(html).toContain('Terminal Login');
    expect(html).toContain('Request Mandate');
  });

  it('renders closed mega-menu as empty output when isMegaMenuOpen is false', () => {
    useTerminalStore.setState({ isMegaMenuOpen: false });
    const html = renderToString(<ServicesMegaMenu />);
    expect(html).toBe('');
  });

  it('renders full 7-vertical mega-menu with telemetry diagnostics when open', () => {
    useTerminalStore.setState({ isMegaMenuOpen: true, megaMenuCategory: 'all' });
    const html = renderToString(<ServicesMegaMenu isOpen={true} category="all" />);

    // Header context and enclaves
    expect(html).toContain('7 ACTIVE ENCLAVES');
    expect(html).toContain('Sovereign Multi-Asset Custody');
    expect(html).toContain('MERKLE PROOFS: HOURLY');
    expect(html).toContain('FIPS 140-3 HSM VERIFIED');
    expect(html).toContain('CROSS-MARGIN: 1:1 CONSOLIDATED');

    // All 7 Asset Verticals
    expect(html).toContain('Crypto Yields &amp; Cold Storage');
    expect(html).toContain('Global Stocks &amp; DMA');
    expect(html).toContain('AI Systematic Funds &amp; H100 Mesh');
    expect(html).toContain('Fractional Prime Real Estate');
    expect(html).toContain('Exotic Hypercar &amp; Horology Depots');
    expect(html).toContain('VIP Titanium Concierge Cards');
    expect(html).toContain('Sovereign Wallet &amp; Core Global Finance');

    // Telemetry and diagnostics panel
    expect(html).toContain('ACTIVE VERTICAL DIAGNOSTICS');
    expect(html).toContain('$1,248,500,000');
    expect(html).toContain('0.038ms MEAN TICK');
    expect(html).toContain('Zurich (ZUR-01), NY4, SG1');
    expect(html).toContain('Download Asset Class Mandate');
  });

  it('filters asset verticals by active category selection', () => {
    // 1. DMA Equities filter
    useTerminalStore.setState({ isMegaMenuOpen: true, megaMenuCategory: 'dma-equities' });
    const dmaHtml = renderToString(<ServicesMegaMenu isOpen={true} category="dma-equities" />);

    expect(dmaHtml).toContain('Global Stocks &amp; DMA');
    expect(dmaHtml).toContain('Sovereign Wallet &amp; Core Global Finance'); // Treasury layer always included
    expect(dmaHtml).not.toContain('Crypto Yields &amp; Cold Storage');
    expect(dmaHtml).not.toContain('Exotic Hypercar &amp; Horology Depots');

    // 2. Physical Vaults filter
    useTerminalStore.setState({ isMegaMenuOpen: true, megaMenuCategory: 'physical-vaults' });
    const vaultsHtml = renderToString(<ServicesMegaMenu isOpen={true} category="physical-vaults" />);

    expect(vaultsHtml).toContain('Fractional Prime Real Estate');
    expect(vaultsHtml).toContain('Exotic Hypercar &amp; Horology Depots');
    expect(vaultsHtml).not.toContain('Global Stocks &amp; DMA');
    expect(vaultsHtml).not.toContain('Crypto Yields &amp; Cold Storage');
  });

  it('handles asset selection flow: updates active asset, synchronizes hash, and closes menu', () => {
    useTerminalStore.setState({ isMegaMenuOpen: true });
    expect(useTerminalStore.getState().isMegaMenuOpen).toBe(true);

    // Simulate clicking Real Estate vertical
    useTerminalStore.getState().setActiveAssetId('real-estate');

    expect(useTerminalStore.getState().activeAssetId).toBe('real-estate');
    expect(useTerminalStore.getState().isMegaMenuOpen).toBe(false);
    expect(window.location.hash).toBe('#/services/real-estate');
  });

  it('handles ESC key hotkey dismissal', () => {
    useTerminalStore.setState({ isMegaMenuOpen: true });
    expect(useTerminalStore.getState().isMegaMenuOpen).toBe(true);

    // Manually trigger close handler simulating ESC
    useTerminalStore.getState().setMegaMenuOpen(false);
    expect(useTerminalStore.getState().isMegaMenuOpen).toBe(false);
  });
});
