import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseAssetHash,
  VALID_ASSET_VERTICALS,
  useTerminalStore,
} from '../../src/store/useTerminalStore';

describe('Hash Router & Telemetry Unit Suite', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      activeAssetId: 'crypto',
      telemetry: {
        lastSwitchDurationMs: 0,
        switchHistory: [],
      },
    });
    window.location.hash = '';
  });

  it('validates all 7 canonical asset verticals', () => {
    expect(VALID_ASSET_VERTICALS).toEqual([
      'crypto',
      'stocks',
      'ai-funds',
      'real-estate',
      'vip-cards',
      'cars',
      'wallet',
    ]);
  });

  it('correctly parses structured hash URLs into asset vertical IDs', () => {
    expect(parseAssetHash('#/services/crypto')).toBe('crypto');
    expect(parseAssetHash('#/services/stocks')).toBe('stocks');
    expect(parseAssetHash('#/services/ai-funds')).toBe('ai-funds');
    expect(parseAssetHash('#/services/real-estate')).toBe('real-estate');
    expect(parseAssetHash('#/services/cars')).toBe('cars');
    expect(parseAssetHash('#/services/vip-cards')).toBe('vip-cards');
    expect(parseAssetHash('#/services/wallet')).toBe('wallet');
  });

  it('gracefully falls back to crypto for unrecognized or empty hash routes', () => {
    expect(parseAssetHash('')).toBe('crypto');
    expect(parseAssetHash('#/')).toBe('crypto');
    expect(parseAssetHash('#/services/unknown-vertical')).toBe('crypto');
    expect(parseAssetHash('#/invalid-hash-structure')).toBe('crypto');
  });

  it('updates window.location.hash and records view switch telemetry on navigation', () => {
    const store = useTerminalStore.getState();
    expect(store.activeAssetId).toBe('crypto');
    expect(store.telemetry.switchHistory).toHaveLength(0);

    store.setActiveAssetId('cars');

    const updated = useTerminalStore.getState();
    expect(updated.activeAssetId).toBe('cars');
    expect(window.location.hash).toBe('#/services/cars');
    expect(updated.telemetry.switchHistory).toHaveLength(1);
    expect(updated.telemetry.switchHistory[0].from).toBe('crypto');
    expect(updated.telemetry.switchHistory[0].to).toBe('cars');
    expect(updated.telemetry.switchHistory[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('syncs state from window.location.hash via syncFromHash', () => {
    window.location.hash = '#/services/ai-funds';
    useTerminalStore.getState().syncFromHash();

    expect(useTerminalStore.getState().activeAssetId).toBe('ai-funds');
  });
});
