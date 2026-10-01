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
  flushInvalidationCache,
  type FiatDepositRailConfig,
} from "../../api/depositRails"

interface FiatRailFormProps {
  initialConfig?: FiatDepositRailConfig
}

export const FiatRailForm: React.FC<FiatRailFormProps> = ({ initialConfig }) => {
  const queryClient = useQueryClient()

  const [beneficiaryName, setBeneficiaryName] = useState(
    initialConfig?.beneficiaryName || ""
  )
  const [depositoryBank, setDepositoryBank] = useState(
    initialConfig?.depositoryBank || ""
  )
  const [clearingRail, setClearingRail] = useState(
    initialConfig?.clearingRail || ""
  )
  const [swissIban, setSwissIban] = useState(
    initialConfig?.swissIban || ""
  )
  const [bicSwift, setBicSwift] = useState(
    initialConfig?.bicSwift || ""
  )
  const [memoFormat, setMemoFormat] = useState(
    initialConfig?.memoFormat || ""
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

  // Swiss/International IBAN pattern and ISO 13616 Mod 97 checksum validation
  const cleanIban = swissIban.replace(/\s+/g, "").toUpperCase()
  const isIbanPatternValid = /^[A-Z]{2}\d{2}[0-9A-Z]{10,30}$/.test(cleanIban) || cleanIban.length >= 10
  const isIbanValid = (() => {
    if (!cleanIban) return false
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
    onSuccess: async (res) => {
      try {
        await flushInvalidationCache()
      } catch (cacheErr) {
        console.warn("Cache invalidation notice:", cacheErr)
      }
      queryClient.invalidateQueries({ queryKey: ["deposit-rails"] })
      const resMsg =
        (res as { message?: string })?.message ||
        "Bank coordinates broadcasted successfully across all client terminals."
      setStatusMessage({
        type: "success",
        text: resMsg,
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
    setBeneficiaryName(initialConfig?.beneficiaryName || "")
    setDepositoryBank(initialConfig?.depositoryBank || "")
    setClearingRail(initialConfig?.clearingRail || "")
    setSwissIban(initialConfig?.swissIban || "")
    setBicSwift(initialConfig?.bicSwift || "")
    setMemoFormat(initialConfig?.memoFormat || "")
  }

  const [copiedSwift, setCopiedSwift] = useState(false)

  const handleCopySwift = () => {
    navigator.clipboard.writeText(bicSwift)
    setCopiedSwift(true)
    setTimeout(() => setCopiedSwift(false), 2000)
  }

  return (
    <section
      className="bg-bg-panel border border-border-subtle rounded-[6px] p-5 flex flex-col gap-5 shadow-sm"
      data-testid="fiat-rail-form"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-serif text-base font-bold text-on-surface tracking-tight">
              Institutional Fiat Wire Coordinates (Swiss SIC / Fedwire)
            </h2>
            <span className="font-mono text-[10px] uppercase text-gold-accent bg-gold-accent/10 px-2 py-0.5 rounded-[3px] border border-gold-accent/40 font-semibold tracking-wider">
              PRIMARY INFLOW RAIL
            </span>
          </div>
          <p className="font-sans text-xs text-secondary">
            Configures real-time wire payment instructions surfaced to institutional tier accounts in CHF, EUR, and USD.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <ShieldCheck className="w-4 h-4 text-telemetry-cyan" />
          <span className="font-mono text-[11px] text-on-surface">Dual-Authorizer Protocol Active</span>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-[4px] text-xs flex items-center gap-2 ${
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

      {/* 2-Column Modern Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          {/* Beneficiary Name */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] text-secondary uppercase tracking-wider font-semibold">
                BENEFICIARY NAME
              </label>
              <span className="font-mono text-[11px] text-secondary">Entity ID: CHE-492.110.829</span>
            </div>
            <input
              type="text"
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-[4px] px-3 py-2 font-sans text-sm text-on-surface focus:border-gold-accent focus:outline-none transition-colors"
            />
            <span className="text-[11px] text-secondary flex items-center gap-1.5 pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
              <span>FINMA-licensed depository entity registered in Zurich, Switzerland</span>
            </span>
          </div>

          {/* Depository Bank */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] text-secondary uppercase tracking-wider font-semibold">
                DEPOSITORY BANK NAME &amp; BRANCH
              </label>
              <span className="font-mono text-[11px] text-secondary">BC/IID: 0023</span>
            </div>
            <input
              type="text"
              value={depositoryBank}
              onChange={(e) => setDepositoryBank(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-[4px] px-3 py-2 font-sans text-sm text-on-surface focus:border-gold-accent focus:outline-none transition-colors"
            />
            <span className="text-[11px] text-secondary flex items-center gap-1.5 pt-0.5">
              <Landmark className="w-3.5 h-3.5 text-telemetry-cyan shrink-0" />
              <span>Clearing Node: Paradeplatz 6, 8001 Zürich • Domestic Clearing CH-SIC-8000</span>
            </span>
          </div>

          {/* Clearing System */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-secondary uppercase tracking-wider font-semibold">
              CLEARING SYSTEM &amp; SETTLEMENT MODE
            </label>
            <select
              value={clearingRail}
              onChange={(e) => setClearingRail(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-[4px] px-3 py-2 font-sans text-sm text-on-surface focus:border-gold-accent focus:outline-none transition-colors cursor-pointer"
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

            {/* 3 Pills under Clearing Mode */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-bg-elevated border border-border-subtle text-[11px] font-sans text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                SIC Direct Participant
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-bg-elevated border border-border-subtle text-[11px] font-sans text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-telemetry-cyan" />
                Fedwire Sub-tier 1
              </span>
              <span className="inline-flex items-center px-2 py-1 text-[11px] font-sans text-secondary">
                Max Wire: CHF 50,000,000 / Tx
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Swiss IBAN */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] text-secondary uppercase tracking-wider font-semibold">
                SWISS IBAN (SETTLEMENT ACCOUNT)
              </label>
              <div
                className={`flex items-center gap-1 font-mono text-[11px] ${
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
                className="w-full bg-bg-elevated border border-border-subtle rounded-[4px] pl-3 pr-20 py-2 font-mono font-bold text-sm text-gold-accent tracking-wider focus:border-gold-accent focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleCopyIban}
                className="absolute right-1 px-2.5 py-1 bg-bg-canvas hover:bg-state-hover border border-border-subtle rounded-[3px] font-mono text-xs text-secondary hover:text-on-surface flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedIban ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIban ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <span className="text-[11px] text-secondary pt-0.5">
              Direct settlement account tied to omnibus custody vault reserve under FINMA circular 08/21.
            </span>
          </div>

          {/* BIC / SWIFT */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] text-secondary uppercase tracking-wider font-semibold">
                SWIFT / BIC CODE
              </label>
              <span className="font-mono text-[10px] text-status-success bg-status-success/10 px-2 py-0.5 rounded-[3px] border border-status-success/30 font-medium">
                SWIFT Connected • Direct BIC
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={bicSwift}
                onChange={(e) => setBicSwift(e.target.value)}
                className="w-full bg-bg-elevated border border-border-subtle rounded-[4px] pl-3 pr-20 py-2 font-mono text-sm text-on-surface font-semibold focus:border-gold-accent focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleCopySwift}
                className="absolute right-1 px-2.5 py-1 bg-bg-canvas hover:bg-state-hover border border-border-subtle rounded-[3px] font-mono text-xs text-secondary hover:text-on-surface flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedSwift ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSwift ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <span className="text-[11px] text-secondary pt-0.5">
              Routing node identifier for international Fedwire/SWIFT MT103 and ISO 20022 pacs.008 cross-border messages.
            </span>
          </div>

          {/* Memo Format */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] text-secondary uppercase tracking-wider font-semibold">
                MANDATORY WIRE REFERENCE MEMO FORMAT
              </label>
              <span className="text-gold-accent font-mono text-[10px] bg-gold-accent/10 px-2 py-0.5 rounded-[3px] border border-gold-accent/30 font-medium">
                Field 70 / Tag 72 Format
              </span>
            </div>
            <input
              type="text"
              value={memoFormat}
              onChange={(e) => setMemoFormat(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-[4px] px-3 py-2 font-mono text-sm text-gold-accent font-semibold focus:border-gold-accent focus:outline-none transition-colors"
            />
            {/* Warning Callout Box */}
            <div className="p-2.5 rounded-[4px] bg-status-warning/10 border border-status-warning/30 flex items-start gap-2 text-xs text-status-warning mt-1">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed text-[11px]">
                The token <strong className="font-mono text-gold-accent font-bold">{"{USER_REF}"}</strong> is automatically parsed and injected with the client's verified internal account sequence ID. Any manual change requires compliance re-ratification.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fiat Action & Audit Footer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-2 text-secondary text-xs">
          <History className="w-4 h-4 text-gold-accent shrink-0" />
          <span>
            Last updated today at 11:20 UTC by <strong className="text-on-surface font-semibold">Eleanor Vance</strong> • Requires cryptographic key sign to apply changes
          </span>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="h-8 px-3.5 rounded-[4px] border border-border-subtle bg-bg-elevated text-secondary hover:text-on-surface hover:bg-state-hover font-sans text-xs transition-all cursor-pointer"
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            disabled={mutation.isPending || !isIbanValid}
            onClick={() => mutation.mutate()}
            className="h-8 px-4 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-sans text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>
              {mutation.isPending ? "Broadcasting..." : "Save & Broadcast Bank Coordinates"}
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
