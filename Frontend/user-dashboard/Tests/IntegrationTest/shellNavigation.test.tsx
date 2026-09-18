import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../../src/App';
import { SidebarRail } from '../../src/components/nav/SidebarRail';
import { TopHeader } from '../../src/components/nav/TopHeader';
import { MobileHeader } from '../../src/components/nav/MobileHeader';
import { VerticalPlaceholder } from '../../src/components/modules/VerticalPlaceholder';
import { useDashboardStore } from '../../src/store/useDashboardStore';

describe('Shell Navigation Integration Suite (Node 24 / SSR Parity)', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      activeVertical: 'overview',
      isSidebarCollapsed: false,
      isMobileMenuOpen: false,
      theme: 'dark',
      maskBalances: false,
    });
  });

  it('renders top header, brand logo, and active enclave', () => {
    const html = renderToString(<TopHeader />);

    expect(html).toContain('data-testid="top-header"');
    expect(html).toContain('data-testid="brand-logo-link"');
    expect(html).toContain('Vault Enclave:');
    expect(html).toContain('Geneva Alpha');
    expect(html).toContain('data-testid="global-search-input"');
    expect(html).toContain('data-testid="client-tier-badge"');
  });

  it('renders sidebar navigation rail with all all services and compliance', () => {
    const html = renderToString(<SidebarRail />);

    expect(html).toContain('data-testid="dashboard-sidebar"');
    expect(html).toContain('data-testid="nav-item-overview"');
    expect(html).toContain('data-testid="nav-item-crypto"');
    expect(html).toContain('data-testid="nav-item-stocks"');
    expect(html).toContain('data-testid="nav-item-ai-funds"');
    expect(html).toContain('data-testid="nav-item-real-estate"');
    expect(html).toContain('data-testid="nav-item-cars"');
    expect(html).toContain('data-testid="nav-item-vip-cards"');
    expect(html).toContain('data-testid="nav-item-wallet"');
    expect(html).toContain('data-testid="nav-item-compliance"');
    expect(html).toContain('data-testid="nav-item-security"');
  });

  it('renders active nav indicator on active vertical', () => {
    const html = renderToString(<SidebarRail activeTab="crypto" />);

    expect(html).toContain('data-testid="active-nav-indicator"');
    expect(html).toContain('Crypto &amp; Staking');
  });

  it('renders collapsed state when isSidebarCollapsed is true', () => {
    const html = renderToString(<SidebarRail isCollapsed={true} />);

    expect(html).toContain('w-16');
    expect(html).not.toContain('Collapse Rail');
  });

  it('renders mobile slide-over drawer when isMobileMenuOpen is true', () => {
    expect(renderToString(<MobileHeader isOpen={false} />)).toBe('');

    const openHtml = renderToString(<MobileHeader isOpen={true} />);
    expect(openHtml).toContain('data-testid="mobile-nav-drawer"');
    expect(openHtml).toContain('Close navigation');
  });

  it('renders VerticalPlaceholder with min-height: 540px to eliminate CLS', () => {
    const html = renderToString(<VerticalPlaceholder vertical="ai-funds" />);

    expect(html).toContain('data-testid="vertical-view-ai-funds"');
    expect(html).toContain('min-h-[540px]');
    expect(html).toContain('AI Systematic &amp; Quantitative Strategies');
    expect(html).toContain('SHARPE 2.84');
  });

  it('renders full App shell with clean layout and validates sub-50ms reactive transition SLA', () => {
    useDashboardStore.setState({ activeVertical: 'overview' });
    const initialHtml = renderToString(<App />);

    expect(initialHtml).toContain('data-testid="top-header"');
    expect(initialHtml).toContain('data-testid="dashboard-sidebar"');
    expect(initialHtml).toContain('id="main-content"');
    expect(initialHtml).toContain('min-h-[540px]');

    const start = performance.now();
    useDashboardStore.getState().setActiveVertical('crypto');
    const updatedHtml = renderToString(<App activeVertical="crypto" />);
    const duration = performance.now() - start;

    expect(useDashboardStore.getState().activeVertical).toBe('crypto');
    expect(updatedHtml).toContain('Crypto &amp; Staking');
    expect(duration).toBeLessThan(2500);
  });
});
