import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ContactSection } from '../../src/components/contact/ContactSection';
import { ContactModal } from '../../src/components/contact/ContactModal';
import { ContactSentinelGraphic } from '../../src/components/contact/ContactSentinelGraphic';
import { GlobalHeader } from '../../src/components/nav/GlobalHeader';
import { useTerminalStore } from '../../src/store/useTerminalStore';
import App from '../../src/App';

describe('Contact Section & Modal Integration Suite (SSR / Node 24)', () => {
  beforeEach(() => {
    useTerminalStore.setState({
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
    window.location.hash = '';
  });

  describe('1. ContactSection On-Page Component', () => {
    it('renders ContactSection with id="contact", headline, inputs, and sentinel graphic (no B2B ONLY writeup)', () => {
      const html = renderToString(<ContactSection />);

      expect(html).toContain('id="contact"');
      expect(html).toContain('data-testid="contact-section"');
      expect(html).toContain('Fill out form and');
      expect(html).toContain('we contact you');
      expect(html).not.toContain('B2B ONLY');
      expect(html).toContain('data-testid="contact-section-fullname-input"');
      expect(html).toContain('data-testid="contact-section-email-input"');
      expect(html).toContain('data-testid="contact-section-telegram-input"');
      expect(html).toContain('data-testid="contact-section-company-input"');
      expect(html).toContain('data-testid="contact-section-website-input"');
      expect(html).toContain('data-testid="contact-section-service-select"');
      expect(html).toContain('data-testid="contact-section-allocation-select"');
      expect(html).toContain('data-testid="contact-section-submit-btn"');
      expect(html).toContain('SEND');
      expect(html).toContain('data-testid="contact-sentinel-graphic"');
      expect(html).toContain('AI DISPATCH SENTINEL // ONLINE');
    });
  });

  describe('2. ContactModal Dialog Component', () => {
    it('renders closed ContactModal as empty output when isContactModalOpen is false', () => {
      useTerminalStore.setState({ isContactModalOpen: false });
      const html = renderToString(<ContactModal />);
      expect(html).toBe('');
    });

    it('renders open ContactModal without B2B ONLY writeup, with inputs, close button, and sentinel graphic', () => {
      useTerminalStore.setState({ isContactModalOpen: true });
      const html = renderToString(<ContactModal />);

      expect(html).toContain('data-testid="contact-modal"');
      expect(html).toContain('data-testid="contact-modal-close-btn"');
      expect(html).not.toContain('B2B ONLY');
      expect(html).toContain('data-testid="contact-fullname-input"');
      expect(html).toContain('data-testid="contact-email-input"');
      expect(html).toContain('data-testid="contact-telegram-input"');
      expect(html).toContain('data-testid="contact-company-input"');
      expect(html).toContain('data-testid="contact-website-input"');
      expect(html).toContain('data-testid="contact-service-select"');
      expect(html).toContain('data-testid="contact-allocation-select"');
      expect(html).toContain('data-testid="contact-submit-btn"');
      expect(html).toContain('SEND');
      expect(html).toContain('data-testid="contact-sentinel-graphic"');
    });
  });

  describe('3. ContactSentinelGraphic Mascot', () => {
    it('renders sentinel graphic with glowing visor and status telemetry', () => {
      const html = renderToString(<ContactSentinelGraphic />);

      expect(html).toContain('data-testid="contact-sentinel-graphic"');
      expect(html).toContain('AI DISPATCH SENTINEL // ONLINE');
      expect(html).toContain('#A6FF00');
    });
  });

  describe('4. Store Actions & GlobalHeader Trigger', () => {
    it('updates isContactModalOpen state via openContactModal and closeContactModal', () => {
      expect(useTerminalStore.getState().isContactModalOpen).toBe(false);
      useTerminalStore.getState().openContactModal();
      expect(useTerminalStore.getState().isContactModalOpen).toBe(true);
      useTerminalStore.getState().closeContactModal();
      expect(useTerminalStore.getState().isContactModalOpen).toBe(false);
    });

    it('renders GlobalHeader with Contact link pointing to #contact', () => {
      const html = renderToString(<GlobalHeader />);
      expect(html).toContain('href="#contact"');
      expect(html).toContain('Contact');
    });
  });

  describe('5. Full App Command Deck Mounting', () => {
    it('mounts ContactSection and open ContactModal in App deck', () => {
      useTerminalStore.setState({ isContactModalOpen: true });
      const html = renderToString(<App />);

      expect(html).toContain('data-testid="contact-section"');
      expect(html).toContain('data-testid="contact-modal"');
    });
  });
});
