import { create } from 'zustand';
import {
  INITIAL_DRIVE_SLOTS,
  GPU_CLUSTER_TELEMETRY,
  REAL_ESTATE_ASSETS,
  EXOTIC_ASSETS,
  type SecondaryOtcOrder,
  type DriveBookingSlot,
} from '../lib/alternativeAssetData';
export { INITIAL_OTC_ORDERS } from '../lib/alternativeAssetData';
import { usePortfolioStore } from './usePortfolioStore';

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

export function calculateTotalRealEstateEquity(
  holdings: Record<string, { tokens: number; totalInvested: number; leases: RealEstateLease[] }>
): number {
  let total = 0;
  Object.entries(holdings).forEach(([propId, holding]) => {
    const asset = REAL_ESTATE_ASSETS.find((a) => a.id === propId);
    const tokenPrice = asset?.tokenPrice || 500;
    const buyVal = (holding.tokens || 0) * tokenPrice;
    const leaseVal = (holding.leases || []).reduce(
      (sum, l) => sum + (l.monthlyRent * (l.termMonths || 1)),
      0
    );
    total += buyVal + leaseVal;
  });
  return total;
}

export function calculateTotalCarsValuation(
  holdings: Record<string, VehicleHolding>
): number {
  let total = 0;
  Object.entries(holdings).forEach(([assetId, holding]) => {
    const asset = EXOTIC_ASSETS.find((a) => a.id === assetId);
    const fmv = asset?.fairMarketValue || 0;
    let buyVal = 0;
    if (holding.owned || (holding.totalInvested && holding.totalInvested > 0)) {
      if (holding.purchaseType === 'fractional') {
        buyVal = holding.totalInvested || (holding.fractionalPct ? (holding.fractionalPct / 100) * fmv : fmv);
      } else {
        buyVal = fmv;
      }
    }
    const leaseVal = (holding.leases || []).reduce((sum, l) => sum + (l.cost || 0), 0);
    total += buyVal + leaseVal;
  });
  return total;
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
  sellProperty: (propertyId: string, tokensToSell: number, pricePerToken?: number) => boolean;
  leaseProperty: (propertyId: string, termMonths: number, monthlyRent: number, unitType?: string) => boolean;

  setSelectedLocation: (location: string) => void;
  reserveDriveSlot: (day: number) => boolean;
  buyVehicleAsset: (
    assetId: string,
    price: number,
    purchaseType?: 'full' | 'fractional',
    fractionalPct?: number
  ) => boolean;
  sellVehicleAsset: (assetId: string) => boolean;
  leaseVehicleAsset: (assetId: string, type: string, duration: string, cost: number) => boolean;
  syncToPortfolio: () => void;
}

export const INITIAL_USER_REAL_ESTATE_HOLDINGS: Record<
  string,
  { tokens: number; totalInvested: number; leases: RealEstateLease[] }
> = {};

export const useAlternativeStore = create<AlternativeStoreState>((set, get) => ({
  // AI Funds initial state
  selectedRiskTier: 'balanced',
  isCircuitBreakerTriggered: false,
  activeRationaleFilter: 'All Events',
  claimedGpuYieldUsdc: 0,
  pendingGpuYieldUsdc: GPU_CLUSTER_TELEMETRY.pendingYieldUsdc,

  // Real Estate initial state
  selectedRegionFilter: 'ALL REGIONS',
  otcOrders: [],
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

  syncToPortfolio: () => {
    const reEquity = calculateTotalRealEstateEquity(get().userRealEstateHoldings);
    const carVal = calculateTotalCarsValuation(get().userVehicleHoldings);
    usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal);
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
    const totalCost = tokens * tokenPrice;
    const currentCash = usePortfolioStore.getState().availableCash;
    if (totalCost > currentCash) return false;
    usePortfolioStore.getState().adjustAvailableCash(-totalCost);

    set((state) => {
      const existing = state.userRealEstateHoldings[propertyId] || {
        tokens: 0,
        totalInvested: 0,
        leases: [],
      };
      const updatedHoldings = {
        ...state.userRealEstateHoldings,
        [propertyId]: {
          ...existing,
          tokens: existing.tokens + tokens,
          totalInvested: existing.totalInvested + totalCost,
        },
      };

      const asset = REAL_ESTATE_ASSETS.find((a) => a.id === propertyId);
      const updatedOtc = [
        ...state.otcOrders.filter((o) => o.id !== `otc-user-${propertyId}`),
        {
          id: `otc-user-${propertyId}`,
          type: 'OFFER' as const,
          propertyName: asset?.name || 'Institutional SPV Asset',
          tokenCount: existing.tokens + tokens,
          pricePerToken: tokenPrice,
          navPremiumDiscountPct: 0.0,
          counterpartyEnclave: 'Primary Allocation (Fiduciary Cleared)',
          totalUsd: (existing.tokens + tokens) * tokenPrice,
        },
      ];

      const reEquity = calculateTotalRealEstateEquity(updatedHoldings);
      const carVal = calculateTotalCarsValuation(state.userVehicleHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal);

      return {
        userRealEstateHoldings: updatedHoldings,
        otcOrders: updatedOtc,
      };
    });
    return true;
  },

  sellProperty: (propertyId, tokensToSell, pricePerToken) => {
    set((state) => {
      const existing = state.userRealEstateHoldings[propertyId];
      if (!existing || existing.tokens <= 0) return state;

      const count = Math.min(existing.tokens, tokensToSell);
      const remainingTokens = existing.tokens - count;
      const asset = REAL_ESTATE_ASSETS.find((a) => a.id === propertyId);
      const tokenPrice = pricePerToken || asset?.tokenPrice || 500;
      const proceeds = count * tokenPrice;

      const updatedHoldings = { ...state.userRealEstateHoldings };
      if (remainingTokens <= 0 && (!existing.leases || existing.leases.length === 0)) {
        delete updatedHoldings[propertyId];
      } else {
        const basisPerToken = existing.tokens > 0 ? existing.totalInvested / existing.tokens : 0;
        const soldBasis = basisPerToken * count;
        updatedHoldings[propertyId] = {
          ...existing,
          tokens: remainingTokens,
          totalInvested: Math.max(0, existing.totalInvested - soldBasis),
        };
      }

      const updatedOtc = state.otcOrders
        .filter((o) => o.id !== `otc-user-${propertyId}`)
        .concat(
          remainingTokens > 0
            ? [
                {
                  id: `otc-user-${propertyId}`,
                  type: 'OFFER' as const,
                  propertyName: asset?.name || 'Institutional SPV Asset',
                  tokenCount: remainingTokens,
                  pricePerToken: tokenPrice,
                  navPremiumDiscountPct: 0.0,
                  counterpartyEnclave: 'Primary Allocation (Fiduciary Cleared)',
                  totalUsd: remainingTokens * tokenPrice,
                },
              ]
            : []
        );

      const reEquity = calculateTotalRealEstateEquity(updatedHoldings);
      const carVal = calculateTotalCarsValuation(state.userVehicleHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal);
      usePortfolioStore.getState().adjustAvailableCash(proceeds);

      return {
        userRealEstateHoldings: updatedHoldings,
        otcOrders: updatedOtc,
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
      const updatedHoldings = {
        ...state.userRealEstateHoldings,
        [propertyId]: {
          ...existing,
          leases: [...existing.leases, newLease],
        },
      };

      const reEquity = calculateTotalRealEstateEquity(updatedHoldings);
      const carVal = calculateTotalCarsValuation(state.userVehicleHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal);

      return {
        userRealEstateHoldings: updatedHoldings,
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
    const currentCash = usePortfolioStore.getState().availableCash;
    if (price > currentCash) return false;
    usePortfolioStore.getState().adjustAvailableCash(-price);

    set((state) => {
      const existing = state.userVehicleHoldings[assetId] || {
        owned: false,
        leases: [],
      };
      const updatedHoldings = {
        ...state.userVehicleHoldings,
        [assetId]: {
          ...existing,
          owned: purchaseType === 'full',
          purchaseType,
          fractionalPct: purchaseType === 'fractional' ? fractionalPct : 100,
          totalInvested: (existing.totalInvested || 0) + price,
        },
      };

      const reEquity = calculateTotalRealEstateEquity(state.userRealEstateHoldings);
      const carVal = calculateTotalCarsValuation(updatedHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal);

      return {
        userVehicleHoldings: updatedHoldings,
      };
    });
    return true;
  },

  sellVehicleAsset: (assetId) => {
    set((state) => {
      const existing = state.userVehicleHoldings[assetId];
      if (!existing) return state;

      const asset = EXOTIC_ASSETS.find((a) => a.id === assetId);
      const proceeds = existing.totalInvested || asset?.fairMarketValue || 0;

      const updatedHoldings = { ...state.userVehicleHoldings };
      delete updatedHoldings[assetId];

      const reEquity = calculateTotalRealEstateEquity(state.userRealEstateHoldings);
      const carVal = calculateTotalCarsValuation(updatedHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal);
      usePortfolioStore.getState().adjustAvailableCash(proceeds);

      return {
        userVehicleHoldings: updatedHoldings,
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
      const updatedHoldings = {
        ...state.userVehicleHoldings,
        [assetId]: {
          ...existing,
          leases: [...existing.leases, newLease],
        },
      };

      const reEquity = calculateTotalRealEstateEquity(state.userRealEstateHoldings);
      const carVal = calculateTotalCarsValuation(updatedHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal);

      return {
        userVehicleHoldings: updatedHoldings,
      };
    });
    return true;
  },
}));
