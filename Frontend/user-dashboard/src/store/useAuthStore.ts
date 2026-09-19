import { create } from 'zustand';
import { exchangeHandoffTicket, setStoredToken, clearStoredToken, type AuthExchangeResponse } from '../lib/api';

export interface UserEntity {
  id: string;
  email: string;
  fullName: string;
  tier: 'RETAIL' | 'PRIVATE_WEALTH' | 'INSTITUTIONAL';
  isCorporate: boolean;
  kycTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
}

const USER_STORAGE_KEY = 'wavyassets_user_profile';
const TOKEN_STORAGE_KEY = 'wavyassets_access_token';

function getStoredUser(): UserEntity | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as UserEntity;
      }
    } catch {
      // Ignore parse errors
    }
  }
  return null;
}

function getStoredAccessToken(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
  return null;
}

interface AuthState {
  user: UserEntity | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isExchangingTicket: boolean;
  ticketExchangeError: string | null;
  
  // Actions
  setSession: (user: UserEntity, token: string) => void;
  setUser: (user: UserEntity) => void;
  updateUserKycTier: (kycTier: 'TIER_1' | 'TIER_2' | 'TIER_3') => void;
  consumeTicket: (ticket: string) => Promise<AuthExchangeResponse>;
  logout: () => void;
}

const initialUser = getStoredUser();
const initialToken = getStoredAccessToken();
if (initialToken) {
  setStoredToken(initialToken);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  accessToken: null,
  isAuthenticated: false,
  isExchangingTicket: false,
  ticketExchangeError: null,

  setSession: (user, token) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } catch {
        // Ignore storage errors
      }
    }
    setStoredToken(token);
    set({
      user,
      accessToken: token,
      isAuthenticated: true,
      ticketExchangeError: null,
    });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } catch {
        // Ignore
      }
    }
    set({ user });
  },

  updateUserKycTier: (kycTier) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, kycTier };
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }
      }
      set({ user: updated });
    }
  },

  consumeTicket: async (ticket: string) => {
    set({ isExchangingTicket: true, ticketExchangeError: null });
    try {
      const response = await exchangeHandoffTicket(ticket);
      const user = response.user;
      const accessToken = response.accessToken;

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } catch {
          // Ignore
        }
      }
      setStoredToken(accessToken);

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isExchangingTicket: false,
        ticketExchangeError: null,
      });
      return response;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication handoff exchange failed';
      set({
        isExchangingTicket: false,
        ticketExchangeError: errorMsg,
      });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(USER_STORAGE_KEY);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
    clearStoredToken();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isExchangingTicket: false,
      ticketExchangeError: null,
    });
  },
}));
