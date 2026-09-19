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
      leases: Array<{ id: string; termMonths: number; monthlyRent: number; startDate: string }>;
    }
  >;

  // User-acquired Vehicles & Horology holdings & leases
  userVehicleHoldings: Record<
    string,
    {
      owned: boolean;
      leases: Array<{ id: string; type: string; duration: string; cost: number; date: string }>;
    }
  >;

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
  leaseProperty: (propertyId: string, termMonths: number, monthlyRent: number) => boolean;

  setSelectedLocation: (location: string) => void;
  reserveDriveSlot: (day: number) => boolean;
  buyVehicleAsset: (assetId: string, price: number) => boolean;
  leaseVehicleAsset: (assetId: string, type: string, duration: string, cost: number) => boolean;
}

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
  userRealEstateHoldings: {},

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

  leaseProperty: (propertyId, termMonths, monthlyRent) => {
    set((state) => {
      const existing = state.userRealEstateHoldings[propertyId] || {
        tokens: 0,
        totalInvested: 0,
        leases: [],
      };
      const newLease = {
        id: `lease-${Date.now()}`,
        termMonths,
        monthlyRent,
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

  buyVehicleAsset: (assetId, _price) => {
    set((state) => {
      const existing = state.userVehicleHoldings[assetId] || { owned: false, leases: [] };
      return {
        userVehicleHoldings: {
          ...state.userVehicleHoldings,
          [assetId]: {
            ...existing,
            owned: true,
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
