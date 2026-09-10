import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../../src/App';
import { NotFoundPage } from '../../src/components/common/NotFoundPage';
import { TerminalErrorBoundary } from '../../src/components/error/TerminalErrorBoundary';
import { useTerminalStore, isRoute404 } from '../../src/store/useTerminalStore';
import { initSystemLanguage, getSystemLocale, getSystemLanguage } from '../../src/lib/locale';

describe('Sprint 6 Hardening, Custom 404 & System Language Integration Suite (SSR / Node 24)', () => {
  beforeEach(() => {
    localStorage.clear();
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = 'en';
    }
    useTerminalStore.setState({
      is404: false,
      activeAssetId: 'crypto',
      isMegaMenuOpen: false,
      isContactModalOpen: false,
      authModal: {
        isOpen: false,
        step: 1,
        initialTier: 'institutional',
        initialMode: 'login',
      },
    });
    if (typeof window !== 'undefined' && window.location) {
      window.location.hash = '';
      window.location.pathname = '/';
    }
  });

  describe('1. Default System Language & Locale Verification', () => {
    it('detects system locale and primary language code', () => {
      const locale = getSystemLocale();
      expect(typeof locale).toBe('string');
      expect(locale.length).toBeGreaterThanOrEqual(2);

      const lang = getSystemLanguage();
      expect(typeof lang).toBe('string');
      expect(lang.length).toBe(2);

      const resolved = initSystemLanguage();
      expect(typeof resolved).toBe('string');
      if (typeof document !== 'undefined' && document.documentElement) {
        expect(document.documentElement.lang).toBe(resolved);
      }
    });

    it('initializes document.documentElement.lang on initialization', () => {
      initSystemLanguage();
      if (typeof document !== 'undefined' && document.documentElement) {
        expect(document.documentElement.lang.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('2. Sovereign Custom 404 Depository Page', () => {
    it('renders NotFoundPage with institutional diagnostics and plain English copy', () => {
      const html = renderToString(<NotFoundPage requestedPath="/unknown-vault-route" />);

      expect(html).toContain('data-testid="not-found-page"');
      expect(html).toContain('Page Not Found • Error 404');
      expect(html).toMatch(/We Can(&#x27;|')t Find That Page/);
      expect(html).toContain('/unknown-vault-route');
      expect(html).toContain('Return to Home');
      expect(html).toContain('data-testid="not-found-return-home-btn"');
      expect(html).toContain('data-testid="not-found-browse-services-btn"');
      expect(html).toContain('data-testid="not-found-contact-btn"');
    });

    it('renders NotFoundPage inside App when is404 is true', () => {
      useTerminalStore.setState({ is404: true });
      const html = renderToString(<App />);

      expect(html).toContain('data-testid="not-found-page"');
      expect(html).not.toContain('id="portfolio-simulator"');
    });

    it('renders normal command deck when is404 is false', () => {
      useTerminalStore.setState({ is404: false });
      const html = renderToString(<App />);

      expect(html).not.toContain('data-testid="not-found-page"');
      expect(html).toContain('data-testid="hero-section"');
      expect(html).toContain('id="portfolio-simulator"');
    });

    it('detects non-existing hash like #client-voices/geme and routes to 404', () => {
      expect(isRoute404('/', '#client-voices/geme')).toBe(true);

      // Simulate route sync
      if (typeof window !== 'undefined' && window.location) {
        window.location.hash = '#client-voices/geme';
      }
      useTerminalStore.getState().syncFromHash();
      expect(useTerminalStore.getState().is404).toBe(true);

      const html = renderToString(<App />);
      expect(html).toContain('data-testid="not-found-page"');
      expect(html).toContain('#client-voices/geme');
    });

    it('detects non-existing pathname like /services/vip-cards as 404', () => {
      expect(isRoute404('/services/vip-cards', '')).toBe(true);

      if (typeof window !== 'undefined' && window.location) {
        window.location.pathname = '/services/vip-cards';
        window.location.hash = '';
      }
      useTerminalStore.getState().syncFromHash();
      expect(useTerminalStore.getState().is404).toBe(true);

      const html = renderToString(<App />);
      expect(html).toContain('data-testid="not-found-page"');
    });
  });

  describe('3. WCAG 2.1 AA Accessibility & Error Boundary Hardening', () => {
    it('mounts skip-to-content link pointing to #main-content', () => {
      const html = renderToString(<App />);
      expect(html).toContain('data-testid="skip-to-content-link"');
      expect(html).toContain('href="#main-content"');
      expect(html).toContain('id="main-content"');
    });

    it('mounts ARIA live announcements region for screen readers', () => {
      const html = renderToString(<App />);
      expect(html).toContain('data-testid="screen-reader-live-announcements"');
      expect(html).toContain('aria-live="polite"');
    });

    it('renders children under TerminalErrorBoundary during normal execution', () => {
      const html = renderToString(
        <TerminalErrorBoundary sectionName="Test Shell">
          <div data-testid="child-element">Active Substrate</div>
        </TerminalErrorBoundary>
      );
      expect(html).toContain('data-testid="child-element"');
      expect(html).not.toContain('data-testid="terminal-error-boundary-fallback"');
    });
  });
});
