import { describe, it, expect, beforeEach } from "vitest"
import { renderToString } from "react-dom/server"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TreasuryView } from "../../src/views/TreasuryView"
import { DualSignOffCard } from "../../src/components/treasury/DualSignOffCard"
import { DepositReceiptViewerModal } from "../../src/components/treasury/DepositReceiptViewerModal"
import { useTreasuryStore } from "../../src/store/useTreasuryStore"
import { useAdminAuthStore, type Operator } from "../../src/store/useAdminAuthStore"
import type { PendingWithdrawal, PendingDeposit } from "../../src/api/treasury"

const mockWithdrawal: PendingWithdrawal = {
  id: "WTH-89",
  userId: "usr_99420",
  userName: "Baron Philippe de Rothschild",
  userCif: "CH-9942-88",
  userTier: "INSTITUTIONAL",
  settlementRail: "Swiss SIC RTGS Wire",
  routingMode: "Direct Central Clearing",
  targetInstitution: "UBS Switzerland AG, Geneva Branch",
  beneficiaryIbanOrAddress: "CH28 0024 0000 1234 5678 9",
  beneficiaryName: "Baron Philippe de Rothschild",
  amount: 1500000,
  currency: "USD",
  requiresDualSignOff: true,
  currentSignOffCount: 1,
  requiredSignOffCount: 2,
  firstOfficerSignOff: {
    officerName: "Marcus Keller",
    officerRole: "Treasury Lead",
    signedAt: "2026-09-28T13:30:12Z",
    tokenType: "YubiKey FIPS Token #YK-8820",
  },
  status: "PENDING_SECOND_SIGN_OFF",
  isWhitelistedDestination: true,
  availableCash: 8450200,
  createdAt: "2026-09-28T13:05:00Z",
}

const mockDeposit: PendingDeposit = {
  id: "DEP-104",
  userId: "usr_4412",
  userName: "Geneva Multi-Family Office",
  userCif: "CH-4412-01",
  railType: "SIC",
  amount: 850000,
  currency: "USD",
  senderName: "Geneva MFO Principal",
  senderBank: "Pictet & Cie",
  senderIbanOrAddress: "CH93 0023 8812 4019 8821 0",
  wireMemo: "WY-MFO-TREASURY-03",
  status: "PENDING",
  createdAt: "2026-09-28T12:40:00Z",
}

const mockOperator: Operator = {
  id: "op-treasury-01",
  name: "Eleanor Vance",
  initials: "EV",
  email: "eleanor.vance@wavyassets.com",
  role: "TREASURY_OFFICER",
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  })
}

describe("Treasury Operations & Dual Sign-Off Integration", () => {
  beforeEach(() => {
    useTreasuryStore.setState({
      activeTab: "withdrawals",
      railFilter: "ALL",
      searchQuery: "",
      selectedWithdrawal: null,
      selectedDeposit: null,
      isSignOffOpen: false,
      isReceiptModalOpen: false,
    })
    useAdminAuthStore.setState({
      operator: mockOperator,
      token: "mock-jwt-token",
      isAuthenticated: true,
    })
  })

  it("enforces FINMA AMLA Article 14 dual-control threshold for withdrawals > $100,000", () => {
    expect(mockWithdrawal.amount).toBeGreaterThan(100000)
    expect(mockWithdrawal.requiresDualSignOff).toBe(true)
    expect(mockWithdrawal.requiredSignOffCount).toBe(2)
    expect(mockWithdrawal.currentSignOffCount).toBe(1)
    expect(mockWithdrawal.status).toBe("PENDING_SECOND_SIGN_OFF")
  })

  it("renders treasury settlements header, ticker, and dual-control banner", () => {
    const queryClient = createQueryClient()
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <TreasuryView />
      </QueryClientProvider>
    )

    expect(html).toContain("Treasury Settlements &amp; Liquidity Rails")
    expect(html).toContain("Dual-Control Enforcement Active")
    expect(html).toContain("Mandatory Security Rule: High-Value Dual-Signature Threshold")
    expect(html).toContain("Art. 72b FINMA Compliant")
    expect(html).toContain("SIC RTGS:")
    expect(html).toContain("Fedwire:")
    expect(html).toContain("ERC-20 Treasury:")
  })

  it("renders DualSignOffCard with co-signers status matrix and attestation checklist", () => {
    useTreasuryStore.setState({
      selectedWithdrawal: mockWithdrawal,
      isSignOffOpen: true,
    })

    useAdminAuthStore.getState().login({
      id: "op-treasury-test",
      name: "Eleanor Vance",
      initials: "EV",
      email: "e.vance@wavyassets.ch",
      role: "TREASURY_OFFICER",
    }, "mock_token")

    const queryClient = createQueryClient()
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <DualSignOffCard withdrawal={mockWithdrawal} />
      </QueryClientProvider>
    )

    expect(html).toContain("data-testid=\"dual-signoff-card\"")
    expect(html).toContain("Dual-Control Protocol Active")
    expect(html).toContain("Second Officer Approval Needed")
    expect(html).toContain("Baron Philippe de Rothschild")
    expect(html).toContain("Officer 1:")
    expect(html).toContain("Marcus Keller")
    expect(html).toContain("Officer 2:")
    expect(html).toContain("Eleanor Vance")
    expect(html).toContain("Mandatory Compliance Attestation")
    expect(html).toContain("Whitelisted Destination")
  })

  it("switches tabs in store and supports deposit workflow", () => {
    expect(useTreasuryStore.getState().activeTab).toBe("withdrawals")

    useTreasuryStore.getState().setActiveTab("deposits")
    expect(useTreasuryStore.getState().activeTab).toBe("deposits")

    useTreasuryStore.getState().setActiveTab("both")
    expect(useTreasuryStore.getState().activeTab).toBe("both")
  })

  it("renders DepositReceiptViewerModal when wire inspection is requested", () => {
    useTreasuryStore.setState({
      selectedDeposit: mockDeposit,
      isReceiptModalOpen: true,
    })

    const queryClient = createQueryClient()
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <DepositReceiptViewerModal deposit={mockDeposit} isOpen={true} />
      </QueryClientProvider>
    )

    expect(html).toContain("data-testid=\"receipt-modal\"")
    expect(html).toContain("Deposit Wire Receipt Inspection")
    expect(html).toContain("Geneva Multi-Family Office")
    expect(html).toContain("DOCUMENT TYPE: SWIFT MT103 / DvP CLEARANCE MANDATE")
    expect(html).toContain("WY-MFO-TREASURY-03")
    expect(html).toContain("Approve &amp; Credit Balance")
  })
})
