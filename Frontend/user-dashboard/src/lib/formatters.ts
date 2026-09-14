/**
 * Formatting utilities for institutional financial metrics with tabular figure enforcement.
 */

export function formatCurrency(
  amount: number,
  currency = 'USD',
  decimals = 2
): string {
  if (isNaN(amount) || !isFinite(amount)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatPercent(
  value: number,
  includeSign = true,
  decimals = 2
): string {
  if (isNaN(value) || !isFinite(value)) return '0.00%';

  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatCompactNumber(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '0';

  if (Math.abs(amount) >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toFixed(0);
}

export function formatDate(dateInput: string | Date | number): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return '—';
  }
}

export function maskValue(value: string, isMasked: boolean, maskChar = '••••••••'): string {
  return isMasked ? maskChar : value;
}
