import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../../src/App';
import { useTerminalStore } from '../../src/store/useTerminalStore';

describe('Continuous Syndicate Ticker & Typography Integration', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      activeAssetId: 'crypto',
      isMegaMenuOpen: false,
    });
    window.location.hash = '';
  });

  it('renders the continuous ticker bar with animate-ticker-continuous and duplicated feeds for infinite looping', () => {
    const html = renderToString(<App />);

    // Ticker bar container
    expect(html).toContain('data-testid="syndicate-ticker-bar"');

    // Title badge
    expect(html).toContain('LIVE MARKET RATES');

    // Ticker continuous animation track
    expect(html).toContain('data-testid="syndicate-ticker-track"');
    expect(html).toContain('animate-ticker-continuous');

    // Feed pairs rendered
    expect(html).toContain('BTC/USD');
    expect(html).toContain('ETH/USD');
    expect(html).toContain('SPX 500');
    expect(html).toContain('AI GPU H100 YIELD');
    expect(html).toContain('PRIME RE CAP');
    expect(html).toContain('FERRARI GTO INDEX');
    expect(html).toContain('US 10Y SOV');

    // Verify duplication for infinite marquee loop (each pair appears at least 2 times)
    const btcMatches = html.match(/BTC\/USD/g);
    expect(btcMatches).not.toBeNull();
    expect(btcMatches!.length).toBeGreaterThanOrEqual(2);
  });
});
