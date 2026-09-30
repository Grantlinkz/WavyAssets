import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ShieldAlert, X, AlertTriangle, CheckCircle2, Lock, Unlock } from "lucide-react"
import { useUserRegistryStore } from "../../store/useUserRegistryStore"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import { suspendUser } from "../../api/users"
import { formatCurrency } from "../../lib/formatters"

export const SuspendUserModal: React.FC = () => {
  const { isSuspendUserModalOpen, closeSuspendModal, selectedUser } = useUserRegistryStore()
  const { hasPermission } = useAdminAuthStore()
  const queryClient = useQueryClient()

  const [reason, setReason] = useState("")
  const [killActiveSessions, setKillActiveSessions] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const canSuspend = hasPermission("canSuspendUser")
  const isCurrentlySuspended = selectedUser?.status === "SUSPENDED"
  const targetAction = isCurrentlySuspended ? "ACTIVATE" : "SUSPEND"

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("No user selected")
      if (!reason.trim()) {
        throw new Error("Mandatory regulatory reason required for Supreme status modification.")
      }

      return suspendUser({
        userId: selectedUser.id,
        reason: reason.trim(),
        action: targetAction,
        killActiveSessions,
      })
    },
    onSuccess: (data) => {
      setSuccessMsg(`Status updated successfully: User is now ${data.user.status}`)
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setTimeout(() => {
        closeSuspendModal()
        setReason("")
        setErrorMsg(null)
        setSuccessMsg(null)
      }, 1400)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to modify user operational status.")
    },
  })

  if (!isSuspendUserModalOpen || !selectedUser) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    mutation.mutate()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={closeSuspendModal}
      data-testid="suspend-user-modal"
    >
      <div
        className="w-full max-w-md bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-[4px] flex items-center justify-center ${
                isCurrentlySuspended
                  ? "bg-status-success/10 border border-status-success/30 text-status-success"
                  : "bg-status-danger/10 border border-status-danger/30 text-status-danger"
              }`}
            >
              {isCurrentlySuspended ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">
                {isCurrentlySuspended ? "Re-activate Supreme Client Account" : "Supreme Account Kill-Switch"}
              </h2>
              <p className="text-xs text-secondary font-mono">{selectedUser.id}</p>
            </div>
          </div>
          <button
            onClick={closeSuspendModal}
            className="text-secondary hover:text-on-surface p-1 rounded-[4px]"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Summary Card */}
        <div className="p-3 bg-bg-canvas border border-border-subtle rounded-[4px] mb-4 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-secondary">Legal Entity:</span>
            <span className="font-semibold text-on-surface">{selectedUser.fullLegalName}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-secondary">Corporate Email:</span>
            <span className="font-mono text-on-surface">{selectedUser.email}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-secondary">Total Vault Capital:</span>
            <span className="font-mono tabular-nums text-gold-accent font-semibold">
              {formatCurrency(selectedUser.balances.totalVaultBalance, selectedUser.balances.currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary">Current Status:</span>
            <span
              className={`px-1.5 py-0.5 rounded-[2px] font-mono text-[10px] font-bold ${
                selectedUser.status === "ACTIVE"
                  ? "bg-status-success/15 text-status-success border border-status-success/30"
                  : "bg-status-danger/15 text-status-danger border border-status-danger/30"
              }`}
            >
              {selectedUser.status}
            </span>
          </div>
        </div>

        {!canSuspend && (
          <div className="mb-4 p-3 bg-status-warning/10 border border-status-warning/30 rounded-[4px] text-xs text-status-warning flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>RBAC Restricted: Your operator role does not possess user governance kill-switch authority.</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-status-danger/10 border border-status-danger/30 rounded-[4px] text-xs text-status-danger flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-status-success/10 border border-status-success/30 rounded-[4px] text-xs text-status-success flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="block font-mono uppercase text-secondary mb-1">
              Mandatory Regulatory Reason *
            </label>
            <textarea
              required
              rows={3}
              disabled={!canSuspend}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., FINMA Article 14 investigation, suspicious transaction report (STR), or court order..."
              className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-2.5 text-on-surface focus:border-gold-accent focus:outline-none resize-none disabled:opacity-50"
            />
          </div>

          {!isCurrentlySuspended && (
            <label className="flex items-center gap-2 cursor-pointer text-secondary hover:text-on-surface">
              <input
                type="checkbox"
                checked={killActiveSessions}
                onChange={(e) => setKillActiveSessions(e.target.checked)}
                className="rounded-[2px] bg-bg-canvas border-border-subtle text-status-danger focus:ring-0"
              />
              <span>Instantly terminate all active operator & client Web/API sessions</span>
            </label>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={closeSuspendModal}
              className="px-4 py-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !canSuspend}
              className={`px-4 py-1.5 rounded-[4px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                isCurrentlySuspended
                  ? "bg-status-success hover:bg-emerald-600 text-bg-canvas"
                  : "bg-status-danger hover:bg-red-600 text-white"
              }`}
            >
              {isCurrentlySuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>
                {mutation.isPending
                  ? "Executing..."
                  : isCurrentlySuspended
                  ? "Re-activate Account"
                  : "Enact Suspension Kill-Switch"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
