import { create } from 'zustand';
import {
  DEFAULT_ALLOCATIONS,
  ZERO_ALLOCATIONS,
  TOTAL_Global_NET_WORTH,
  type VerticalAllocation,
} from '../lib/calculations';
import { adjustWalletBalanceApi } from '../lib/api';

export type ModalType = 'deposit' | 'withdraw' | 'trade' | 'kyc';
export type DepositRailTab = 'wire' | 'crypto' | 'card';

interface PortfolioState {
  netWorth: number; // Consolidated Platform Net Worth (invested assets)
  availableCash: number; // Liquid Account Balance
  accountBalance: number; // Liquid Account Balance
  allocations: VerticalAllocation[];
  returns: Record<string, { dollarChange: number; percentageChange: number }> | null;
  activeModal: ModalType | null;
  activeDepositTab: DepositRailTab;

  // Actions
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setActiveDepositTab: (tab: DepositRailTab) => void;
  setNetWorth: (value: number) => void;
  setAvailableCash: (value: number) => void;
  setAccountBalance: (value: number) => void;
  adjustAvailableCash: (delta: number) => boolean;
  adjustAccountBalance: (delta: number) => boolean;
  setAllocations: (allocations: VerticalAllocation[]) => void;
  setReturns: (returns: Record<string, { dollarChange: number; percentageChange: number }>) => void;
  updateAllocation: (id: string, value: number) => void;
  syncUserHoldings: (cryptoNav: number, stocksNav: number) => void;
  syncAlternativeHoldings: (realEstateNav: number, carsNav: number, aiFundsNav?: number) => void;
  resetToZero: () => void;
  resetToDefaults: () => void;
}

function recomputeAllocations(updated: VerticalAllocation[]): {
  allocations: VerticalAllocation[];
  netWorth: number;
} {
  const total = updated.reduce((acc, curr) => acc + curr.actualValue, 0);
  const recomputed = updated.map((item) => ({
    ...item,
    actualPct: total > 0 ? Number(((item.actualValue / total) * 100).toFixed(1)) : 0,
  }));
  return {
    allocations: recomputed,
    netWorth: total,
  };
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  netWorth: TOTAL_Global_NET_WORTH,
  availableCash: 0,
  accountBalance: 0,
  allocations: DEFAULT_ALLOCATIONS,
  returns: null,
  activeModal: null,
  activeDepositTab: 'wire',

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setActiveDepositTab: (tab) => set({ activeDepositTab: tab }),

  setNetWorth: (value) => set({ netWorth: value }),
  setAvailableCash: (value) => set({ availableCash: value, accountBalance: value }),
  setAccountBalance: (value) => set({ availableCash: value, accountBalance: value }),
  adjustAvailableCash: (delta) => {
    let success = false;
    set((state) => {
      const current = state.accountBalance ?? state.availableCash;
      if (current + delta >= 0) {
        success = true;
        const updated = current + delta;
        adjustWalletBalanceApi(delta, 'Liquid balance adjustment').catch(console.error);
        return { availableCash: updated, accountBalance: updated };
      }
      return state;
    });
    return success;
  },
  adjustAccountBalance: (delta) => {
    let success = false;
    set((state) => {
      const current = state.accountBalance ?? state.availableCash;
      if (current + delta >= 0) {
        success = true;
        const updated = current + delta;
        adjustWalletBalanceApi(delta, 'Liquid balance adjustment').catch(console.error);
        return { availableCash: updated, accountBalance: updated };
      }
      return state;
    });
    return success;
  },
  setAllocations: (allocations) => set({ allocations }),
  setReturns: (returns) => set({ returns }),

  updateAllocation: (id, value) => {
    set((state) => {
      const updated = state.allocations.map((item) =>
        item.id === id ? { ...item, actualValue: value } : item
      );
      return recomputeAllocations(updated);
    });
  },

  syncUserHoldings: (cryptoNav, stocksNav) => {
    set((state) => {
      const updated = state.allocations.map((item) => {
        if (item.id === 'crypto') return { ...item, actualValue: cryptoNav };
        if (item.id === 'stocks') return { ...item, actualValue: stocksNav };
        return item;
      });
      return recomputeAllocations(updated);
    });
  },

  syncAlternativeHoldings: (realEstateNav, carsNav, aiFundsNav) => {
    set((state) => {
      const updated = state.allocations.map((item) => {
        if (item.id === 'real-estate') return { ...item, actualValue: realEstateNav };
        if (item.id === 'cars') return { ...item, actualValue: carsNav };
        if (aiFundsNav !== undefined && item.id === 'ai-funds') return { ...item, actualValue: aiFundsNav };
        return item;
      });
      return recomputeAllocations(updated);
    });
  },

  resetToZero: () =>
    set({
      netWorth: 0,
      availableCash: 0,
      accountBalance: 0,
      allocations: ZERO_ALLOCATIONS,
      returns: null,
      activeModal: null,
      activeDepositTab: 'wire',
    }),

  resetToDefaults: () =>
    set({
      netWorth: TOTAL_Global_NET_WORTH,
      availableCash: 0,
      accountBalance: 0,
      allocations: DEFAULT_ALLOCATIONS,
      returns: null,
      activeModal: null,
      activeDepositTab: 'wire',
    }),
}));
