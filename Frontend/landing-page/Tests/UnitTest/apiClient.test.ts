import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  authApi,
  leadsApi,
  newsletterApi,
  simulationApi,
  telemetryApi,
  ApiError,
  request,
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

    it('dispatches forgot-password request with email', async () => {
      const mockResponse = {
        success: true,
        data: {
          step: 2,
          challengeId: 'chl_reset_456',
          expiresInSeconds: 300,
          maskedDestination: 'i***@familyoffice.ch',
        },
        timestamp: '2026-09-12T00:00:00.000Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const res = await authApi.forgotPassword({ email: 'investor@familyoffice.ch' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/forgot-password'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(res.data?.challengeId).toBe('chl_reset_456');
    });

    it('dispatches reset-password request with challengeId, otpCode, and newPassphrase', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Password reset successfully' },
        timestamp: '2026-09-12T00:00:00.000Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const res = await authApi.resetPassword({
        challengeId: 'chl_reset_456',
        otpCode: '123456',
        newPassphrase: 'NewSecurePassword123!',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/reset-password'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(res.data?.message).toBe('Password reset successfully');
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

    it('returns 408 ApiError when request abort is triggered by timeout timer', async () => {
      global.fetch = vi.fn().mockImplementation((_url, init) => {
        return new Promise((_, reject) => {
          init.signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      });

      await expect(
        request('/test/timeout', {}, 10),
      ).rejects.toSatisfy((err: unknown) => {
        return err instanceof ApiError && err.statusCode === 408;
      });
    });

    it('preserves caller cancellation and rethrows AbortError when caller aborts', async () => {
      const controller = new AbortController();
      global.fetch = vi.fn().mockImplementation((_url, init) => {
        return new Promise((_, reject) => {
          init.signal.addEventListener('abort', () => {
            const err = new Error('The user aborted a request');
            err.name = 'AbortError';
            reject(err);
          });
        });
      });

      const requestPromise = request('/test/caller-abort', { signal: controller.signal }, 60000);
      controller.abort();

      await expect(requestPromise).rejects.toSatisfy((err: unknown) => {
        return err instanceof Error && err.name === 'AbortError' && !(err instanceof ApiError);
      });
    });
  });
});
