import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { UserPlus, X, ShieldAlert, CheckCircle2, DollarSign, Mail, User, Building, FileText } from "lucide-react"
import { useUserRegistryStore } from "../../store/useUserRegistryStore"
import { createUser, type UserTier } from "../../api/users"

export const CreateUserModal: React.FC = () => {
  const { isCreateUserModalOpen, closeCreateUserModal } = useUserRegistryStore()
  const queryClient = useQueryClient()

  const [fullLegalName, setFullLegalName] = useState("")
  const [email, setEmail] = useState("")
  const [institutionName, setInstitutionName] = useState("")
  const [accessTier, setAccessTier] = useState<UserTier>("INSTITUTIONAL")
  const [initialFunding, setInitialFunding] = useState("0")
  const [currency, setCurrency] = useState("USD")
  const [auditReason, setAuditReason] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const parsedAmount = parseFloat(initialFunding)
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        throw new Error("Initial capital funding must be a non-negative number.")
      }
      if (!auditReason.trim()) {
        throw new Error("Mandatory FINMA compliance audit justification required.")
      }

      return createUser({
        fullLegalName: fullLegalName.trim(),
        email: email.trim(),
        institutionName: institutionName.trim() || undefined,
        accessTier,
        initialFunding: parsedAmount,
        currency,
        auditReason: auditReason.trim(),
      })
    },
    onSuccess: (data) => {
      setSuccessMsg(`Supreme entity ${data.fullLegalName} provisioned successfully with ID ${data.id}`)
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setTimeout(() => {
        closeCreateUserModal()
        // Reset form
        setFullLegalName("")
        setEmail("")
        setInstitutionName("")
        setInitialFunding("0")
        setAuditReason("")
        setErrorMsg(null)
        setSuccessMsg(null)
      }, 1400)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to create Supreme user.")
    },
  })

  if (!isCreateUserModalOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    mutation.mutate()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={closeCreateUserModal}
      data-testid="create-user-modal"
    >
      <div
        className="w-full max-w-lg bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-gold-accent/10 border border-gold-accent/30 flex items-center justify-center text-gold-accent">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">
                Provision Supreme Client Entity
              </h2>
              <p className="text-xs text-secondary">
                Direct onboarding to segregated ledger custody
              </p>
            </div>
          </div>
          <button
            onClick={closeCreateUserModal}
            className="text-secondary hover:text-on-surface p-1 rounded-[4px]"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
              Full Legal Entity / Individual Name *
            </label>
            <div className="relative flex items-center">
              <User className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
              <input
                type="text"
                required
                value={fullLegalName}
                onChange={(e) => setFullLegalName(e.target.value)}
                placeholder="e.g. Geneva Vault Holding SA"
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 text-on-surface focus:border-gold-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono uppercase text-secondary mb-1">
                Corporate Email *
              </label>
              <div className="relative flex items-center">
                <Mail className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="treasury@holding.ch"
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 font-mono text-on-surface focus:border-gold-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono uppercase text-secondary mb-1">
                Institution Name (Optional)
              </label>
              <div className="relative flex items-center">
                <Building className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Family Office / Fund"
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 text-on-surface focus:border-gold-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono uppercase text-secondary mb-1">
                Access Tier *
              </label>
              <select
                value={accessTier}
                onChange={(e) => setAccessTier(e.target.value as UserTier)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-1.5 text-on-surface focus:border-gold-accent focus:outline-none font-mono"
              >
                <option value="INSTITUTIONAL">INSTITUTIONAL (Uncapped)</option>
                <option value="TIER_3">TIER_3 (High Capital)</option>
                <option value="TIER_2">TIER_2 (HNWI Qualified)</option>
                <option value="TIER_1">TIER_1 (Standard)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono uppercase text-secondary mb-1">
                Currency Base
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-1.5 text-on-surface focus:border-gold-accent focus:outline-none font-mono"
              >
                <option value="USD">USD ($)</option>
                <option value="CHF">CHF (CHF)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono uppercase text-secondary mb-1">
              Initial Capital Allocation ({currency})
            </label>
            <div className="relative flex items-center">
              <DollarSign className="w-3.5 h-3.5 text-gold-accent absolute left-3 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="10000"
                value={initialFunding}
                onChange={(e) => setInitialFunding(e.target.value)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 font-mono text-on-surface focus:border-gold-accent focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono uppercase text-secondary mb-1">
              Mandatory FINMA Compliance Justification *
            </label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 text-secondary absolute left-3 top-2.5 pointer-events-none" />
              <textarea
                required
                rows={2}
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                placeholder="State mandate origin, board authorization or onboarding ticket reference..."
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-2 text-on-surface focus:border-gold-accent focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={closeCreateUserModal}
              className="px-4 py-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-1.5 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{mutation.isPending ? "Provisioning..." : "Provision Supreme User"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
