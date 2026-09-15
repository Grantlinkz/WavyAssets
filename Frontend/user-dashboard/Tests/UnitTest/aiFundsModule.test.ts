import { describe, it, expect, beforeEach } from 'vitest';
import { useAlternativeStore } from '../../src/store/useAlternativeStore';
import {
  AI_FUNDS_METRICS,
  AI_RISK_TIERS,
  AI_RATIONALE_EVENTS,
  GPU_CLUSTER_TELEMETRY,
} from '../../src/lib/alternativeAssetData';

describe('AI Funds Module Telemetry & Store Unit Tests', () => {
  beforeEach(() => {
    // Reset store state
    useAlternativeStore.setState({
      selectedRiskTier: 'balanced',
      isCircuitBreakerTriggered: false,
      activeRationaleFilter: 'All Events',
      claimedGpuYieldUsdc: 0,
      pendingGpuYieldUsdc: GPU_CLUSTER_TELEMETRY.pendingYieldUsdc,
    });
  });

  it('validates 5-KPI executive metrics integrity and Sharpe/Sortino ratios', () => {
    expect(AI_FUNDS_METRICS).toHaveLength(5);

    const capitalDeployed = AI_FUNDS_METRICS.find((m) => m.label === 'Capital Deployed');
    expect(capitalDeployed?.value).toBe('$1,450,000.00');
    expect(capitalDeployed?.badge).toBe('9.8% NAV');

    const sharpe = AI_FUNDS_METRICS.find((m) => m.label === 'Sharpe Ratio');
    expect(sharpe?.value).toBe('2.84');
    expect(parseFloat(sharpe?.value || '0')).toBeGreaterThan(2.0);

    const sortino = AI_FUNDS_METRICS.find((m) => m.label === 'Sortino Ratio');
    expect(sortino?.value).toBe('3.12');

    const drawdown = AI_FUNDS_METRICS.find((m) => m.label === 'Max Drawdown');
    expect(drawdown?.value).toBe('-4.20%');
  });

  it('allows calibrating risk posture between Capital Preservation, Balanced Trend, and High-Vol', () => {
    const store = useAlternativeStore.getState();
    expect(store.selectedRiskTier).toBe('balanced');

    store.setRiskTier('preservation');
    expect(useAlternativeStore.getState().selectedRiskTier).toBe('preservation');

    store.setRiskTier('high-vol');
    expect(useAlternativeStore.getState().selectedRiskTier).toBe('high-vol');

    expect(AI_RISK_TIERS).toHaveLength(3);
    const highVolTier = AI_RISK_TIERS.find((t) => t.id === 'high-vol');
    expect(highVolTier?.leverage).toBe('2.5x');
  });

  it('controls Fiduciary Circuit Breaker emergency kill switch and re-arm flow', () => {
    const store = useAlternativeStore.getState();
    expect(store.isCircuitBreakerTriggered).toBe(false);

    store.triggerCircuitBreaker();
    expect(useAlternativeStore.getState().isCircuitBreakerTriggered).toBe(true);

    store.resetCircuitBreaker();
    expect(useAlternativeStore.getState().isCircuitBreakerTriggered).toBe(false);
  });

  it('manages GPU cluster yield claiming and utilization telemetry', () => {
    const store = useAlternativeStore.getState();
    expect(store.claimedGpuYieldUsdc).toBe(0);
    expect(store.pendingGpuYieldUsdc).toBe(1842.10);

    store.claimGpuYield();
    expect(useAlternativeStore.getState().claimedGpuYieldUsdc).toBe(1842.10);
    expect(useAlternativeStore.getState().pendingGpuYieldUsdc).toBe(0);

    // Verify GPU specs
    expect(GPU_CLUSTER_TELEMETRY.totalGpus).toBe(160);
    expect(GPU_CLUSTER_TELEMETRY.onlineGpus).toBe(151);
    expect(GPU_CLUSTER_TELEMETRY.utilizationRate).toBe(94.2);
    expect(GPU_CLUSTER_TELEMETRY.hourlyRate).toBe(18.42);
  });

  it('filters algorithmic execution rationale ledger by event category', () => {
    const store = useAlternativeStore.getState();
    expect(store.activeRationaleFilter).toBe('All Events');

    store.setRationaleFilter('Delta Hedging');
    expect(useAlternativeStore.getState().activeRationaleFilter).toBe('Delta Hedging');

    const deltaHedgingEvents = AI_RATIONALE_EVENTS.filter((e) =>
      e.category.toLowerCase().includes('delta hedging')
    );
    expect(deltaHedgingEvents.length).toBeGreaterThan(0);
    expect(deltaHedgingEvents[0].venue).toBe('Deribit ETH-PERP');
  });
});
