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
  fetchUserTransactions,
} from '../lib/api';
import { isSsrOrTestEnv } from '../lib/calculations';

export interface ActiveOrder {
  id: string;
  symbol: string;
  type: 'BUY_LIMIT' | 'SELL_LIMIT' | 'STOP_LOSS';
  shares: number;
  limitPrice: number;
  status: 'Active' | 'Cancelled' | 'Expired' | 'PENDING' | 'ROUTING' | 'CANCELLED';
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
  loadTransactions: (userId?: string) => Promise<void>;
  addTransaction: (tx: WalletTransaction) => void;
  removeTransaction: (id: string) => void;
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
      const data = await fetchUserDcaSchedules<Record<string, unknown>[]>([]);
      if (Array.isArray(data)) {
        const mapped: DcaScheduleItem[] = data.map((d) => ({
          id: String(d.id || ''),
          asset: String(d.symbol || d.asset || 'BTC'),
          amountUsd: Number(d.amountUsd || 0),
          frequency: (String(d.frequency || 'DAILY').toUpperCase()) as DcaScheduleItem['frequency'],
          sourceAccount: String(d.sourceAccount || 'USD Operating Balance'),
          active: d.isActive !== undefined ? Boolean(d.isActive) : Boolean(d.active),
          nextExecution: d.nextRunAt
            ? new Date(String(d.nextRunAt)).toLocaleString()
            : d.nextExecution
            ? new Date(String(d.nextExecution)).toLocaleString()
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
    const tx: WalletTransaction = {
      id: `tx-dca-${Date.now()}`,
      timestamp: 'Today, Just now',
      vertical: 'CRYPTO',
      type: 'SWAP',
      description: `DCA Recurring Buy Reservation: ${schedule.asset} ($${schedule.amountUsd.toLocaleString()})`,
      amountUsd: schedule.amountUsd,
      status: 'CLEARED',
      reference: `DCA-${schedule.asset}-${Date.now().toString().slice(-4)}`,
      dcaScheduleId: tempId,
    };
    set((state) => ({
      dcaSchedules: [...state.dcaSchedules, newSchedule],
      transactions: [tx, ...state.transactions],
    }));
    if (isSsrOrTestEnv()) return;
    try {
      const frequencyPayload =
        schedule.frequency === 'BI_WEEKLY' ? 'BIWEEKLY' : schedule.frequency;
      const res = (await createDcaScheduleApi({
        symbol: schedule.asset,
        amountUsd: schedule.amountUsd,
        frequency: frequencyPayload,
      })) as { schedule?: { id: string }; id?: string } | undefined;
      const serverId = res?.schedule?.id ?? res?.id;
      if (serverId) {
        set((state) => ({
          dcaSchedules: state.dcaSchedules.map((s) => (s.id === tempId ? { ...s, id: serverId } : s)),
          transactions: state.transactions.map((t) =>
            t.dcaScheduleId === tempId ? { ...t, dcaScheduleId: serverId } : t
          ),
        }));
      }
    } catch (err) {
      console.error('Failed to create DCA schedule in DB', err);
      // Revert optimistic schedule on network/server failure so ghost item doesn't linger
      set((state) => ({
        dcaSchedules: state.dcaSchedules.filter((s) => s.id !== tempId),
        transactions: state.transactions.filter((t) => t.id !== tx.id),
      }));
      throw err;
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
      const data = await fetchUserStockOrders<Record<string, unknown>[]>([]);
      if (Array.isArray(data)) {
        const mapped: ActiveOrder[] = data.map((o) => ({
          id: String(o.id || ''),
          symbol: String(o.symbol || ''),
          type: o.orderType === 'LIMIT' ? (o.side === 'BUY' ? 'BUY_LIMIT' : 'SELL_LIMIT') : 'BUY_LIMIT',
          shares: Number(o.shares || 0),
          limitPrice: Number(o.limitPrice || 0),
          status: o.status === 'FILLED' ? 'ROUTING' : ((o.status as ActiveOrder['status']) || 'PENDING'),
          expires: o.createdAt
            ? new Date(String(o.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'DAY',
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
      const res = (await submitStockOrder({
        symbol: order.symbol,
        orderType: 'LIMIT',
        side,
        shares: order.shares,
        limitPrice: order.limitPrice,
      })) as { order?: { id: string }; id?: string } | undefined;
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

  loadTransactions: async () => {
    if (isSsrOrTestEnv()) return;
    try {
      const data = await fetchUserTransactions<Record<string, unknown> | Array<Record<string, unknown>>>(50, { transactions: [] });
      const rawList = Array.isArray(data)
        ? data
        : Array.isArray((data as Record<string, unknown>)?.transactions)
        ? ((data as Record<string, unknown>).transactions as Array<Record<string, unknown>>)
        : [];
      if (Array.isArray(rawList)) {
        const mapped: WalletTransaction[] = rawList.map((t) => {
          const desc = String(t.description || '');
          const isCrypto =
            t.accountType === 'INVESTED_CAPITAL' ||
            desc.toLowerCase().includes('dca') ||
            desc.toLowerCase().includes('crypto') ||
            desc.toLowerCase().includes('swap') ||
            desc.toLowerCase().includes('btc') ||
            desc.toLowerCase().includes('eth') ||
            desc.toLowerCase().includes('sol') ||
            desc.toLowerCase().includes('link');
          const isStock =
            desc.toLowerCase().includes('stock') ||
            desc.toLowerCase().includes('nvda') ||
            desc.toLowerCase().includes('msft') ||
            desc.toLowerCase().includes('dividend');
          const isRe =
            desc.toLowerCase().includes('prime') ||
            desc.toLowerCase().includes('commercial') ||
            desc.toLowerCase().includes('rental');

          let vertical: WalletTransaction['vertical'] = 'CASH';
          if (isCrypto) vertical = 'CRYPTO';
          else if (isStock) vertical = 'STOCKS';
          else if (isRe) vertical = 'REAL_ESTATE';

          let txType: WalletTransaction['type'] = 'SWEEP';
          if (isCrypto) txType = 'SWAP';
          else if (t.type === 'DEPOSIT') txType = 'DEPOSIT';
          else if (t.type === 'WITHDRAWAL') txType = 'WITHDRAWAL';
          else if (t.type === 'DIVIDEND' || desc.toLowerCase().includes('dividend')) txType = 'DIVIDEND';

          return {
            id: String(t.id || `tx-${t.referenceId || Date.now()}`),
            timestamp: t.createdAt
              ? new Date(String(t.createdAt)).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
              : 'Today',
            vertical,
            type: txType,
            description: desc || 'Vault Transaction',
            amountUsd: Math.abs(Number(t.amount || 0)),
            status: (t.status === 'CLEARED' || t.status === 'PENDING' || t.status === 'SETTLING') ? t.status : 'CLEARED',
            reference: String(t.referenceId || `TX-${String(t.id || '').slice(-4)}`),
          };
        });

        set((state) => {
          const mappedIds = new Set(mapped.map((m) => m.id));
          const pendingLocal = state.transactions.filter(
            (t) => !mappedIds.has(t.id) && t.status === 'PENDING'
          );
          return { transactions: [...mapped, ...pendingLocal] };
        });
      }
    } catch (err) {
      console.error('Failed to load user transactions from DB', err);
    }
  },

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions],
    })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.id !== id),
    })),
  toggleAutoSweep: () => set((state) => ({ autoSweepEnabled: !state.autoSweepEnabled })),
  setSweepThreshold: (amount) => set({ sweepThreshold: amount }),
  setFilterVertical: (v) => set({ filterVertical: v }),
}));
