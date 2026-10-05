import { create } from 'zustand';
import {
  INITIAL_WHITELIST_DESTINATIONS,
  type ClientSession,
  type WhitelistedDestination,
} from '../lib/governanceAssetData';
import { getInitialActualSessions, saveActualSessions } from '../lib/clientDevice';
import { fetchVipCardStatus, updateCardControlsApi } from '../lib/api';

export interface AddDestinationPayload {
  assetRail: string;
  assetName: string;
  railBadge: string;
  destinationLabel: string;
  beneficiaryOrg: string;
  addressOrIban: string;
}

export interface VipCardData {
  id: string;
  cardNumberMasked: string;
  cardNumberLast4: string;
  cardType: 'PHYSICAL' | 'VIRTUAL';
  tier: string;
  substrate?: string;
  cardholderName?: string;
  celebrityCardholderLabel?: string | null;
  validDate?: string;
  destination?: string;
  isFrozen: boolean;
  frozenByAdmin?: boolean;
  dailySpendLimit: number;
  shippingStatus: string;
  createdAt?: string;
  updatedAt?: string;
  tierProgression?: {
    currentTier: string;
    nextTier: string | null;
    currentAum: number;
    nextTierThreshold: number | null;
    progressPercentage: number;
    amountToNextTier: number;
  };
}

interface GovernanceState {
  // VIP Cards Slice
  vipCard: VipCardData | null;
  vipCards: VipCardData[];
  hasAssignedCard: boolean;
  adminFreezeNotice: string | null;
  isLoadingCard: boolean;
  isCardFrozen: boolean;
  cardMode: 'physical' | 'membership' | 'virtual';
  isCvvRevealed: boolean;
  cvvCountdown: number;
  isBiometricModalOpen: boolean;
  isConciergeModalOpen: boolean;

  loadVipCard: () => Promise<void>;
  toggleFreezeCard: (cardId?: string) => void;
  dismissFreezeNotice: () => void;
  setCardMode: (mode: 'physical' | 'membership' | 'virtual') => void;
  openBiometricModal: () => void;
  closeBiometricModal: () => void;
  openConciergeModal: () => void;
  closeConciergeModal: () => void;
  revealCvv: () => void;
  hideCvv: () => void;

  // Compliance & Tax Slice
  selectedTaxYear: '2024' | '2025';
  setTaxYear: (year: '2024' | '2025') => void;
  isUploadDossierModalOpen: boolean;
  openUploadDossierModal: () => void;
  closeUploadDossierModal: () => void;
  uploadedDossierFiles: string[];
  simulateUploadDossier: (fileName: string) => void;

  // Security Command Center Slice
  sessions: ClientSession[];
  terminateSession: (sessionId: string) => void;
  revokeAllOtherSessions: () => void;

  destinations: WhitelistedDestination[];
  blacklistedAddresses: string[];
  isAddDestinationModalOpen: boolean;
  openAddDestinationModal: () => void;
  closeAddDestinationModal: () => void;
  addWhitelistedDestination: (payload: AddDestinationPayload) => void;
  cancelDestination: (destinationId: string) => void;
}

let cvvTimer: ReturnType<typeof setInterval> | null = null;

export const useGovernanceStore = create<GovernanceState>((set, get) => ({
  // VIP Card Initial State
  vipCard: null,
  vipCards: [],
  hasAssignedCard: false,
  adminFreezeNotice: null,
  isLoadingCard: false,
  isCardFrozen: false,
  cardMode: 'physical',
  isCvvRevealed: false,
  cvvCountdown: 60,
  isBiometricModalOpen: false,
  isConciergeModalOpen: false,

  dismissFreezeNotice: () => set({ adminFreezeNotice: null }),

  loadVipCard: async () => {
    set({ isLoadingCard: true });
    try {
      const data = await fetchVipCardStatus<Record<string, unknown> | null>(null);
      if (data) {
        const rawCards = (
          Array.isArray(data.cards) ? data.cards : data.id ? [data] : []
        ) as VipCardData[];
        const hasAssigned = Boolean(data.hasAssignedCard ?? (rawCards.length > 0));
        const primaryCard = (rawCards[0] || (data.id ? data : null)) as VipCardData | null;
        const isFrozen = Boolean(primaryCard?.isFrozen || primaryCard?.frozenByAdmin);
        const adminFrozen = Boolean(primaryCard?.frozenByAdmin);

        const initialMode =
          primaryCard?.tier === 'CELEBRITY'
            ? 'membership'
            : primaryCard?.cardType === 'VIRTUAL'
            ? 'virtual'
            : 'physical';

        set({
          vipCard: primaryCard,
          vipCards: rawCards,
          hasAssignedCard: hasAssigned,
          isCardFrozen: isFrozen,
          adminFreezeNotice: adminFrozen ? 'Card has been frozen by Admin. Contact support!' : null,
          cardMode: initialMode,
          isLoadingCard: false,
        });
      } else {
        set({
          vipCard: null,
          vipCards: [],
          hasAssignedCard: false,
          isCardFrozen: false,
          adminFreezeNotice: null,
          isLoadingCard: false,
        });
      }
    } catch {
      set({ isLoadingCard: false });
    }
  },

  toggleFreezeCard: (cardId?: string) => {
    const { vipCards, vipCard, isCardFrozen } = get();
    const targetCard = cardId ? vipCards.find((c) => c.id === cardId) || vipCard : vipCard;
    const isTargetPrimary = !targetCard || !vipCard || targetCard.id === vipCard.id;

    // Requirement 5: If frozen by admin, prevent user from unfreezing and notify
    if (targetCard?.frozenByAdmin) {
      set({
        adminFreezeNotice: 'Card has been frozen by Admin. Contact support!',
        ...(isTargetPrimary ? { isCardFrozen: true } : {}),
      });
      return;
    }

    const prevFrozen = targetCard ? targetCard.isFrozen : isCardFrozen;
    const nextFrozen = !prevFrozen;

    set((state) => ({
      ...(isTargetPrimary
        ? {
            isCardFrozen: nextFrozen,
            vipCard: state.vipCard ? { ...state.vipCard, isFrozen: nextFrozen } : null,
          }
        : {}),
      vipCards: state.vipCards.map((c) =>
        c.id === (targetCard?.id || cardId) ? { ...c, isFrozen: nextFrozen } : c
      ),
    }));

    // Persist freeze toggle to backend enclave
    if (targetCard?.id) {
      updateCardControlsApi({ isFrozen: nextFrozen, cardId: targetCard.id }).catch((err) => {
        console.warn('Failed to commit card freeze status to backend:', err);
        const isForbidden =
          err?.message?.includes('frozen by Admin') ||
          err?.response?.data?.message?.includes('frozen by Admin');
        set((state) => ({
          ...(isTargetPrimary
            ? {
                isCardFrozen: isForbidden ? true : prevFrozen,
                adminFreezeNotice: isForbidden ? 'Card has been frozen by Admin. Contact support!' : null,
                vipCard: state.vipCard ? { ...state.vipCard, isFrozen: isForbidden ? true : prevFrozen } : null,
              }
            : {}),
          vipCards: state.vipCards.map((c) =>
            c.id === targetCard.id ? { ...c, isFrozen: isForbidden ? true : prevFrozen } : c
          ),
        }));
      });
    }
  },

  setCardMode: (mode) => set({ cardMode: mode }),

  openBiometricModal: () => set({ isBiometricModalOpen: true }),
  closeBiometricModal: () => set({ isBiometricModalOpen: false }),

  openConciergeModal: () => set({ isConciergeModalOpen: true }),
  closeConciergeModal: () => set({ isConciergeModalOpen: false }),

  revealCvv: () => {
    if (cvvTimer) clearInterval(cvvTimer);
    set({ isCvvRevealed: true, cvvCountdown: 60, isBiometricModalOpen: false });

    cvvTimer = setInterval(() => {
      const current = get().cvvCountdown;
      if (current <= 1) {
        if (cvvTimer) clearInterval(cvvTimer);
        set({ isCvvRevealed: false, cvvCountdown: 60 });
      } else {
        set({ cvvCountdown: current - 1 });
      }
    }, 1000);
  },

  hideCvv: () => {
    if (cvvTimer) clearInterval(cvvTimer);
    set({ isCvvRevealed: false, cvvCountdown: 60 });
  },

  // Compliance Initial State
  selectedTaxYear: '2024',
  setTaxYear: (year) => set({ selectedTaxYear: year }),

  isUploadDossierModalOpen: false,
  openUploadDossierModal: () => set({ isUploadDossierModalOpen: true }),
  closeUploadDossierModal: () => set({ isUploadDossierModalOpen: false }),

  uploadedDossierFiles: ['Zurich_Affidavit_2025_Signed.pdf'],
  simulateUploadDossier: (fileName) =>
    set((state) => ({
      uploadedDossierFiles: [fileName, ...state.uploadedDossierFiles],
      isUploadDossierModalOpen: false,
    })),

  // Security Command Initial State
  sessions: getInitialActualSessions(),
  terminateSession: (sessionId) =>
    set((state) => {
      const updated = state.sessions.filter((s) => s.id !== sessionId);
      saveActualSessions(updated);
      return { sessions: updated };
    }),

  revokeAllOtherSessions: () =>
    set((state) => {
      const updated = state.sessions.filter((s) => s.isCurrent);
      saveActualSessions(updated);
      return { sessions: updated };
    }),

  destinations: INITIAL_WHITELIST_DESTINATIONS,
  blacklistedAddresses: [],
  isAddDestinationModalOpen: false,
  openAddDestinationModal: () => set({ isAddDestinationModalOpen: true }),
  closeAddDestinationModal: () => set({ isAddDestinationModalOpen: false }),

  addWhitelistedDestination: (payload) => {
    if (get().blacklistedAddresses.includes(payload.addressOrIban)) {
      // Cannot add an address that is currently blacklisted
      return;
    }

    // Inviolable Security Invariant: Every newly registered destination is quarantined with a 48H Time-Lock
    const newDest: WhitelistedDestination = {
      id: `wl-${Date.now()}`,
      assetRail: payload.assetRail,
      assetName: payload.assetName,
      railBadge: payload.railBadge,
      icon: payload.railBadge === 'BTC' ? 'currency_bitcoin' : payload.railBadge === 'ETH' ? 'account_balance' : 'payments',
      destinationLabel: payload.destinationLabel,
      beneficiaryOrg: payload.beneficiaryOrg,
      addressOrIban: payload.addressOrIban,
      isTimeLocked: true,
      quarantineHoursTotal: 48,
      quarantineHoursRemaining: 48.0,
      remainingDisplay: '48h 00m 00s REMAINING',
      signersSummary: 'Pending 2nd Hardware Key',
      signersDetails: '1 of 2 Signed',
      status: 'QUARANTINE',
    };

    set((state) => ({
      destinations: [newDest, ...state.destinations],
      isAddDestinationModalOpen: false,
    }));
  },

  cancelDestination: (destinationId) => {
    const target = get().destinations.find((d) => d.id === destinationId);
    set((state) => ({
      destinations: state.destinations.filter((d) => d.id !== destinationId),
      blacklistedAddresses: target
        ? [...state.blacklistedAddresses, target.addressOrIban]
        : state.blacklistedAddresses,
    }));
  },
}));
