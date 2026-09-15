import { describe, it, expect, beforeEach } from 'vitest';
import { useGovernanceStore } from '../../src/store/useGovernanceStore';
import {
  VIP_CARD_TIERS,
  VIP_CARD_PRIVILEGES,
} from '../../src/lib/governanceAssetData';

describe('VIP & Membership Cards Module Unit Tests (Sprint 5)', () => {
  beforeEach(() => {
    useGovernanceStore.setState({
      isCardFrozen: false,
      cardMode: 'physical',
      isCvvRevealed: false,
      cvvCountdown: 60,
      isBiometricModalOpen: false,
      isConciergeModalOpen: false,
    });
  });

  it('validates 3 institutional card tiers and specifications', () => {
    expect(VIP_CARD_TIERS).toHaveLength(3);

    const silver = VIP_CARD_TIERS.find((t) => t.id === 'tier-silver');
    expect(silver?.name).toBe('Silver Foundation');
    expect(silver?.minAum).toBe(1000000);
    expect(silver?.cashbackPct).toBe(1.5);
    expect(silver?.dailyLimitUsd).toBe(50000);
    expect(silver?.weightGrams).toBe(18);

    const obsidian = VIP_CARD_TIERS.find((t) => t.id === 'tier-obsidian');
    expect(obsidian?.name).toBe('Obsidian Elite');
    expect(obsidian?.minAum).toBe(10000000);
    expect(obsidian?.cashbackPct).toBe(2.5);
    expect(obsidian?.dailyLimitUsd).toBe(500000);
    expect(obsidian?.material).toContain('42g Tungsten');
    expect(obsidian?.weightGrams).toBe(42);
    expect(obsidian?.status).toBe('CURRENT');

    const blackFiduciary = VIP_CARD_TIERS.find((t) => t.id === 'tier-black-fiduciary');
    expect(blackFiduciary?.name).toBe('Black Fiduciary');
    expect(blackFiduciary?.minAum).toBe(25000000);
    expect(blackFiduciary?.cashbackPct).toBe(3.5);
    expect(blackFiduciary?.dailyLimitUsd).toBe(2500000);
    expect(blackFiduciary?.weightGrams).toBe(48);
  });

  it('validates tier privileges catalog', () => {
    expect(VIP_CARD_PRIVILEGES.length).toBeGreaterThanOrEqual(4);

    const zeroFx = VIP_CARD_PRIVILEGES.find((p) => p.title.includes('Zero FX'));
    expect(zeroFx).toBeDefined();
    expect(zeroFx?.category).toBe('TREASURY FX');

    const freeport = VIP_CARD_PRIVILEGES.find((p) => p.title.includes('FreePort'));
    expect(freeport).toBeDefined();
    expect(freeport?.category).toBe('PHYSICAL CUSTODY');
  });

  it('handles instant card freeze and unfreeze toggles', () => {
    const store = useGovernanceStore.getState();
    expect(store.isCardFrozen).toBe(false);

    store.toggleFreezeCard();
    expect(useGovernanceStore.getState().isCardFrozen).toBe(true);

    store.toggleFreezeCard();
    expect(useGovernanceStore.getState().isCardFrozen).toBe(false);
  });

  it('switches between physical tungsten and virtual disposable card modes', () => {
    const store = useGovernanceStore.getState();
    expect(store.cardMode).toBe('physical');

    store.setCardMode('virtual');
    expect(useGovernanceStore.getState().cardMode).toBe('virtual');

    store.setCardMode('physical');
    expect(useGovernanceStore.getState().cardMode).toBe('physical');
  });

  it('manages biometric reveal workflow and countdown auto-expiry', () => {
    const store = useGovernanceStore.getState();
    expect(store.isBiometricModalOpen).toBe(false);
    expect(store.isCvvRevealed).toBe(false);

    store.openBiometricModal();
    expect(useGovernanceStore.getState().isBiometricModalOpen).toBe(true);

    store.revealCvv();
    expect(useGovernanceStore.getState().isCvvRevealed).toBe(true);
    expect(useGovernanceStore.getState().isBiometricModalOpen).toBe(false);
    expect(useGovernanceStore.getState().cvvCountdown).toBe(60);

    store.hideCvv();
    expect(useGovernanceStore.getState().isCvvRevealed).toBe(false);
  });

  it('controls VIP concierge dispatch modal state', () => {
    const store = useGovernanceStore.getState();
    expect(store.isConciergeModalOpen).toBe(false);

    store.openConciergeModal();
    expect(useGovernanceStore.getState().isConciergeModalOpen).toBe(true);

    store.closeConciergeModal();
    expect(useGovernanceStore.getState().isConciergeModalOpen).toBe(false);
  });
});
