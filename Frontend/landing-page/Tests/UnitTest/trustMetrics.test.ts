import { describe, it, expect, beforeEach } from 'vitest';
import {
  trustMetricsData,
  testimonialsData,
  custodyNodes,
} from '../../src/components/trust/trustData';
import { useTerminalStore } from '../../src/store/useTerminalStore';

describe('Trust Infrastructure Data & Metrics Unit Tests', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      trustMode: 'institutional',
      clientTier: 'institutional',
    });
  });

  it('correctly maps private-wealth trust metrics with $4.82B AUM', () => {
    const pwMetrics = trustMetricsData['private-wealth'];
    expect(pwMetrics).toHaveLength(4);

    const aumMetric = pwMetrics.find((m) => m.id === 'aum');
    expect(aumMetric?.value).toBe('$4.82B');
    expect(aumMetric?.badge).toBe('[ VERIFIED // DELOITTE Q4 ]');

    const uptimeMetric = pwMetrics.find((m) => m.id === 'uptime');
    expect(uptimeMetric?.value).toBe('99.998%');

    const reservesMetric = pwMetrics.find((m) => m.id === 'reserves');
    expect(reservesMetric?.value).toBe('100%');

    const breachesMetric = pwMetrics.find((m) => m.id === 'breaches');
    expect(breachesMetric?.value).toBe('0');
  });

  it('correctly maps institutional trust metrics with $12.40B AUM', () => {
    const instMetrics = trustMetricsData['institutional'];
    expect(instMetrics).toHaveLength(4);

    const aumMetric = instMetrics.find((m) => m.id === 'aum');
    expect(aumMetric?.value).toBe('$12.40B');

    const uptimeMetric = instMetrics.find((m) => m.id === 'uptime');
    expect(uptimeMetric?.value).toBe('99.999%');
  });

  it('contains verified testimonials for both client tiers', () => {
    const pwTestimonials = testimonialsData['private-wealth'];
    expect(pwTestimonials).toHaveLength(3);
    expect(pwTestimonials[0].name).toBe('Alexander Koenig');
    expect(pwTestimonials[0].identifier).toBe('FO-ZUR-091');
    expect(pwTestimonials[1].name).toBe('Victoria Laurent');
    expect(pwTestimonials[2].name).toBe('Marcus Thorne');

    const instTestimonials = testimonialsData['institutional'];
    expect(instTestimonials).toHaveLength(3);
    expect(instTestimonials[0].name).toBe('Sheikh Tariq Al-Zahrani');
    expect(instTestimonials[1].name).toBe('Dr. Hendrik Weber');
    expect(instTestimonials[2].name).toBe('Eleanor de Broglie');
  });

  it('contains all 6 institutional clearing & custody nodes', () => {
    expect(custodyNodes).toHaveLength(6);
    const nodeNames = custodyNodes.map((n) => n.name);
    expect(nodeNames).toContain('BNY MELLON');
    expect(nodeNames).toContain('STATE STREET');
    expect(nodeNames).toContain('LGT BANK SCHWEIZ');
    expect(nodeNames).toContain('EQUINIX NY4 / LD4');
    expect(nodeNames).toContain("LLOYD'S OF LONDON");
    expect(nodeNames).toContain('DTCC DIRECT');
  });

  it('synchronizes trustMode and clientTier state actions in terminal store', () => {
    const store = useTerminalStore.getState();
    expect(store.trustMode).toBe('institutional');
    expect(store.clientTier).toBe('institutional');

    store.setTrustMode('private-wealth');
    expect(useTerminalStore.getState().trustMode).toBe('private-wealth');
    expect(useTerminalStore.getState().clientTier).toBe('private-wealth');

    store.setClientTier('institutional');
    expect(useTerminalStore.getState().trustMode).toBe('institutional');
    expect(useTerminalStore.getState().clientTier).toBe('institutional');
  });
});
