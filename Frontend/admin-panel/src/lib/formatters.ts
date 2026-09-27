/**
 * Format currency amount with tabular-nums support
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  decimals: number = 2
): string {
  if (isNaN(amount)) return "$0.00"
  
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return formatter.format(amount)
}

/**
 * Format compact currency (e.g. $142.8M)
 */
export function formatCompactCurrency(
  amount: number,
  currency: string = "USD"
): string {
  if (isNaN(amount)) return "$0"

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    notation: "compact",
    maximumFractionDigits: 1,
  })
  return formatter.format(amount)
}

/**
 * Format percentage with explicit +/- sign
 */
export function formatPercentage(value: number, includeSign: boolean = true): string {
  if (isNaN(value)) return "0.0%"
  const sign = includeSign && value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Format institutional UTC timestamp (YYYY-MM-DD HH:mm:ss UTC)
 */
export function formatTimestamp(dateInput: string | number | Date): string {
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return "Invalid Date"
    return d.toISOString().replace("T", " ").substring(0, 19) + " UTC"
  } catch {
    return "Invalid Date"
  }
}

/**
 * Truncate hash or address (0x1234...abcd)
 */
export function truncateHash(hash: string, startChars = 6, endChars = 4): string {
  if (!hash || hash.length <= startChars + endChars) return hash
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`
}
