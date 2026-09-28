import { describe, it, expect, beforeEach } from "vitest"
import { renderToString } from "react-dom/server"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DepositRailsView } from "../../src/views/DepositRailsView"
import { FiatRailForm } from "../../src/components/deposit-rails/FiatRailForm"
import { CryptoVaultMatrix } from "../../src/components/deposit-rails/CryptoVaultMatrix"
import { DepositQrModal } from "../../src/components/deposit-rails/DepositQrModal"
import { useDepositRailsStore } from "../../src/store/useDepositRailsStore"
import type { DepositRailsData } from "../../src/api/depositRails"

const mockRailsData: DepositRailsData = {
  fiatRail: {
    beneficiaryName: "WavyAssets Sovereign Custody AG",
    depositoryBank: "UBS Switzerland AG, Zurich Paradeplatz",
    clearingRail: "Swiss SIC RTGS or Fedwire DvP (Gross Instantaneous)",
    swissIban: "CH93 0023 8812 4019 8821 0",
    bicSwift: "UBSWCHZH80A",
    memoFormat: "WY-{USER_REF}-TREASURY-03",
  },
  cryptoRails: [
    {
      id: "crypto-usdc",
      asset: "USDC",
      name: "USD Coin",
      network: "Ethereum ERC-20",
      vaultAddress: "0x71C2B81F28b693240eF8681A127397B1cda44982",
      minDepositUsd: 500,
      confirmations: 12,
      confirmationTimeEst: "~3 mins",
      isActive: true,
    },
    {
      id: "crypto-btc",
      asset: "BTC",
      name: "Bitcoin Native",
      network: "SegWit (Bech32 Native)",
      vaultAddress: "bc1q4k8r89w9p2lmnx7a6k89104c8e7w10993f",
      minDepositUsd: 500,
      confirmations: 3,
      confirmationTimeEst: "~30 mins",
      isActive: true,
    },
  ],
  telemetry: {
    broadcasterConnected: true,
    wsLatencyMs: 14,
    activeTerminalsCount: 1429,
    hsmStatus: "Gemalto SafeNet Luna 7",
    configVersion: "v4.88.2-CH",
  },
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

describe("Global Deposit Rails Command Integration", () => {
  beforeEach(() => {
    useDepositRailsStore.setState({
      isQrModalOpen: false,
      qrModalData: null,
      isTestingMesh: false,
      testMeshResult: null,
      isFlushingCache: false,
      flushCacheMessage: null,
      fiatFormDraft: null,
    })
  })

  it("renders global deposit rails header and diagnostic telemetry strip", () => {
    const queryClient = createQueryClient()
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <DepositRailsView />
      </QueryClientProvider>
    )

    expect(html).toContain("Global Deposit Coordinates")
    expect(html).toContain("Production Inflow Stream")
    expect(html).toContain("Broadcaster Bridge")
    expect(html).toContain("Live Broadcast Connected")
    expect(html).toContain("WebSocket Sync Latency")
    expect(html).toContain("Ledger Verification HSM")
    expect(html).toContain("FIPS 140-2 Level 3")
  })

  it("renders FiatRailForm with Swiss IBAN and Mod 97 validation", () => {
    const queryClient = createQueryClient()
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <FiatRailForm initialConfig={mockRailsData.fiatRail} />
      </QueryClientProvider>
    )

    expect(html).toContain("data-testid=\"fiat-rail-form\"")
    expect(html).toContain("Institutional Fiat Wire Coordinates (Swiss SIC / Fedwire)")
    expect(html).toContain("WavyAssets Sovereign Custody AG")
    expect(html).toContain("CH93 0023 8812 4019 8821 0")
    expect(html).toContain("UBSWCHZH80A")
    expect(html).toContain("Valid Checksum (Mod 97)")
    expect(html).toContain("Save &amp; Broadcast Bank Coordinates")
  })

  it("renders crypto cold storage vault matrix with assets and networks", () => {
    const queryClient = createQueryClient()
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <CryptoVaultMatrix rails={mockRailsData.cryptoRails} />
      </QueryClientProvider>
    )

    expect(html).toContain("data-testid=\"crypto-vault-matrix\"")
    expect(html).toContain("Cryptographic Vault Inflow Matrix (Cold Storage)")
    expect(html).toContain("data-testid=\"crypto-rail-row-USDC\"")
    expect(html).toContain("data-testid=\"crypto-rail-row-BTC\"")
    expect(html).toContain("Ethereum ERC-20")
    expect(html).toContain("SegWit (Bech32 Native)")
    expect(html).toContain("Audit HSM")
  })

  it("renders DepositQrModal when QR inspection is requested in store", () => {
    const qrData = {
      asset: "USDC",
      network: "Ethereum ERC-20",
      address: "0x71C2B81F28b693240eF8681A127397B1cda44982",
    }
    useDepositRailsStore.setState({
      isQrModalOpen: true,
      qrModalData: qrData,
    })

    const html = renderToString(<DepositQrModal data={qrData} isOpen={true} />)

    expect(html).toContain("data-testid=\"qr-modal\"")
    expect(html).toContain("USDC")
    expect(html).toContain("Depository QR")
    expect(html).toContain("Ethereum ERC-20")
    expect(html).toContain("0x71C2B81F28b693240eF8681A127397B1cda44982")
  })
})
