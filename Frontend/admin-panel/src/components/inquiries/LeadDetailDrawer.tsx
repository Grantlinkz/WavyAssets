import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  X,
  ShieldCheck,
  UserCheck,
  Mail,
  Send,
  Globe,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useAdminNavStore } from "../../store/useAdminNavStore"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import { updateInquiryStatus, type InquiryStatus } from "../../api/inquiries"

export interface LeadDetailDrawerProps {
  isDecrypted?: boolean
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ isDecrypted = true }) => {
  const {
    isLeadDetailDrawerOpen,
    closeLeadDrawer,
    selectedInquiry,
    openConvertModal,
  } = useAdminNavStore()
  const { hasPermission } = useAdminAuthStore()
  const queryClient = useQueryClient()

  const [status, setStatus] = useState<InquiryStatus>(
    selectedInquiry?.status || "NEW"
  )
  const [operatorNotes, setOperatorNotes] = useState(
    selectedInquiry?.notes || ""
  )
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Sync state if selectedInquiry changes
  React.useEffect(() => {
    if (selectedInquiry) {
      setStatus(selectedInquiry.status)
      setOperatorNotes(selectedInquiry.notes || "")
      setSaveSuccess(false)
      setSaveError(null)
    }
  }, [selectedInquiry])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedInquiry) return
      return updateInquiryStatus(selectedInquiry.id, status, operatorNotes)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] })
      setSaveSuccess(true)
      setSaveError(null)
      setTimeout(() => setSaveSuccess(false), 3000)
    },
    onError: (err: Error) => {
      setSaveError(err.message || "Failed to save workflow stage and notes.")
    },
  })

  if (!isLeadDetailDrawerOpen || !selectedInquiry) return null

  const canConvert = hasPermission("canConvertLeads")

  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
      onClick={closeLeadDrawer}
      data-testid="lead-drawer-backdrop"
    >
      <div
        className="w-full max-w-md bg-bg-panel border-l border-border-subtle h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
        data-testid="lead-detail-drawer"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-border-subtle flex items-start justify-between bg-bg-elevated/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-gold-accent font-semibold">
                {selectedInquiry.dossierId}
              </span>
              {selectedInquiry.isDomainVerified && (
                <span className="font-mono text-[10px] text-status-success bg-status-success/10 border border-status-success/30 px-1.5 py-0.5 rounded-[2px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{selectedInquiry.trustScore}% Verified Domain</span>
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold text-on-surface">
              {selectedInquiry.company}
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Received: {selectedInquiry.receivedAt}
            </p>
          </div>
          <button
            onClick={closeLeadDrawer}
            className="text-secondary hover:text-on-surface p-1 rounded-[4px] hover:bg-state-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body Telemetry */}
        <div className="p-5 flex-1 flex flex-col gap-5 text-xs">
          {/* Contact Details Card */}
          <div className="bg-bg-canvas border border-border-subtle rounded-[4px] p-3 flex flex-col gap-2.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-secondary font-medium">
              {isDecrypted ? "Decrypted Contact Dossier" : "Contact Dossier (PII Encrypted)"}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Authorized Principal:</span>
              <span className="font-medium text-on-surface">
                {isDecrypted ? selectedInquiry.contactName : "••••••••"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Corporate Work Email:</span>
              {isDecrypted ? (
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="font-mono text-gold-accent hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  <span>{selectedInquiry.email}</span>
                </a>
              ) : (
                <span className="font-mono text-secondary">••••••••</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Encrypted Telegram:</span>
              {isDecrypted ? (
                <span className="font-mono text-telemetry-cyan flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  <span>{selectedInquiry.telegram}</span>
                </span>
              ) : (
                <span className="font-mono text-secondary">••••••••</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Jurisdiction / Location:</span>
              <span className="text-on-surface flex items-center gap-1">
                <Globe className="w-3 h-3 text-secondary" />
                <span>{selectedInquiry.location}</span>
              </span>
            </div>
          </div>

          {/* Allocation & Mandate Mandate */}
          <div className="bg-bg-canvas border border-border-subtle rounded-[4px] p-3 flex flex-col gap-2.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-secondary font-medium">
              Mandate Parameters & Custody
            </span>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Asset Class Interest:</span>
              <span className="font-medium text-on-surface text-right max-w-[200px]">
                {selectedInquiry.assetInterest}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Declared Capital:</span>
              <span className="font-mono font-semibold text-status-success">
                {selectedInquiry.declaredCapital}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Allocation Bracket:</span>
              <span className="font-mono text-on-surface">
                {selectedInquiry.bracket}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Custody Architecture:</span>
              <span className="text-on-surface flex items-center gap-1">
                <Lock className="w-3 h-3 text-gold-accent" />
                <span>{selectedInquiry.custodyPreference}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Deployment Window:</span>
              <span className="font-mono text-secondary">
                {selectedInquiry.investmentWindow}
              </span>
            </div>
          </div>

          {/* Workflow Stage Control */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[11px] uppercase tracking-wider text-secondary font-medium">
              Update Mandate Workflow Stage
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InquiryStatus)}
              className="bg-bg-canvas border border-border-subtle rounded-[4px] p-2 text-xs font-mono text-on-surface focus:border-gold-accent focus:outline-none"
            >
              <option value="NEW">NEW (Unreviewed Submission)</option>
              <option value="IN_REVIEW">IN_REVIEW (Compliance Preliminary)</option>
              <option value="MANDATE_SENT">MANDATE_SENT (Terms Issued)</option>
              <option value="ARCHIVED">ARCHIVED (Disqualified / Closed)</option>
            </select>

            <textarea
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              placeholder="Add confidential operator notes..."
              rows={3}
              className="bg-bg-canvas border border-border-subtle rounded-[4px] p-2 text-xs text-on-surface placeholder:text-secondary focus:border-gold-accent focus:outline-none resize-none font-sans"
            />

            {saveError && (
              <div className="p-2.5 bg-status-danger/10 border border-status-danger/30 rounded-[4px] text-xs text-status-danger flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{saveError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSaveError(null)
                    mutation.mutate()
                  }}
                  className="px-2 py-0.5 bg-status-danger text-white rounded-[2px] font-mono text-[10px] hover:bg-status-danger/80 shrink-0 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setSaveError(null)
                mutation.mutate()
              }}
              disabled={mutation.isPending}
              className="w-full bg-bg-elevated hover:bg-state-hover border border-border-subtle rounded-[4px] py-2 text-xs font-medium text-on-surface flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                  <span className="text-status-success font-mono">Stage Updated</span>
                </>
              ) : (
                <span>{mutation.isPending ? "Updating Stage..." : "Save Workflow Transition"}</span>
              )}
            </button>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-border-subtle bg-bg-elevated/40 flex flex-col gap-2">
          {canConvert ? (
            <button
              onClick={() => openConvertModal(selectedInquiry)}
              className="w-full bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-semibold rounded-[4px] py-2.5 text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              data-testid="convert-lead-btn"
            >
              <UserCheck className="w-4 h-4" />
              <span>Convert to Supreme Client Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="text-center font-mono text-[11px] text-secondary">
              Conversion requires DESK_LEAD or SUPER_ADMIN role.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
