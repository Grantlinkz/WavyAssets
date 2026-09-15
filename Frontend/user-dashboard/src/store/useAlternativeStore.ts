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

  // Actions
  setRiskTier: (tier: RiskTierId) => void;
  triggerCircuitBreaker: () => void;
  resetCircuitBreaker: () => void;
  setRationaleFilter: (filter: string) => void;
  claimGpuYield: () => void;

  setRegionFilter: (region: RealEstateRegionFilter) => void;
  setOtcTab: (tab: OtcTabType) => void;
  executeOtcOrder: (orderId: string) => void;

  setSelectedLocation: (location: string) => void;
  reserveDriveSlot: (day: number) => boolean;
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

  // Cars initial state
  driveSlots: INITIAL_DRIVE_SLOTS,
  selectedLocation: 'Monaco GP Circuit // Private Club Session',
  remainingDriveSessions: 2,
  lastReservedDay: null,

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

  // Cars Actions
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  reserveDriveSlot: (day) => {
    const { remainingDriveSessions, driveSlots } = get();
    if (remainingDriveSessions <= 0) return false;

    const slot = driveSlots.find((s) => s.day === day);
    if (!slot || slot.status !== 'available') return false;

    set((state) => ({
      driveSlots: state.driveSlots.map((s) =>
        s.day === day
          ? { ...s, status: 'booked', title: 'Confirmed Member Reservation' }
          : s
      ),
      remainingDriveSessions: state.remainingDriveSessions - 1,
      lastReservedDay: day,
    }));
    return true;
  },
}));
