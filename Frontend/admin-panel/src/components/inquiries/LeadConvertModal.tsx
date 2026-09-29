import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { UserCheck, X, ShieldAlert, CheckCircle2, DollarSign, Mail, User } from "lucide-react"
import { useAdminNavStore } from "../../store/useAdminNavStore"
import { convertInquiryToUser } from "../../api/inquiries"

export const LeadConvertModal: React.FC = () => {
  const { isConvertModalOpen, closeConvertModal, selectedInquiry, closeLeadDrawer } = useAdminNavStore()
  const queryClient = useQueryClient()

  const [fullName, setFullName] = useState(selectedInquiry?.contactName || "")
  const [email, setEmail] = useState(selectedInquiry?.email || "")
  const [accessTier, setAccessTier] = useState("INSTITUTIONAL")
  const [initialKycTier, setInitialKycTier] = useState("TIER_3")
  const [startingBalance, setStartingBalance] = useState("")
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  React.useEffect(() => {
    if (selectedInquiry) {
      setFullName(selectedInquiry.contactName)
      setEmail(selectedInquiry.email)
      const verifiedCash = (selectedInquiry as unknown as { verifiedCashAmount?: number })?.verifiedCashAmount
      setStartingBalance(verifiedCash !== undefined ? String(verifiedCash) : "")
      setSuccessMsg(null)
      setErrorMsg(null)
    }
  }, [selectedInquiry])

  const mutation = useMutation({
    mutationFn: async () => {
      return convertInquiryToUser({
        fullName,
        email,
        accessTier,
        initialKycTier,
        startingCashBalance: parseFloat(startingBalance) || 0,
        inquiryId: selectedInquiry?.id,
      })
    },
    onSuccess: (data) => {
      if (!data?.success || !data?.userId) {
        setErrorMsg(data?.message || "Failed to provision Supreme user: User ID omitted from response.")
        return
      }
      setSuccessMsg(`Supreme user provisioned successfully with ID: ${data.userId}`)
      queryClient.invalidateQueries({ queryKey: ["inquiries"] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setTimeout(() => {
        closeConvertModal()
        closeLeadDrawer()
      }, 1500)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to convert lead to Supreme user.")
    },
  })

  if (!isConvertModalOpen || !selectedInquiry) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    mutation.mutate()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={closeConvertModal}
      data-testid="lead-convert-modal"
    >
      <div
        className="w-full max-w-lg bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-gold-accent/10 border border-gold-accent/30 flex items-center justify-center text-gold-accent">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">
                Convert Mandate to Supreme Client Account
              </h2>
              <p className="text-xs text-secondary">
                Entity: <span className="text-gold-accent font-medium">{selectedInquiry.company}</span>
              </p>
            </div>
          </div>
          <button
            onClick={closeConvertModal}
            className="text-secondary hover:text-on-surface p-1 rounded-[4px]"
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
              Authorized Principal Full Name
            </label>
            <div className="relative flex items-center">
              <User className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 text-on-surface focus:border-gold-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono uppercase text-secondary mb-1">
              Work Corporate Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 font-mono text-on-surface focus:border-gold-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono uppercase text-secondary mb-1">
                Access Tier
              </label>
              <select
                value={accessTier}
                onChange={(e) => setAccessTier(e.target.value)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-1.5 text-on-surface focus:border-gold-accent focus:outline-none font-mono"
              >
                <option value="INSTITUTIONAL">INSTITUTIONAL</option>
                <option value="PRIVATE_WEALTH">PRIVATE_WEALTH</option>
                <option value="RETAIL">RETAIL</option>
              </select>
            </div>
            <div>
              <label className="block font-mono uppercase text-secondary mb-1">
                Initial KYC Tier
              </label>
              <select
                value={initialKycTier}
                onChange={(e) => setInitialKycTier(e.target.value)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-1.5 text-on-surface focus:border-gold-accent focus:outline-none font-mono"
              >
                <option value="TIER_3">TIER_3 (Full Institutional)</option>
                <option value="TIER_2">TIER_2 (High Net Worth)</option>
                <option value="TIER_1">TIER_1 (Standard)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono uppercase text-secondary mb-1">
              Starting Cash Allocation (USD Equivalent)
            </label>
            <div className="relative flex items-center">
              <DollarSign className="w-3.5 h-3.5 text-gold-accent absolute left-3 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="0.00"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 font-mono text-on-surface focus:border-gold-accent focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={closeConvertModal}
              className="px-4 py-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !!successMsg || mutation.isSuccess}
              className="px-4 py-1.5 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{mutation.isPending ? "Provisioning..." : successMsg ? "Provisioned" : "Provision Client Account"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
