import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle,
  Copy,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Power,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { useAdminNavStore } from "../../store/useAdminNavStore"
import { useEmergencyStore, REQUIRED_FREEZE_PHRASE, MIN_JUSTIFICATION_LENGTH } from "../../store/useEmergencyStore"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import { executePlatformFreeze } from "../../api/emergency"

interface EmergencyFreezeModalProps {
  isOpen?: boolean
}

export const EmergencyFreezeModal: React.FC<EmergencyFreezeModalProps> = ({ isOpen }) => {
  const queryClient = useQueryClient()
  const { operator } = useAdminAuthStore()
  const { isEmergencyStopModalOpen, setEmergencyStopModalOpen } = useAdminNavStore()
  const {
    verificationInput,
    setVerificationInput,
    justificationInput,
    setJustificationInput,
    setIsPlatformFrozen,
    setFreezeStatus,
    resetForm,
  } = useEmergencyStore()

  const [copied, setCopied] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isPhraseMatched = verificationInput.trim() === REQUIRED_FREEZE_PHRASE
  const isJustificationValid = justificationInput.trim().length >= MIN_JUSTIFICATION_LENGTH
  const canExecute = isPhraseMatched && isJustificationValid

  const freezeMutation = useMutation({
    mutationFn: executePlatformFreeze,
    onSuccess: (data) => {
      setIsPlatformFrozen(true)
      setFreezeStatus(data)
      setEmergencyStopModalOpen(false)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ["emergency-status"] })
      queryClient.invalidateQueries({ queryKey: ["overview-metrics"] })
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to trigger emergency platform freeze")
    },
  })

  const showModal = isOpen !== undefined ? isOpen : isEmergencyStopModalOpen
  if (!showModal) return null

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(REQUIRED_FREEZE_PHRASE)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleExecute = () => {
    if (!canExecute) return
    setErrorMessage(null)
    freezeMutation.mutate({
      verificationPhrase: verificationInput.trim(),
      justification: justificationInput.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-canvas/85 backdrop-blur-[6px] overflow-y-auto"
      data-testid="emergency-freeze-modal"
    >
      {/* Freeze Dialog Box: 540px width, #0F141F carbon, 2px solid red border */}
      <div
        className="w-full max-w-[540px] bg-bg-panel border border-status-danger rounded-[4px] shadow-2xl flex flex-col overflow-hidden my-auto"
        style={{
          boxShadow: "0 0 0 2px #EF4444, 0 20px 48px rgba(0, 0, 0, 0.85)",
        }}
      >
        {/* Modal Header */}
        <div className="bg-bg-elevated px-4 py-3 flex flex-col gap-1 border-b border-border-subtle">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[4px] bg-status-danger/15 flex items-center justify-center shrink-0 border border-status-danger/30">
                <ShieldAlert className="w-5 h-5 text-status-danger" />
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-sm sm:text-base text-status-danger uppercase tracking-tight font-bold truncate">
                  Emergency Platform Freeze
                </h2>
                <span className="font-mono text-[10px] text-secondary uppercase tracking-wider">
                  High Risk Immediate Mitigation Dialog
                </span>
              </div>
            </div>
            <span className="shrink-0 font-mono text-[10px] px-2 py-0.5 rounded-[2px] bg-status-danger/10 text-status-danger tracking-wider uppercase font-semibold border border-status-danger/30">
              FINMA ART. 88
            </span>
          </div>

          <div className="flex items-center justify-between mt-1 text-secondary font-mono text-xs">
            <span>
              PROTOCOL: <strong className="text-on-surface">HALT-ZERO-TIER1</strong>
            </span>
            <span className="flex items-center gap-1.5 text-status-danger font-semibold">
              <span className="w-2 h-2 rounded-full bg-status-danger animate-pulse" />
              DEFCON CUSTODY LEVEL 1
            </span>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 flex flex-col gap-3 text-on-surface">
          {errorMessage && (
            <div className="p-2.5 bg-status-danger/10 border border-status-danger/40 rounded-[4px] text-xs text-status-danger font-mono">
              {errorMessage}
            </div>
          )}

          {/* Warning Impact Sequence Checklist */}
          <div className="bg-status-danger/10 border border-status-danger/30 rounded-[4px] p-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-status-danger font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Immediate Operational Execution Sequence:</span>
            </div>
            <ol className="flex flex-col gap-1 mt-1 text-[11px] text-secondary font-mono">
              <li className="flex items-start gap-2">
                <span className="text-[10px] text-status-danger bg-status-danger/10 px-1 py-0.2 rounded-[2px] font-bold">
                  01
                </span>
                <span>
                  <strong className="text-on-surface">Terminate Sessions:</strong> Forcefully disconnect all client sessions &amp; kill telemetry webhooks.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[10px] text-status-danger bg-status-danger/10 px-1 py-0.2 rounded-[2px] font-bold">
                  02
                </span>
                <span>
                  <strong className="text-on-surface">Lock VIP Cards:</strong> Transmit emergency stop to all active VIP cards worldwide.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[10px] text-status-danger bg-status-danger/10 px-1 py-0.2 rounded-[2px] font-bold">
                  03
                </span>
                <span>
                  <strong className="text-on-surface">Freeze Settlement Rails:</strong> Immediately abort pending SWIFT wires &amp; pause MPC/HSM multi-sig signing.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[10px] text-status-danger bg-status-danger/10 px-1 py-0.2 rounded-[2px] font-bold">
                  04
                </span>
                <span>
                  <strong className="text-on-surface">Enforce Read-Only APIs:</strong> Revoke trading/transfer API tokens across client gateway endpoints.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[10px] text-status-danger bg-status-danger/10 px-1 py-0.2 rounded-[2px] font-bold">
                  05
                </span>
                <span>
                  <strong className="text-on-surface">Executive Dispatch:</strong> Transmit encrypted FINMA incident broadcast to Executive Committee.
                </span>
              </li>
            </ol>
          </div>

          {/* Telemetry Snapshot Prior to Halt */}
          <div className="bg-bg-canvas border border-border-subtle rounded-[4px] p-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-[10px] text-secondary uppercase tracking-wider">
              <span>Pre-Halt Telemetry Snapshot</span>
              <span className="text-telemetry-cyan font-semibold">T-00:00:00 CAPTURED</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-bg-elevated p-2 rounded-[2px] flex flex-col">
                <span className="font-mono text-[10px] text-secondary">Active Web Sessions</span>
                <span className="font-mono text-on-surface font-semibold">1,429 Connected</span>
              </div>
              <div className="bg-bg-elevated p-2 rounded-[2px] flex flex-col">
                <span className="font-mono text-[10px] text-secondary">VIP Obsidian Cards</span>
                <span className="font-mono text-status-warning font-semibold">38 Active Worldwide</span>
              </div>
              <div className="bg-bg-elevated p-2 rounded-[2px] flex flex-col">
                <span className="font-mono text-[10px] text-secondary">Pending Wire Queue</span>
                <span className="font-mono text-status-danger font-semibold">2 Wires ($4.7M USD)</span>
              </div>
              <div className="bg-bg-elevated p-2 rounded-[2px] flex flex-col">
                <span className="font-mono text-[10px] text-secondary">Vault Signing Gateways</span>
                <span className="font-mono text-status-danger font-semibold">HSM Auto-Sign Standby</span>
              </div>
            </div>
          </div>

          {/* Verification Phrase Confirmation Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface">
                Type exact verification phrase:
              </label>
              <span
                className={`font-mono text-xs flex items-center gap-1 ${
                  isPhraseMatched ? "text-status-success" : "text-secondary"
                }`}
                data-testid="phrase-status"
              >
                {isPhraseMatched ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Phrase Matched</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Awaiting Input</span>
                  </>
                )}
              </span>
            </div>
            <div className="bg-bg-canvas border border-border-subtle px-3 py-1.5 rounded-[4px] flex items-center justify-between select-all">
              <code className="font-mono text-xs text-status-danger tracking-wider font-bold">
                {REQUIRED_FREEZE_PHRASE}
              </code>
              <button
                type="button"
                onClick={handleCopyPhrase}
                className="text-secondary hover:text-on-surface p-1 rounded-[2px] cursor-pointer"
                title="Copy phrase"
                data-testid="copy-phrase-btn"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <input
              type="text"
              autoComplete="off"
              value={verificationInput}
              onChange={(e) => setVerificationInput(e.target.value)}
              placeholder="CONFIRM EMERGENCY PLATFORM FREEZE"
              className={`w-full bg-bg-canvas border rounded-[4px] px-3 py-1.5 font-mono text-xs uppercase tracking-wide focus:outline-none transition-colors ${
                isPhraseMatched
                  ? "border-status-success text-status-success"
                  : "border-border-subtle text-on-surface focus:border-status-danger"
              }`}
              data-testid="verification-input"
            />
          </div>

          {/* Mandatory FINMA Reason Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface">
                Incident Justification (Swiss FINMA Statutory Record):
              </label>
              <span
                className={`font-mono text-[10px] ${
                  isJustificationValid ? "text-status-success" : "text-secondary"
                }`}
                data-testid="char-counter"
              >
                {justificationInput.trim().length} / {MIN_JUSTIFICATION_LENGTH} min required
              </span>
            </div>
            <textarea
              rows={3}
              value={justificationInput}
              onChange={(e) => setJustificationInput(e.target.value)}
              placeholder="Document detailed cause for emergency shutdown (e.g. Unidentified anomalous outbound withdrawal spike on node DC1 / suspected HSM key compromise)..."
              className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-2.5 font-mono text-xs text-on-surface focus:outline-none focus:border-status-danger placeholder:text-secondary/50 resize-none"
              data-testid="freeze-reason-input"
            />
          </div>

          {/* Dual-Control Officer Attestation */}
          <div className="bg-bg-elevated border border-border-subtle p-2.5 rounded-[4px] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldCheck className="w-5 h-5 text-gold-accent shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-on-surface truncate">
                  {operator?.name} {operator?.role ? `• [${operator.role}]` : ""}
                </span>
                <span className="font-mono text-[10px] text-secondary truncate">
                  {operator?.email}
                </span>
              </div>
            </div>
            <span className="shrink-0 font-mono text-[10px] text-status-success bg-status-success/15 border border-status-success/40 px-2 py-0.5 rounded-[2px] font-semibold">
              AUTHORIZED
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-bg-elevated border-t border-border-subtle px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setEmergencyStopModalOpen(false)
              resetForm()
            }}
            className="px-3.5 py-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary hover:text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            data-testid="cancel-freeze-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel &amp; Abort Action</span>
          </button>
          <button
            type="button"
            disabled={!canExecute || freezeMutation.isPending}
            onClick={handleExecute}
            className={`px-4 py-1.5 rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              canExecute && !freezeMutation.isPending
                ? "bg-status-danger text-white hover:bg-red-600 shadow-status-danger/30"
                : "bg-status-danger/30 text-on-surface/40 cursor-not-allowed border border-border-subtle"
            }`}
            data-testid="execute-freeze-btn"
          >
            {freezeMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Broadcasting Lockdown...</span>
              </>
            ) : (
              <>
                <Power className="w-3.5 h-3.5" />
                <span>Execute Platform Freeze</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
