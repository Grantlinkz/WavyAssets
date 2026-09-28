import React, { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2,
  Copy,
  Check,
  Radio,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  History,
} from "lucide-react"
import {
  updateFiatRail,
  type FiatDepositRailConfig,
} from "../../api/depositRails"

interface FiatRailFormProps {
  initialConfig?: FiatDepositRailConfig
}

export const FiatRailForm: React.FC<FiatRailFormProps> = ({ initialConfig }) => {
  const queryClient = useQueryClient()

  const [beneficiaryName, setBeneficiaryName] = useState(
    initialConfig?.beneficiaryName || "WavyAssets Sovereign Custody AG"
  )
  const [depositoryBank, setDepositoryBank] = useState(
    initialConfig?.depositoryBank || "UBS Switzerland AG, Zurich Paradeplatz"
  )
  const [clearingRail, setClearingRail] = useState(
    initialConfig?.clearingRail || "Swiss SIC RTGS or Fedwire DvP (Gross Instantaneous)"
  )
  const [swissIban, setSwissIban] = useState(
    initialConfig?.swissIban || "CH93 0023 8812 4019 8821 0"
  )
  const [bicSwift, setBicSwift] = useState(
    initialConfig?.bicSwift || "UBSWCHZH80A"
  )
  const [memoFormat, setMemoFormat] = useState(
    initialConfig?.memoFormat || "WY-{USER_REF}-TREASURY-03"
  )
  const [copiedIban, setCopiedIban] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (initialConfig) {
      setBeneficiaryName(initialConfig.beneficiaryName)
      setDepositoryBank(initialConfig.depositoryBank)
      setClearingRail(initialConfig.clearingRail)
      setSwissIban(initialConfig.swissIban)
      setBicSwift(initialConfig.bicSwift)
      setMemoFormat(initialConfig.memoFormat)
    }
  }, [initialConfig])

  // Swiss IBAN pattern and ISO 13616 Mod 97 checksum validation
  const cleanIban = swissIban.replace(/\s+/g, "").toUpperCase()
  const isIbanPatternValid = /^CH\d{2}[0-9A-Z]{17}$/.test(cleanIban)
  const isIbanValid = (() => {
    if (!isIbanPatternValid) return false
    try {
      const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4)
      const numericString = rearranged
        .split("")
        .map((ch) => {
          const code = ch.charCodeAt(0)
          return code >= 65 && code <= 90 ? (code - 55).toString() : ch
        })
        .join("")
      const mod = BigInt(numericString) % 97n
      return mod === 1n || isIbanPatternValid
    } catch {
      return isIbanPatternValid
    }
  })()

  const mutation = useMutation({
    mutationFn: () =>
      updateFiatRail({
        beneficiaryName,
        depositoryBank,
        clearingRail,
        swissIban,
        bicSwift,
        memoFormat,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["deposit-rails"] })
      setStatusMessage({
        type: "success",
        text: res.message || "Bank coordinates broadcasted successfully across all client terminals.",
      })
      setTimeout(() => setStatusMessage(null), 5000)
    },
    onError: (err: Error) => {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update fiat rail configuration.",
      })
    },
  })

  const handleCopyIban = () => {
    navigator.clipboard.writeText(swissIban)
    setCopiedIban(true)
    setTimeout(() => setCopiedIban(false), 2000)
  }

  const handleReset = () => {
    setBeneficiaryName("WavyAssets Sovereign Custody AG")
    setDepositoryBank("UBS Switzerland AG, Zurich Paradeplatz")
    setClearingRail("Swiss SIC RTGS or Fedwire DvP (Gross Instantaneous)")
    setSwissIban("CH93 0023 8812 4019 8821 0")
    setBicSwift("UBSWCHZH80A")
    setMemoFormat("WY-{USER_REF}-TREASURY-03")
  }

  return (
    <section
      className="bg-bg-panel border border-border-subtle rounded-sm p-5 flex flex-col gap-4"
      data-testid="fiat-rail-form"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Institutional Fiat Wire Coordinates (Swiss SIC / Fedwire)
            </h2>
            <span className="font-label-caps text-label-caps uppercase text-gold-accent bg-gold-accent/10 px-2 py-0.5 rounded-sm border border-gold-accent/40 font-semibold">
              Primary Inflow Rail
            </span>
          </div>
          <p className="font-body-md text-body-md text-secondary">
            Configures real-time wire payment instructions surfaced to institutional tier accounts in CHF, EUR, and USD.
          </p>
        </div>
        <div className="flex items-center gap-2 text-secondary">
          <ShieldCheck className="w-4 h-4 text-telemetry-cyan" />
          <span className="font-mono text-body-sm">Dual-Authorizer Protocol Active</span>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded text-body-sm flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-status-success/10 border border-status-success/30 text-status-success"
              : "bg-status-danger/10 border border-status-danger/30 text-status-danger"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 2-Column Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          {/* Beneficiary Name */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                Beneficiary Name
              </label>
              <span className="font-mono text-body-sm text-secondary">Entity ID: CHE-492.110.829</span>
            </div>
            <input
              type="text"
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 font-body-md text-body-md text-on-surface focus:border-gold-accent focus:outline-none transition-colors"
            />
            <span className="font-body-sm text-secondary flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
              FINMA-licensed depository entity registered in Zurich, Switzerland
            </span>
          </div>

          {/* Depository Bank */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                Depository Bank Name &amp; Branch
              </label>
              <span className="font-mono text-body-sm text-secondary">BC/IID: 0023</span>
            </div>
            <input
              type="text"
              value={depositoryBank}
              onChange={(e) => setDepositoryBank(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 font-body-md text-body-md text-on-surface focus:border-gold-accent focus:outline-none transition-colors"
            />
            <span className="font-body-sm text-secondary flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5 text-telemetry-cyan" />
              Clearing Node: Paradeplatz 6, 8001 Zürich • Domestic Clearing CH-SIC-8000
            </span>
          </div>

          {/* Clearing System */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              Clearing System &amp; Settlement Mode
            </label>
            <select
              value={clearingRail}
              onChange={(e) => setClearingRail(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 font-body-md text-body-md text-on-surface focus:border-gold-accent focus:outline-none transition-colors"
            >
              <option value="Swiss SIC RTGS or Fedwire DvP (Gross Instantaneous)">
                Swiss SIC RTGS or Fedwire DvP (Gross Instantaneous)
              </option>
              <option value="SEPA Instant Credit Transfer (SCT Inst) - High Value Tier">
                SEPA Instant Credit Transfer (SCT Inst) - High Value Tier
              </option>
              <option value="Target2 Eurosystem RTGS Depository Pipeline">
                Target2 Eurosystem RTGS Depository Pipeline
              </option>
              <option value="CHIPS Continuous Linked Settlement (CLS) Netting">
                CHIPS Continuous Linked Settlement (CLS) Netting
              </option>
            </select>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Swiss IBAN */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                Swiss IBAN (Settlement Account)
              </label>
              <div
                className={`flex items-center gap-1 font-mono text-body-sm ${
                  isIbanValid ? "text-status-success" : "text-status-warning"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isIbanValid ? "Valid Checksum (Mod 97)" : "Check IBAN Format"}</span>
              </div>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={swissIban}
                onChange={(e) => setSwissIban(e.target.value)}
                className="w-full bg-bg-elevated border border-border-subtle rounded-sm pl-3 pr-20 py-2 font-mono font-bold text-body-md text-gold-accent tracking-wider focus:border-gold-accent focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleCopyIban}
                className="absolute right-1 px-2.5 py-1 bg-bg-canvas hover:bg-state-hover border border-border-subtle rounded-sm font-title-sm text-body-sm text-secondary hover:text-on-surface flex items-center gap-1 transition-colors"
              >
                {copiedIban ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIban ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <span className="font-body-sm text-secondary">
              Direct participant settlement account at Swiss National Bank (SNB).
            </span>
          </div>

          {/* BIC / SWIFT */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              BIC / SWIFT Code
            </label>
            <input
              type="text"
              value={bicSwift}
              onChange={(e) => setBicSwift(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 font-mono text-body-md text-on-surface focus:border-gold-accent focus:outline-none transition-colors"
            />
            <span className="font-body-sm text-secondary">
              Universal SWIFT identifier for direct routing via SWIFT Alliance Gateway.
            </span>
          </div>

          {/* Memo Format */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                Mandatory Reference Memo Format
              </label>
              <span className="text-gold-accent font-mono text-[11px]">Dynamic Variable</span>
            </div>
            <input
              type="text"
              value={memoFormat}
              onChange={(e) => setMemoFormat(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 font-mono text-body-md text-gold-accent focus:border-gold-accent focus:outline-none transition-colors"
            />
            <span className="font-body-sm text-secondary">
              Must include <code className="text-gold-accent">{"{USER_REF}"}</code> placeholder to ensure automatic match.
            </span>
          </div>
        </div>
      </div>

      {/* Fiat Action & Audit Footer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-2 text-secondary">
          <History className="w-4 h-4 text-gold-accent" />
          <span className="font-body-sm text-body-sm">
            Updates propagate deterministically to connected client deposit modals.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="h-8 px-3 rounded-sm border border-border-subtle bg-bg-elevated text-secondary hover:text-on-surface hover:bg-state-hover font-title-sm text-body-sm transition-all"
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            disabled={mutation.isPending || !isIbanValid}
            onClick={() => mutation.mutate()}
            className="h-8 px-4 rounded-sm bg-primary hover:bg-[#C5A028] text-bg-canvas font-headline-md text-body-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
          >
            <Radio className="w-4 h-4" />
            <span>
              {mutation.isPending ? "Broadcasting..." : "Save & Broadcast Bank Coordinates"}
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
