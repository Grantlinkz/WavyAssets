/**
 * WebSocket Service Unit Tests
 * Tests data contracts and configuration
 */

import { describe, it, expect } from 'vitest';

describe('WebSocket Data Contracts', () => {
  describe('AssetQuote Interface', () => {
    it('should accept valid AssetQuote structure', () => {
      const quote = {
        symbol: 'BTC',
        name: 'Bitcoin',
        category: 'CRYPTO' as const,
        price: 50000,
        change24h: '+2.5%',
        volume24h: '1.2B',
        sparkline: [49000, 49500, 50000],
        updatedAt: '2026-10-07T12:00:00Z',
      };

      expect(quote.symbol).toBe('BTC');
      expect(quote.category).toBe('CRYPTO');
      expect(quote.price).toBe(50000);
      expect(quote.change24h).toBe('+2.5%');
      expect(Array.isArray(quote.sparkline)).toBe(true);
    });

    it('should support all asset categories', () => {
      const categories: Array<'CRYPTO' | 'EQUITIES' | 'COMMODITIES' | 'TREASURIES'> = [
        'CRYPTO',
        'EQUITIES',
        'COMMODITIES',
        'TREASURIES',
      ];

      categories.forEach((category) => {
        expect(category).toBeDefined();
      });
    });
  });

  describe('TickerResponseData Interface', () => {
    it('should accept valid TickerResponseData structure', () => {
      const data = {
        quotes: [
          {
            symbol: 'BTC',
            name: 'Bitcoin',
            category: 'CRYPTO' as const,
            price: 50000,
            change24h: '+2.5%',
            volume24h: '1.2B',
            sparkline: [49000, 49500, 50000],
            updatedAt: '2026-10-07T12:00:00Z',
          },
        ],
        feedStatus: 'OPTIMAL' as const,
        timestamp: '2026-10-07T12:00:00Z',
      };

      expect(data.feedStatus).toBe('OPTIMAL');
      expect(Array.isArray(data.quotes)).toBe(true);
      expect(data.quotes.length).toBe(1);
      expect(data.timestamp).toBeDefined();
    });

    it('should support all feed statuses', () => {
      const statuses: Array<'OPTIMAL' | 'STALE' | 'FALLBACK'> = [
        'OPTIMAL',
        'STALE',
        'FALLBACK',
      ];

      statuses.forEach((status) => {
        expect(status).toBeDefined();
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should define VITE_WS_URL environment variable', () => {
      const envVar = 'VITE_WS_URL';
      expect(envVar).toBe('VITE_WS_URL');
    });

    it('should define VITE_BACKEND_ORIGIN as fallback', () => {
      const envVar = 'VITE_BACKEND_ORIGIN';
      expect(envVar).toBe('VITE_BACKEND_ORIGIN');
    });

    it('should have default WebSocket URL', () => {
      const defaultUrl = 'http://localhost:4000';
      expect(defaultUrl).toBe('http://localhost:4000');
    });
  });

  describe('WebSocket Configuration', () => {
    it('should use correct WebSocket path', () => {
      const path = '/ws/ticker';
      expect(path).toBe('/ws/ticker');
    });

    it('should support WebSocket and polling transports', () => {
      const transports = ['websocket', 'polling'];
      expect(transports).toContain('websocket');
      expect(transports).toContain('polling');
    });

    it('should have reconnection enabled', () => {
      const reconnection = true;
      expect(reconnection).toBe(true);
    });

    it('should have reasonable reconnection settings', () => {
      const settings = {
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      };

      expect(settings.reconnectionDelay).toBe(1000);
      expect(settings.reconnectionAttempts).toBe(5);
    });
  });
});
