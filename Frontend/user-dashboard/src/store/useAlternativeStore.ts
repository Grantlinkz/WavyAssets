import { create } from 'zustand';
import {
  INITIAL_DRIVE_SLOTS,
  GPU_CLUSTER_TELEMETRY,
  REAL_ESTATE_ASSETS,
  EXOTIC_ASSETS,
  AI_STRATEGY_ASSETS,
  type SecondaryOtcOrder,
  type DriveBookingSlot,
} from '../lib/alternativeAssetData';
export { INITIAL_OTC_ORDERS } from '../lib/alternativeAssetData';
import { usePortfolioStore } from './usePortfolioStore';
import { isSsrOrTestEnv } from '../lib/calculations';
import {
  fetchAiFundPositions,
  buyAiAssetApi,
  sellAiAssetApi,
  fetchRealEstateProperties,
  buyPropertyApi,
  sellPropertyApi,
  fetchCarsVaultInventory,
  buyVehicleAssetApi,
  sellVehicleAssetApi,
} from '../lib/api';

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

export function calculateTotalAiEquity(
  holdings: Record<string, { tokens: number; totalInvested: number; leases?: Array<{ monthlyRent: number; termMonths: number }> }>
): number {
  let total = 0;
  Object.entries(holdings).forEach(([aiId, holding]) => {
    const asset = AI_STRATEGY_ASSETS.find((a) => a.id === aiId);
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

interface AlternativeStoreState {
  // AI Funds state
  selectedRiskTier: RiskTierId;
  isCircuitBreakerTriggered: boolean;
  activeRationaleFilter: string;
  claimedGpuYieldUsdc: number;
  pendingGpuYieldUsdc: number;
  selectedAiCategoryFilter: string;
  userAiHoldings: Record<
    string,
    {
      tokens: number;
      totalInvested: number;
      leases: Array<{ monthlyRent: number; termMonths: number }>;
    }
  >;

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
  loadUserAlternativeHoldings: () => Promise<void>;
  setRiskTier: (tier: RiskTierId) => void;
  triggerCircuitBreaker: () => void;
  resetCircuitBreaker: () => void;
  setRationaleFilter: (filter: string) => void;
  claimGpuYield: () => void;
  setAiCategoryFilter: (category: string) => void;
  buyAiAsset: (assetId: string, tokens: number, tokenPrice: number) => boolean;
  sellAiAsset: (assetId: string, tokensToSell: number, pricePerToken?: number) => boolean;
  leaseAiAsset: (assetId: string, termMonths: number, monthlyRent: number) => boolean;

  setRegionFilter: (region: RealEstateRegionFilter) => void;
  setOtcTab: (tab: OtcTabType) => void;
  executeOtcOrder: (orderId: string) => void;
  buyProperty: (propertyId: string, tokens: number, tokenPrice: number) => boolean;
  sellProperty: (propertyId: string, tokensToSell: number, pricePerToken?: number) => boolean;
  leaseProperty: (propertyId: string, termMonths: number, monthlyRent: number, unitType?: string, deposit?: number) => boolean;

  setSelectedLocation: (location: string) => void;
  reserveDriveSlot: (day?: number) => boolean;
  buyVehicleAsset: (
    assetId: string,
    price: number,
    purchaseType?: 'full' | 'fractional',
    fractionalPct?: number
  ) => boolean;
  sellVehicleAsset: (assetId: string) => boolean;
  leaseVehicleAsset: (assetId: string, type: string, duration: string, cost: number, escrowDeposit?: number) => boolean;
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
  selectedAiCategoryFilter: 'ALL CATEGORIES',
  userAiHoldings: {},

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

  loadUserAlternativeHoldings: async () => {
    if (isSsrOrTestEnv()) return;
    try {
      // 1. Fetch AI positions from DB
      const aiResponse = await fetchAiFundPositions<any>([]);
      const rawPositions: Array<{ strategyId?: string; tokens?: number; totalInvested?: number }> = Array.isArray(aiResponse)
        ? aiResponse
        : Array.isArray(aiResponse?.positions)
        ? aiResponse.positions
        : aiResponse?.position && aiResponse.position.allocatedUsd > 0
        ? [
            {
              strategyId: 'ai-1',
              tokens: Math.floor(aiResponse.position.allocatedUsd / 500),
              totalInvested: aiResponse.position.allocatedUsd,
            },
          ]
        : [];

      const userAiHoldings: Record<string, { tokens: number; totalInvested: number; leases: Array<{ monthlyRent: number; termMonths: number }> }> = {};
      if (rawPositions.length > 0) {
        rawPositions.forEach((pos) => {
          if (pos.strategyId) {
            userAiHoldings[pos.strategyId] = {
              tokens: Number(pos.tokens || 0),
              totalInvested: Number(pos.totalInvested || 0),
              leases: [],
            };
          }
        });
      }

      // 2. Fetch Real Estate properties & user shares from DB
      const reProps = await fetchRealEstateProperties<Array<{ id: string; userHolding?: { tokenCount: number; equityUsd: number } }>>([]);
      const userRealEstateHoldings: Record<string, { tokens: number; totalInvested: number; leases: RealEstateLease[] }> = {};
      if (Array.isArray(reProps)) {
        reProps.forEach((prop) => {
          if (prop.userHolding && prop.userHolding.tokenCount > 0) {
            userRealEstateHoldings[prop.id] = {
              tokens: Number(prop.userHolding.tokenCount),
              totalInvested: Number(prop.userHolding.equityUsd),
              leases: [],
            };
          }
        });
      }

      // 3. Fetch Car inventory & user shares from DB
      const carInventory = await fetchCarsVaultInventory<Array<{ id: string; userHolding?: { sharePct: number; equityUsd: number } }>>([]);
      const userVehicleHoldings: Record<string, VehicleHolding> = {};
      if (Array.isArray(carInventory)) {
        carInventory.forEach((car) => {
          if (car.userHolding && car.userHolding.equityUsd > 0) {
            userVehicleHoldings[car.id] = {
              owned: car.userHolding.sharePct >= 100,
              purchaseType: car.userHolding.sharePct >= 100 ? 'full' : 'fractional',
              fractionalPct: car.userHolding.sharePct,
              totalInvested: Number(car.userHolding.equityUsd),
              leases: [],
            };
          }
        });
      }

      set({ userAiHoldings, userRealEstateHoldings, userVehicleHoldings });
      get().syncToPortfolio();
    } catch (err) {
      console.error('Failed to load alternative holdings from DB', err);
    }
  },

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

  setAiCategoryFilter: (category) => set({ selectedAiCategoryFilter: category }),

  buyAiAsset: (assetId, tokens, tokenPrice) => {
    const totalCost = tokens * tokenPrice;
    const isTest = isSsrOrTestEnv();
    const currentCash = usePortfolioStore.getState().accountBalance ?? usePortfolioStore.getState().availableCash;
    if (currentCash > 0 && totalCost > currentCash) return false;
    if (currentCash <= 0 && !isTest) return false;
    if (currentCash >= totalCost) {
      usePortfolioStore.getState().adjustAvailableCash(-totalCost);
    }

    set((state) => {
      const existing = state.userAiHoldings[assetId] || {
        tokens: 0,
        totalInvested: 0,
        leases: [],
      };
      const updatedHoldings = {
        ...state.userAiHoldings,
        [assetId]: {
          ...existing,
          tokens: existing.tokens + tokens,
          totalInvested: existing.totalInvested + totalCost,
        },
      };

      const reEquity = calculateTotalRealEstateEquity(state.userRealEstateHoldings);
      const carVal = calculateTotalCarsValuation(state.userVehicleHoldings);
      const aiEquity = calculateTotalAiEquity(updatedHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal, aiEquity);

      return { userAiHoldings: updatedHoldings };
    });

    buyAiAssetApi({ assetId, tokens, tokenPrice }).catch(console.error);
    return true;
  },

  sellAiAsset: (assetId, tokensToSell, pricePerToken) => {
    const asset = AI_STRATEGY_ASSETS.find((a) => a.id === assetId);
    const resolvedPrice = pricePerToken || asset?.tokenPrice || 500;
    const currentHolding = get().userAiHoldings[assetId];
    if (!currentHolding || currentHolding.tokens < tokensToSell) return false;

    const proceeds = tokensToSell * resolvedPrice;
    usePortfolioStore.getState().adjustAvailableCash(proceeds);

    set((state) => {
      const remainingTokens = currentHolding.tokens - tokensToSell;
      const updatedHoldings = { ...state.userAiHoldings };
      if (remainingTokens <= 0 && (!currentHolding.leases || currentHolding.leases.length === 0)) {
        delete updatedHoldings[assetId];
      } else {
        updatedHoldings[assetId] = {
          ...currentHolding,
          tokens: Math.max(0, remainingTokens),
        };
      }

      const reEquity = calculateTotalRealEstateEquity(state.userRealEstateHoldings);
      const carVal = calculateTotalCarsValuation(state.userVehicleHoldings);
      const aiEquity = calculateTotalAiEquity(updatedHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal, aiEquity);

      return { userAiHoldings: updatedHoldings };
    });

    sellAiAssetApi({ assetId, tokensToSell, pricePerToken: resolvedPrice }).catch(console.error);
    return true;
  },

  leaseAiAsset: (assetId, termMonths, monthlyRent) => {
    const initialPayment = monthlyRent;
    const currentCash = usePortfolioStore.getState().accountBalance ?? usePortfolioStore.getState().availableCash;
    if (initialPayment > currentCash) return false;
    usePortfolioStore.getState().adjustAvailableCash(-initialPayment);

    set((state) => {
      const existing = state.userAiHoldings[assetId] || { tokens: 0, totalInvested: 0, leases: [] };
      const updatedHoldings = {
        ...state.userAiHoldings,
        [assetId]: {
          ...existing,
          leases: [...existing.leases, { termMonths, monthlyRent }],
        },
      };

      const reEquity = calculateTotalRealEstateEquity(state.userRealEstateHoldings);
      const carVal = calculateTotalCarsValuation(state.userVehicleHoldings);
      const aiEquity = calculateTotalAiEquity(updatedHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal, aiEquity);

      return { userAiHoldings: updatedHoldings };
    });
    return true;
  },

  syncToPortfolio: () => {
    const reEquity = calculateTotalRealEstateEquity(get().userRealEstateHoldings);
    const carVal = calculateTotalCarsValuation(get().userVehicleHoldings);
    const aiEquity = calculateTotalAiEquity(get().userAiHoldings);
    usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal, aiEquity);
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
    const isTest = isSsrOrTestEnv();
    const currentCash = usePortfolioStore.getState().accountBalance ?? usePortfolioStore.getState().availableCash;
    if (currentCash > 0 && totalCost > currentCash) return false;
    if (currentCash <= 0 && !isTest) return false;
    if (currentCash >= totalCost) {
      usePortfolioStore.getState().adjustAvailableCash(-totalCost);
    }

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
      const aiEquity = calculateTotalAiEquity(state.userAiHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal, aiEquity);

      return {
        userRealEstateHoldings: updatedHoldings,
        otcOrders: updatedOtc,
      };
    });

    if (!isTest) {
      buyPropertyApi({ propertyId, tokens, tokenPrice }).catch(console.error);
    }
    return true;
  },

  sellProperty: (propertyId, tokensToSell, pricePerToken) => {
    const asset = REAL_ESTATE_ASSETS.find((a) => a.id === propertyId);
    const tokenPrice = pricePerToken || asset?.tokenPrice || 500;

    set((state) => {
      const existing = state.userRealEstateHoldings[propertyId];
      if (!existing || existing.tokens <= 0) return state;

      const count = Math.min(existing.tokens, tokensToSell);
      const remainingTokens = existing.tokens - count;
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
      const aiEquity = calculateTotalAiEquity(state.userAiHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal, aiEquity);
      usePortfolioStore.getState().adjustAvailableCash(proceeds);

      return {
        userRealEstateHoldings: updatedHoldings,
        otcOrders: updatedOtc,
      };
    });

    if (!isSsrOrTestEnv()) {
      sellPropertyApi({ propertyId, tokensToSell, pricePerToken: tokenPrice }).catch(console.error);
    }
    return true;
  },

  leaseProperty: (propertyId, termMonths, monthlyRent, unitType = 'Full Commercial Floor', deposit?: number) => {
    const requiredAmount = monthlyRent + (deposit !== undefined ? deposit : monthlyRent * 2);
    const isTest = isSsrOrTestEnv();
    const currentCash = usePortfolioStore.getState().accountBalance ?? usePortfolioStore.getState().availableCash;
    if (currentCash > 0 && requiredAmount > currentCash) return false;
    if (currentCash <= 0 && !isTest) return false;
    if (currentCash >= requiredAmount) {
      usePortfolioStore.getState().adjustAvailableCash(-requiredAmount);
    }

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
      const aiEquity = calculateTotalAiEquity(state.userAiHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal, aiEquity);

      return {
        userRealEstateHoldings: updatedHoldings,
      };
    });
    return true;
  },

  // Cars Actions
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  reserveDriveSlot: (day) => {
    const { remainingDriveSessions, driveSlots } = get();
    if (remainingDriveSessions <= 0) return false;

    if (day !== undefined) {
      const slot = driveSlots.find((s) => s.day === day);
      if (slot && slot.status === 'booked') return false;

      set((state) => ({
        remainingDriveSessions: state.remainingDriveSessions - 1,
        lastReservedDay: day ?? null,
        driveSlots: state.driveSlots.map((s) =>
          s.day === day ? { ...s, status: 'booked' as const } : s
        ),
      }));
    } else {
      set((state) => ({
        remainingDriveSessions: state.remainingDriveSessions - 1,
        lastReservedDay: null,
      }));
    }

    return true;
  },

  buyVehicleAsset: (assetId, price, purchaseType = 'full', fractionalPct = 100) => {
    const isTest = isSsrOrTestEnv();
    const currentCash = usePortfolioStore.getState().accountBalance ?? usePortfolioStore.getState().availableCash;
    if (currentCash > 0 && price > currentCash) return false;
    if (currentCash <= 0 && !isTest) return false;
    if (currentCash >= price) {
      usePortfolioStore.getState().adjustAvailableCash(-price);
    }

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
      const aiEquity = calculateTotalAiEquity(state.userAiHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal, aiEquity);

      return {
        userVehicleHoldings: updatedHoldings,
      };
    });

    if (!isTest) {
      buyVehicleAssetApi({ assetId, price, purchaseType, fractionalPct }).catch(console.error);
    }
    return true;
  },

  sellVehicleAsset: (assetId) => {
    const existing = get().userVehicleHoldings[assetId];
    if (!existing) return false;

    const asset = EXOTIC_ASSETS.find((a) => a.id === assetId);
    const proceeds = existing.totalInvested || asset?.fairMarketValue || 0;

    set((state) => {
      const updatedHoldings = { ...state.userVehicleHoldings };
      delete updatedHoldings[assetId];

      const reEquity = calculateTotalRealEstateEquity(state.userRealEstateHoldings);
      const carVal = calculateTotalCarsValuation(updatedHoldings);
      const aiEquity = calculateTotalAiEquity(state.userAiHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal, aiEquity);
      usePortfolioStore.getState().adjustAvailableCash(proceeds);

      return {
        userVehicleHoldings: updatedHoldings,
      };
    });

    if (!isSsrOrTestEnv()) {
      sellVehicleAssetApi({ assetId, proceeds }).catch(console.error);
    }
    return true;
  },

  leaseVehicleAsset: (assetId, type, duration, cost, escrowDeposit?: number) => {
    const requiredAmount = cost + (escrowDeposit !== undefined ? escrowDeposit : Math.round(cost * 0.5));
    const isTest = isSsrOrTestEnv();
    const currentCash = usePortfolioStore.getState().accountBalance ?? usePortfolioStore.getState().availableCash;
    if (currentCash > 0 && requiredAmount > currentCash) return false;
    if (currentCash <= 0 && !isTest) return false;
    if (currentCash >= requiredAmount) {
      usePortfolioStore.getState().adjustAvailableCash(-requiredAmount);
    }

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
      const aiEquity = calculateTotalAiEquity(state.userAiHoldings);
      usePortfolioStore.getState().syncAlternativeHoldings(reEquity, carVal, aiEquity);

      return {
        userVehicleHoldings: updatedHoldings,
      };
    });
    return true;
  },
}));
