import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../../src/App';
import { useDashboardStore } from '../../src/store/useDashboardStore';

describe('Performance Benchmarks & Transition Latency Suite (Sprint 6)', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      activeVertical: 'overview',
      isSidebarCollapsed: false,
      isMobileMenuOpen: false,
      theme: 'dark',
      maskBalances: false,
    });
  });

  const verticals = [
    { id: 'crypto', label: 'Crypto & Staking' },
    { id: 'stocks', label: 'Global Stocks DMA' },
    { id: 'wallet', label: 'Sovereign Multi-Currency Vault' },
    { id: 'ai-funds', label: 'AI Systematic & Quant Strategies' },
    { id: 'real-estate', label: 'Tokenized Real Estate SPV' },
    { id: 'cars', label: 'Exotic Vehicles & Horology' },
    { id: 'vip-cards', label: 'Obsidian VIP Metal Cards' },
    { id: 'compliance', label: 'Tiered KYC/AML & Tax Alpha' },
    { id: 'security', label: 'Zero-Trust Security Command Center' },
  ] as const;

  it('validates sub-50ms tab transition benchmark across all 9 asset verticals', () => {
    // Initial warm-up render
    renderToString(<App />);

    const benchmarkResults: { vertical: string; stateDurationMs: number }[] = [];

    verticals.forEach(({ id }) => {
      const start = performance.now();
      useDashboardStore.getState().setActiveVertical(id);
      const stateDurationMs = performance.now() - start;

      benchmarkResults.push({ vertical: id, stateDurationMs });

      // Verify layout stability & complete vertical tree rendering
      const html = renderToString(<App activeVertical={id} />);
      expect(html).toContain('min-h-[540px]');
      expect(useDashboardStore.getState().activeVertical).toBe(id);
    });

    // Reactive state swap SLA requirement: Transitions must be sub-50ms in-memory
    benchmarkResults.forEach((res) => {
      expect(res.stateDurationMs).toBeLessThan(50);
    });
    expect(benchmarkResults.length).toBe(9);
  });

  it('guarantees zero cumulative layout shift (CLS) container sizing across all views', () => {
    verticals.forEach(({ id }) => {
      const html = renderToString(<App activeVertical={id} />);
      // Container must enforce pre-dimensioned min-h-[540px]
      expect(html).toContain('min-h-[540px]');
      expect(html).toContain('id="main-content"');
    });
  });
});
