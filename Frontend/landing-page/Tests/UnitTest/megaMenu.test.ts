import { describe, it, expect, beforeEach } from 'vitest';
import { useTerminalStore } from '../../src/store/useTerminalStore';

describe('MegaMenu State Machine', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      isMegaMenuOpen: false,
      megaMenuCategory: 'all',
      activeAssetId: 'crypto',
    });
  });

  it('initializes with mega menu closed and category set to all', () => {
    const state = useTerminalStore.getState();
    expect(state.isMegaMenuOpen).toBe(false);
    expect(state.megaMenuCategory).toBe('all');
  });

  it('toggles mega menu open and closed', () => {
    useTerminalStore.getState().toggleMegaMenu();
    expect(useTerminalStore.getState().isMegaMenuOpen).toBe(true);

    useTerminalStore.getState().toggleMegaMenu();
    expect(useTerminalStore.getState().isMegaMenuOpen).toBe(false);
  });

  it('sets mega menu category correctly', () => {
    useTerminalStore.getState().setMegaMenuCategory('dma-equities');
    expect(useTerminalStore.getState().megaMenuCategory).toBe('dma-equities');

    useTerminalStore.getState().setMegaMenuCategory('physical-vaults');
    expect(useTerminalStore.getState().megaMenuCategory).toBe('physical-vaults');
  });

  it('automatically closes mega menu when setActiveAssetId is invoked', () => {
    useTerminalStore.getState().setMegaMenuOpen(true);
    expect(useTerminalStore.getState().isMegaMenuOpen).toBe(true);

    useTerminalStore.getState().setActiveAssetId('stocks');
    expect(useTerminalStore.getState().activeAssetId).toBe('stocks');
    expect(useTerminalStore.getState().isMegaMenuOpen).toBe(false);
    expect(window.location.hash).toBe('#/services/stocks');
  });
});
