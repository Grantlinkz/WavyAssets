import React, { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Edit3,
  X,
  ShieldAlert,
  CheckCircle2,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Building,
  Save,
} from "lucide-react"
import { useUserRegistryStore } from "../../store/useUserRegistryStore"
import { updateUser, type UserTier } from "../../api/users"

export const EditUserModal: React.FC = () => {
  const { isEditUserModalOpen, closeEditUserModal, selectedUser } = useUserRegistryStore()
  const queryClient = useQueryClient()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [tier, setTier] = useState<UserTier>("PRIVATE_WEALTH")
  const [kycTier, setKycTier] = useState<string>("TIER_1")
  const [isCorporate, setIsCorporate] = useState(false)
  const [passphrase, setPassphrase] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (selectedUser) {
      setFullName(selectedUser.fullLegalName || "")
      setEmail(selectedUser.email || "")
      const resolvedTier: UserTier =
        selectedUser.accessTier === "INSTITUTIONAL" ? "INSTITUTIONAL" : "PRIVATE_WEALTH"
      setTier(resolvedTier)
      setKycTier(selectedUser.kycTier || (selectedUser.kycStatus === "APPROVED" ? "TIER_3" : "TIER_1"))
      setIsCorporate(!!selectedUser.institutionName)
      setPassphrase("")
      setErrorMsg(null)
      setSuccessMsg(null)
    }
  }, [selectedUser])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("No user selected for edit.")
      if (!fullName.trim() || fullName.trim().length < 2) {
        throw new Error("Full name must have at least 2 characters.")
      }
      if (!email.trim() || !email.includes("@")) {
        throw new Error("Please enter a valid email address.")
      }

      return updateUser(selectedUser.id, {
        fullLegalName: fullName.trim(),
        email: email.trim().toLowerCase(),
        accessTier: tier,
        kycTier,
        isCorporate,
        passphrase: passphrase.trim() || undefined,
      })
    },
    onSuccess: (data) => {
      setSuccessMsg(`User profile for ${data.fullLegalName} updated successfully.`)
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setTimeout(() => {
        closeEditUserModal()
        setErrorMsg(null)
        setSuccessMsg(null)
      }, 1200)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to update user details.")
    },
  })

  if (!isEditUserModalOpen || !selectedUser) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    mutation.mutate()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={closeEditUserModal}
      data-testid="edit-user-modal"
    >
      <div
        className="w-full max-w-lg bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-gold-accent/10 border border-gold-accent/30 flex items-center justify-center text-gold-accent">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">
                Edit User Details
              </h2>
              <p className="text-xs text-secondary font-mono">
                Client ID: {selectedUser.id}
              </p>
            </div>
          </div>
          <button
            onClick={closeEditUserModal}
            className="text-secondary hover:text-on-surface p-1 rounded-[4px] transition-colors cursor-pointer"
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="font-mono uppercase text-secondary text-[11px] block">
              Full Legal Name *
            </label>
            <div className="relative flex items-center">
              <User className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-3 py-2 text-on-surface focus:border-gold-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="font-mono uppercase text-secondary text-[11px] block">
              Email Address *
            </label>
            <div className="relative flex items-center">
              <Mail className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-3 py-2 font-mono text-on-surface focus:border-gold-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Tier and KYC Tier Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-mono uppercase text-secondary text-[11px] block">
                Account Type
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as UserTier)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-2 text-on-surface focus:border-gold-accent focus:outline-none font-mono"
              >
                <option value="PRIVATE_WEALTH">Private Wealth</option>
                <option value="INSTITUTIONAL">Institutional</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-mono uppercase text-secondary text-[11px] block">
                KYC Level
              </label>
              <select
                value={kycTier}
                onChange={(e) => setKycTier(e.target.value)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-2 text-on-surface focus:border-gold-accent focus:outline-none font-mono"
              >
                <option value="TIER_1">Tier 1 (Standard)</option>
                <option value="TIER_2">Tier 2 (Enhanced)</option>
                <option value="TIER_3">Tier 3 (Institutional Qualified)</option>
              </select>
            </div>
          </div>

          {/* Corporate Entity Checkbox */}
          <label className="flex items-center gap-2 p-2.5 bg-bg-canvas border border-border-subtle rounded-[4px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCorporate}
              onChange={(e) => setIsCorporate(e.target.checked)}
              className="rounded-[2px] accent-gold-accent cursor-pointer"
            />
            <Building className="w-3.5 h-3.5 text-secondary" />
            <span className="text-secondary font-sans">Designated Corporate Institutional Account</span>
          </label>

          {/* Optional Password Reset */}
          <div className="space-y-1 pt-1 border-t border-border-subtle/60">
            <label className="font-mono uppercase text-secondary text-[11px] block">
              Reset Password (Optional)
            </label>
            <div className="relative flex items-center">
              <KeyRound className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Leave blank to preserve current password"
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-10 py-2 font-mono text-on-surface focus:border-gold-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-secondary hover:text-on-surface absolute right-3 p-1 cursor-pointer focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-secondary font-sans">
              Enter min. 6 characters only if you need to manually reset the client's credential.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={closeEditUserModal}
              className="px-4 py-2 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              data-testid="edit-user-submit"
              className="px-5 py-2 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{mutation.isPending ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
