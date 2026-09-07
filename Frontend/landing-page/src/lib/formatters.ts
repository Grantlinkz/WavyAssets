/**
 * Institutional Financial Formatters
 * Formats monetary, percentage, and basis point metrics strictly for Inter tabular figures.
 */

export interface CurrencyFormatOptions {
  currency?: string;
  decimals?: number;
  notation?: 'standard' | 'compact';
}

/**
 * Formats a numeric value into institutional currency format (default USD).
 * Ensures sanitized inputs and handles edge cases safely without throwing.
 */
export function formatCurrency(
  value: number | undefined | null,
  currency = 'USD',
  decimals = 2
): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    // Fallback if invalid currency code
    return `$${value.toFixed(decimals)}`;
  }
}

/**
 * Formats a percentage value with optional sign indicator.
 * Example: formatPercent(2.84, true) => "+2.84%"
 */
export function formatPercent(
  value: number | undefined | null,
  includeSign = true,
  decimals = 2
): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '0.00%';
  }

  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Formats basis points (BPS) for yield or delta spreads.
 * Example: formatBps(-3) => "-3 BPS", formatBps(15) => "+15 BPS"
 */
export function formatBps(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '0 BPS';
  }

  const sign = value > 0 ? '+' : '';
  return `${sign}${Math.round(value)} BPS`;
}

/**
 * Formats large amounts compactly (e.g. $4.82B, $120.5M).
 */
export function formatCompactNumber(
  value: number | undefined | null,
  prefix = '$'
): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return `${prefix}0.00`;
  }

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1e12) {
    return `${sign}${prefix}${(abs / 1e12).toFixed(2)}T`;
  }
  if (abs >= 1e9) {
    return `${sign}${prefix}${(abs / 1e9).toFixed(2)}B`;
  }
  if (abs >= 1e6) {
    return `${sign}${prefix}${(abs / 1e6).toFixed(2)}M`;
  }
  if (abs >= 1e3) {
    return `${sign}${prefix}${(abs / 1e3).toFixed(1)}K`;
  }

  return `${sign}${prefix}${abs.toFixed(2)}`;
}

/**
 * Returns the semantic CSS color class based on metric polarity:
 * positive -> text-secondary (Emerald Yield)
 * negative -> text-error (Crimson Risk)
 * neutral -> text-on-surface-variant
 */
export function getDeltaColorClass(value: number | undefined | null): string {
  if (!value || value === 0) return 'text-on-surface-variant';
  return value > 0 ? 'text-secondary' : 'text-error';
}
