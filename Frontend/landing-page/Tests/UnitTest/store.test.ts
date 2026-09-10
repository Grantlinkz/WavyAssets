import { describe, it, expect, beforeEach } from 'vitest';
import { useTerminalStore } from '../../src/store/useTerminalStore';

describe('Terminal State Machine Store', () => {
  beforeEach(() => {
    // Reset defaults before each test
    useTerminalStore.setState({
      theme: 'dark',
      resolvedTheme: 'dark',
      activeAssetId: 'crypto',
      authModal: {
        isOpen: false,
        step: 1,
        initialTier: 'institutional',
      },
      trustMode: 'institutional',
      simulator: {
        capital: 250000,
        aggressiveness: 3,
      },
    });
  });

  it('toggles theme between dark and light', () => {
    const store = useTerminalStore.getState();
    expect(store.resolvedTheme).toBe('dark');

    store.toggleTheme();
    expect(useTerminalStore.getState().resolvedTheme).toBe('light');

    useTerminalStore.getState().toggleTheme();
    expect(useTerminalStore.getState().resolvedTheme).toBe('dark');
  });

  it('updates active asset vertical id', () => {
    const store = useTerminalStore.getState();
    expect(store.activeAssetId).toBe('crypto');

    store.setActiveAssetId('stocks');
    expect(useTerminalStore.getState().activeAssetId).toBe('stocks');

    store.setActiveAssetId('real-estate');
    expect(useTerminalStore.getState().activeAssetId).toBe('real-estate');
  });

  it('controls auth modal lifecycle', () => {
    const store = useTerminalStore.getState();
    expect(store.authModal.isOpen).toBe(false);

    store.openAuthModal('private-wealth');
    expect(useTerminalStore.getState().authModal.isOpen).toBe(true);
    expect(useTerminalStore.getState().authModal.initialTier).toBe('private-wealth');
    expect(useTerminalStore.getState().authModal.step).toBe(1);

    store.setAuthStep(2);
    expect(useTerminalStore.getState().authModal.step).toBe(2);

    store.closeAuthModal();
    expect(useTerminalStore.getState().authModal.isOpen).toBe(false);
  });

  it('updates portfolio simulator inputs', () => {
    const store = useTerminalStore.getState();
    store.setSimulatorCapital(1000000);
    store.setSimulatorAggressiveness(5);

    expect(useTerminalStore.getState().simulator.capital).toBe(1000000);
    expect(useTerminalStore.getState().simulator.aggressiveness).toBe(5);
  });
});
