import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Lock, Unlock, X, ShieldAlert, AlertTriangle } from "lucide-react"
import { useAdminDirectoryStore } from "../../store/useAdminDirectoryStore"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import { suspendAdmin, unsuspendAdmin } from "../../api/admins"

export const SuspendAdminModal: React.FC = () => {
  const { isSuspendModalOpen, closeSuspendModal, selectedAdmin } = useAdminDirectoryStore()
  const { operator } = useAdminAuthStore()
  const queryClient = useQueryClient()

  const isSuperAdmin = operator?.role === "SUPER_ADMIN"

  const [reason, setReason] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isCurrentlyActive = selectedAdmin?.isActive ?? true
  const actionLabel = isCurrentlyActive ? "Suspend" : "Unsuspend"

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isSuperAdmin) {
        throw new Error("Authorization Denied: Only Super Admin can suspend or unsuspend personnel.")
      }
      if (!selectedAdmin) {
        throw new Error("No administrative personnel selected.")
      }
      if (selectedAdmin.id === operator?.id && isCurrentlyActive) {
        throw new Error("FINMA Dual-Control: You cannot suspend your own active administrative session.")
      }
      if (!reason.trim()) {
        throw new Error("Mandatory regulatory audit reason is required for status transitions.")
      }

      if (isCurrentlyActive) {
        return suspendAdmin(selectedAdmin.id, reason.trim())
      } else {
        return unsuspendAdmin(selectedAdmin.id, reason.trim())
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
      closeSuspendModal()
      setReason("")
      setErrorMsg(null)
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || `Failed to ${actionLabel.toLowerCase()} personnel.`)
    },
  })

  if (!isSuspendModalOpen || !selectedAdmin) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      data-testid="suspend-admin-modal"
    >
      <div className="bg-bg-panel border border-border-subtle rounded-[6px] w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-canvas/50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-[4px] flex items-center justify-center ${
                isCurrentlyActive
                  ? "bg-status-danger/10 border border-status-danger/30 text-status-danger"
                  : "bg-status-success/10 border border-status-success/30 text-status-success"
              }`}
            >
              {isCurrentlyActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-on-surface">
                {actionLabel} Administrative Credentials
              </h2>
              <p className="font-mono text-[11px] text-secondary">
                {selectedAdmin.fullName} ({selectedAdmin.email})
              </p>
            </div>
          </div>
          <button
            onClick={closeSuspendModal}
            className="p-1 rounded-[4px] hover:bg-state-hover text-secondary hover:text-on-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {!isSuperAdmin && (
            <div className="p-3 rounded-[4px] bg-status-danger/10 border border-status-danger/30 flex items-start gap-2.5 text-xs text-status-danger">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Super Admin Clearance Required</strong>
                <span>Only Super Administrators can suspend or reinstate personnel access.</span>
              </div>
            </div>
          )}

          <div
            className={`p-3 rounded-[4px] border text-xs flex items-start gap-2.5 ${
              isCurrentlyActive
                ? "bg-status-danger/10 border-status-danger/30 text-status-danger"
                : "bg-status-success/10 border-status-success/30 text-status-success"
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-sans">
              {isCurrentlyActive
                ? "Suspending will immediately revoke all active portal sessions and block administrative logins until reinstated by a Super Administrator."
                : "Reactivating will restore administrative portal access and allow the operator to resume their assigned clearance duties."}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-[4px] bg-status-danger/10 border border-status-danger/30 flex items-start gap-2 text-xs text-status-danger font-sans">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              FINMA Mandatory Audit Justification <span className="text-status-danger">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the regulatory, security, or personnel rationale for this action..."
              rows={3}
              disabled={!isSuperAdmin}
              className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-2.5 text-xs text-on-surface focus:border-gold-accent focus:outline-none disabled:opacity-50"
              data-testid="suspend-reason-input"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-border-subtle bg-bg-canvas/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeSuspendModal}
            className="px-3 py-1.5 rounded-[4px] border border-border-subtle text-secondary hover:text-on-surface hover:bg-state-hover text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!isSuperAdmin || mutation.isPending}
            className={`px-4 py-1.5 rounded-[4px] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              isCurrentlyActive
                ? "bg-status-danger hover:bg-red-600 text-white"
                : "bg-status-success hover:bg-green-600 text-white"
            }`}
            data-testid="confirm-suspend-admin-btn"
          >
            {mutation.isPending ? (
              <span>Executing...</span>
            ) : (
              <>
                {isCurrentlyActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>Confirm {actionLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
