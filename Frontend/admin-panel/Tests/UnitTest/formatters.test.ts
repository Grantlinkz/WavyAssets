// Vitest globals enabled in config
import {
  formatCurrency,
  formatCompactCurrency,
  formatPercentage,
  formatTimestamp,
  truncateHash,
} from "../../src/lib/formatters"

describe("formatters", () => {
  it("formats currency accurately with USD symbol and commas", () => {
    expect(formatCurrency(142890420)).toContain("142,890,420.00")
    expect(formatCurrency(0)).toContain("0.00")
    expect(formatCurrency(NaN, "EUR")).toContain("0.00")
    expect(formatCurrency(NaN, "EUR")).toMatch(/€|EUR/)
    expect(formatCurrency(500, "INVALID_CODE")).toBe("500.00 INVALID_CODE")
  })

  it("formats compact currency values correctly", () => {
    const compact = formatCompactCurrency(142890420)
    expect(compact).toMatch(/\$14[23](\.9)?M/)
  })

  it("formats percentage with explicit +/- sign", () => {
    expect(formatPercentage(3.4)).toBe("+3.4%")
    expect(formatPercentage(-1.2)).toBe("-1.2%")
    expect(formatPercentage(0)).toBe("+0.0%")
  })

  it("formats UTC timestamps cleanly", () => {
    const ts = formatTimestamp("2026-09-26T14:15:00Z")
    expect(ts).toBe("2026-09-26 14:15:00 UTC")
  })

  it("truncates hashes with configurable leading/trailing characters", () => {
    const address = "0x71C845137c3550544521E23805372338A9f6D683"
    expect(truncateHash(address, 6, 4)).toBe("0x71C8...D683")
  })
})
