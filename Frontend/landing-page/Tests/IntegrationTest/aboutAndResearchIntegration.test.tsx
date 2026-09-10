import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AboutSection } from '../../src/components/about/AboutSection';
import { AboutVaultCanvas3D } from '../../src/components/about/AboutVaultCanvas3D';
import { UnifiedFinanceInfographic3D } from '../../src/components/about/UnifiedFinanceInfographic3D';
import { AssetDiscoveryHub } from '../../src/components/discovery/AssetDiscoveryHub';
import { GlobalHeader } from '../../src/components/nav/GlobalHeader';
import { parseAssetHash, useTerminalStore } from '../../src/store/useTerminalStore';
import App from '../../src/App';

describe('About Section, Research Routing & Portfolio Service Action Integration Suite (SSR / Node 24)', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      activeAssetId: 'crypto',
      isMegaMenuOpen: false,
      authModal: {
        isOpen: false,
        step: 1,
        initialTier: 'institutional',
        initialMode: 'login',
      },
    });
    window.location.hash = '';
  });

  describe('1. 3D About Section & Senior UX Write-Up', () => {
    it('renders AboutSection with id="about", headline, 3 pillars, regulatory credentials, and 3D infographic', () => {
      const html = renderToString(<AboutSection />);

      expect(html).toContain('id="about"');
      expect(html).toContain('data-testid="about-section"');
      expect(html).toContain('ABOUT WAVYASSETS ');
      expect(html).toContain('Pioneering Multi-Asset Freedom and Cold-Storage Security');
      expect(html).toContain('data-testid="unified-finance-infographic-3d"');
      expect(html).toContain('Unified Multi-Asset Depository');
      expect(html).toContain('Bank-Grade MPC Cold Storage');
      expect(html).toContain('Direct Liquidity &amp; Global Settlement');
      expect(html).toContain('SEC REGISTERED RIA 801-128491');
      expect(html).toContain('FINMA REGULATED VQF SWITZERLAND');
      expect(html).toContain('SOC-2 TYPE II AUDITED');
      expect(html).toContain('Create Your Account');
      expect(html).toContain('Explore Simulator');
    });

    it('renders UnifiedFinanceInfographic3D verifying all core prompt specifications', () => {
      const html = renderToString(<UnifiedFinanceInfographic3D />);

      expect(html).toContain('data-testid="unified-finance-infographic-3d"');
      expect(html).toContain('WAVYASSETS: THE FUTURE OF UNIFIED FINANCE');
      expect(html).toContain(
        'WAVYASSETS UNIFIES: GLOBAL WEALTH MANAGEMENT | DIGITAL ASSET CUSTODY | INSTITUTIONAL YIELD GENERATION'
      );
      expect(html).toContain('COLD-STORAGE SECURITY');
      expect(html).toContain('PIONEERING MULTI-ASSET FREEDOM');
      expect(html).toContain('Gold Bars &amp; Bullion Coins');
      expect(html).toContain('₿ Bitcoin');
      expect(html).toContain('Ξ Ethereum');
      expect(html).toContain('TARGET CLIENT SEGMENTS');
      expect(html).toContain('Family Offices');
      expect(html).toContain('Institutions');
      expect(html).toContain('Smart Individual Investors');
      expect(html).toContain('ELIMINATES THE CHAOS');
      expect(html).toContain('Scattered Charts');
      expect(html).toContain('Bank Facade');
      expect(html).toContain('Locked Safe');
      expect(html).toContain('Pie Charts');
      expect(html).toContain('TOTAL CONTROL, MATHEMATICAL TRANSPARENCY, AND PEACE OF MIND.');
    });

    it('renders AboutVaultCanvas3D container with sovereign custody telemetry', () => {
      const html = renderToString(<AboutVaultCanvas3D />);

      expect(html).toContain('data-testid="about-vault-canvas-container"');
      expect(html).toContain('SOVEREIGN CUSTODY NODE // VERIFIED');
    });
  });

  describe('2. Asset Discovery Hub View Portfolio Service Action', () => {
    it('renders View Portfolio Service button with data-testid and accessible uppercase label', () => {
      const html = renderToString(<AssetDiscoveryHub activeId="crypto" />);

      expect(html).toContain('data-testid="discovery-view-portfolio-service-btn"');
      expect(html).toContain('View Portfolio Service');
    });
  });

  describe('3. Research Routing & Navigation Linking', () => {
    it('resolves /research, #research, and /research#/services/vip-cards to vip-cards', () => {
      expect(parseAssetHash('/research#/services/vip-cards')).toBe('vip-cards');
      expect(parseAssetHash('#research')).toBe('vip-cards');
      expect(parseAssetHash('/research')).toBe('vip-cards');
      expect(parseAssetHash('#/services/vip-cards')).toBe('vip-cards');
    });

    it('renders GlobalHeader with Research link pointing to /research#/services/vip-cards', () => {
      const html = renderToString(<GlobalHeader />);

      expect(html).toContain('href="/research#/services/vip-cards"');
      expect(html).toContain('Research');
      expect(html).toContain('href="#about"');
      expect(html).toContain('About');
    });
  });

  describe('4. Full App Command Deck Mounting', () => {
    it('mounts AboutSection inside App command deck alongside other institutional sections', () => {
      useTerminalStore.setState({
        authModal: { isOpen: true, step: 1, initialTier: 'institutional' },
      });
      const html = renderToString(<App />);

      expect(html).toContain('data-testid="about-section"');
      expect(html).toContain('data-testid="hero-section"');
      expect(html).toContain('data-testid="asset-container"');
      expect(html).toContain('data-testid="unified-auth-modal"');
    });
  });
});
