import { create } from 'zustand';

export type TerminalTheme = 'dark' | 'light' | 'system';

export type AssetVerticalId =
  | 'crypto'
  | 'stocks'
  | 'ai-funds'
  | 'real-estate'
  | 'vip-cards'
  | 'cars'
  | 'wallet';

export type TrustMode = 'private-wealth' | 'institutional';

export interface AuthModalState {
  isOpen: boolean;
  step: 1 | 2;
  initialTier: TrustMode;
  initialMode?: 'login' | 'mandate';
}

export interface SimulatorState {
  capital: number;
  aggressiveness: number;
}

export type MegaMenuCategory =
  | 'all'
  | 'liquid-digital'
  | 'dma-equities'
  | 'physical-vaults';

export interface TerminalStore {
  // Theme state
  theme: TerminalTheme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: TerminalTheme) => void;
  toggleTheme: () => void;

  // Asset routing
  activeAssetId: AssetVerticalId;
  setActiveAssetId: (id: AssetVerticalId) => void;

  // Mega-menu state
  isMegaMenuOpen: boolean;
  setMegaMenuOpen: (open: boolean) => void;
  toggleMegaMenu: () => void;
  megaMenuCategory: MegaMenuCategory;
  setMegaMenuCategory: (category: MegaMenuCategory) => void;

  // Auth modal
  authModal: AuthModalState;
  openAuthModal: (initialTier?: TrustMode, initialMode?: 'login' | 'mandate') => void;
  closeAuthModal: () => void;
  setAuthStep: (step: 1 | 2) => void;

  // Contact modal
  isContactModalOpen: boolean;
  openContactModal: () => void;
  closeContactModal: () => void;

  // Trust mode & Client Tier
  trustMode: TrustMode;
  setTrustMode: (mode: TrustMode) => void;
  clientTier: TrustMode;
  setClientTier: (tier: TrustMode) => void;

  // Simulator
  simulator: SimulatorState;
  setSimulatorCapital: (capital: number) => void;
  setSimulatorAggressiveness: (aggressiveness: number) => void;

  // View Switch Telemetry
  telemetry: {
    lastSwitchDurationMs: number;
    switchHistory: ViewSwitchEvent[];
  };
  recordViewSwitch: (from: AssetVerticalId, to: AssetVerticalId, durationMs: number) => void;
  syncFromHash: () => void;
}

export interface ViewSwitchEvent {
  from: AssetVerticalId;
  to: AssetVerticalId;
  timestamp: number;
  durationMs: number;
}

export const VALID_ASSET_VERTICALS: AssetVerticalId[] = [
  'crypto',
  'stocks',
  'ai-funds',
  'real-estate',
  'vip-cards',
  'cars',
  'wallet',
];

export function parseAssetHash(hash: string): AssetVerticalId {
  if (hash === '#research' || hash.includes('/research') || hash.includes('services/vip-cards')) {
    return 'vip-cards';
  }
  const match = hash.match(/^#\/services\/([a-z-]+)/i);
  if (match && match[1]) {
    const candidate = match[1].toLowerCase() as AssetVerticalId;
    if (VALID_ASSET_VERTICALS.includes(candidate)) {
      return candidate;
    }
  }
  return 'crypto';
}

const THEME_STORAGE_KEY = 'wavy_theme';

function resolveSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): TerminalTheme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as TerminalTheme | null;
  if (stored === 'dark' || stored === 'light' || stored === 'system') {
    return stored;
  }
  return 'dark'; // Default Obsidian Dark for sovereign terminal
}

function applyThemeToDocument(resolved: 'dark' | 'light') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}

const initialTheme = getInitialTheme();
const initialResolved = initialTheme === 'system' ? resolveSystemTheme() : initialTheme;
applyThemeToDocument(initialResolved);

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  theme: initialTheme,
  resolvedTheme: initialResolved,

  setTheme: (theme: TerminalTheme) => {
    const resolved = theme === 'system' ? resolveSystemTheme() : theme;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // Handle storage quota / private browsing silently
      }
    }
    applyThemeToDocument(resolved);
    set({ theme, resolvedTheme: resolved });
  },

  toggleTheme: () => {
    const current = get().resolvedTheme;
    const nextTheme: TerminalTheme = current === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  activeAssetId: typeof window !== 'undefined' ? parseAssetHash(window.location.hash) : 'crypto',
  setActiveAssetId: (id: AssetVerticalId) => {
    const prev = get().activeAssetId;
    if (prev !== id) {
      const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (typeof window !== 'undefined') {
        window.location.hash = `#/services/${id}`;
      }
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const durationMs = Math.max(0.1, Number((endTime - startTime).toFixed(2)));
      get().recordViewSwitch(prev, id, durationMs);
      set({ activeAssetId: id, isMegaMenuOpen: false });
    } else {
      set({ isMegaMenuOpen: false });
    }
  },

  telemetry: {
    lastSwitchDurationMs: 0,
    switchHistory: [],
  },
  recordViewSwitch: (from: AssetVerticalId, to: AssetVerticalId, durationMs: number) => {
    set((state) => ({
      telemetry: {
        lastSwitchDurationMs: durationMs,
        switchHistory: [
          ...state.telemetry.switchHistory.slice(-19),
          { from, to, timestamp: Date.now(), durationMs },
        ],
      },
    }));
  },
  syncFromHash: () => {
    if (typeof window === 'undefined' || !window.location) return;
    const pathname = window.location.pathname || '';
    const hash = window.location.hash || '';
    const isResearch =
      pathname.includes('/research') ||
      hash === '#research' ||
      hash.includes('/research');
    const isContact = pathname.includes('/contact') || hash === '#contact';
    if (isContact && !get().isContactModalOpen) {
      set({ isContactModalOpen: true });
    }
    const resolved = isResearch ? 'vip-cards' : parseAssetHash(hash);
    if (get().activeAssetId !== resolved) {
      const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const prev = get().activeAssetId;
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const durationMs = Math.max(0.1, Number((endTime - startTime).toFixed(2)));
      get().recordViewSwitch(prev, resolved, durationMs);
      set({ activeAssetId: resolved, isMegaMenuOpen: false });
    }
  },

  isMegaMenuOpen: false,
  setMegaMenuOpen: (open: boolean) => set({ isMegaMenuOpen: open }),
  toggleMegaMenu: () => set((state) => ({ isMegaMenuOpen: !state.isMegaMenuOpen })),
  megaMenuCategory: 'all',
  setMegaMenuCategory: (category: MegaMenuCategory) => set({ megaMenuCategory: category }),

  authModal: {
    isOpen: false,
    step: 1,
    initialTier: 'institutional',
    initialMode: 'login',
  },
  openAuthModal: (
    initialTier: TrustMode = 'institutional',
    initialMode: 'login' | 'mandate' = 'login'
  ) =>
    set({ authModal: { isOpen: true, step: 1, initialTier, initialMode } }),
  closeAuthModal: () =>
    set((state) => ({ authModal: { ...state.authModal, isOpen: false, step: 1 } })),
  setAuthStep: (step: 1 | 2) =>
    set((state) => ({ authModal: { ...state.authModal, step } })),

  isContactModalOpen: false,
  openContactModal: () => set({ isContactModalOpen: true }),
  closeContactModal: () => set({ isContactModalOpen: false }),

  trustMode: 'institutional',
  setTrustMode: (mode: TrustMode) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wavy_trust_mode', mode);
      } catch {
        // Storage quota silent fallback
      }
    }
    set({ trustMode: mode, clientTier: mode });
  },
  clientTier: 'institutional',
  setClientTier: (tier: TrustMode) => {
    get().setTrustMode(tier);
  },

  simulator: {
    capital: 250000,
    aggressiveness: 3,
  },
  setSimulatorCapital: (capital: number) =>
    set((state) => ({ simulator: { ...state.simulator, capital } })),
  setSimulatorAggressiveness: (aggressiveness: number) =>
    set((state) => ({ simulator: { ...state.simulator, aggressiveness } })),
}));
