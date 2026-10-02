import React, { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Pencil,
  X,
  ShieldAlert,
  CheckCircle2,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
} from "lucide-react"
import { useAdminDirectoryStore } from "../../store/useAdminDirectoryStore"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import { updateAdmin, type AdminPersonnelRole } from "../../api/admins"

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

interface EditAdminModalProps {
  isOpen?: boolean
  isSuperAdmin?: boolean
}

export const EditAdminModal: React.FC<EditAdminModalProps> = ({
  isOpen: propIsOpen,
  isSuperAdmin: propIsSuperAdmin,
}) => {
  const { isEditModalOpen, closeEditModal, selectedAdmin } = useAdminDirectoryStore()
  const { operator } = useAdminAuthStore()
  const queryClient = useQueryClient()

  const isOpen = propIsOpen !== undefined ? propIsOpen : isEditModalOpen
  const isSuperAdmin = propIsSuperAdmin !== undefined ? propIsSuperAdmin : operator?.role === "SUPER_ADMIN"

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<AdminPersonnelRole>("DESK_LEAD")
  const [passphrase, setPassphrase] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (selectedAdmin) {
      setFullName(selectedAdmin.fullName || "")
      setEmail(selectedAdmin.email || "")
      setRole(selectedAdmin.role || "DESK_LEAD")
      setPassphrase("")
      setErrorMsg(null)
      setSuccessMsg(null)
    }
  }, [selectedAdmin])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isSuperAdmin) {
        throw new Error("Authorization Denied: Only Super Admin can modify personnel credentials.")
      }
      if (!selectedAdmin) {
        throw new Error("No administrative personnel selected.")
      }
      if (!fullName.trim() || fullName.trim().length < 2) {
        throw new Error("Full name must be at least 2 characters.")
      }
      if (!email.trim() || !email.includes("@")) {
        throw new Error("Valid administrative email required.")
      }

      return updateAdmin(selectedAdmin.id, {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        ...(passphrase && passphrase.trim() ? { passphrase: passphrase.trim() } : {}),
      })
    },
    onSuccess: (data) => {
      setSuccessMsg(`Successfully updated credentials for ${data.fullName}.`)
      setErrorMsg(null)
      queryClient.invalidateQueries({ queryKey: ["admins"] })
      setTimeout(() => {
        setSuccessMsg(null)
        closeEditModal()
      }, 1500)
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update personnel."
      setErrorMsg(msg)
      setSuccessMsg(null)
    },
  })

  if (!isOpen || !selectedAdmin) return null

  const selectedRoleMeta = ROLE_OPTIONS.find((r) => r.role === role)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      data-testid="edit-admin-modal"
    >
      <div className="bg-bg-panel border border-border-subtle rounded-[6px] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-canvas/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-telemetry-cyan/10 border border-telemetry-cyan/30 flex items-center justify-center text-telemetry-cyan">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-on-surface tracking-wide">
                Modify Personnel Credentials & Clearance
              </h2>
              <p className="font-mono text-[11px] text-secondary">
                ID: {selectedAdmin.id}
              </p>
            </div>
          </div>
          <button
            onClick={closeEditModal}
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
                  Modifying personnel identity or clearance parameters requires root Super Admin credentials.
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
                Full Name <span className="text-status-danger">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-secondary absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isSuperAdmin}
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-3 py-1.5 text-xs text-on-surface focus:border-gold-accent focus:outline-none disabled:opacity-50"
                  data-testid="edit-admin-fullname"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Administrative Email <span className="text-status-danger">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-secondary absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isSuperAdmin}
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-3 py-1.5 text-xs text-on-surface focus:border-gold-accent focus:outline-none disabled:opacity-50"
                  data-testid="edit-admin-email"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Administrative Role & Clearance <span className="text-status-danger">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AdminPersonnelRole)}
                disabled={!isSuperAdmin}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-2 text-xs text-on-surface focus:border-gold-accent focus:outline-none cursor-pointer disabled:opacity-50"
                data-testid="edit-admin-role"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.role} value={opt.role} className="bg-bg-panel text-on-surface">
                    {opt.label} ({opt.role})
                  </option>
                ))}
              </select>

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

            {/* Optional Passphrase Reset */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Reset Passphrase <span className="text-secondary font-normal font-sans">(leave blank to keep existing)</span>
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-secondary absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter new Argon2id password..."
                  disabled={!isSuperAdmin}
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-10 py-1.5 text-xs text-on-surface font-mono focus:border-gold-accent focus:outline-none disabled:opacity-50"
                  data-testid="edit-admin-passphrase"
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
            onClick={closeEditModal}
            className="px-3 py-1.5 rounded-[4px] border border-border-subtle text-secondary hover:text-on-surface hover:bg-state-hover text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!isSuperAdmin || mutation.isPending}
            className="px-4 py-1.5 rounded-[4px] bg-telemetry-cyan hover:bg-[#00c5dd] text-bg-canvas font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            data-testid="submit-edit-admin-btn"
          >
            {mutation.isPending ? (
              <span>Saving...</span>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5" />
                <span>Save Modifications</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
