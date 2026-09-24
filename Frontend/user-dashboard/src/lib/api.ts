/**
 * WavyAssets Institutional API Client — Global User Dashboard
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

// Token Storage - strictly in-memory to prevent XSS exfiltration
let inMemoryAccessToken: string | null = null;

export function getStoredToken(): string | null {
  return inMemoryAccessToken;
}

export function setStoredToken(token: string): void {
  inMemoryAccessToken = token;
}

export function clearStoredToken(): void {
  inMemoryAccessToken = null;
}

// In-flight refresh promise to deduplicate concurrent refresh attempts
let inFlightRefreshPromise: Promise<boolean> | null = null;

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

  const baseUrl =
    typeof window !== 'undefined' && window.location?.origin && window.location.origin.startsWith('http')
      ? window.location.origin
      : 'http://localhost:5174';
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include HttpOnly refresh cookies
    });
  } catch (err) {
    if (fallbackData !== undefined) {
      // Graceful offline fallback ONLY on transport-level fetch failures
      return fallbackData;
    }
    throw err;
  }

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
        let retryErrMsg = `HTTP ${retryRes.status} Error on ${endpoint}`;
        try {
          const errData = (await retryRes.json()) as ApiErrorEnvelope;
          if (errData?.message) retryErrMsg = errData.message;
        } catch {
          // use default retry error message
        }
        throw new Error(retryErrMsg);
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
}

/**
 * Exchanges single-use Authentication from Landing Page for Access JWT
 */
export async function exchangeHandoffTicket(ticket: string): Promise<AuthExchangeResponse> {
  if (!ticket || ticket.trim().length === 0) {
    throw new Error('Authentication is required for session exchange.');
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

  const data = (await res.json()) as Record<string, unknown>;
  if (data && data.success === false) {
    throw new Error((data.message as string) || 'Authentication handoff exchange failed');
  }
  const result = (data.data !== undefined ? data.data : data) as AuthExchangeResponse;
  if (result && result.success === false) {
    throw new Error('Authentication handoff exchange failed');
  }

  if (result?.accessToken) {
    setStoredToken(result.accessToken);
  }

  return result;
}

/**
 * Refresh access token via HttpOnly cookie
 */
export async function refreshSessionToken(): Promise<boolean> {
  if (inFlightRefreshPromise) {
    return inFlightRefreshPromise;
  }

  inFlightRefreshPromise = (async () => {
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
      clearStoredToken();
      return false;
    } catch {
      clearStoredToken();
      return false;
    } finally {
      inFlightRefreshPromise = null;
    }
  })();

  return inFlightRefreshPromise;
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

export async function fetchUserProfile<T = unknown>(): Promise<T> {
  return requestApi<T>('/api/v1/auth/me', { method: 'GET' });
}

// ----------------------------------------------------------------------
// Universal Command Bar & Action Rails
// ----------------------------------------------------------------------

export async function fetchCommandBarData<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/dashboard/command-bar', { method: 'GET' }, fallback);
}

export async function fetchActionRails<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/dashboard/action-rail', { method: 'GET' }, fallback);
}

// ----------------------------------------------------------------------
// Liquid Asset Engines (Crypto, Stocks, Wallet)
// ----------------------------------------------------------------------

export async function fetchCryptoHoldings<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/crypto/holdings', { method: 'GET' }, fallback);
}

export async function fetchUserDcaSchedules<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/crypto/dca-schedules', { method: 'GET' }, fallback);
}

export async function createDcaScheduleApi(payload: {
  symbol: string;
  amountUsd: number;
  frequency: string;
}): Promise<unknown> {
  return requestApi<unknown>('/api/v1/crypto/dca-schedules', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function toggleDcaScheduleApi(id: string): Promise<unknown> {
  return requestApi<unknown>(`/api/v1/crypto/dca-schedules/${id}/toggle`, {
    method: 'PATCH',
  });
}

export async function deleteDcaScheduleApi(id: string): Promise<unknown> {
  return requestApi<unknown>(`/api/v1/crypto/dca-schedules/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchStockPositions<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/stocks/positions', { method: 'GET' }, fallback);
}

export async function fetchUserStockOrders<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/stocks/orders', { method: 'GET' }, fallback);
}

export async function fetchStockOrderBook<T = unknown>(
  symbol: string = 'NVDA',
  fallback?: T,
): Promise<T> {
  return requestApi<T>(`/api/v1/stocks/order-book?symbol=${symbol}`, { method: 'GET' }, fallback);
}

export async function submitStockOrder(payload: {
  symbol: string;
  orderType: 'MARKET' | 'LIMIT';
  side: 'BUY' | 'SELL';
  shares: number;
  limitPrice?: number;
}): Promise<unknown> {
  return requestApi<unknown>('/api/v1/stocks/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function cancelStockOrderApi(id: string): Promise<unknown> {
  return requestApi<unknown>(`/api/v1/stocks/orders/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchWalletBalances<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/wallet/balances', { method: 'GET' }, fallback);
}

export async function adjustWalletBalanceApi(
  payloadOrAmount: number | { amount: number; description?: string },
  maybeDescription?: string,
): Promise<unknown> {
  const payload =
    typeof payloadOrAmount === 'number'
      ? { amount: payloadOrAmount, description: maybeDescription }
      : payloadOrAmount;
  return requestApi<unknown>('/api/v1/wallet/adjust-balance', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitWithdrawal(payload: {
  amount: number;
  currency: string;
  destinationId: string;
}): Promise<unknown> {
  return requestApi<unknown>('/api/v1/wallet/fiat-ramp', {
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

export async function fetchAiFundsTelemetry<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/ai-funds/metrics', { method: 'GET' }, fallback);
}

export async function fetchAiFundPositions<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/ai-funds/positions', { method: 'GET' }, fallback);
}

export async function buyAiAssetApi(payload: {
  assetId: string;
  tokens: number;
  tokenPrice: number;
}): Promise<unknown> {
  return requestApi<unknown>('/api/v1/ai-funds/buy', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sellAiAssetApi(payload: {
  assetId: string;
  tokensToSell: number;
  pricePerToken?: number;
}): Promise<unknown> {
  return requestApi<unknown>('/api/v1/ai-funds/sell', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function toggleAiCircuitBreaker(active: boolean, reason?: string): Promise<unknown> {
  return requestApi<unknown>('/api/v1/ai-funds/circuit-breaker', {
    method: 'POST',
    body: JSON.stringify({ active, reason }),
  });
}

export async function fetchRealEstateProperties<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/real-estate/properties', { method: 'GET' }, fallback);
}

export async function buyPropertyApi(payload: {
  propertyId: string;
  tokens: number;
  tokenPrice: number;
}): Promise<unknown> {
  return requestApi<unknown>('/api/v1/real-estate/buy', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sellPropertyApi(payload: {
  propertyId: string;
  tokensToSell: number;
  pricePerToken?: number;
}): Promise<unknown> {
  return requestApi<unknown>('/api/v1/real-estate/sell', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchCarsVaultInventory<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/cars/inventory', { method: 'GET' }, fallback);
}

export async function buyVehicleAssetApi(payload: {
  assetId: string;
  price: number;
  purchaseType?: string;
  fractionalPct?: number;
}): Promise<unknown> {
  return requestApi<unknown>('/api/v1/cars/buy', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sellVehicleAssetApi(payload: {
  assetId: string;
  proceeds: number;
}): Promise<unknown> {
  return requestApi<unknown>('/api/v1/cars/sell', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCardSpendingLimitApi(dailySpendLimit: number): Promise<unknown> {
  return requestApi<unknown>('/api/v1/vip-cards/controls', {
    method: 'PATCH',
    body: JSON.stringify({ dailySpendLimit }),
  });
}

// ----------------------------------------------------------------------
// Governance & Security (VIP Cards, Compliance, 48h Time-Lock)
// ----------------------------------------------------------------------

export async function fetchVipCardStatus<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/vip-cards/status', { method: 'GET' }, fallback);
}

export async function revealCardSensitive(pin: string): Promise<unknown> {
  return requestApi<unknown>('/api/v1/vip-cards/reveal-sensitive', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
}

export async function fetchComplianceStatus<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/compliance/status', { method: 'GET' }, fallback);
}

export async function uploadDossierDocument<T = unknown>(
  payload: {
    docType: string;
    fileUrl?: string;
    file?: File;
    notes?: string;
    fullName?: string;
    dob?: string;
    idNumber?: string;
    providerOrBank?: string;
    billingAddress?: string;
    billIssueDate?: string;
  },
  fallback?: T
): Promise<T> {
  const fileUrl =
    payload.fileUrl ||
    (payload.file
      ? `https://vault.wavyassets.com/dossier/vault_${Date.now()}_${encodeURIComponent(payload.file.name)}`
      : 'https://vault.wavyassets.com/dossier/dossier_upload.pdf');

  const bodyData = { ...payload };
  delete bodyData.file;
  const requestBody = { ...bodyData, fileUrl };

  return requestApi<T>(
    '/api/v1/compliance/dossier-upload',
    {
      method: 'POST',
      body: JSON.stringify(requestBody),
    },
    fallback
  );
}

export async function fetchWhitelistDestinations<T = unknown>(fallback?: T): Promise<T> {
  return requestApi<T>('/api/v1/security/whitelist-destinations', { method: 'GET' }, fallback);
}

export async function registerWhitelistDestination(payload: {
  assetRail?: string;
  destinationLabel?: string;
  beneficiaryOrg?: string;
  addressOrIban?: string;
  address?: string;
  label?: string;
  assetType?: 'CRYPTO' | 'FIAT_IBAN';
  network?: string;
}): Promise<unknown> {
  const body = {
    assetRail:
      payload.assetRail ||
      (payload.network === 'BTC'
        ? 'BTC'
        : payload.network === 'ETH'
          ? 'ETH'
          : payload.assetType === 'FIAT_IBAN'
            ? 'WIRE_IBAN'
            : 'ERC20_USDC'),
    destinationLabel: payload.destinationLabel || payload.label || 'Whitelisted Address',
    beneficiaryOrg: payload.beneficiaryOrg || 'Global Beneficiary',
    addressOrIban: payload.addressOrIban || payload.address || '',
  };
  return requestApi<unknown>('/api/v1/security/whitelist-destinations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
