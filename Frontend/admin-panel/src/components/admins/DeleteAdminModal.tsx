import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2, X, ShieldAlert, AlertOctagon, Lock } from "lucide-react"
import { useAdminDirectoryStore } from "../../store/useAdminDirectoryStore"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import { deleteAdmin } from "../../api/admins"

export const DeleteAdminModal: React.FC = () => {
  const { isDeleteModalOpen, closeDeleteModal, selectedAdmin } = useAdminDirectoryStore()
  const { operator } = useAdminAuthStore()
  const queryClient = useQueryClient()

  const isSuperAdmin = operator?.role === "SUPER_ADMIN"

  const [reason, setReason] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isSuperAdmin) {
        throw new Error("Authorization Denied: Only Super Admin can delete personnel.")
      }
      if (!selectedAdmin) {
        throw new Error("No administrative personnel selected.")
      }
      if (selectedAdmin.id === operator?.id) {
        throw new Error("FINMA Dual-Control: Self-deletion of active administrative identity is prohibited.")
      }
      if (confirmEmail.trim().toLowerCase() !== selectedAdmin.email.toLowerCase()) {
        throw new Error("Email confirmation does not match target personnel.")
      }

      return deleteAdmin(selectedAdmin.id, reason.trim() || undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
      closeDeleteModal()
      setReason("")
      setConfirmEmail("")
      setErrorMsg(null)
    },
    onError: (err: Error) => {
      setErrorMsg(err?.message || "Failed to remove administrative personnel.")
    },
  })

  if (!isDeleteModalOpen || !selectedAdmin) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      data-testid="delete-admin-modal"
    >
      <div className="bg-bg-panel border border-border-subtle rounded-[6px] w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-canvas/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-status-danger/10 border border-status-danger/30 flex items-center justify-center text-status-danger">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-on-surface">
                Delete Administrative Personnel
              </h2>
              <p className="font-mono text-[11px] text-secondary">
                {selectedAdmin.fullName} ({selectedAdmin.email})
              </p>
            </div>
          </div>
          <button
            onClick={closeDeleteModal}
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
                <span>Only Super Administrators possess deletion authority.</span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-[4px] bg-status-danger/10 border border-status-danger/30 text-xs flex items-start gap-2.5 text-status-danger">
            <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-sans">
              <strong>Warning:</strong> This permanently purges the operator identity, active sessions, and access credentials from the administrative directory. Past audit log records are preserved for statutory compliance.
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
              Confirm Email Address <span className="text-status-danger">*</span>
            </label>
            <p className="text-[11px] text-secondary mb-1.5 font-sans">
              Type <span className="font-mono text-gold-accent font-semibold">{selectedAdmin.email}</span> to confirm deletion:
            </p>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={selectedAdmin.email}
              disabled={!isSuperAdmin}
              className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-1.5 text-xs text-on-surface focus:border-gold-accent focus:outline-none font-mono disabled:opacity-50"
              data-testid="confirm-delete-email-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Audit Reason <span className="text-secondary font-normal font-sans">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Operational justification for personnel decommission..."
              rows={2}
              disabled={!isSuperAdmin}
              className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-2.5 text-xs text-on-surface focus:border-gold-accent focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-border-subtle bg-bg-canvas/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeDeleteModal}
            className="px-3 py-1.5 rounded-[4px] border border-border-subtle text-secondary hover:text-on-surface hover:bg-state-hover text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={
              !isSuperAdmin ||
              mutation.isPending ||
              confirmEmail.trim().toLowerCase() !== selectedAdmin.email.toLowerCase()
            }
            className="px-4 py-1.5 rounded-[4px] bg-status-danger hover:bg-red-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            data-testid="confirm-delete-admin-btn"
          >
            {mutation.isPending ? (
              <span>Deleting...</span>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
