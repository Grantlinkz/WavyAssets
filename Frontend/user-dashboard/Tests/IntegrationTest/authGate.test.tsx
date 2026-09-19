import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { InstitutionalGate } from '../../src/components/auth/InstitutionalGate';
import { App } from '../../src/App';
import { useAuthStore } from '../../src/store/useAuthStore';

describe('Institutional Access Gate & Authentication Guard Suite', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('renders institutional gate with restricted security badges and action pathways', () => {
    const html = renderToString(<InstitutionalGate />);

    expect(html).toContain('data-testid="institutional-gate-container"');
    expect(html).toContain('Sovereign Command Deck Restricted');
    expect(html).toContain('WavyAssets Institutional System');
    expect(html).toContain('data-testid="gate-signin-button"');
    expect(html).toContain('data-testid="gate-mandate-button"');
    expect(html).toContain('Sign In with Sovereign 2FA');
    expect(html).toContain('Request Institutional Mandate');
  });

  it('renders gate with favicon crest and security badges', () => {
    const html = renderToString(<InstitutionalGate />);

    expect(html).toContain('data-testid="gate-favicon"');
    expect(html).toContain('Double-Entry Conservation');
    expect(html).toContain('48h Quarantine Time-Lock');
  });

  it('App renders InstitutionalGate when unauthenticated and requireAuth is active', () => {
    useAuthStore.getState().logout();
    const html = renderToString(<App requireAuth={true} />);

    expect(html).toContain('data-testid="institutional-gate-container"');
    expect(html).toContain('Sovereign Command Deck Restricted');
    expect(html).toContain('data-testid="gate-signin-button"');
    expect(html).toContain('data-testid="gate-mandate-button"');
    expect(html).not.toContain('data-testid="top-header"');
    expect(html).not.toContain('data-testid="dashboard-sidebar"');
  });

  it('App renders full sovereign dashboard when authenticated', () => {
    useAuthStore.getState().setSession(
      {
        id: 'usr-auth-001',
        email: 'mandate@wavyassets.com',
        fullName: 'Baron Rothenberg',
        tier: 'INSTITUTIONAL',
        kycTier: 'TIER_3',
        isCorporate: true,
      },
      'token-xyz-123'
    );

    const html = renderToString(<App activeVertical="crypto" />);
    expect(html).toContain('data-testid="top-header"');
    expect(html).toContain('Crypto &amp; Staking');
  });
});
