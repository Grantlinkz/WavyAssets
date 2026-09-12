/**
 * WavyAssets Institutional Gateway API Client Layer
 * Standardized communication with Backend/landing-page (:4000)
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly error: string;
  readonly details?: unknown;

  constructor(statusCode: number, error: string, details?: unknown) {
    super(error);
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
    this.name = 'ApiError';
  }
}

// -------------------------------------------------------------
// Authentication Contracts
// -------------------------------------------------------------
export interface InitiateAuthPayload {
  email: string;
  passphrase: string;
  fullName?: string;
  tier?: 'RETAIL' | 'PRIVATE_WEALTH' | 'INSTITUTIONAL';
  mode: 'login' | 'register';
}

export interface InitiateAuthResponseData {
  step: 2;
  challengeId: string;
  expiresInSeconds: number;
  deliveryChannel: string;
  backupChannel?: string | null;
  maskedDestination: string;
}

export interface VerifyOtpPayload {
  challengeId: string;
  otpCode: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  tier: string;
}

export interface VerifyOtpResponseData {
  user: UserProfile;
  accessToken: string;
  handoffTicket?: string;
  dashboardUrl?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponseData {
  step: 2;
  challengeId: string;
  expiresInSeconds: number;
  maskedDestination: string;
}

export interface ResetPasswordPayload {
  challengeId: string;
  otpCode: string;
  newPassphrase: string;
}

export interface ResetPasswordResponseData {
  message: string;
}

// -------------------------------------------------------------
// Leads & Institutional Mandates Contracts
// -------------------------------------------------------------
export interface LeadInquiryPayload {
  fullName: string;
  workEmail: string;
  companyName: string;
  websiteUrl?: string;
  telegram?: string;
  service: 'CRYPTO' | 'STOCKS' | 'AI_FUNDS' | 'REAL_ESTATE' | 'VIP_CARDS' | 'CARS' | 'WALLET';
  allocationRange: '$500K - $1M' | '$1M - $5M' | '$5M - $10M' | '$10M+' | 'CUSTOM';
  notes?: string;
  honeypot?: string;
}

export interface LeadInquiryResponseData {
  inquiryId: string;
  status: string;
  priority: boolean;
  receivedAt: string;
  message: string;
}

// -------------------------------------------------------------
// Newsletter Contracts
// -------------------------------------------------------------
export interface SubscribeNewsletterPayload {
  email: string;
}

export interface NewsletterResponseData {
  email: string;
  status: string;
  message: string;
}

// -------------------------------------------------------------
// Portfolio Simulation Contracts
// -------------------------------------------------------------
export interface SaveSimulationPayload {
  capitalAmount: number;
  riskPosture: number;
  projectedYield: number;
}

export interface SimulationResponseData {
  token: string;
  capitalAmount: number;
  riskPosture: number;
  riskLabel: string;
  projectedYield: number;
  expiresAt: string;
}

// -------------------------------------------------------------
// Telemetry & Trust Contracts
// -------------------------------------------------------------
export interface AssetQuote {
  symbol: string;
  name: string;
  category: 'CRYPTO' | 'EQUITIES' | 'COMMODITIES' | 'TREASURIES';
  price: number;
  change24h: string;
  volume24h: string;
  sparkline: number[];
  updatedAt: string;
}

export interface TickerResponseData {
  quotes: AssetQuote[];
  feedStatus: 'OPTIMAL' | 'STALE' | 'FALLBACK';
  timestamp: string;
}

export interface HsmNodeStatus {
  location: string;
  status: 'ACTIVE_ONLINE' | 'STANDBY' | 'SYNCING';
  uptime: string;
  securityStandard: string;
}

export interface TierAum {
  privateWealth: string;
  institutional: string;
  total: string;
}

export interface EnclaveTelemetryData {
  merkleRoot: string;
  clearingLatencyMs: number;
  hsmClusters: HsmNodeStatus[];
  tierAum: TierAum;
  lastAttestationUtc: string;
  enclaveStatus: 'OPTIMAL' | 'DEGRADED';
}

// -------------------------------------------------------------
// Core Request Transport
// -------------------------------------------------------------
const getApiBaseUrl = (): string => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return '/api/v1';
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 60000,
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${normalizedEndpoint}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
      credentials: options.credentials || 'include',
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const responseData = isJson ? await response.json() : null;

    if (!response.ok) {
      const errorMessage =
        responseData?.error ||
        responseData?.message ||
        (Array.isArray(responseData?.message) ? responseData.message.join(', ') : null) ||
        `Institutional Gateway Error (${response.status} ${response.statusText})`;

      throw new ApiError(response.status, errorMessage, responseData);
    }

    // Standard institutional response envelope { success: true, data: ..., timestamp: ... }
    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      return responseData as ApiResponse<T>;
    }

    return {
      success: true,
      data: responseData as T,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(
        408,
        'Request timed out after 60 seconds. The server may be waking up from sleep. Please try again.',
      );
    }
    const message = err instanceof Error ? err.message : 'Network failure or Gateway unreachable';
    throw new ApiError(0, message, err);
  } finally {
    clearTimeout(timeoutId);
  }
}

// -------------------------------------------------------------
// API Service Modules
// -------------------------------------------------------------

export const authApi = {
  initiate: async (payload: InitiateAuthPayload): Promise<ApiResponse<InitiateAuthResponseData>> => {
    return request<InitiateAuthResponseData>('/auth/initiate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<ApiResponse<VerifyOtpResponseData>> => {
    return request<VerifyOtpResponseData>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ApiResponse<ForgotPasswordResponseData>> => {
    return request<ForgotPasswordResponseData>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<ApiResponse<ResetPasswordResponseData>> => {
    return request<ResetPasswordResponseData>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return request<UserProfile>('/auth/me', {
      method: 'GET',
    });
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },
};

export const leadsApi = {
  submitInquiry: async (payload: LeadInquiryPayload): Promise<ApiResponse<LeadInquiryResponseData>> => {
    return request<LeadInquiryResponseData>('/leads/inquire', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const newsletterApi = {
  subscribe: async (payload: SubscribeNewsletterPayload): Promise<ApiResponse<NewsletterResponseData>> => {
    return request<NewsletterResponseData>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  verify: async (token: string): Promise<ApiResponse<NewsletterResponseData>> => {
    return request<NewsletterResponseData>(`/newsletter/verify?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });
  },
};

export const simulationApi = {
  saveSimulation: async (payload: SaveSimulationPayload): Promise<ApiResponse<SimulationResponseData>> => {
    return request<SimulationResponseData>('/simulation/save', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getSimulation: async (token: string): Promise<ApiResponse<SimulationResponseData>> => {
    return request<SimulationResponseData>(`/simulation/${encodeURIComponent(token)}`, {
      method: 'GET',
    });
  },
};

export const telemetryApi = {
  getTickerQuotes: async (): Promise<ApiResponse<TickerResponseData>> => {
    return request<TickerResponseData>('/telemetry/ticker', {
      method: 'GET',
    });
  },

  getEnclave: async (): Promise<ApiResponse<EnclaveTelemetryData>> => {
    return request<EnclaveTelemetryData>('/telemetry/enclave', {
      method: 'GET',
    });
  },
};
