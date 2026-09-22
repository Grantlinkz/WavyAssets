import { create } from 'zustand';
import {
  WALLET_TRANSACTIONS_DATA,
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
const ORDERS_STORAGE_PREFIX = 'wavyassets_active_orders_';

function getStoredDca(userId?: string): DcaScheduleItem[] | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(`${DCA_STORAGE_PREFIX}${userId || 'default'}`);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as DcaScheduleItem[];
      }
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

function getStoredOrders(userId?: string): ActiveOrder[] | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(`${ORDERS_STORAGE_PREFIX}${userId || 'default'}`);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as ActiveOrder[];
      }
    } catch {
      // ignore
    }
  }
  return null;
}

function persistOrders(orders: ActiveOrder[], userId?: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(
        `${ORDERS_STORAGE_PREFIX}${userId || 'default'}`,
        JSON.stringify(orders)
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
  loadUserOrders: (userId?: string) => void;
  addActiveOrder: (order: Omit<ActiveOrder, 'id'>, userId?: string) => void;
  cancelActiveOrder: (id: string, userId?: string) => void;

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
    if (stored !== null) {
      set({ dcaSchedules: stored });
    } else {
      // Default to empty array so users start with clean zero state unless they add a schedule
      set({ dcaSchedules: [] });
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

  loadUserOrders: (userId?: string) => {
    const stored = getStoredOrders(userId);
    if (stored !== null) {
      set({ activeOrders: stored });
    } else {
      set({ activeOrders: [] });
    }
  },

  addActiveOrder: (order, userId) =>
    set((state) => {
      const updated = [
        {
          ...order,
          id: `ord-${Math.floor(100 + Math.random() * 900)}`,
        },
        ...state.activeOrders,
      ];
      persistOrders(updated, userId);
      return { activeOrders: updated };
    }),

  cancelActiveOrder: (id, userId) =>
    set((state) => {
      const updated = state.activeOrders.filter((order) => order.id !== id);
      persistOrders(updated, userId);
      return { activeOrders: updated };
    }),

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
