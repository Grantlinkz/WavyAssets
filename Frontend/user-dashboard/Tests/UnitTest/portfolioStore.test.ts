import { describe, it, expect, beforeEach } from 'vitest';
import { usePortfolioStore } from '../../src/store/usePortfolioStore';
import { TOTAL_Global_NET_WORTH } from '../../src/lib/calculations';

describe('Portfolio Store (usePortfolioStore)', () => {
  beforeEach(() => {
    usePortfolioStore.getState().resetToDefaults();
  });

  it('initializes with default institutional net worth and 6 allocations', () => {
    const state = usePortfolioStore.getState();
    expect(state.netWorth).toBe(TOTAL_Global_NET_WORTH);
    expect(state.allocations.length).toBe(6);
    expect(state.activeModal).toBeNull();
    expect(state.activeDepositTab).toBe('wire');
  });

  it('opens and closes modals accurately', () => {
    const { openModal, closeModal } = usePortfolioStore.getState();

    openModal('deposit');
    expect(usePortfolioStore.getState().activeModal).toBe('deposit');

    openModal('withdraw');
    expect(usePortfolioStore.getState().activeModal).toBe('withdraw');

    openModal('trade');
    expect(usePortfolioStore.getState().activeModal).toBe('trade');

    openModal('kyc');
    expect(usePortfolioStore.getState().activeModal).toBe('kyc');

    closeModal();
    expect(usePortfolioStore.getState().activeModal).toBeNull();
  });

  it('switches active deposit rail tabs', () => {
    const { setActiveDepositTab } = usePortfolioStore.getState();

    setActiveDepositTab('crypto');
    expect(usePortfolioStore.getState().activeDepositTab).toBe('crypto');

    setActiveDepositTab('card');
    expect(usePortfolioStore.getState().activeDepositTab).toBe('card');

    setActiveDepositTab('wire');
    expect(usePortfolioStore.getState().activeDepositTab).toBe('wire');
  });

  it('updates an asset allocation and recalculates total net worth and percentages', () => {
    const { updateAllocation } = usePortfolioStore.getState();

    // Double the crypto allocation (from 5,187,157.50 to 10,000,000)
    updateAllocation('crypto', 10000000);

    const state = usePortfolioStore.getState();
    const crypto = state.allocations.find((a) => a.id === 'crypto');
    expect(crypto?.actualValue).toBe(10000000);
    expect(state.netWorth).toBeGreaterThan(TOTAL_Global_NET_WORTH);
    expect(crypto?.actualPct).toBeGreaterThan(35.0);
  });

  it('resets back to default state via resetToDefaults', () => {
    const { updateAllocation, openModal, resetToDefaults } = usePortfolioStore.getState();

    updateAllocation('crypto', 1000);
    openModal('trade');

    resetToDefaults();

    const state = usePortfolioStore.getState();
    expect(state.netWorth).toBe(TOTAL_Global_NET_WORTH);
    expect(state.activeModal).toBeNull();
  });
});
