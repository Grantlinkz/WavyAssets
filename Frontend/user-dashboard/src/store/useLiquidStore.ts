import { create } from 'zustand';
import {
  WALLET_TRANSACTIONS_DATA,
  type DcaScheduleItem,
  type WalletTransaction,
} from '../lib/liquidAssetData';
import { BASELINE_SPOT_PRICES } from '../lib/priceService';
import {
  fetchUserDcaSchedules,
  createDcaScheduleApi,
  toggleDcaScheduleApi,
  deleteDcaScheduleApi,
  fetchUserStockOrders,
  submitStockOrder,
  cancelStockOrderApi,
} from '../lib/api';
import { isSsrOrTestEnv } from '../lib/calculations';

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
  targetDcaAsset: string;
  livePrices: Record<string, number>;
  setTargetDcaAsset: (asset: string) => void;
  setLivePrices: (prices: Record<string, number>) => void;
  loadUserDcaSchedules: (userId?: string) => Promise<void>;
  toggleDcaSchedule: (id: string, userId?: string) => Promise<void>;
  addDcaSchedule: (schedule: Omit<DcaScheduleItem, 'id'>, userId?: string) => Promise<void>;
  deleteDcaSchedule: (id: string, userId?: string) => Promise<void>;
  triggerFastCompound: () => void;

  // Stocks module state
  selectedStock: string;
  isPreMarket: boolean;
  dripSettings: Record<string, boolean>;
  activeOrders: ActiveOrder[];
  setSelectedStock: (symbol: string) => void;
  togglePreMarket: () => void;
  toggleDrip: (symbol: string) => void;
  loadUserOrders: (userId?: string) => Promise<void>;
  addActiveOrder: (order: Omit<ActiveOrder, 'id'>, userId?: string) => Promise<void>;
  cancelActiveOrder: (id: string, userId?: string) => Promise<void>;

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

  loadUserDcaSchedules: async () => {
    if (isSsrOrTestEnv()) return;
    try {
      const data = await fetchUserDcaSchedules<any[]>([]);
      if (Array.isArray(data)) {
        const mapped: DcaScheduleItem[] = data.map((d) => ({
          id: d.id,
          asset: d.symbol || d.asset || 'BTC',
          amountUsd: Number(d.amountUsd),
          frequency: (d.frequency || 'DAILY') as DcaScheduleItem['frequency'],
          sourceAccount: d.sourceAccount || 'USD Operating Balance',
          active: d.isActive !== undefined ? Boolean(d.isActive) : Boolean(d.active),
          nextExecution: d.nextRunAt
            ? new Date(d.nextRunAt).toLocaleString()
            : d.nextExecution
            ? new Date(d.nextExecution).toLocaleString()
            : 'In 24h',
        }));
        set({ dcaSchedules: mapped });
      }
    } catch (err) {
      console.error('Failed to load DCA schedules from DB', err);
    }
  },

  toggleDcaSchedule: async (id) => {
    set((state) => ({
      dcaSchedules: state.dcaSchedules.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      ),
    }));
    if (isSsrOrTestEnv()) return;
    try {
      await toggleDcaScheduleApi(id);
    } catch (err) {
      console.error('Failed to toggle DCA schedule in DB', err);
    }
  },

  addDcaSchedule: async (schedule) => {
    const tempId = `dca-${Date.now()}`;
    const newSchedule: DcaScheduleItem = {
      ...schedule,
      id: tempId,
    };
    set((state) => ({
      dcaSchedules: [...state.dcaSchedules, newSchedule],
    }));
    if (isSsrOrTestEnv()) return;
    try {
      const frequencyPayload =
        schedule.frequency === 'BI_WEEKLY' ? 'BIWEEKLY' : schedule.frequency;
      const res: any = await createDcaScheduleApi({
        symbol: schedule.asset,
        amountUsd: schedule.amountUsd,
        frequency: frequencyPayload,
      });
      const serverId = res?.schedule?.id ?? res?.id;
      if (serverId) {
        set((state) => ({
          dcaSchedules: state.dcaSchedules.map((s) => (s.id === tempId ? { ...s, id: serverId } : s)),
        }));
      }
    } catch (err) {
      console.error('Failed to create DCA schedule in DB', err);
    }
  },

  deleteDcaSchedule: async (id) => {
    set((state) => ({
      dcaSchedules: state.dcaSchedules.filter((item) => item.id !== id),
    }));
    if (isSsrOrTestEnv()) return;
    try {
      await deleteDcaScheduleApi(id);
    } catch (err) {
      console.error('Failed to delete DCA schedule from DB', err);
    }
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

  loadUserOrders: async () => {
    if (isSsrOrTestEnv()) return;
    try {
      const data = await fetchUserStockOrders<any[]>([]);
      if (Array.isArray(data)) {
        const mapped: ActiveOrder[] = data.map((o) => ({
          id: o.id,
          symbol: o.symbol,
          type: o.orderType === 'LIMIT' ? (o.side === 'BUY' ? 'BUY_LIMIT' : 'SELL_LIMIT') : 'BUY_LIMIT',
          shares: Number(o.shares),
          limitPrice: Number(o.limitPrice || 0),
          status: o.status === 'FILLED' ? 'ROUTING' : (o.status || 'PENDING'),
          expires: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'DAY',
        }));
        set({ activeOrders: mapped });
      }
    } catch (err) {
      console.error('Failed to load user stock orders from DB', err);
    }
  },

  addActiveOrder: async (order) => {
    const tempId = `ord-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: ActiveOrder = {
      ...order,
      id: tempId,
    };
    set((state) => ({
      activeOrders: [newOrder, ...state.activeOrders],
    }));
    if (isSsrOrTestEnv()) return;
    try {
      const side = order.type.startsWith('BUY') ? 'BUY' : 'SELL';
      const res: any = await submitStockOrder({
        symbol: order.symbol,
        orderType: 'LIMIT',
        side,
        shares: order.shares,
        limitPrice: order.limitPrice,
      });
      const serverId = res?.order?.id ?? res?.id;
      if (serverId) {
        set((state) => ({
          activeOrders: state.activeOrders.map((o) => (o.id === tempId ? { ...o, id: serverId } : o)),
        }));
      }
    } catch (err) {
      console.error('Failed to submit stock order to DB', err);
    }
  },

  cancelActiveOrder: async (id) => {
    set((state) => ({
      activeOrders: state.activeOrders.filter((order) => order.id !== id),
    }));
    if (isSsrOrTestEnv()) return;
    try {
      await cancelStockOrderApi(id);
    } catch (err) {
      console.error('Failed to cancel stock order in DB', err);
    }
  },

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
