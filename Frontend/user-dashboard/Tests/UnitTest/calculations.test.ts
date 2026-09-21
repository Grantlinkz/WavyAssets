import { describe, it, expect } from 'vitest';
import {
  TIMEFRAME_PNL_DATA,
  DEFAULT_ALLOCATIONS,
  TOTAL_Global_NET_WORTH,
  formatMaskedCurrency,
  calculateAllocationTotals,
} from '../../src/lib/calculations';

describe('Financial Calculations & PnL Engine', () => {
  it('defines valid PnL metrics for all 5 timeframes', () => {
    const timeframes = ['1D', '1W', '1M', '1Y', 'ALL'] as const;
    timeframes.forEach((tf) => {
      const data = TIMEFRAME_PNL_DATA[tf];
      expect(data).toBeDefined();
      expect(data.timeframe).toBe(tf);
      expect(data.absoluteDelta).toBeGreaterThan(0);
      expect(data.percentageDelta).toBeGreaterThan(0);
      expect(data.isPositive).toBe(true);
      expect(data.label).toContain('%');
    });
  });

  it('verifies 1D timeframe default matches institutional specification', () => {
    const dayData = TIMEFRAME_PNL_DATA['1D'];
    expect(dayData.absoluteDelta).toBe(184210.40);
    expect(dayData.percentageDelta).toBe(1.26);
    expect(dayData.label).toBe('+$184,210.40 (+1.26%)');
  });

  it('aggregates default vertical allocations to exactly 100%', () => {
    const totalPercentage = DEFAULT_ALLOCATIONS.reduce((sum, a) => sum + a.targetPct, 0);
    expect(totalPercentage).toBe(100.0);
  });

  it('verifies default allocations sum up to TOTAL_Global_NET_WORTH ($14,820,450.00)', () => {
    const totalValue = DEFAULT_ALLOCATIONS.reduce((sum, a) => sum + a.actualValue, 0);
    expect(totalValue).toBeCloseTo(TOTAL_Global_NET_WORTH, 2);
  });

  it('masks financial currency values when maskBalances is true', () => {
    expect(formatMaskedCurrency(14820450, true)).toBe('••••••••');
    expect(formatMaskedCurrency(0, true)).toBe('••••••••');
    expect(formatMaskedCurrency(-5000, true)).toBe('••••••••');
  });

  it('formats unmasked financial figures into standard US currency format', () => {
    expect(formatMaskedCurrency(14820450, false)).toBe('$14,820,450.00');
    expect(formatMaskedCurrency(5187157.5, false)).toBe('$5,187,157.50');
  });

  it('calculates allocation totals and recomputes percentage breakdown correctly', () => {
    const result = calculateAllocationTotals(DEFAULT_ALLOCATIONS);
    expect(result.totalValue).toBeCloseTo(TOTAL_Global_NET_WORTH, 2);
    expect(result.allocations.length).toBe(6);
    const sumPct = result.allocations.reduce((sum, a) => sum + a.computedPct, 0);
    expect(sumPct).toBeCloseTo(100, 1);
  });
});
