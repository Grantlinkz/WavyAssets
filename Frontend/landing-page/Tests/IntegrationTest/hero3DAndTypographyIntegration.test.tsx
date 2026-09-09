import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HeroAssetGyroscope } from '../../src/components/canvas/HeroAssetGyroscope';
import { KineticHeroTypography } from '../../src/components/hero/KineticHeroTypography';
import { App } from '../../src/App';
import { useTerminalStore } from '../../src/store/useTerminalStore';

describe('3D Hero Asset Gyroscope & Kinetic Typography Integration Suite (SSR / Node 24)', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      isMegaMenuOpen: false,
      megaMenuCategory: 'all',
      activeAssetId: 'crypto',
    });
    window.location.hash = '';
  });

  describe('Kinetic Hero Typography', () => {
    it('renders with kinetic-hero-typography container and real-time estimates badge', () => {
      const html = renderToString(<KineticHeroTypography />);
      expect(html).toContain('data-testid="kinetic-hero-typography"');
      expect(html).toContain('SMART ASSET ALLOCATION • REAL-TIME ESTIMATES');
    });

    it('renders kinetic headline words', () => {
      const html = renderToString(<KineticHeroTypography />);
      expect(html).toContain('Smart');
      expect(html).toContain('Multi-Asset');
      expect(html).toContain('Wealth');
      expect(html).toContain('Digital');
      expect(html).toContain('Money');
      expect(html).toContain('Wallet');
    });

    it('renders descriptive copy for multi-asset wealth allocation', () => {
      const html = renderToString(<KineticHeroTypography />);
      expect(html).toContain('Grow and protect your money across stocks');
      expect(html).toContain('smart AI funds, classic cars, and commercial properties');
    });
  });

  describe('Pure 3D Hero Asset Gyroscope Viewport', () => {
    it('renders hero-asset-gyroscope container and clean canvas viewport', () => {
      const html = renderToString(<HeroAssetGyroscope />);
      expect(html).toContain('data-testid="hero-asset-gyroscope"');
      expect(html).toContain('data-testid="gyroscope-canvas-container"');
    });

    it('does not render card badges or telemetry HUD boxes, preserving pure 3D presentation', () => {
      const html = renderToString(<HeroAssetGyroscope />);
      expect(html).not.toContain('7-TIER SOVEREIGN GYROSCOPE');
      expect(html).not.toContain('MPC MPC-VAULT');
      expect(html).not.toContain('Total Assets Tracked');
    });
  });

  describe('Hero Section Integration in App Command Deck', () => {
    it('mounts both KineticHeroTypography and pure 3D HeroAssetGyroscope inside hero-section', () => {
      const html = renderToString(<App />);
      expect(html).toContain('data-testid="hero-section"');
      expect(html).toContain('data-testid="kinetic-hero-typography"');
      expect(html).toContain('data-testid="hero-asset-gyroscope"');
      expect(html).toContain('data-testid="gyroscope-canvas-container"');
    });
  });
});
