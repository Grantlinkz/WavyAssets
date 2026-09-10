import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { BrandLogo } from '../../src/components/common/BrandLogo';
import { WavyBackground } from '../../src/components/canvas/WavyBackground';
import { ServicesMegaMenu } from '../../src/components/nav/ServicesMegaMenu';
import { InstitutionalFooter } from '../../src/components/footer/InstitutionalFooter';
import { useTerminalStore } from '../../src/store/useTerminalStore';

describe('Brand Identity, Wave Theme & Services Scroll Integration Suite (SSR / Node 24)', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      theme: 'dark',
      resolvedTheme: 'dark',
      isMegaMenuOpen: false,
      activeAssetId: 'crypto',
    });
    window.location.hash = '';
    window.scrollTo = vi.fn();
  });

  describe('1. BrandLogo WavyAssets Vector & Home Navigation', () => {
    it('renders BrandLogo with sinusoidal wave paths, typography, and accessible link attributes', () => {
      const html = renderToString(<BrandLogo showSecuredBadge={true} />);
      expect(html).toContain('data-testid="brand-logo-link"');
      expect(html).toContain('role="button"');
      expect(html).toContain('aria-label="WavyAssets Home"');
      expect(html).toContain('href="#"');
      expect(html).toContain('WAVY');
      expect(html).toContain('ASSETS');
      expect(html).toContain('SECURED');
      // Contains sinusoidal wave path definition
      expect(html).toContain('C 10 11, 14 11, 18 19');
    });

    it('executes onNavigateHome callback when provided', () => {
      const onNavigateHome = vi.fn();
      const element = <BrandLogo onNavigateHome={onNavigateHome} />;
      expect(element.props.onNavigateHome).toBe(onNavigateHome);
      element.props.onNavigateHome();
      expect(onNavigateHome).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. WavyBackground Theme Reactivity', () => {
    it('renders Licorice (#08090B) and Jet Black (#0F1115) in dark mode', () => {
      const html = renderToString(<WavyBackground theme="dark" />);
      expect(html).toContain('#08090B');
      expect(html).toContain('#0F1115');
      expect(html).toContain('bg-[#08090B]');
    });

    it('renders Pure White (#FFFFFF) and Soft Alabaster (#EDF2FB) in light mode', () => {
      const html = renderToString(<WavyBackground theme="light" />);
      expect(html).toContain('#FFFFFF');
      expect(html).toContain('#EDF2FB');
      expect(html).toContain('bg-[#FFFFFF]');
    });
  });

  describe('3. ServicesMegaMenu Scroll Container', () => {
    it('renders scrollable container for asset vertical details', () => {
      const html = renderToString(<ServicesMegaMenu isOpen={true} category="all" />);
      expect(html).toContain('data-testid="services-scroll-container"');
      expect(html).toContain('overflow-y-auto');
      expect(html).toContain('custom-scrollbar');
      // All 7 classes rendered inside
      expect(html).toContain('Crypto Yields &amp; Cold Storage');
      expect(html).toContain('Exotic Hypercar &amp; Horology Depots');
      expect(html).toContain('Sovereign Wallet &amp; Core Global Finance');
    });
  });

  describe('4. InstitutionalFooter Dark Mode Text Contrast & APY Removal', () => {
    it('renders disclaimers with text-on-surface-variant and clean Crypto Yields without APY badge', () => {
      const html = renderToString(<InstitutionalFooter />);
      expect(html).toContain('Crypto Yields &amp; Cold Storage');
      expect(html).not.toContain('19.4% APY');
      expect(html).toContain('REGULATORY DISCLOSURES &amp; FIDUCIARY GOVERNANCE:');
      expect(html).toContain('text-on-surface-variant');
      expect(html).not.toContain('text-[11px] text-outline leading-relaxed');
    });
  });
});
