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
  ShieldCheck,
  Lock,
} from "lucide-react"
import { useAdminDirectoryStore } from "../../store/useAdminDirectoryStore"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import { createAdmin, type AdminPersonnelRole } from "../../api/admins"

const ROLE_OPTIONS: { role: AdminPersonnelRole; label: string; desc: string }[] = [
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    desc: "Full root governance across treasury, security parameters, personnel directory, and institutional compliance.",
  },
  {
    role: "TREASURY_OFFICER",
    label: "Treasury Officer",
    desc: "Liquidity rebalancing, settlement verification, FINMA Art. 14 dual sign-offs, and cold vault matrix control.",
  },
  {
    role: "COMPLIANCE_OFFICER",
    label: "Compliance Officer",
    desc: "KYC/AML verification, sanction screening, risk profiling, CIP inspection, and entity freezing.",
  },
  {
    role: "DESK_LEAD",
    label: "Desk Lead",
    desc: "Direct capital funding, client onboarding, OTC execution, and account oversight.",
  },
  {
    role: "CONCIERGE",
    label: "VIP Concierge",
    desc: "Obsidian cardholder requests, high-touch luxury bespoke requests, and concierge ticket management.",
  },
]

interface CreateAdminModalProps {
  isOpen?: boolean
  isSuperAdmin?: boolean
}

export const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
  isOpen: propIsOpen,
  isSuperAdmin: propIsSuperAdmin,
}) => {
  const { isCreateModalOpen, closeCreateModal } = useAdminDirectoryStore()
  const { operator } = useAdminAuthStore()
  const queryClient = useQueryClient()

  const isOpen = propIsOpen !== undefined ? propIsOpen : isCreateModalOpen
  const isSuperAdmin = propIsSuperAdmin !== undefined ? propIsSuperAdmin : operator?.role === "SUPER_ADMIN"

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [role, setRole] = useState<AdminPersonnelRole>("DESK_LEAD")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*"
    let pass = "WavyAdmin!"
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassphrase(pass)
    setShowPassword(true)
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isSuperAdmin) {
        throw new Error("Authorization Denied: Only Super Admin can register new personnel.")
      }
      if (!fullName.trim() || fullName.trim().length < 2) {
        throw new Error("Please enter personnel's full name.")
      }
      if (!email.trim() || !email.includes("@")) {
        throw new Error("Please enter a valid administrative email address.")
      }
      if (!passphrase || passphrase.length < 8) {
        throw new Error("Password must be at least 8 characters.")
      }

      return createAdmin({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        passphrase: passphrase.trim(),
        role,
      })
    },
    onSuccess: (data) => {
      setSuccessMsg(`Successfully registered ${data.fullName} as ${data.role}.`)
      setErrorMsg(null)
      queryClient.invalidateQueries({ queryKey: ["admins"] })
      setTimeout(() => {
        setSuccessMsg(null)
        closeCreateModal()
        setFullName("")
        setEmail("")
        setPassphrase("")
        setRole("DESK_LEAD")
      }, 1500)
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to register administrative personnel."
      setErrorMsg(msg)
      setSuccessMsg(null)
    },
  })

  if (!isOpen) return null

  const selectedRoleMeta = ROLE_OPTIONS.find((r) => r.role === role)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      data-testid="create-admin-modal"
    >
      <div className="bg-bg-panel border border-border-subtle rounded-[6px] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-canvas/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-gold-accent/10 border border-gold-accent/30 flex items-center justify-center text-gold-accent">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-on-surface tracking-wide">
                Register Administrative Personnel
              </h2>
              <p className="font-sans text-[11px] text-secondary">
                Privileged RBAC provisioning anchored with Argon2id cryptographic hashing
              </p>
            </div>
          </div>
          <button
            onClick={closeCreateModal}
            className="p-1 rounded-[4px] hover:bg-state-hover text-secondary hover:text-on-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!isSuperAdmin && (
            <div className="p-3 rounded-[4px] bg-status-danger/10 border border-status-danger/30 flex items-start gap-2.5 text-xs text-status-danger">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Super Admin Clearance Required</strong>
                <span>
                  Under FINMA Article 14 governance, only active Super Administrators may register or provision administrative personnel credentials.
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-[4px] bg-status-danger/10 border border-status-danger/30 flex items-start gap-2 text-xs text-status-danger font-sans">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-[4px] bg-status-success/10 border border-status-success/30 flex items-start gap-2 text-xs text-status-success font-sans">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Full Name & Title <span className="text-status-danger">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-secondary absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Marc B. Widmer"
                  disabled={!isSuperAdmin}
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-3 py-1.5 text-xs text-on-surface focus:border-gold-accent focus:outline-none disabled:opacity-50"
                  data-testid="admin-fullname-input"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Corporate Administrative Email <span className="text-status-danger">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-secondary absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@wavyassets.ch"
                  disabled={!isSuperAdmin}
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-3 py-1.5 text-xs text-on-surface focus:border-gold-accent focus:outline-none disabled:opacity-50"
                  data-testid="admin-email-input"
                />
              </div>
            </div>

            {/* Administrative Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Administrative Role & Clearance <span className="text-status-danger">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AdminPersonnelRole)}
                disabled={!isSuperAdmin}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-2 text-xs text-on-surface focus:border-gold-accent focus:outline-none cursor-pointer disabled:opacity-50"
                data-testid="admin-role-select"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.role} value={opt.role} className="bg-bg-panel text-on-surface">
                    {opt.label} ({opt.role})
                  </option>
                ))}
              </select>

              {/* Dynamic Role Permissions Description Callout */}
              {selectedRoleMeta && (
                <div className="mt-2 p-2.5 rounded-[4px] bg-bg-canvas border border-border-subtle text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 text-telemetry-cyan font-mono font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Role Scope: {selectedRoleMeta.label}</span>
                  </div>
                  <p className="text-secondary font-sans leading-relaxed">
                    {selectedRoleMeta.desc}
                  </p>
                </div>
              )}
            </div>

            {/* Passphrase Generator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-on-surface">
                  Initial Passphrase <span className="text-status-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  disabled={!isSuperAdmin}
                  className="text-[11px] text-gold-accent hover:underline flex items-center gap-1 font-mono cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate Strong Password</span>
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-secondary absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Minimum 8 characters with symbols"
                  disabled={!isSuperAdmin}
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-10 py-1.5 text-xs text-on-surface font-mono focus:border-gold-accent focus:outline-none disabled:opacity-50"
                  data-testid="admin-passphrase-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-secondary hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-border-subtle bg-bg-canvas/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeCreateModal}
            className="px-3 py-1.5 rounded-[4px] border border-border-subtle text-secondary hover:text-on-surface hover:bg-state-hover text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!isSuperAdmin || mutation.isPending}
            className="px-4 py-1.5 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            data-testid="submit-create-admin-btn"
          >
            {mutation.isPending ? (
              <span>Provisioning...</span>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Personnel</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
