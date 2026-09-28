import React, { useState } from "react"
import { ShieldCheck, Key, Mail, ShieldAlert } from "lucide-react"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import { BrandLogo } from "../common/BrandLogo"
import { loginAdmin } from "../../api/auth"

export const AdminLoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, login } = useAdminAuthStore()
  const [email, setEmail] = useState("")
  const [passcode, setPasscode] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoginModalOpen) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setAuthError(null)

    try {
      const res = await loginAdmin({
        email: email.trim(),
        password: passcode,
      })
      if (res && res.operator) {
        login(res.operator, res.accessToken)
        setLoginModalOpen(false)
      } else {
        setAuthError("Authentication succeeded but operator payload was missing.")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Invalid operator credentials."
      setAuthError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      data-testid="admin-login-modal"
    >
      <div className="w-full max-w-md bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl p-6 relative">
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo className="h-9 mb-3" />
          <h2 className="text-base font-semibold text-on-surface tracking-tight">
            Institutional Operator Enclave
          </h2>
          <p className="text-xs text-secondary mt-1">
            Authenticate operator session credentials to access sovereign command deck privilege.
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-status-danger/10 border border-status-danger/30 rounded-[4px] text-xs text-status-danger flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-secondary mb-1.5 tracking-wider">
              Operator Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-secondary absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-3 py-2 text-xs font-mono text-on-surface focus:border-gold-accent focus:outline-none transition-colors"
                placeholder="operator@wavyassets.ch"
              />
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
