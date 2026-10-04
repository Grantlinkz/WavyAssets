import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  initSmartsupp,
  identifySmartsuppUser,
  openSmartsuppChat,
  closeSmartsuppChat,
  toggleSmartsuppChat,
  hideSmartsuppChat,
  showSmartsuppChat,
} from '../../src/lib/smartsupp';
import { SmartsuppChat } from '../../src/components/chat/SmartsuppChat';
import { TopHeader } from '../../src/components/nav/TopHeader';
import { SidebarRail } from '../../src/components/nav/SidebarRail';
import { MobileHeader } from '../../src/components/nav/MobileHeader';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useDashboardStore } from '../../src/store/useDashboardStore';

describe('Smartsupp Live Chat Integration Suite', () => {
  beforeEach(() => {
    // Reset window smartsupp stubs
    window._smartsupp = undefined;
    window.smartsupp = undefined;
    useAuthStore.setState({ user: null, isAuthenticated: false });
    useDashboardStore.setState({
      activeVertical: 'overview',
      isSidebarCollapsed: false,
      isMobileMenuOpen: true,
    });
  });

  afterEach(() => {
    window._smartsupp = undefined;
    window.smartsupp = undefined;
    vi.restoreAllMocks();
  });

  describe('Smartsupp Library & API Utilities', () => {
    it('initializes window._smartsupp and command queue stub', () => {
      const result = initSmartsupp('test_smartsupp_key_123');
      expect(result).toBe(true);
      expect(window._smartsupp?.key).toBe('test_smartsupp_key_123');
      expect(typeof window.smartsupp).toBe('function');
    });

    it('identifies authenticated user with name, email and variables', () => {
      initSmartsupp('test_key');
      const smartsuppSpy = vi.fn();
      window.smartsupp = smartsuppSpy as unknown as typeof window.smartsupp;

      const mockUser = {
        id: 'usr_institutional_88',
        email: 'investor@geneva-alpha.ch',
        fullName: 'Alexander Hamilton',
        tier: 'INSTITUTIONAL' as const,
        isCorporate: true,
        kycTier: 'TIER_3' as const,
      };

      identifySmartsuppUser(mockUser);

      expect(smartsuppSpy).toHaveBeenCalledWith('name', 'Alexander Hamilton');
      expect(smartsuppSpy).toHaveBeenCalledWith('email', 'investor@geneva-alpha.ch');
      expect(smartsuppSpy).toHaveBeenCalledWith(
        'variables',
        expect.objectContaining({
          userId: 'usr_institutional_88',
          tier: 'INSTITUTIONAL',
          kycTier: 'TIER_3',
          isCorporate: 'Yes',
        })
      );
    });

    it('dispatches open, close, toggle, hide and show commands', () => {
      initSmartsupp('test_key');
      const smartsuppSpy = vi.fn();
      window.smartsupp = smartsuppSpy as unknown as typeof window.smartsupp;

      openSmartsuppChat();
      expect(smartsuppSpy).toHaveBeenCalledWith('chat:open');

      closeSmartsuppChat();
      expect(smartsuppSpy).toHaveBeenCalledWith('chat:close');

      toggleSmartsuppChat();
      expect(smartsuppSpy).toHaveBeenCalledWith('chat:toggle');

      hideSmartsuppChat();
      expect(smartsuppSpy).toHaveBeenCalledWith('chat:hide');

      showSmartsuppChat();
      expect(smartsuppSpy).toHaveBeenCalledWith('chat:show');
    });
  });

  describe('UI Component Integrations', () => {
    it('renders SmartsuppChat launcher and SSR output correctly', () => {
      const html = renderToString(<SmartsuppChat apiKey="test_key" />);
      expect(html).toContain('data-testid="smartsupp-chat-launcher"');
      expect(html).toContain('Live Support');
      expect(html).toContain('Smartsupp Desk');
    });

    it('renders live chat button in TopHeader with correct testid and label', () => {
      const html = renderToString(<TopHeader />);
      expect(html).toContain('data-testid="header-live-chat-btn"');
      expect(html).toContain('Live Chat');
    });

    it('renders 24/7 Live Concierge in SidebarRail with correct testid and label', () => {
      const html = renderToString(<SidebarRail isCollapsed={false} />);
      expect(html).toContain('data-testid="sidebar-live-chat-btn"');
      expect(html).toContain('Live Concierge');
      expect(html).toContain('24/7');
    });

    it('renders Live Concierge in MobileHeader drawer with correct testid', () => {
      const html = renderToString(<MobileHeader isOpen={true} />);
      expect(html).toContain('data-testid="mobile-nav-live-chat-btn"');
      expect(html).toContain('Live Concierge (Smartsupp)');
    });

    it('dispatches openSmartsuppChat correctly when support action is triggered', () => {
      initSmartsupp('test_key');
      const smartsuppSpy = vi.fn();
      window.smartsupp = smartsuppSpy as unknown as typeof window.smartsupp;

      openSmartsuppChat();
      expect(smartsuppSpy).toHaveBeenCalledWith('chat:open');
    });
  });
});
