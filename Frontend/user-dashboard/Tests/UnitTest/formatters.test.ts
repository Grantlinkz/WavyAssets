import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatCompactNumber,
  maskValue,
} from '../../src/lib/formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats numbers to standard USD currency format', () => {
      expect(formatCurrency(14820450)).toBe('$14,820,450.00');
      expect(formatCurrency(184210.4)).toBe('$184,210.40');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('handles NaN and infinite numbers gracefully', () => {
      expect(formatCurrency(NaN)).toBe('$0.00');
      expect(formatCurrency(Infinity)).toBe('$0.00');
      expect(formatCurrency(-Infinity)).toBe('$0.00');
    });

    it('respects decimal parameter', () => {
      expect(formatCurrency(1234.5678, 'USD', 0)).toBe('$1,235');
      expect(formatCurrency(1234.5, 'USD', 2)).toBe('$1,234.50');
    });
  });

  describe('formatPercent', () => {
    it('formats percentages with explicit positive sign by default', () => {
      expect(formatPercent(1.26)).toBe('+1.26%');
      expect(formatPercent(-0.85)).toBe('-0.85%');
      expect(formatPercent(0)).toBe('0.00%');
    });

    it('handles sign exclusion when includeSign is false', () => {
      expect(formatPercent(1.26, false)).toBe('1.26%');
    });

    it('handles NaN values safely', () => {
      expect(formatPercent(NaN)).toBe('0.00%');
    });
  });

  describe('formatCompactNumber', () => {
    it('formats billions, millions, and thousands into compact forms', () => {
      expect(formatCompactNumber(14_820_000_000)).toBe('14.82B');
      expect(formatCompactNumber(4_820_000)).toBe('4.82M');
      expect(formatCompactNumber(250_000)).toBe('250.0K');
      expect(formatCompactNumber(500)).toBe('500');
    });

    it('handles edge cases safely', () => {
      expect(formatCompactNumber(NaN)).toBe('0');
      expect(formatCompactNumber(0)).toBe('0');
    });
  });

  describe('maskValue', () => {
    it('masks values when isMasked is true', () => {
      expect(maskValue('$14,820,450.00', true)).toBe('••••••••');
      expect(maskValue('$14,820,450.00', false)).toBe('$14,820,450.00');
    });
  });
});
