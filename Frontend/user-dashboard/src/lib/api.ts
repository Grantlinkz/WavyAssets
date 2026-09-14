/**
 * WavyAssets API Client — Authentication Handoff & Session Services
 */

export interface AuthExchangeResponse {
  success: boolean;
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    tier: 'RETAIL' | 'PRIVATE_WEALTH' | 'INSTITUTIONAL';
    isCorporate: boolean;
    kycTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  };
  expiresIn?: number;
}

export async function exchangeHandoffTicket(ticket: string): Promise<AuthExchangeResponse> {
  if (!ticket || ticket.trim().length === 0) {
    throw new Error('Handoff ticket is required for session exchange.');
  }

  const res = await fetch('/api/v1/auth/exchange-ticket', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticket }),
  });

  if (!res.ok) {
    let errorMessage = `Authentication handoff exchange failed with status ${res.status}`;
    try {
      const errBody = await res.json();
      if (errBody?.message) {
        errorMessage = errBody.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  const data = (await res.json()) as AuthExchangeResponse;
  if (!data || data.success === false) {
    throw new Error((data as { message?: string })?.message || 'Authentication handoff exchange rejected.');
  }

  return data;
}
