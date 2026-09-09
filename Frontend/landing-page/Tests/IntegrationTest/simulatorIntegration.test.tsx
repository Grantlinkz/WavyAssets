import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PortfolioSimulator } from '../../src/components/simulator/PortfolioSimulator';
import { AssetDiscoveryHub } from '../../src/components/discovery/AssetDiscoveryHub';
import { useTerminalStore } from '../../src/store/useTerminalStore';

describe('Portfolio Simulator & Asset Discovery Hub Integration', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      simulator: {
        capital: 250000,
        aggressiveness: 2,
      },
      activeAssetId: 'cars',
    });
    window.location.hash = '';
  });

  it('renders default balanced growth simulation with accurate financial metrics', () => {
    const html = renderToString(
      <PortfolioSimulator initialCapital={250000} initialAggressiveness={2} />
    );

    // Parameter header and slider title
    expect(html).toContain('PORTFOLIO ESTIMATION SETTINGS');
    expect(html).toContain('Your Investment Amount');
    expect(html).toContain('$250,000.00');

    // Risk posture default (Balanced Growth 14.2%)
    expect(html).toContain('Balanced Growth');
    expect(html).toContain('14.2');

    // Projected net returns
    expect(html).toContain('ESTIMATED 12-MONTH RETURN');
    expect(html).toContain('$35,500.00');
    expect(html).toContain('$2,958.00');

    // Donut chart segment names
    expect(html).toContain('Luxury Cars &amp; Gold');
    expect(html).toContain('AI Computing Funds');
    expect(html).toContain('Global Stocks &amp; Crypto');

    // Fiduciary badges
    expect(html).toContain('Continuous Epoch');
    expect(html).toContain('Zurich / NY4 Equinix');
    expect(html).toContain('1:1 Non-Hypothecated');
    expect(html).toContain('Lloyd&#x27;s Insured');
  });

  it('dynamically recalculates outputs when capital and aggressiveness are adjusted', () => {
    useTerminalStore.setState({
      simulator: {
        capital: 1000000,
        aggressiveness: 3,
      },
    });

    const html = renderToString(
      <PortfolioSimulator initialCapital={1000000} initialAggressiveness={3} />
    );

    expect(html).toContain('$1,000,000.00');
    expect(html).toContain('MAXIMUM ALPHA');
    expect(html).toContain('22.4');
    expect(html).toContain('$224,000.00');
    expect(html).toContain('$18,667.00');
    expect(html).toContain('Swiss Re Insured');
  });

  it('renders AssetDiscoveryHub with 7 vault classes and active depository card', () => {
    const html = renderToString(<AssetDiscoveryHub activeId="cars" />);

    // Hub tag & count
    expect(html).toContain('DISCOVERY VERTICALS • VERIFIED ASSET VAULTS');
    expect(html).toContain('ALL ONLINE');

    // 7 Tabs
    expect(html).toContain('CRYPTO');
    expect(html).toContain('EQUITIES');
    expect(html).toContain('COMPUTE');
    expect(html).toContain('ESTATES');
    expect(html).toContain('DEPOSITORY');
    expect(html).toContain('PRIVILEGE');
    expect(html).toContain('TREASURY');

    // Default cars vault card
    expect(html).toContain('Browse &amp; Invest in Collector Cars');
    expect(html).toContain('38 CARS IN CLIMATE VAULT');
    expect(html).toContain('$348,000,000');
  });

  it('synchronizes depository panel and updates route hash when switching active asset', () => {
    useTerminalStore.getState().setActiveAssetId('real-estate');

    expect(useTerminalStore.getState().activeAssetId).toBe('real-estate');
    expect(window.location.hash).toBe('#/services/real-estate');

    const html = renderToString(<AssetDiscoveryHub activeId="real-estate" />);
    expect(html).toContain('Prime Commercial Property Shares &amp; Rental Income');
    expect(html).toContain('NOTARIZED PROPERTY TITLE');
    expect(html).toContain('$485,000,000');
  });
});
