import { create } from 'zustand';
import {
  DEFAULT_ALLOCATIONS,
  ZERO_ALLOCATIONS,
  TOTAL_Global_NET_WORTH,
  type VerticalAllocation,
} from '../lib/calculations';

export type ModalType = 'deposit' | 'withdraw' | 'trade' | 'kyc';
export type DepositRailTab = 'wire' | 'crypto' | 'card';

interface PortfolioState {
  netWorth: number;
  availableCash: number;
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
  adjustAvailableCash: (delta: number) => boolean;
  setAllocations: (allocations: VerticalAllocation[]) => void;
  setReturns: (returns: Record<string, { dollarChange: number; percentageChange: number }>) => void;
  updateAllocation: (id: string, value: number) => void;
  syncUserHoldings: (cryptoNav: number, stocksNav: number) => void;
  syncAlternativeHoldings: (realEstateNav: number, carsNav: number) => void;
  resetToZero: () => void;
  resetToDefaults: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  netWorth: 0,
  availableCash: 0,
  allocations: ZERO_ALLOCATIONS,
  returns: null,
  activeModal: null,
  activeDepositTab: 'wire',

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setActiveDepositTab: (tab) => set({ activeDepositTab: tab }),

  setNetWorth: (value) => set({ netWorth: value }),
  setAvailableCash: (value) => set({ availableCash: value }),
  adjustAvailableCash: (delta) => {
    let success = false;
    set((state) => {
      if (state.availableCash + delta >= 0) {
        success = true;
        return { availableCash: state.availableCash + delta };
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
      const total = updated.reduce((acc, curr) => acc + curr.actualValue, 0);
      const recomputed = updated.map((item) => ({
        ...item,
        actualPct: total > 0 ? Number(((item.actualValue / total) * 100).toFixed(1)) : 0,
      }));
      return {
        allocations: recomputed,
        netWorth: total,
      };
    });
  },

  syncUserHoldings: (cryptoNav, stocksNav) => {
    set((state) => {
      const updated = state.allocations.map((item) => {
        if (item.id === 'crypto') return { ...item, actualValue: cryptoNav };
        if (item.id === 'stocks') return { ...item, actualValue: stocksNav };
        return item;
      });
      const total = updated.reduce((acc, curr) => acc + curr.actualValue, 0);
      const recomputed = updated.map((item) => ({
        ...item,
        actualPct: total > 0 ? Number(((item.actualValue / total) * 100).toFixed(1)) : 0,
      }));
      return {
        allocations: recomputed,
        netWorth: total,
      };
    });
  },

  syncAlternativeHoldings: (realEstateNav, carsNav) => {
    set((state) => {
      const updated = state.allocations.map((item) => {
        if (item.id === 'real-estate') return { ...item, actualValue: realEstateNav };
        if (item.id === 'cars') return { ...item, actualValue: carsNav };
        return item;
      });
      const total = updated.reduce((acc, curr) => acc + curr.actualValue, 0);
      const recomputed = updated.map((item) => ({
        ...item,
        actualPct: total > 0 ? Number(((item.actualValue / total) * 100).toFixed(1)) : 0,
      }));
      return {
        allocations: recomputed,
        netWorth: total,
      };
    });
  },

  resetToZero: () =>
    set({
      netWorth: 0,
      availableCash: 0,
      allocations: ZERO_ALLOCATIONS,
      returns: null,
      activeModal: null,
      activeDepositTab: 'wire',
    }),

  resetToDefaults: () =>
    set({
      netWorth: TOTAL_Global_NET_WORTH,
      availableCash: 1820450.00,
      allocations: DEFAULT_ALLOCATIONS,
      returns: null,
      activeModal: null,
      activeDepositTab: 'wire',
    }),
}));
