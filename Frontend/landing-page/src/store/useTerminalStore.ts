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
  openAuthModal: (initialTier?: TrustMode) => void;
  closeAuthModal: () => void;
  setAuthStep: (step: 1 | 2) => void;

  // Trust mode & Client Tier
  trustMode: TrustMode;
  setTrustMode: (mode: TrustMode) => void;
  clientTier: TrustMode;
  setClientTier: (tier: TrustMode) => void;

  // Simulator
  simulator: SimulatorState;
  setSimulatorCapital: (capital: number) => void;
  setSimulatorAggressiveness: (aggressiveness: number) => void;
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

  activeAssetId: 'crypto',
  setActiveAssetId: (id: AssetVerticalId) => {
    if (typeof window !== 'undefined') {
      window.location.hash = `#/services/${id}`;
    }
    set({ activeAssetId: id, isMegaMenuOpen: false });
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
  },
  openAuthModal: (initialTier: TrustMode = 'institutional') =>
    set({ authModal: { isOpen: true, step: 1, initialTier } }),
  closeAuthModal: () =>
    set((state) => ({ authModal: { ...state.authModal, isOpen: false, step: 1 } })),
  setAuthStep: (step: 1 | 2) =>
    set((state) => ({ authModal: { ...state.authModal, step } })),

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
