import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore } from '../../src/store/useDashboardStore';

describe('useDashboardStore', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      activeVertical: 'overview',
      isSidebarCollapsed: false,
      isMobileMenuOpen: false,
      theme: 'dark',
      maskBalances: false,
      timeframe: '1D',
    });
  });

  it('initializes with default values', () => {
    const state = useDashboardStore.getState();
    expect(state.activeVertical).toBe('overview');
    expect(state.isSidebarCollapsed).toBe(false);
    expect(state.maskBalances).toBe(false);
    expect(state.timeframe).toBe('1D');
  });

  it('updates activeVertical cleanly', () => {
    useDashboardStore.getState().setActiveVertical('crypto');
    expect(useDashboardStore.getState().activeVertical).toBe('crypto');

    useDashboardStore.getState().setActiveVertical('stocks');
    expect(useDashboardStore.getState().activeVertical).toBe('stocks');

    useDashboardStore.getState().setActiveVertical('real-estate');
    expect(useDashboardStore.getState().activeVertical).toBe('real-estate');
  });

  it('toggles sidebar collapse state', () => {
    expect(useDashboardStore.getState().isSidebarCollapsed).toBe(false);

    useDashboardStore.getState().toggleSidebar();
    expect(useDashboardStore.getState().isSidebarCollapsed).toBe(true);

    useDashboardStore.getState().toggleSidebar();
    expect(useDashboardStore.getState().isSidebarCollapsed).toBe(false);
  });

  it('toggles privacy mask balance state', () => {
    expect(useDashboardStore.getState().maskBalances).toBe(false);

    useDashboardStore.getState().toggleMaskBalances();
    expect(useDashboardStore.getState().maskBalances).toBe(true);

    useDashboardStore.getState().toggleMaskBalances();
    expect(useDashboardStore.getState().maskBalances).toBe(false);
  });

  it('switches timeframe option correctly', () => {
    useDashboardStore.getState().setTimeframe('1M');
    expect(useDashboardStore.getState().timeframe).toBe('1M');

    useDashboardStore.getState().setTimeframe('ALL');
    expect(useDashboardStore.getState().timeframe).toBe('ALL');
  });

  it('toggles theme between dark and light', () => {
    useDashboardStore.setState({ theme: 'dark' });
    useDashboardStore.getState().toggleTheme();
    expect(useDashboardStore.getState().theme).toBe('light');

    useDashboardStore.getState().toggleTheme();
    expect(useDashboardStore.getState().theme).toBe('dark');
  });
});
