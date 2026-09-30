import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  UserPlus,
  X,
  ShieldAlert,
  CheckCircle2,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  DollarSign,
  ArrowRight,
  Building,
} from "lucide-react"
import { useUserRegistryStore } from "../../store/useUserRegistryStore"
import { createUser, type UserTier } from "../../api/users"

export const CreateUserModal: React.FC = () => {
  const { isCreateUserModalOpen, closeCreateUserModal } = useUserRegistryStore()
  const queryClient = useQueryClient()

  // Sign up fields identical to landing-page UnifiedAuthModal
  const [tier, setTier] = useState<UserTier>("PRIVATE_WEALTH")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isCorporate, setIsCorporate] = useState(false)
  const [initialFunding, setInitialFunding] = useState("0")

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*"
    let pass = "Wavy!"
    for (let i = 0; i < 14; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassphrase(pass)
    setShowPassword(true)
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (!fullName.trim() || fullName.trim().length < 2) {
        throw new Error("Please enter the user's full name.")
      }
      if (!email.trim() || !email.includes("@")) {
        throw new Error("Please enter a valid work or personal email address.")
      }
      if (!passphrase || passphrase.length < 6) {
        throw new Error("Password must be at least 6 characters.")
      }

      const parsedCash = parseFloat(initialFunding) || 0

      return createUser({
        fullLegalName: fullName.trim(),
        email: email.trim().toLowerCase(),
        accessTier: tier,
        passphrase: passphrase.trim(),
        initialFunding: parsedCash,
        currency: "USD",
        institutionName: isCorporate ? "Corporate Entity" : undefined,
      })
    },
    onSuccess: (data) => {
      setSuccessMsg(`Supreme client account for ${data.fullLegalName} created successfully.`)
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setTimeout(() => {
        closeCreateUserModal()
        // Reset form
        setFullName("")
        setEmail("")
        setPassphrase("")
        setInitialFunding("0")
        setTier("PRIVATE_WEALTH")
        setIsCorporate(false)
        setErrorMsg(null)
        setSuccessMsg(null)
      }, 1400)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to create user account.")
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
        className="w-full max-w-lg bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#A6FF00]/10 border border-[#A6FF00]/30 flex items-center justify-center text-[#A6FF00]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">
                Create New User Account
              </h2>
              <p className="text-xs text-secondary">
                Matches Landing Page sign-up flow &amp; auto-creates segregated ledger custody
              </p>
            </div>
          </div>
          <button
            onClick={closeCreateUserModal}
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Account Tier Selector (Exact match to Landing Page UnifiedAuthModal) */}
          <div className="space-y-1.5">
            <label className="font-mono uppercase text-secondary text-[11px] block">
              Account Tier *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-testid="create-tier-private"
                onClick={() => setTier("PRIVATE_WEALTH")}
                className={`px-3 py-2 rounded-[4px] border text-xs font-sans uppercase transition-colors cursor-pointer text-left flex items-center justify-between ${
                  tier === "PRIVATE_WEALTH"
                    ? "border-[#A6FF00] bg-[#A6FF00]/10 text-[#A6FF00] font-semibold"
                    : "border-border-subtle bg-bg-canvas text-secondary hover:text-on-surface hover:border-border-subtle/80"
                }`}
              >
                <span>Private Wealth</span>
                <span className="font-mono text-[10px] text-secondary">$50k–$5M</span>
              </button>
              <button
                type="button"
                data-testid="create-tier-institutional"
                onClick={() => setTier("INSTITUTIONAL")}
                className={`px-3 py-2 rounded-[4px] border text-xs font-sans uppercase transition-colors cursor-pointer text-left flex items-center justify-between ${
                  tier === "INSTITUTIONAL"
                    ? "border-[#A6FF00] bg-[#A6FF00]/10 text-[#A6FF00] font-semibold"
                    : "border-border-subtle bg-bg-canvas text-secondary hover:text-on-surface hover:border-border-subtle/80"
                }`}
              >
                <span>Institutional</span>
                <span className="font-mono text-[10px] text-secondary">&gt;$5M AUM</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="font-mono uppercase text-secondary text-[11px] block">
              Full Name *
            </label>
            <div className="relative flex items-center">
              <User className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
              <input
                type="text"
                required
                data-testid="create-fullname-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-3 py-2 text-on-surface focus:border-gold-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Work or Personal Email */}
          <div className="space-y-1">
            <label className="font-mono uppercase text-secondary text-[11px] block">
              Email Address *
            </label>
            <div className="relative flex items-center">
              <Mail className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                data-testid="create-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-3 py-2 font-mono text-on-surface focus:border-gold-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Create Password with Eye Toggle & Generator */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-mono uppercase text-secondary text-[11px] block">
                Create Password *
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[10px] text-gold-accent hover:underline flex items-center gap-1 font-mono cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Generate</span>
              </button>
            </div>
            <div className="relative flex items-center">
              <KeyRound className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                data-testid="create-password-input"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Create a secure password (min. 6 characters)"
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
          </div>

          {/* Initial Capital Funding & Corporate Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-mono uppercase text-secondary mb-1 text-[11px]">
                Initial Funding (USD)
              </label>
              <div className="relative flex items-center">
                <DollarSign className="w-3.5 h-3.5 text-gold-accent absolute left-3 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={initialFunding}
                  onChange={(e) => setInitialFunding(e.target.value)}
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 font-mono text-on-surface focus:border-gold-accent focus:outline-none tabular-nums"
                />
              </div>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 p-2 bg-bg-canvas border border-border-subtle rounded-[4px] w-full cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isCorporate}
                  onChange={(e) => setIsCorporate(e.target.checked)}
                  className="rounded-[2px] accent-gold-accent cursor-pointer"
                />
                <Building className="w-3.5 h-3.5 text-secondary" />
                <span className="text-secondary font-sans">Corporate Institution</span>
              </label>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={closeCreateUserModal}
              className="px-4 py-2 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              data-testid="create-user-submit"
              className="px-5 py-2 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <span>{mutation.isPending ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
