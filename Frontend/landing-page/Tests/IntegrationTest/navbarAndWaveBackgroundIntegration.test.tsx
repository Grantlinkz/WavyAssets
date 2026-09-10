import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GlobalHeader } from '../../src/components/nav/GlobalHeader';
import { WavyBackground } from '../../src/components/canvas/WavyBackground';
import { App } from '../../src/App';
import { useTerminalStore } from '../../src/store/useTerminalStore';

describe('Navbar Sliding Dot Indicator & Wavy Background Integration Suite (SSR / Node 24)', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      isMegaMenuOpen: false,
      megaMenuCategory: 'all',
      activeAssetId: 'crypto',
    });
    window.location.hash = '';
  });

  describe('Navbar Sliding Dot Indicator', () => {
    it('renders the GlobalHeader with sliding dot indicator mounted', () => {
      const html = renderToString(<GlobalHeader />);
      expect(html).toContain('data-testid="navbar-sliding-dot"');
      // Sovereign Gold styling and micro-geometry
      expect(html).toContain('bg-primary');
      expect(html).toContain('rounded-full');
      expect(html).toContain('absolute bottom-0 left-0');
    });

    it('renders all nav links with hover-aware classes and current color styling', () => {
      const html = renderToString(<GlobalHeader />);
      expect(html).toContain('About');
      expect(html).toContain('Client Voices');
      expect(html).toContain('Contact');
      expect(html).toContain('Research');
      expect(html).toContain('text-on-surface-variant');
      expect(html).toContain('hover:text-on-surface');
    });

    it('renders active state on services trigger when mega-menu is open', () => {
      const html = renderToString(<GlobalHeader isMegaMenuOpen={true} />);
      expect(html).toContain('id="services-nav-trigger"');
      expect(html).toContain('border-primary/50 text-primary');
      expect(html).toContain('data-testid="navbar-sliding-dot"');
    });
  });

  describe('Seamless Looping Wave Background', () => {
    it('renders WavyBackground with Licorice (#08090B) and Jet Black (#0F1115) palette', () => {
      const html = renderToString(<WavyBackground />);
      expect(html).toContain('data-testid="wavy-background"');
      expect(html).toContain('data-testid="wavy-track"');
      expect(html).toContain('#08090B'); // Licorice
      expect(html).toContain('#0F1115'); // Jet Black
      expect(html).toContain('animate-wave-seamless');
    });

    it('contains two identical duplicated SVG tiles for continuous seamless tiling', () => {
      const html = renderToString(<WavyBackground />);
      // Both tile 1 and tile 2 are rendered in the track
      expect(html).toContain('viewBox="0 0 1440 900"');
      const tileMatches = html.match(/viewBox="0 0 1440 900"/g);
      expect(tileMatches?.length).toBe(2);
    });

    it('mounts WavyBackground as default background in App command deck', () => {
      const html = renderToString(<App />);
      expect(html).toContain('data-testid="wavy-background"');
      expect(html).toContain('data-testid="wavy-track"');
      expect(html).toContain('data-testid="navbar-sliding-dot"');
    });
  });
});
