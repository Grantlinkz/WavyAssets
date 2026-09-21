import { create } from 'zustand';
import {
  INITIAL_OTC_ORDERS,
  INITIAL_DRIVE_SLOTS,
  GPU_CLUSTER_TELEMETRY,
  type SecondaryOtcOrder,
  type DriveBookingSlot,
} from '../lib/alternativeAssetData';

export type RiskTierId = 'preservation' | 'balanced' | 'high-vol';
export type RealEstateRegionFilter = 'ALL REGIONS' | 'SWITZERLAND' | 'UNITED KINGDOM' | 'GERMANY';
export type OtcTabType = 'ALL' | 'BIDS' | 'OFFERS';

export interface RealEstateLease {
  id: string;
  termMonths: number;
  monthlyRent: number;
  unitType?: string;
  startDate: string;
}

export interface VehicleHolding {
  owned: boolean;
  purchaseType?: 'full' | 'fractional';
  fractionalPct?: number;
  totalInvested?: number;
  leases: Array<{ id: string; type: string; duration: string; cost: number; date: string }>;
}

interface AlternativeStoreState {
  // AI Funds state
  selectedRiskTier: RiskTierId;
  isCircuitBreakerTriggered: boolean;
  activeRationaleFilter: string;
  claimedGpuYieldUsdc: number;
  pendingGpuYieldUsdc: number;

  // Real Estate state
  selectedRegionFilter: RealEstateRegionFilter;
  otcOrders: SecondaryOtcOrder[];
  activeOtcTab: OtcTabType;
  lastExecutedOrderId: string | null;

  // Cars & Horology state
  driveSlots: DriveBookingSlot[];
  selectedLocation: string;
  remainingDriveSessions: number;
  lastReservedDay: number | null;

  // User-acquired Real Estate holdings & leases
  userRealEstateHoldings: Record<
    string,
    {
      tokens: number;
      totalInvested: number;
      leases: RealEstateLease[];
    }
  >;

  // User-acquired Vehicles & Horology holdings & leases
  userVehicleHoldings: Record<string, VehicleHolding>;

  // Actions
  setRiskTier: (tier: RiskTierId) => void;
  triggerCircuitBreaker: () => void;
  resetCircuitBreaker: () => void;
  setRationaleFilter: (filter: string) => void;
  claimGpuYield: () => void;

  setRegionFilter: (region: RealEstateRegionFilter) => void;
  setOtcTab: (tab: OtcTabType) => void;
  executeOtcOrder: (orderId: string) => void;
  buyProperty: (propertyId: string, tokens: number, tokenPrice: number) => boolean;
  leaseProperty: (propertyId: string, termMonths: number, monthlyRent: number, unitType?: string) => boolean;

  setSelectedLocation: (location: string) => void;
  reserveDriveSlot: (day: number) => boolean;
  buyVehicleAsset: (
    assetId: string,
    price: number,
    purchaseType?: 'full' | 'fractional',
    fractionalPct?: number
  ) => boolean;
  leaseVehicleAsset: (assetId: string, type: string, duration: string, cost: number) => boolean;
}

export const INITIAL_USER_REAL_ESTATE_HOLDINGS: Record<
  string,
  { tokens: number; totalInvested: number; leases: RealEstateLease[] }
> = {
  're-1': { tokens: 2400, totalInvested: 1200000, leases: [] },
  're-2': { tokens: 1500, totalInvested: 750000, leases: [] },
  're-3': { tokens: 1100, totalInvested: 550000, leases: [] },
  're-4': { tokens: 700, totalInvested: 350000, leases: [] },
};

export const useAlternativeStore = create<AlternativeStoreState>((set, get) => ({
  // AI Funds initial state
  selectedRiskTier: 'balanced',
  isCircuitBreakerTriggered: false,
  activeRationaleFilter: 'All Events',
  claimedGpuYieldUsdc: 0,
  pendingGpuYieldUsdc: GPU_CLUSTER_TELEMETRY.pendingYieldUsdc,

  // Real Estate initial state
  selectedRegionFilter: 'ALL REGIONS',
  otcOrders: INITIAL_OTC_ORDERS,
  activeOtcTab: 'ALL',
  lastExecutedOrderId: null,
  userRealEstateHoldings: INITIAL_USER_REAL_ESTATE_HOLDINGS,

  // Cars initial state
  driveSlots: INITIAL_DRIVE_SLOTS,
  selectedLocation: 'Monaco GP Circuit',
  remainingDriveSessions: 2,
  lastReservedDay: null,
  userVehicleHoldings: {},

  // AI Funds Actions
  setRiskTier: (tier) => set({ selectedRiskTier: tier }),

  triggerCircuitBreaker: () => set({ isCircuitBreakerTriggered: true }),

  resetCircuitBreaker: () => set({ isCircuitBreakerTriggered: false }),

  setRationaleFilter: (filter) => set({ activeRationaleFilter: filter }),

  claimGpuYield: () => {
    const current = get().pendingGpuYieldUsdc;
    if (current > 0) {
      set((s) => ({
        claimedGpuYieldUsdc: s.claimedGpuYieldUsdc + current,
        pendingGpuYieldUsdc: 0,
      }));
    }
  },

  // Real Estate Actions
  setRegionFilter: (region) => set({ selectedRegionFilter: region }),

  setOtcTab: (tab) => set({ activeOtcTab: tab }),

  executeOtcOrder: (orderId) => {
    set((state) => ({
      otcOrders: state.otcOrders.filter((o) => o.id !== orderId),
      lastExecutedOrderId: orderId,
    }));
  },

  buyProperty: (propertyId, tokens, tokenPrice) => {
    set((state) => {
      const existing = state.userRealEstateHoldings[propertyId] || {
        tokens: 0,
        totalInvested: 0,
        leases: [],
      };
      return {
        userRealEstateHoldings: {
          ...state.userRealEstateHoldings,
          [propertyId]: {
            ...existing,
            tokens: existing.tokens + tokens,
            totalInvested: existing.totalInvested + tokens * tokenPrice,
          },
        },
      };
    });
    return true;
  },

  leaseProperty: (propertyId, termMonths, monthlyRent, unitType = 'Full Commercial Floor') => {
    set((state) => {
      const existing = state.userRealEstateHoldings[propertyId] || {
        tokens: 0,
        totalInvested: 0,
        leases: [],
      };
      const newLease: RealEstateLease = {
        id: `lease-${Date.now()}`,
        termMonths,
        monthlyRent,
        unitType,
        startDate: new Date().toISOString(),
      };
      return {
        userRealEstateHoldings: {
          ...state.userRealEstateHoldings,
          [propertyId]: {
            ...existing,
            leases: [...existing.leases, newLease],
          },
        },
      };
    });
    return true;
  },

  // Cars Actions
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  reserveDriveSlot: (day) => {
    const { driveSlots, remainingDriveSessions } = get();
    if (remainingDriveSessions <= 0) return false;

    const targetSlot = driveSlots.find((s) => s.day === day);
    if (!targetSlot || targetSlot.status !== 'available') return false;

    set((state) => ({
      driveSlots: state.driveSlots.map((slot) =>
        slot.day === day
          ? {
              ...slot,
              status: 'booked',
              title: `Member Session — ${state.selectedLocation}`,
            }
          : slot
      ),
      remainingDriveSessions: state.remainingDriveSessions - 1,
      lastReservedDay: day,
    }));

    return true;
  },

  buyVehicleAsset: (assetId, price, purchaseType = 'full', fractionalPct = 100) => {
    set((state) => {
      const existing = state.userVehicleHoldings[assetId] || {
        owned: false,
        leases: [],
      };
      return {
        userVehicleHoldings: {
          ...state.userVehicleHoldings,
          [assetId]: {
            ...existing,
            owned: purchaseType === 'full',
            purchaseType,
            fractionalPct: purchaseType === 'fractional' ? fractionalPct : 100,
            totalInvested: (existing.totalInvested || 0) + price,
          },
        },
      };
    });
    return true;
  },

  leaseVehicleAsset: (assetId, type, duration, cost) => {
    set((state) => {
      const existing = state.userVehicleHoldings[assetId] || { owned: false, leases: [] };
      const newLease = {
        id: `vlease-${Date.now()}`,
        type,
        duration,
        cost,
        date: new Date().toISOString(),
      };
      return {
        userVehicleHoldings: {
          ...state.userVehicleHoldings,
          [assetId]: {
            ...existing,
            leases: [...existing.leases, newLease],
          },
        },
      };
    });
    return true;
  },
}));
