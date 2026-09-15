import { create } from 'zustand';
import { exchangeHandoffTicket, type AuthExchangeResponse } from '../lib/api';

export interface UserEntity {
  id: string;
  email: string;
  fullName: string;
  tier: 'RETAIL' | 'PRIVATE_WEALTH' | 'INSTITUTIONAL';
  isCorporate: boolean;
  kycTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
}

interface AuthState {
  user: UserEntity | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isExchangingTicket: boolean;
  ticketExchangeError: string | null;
  
  // Actions
  setSession: (user: UserEntity, token: string) => void;
  consumeTicket: (ticket: string) => Promise<AuthExchangeResponse>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isExchangingTicket: false,
  ticketExchangeError: null,

  setSession: (user, token) => {
    set({
      user,
      accessToken: token,
      isAuthenticated: true,
      ticketExchangeError: null,
    });
  },

  consumeTicket: async (ticket: string) => {
    set({ isExchangingTicket: true, ticketExchangeError: null });
    try {
      const response = await exchangeHandoffTicket(ticket);
      set({
        user: response.user,
        accessToken: response.accessToken,
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
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isExchangingTicket: false,
      ticketExchangeError: null,
    });
  },
}));
