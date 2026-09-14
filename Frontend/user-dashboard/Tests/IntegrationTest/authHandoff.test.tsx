import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AuthCallback } from '../../src/components/auth/AuthCallback';
import { useAuthStore } from '../../src/store/useAuthStore';

describe('Auth Handoff Ticket Exchange Integration Suite (Node 24 / SSR Parity)', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('renders auth callback container and enclave verification header', () => {
    const html = renderToString(<AuthCallback ticketOverride="test-ticket-xyz" />);

    expect(html).toContain('data-testid="auth-callback-container"');
    expect(html).toContain('Sovereign Enclave Authentication');
    expect(html).toContain('HMAC-SHA256');
    expect(html).toContain('Exchanging Handoff Ticket...');
  });

  it('successfully exchanges ticket via store action and hydrates user identity', async () => {
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    const response = await useAuthStore.getState().consumeTicket('valid-handoff-ticket-77');

    expect(response.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.tier).toBe('PRIVATE_WEALTH');
    expect(useAuthStore.getState().user?.email).toBe('allocator@sovereign-vault.ch');
    expect(useAuthStore.getState().accessToken).toBeDefined();

    // Renders authenticated user confirmation
    const authHtml = renderToString(<AuthCallback ticketOverride="valid-handoff-ticket-77" />);
    expect(authHtml).toContain('Sovereign Enclave Authentication');
  });

  it('renders error state and return button when no ticket is provided', () => {
    useAuthStore.getState().logout();
    const html = renderToString(<AuthCallback />);

    expect(html).toContain('data-testid="auth-callback-container"');
    expect(html).toContain('Ticket Exchange Error');
    expect(html).toContain('No authentication handoff ticket found');
    expect(html).toContain('Return to Terminal');
  });
});
