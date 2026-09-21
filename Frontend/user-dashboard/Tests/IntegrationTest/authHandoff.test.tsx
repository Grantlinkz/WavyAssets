import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AuthCallback } from '../../src/components/auth/AuthCallback';
import { useAuthStore } from '../../src/store/useAuthStore';

describe('Auth Authentication Exchange Integration Suite (Node 24 / SSR Parity)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('renders auth callback container and enclave verification header', () => {
    const html = renderToString(<AuthCallback ticketOverride="test-ticket-xyz" />);

    expect(html).toContain('data-testid="auth-callback-container"');
    expect(html).toContain('WavyAssets Authentication');
    expect(html).toContain('');
    expect(html).toContain('Exchanging Authentication...');
  });

  it('successfully exchanges ticket via store action and hydrates user identity', async () => {
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        accessToken: 'mock_jwt_123',
        user: {
          id: 'usr_sov_99182',
          email: 'allocator@Global-vault.ch',
          fullName: 'Geneva Alpha Mandate',
          tier: 'PRIVATE_WEALTH',
          isCorporate: true,
          kycTier: 'TIER_3',
        },
      }),
    }) as unknown as typeof fetch;

    const response = await useAuthStore.getState().consumeTicket('valid-handoff-ticket-77');

    expect(response.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.tier).toBe('PRIVATE_WEALTH');
    expect(useAuthStore.getState().user?.email).toBe('allocator@Global-vault.ch');
    expect(useAuthStore.getState().accessToken).toBeDefined();

    // Renders authenticated user confirmation
    const authHtml = renderToString(<AuthCallback ticketOverride="valid-handoff-ticket-77" />);
    expect(authHtml).toContain('WavyAssets Authentication');
  });

  it('renders error state and return button when no ticket is provided', () => {
    useAuthStore.getState().logout();
    const html = renderToString(<AuthCallback />);

    expect(html).toContain('data-testid="auth-callback-container"');
    expect(html).toContain('Ticket Exchange Error');
    expect(html).toContain('No authentication Authentication found');
    expect(html).toContain('Return to Terminal');
  });
});
