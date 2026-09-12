import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  authApi,
  leadsApi,
  newsletterApi,
  simulationApi,
  telemetryApi,
  ApiError,
} from '../../src/lib/api';

describe('Institutional Gateway API Client Layer', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('1. Auth Gateway Endpoints', () => {
    it('dispatches initiate auth request with correct envelope and headers', async () => {
      const mockResponse = {
        success: true,
        data: {
          step: 2,
          challengeId: 'chl_test123',
          expiresInSeconds: 300,
          deliveryChannel: 'EMAIL',
          maskedDestination: 'i***@familyoffice.ch',
        },
        timestamp: '2026-09-12T00:00:00.000Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const res = await authApi.initiate({
        email: 'investor@familyoffice.ch',
        passphrase: 'SecurePass123!',
        mode: 'login',
        tier: 'INSTITUTIONAL',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/initiate'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
      expect(res.success).toBe(true);
      expect(res.data?.challengeId).toBe('chl_test123');
    });

    it('throws ApiError with normalized message on 401 unauthorized challenge', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Invalid verification code or challenge expired',
        timestamp: '2026-09-12T00:00:00.000Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockErrorResponse,
      });

      await expect(
        authApi.verifyOtp({ challengeId: 'chl_test123', otpCode: '999999' })
      ).rejects.toThrowError(ApiError);
    });
  });

  describe('2. Leads & Mandates Pipeline', () => {
    it('dispatches institutional lead inquiry and returns response envelope', async () => {
      const mockResponse = {
        success: true,
        data: {
          inquiryId: 'inq_abc789',
          status: 'PRIORITY_REVIEW',
          priority: true,
          receivedAt: '2026-09-12T00:00:00.000Z',
          message: 'Mandate queued for executive desk review.',
        },
        timestamp: '2026-09-12T00:00:00.000Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const res = await leadsApi.submitInquiry({
        fullName: 'Alexander von Bern',
        workEmail: 'alexander@bern-capital.ch',
        companyName: 'Bern Capital AG',
        service: 'AI_FUNDS',
        allocationRange: '$5M - $10M',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/leads/inquire'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(res.data?.inquiryId).toBe('inq_abc789');
      expect(res.data?.priority).toBe(true);
    });
  });

  describe('3. Newsletter & Simulation Endpoints', () => {
    it('dispatches newsletter double opt-in subscription', async () => {
      const mockResponse = {
        success: true,
        data: {
          email: 'allocator@swiss-fund.ch',
          status: 'PENDING_VERIFICATION',
          message: 'Double opt-in link dispatched.',
        },
        timestamp: '2026-09-12T00:00:00.000Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const res = await newsletterApi.subscribe({ email: 'allocator@swiss-fund.ch' });
      expect(res.data?.status).toBe('PENDING_VERIFICATION');
    });

    it('tokenizes portfolio simulation intent', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'sim_token_xyz',
          capitalAmount: 1000000,
          riskPosture: 2,
          riskLabel: 'Balanced Growth',
          projectedYield: 14.8,
          expiresAt: '2026-10-12T00:00:00.000Z',
        },
        timestamp: '2026-09-12T00:00:00.000Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const res = await simulationApi.saveSimulation({
        capitalAmount: 1000000,
        riskPosture: 2,
        projectedYield: 14.8,
      });

      expect(res.data?.token).toBe('sim_token_xyz');
      expect(res.data?.riskLabel).toBe('Balanced Growth');
    });

    it('retrieves live ticker quotes from telemetry endpoint', async () => {
      const mockResponse = {
        success: true,
        data: {
          quotes: [
            {
              symbol: 'BTC/USD',
              name: 'Bitcoin',
              category: 'CRYPTO',
              price: 95000,
              change24h: '+3.2%',
              volume24h: '$40B',
              sparkline: [92000, 95000],
              updatedAt: '2026-09-12T00:00:00.000Z',
            },
          ],
          feedStatus: 'OPTIMAL',
          timestamp: '2026-09-12T00:00:00.000Z',
        },
        timestamp: '2026-09-12T00:00:00.000Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const res = await telemetryApi.getTickerQuotes();
      expect(res.data?.quotes[0].symbol).toBe('BTC/USD');
      expect(res.data?.feedStatus).toBe('OPTIMAL');
    });
  });
});
