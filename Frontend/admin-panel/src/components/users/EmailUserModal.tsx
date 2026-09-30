import React, { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import {
  Mail,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { useUserRegistryStore } from "../../store/useUserRegistryStore"
import { emailUser } from "../../api/users"

const EMAIL_TEMPLATES = [
  {
    name: "KYC Compliance Notice",
    subject: "WavyAssets Custody — Annual Institutional KYC & AML Re-verification Notice",
    message: `Dear Client,\n\nIn accordance with FINMA AMLA Article 14 compliance requirements, our compliance desk requires an updated corporate register extract or identification affidavit for your account.\n\nPlease sign in to your WavyAssets executive portal and upload the requested documents under the Verification section.\n\nWarm regards,\nWavyAssets Compliance Desk`,
  },
  {
    name: "Capital Settlement Notice",
    subject: "WavyAssets Treasury — Confirmation of Capital Allocation Settlement",
    message: `Dear Client,\n\nWe have successfully recorded and verified your capital transfer within your segregated ledger custody account.\n\nYour balances are now reflected in your terminal dashboard and available for deployment across our investment vaults.\n\nWarm regards,\nWavyAssets Treasury Operations`,
  },
  {
    name: "Security Advisory",
    subject: "WavyAssets Security — Important Multi-Signature & Hardware Enclave Advisory",
    message: `Dear Client,\n\nOur automated security monitors have performed routine enclave validation on your authenticated devices.\n\nIf you have recently updated your hardware security key or whitelist destinations, please ensure second-officer sign-off is completed.\n\nWarm regards,\nWavyAssets Information Security`,
  },
]

export const EmailUserModal: React.FC = () => {
  const { isEmailUserModalOpen, closeEmailUserModal, selectedUser } = useUserRegistryStore()

  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (selectedUser) {
      setSubject(`WavyAssets Mandate Concierge Notice — ${selectedUser.fullLegalName}`)
      setMessage("")
      setErrorMsg(null)
      setSuccessMsg(null)
    }
  }, [selectedUser])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("No user selected")
      if (!subject.trim()) throw new Error("Email subject is required")
      if (!message.trim()) throw new Error("Email message body is required")

      return emailUser(selectedUser.id, {
        subject: subject.trim(),
        message: message.trim(),
      })
    },
    onSuccess: (data) => {
      setSuccessMsg(data.message || `Email sent successfully to ${selectedUser?.email}`)
      setTimeout(() => {
        closeEmailUserModal()
        setErrorMsg(null)
        setSuccessMsg(null)
      }, 1500)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to send administrative email.")
    },
  })

  if (!isEmailUserModalOpen || !selectedUser) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    mutation.mutate()
  }

  const mailtoHref = `mailto:${selectedUser.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(message)}`

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={closeEmailUserModal}
      data-testid="email-user-modal"
    >
      <div
        className="w-full max-w-lg bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-telemetry-cyan/10 border border-telemetry-cyan/30 flex items-center justify-center text-telemetry-cyan">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">
                Send Direct Email to Client
              </h2>
              <p className="text-xs text-secondary font-mono">
                {selectedUser.fullLegalName} ({selectedUser.email})
              </p>
            </div>
          </div>
          <button
            onClick={closeEmailUserModal}
            className="text-secondary hover:text-on-surface p-1 rounded-[4px] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-status-danger/10 border border-status-danger/30 rounded-[4px] text-xs text-status-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-status-success/10 border border-status-success/30 rounded-[4px] text-xs text-status-success flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Quick Template Picker */}
        <div className="mb-3">
          <span className="font-mono text-[10px] uppercase text-secondary tracking-wider block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-gold-accent" />
            <span>Quick Templates</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {EMAIL_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => {
                  setSubject(tmpl.subject)
                  setMessage(tmpl.message)
                }}
                className="px-2 py-1 bg-bg-canvas hover:bg-state-hover border border-border-subtle rounded-[2px] text-[11px] text-secondary hover:text-on-surface transition-colors cursor-pointer font-sans"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          {/* Subject Line */}
          <div className="space-y-1">
            <label className="font-mono uppercase text-secondary text-[11px] block">
              Subject *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-2 text-on-surface focus:border-gold-accent focus:outline-none"
            />
          </div>

          {/* Message Body */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-mono uppercase text-secondary text-[11px] block">
                Message Body *
              </label>
              <span className="font-mono text-[10px] text-secondary">
                {message.length} chars
              </span>
            </div>
            <textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your official administrative message to the client..."
              className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-3 text-on-surface focus:border-gold-accent focus:outline-none resize-none leading-relaxed font-sans"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-2">
            <a
              href={mailtoHref}
              className="px-3 py-2 rounded-[4px] bg-bg-canvas hover:bg-state-hover border border-border-subtle text-secondary hover:text-on-surface font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open in your default desktop email client"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Mail App</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeEmailUserModal}
                className="px-4 py-2 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                data-testid="email-user-submit"
                className="px-5 py-2 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{mutation.isPending ? "Sending..." : "Send Email"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
