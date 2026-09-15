import { create } from 'zustand';
import {
  INITIAL_DCA_SCHEDULES,
  WALLET_TRANSACTIONS_DATA,
  type DcaScheduleItem,
  type WalletTransaction,
} from '../lib/liquidAssetData';

interface LiquidState {
  // Crypto module state
  dcaSchedules: DcaScheduleItem[];
  unclaimedRewards: number;
  isCompounding: boolean;
  toggleDcaSchedule: (id: string) => void;
  addDcaSchedule: (schedule: Omit<DcaScheduleItem, 'id'>) => void;
  triggerFastCompound: () => void;

  // Stocks module state
  selectedStock: string;
  isPreMarket: boolean;
  dripSettings: Record<string, boolean>;
  setSelectedStock: (symbol: string) => void;
  togglePreMarket: () => void;
  toggleDrip: (symbol: string) => void;

  // Wallet module state
  autoSweepEnabled: boolean;
  sweepThreshold: number;
  transactions: WalletTransaction[];
  filterVertical: string;
  toggleAutoSweep: () => void;
  setSweepThreshold: (amount: number) => void;
  setFilterVertical: (v: string) => void;
}

export const useLiquidStore = create<LiquidState>((set) => ({
  // Crypto
  dcaSchedules: INITIAL_DCA_SCHEDULES,
  unclaimedRewards: 18492.30,
  isCompounding: false,

  toggleDcaSchedule: (id) => {
    set((state) => ({
      dcaSchedules: state.dcaSchedules.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      ),
    }));
  },

  addDcaSchedule: (schedule) => {
    set((state) => ({
      dcaSchedules: [
        ...state.dcaSchedules,
        { ...schedule, id: `dca-${Date.now()}` },
      ],
    }));
  },

  triggerFastCompound: () => {
    set({ isCompounding: true });
    setTimeout(() => {
      set({ unclaimedRewards: 0.0, isCompounding: false });
    }, 800);
  },

  // Stocks
  selectedStock: 'NVDA',
  isPreMarket: true,
  dripSettings: {
    NVDA: true,
    MSFT: true,
    SPACEX: false,
    ANTHROPIC: false,
  },

  setSelectedStock: (symbol) => set({ selectedStock: symbol }),
  togglePreMarket: () => set((state) => ({ isPreMarket: !state.isPreMarket })),
  toggleDrip: (symbol) =>
    set((state) => ({
      dripSettings: {
        ...state.dripSettings,
        [symbol]: !state.dripSettings[symbol],
      },
    })),

  // Wallet
  autoSweepEnabled: true,
  sweepThreshold: 50000,
  transactions: WALLET_TRANSACTIONS_DATA,
  filterVertical: 'ALL',

  toggleAutoSweep: () => set((state) => ({ autoSweepEnabled: !state.autoSweepEnabled })),
  setSweepThreshold: (amount) => set({ sweepThreshold: amount }),
  setFilterVertical: (v) => set({ filterVertical: v }),
}));
