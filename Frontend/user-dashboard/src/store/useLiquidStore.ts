import { create } from 'zustand';
import {
  WALLET_TRANSACTIONS_DATA,
  INITIAL_DCA_SCHEDULES,
  type DcaScheduleItem,
  type WalletTransaction,
} from '../lib/liquidAssetData';
import { BASELINE_SPOT_PRICES } from '../lib/priceService';

export interface ActiveOrder {
  id: string;
  symbol: string;
  type: 'BUY_LIMIT' | 'SELL_LIMIT' | 'STOP_LOSS';
  shares: number;
  limitPrice: number;
  status: 'PENDING' | 'ROUTING' | 'CANCELLED';
  expires: string;
}

const DCA_STORAGE_PREFIX = 'wavyassets_dca_schedules_';

function getStoredDca(userId?: string): DcaScheduleItem[] | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(`${DCA_STORAGE_PREFIX}${userId || 'default'}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  return null;
}

function persistDca(schedules: DcaScheduleItem[], userId?: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(
        `${DCA_STORAGE_PREFIX}${userId || 'default'}`,
        JSON.stringify(schedules)
      );
    } catch {
      // ignore
    }
  }
}

interface LiquidState {
  // Crypto module state
  dcaSchedules: DcaScheduleItem[];
  unclaimedRewards: number;
  isCompounding: boolean;
  targetDcaAsset: string;
  livePrices: Record<string, number>;
  setTargetDcaAsset: (asset: string) => void;
  setLivePrices: (prices: Record<string, number>) => void;
  loadUserDcaSchedules: (userId?: string) => void;
  toggleDcaSchedule: (id: string, userId?: string) => void;
  addDcaSchedule: (schedule: Omit<DcaScheduleItem, 'id'>, userId?: string) => void;
  deleteDcaSchedule: (id: string, userId?: string) => void;
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
  targetDcaAsset: 'BTC',
  livePrices: { ...BASELINE_SPOT_PRICES },

  setTargetDcaAsset: (asset: string) => set({ targetDcaAsset: asset }),
  setLivePrices: (prices: Record<string, number>) =>
    set((state) => ({ livePrices: { ...state.livePrices, ...prices } })),

  loadUserDcaSchedules: (userId?: string) => {
    const stored = getStoredDca(userId);
    if (stored && stored.length > 0) {
      set({ dcaSchedules: stored });
    } else {
      // Default to initial schedules with $25,000 BTC active execution schedule
      set({ dcaSchedules: INITIAL_DCA_SCHEDULES });
      persistDca(INITIAL_DCA_SCHEDULES, userId);
    }
  },

  toggleDcaSchedule: (id, userId) => {
    set((state) => {
      const updated = state.dcaSchedules.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      );
      persistDca(updated, userId);
      return { dcaSchedules: updated };
    });
  },

  addDcaSchedule: (schedule, userId) => {
    set((state) => {
      const updated = [
        ...state.dcaSchedules,
        { ...schedule, id: `dca-${Date.now()}` },
      ];
      persistDca(updated, userId);
      return { dcaSchedules: updated };
    });
  },

  deleteDcaSchedule: (id, userId) => {
    set((state) => {
      const updated = state.dcaSchedules.filter((item) => item.id !== id);
      persistDca(updated, userId);
      return { dcaSchedules: updated };
    });
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
