import { describe, it, expect, beforeEach } from 'vitest';
import { TelemetryService } from '../../../src/modules/telemetry/telemetry.service';

describe('TelemetryService Unit Tests', () => {
  let telemetryService: TelemetryService;

  beforeEach(() => {
    telemetryService = new TelemetryService();
  });

  it('should deliver multi-asset quotes for all 10 core benchmarks with valid sparklines', async () => {
    const result = await telemetryService.getTickerQuotes();

    expect(result.feedStatus).toBe('OPTIMAL');
    expect(result.quotes).toHaveLength(11);

    const symbols = result.quotes.map((q) => q.symbol);
    expect(symbols).toContain('BTC/USD');
    expect(symbols).toContain('ETH/USD');
    expect(symbols).toContain('SOL/USD');
    expect(symbols).toContain('WAVY-YIELD');
    expect(symbols).toContain('AAPL');
    expect(symbols).toContain('NVDA');
    expect(symbols).toContain('TSLA');
    expect(symbols).toContain('SPY');
    expect(symbols).toContain('US 10Y');
    expect(symbols).toContain('XAU/USD');
    expect(symbols).toContain('BRENT');

    const btcQuote = result.quotes.find((q) => q.symbol === 'BTC/USD');
    expect(btcQuote?.price).toBeGreaterThan(50000);
    expect(btcQuote?.category).toBe('CRYPTO');
    expect(btcQuote?.sparkline.length).toBeGreaterThanOrEqual(7);
  });

  it('should activate circuit-breaker fallback without crashing or throwing during provider disruption', async () => {
    // Simulate upstream provider disconnection
    telemetryService.setCircuitBreaker(true);

    const fallbackResult = await telemetryService.getTickerQuotes();

    expect(fallbackResult.feedStatus).toBe('FALLBACK');
    expect(fallbackResult.quotes.length).toBe(11);
    expect(fallbackResult.quotes[0].price).toBeGreaterThan(0);

    // Reset circuit breaker
    telemetryService.setCircuitBreaker(false);
    const restoredResult = await telemetryService.getTickerQuotes();
    expect(restoredResult.feedStatus).toBe('OPTIMAL');
  });
});
