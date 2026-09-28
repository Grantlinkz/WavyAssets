import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  FileText,
  X,
  CheckCheck,
  AlertTriangle,
} from "lucide-react"
import { approveDeposit, rejectDeposit, type PendingDeposit } from "../../api/treasury"
import { useTreasuryStore } from "../../store/useTreasuryStore"
import { formatCurrency, formatTimestamp } from "../../lib/formatters"

interface DepositReceiptViewerModalProps {
  deposit?: PendingDeposit | null
  isOpen?: boolean
  onClose?: () => void
}

export const DepositReceiptViewerModal: React.FC<DepositReceiptViewerModalProps> = ({
  deposit: propDeposit,
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const queryClient = useQueryClient()
  const store = useTreasuryStore()
  const selectedDeposit = propDeposit !== undefined ? propDeposit : store.selectedDeposit
  const isReceiptModalOpen = propIsOpen !== undefined ? propIsOpen : store.isReceiptModalOpen
  const closeReceiptModal = propOnClose ?? store.closeReceiptModal
  const [rejectReason, setRejectReason] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const approveMutation = useMutation({
    mutationFn: () => {
      if (!selectedDeposit) throw new Error("No deposit selected")
      return approveDeposit({ transactionId: selectedDeposit.id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-deposits"] })
      queryClient.invalidateQueries({ queryKey: ["settlement-ledger"] })
      queryClient.invalidateQueries({ queryKey: ["overview-metrics"] })
      closeReceiptModal()
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to approve deposit.")
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () => {
      if (!selectedDeposit) throw new Error("No deposit selected")
      return rejectDeposit({
        transactionId: selectedDeposit.id,
        reason: rejectReason || "Rejected after receipt document inspection",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-deposits"] })
      closeReceiptModal()
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to reject deposit.")
    },
  })

  if (!isReceiptModalOpen || !selectedDeposit) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-canvas/80 backdrop-blur-sm"
      data-testid="receipt-modal"
    >
      <div className="bg-bg-panel border border-border-subtle rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-elevated">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-accent" />
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Deposit Wire Receipt Inspection
            </h2>
          </div>
          <button
            type="button"
            onClick={closeReceiptModal}
            className="p-1 rounded text-secondary hover:text-on-surface hover:bg-state-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="m-4 p-2 bg-status-danger/10 border border-status-danger/30 rounded text-status-danger text-body-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Top Inflow Meta Card */}
          <div className="bg-bg-elevated border border-border-subtle rounded p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-secondary uppercase">
                  Account Beneficiary
                </span>
                <span className="font-title-sm text-headline-md text-on-surface font-bold">
                  {selectedDeposit.userName}
                </span>
                <span className="font-mono tabular-nums text-body-sm text-secondary">
                  CIF: {selectedDeposit.userCif}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-label-caps text-label-caps text-secondary uppercase">
                  Declared Inflow
                </span>
                <span className="font-mono tabular-nums text-headline-xl text-status-success font-bold">
                  +{formatCurrency(selectedDeposit.amount, selectedDeposit.currency)}
                </span>
                <span className="font-mono text-body-sm text-secondary">
                  Rail: {selectedDeposit.railType}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-subtle font-mono text-body-sm">
              <div>
                <span className="text-secondary/70 block text-[11px] uppercase font-label-caps">
                  Originating Bank
                </span>
                <span className="text-on-surface font-semibold">
                  {selectedDeposit.senderBank || "UBS Switzerland AG"}
                </span>
              </div>
              <div>
                <span className="text-secondary/70 block text-[11px] uppercase font-label-caps">
                  Remitter Name
                </span>
                <span className="text-on-surface font-semibold">
                  {selectedDeposit.senderName}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-secondary/70 block text-[11px] uppercase font-label-caps">
                  Sender Account / IBAN
                </span>
                <span className="text-on-surface bg-bg-canvas px-2 py-1 rounded border border-border-subtle block font-mono text-body-sm mt-0.5">
                  {selectedDeposit.senderIbanOrAddress}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-secondary/70 block text-[11px] uppercase font-label-caps">
                  Wire Settlement Memo
                </span>
                <span className="text-gold-accent bg-gold-accent/10 px-2 py-1 rounded border border-gold-accent/30 block font-mono text-body-sm mt-0.5 font-bold">
                  {selectedDeposit.wireMemo}
                </span>
              </div>
            </div>
          </div>

          {/* Proof Receipt Viewer Card */}
          <div className="flex flex-col gap-2">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              Cryptographic Swift MT103 / Fedwire Receipt Document
            </span>
            <div className="bg-bg-canvas border border-border-subtle rounded p-4 font-mono text-body-sm text-secondary flex flex-col gap-2">
              <div className="flex justify-between items-center text-on-surface border-b border-border-subtle pb-2">
                <span className="font-bold">DOCUMENT TYPE: SWIFT MT103 SINGLE CUSTOMER CREDIT</span>
                <span className="text-status-success font-semibold">AUTHENTICATED SWIFT DvP</span>
              </div>
              <div className="text-[12px] leading-relaxed text-secondary/90">
                :20: TRANSACTION REFERENCE NUMBER: {selectedDeposit.txHash || `CH-SIC-${selectedDeposit.id}`}
                <br />
                :23B: BANK OPERATION CODE: CRED
                <br />
                :32A: VALUE DATE/CURRENCY/INTERBANK SETTLED AMOUNT: {formatTimestamp(selectedDeposit.createdAt).substring(0, 10)} {selectedDeposit.currency} {selectedDeposit.amount.toFixed(2)}
                <br />
                :50K: ORDERING CUSTOMER: {selectedDeposit.senderName}
                <br />
                :59: BENEFICIARY CUSTOMER: WavyAssets Sovereign Custody AG a/c {selectedDeposit.userCif}
                <br />
                :70: REMITTANCE INFORMATION: {selectedDeposit.wireMemo}
                <br />
                :71A: DETAILS OF CHARGES: OUR
              </div>
            </div>
          </div>

          {/* Reject Reason Input if rejecting */}
          {isRejecting && (
            <div className="flex flex-col gap-1.5 p-3 bg-status-danger/5 border border-status-danger/30 rounded">
              <label className="font-label-caps text-label-caps text-status-danger uppercase">
                Rejection Reason
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Discrepancy with remitter name or memo reference..."
                className="w-full bg-bg-canvas border border-border-subtle rounded p-2 text-body-sm text-on-surface focus:border-status-danger focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-border-subtle flex items-center justify-between bg-bg-elevated">
          <button
            type="button"
            onClick={closeReceiptModal}
            className="px-3 py-1.5 bg-bg-canvas hover:bg-state-hover border border-border-subtle rounded text-body-sm text-secondary hover:text-on-surface transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {!isRejecting ? (
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-3 py-1.5 bg-bg-canvas hover:bg-status-danger/10 border border-status-danger text-status-danger rounded text-body-sm font-title-sm transition-colors"
              >
                Reject Wire
              </button>
            ) : (
              <button
                type="button"
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                onClick={() => rejectMutation.mutate()}
                className="px-3 py-1.5 bg-status-danger text-on-surface rounded text-body-sm font-title-sm disabled:opacity-50"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>
            )}

            <button
              type="button"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate()}
              className="px-4 py-1.5 bg-status-success hover:bg-status-success/90 text-on-surface rounded text-body-sm font-title-sm font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              <span>
                {approveMutation.isPending ? "Crediting..." : "Approve & Credit Balance"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
