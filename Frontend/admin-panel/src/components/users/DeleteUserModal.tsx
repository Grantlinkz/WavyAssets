import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { useUserRegistryStore } from "../../store/useUserRegistryStore"
import { deleteUser } from "../../api/users"

export const DeleteUserModal: React.FC = () => {
  const { isDeleteUserModalOpen, closeDeleteUserModal, selectedUser } = useUserRegistryStore()
  const queryClient = useQueryClient()

  const [confirmInput, setConfirmInput] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("No user selected for deletion.")

      // Pass user's email as confirmation key
      return deleteUser(selectedUser.id, selectedUser.email)
    },
    onSuccess: (data) => {
      setSuccessMsg(data.message || `Client account for ${selectedUser?.email} permanently purged.`)
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setTimeout(() => {
        closeDeleteUserModal()
        setConfirmInput("")
        setErrorMsg(null)
        setSuccessMsg(null)
      }, 1500)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to permanently purge user account.")
    },
  })

  if (!isDeleteUserModalOpen || !selectedUser) return null

  const isConfirmed =
    confirmInput.trim().toLowerCase() === selectedUser.email.toLowerCase() ||
    confirmInput.trim() === "DELETE"

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConfirmed) {
      setErrorMsg("Please type the user's email or 'DELETE' to confirm irreversible purge.")
      return
    }
    setErrorMsg(null)
    mutation.mutate()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={closeDeleteUserModal}
      data-testid="delete-user-modal"
    >
      <div
        className="w-full max-w-md bg-bg-panel border border-status-danger/40 rounded-[4px] shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-status-danger/10 border border-status-danger/30 flex items-center justify-center text-status-danger">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">
                Delete Client &amp; Clear Database Records
              </h2>
              <p className="text-xs text-status-danger font-mono font-medium">
                Irreversible Permanent Purge
              </p>
            </div>
          </div>
          <button
            onClick={closeDeleteUserModal}
            className="text-secondary hover:text-on-surface p-1 rounded-[4px] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-status-danger/10 border border-status-danger/30 rounded-[4px] text-xs text-status-danger flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-status-success/10 border border-status-success/30 rounded-[4px] text-xs text-status-success flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Warning Banner */}
        <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-[4px] mb-4 text-xs text-on-surface flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-status-danger font-semibold font-mono text-[11px] uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Full Database Purge Specification</span>
          </div>
          <p className="text-[11px] text-secondary leading-relaxed">
            Executing this action will delete <strong className="text-on-surface">{selectedUser.fullLegalName}</strong> and permanently erase all associated details in the database:
          </p>
          <ul className="text-[10px] text-secondary font-mono list-disc list-inside space-y-0.5 pl-1">
            <li>Double-entry ledger transactions &amp; accounting entries</li>
            <li>Segregated liquid cash &amp; invested capital accounts</li>
            <li>Crypto holdings, stock positions, and open trading orders</li>
            <li>Active JWT sessions, OTP challenges &amp; WebAuthn credentials</li>
            <li>KYC compliance files and regulatory audit trails</li>
          </ul>
        </div>

        {/* Target Entity Card */}
        <div className="p-3 bg-bg-canvas border border-border-subtle rounded-[4px] mb-4 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-secondary">Client Name:</span>
            <span className="font-semibold text-on-surface">{selectedUser.fullLegalName}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-secondary">Email:</span>
            <span className="font-mono text-gold-accent">{selectedUser.email}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-secondary">Total Vault Capital:</span>
            <span className="font-mono font-bold text-status-danger">
              ${selectedUser.balances.totalVaultBalance.toLocaleString()} {selectedUser.balances.currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary">User ID:</span>
            <span className="font-mono text-[10px] text-secondary">{selectedUser.id}</span>
          </div>
        </div>

        <form onSubmit={handleDelete} className="flex flex-col gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-mono uppercase text-secondary text-[10px] block">
              Type <strong className="text-gold-accent">{selectedUser.email}</strong> or <strong className="text-status-danger">DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              required
              data-testid="delete-user-confirm-input"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Confirm by typing email or DELETE"
              className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-2 font-mono text-on-surface focus:border-status-danger focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={closeDeleteUserModal}
              className="px-4 py-2 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !isConfirmed}
              data-testid="delete-user-confirm-btn"
              className="px-5 py-2 rounded-[4px] bg-status-danger hover:bg-red-700 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{mutation.isPending ? "Purging from DB..." : "Purge User & Records"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
