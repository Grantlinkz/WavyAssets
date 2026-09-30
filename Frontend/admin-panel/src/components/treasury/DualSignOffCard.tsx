import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ShieldCheck,
  CheckCircle2,
  Unlock,
  Key,
  Copy,
  Check,
  X,
  AlertTriangle,
  Ban,
  Clock,
} from "lucide-react"
import {
  signOffWithdrawal,
  rejectAndRefundWithdrawal,
  type PendingWithdrawal,
} from "../../api/treasury"
import { useTreasuryStore } from "../../store/useTreasuryStore"
import { useAdminAuthStore, type Operator } from "../../store/useAdminAuthStore"
import { formatCurrency, formatTimestamp } from "../../lib/formatters"

interface DualSignOffCardProps {
  withdrawal?: PendingWithdrawal | null
  operator?: Operator | null
  onClose?: () => void
}

export const DualSignOffCard: React.FC<DualSignOffCardProps> = ({
  withdrawal: propWithdrawal,
  operator: propOperator,
  onClose: propOnClose,
}) => {
  const queryClient = useQueryClient()
  const store = useTreasuryStore()
  const selectedWithdrawal = propWithdrawal !== undefined ? propWithdrawal : (store.selectedWithdrawal ?? useTreasuryStore.getState().selectedWithdrawal)
  const closeSignOff = propOnClose ?? store.closeSignOff
  const authState = useAdminAuthStore()
  const operator = propOperator ?? authState.operator ?? useAdminAuthStore.getState().operator

  // Form states
  const [attestation1, setAttestation1] = useState(false)
  const [attestation2, setAttestation2] = useState(false)
  const [attestation3, setAttestation3] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [copied, setCopied] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isFormValid =
    attestation1 && attestation2 && attestation3 && passcode.trim().length >= 4

  const signOffMutation = useMutation({
    mutationFn: () => {
      if (!selectedWithdrawal) throw new Error("No withdrawal selected")
      return signOffWithdrawal({
        transactionId: selectedWithdrawal.id,
        action: "APPROVE",
        officerToken: passcode,
        complianceAttestations: {
          ibanMatchesMandate: attestation1,
          liquidityVerified: attestation2,
          voiceOrHardwareOtpConfirmed: attestation3,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-withdrawals"] })
      queryClient.invalidateQueries({ queryKey: ["settlement-ledger"] })
      closeSignOff()
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to execute dual sign-off authorization.")
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () => {
      if (!selectedWithdrawal) throw new Error("No withdrawal selected")
      return rejectAndRefundWithdrawal({
        transactionId: selectedWithdrawal.id,
        reason: rejectReason || "Rejected during FINMA dual-officer co-signature review",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-withdrawals"] })
      closeSignOff()
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to reject and refund withdrawal.")
    },
  })

  if (!selectedWithdrawal) return null

  const copyIban = () => {
    navigator.clipboard.writeText(selectedWithdrawal.beneficiaryIbanOrAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="flex flex-col bg-bg-panel border-2 border-gold-accent/60 rounded-lg p-4 shadow-2xl relative"
      data-testid="dual-signoff-card"
    >
      {/* Visual Anchor Tag */}
      <div className="absolute -top-3 left-4 bg-gold-accent text-bg-canvas px-2.5 py-0.5 rounded font-label-caps text-label-caps uppercase tracking-wider font-bold flex items-center gap-1 shadow">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Dual-Control Protocol Active</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between border-b border-border-subtle pb-3 pt-1">
        <div className="flex flex-col">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Second Officer Approval Needed
          </h2>
          <span className="font-mono tabular-nums text-body-sm text-status-warning font-semibold">
            Withdrawal #{selectedWithdrawal.id} • Threshold &gt;$100,000 USD Triggered
          </span>
        </div>
        <button
          type="button"
          onClick={closeSignOff}
          className="text-secondary hover:text-on-surface p-1 rounded hover:bg-state-hover transition-colors"
          title="Close Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {errorMessage && (
        <div className="mt-3 p-2 bg-status-danger/10 border border-status-danger/30 rounded text-status-danger text-body-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Content Container */}
      <div className="flex flex-col gap-4 mt-4">
        {/* Client & Transaction Summary Card */}
        <div className="bg-bg-elevated border border-border-subtle rounded p-3.5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-secondary uppercase">
                Authorized Account Holder
              </span>
              <span className="font-title-sm text-headline-md text-on-surface font-bold">
                {selectedWithdrawal.userName}
              </span>
              <span className="font-mono tabular-nums text-body-sm text-secondary">
                CIF: {selectedWithdrawal.userCif} • {selectedWithdrawal.userTier}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-label-caps text-label-caps text-secondary uppercase">
                Release Sum
              </span>
              <span className="font-mono tabular-nums text-headline-xl text-gold-accent font-bold">
                {formatCurrency(selectedWithdrawal.amount, selectedWithdrawal.currency)}
              </span>
              <span className="font-body-sm text-secondary">
                {selectedWithdrawal.currency} unencumbered
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle font-mono text-body-sm">
            <div>
              <span className="text-secondary/70 block text-[11px] uppercase font-label-caps">
                Settlement Rail
              </span>
              <span className="text-on-surface font-semibold">
                {selectedWithdrawal.settlementRail}
              </span>
            </div>
            <div>
              <span className="text-secondary/70 block text-[11px] uppercase font-label-caps">
                Routing Mode
              </span>
              <span className="text-status-success font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                {selectedWithdrawal.routingMode}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-secondary/70 block text-[11px] uppercase font-label-caps">
                Target Institution
              </span>
              <span className="text-on-surface font-semibold">
                {selectedWithdrawal.targetInstitution}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-secondary/70 block text-[11px] uppercase font-label-caps">
                Beneficiary IBAN / Destination
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-on-surface bg-bg-canvas px-2 py-1 rounded border border-border-subtle flex-1 truncate font-mono text-body-sm">
                  {selectedWithdrawal.beneficiaryIbanOrAddress}
                </span>
                <button
                  type="button"
                  onClick={copyIban}
                  className="px-2 py-1 bg-bg-canvas hover:bg-state-hover border border-border-subtle rounded text-body-sm text-secondary hover:text-on-surface flex items-center gap-1 transition-colors"
                  title="Copy Target Address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Whitelisted Destination Pill */}
          {selectedWithdrawal.isWhitelistedDestination && (
            <div className="flex items-center gap-2 p-2 bg-status-success/10 border border-status-success/30 rounded">
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
              <span className="font-title-sm text-body-sm text-status-success">
                Whitelisted Destination: Matches mandate file. Zero sanctions hit.
              </span>
            </div>
          )}
        </div>

        {/* Co-Signers Status Matrix */}
        <div className="flex flex-col gap-2 bg-bg-canvas border border-border-subtle p-3 rounded">
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
            Required Officer Dual-Control Status
          </span>

          {/* Officer 1 */}
          <div className="flex items-center justify-between p-2 rounded bg-bg-panel border border-border-subtle">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                  selectedWithdrawal.firstOfficerSignOff
                    ? "bg-status-success/20 text-status-success"
                    : "bg-bg-elevated text-secondary"
                }`}
              >
                {selectedWithdrawal.firstOfficerSignOff ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-title-sm text-body-sm text-on-surface">
                  Officer 1:{" "}
                  {selectedWithdrawal.firstOfficerSignOff
                    ? selectedWithdrawal.firstOfficerSignOff.officerName
                    : "Awaiting First Officer"}
                </span>
                {selectedWithdrawal.firstOfficerSignOff ? (
                  <span className="font-mono text-[11px] text-secondary">
                    {selectedWithdrawal.firstOfficerSignOff.officerRole} •{" "}
                    {selectedWithdrawal.firstOfficerSignOff.tokenType}
                  </span>
                ) : (
                  <span className="font-mono text-[11px] text-secondary">
                    Primary compliance review pending
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span
                className={`font-label-caps text-[10px] uppercase font-semibold ${
                  selectedWithdrawal.firstOfficerSignOff
                    ? "text-status-success"
                    : "text-status-warning"
                }`}
              >
                {selectedWithdrawal.firstOfficerSignOff
                  ? "Signed & Approved"
                  : "Pending Sign-Off"}
              </span>
              {selectedWithdrawal.firstOfficerSignOff?.signedAt && (
                <span className="font-mono tabular-nums text-[11px] text-secondary">
                  {formatTimestamp(selectedWithdrawal.firstOfficerSignOff.signedAt).split(" ")[1]}
                </span>
              )}
            </div>
          </div>

          {/* Officer 2: Current Operator */}
          <div className="flex items-center justify-between p-2 rounded bg-bg-elevated border-2 border-gold-accent/70">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gold-accent/20 text-gold-accent flex items-center justify-center shrink-0">
                <Unlock className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-title-sm text-body-sm text-gold-accent flex items-center gap-1 font-bold">
                  Officer 2: {operator?.name} (You)
                  <span className="bg-gold-accent/20 text-gold-accent text-[9px] px-1 rounded uppercase font-label-caps">
                    Current
                  </span>
                </span>
                <span className="font-mono text-[11px] text-secondary">
                  {operator?.role} • Session FIPS Active
                </span>
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="font-label-caps text-[10px] text-status-warning uppercase font-semibold animate-pulse">
                Awaiting Co-Sign
              </span>
              <span className="font-mono tabular-nums text-[11px] text-secondary">
                Ready for key
              </span>
            </div>
          </div>
        </div>

        {/* Mandatory Compliance Attestation Checkboxes */}
        <div className="flex flex-col gap-2">
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
            Mandatory Compliance Attestation (Complete All)
          </span>

          <label className="flex items-start gap-2.5 p-2 bg-bg-canvas hover:bg-bg-elevated border border-border-subtle rounded cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={attestation1}
              onChange={(e) => setAttestation1(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-gold-accent bg-bg-canvas border-border-subtle rounded"
            />
            <span className="font-body-sm text-body-sm text-on-surface">
              Destination IBAN &amp; SWIFT code strictly match client mandate agreement on file in Zurich secure repository.
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-2 bg-bg-canvas hover:bg-bg-elevated border border-border-subtle rounded cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={attestation2}
              onChange={(e) => setAttestation2(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-gold-accent bg-bg-canvas border-border-subtle rounded"
            />
            <span className="font-body-sm text-body-sm text-on-surface">
              Unencumbered liquidity verified: Client has{" "}
              <strong className="font-mono tabular-nums text-status-success font-semibold">
                {formatCurrency(selectedWithdrawal.availableCash || 8450200, "USD")}
              </strong>{" "}
              settled cash available.
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-2 bg-bg-canvas hover:bg-bg-elevated border border-border-subtle rounded cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={attestation3}
              onChange={(e) => setAttestation3(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-gold-accent bg-bg-canvas border-border-subtle rounded"
            />
            <span className="font-body-sm text-body-sm text-on-surface">
              Direct voice callback or cryptographic hardware OTP validated with family office managing representative.
            </span>
          </label>
        </div>

        {/* Hardware Security Token Input */}
        <div className="flex flex-col gap-1.5 bg-bg-elevated p-3 rounded border border-border-subtle">
          <label className="font-label-caps text-label-caps text-secondary uppercase tracking-wider flex items-center justify-between">
            <span>Officer FIPS Security Key / Token Passcode</span>
            <span className="text-gold-accent font-mono text-[11px]">Required for Release</span>
          </label>
          <div className="relative w-full">
            <Key className="w-4 h-4 text-secondary absolute left-2.5 top-2.5" />
            <input
              type="password"
              maxLength={8}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter 6-digit PIN"
              className="w-full bg-bg-canvas border border-border-subtle rounded pl-8 pr-3 py-1.5 font-mono text-body-md text-on-surface tracking-widest focus:border-gold-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Reject Reason Accordion if isRejecting */}
        {isRejecting && (
          <div className="flex flex-col gap-1.5 p-3 bg-status-danger/5 border border-status-danger/30 rounded">
            <label className="font-label-caps text-label-caps text-status-danger uppercase">
              Mandatory Rejection Explanation
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="State FINMA compliance or routing failure rationale..."
              rows={2}
              className="w-full bg-bg-canvas border border-border-subtle rounded p-2 text-body-sm text-on-surface focus:border-status-danger focus:outline-none"
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsRejecting(false)}
                className="px-2.5 py-1 text-body-sm text-secondary hover:text-on-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                onClick={() => rejectMutation.mutate()}
                className="px-3 py-1 bg-status-danger text-on-surface rounded font-title-sm text-body-sm disabled:opacity-50"
              >
                {rejectMutation.isPending ? "Executing..." : "Confirm Rejection & Refund"}
              </button>
            </div>
          </div>
        )}

        {/* Action Button Controls */}
        {!isRejecting && (
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsRejecting(true)}
              className="flex-1 bg-bg-canvas hover:bg-status-danger/10 border border-status-danger text-status-danger font-title-sm text-body-sm py-2 rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <Ban className="w-4 h-4" />
              <span>Reject &amp; Refund</span>
            </button>
            <button
              type="button"
              disabled={!isFormValid || signOffMutation.isPending}
              onClick={() => signOffMutation.mutate()}
              className="flex-[2] bg-gold-accent hover:bg-gold-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-bg-canvas font-title-sm text-body-sm py-2 rounded flex items-center justify-center gap-2 font-bold transition-all shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {signOffMutation.isPending
                  ? "Authorizing..."
                  : `Confirm & Release Funds (${formatCurrency(selectedWithdrawal.amount, selectedWithdrawal.currency)})`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
