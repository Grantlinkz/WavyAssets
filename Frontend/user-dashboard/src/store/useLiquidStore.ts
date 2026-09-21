import { create } from 'zustand';
import {
  WALLET_TRANSACTIONS_DATA,
  type DcaScheduleItem,
  type WalletTransaction,
} from '../lib/liquidAssetData';

export interface ActiveOrder {
  id: string;
  symbol: string;
  type: 'BUY_LIMIT' | 'SELL_LIMIT' | 'STOP_LOSS';
  shares: number;
  limitPrice: number;
  status: 'PENDING' | 'ROUTING' | 'CANCELLED';
  expires: string;
}

interface LiquidState {
  // Crypto module state
  dcaSchedules: DcaScheduleItem[];
  unclaimedRewards: number;
  isCompounding: boolean;
  toggleDcaSchedule: (id: string) => void;
  addDcaSchedule: (schedule: Omit<DcaScheduleItem, 'id'>) => void;
  deleteDcaSchedule: (id: string) => void;
  triggerFastCompound: () => void;

  // Stocks module state
  selectedStock: string;
  isPreMarket: boolean;
  dripSettings: Record<string, boolean>;
  activeOrders: ActiveOrder[];
  setSelectedStock: (symbol: string) => void;
  togglePreMarket: () => void;
  toggleDrip: (symbol: string) => void;
  addActiveOrder: (order: Omit<ActiveOrder, 'id'>) => void;
  cancelActiveOrder: (id: string) => void;

  // Wallet module state
  autoSweepEnabled: boolean;
  sweepThreshold: number;
  transactions: WalletTransaction[];
  filterVertical: string;
  addTransaction: (tx: WalletTransaction) => void;
  toggleAutoSweep: () => void;
  setSweepThreshold: (amount: number) => void;
  setFilterVertical: (v: string) => void;
}

export const useLiquidStore = create<LiquidState>((set) => ({
  // Crypto
  dcaSchedules: [],
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

  deleteDcaSchedule: (id) => {
    set((state) => ({
      dcaSchedules: state.dcaSchedules.filter((item) => item.id !== id),
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
  activeOrders: [],

  setSelectedStock: (symbol) => set({ selectedStock: symbol }),
  togglePreMarket: () => set((state) => ({ isPreMarket: !state.isPreMarket })),
  toggleDrip: (symbol) =>
    set((state) => ({
      dripSettings: {
        ...state.dripSettings,
        [symbol]: !state.dripSettings[symbol],
      },
    })),

  addActiveOrder: (order) =>
    set((state) => ({
      activeOrders: [
        {
          ...order,
          id: `ord-${Math.floor(100 + Math.random() * 900)}`,
        },
        ...state.activeOrders,
      ],
    })),

  cancelActiveOrder: (id) =>
    set((state) => ({
      activeOrders: state.activeOrders.filter((order) => order.id !== id),
    })),

  // Wallet
  autoSweepEnabled: true,
  sweepThreshold: 50000,
  transactions: WALLET_TRANSACTIONS_DATA,
  filterVertical: 'ALL',

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions],
    })),
  toggleAutoSweep: () => set((state) => ({ autoSweepEnabled: !state.autoSweepEnabled })),
  setSweepThreshold: (amount) => set({ sweepThreshold: amount }),
  setFilterVertical: (v) => set({ filterVertical: v }),
}));
