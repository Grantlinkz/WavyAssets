import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../src/store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('initializes with logged-out state after logout', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isExchangingTicket).toBe(false);
    expect(state.ticketExchangeError).toBeNull();
  });

  it('sets user session and access token correctly', () => {
    const mockUser = {
      id: 'usr_test_1',
      email: 'investor@zurich-vault.ch',
      fullName: 'Zurich Prime Trust',
      tier: 'INSTITUTIONAL' as const,
      isCorporate: true,
      kycTier: 'TIER_3' as const,
    };

    useAuthStore.getState().setSession(mockUser, 'mock_token_123');
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('investor@zurich-vault.ch');
    expect(state.user?.tier).toBe('INSTITUTIONAL');
    expect(state.accessToken).toBe('mock_token_123');
  });

  it('successfully consumes a valid handoff ticket', async () => {
    const response = await useAuthStore.getState().consumeTicket('valid-handoff-ticket-xyz');
    expect(response.success).toBe(true);
    expect(response.accessToken).toBeDefined();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.isExchangingTicket).toBe(false);
    expect(state.ticketExchangeError).toBeNull();
  });

  it('clears state on logout', () => {
    useAuthStore.getState().setSession({
      id: 'usr_2',
      email: 'test@wavy.com',
      fullName: 'Test User',
      tier: 'RETAIL',
      isCorporate: false,
      kycTier: 'TIER_1',
    }, 'jwt_token');

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
