import { describe, it, expect, beforeEach } from "vitest"
import { renderToString } from "react-dom/server"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuditLogView } from "../../src/views/AuditLogView"
import { DiffModal } from "../../src/components/audit/DiffModal"
import { useAuditStore } from "../../src/store/useAuditStore"
import type { AuditLogEntry } from "../../src/api/audit"

describe("Immutable Audit Trail & Diff Inspector Integration", () => {
  let queryClient: QueryClient

  const mockAuditEntry: AuditLogEntry = {
    id: "AUD-0812",
    timestamp: "2026-09-28 13:42:19",
    officerId: "ADM-01",
    officerName: "Eleanor Vance",
    officerDepartment: "Treasury",
    action: "Balance Credit",
    actionCategory: "CREDIT",
    targetEntity: "LedgerAccount",
    targetId: "USR-9942-CH",
    targetLabel: "Philippe de Rothschild",
    reason: "Inbound Fedwire reference IMAD-004291 cleared from UBS Geneva.",
    nodeOrigin: "Zurich DC1",
    ledgerState: "SETTLED",
    sha256Hash: "7f8a92b8d03541c41e892c900bb912f",
    merkleBlock: 19842109,
    diffBefore: {
      availableCash: "$8,450,200.00",
      investedCapital: "$42,100,000.00",
      accountStatus: "Active",
    },
    diffAfter: {
      availableCash: "$9,950,200.00",
      investedCapital: "$42,100,000.00",
      accountStatus: "Active",
    },
    deltaAmount: 1500000,
    deltaCurrency: "USD",
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(["audit-telemetry"], {
      totalLogEntries: 14892,
      todayExecutions: 38,
      merkleBlock: 19842109,
      merkleRoot: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      retentionYears: 10,
    })
    useAuditStore.setState({
      searchQuery: "",
      selectedCategory: "ALL",
      selectedOfficer: "ALL",
      selectedDateRange: "Today",
      selectedLogForDiff: null,
      isDiffModalOpen: false,
    })
  })

  it("renders audit log view with Merkle proof indicator and telemetry metrics", () => {
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <AuditLogView />
      </QueryClientProvider>
    )

    expect(html).toContain("System Audit Trail &amp; Compliance Log")
    expect(html).toContain("Hash Chain Verified — No Tampering")
    expect(html).toContain("Total Log Entries")
    expect(html).toContain("Today&#x27;s Executions")
    expect(html).toContain("Cryptographic Proof")
    expect(html).toContain("Statutory Retention")
    expect(html).toContain("FINMA Art. 73 Compliant")
  })

  it("renders audit toolbar with date pills and action categories", () => {
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <AuditLogView />
      </QueryClientProvider>
    )

    expect(html).toContain("Today")
    expect(html).toContain("Past 7 Days")
    expect(html).toContain("Past 30 Days")
    expect(html).toContain("All")
    expect(html).toContain("All Actions")
    expect(html).toContain("Balance Credits")
    expect(html).toContain("User Locks")
    expect(html).toContain("KYC Approvals")
    expect(html).toContain("Rail Updates")
    expect(html).toContain("VIP Cards")
  })

  it("renders side-by-side JSON diff modal when opened", () => {
    useAuditStore.setState({
      isDiffModalOpen: true,
      selectedLogForDiff: mockAuditEntry,
    })

    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <DiffModal isOpen={true} log={mockAuditEntry} />
      </QueryClientProvider>
    )

    expect(html).toContain("Record of State Changes")
    expect(html).toContain("AUD-0812")
    expect(html).toContain("Eleanor Vance")
    expect(html).toContain("Treasury")
    expect(html).toContain("7f8a92b8d03541c41e892c900bb912f")
    expect(html).toContain("19,842,109")
    expect(html).toContain("Before Change")
    expect(html).toContain("After Change (Applied)")
    expect(html).toContain("$8,450,200.00")
    expect(html).toContain("$9,950,200.00")
    expect(html).toContain("Ledger Adjustment Delta")
    expect(html).toContain("1,500,000.00")
    expect(html).toContain("Ledger Conservation Verified: Debits Equal Credits")
  })
})
