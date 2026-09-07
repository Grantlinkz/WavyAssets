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
    expect(html).toContain('PORTFOLIO CALIBRATION PARAMETERS');
    expect(html).toContain('Target Allocation Capital');
    expect(html).toContain('$250,000.00');

    // Risk posture default (Balanced Growth 14.2%)
    expect(html).toContain('Balanced Growth');
    expect(html).toContain('14.2');

    // Projected net returns
    expect(html).toContain('ESTIMATED 12-MONTH NET RETURN');
    expect(html).toContain('$35,500.00');
    expect(html).toContain('$2,958.00');

    // Donut chart segment names
    expect(html).toContain('Bonded Hypercars &amp; Gold');
    expect(html).toContain('AI H100 GPU Lease Arbitrage');
    expect(html).toContain('DMA Equities &amp; Swiss Staking');

    // Fiduciary badges
    expect(html).toContain('Continuous Epoch');
    expect(html).toContain('Zurich / NY4 Equinix');
    expect(html).toContain('1:1 Non-Hypothecated');
    expect(html).toContain('Tier-1 Lloyds');
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
    expect(html).toContain('Maximum Alpha');
    expect(html).toContain('22.4');
    expect(html).toContain('$224,000.00');
    expect(html).toContain('$18,667.00');
    expect(html).toContain('Tier-1 Swiss Re');
  });

  it('renders AssetDiscoveryHub with 7 vault classes and active depository card', () => {
    const html = renderToString(<AssetDiscoveryHub activeId="cars" />);

    // Hub tag & count
    expect(html).toContain('[ DISCOVERY VERTICALS // VERIFIED PHYSICAL &amp; DIGITAL VAULTS ]');
    expect(html).toContain('7 VAULT CLASSES ONLINE');

    // 7 Tabs
    expect(html).toContain('01 // CRYPTO');
    expect(html).toContain('02 // EQUITIES');
    expect(html).toContain('03 // COMPUTE');
    expect(html).toContain('04 // ESTATES');
    expect(html).toContain('05 // DEPOSITORY');
    expect(html).toContain('06 // PRIVILEGE');
    expect(html).toContain('07 // TREASURY');

    // Default cars vault card
    expect(html).toContain('Exotic Hypercars &amp; Horology Freeport Vaults');
    expect(html).toContain('FREEPORT AUDITED (38 UNITS)');
    expect(html).toContain('$348,000,000');
  });

  it('synchronizes depository panel and updates route hash when switching active asset', () => {
    useTerminalStore.getState().setActiveAssetId('real-estate');

    expect(useTerminalStore.getState().activeAssetId).toBe('real-estate');
    expect(window.location.hash).toBe('#/services/real-estate');

    const html = renderToString(<AssetDiscoveryHub activeId="real-estate" />);
    expect(html).toContain('Tokenized Prime Commercial &amp; Freehold Real Estate');
    expect(html).toContain('CADASTRE VERIFIED');
    expect(html).toContain('$485,000,000');
  });
});
