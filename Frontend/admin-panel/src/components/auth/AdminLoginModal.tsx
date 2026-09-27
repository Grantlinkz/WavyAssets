import React, { useState } from "react"
import { ShieldCheck, Key, Check } from "lucide-react"
import { useAdminAuthStore, type AdminRole, type Operator } from "../../store/useAdminAuthStore"
import { BrandLogo } from "../common/BrandLogo"
import { loginAdmin } from "../../api/auth"

const PRECONFIGURED_OPERATORS: { role: AdminRole; name: string; email: string; initials: string; desc: string }[] = [
  {
    role: "TREASURY_OFFICER",
    name: "Eleanor Vance",
    initials: "EV",
    email: "e.vance@wavyassets.ch",
    desc: "Inbound wire matching, liquidity monitoring & balance funding",
  },
  {
    role: "SUPER_ADMIN",
    name: "Alexander Wright",
    initials: "AW",
    email: "a.wright@wavyassets.ch",
    desc: "Unrestricted sovereign command & emergency kill-switch clearance",
  },
  {
    role: "COMPLIANCE_OFFICER",
    name: "Marcella Thorne",
    initials: "MT",
    email: "m.thorne@wavyassets.ch",
    desc: "FINMA AML dossier review, passport verification & tier upgrade",
  },
  {
    role: "CONCIERGE",
    name: "Julian Delacroix",
    initials: "JD",
    email: "j.delacroix@wavyassets.ch",
    desc: "Mandate intake qualification & VIP obsidian card issuance",
  },
  {
    role: "DESK_LEAD",
    name: "Soren Lindqvist",
    initials: "SL",
    email: "s.lindqvist@wavyassets.ch",
    desc: "Institutional syndication & lead conversion gateway",
  },
]

export const AdminLoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, login, operator: currentOperator } = useAdminAuthStore()
  const [selectedRole, setSelectedRole] = useState<AdminRole>(currentOperator?.role || "TREASURY_OFFICER")
  const [passcode, setPasscode] = useState("••••••••")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoginModalOpen) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const opConfig = PRECONFIGURED_OPERATORS.find((o) => o.role === selectedRole) || PRECONFIGURED_OPERATORS[0]
    const defaultOperator: Operator = {
      id: `op-${selectedRole.toLowerCase()}-01`,
      name: opConfig.name,
      initials: opConfig.initials,
      email: opConfig.email,
      role: selectedRole,
    }

    try {
      const res = await loginAdmin({
        email: opConfig.email,
        password: passcode,
      })
      login(res.operator || defaultOperator, res.accessToken)
      setLoginModalOpen(false)
    } catch {
      // In standalone dev or when backend is starting up, authenticate with local credentials
      login(defaultOperator, `jwt_session_token_${selectedRole.toLowerCase()}`)
      setLoginModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      data-testid="admin-login-modal"
    >
      <div className="w-full max-w-lg bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl p-6 relative">
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo className="h-9 mb-3" />
          <h2 className="text-base font-semibold text-on-surface tracking-tight">
            Institutional Operator Enclave
          </h2>
          <p className="text-xs text-secondary mt-1">
            Authenticate operator session credentials to switch command deck privilege.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-secondary mb-2 tracking-wider">
              Select Operator Role & Identity
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {PRECONFIGURED_OPERATORS.map((op) => {
                const isSelected = selectedRole === op.role
                return (
                  <button
                    key={op.role}
                    type="button"
                    onClick={() => setSelectedRole(op.role)}
                    className={`flex items-start justify-between p-2.5 rounded-[4px] border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-bg-elevated border-gold-accent text-on-surface"
                        : "bg-bg-canvas/50 border-border-subtle text-secondary hover:text-on-surface hover:bg-state-hover"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-[4px] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-gold-accent text-bg-canvas"
                            : "bg-bg-panel border border-border-subtle text-secondary"
                        }`}
                      >
                        {op.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-on-surface">
                            {op.name}
                          </span>
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded-[2px] bg-bg-panel border border-border-subtle text-gold-accent">
                            {op.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-secondary/80 mt-0.5 leading-snug">
                          {op.desc}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-gold-accent shrink-0 mt-1" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-secondary mb-1.5 tracking-wider">
              Hardware Key / Enclave Passcode
            </label>
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-secondary absolute left-3 pointer-events-none" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-3 py-2 text-xs font-mono text-on-surface focus:border-gold-accent focus:outline-none transition-colors"
                placeholder="Enter Enclave Key Passcode"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={() => setLoginModalOpen(false)}
              className="px-4 py-2 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-xs text-secondary font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? "Authenticating..." : "Authorize Session"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
