/**
 * WavyAssets Institutional API Client — Sovereign User Dashboard
 * Supports authentication handoff, token lifecycle, and full REST endpoints
 * across all 7 asset classes with graceful offline fallback.
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

export interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
  correlationId?: string;
}

// Token Storage
const TOKEN_KEY = 'wavy_access_token';

export function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Base HTTP Request Handler with RFC 7807 Error Envelope Parsing
 */
async function requestApi<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData?: T,
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
      credentials: 'include', // Include HttpOnly refresh cookies
    });

    if (!res.ok) {
      // If unauthorized and we have a token, attempt silent refresh
      if (res.status === 401 && endpoint !== '/api/v1/auth/refresh' && endpoint !== '/api/v1/auth/exchange-ticket') {
        const refreshed = await refreshSessionToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${getStoredToken()}`;
          const retryRes = await fetch(endpoint, { ...options, headers, credentials: 'include' });
          if (retryRes.ok) {
            const body = await retryRes.json();
            return (body.data !== undefined ? body.data : body) as T;
          }
        }
      }

      let errorMsg = `HTTP ${res.status} Error on ${endpoint}`;
      try {
        const errorData = (await res.json()) as ApiErrorEnvelope;
        if (errorData?.message) errorMsg = errorData.message;
      } catch {
        // use fallback message
      }
      throw new Error(errorMsg);
    }

    const body = await res.json();
    return (body.data !== undefined ? body.data : body) as T;
  } catch (error) {
    if (fallbackData !== undefined) {
      // Graceful offline fallback
      return fallbackData;
    }
    throw error;
  }
}

/**
 * Exchanges single-use handoff ticket from Landing Page for Access JWT
 */
export async function exchangeHandoffTicket(ticket: string): Promise<AuthExchangeResponse> {
  if (!ticket || ticket.trim().length === 0) {
    throw new Error('Handoff ticket is required for session exchange.');
  }

  const res = await fetch('/api/v1/auth/exchange-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket }),
    credentials: 'include',
  });

  if (!res.ok) {
    let errorMessage = `Authentication handoff exchange failed with status ${res.status}`;
    try {
      const errBody = await res.json();
      if (errBody?.message) errorMessage = errBody.message;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  const result = (data.data !== undefined ? data.data : data) as AuthExchangeResponse;

  if (result?.accessToken) {
    setStoredToken(result.accessToken);
  }

  return result;
}

/**
 * Refresh access token via HttpOnly cookie
 */
export async function refreshSessionToken(): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      clearStoredToken();
      return false;
    }

    const data = await res.json();
    const token = data.data?.accessToken || data.accessToken;
    if (token) {
      setStoredToken(token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Terminate user session and clear credentials
 */
export async function logoutUser(): Promise<void> {
  try {
    await requestApi('/api/v1/auth/logout', { method: 'POST' });
  } finally {
    clearStoredToken();
  }
}

// ----------------------------------------------------------------------
// Universal Command Bar & Action Rails
// ----------------------------------------------------------------------

export async function fetchCommandBarData(fallback?: any): Promise<any> {
  return requestApi('/api/v1/dashboard/command-bar', { method: 'GET' }, fallback);
}

export async function fetchActionRails(fallback?: any): Promise<any> {
  return requestApi('/api/v1/dashboard/action-rail', { method: 'GET' }, fallback);
}

// ----------------------------------------------------------------------
// Liquid Asset Engines (Crypto, Stocks, Wallet)
// ----------------------------------------------------------------------

export async function fetchCryptoHoldings(fallback?: any): Promise<any> {
  return requestApi('/api/v1/crypto/holdings', { method: 'GET' }, fallback);
}

export async function fetchStockPositions(fallback?: any): Promise<any> {
  return requestApi('/api/v1/stocks/positions', { method: 'GET' }, fallback);
}

export async function fetchStockOrderBook(symbol: string = 'NVDA', fallback?: any): Promise<any> {
  return requestApi(`/api/v1/stocks/order-book?symbol=${symbol}`, { method: 'GET' }, fallback);
}

export async function submitStockOrder(payload: {
  symbol: string;
  orderType: 'MARKET' | 'LIMIT';
  side: 'BUY' | 'SELL';
  shares: number;
  limitPrice?: number;
}): Promise<any> {
  return requestApi('/api/v1/stocks/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchWalletBalances(fallback?: any): Promise<any> {
  return requestApi('/api/v1/wallet/balances', { method: 'GET' }, fallback);
}

export async function submitWithdrawal(payload: {
  amount: number;
  currency: string;
  destinationId: string;
}): Promise<any> {
  return requestApi('/api/v1/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify({
      amount: payload.amount,
      currency: payload.currency,
      direction: 'WITHDRAWAL',
      destinationId: payload.destinationId,
    }),
  });
}

// ----------------------------------------------------------------------
// Alternative Asset Engines (AI Funds, Real Estate, Exotic Cars)
// ----------------------------------------------------------------------

export async function fetchAiFundsTelemetry(fallback?: any): Promise<any> {
  return requestApi('/api/v1/ai-funds/telemetry', { method: 'GET' }, fallback);
}

export async function toggleAiCircuitBreaker(active: boolean, reason?: string): Promise<any> {
  return requestApi('/api/v1/ai-funds/circuit-breaker', {
    method: 'POST',
    body: JSON.stringify({ active, reason }),
  });
}

export async function fetchRealEstateProperties(fallback?: any): Promise<any> {
  return requestApi('/api/v1/real-estate/properties', { method: 'GET' }, fallback);
}

export async function fetchCarsVaultInventory(fallback?: any): Promise<any> {
  return requestApi('/api/v1/cars/vault-inventory', { method: 'GET' }, fallback);
}

// ----------------------------------------------------------------------
// Governance & Security (VIP Cards, Compliance, 48h Time-Lock)
// ----------------------------------------------------------------------

export async function fetchVipCardStatus(fallback?: any): Promise<any> {
  return requestApi('/api/v1/vip-cards/status', { method: 'GET' }, fallback);
}

export async function revealCardSensitive(pin: string): Promise<any> {
  return requestApi('/api/v1/vip-cards/reveal-sensitive', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
}

export async function fetchComplianceStatus(fallback?: any): Promise<any> {
  return requestApi('/api/v1/compliance/status', { method: 'GET' }, fallback);
}

export async function fetchWhitelistDestinations(fallback?: any): Promise<any> {
  return requestApi('/api/v1/security/whitelist-destinations', { method: 'GET' }, fallback);
}

export async function registerWhitelistDestination(payload: {
  address: string;
  label: string;
  assetType: 'CRYPTO' | 'FIAT_IBAN';
  network?: string;
}): Promise<any> {
  return requestApi('/api/v1/security/whitelist-destinations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
