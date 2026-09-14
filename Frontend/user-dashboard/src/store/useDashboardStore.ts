import { create } from 'zustand';

export type AssetVertical = 
  | 'overview'
  | 'crypto'
  | 'stocks'
  | 'ai-funds'
  | 'real-estate'
  | 'cars'
  | 'vip-cards'
  | 'wallet'
  | 'compliance'
  | 'security';

export type TimeframeOption = '1D' | '1W' | '1M' | '1Y' | 'ALL';

interface DashboardState {
  activeVertical: AssetVertical;
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  theme: 'dark' | 'light';
  maskBalances: boolean;
  timeframe: TimeframeOption;

  // Actions
  setActiveVertical: (vertical: AssetVertical) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleMaskBalances: () => void;
  setTimeframe: (timeframe: TimeframeOption) => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('wavy_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return 'dark';
};

const getInitialSidebarState = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('wavy_sidebar_collapsed');
    return saved === 'true';
  }
  return false;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  activeVertical: 'overview',
  isSidebarCollapsed: getInitialSidebarState(),
  isMobileMenuOpen: false,
  theme: getInitialTheme(),
  maskBalances: false,
  timeframe: '1D',

  setActiveVertical: (vertical) => set({ activeVertical: vertical, isMobileMenuOpen: false }),

  toggleSidebar: () => {
    set((state) => {
      const next = !state.isSidebarCollapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem('wavy_sidebar_collapsed', String(next));
      }
      return { isSidebarCollapsed: next };
    });
  },

  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wavy_sidebar_collapsed', String(collapsed));
    }
    set({ isSidebarCollapsed: collapsed });
  },

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('wavy_theme', next);
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(next);
      }
      return { theme: next };
    });
  },

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wavy_theme', theme);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(theme);
    }
    set({ theme });
  },

  toggleMaskBalances: () => set((state) => ({ maskBalances: !state.maskBalances })),

  setTimeframe: (timeframe) => set({ timeframe }),
}));
