import { create } from 'zustand';
import {
  DEFAULT_ALLOCATIONS,
  TOTAL_SOVEREIGN_NET_WORTH,
  type VerticalAllocation,
} from '../lib/calculations';

export type ModalType = 'deposit' | 'withdraw' | 'trade' | 'kyc';
export type DepositRailTab = 'wire' | 'crypto' | 'card';

interface PortfolioState {
  netWorth: number;
  allocations: VerticalAllocation[];
  returns: Record<string, { dollarChange: number; percentageChange: number }> | null;
  activeModal: ModalType | null;
  activeDepositTab: DepositRailTab;

  // Actions
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setActiveDepositTab: (tab: DepositRailTab) => void;
  setNetWorth: (value: number) => void;
  setAllocations: (allocations: VerticalAllocation[]) => void;
  setReturns: (returns: Record<string, { dollarChange: number; percentageChange: number }>) => void;
  updateAllocation: (id: string, value: number) => void;
  resetToDefaults: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  netWorth: TOTAL_SOVEREIGN_NET_WORTH,
  allocations: DEFAULT_ALLOCATIONS,
  returns: null,
  activeModal: null,
  activeDepositTab: 'wire',

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setActiveDepositTab: (tab) => set({ activeDepositTab: tab }),

  setNetWorth: (value) => set({ netWorth: value }),
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

  resetToDefaults: () =>
    set({
      netWorth: TOTAL_SOVEREIGN_NET_WORTH,
      allocations: DEFAULT_ALLOCATIONS,
      returns: null,
      activeModal: null,
      activeDepositTab: 'wire',
    }),
}));
