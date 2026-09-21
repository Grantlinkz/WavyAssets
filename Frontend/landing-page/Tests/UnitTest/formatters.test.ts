import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatBps,
  formatCompactNumber,
  getDeltaColorClass,
} from '../../src/lib/formatters';

describe('Institutional Financial Formatters', () => {
  it('formats standard currency correctly', () => {
    expect(formatCurrency(94240.5, 'USD', 2, 'en-US')).toBe('$94,240.50');
    expect(formatCurrency(0, 'USD', 2, 'en-US')).toBe('$0.00');
    expect(formatCurrency(undefined)).toBe('—');
    expect(formatCurrency(null)).toBe('—');
    expect(formatCurrency(NaN)).toBe('—');
  });

  it('formats currency according to specified locale with institutional fallback', () => {
    // de-DE uses comma as decimal separator and period as thousands separator
    const deFormatted = formatCurrency(12500.5, 'EUR', 2, 'de-DE');
    expect(deFormatted).toContain('12.500,50');

    // en-GB formatting
    const gbFormatted = formatCurrency(5000, 'GBP', 2, 'en-GB');
    expect(gbFormatted).toContain('£5,000.00');
  });

  it('formats percentages with proper signs and decimals', () => {
    expect(formatPercent(2.84, true)).toBe('+2.84%');
    expect(formatPercent(-0.45, true)).toBe('-0.45%');
    expect(formatPercent(14.8, false)).toBe('14.80%');
    expect(formatPercent(undefined)).toBe('0.00%');
  });

  it('formats basis points (BPS)', () => {
    expect(formatBps(15)).toBe('+15 BPS');
    expect(formatBps(-3)).toBe('-3 BPS');
    expect(formatBps(0)).toBe('0 BPS');
    expect(formatBps(null)).toBe('0 BPS');
  });

  it('formats compact numbers properly for Global metrics', () => {
    expect(formatCompactNumber(4820000000)).toBe('$4.82B');
    expect(formatCompactNumber(150500000)).toBe('$150.50M');
    expect(formatCompactNumber(25000)).toBe('$25.0K');
    expect(formatCompactNumber(500)).toBe('$500.00');
    expect(formatCompactNumber(undefined)).toBe('$0.00');
  });

  it('provides correct polarity delta color classes', () => {
    expect(getDeltaColorClass(2.5)).toBe('text-secondary');
    expect(getDeltaColorClass(-1.2)).toBe('text-error');
    expect(getDeltaColorClass(0)).toBe('text-on-surface-variant');
  });
});
