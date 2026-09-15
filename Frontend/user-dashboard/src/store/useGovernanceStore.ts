import { create } from 'zustand';
import {
  INITIAL_CLIENT_SESSIONS,
  INITIAL_WHITELIST_DESTINATIONS,
  type ClientSession,
  type WhitelistedDestination,
} from '../lib/governanceAssetData';

export interface AddDestinationPayload {
  assetRail: string;
  assetName: string;
  railBadge: string;
  destinationLabel: string;
  beneficiaryOrg: string;
  addressOrIban: string;
}

interface GovernanceState {
  // VIP Cards Slice
  isCardFrozen: boolean;
  cardMode: 'physical' | 'virtual';
  isCvvRevealed: boolean;
  cvvCountdown: number;
  isBiometricModalOpen: boolean;
  isConciergeModalOpen: boolean;

  toggleFreezeCard: () => void;
  setCardMode: (mode: 'physical' | 'virtual') => void;
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
  isCardFrozen: false,
  cardMode: 'physical',
  isCvvRevealed: false,
  cvvCountdown: 60,
  isBiometricModalOpen: false,
  isConciergeModalOpen: false,

  toggleFreezeCard: () =>
    set((state) => ({ isCardFrozen: !state.isCardFrozen })),

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
  sessions: INITIAL_CLIENT_SESSIONS,
  terminateSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
    })),

  revokeAllOtherSessions: () =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.isCurrent),
    })),

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
