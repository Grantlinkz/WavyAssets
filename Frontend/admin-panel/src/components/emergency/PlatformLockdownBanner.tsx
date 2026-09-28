import React, { useState } from "react"
import { AlertOctagon, Unlock, X, ShieldAlert } from "lucide-react"
import { useEmergencyStore } from "../../store/useEmergencyStore"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { executePlatformUnfreeze } from "../../api/emergency"

interface PlatformLockdownBannerProps {
  isFrozen?: boolean
}

export const PlatformLockdownBanner: React.FC<PlatformLockdownBannerProps> = ({ isFrozen }) => {
  const queryClient = useQueryClient()
  const { isPlatformFrozen, setIsPlatformFrozen, freezeStatus } = useEmergencyStore()
  const [showUnfreezeModal, setShowUnfreezeModal] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [justification, setJustification] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const unfreezeMutation = useMutation({
    mutationFn: () => {
      if (!passcode.trim() || !justification.trim()) {
        throw new Error("Dual-key passcode and statutory justification are required.")
      }
      return executePlatformUnfreeze({
        justification: justification.trim(),
        securityPasscode: passcode.trim(),
      })
    },
    onSuccess: () => {
      setIsPlatformFrozen(false)
      setShowUnfreezeModal(false)
      setPasscode("")
      setJustification("")
      setErrorMessage(null)
      queryClient.invalidateQueries({ queryKey: ["emergency-status"] })
      queryClient.invalidateQueries({ queryKey: ["overview-metrics"] })
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to execute platform unfreeze.")
    },
  })

  const activeFrozen = isFrozen !== undefined ? isFrozen : isPlatformFrozen
  if (!activeFrozen) return null

  return (
    <>
      <div
        className="w-full bg-status-danger text-white px-4 py-2 border-b border-red-700 flex flex-wrap items-center justify-between gap-3 shadow-lg select-none z-50 sticky top-0"
        data-testid="platform-lockdown-banner"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-ping">
            <AlertOctagon className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="font-mono text-xs uppercase tracking-wider font-bold">
              DEFCON 1 ACTIVE LOCKDOWN:
            </span>
            <span className="text-xs font-medium">
              Platform emergency freeze active per FINMA Art. 88. Settlement rails, trading, and VIP cards are suspended.
            </span>
            {freezeStatus?.reason && (
              <span className="text-xs opacity-90 italic hidden xl:inline">
                ("{freezeStatus.reason}")
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setErrorMessage(null)
            setShowUnfreezeModal(true)
          }}
          className="px-3 py-1 rounded-[4px] bg-white text-status-danger hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ml-auto cursor-pointer"
          data-testid="lift-freeze-btn"
        >
          <Unlock className="w-3.5 h-3.5" />
          <span>Lift Freeze (Dual-Key)</span>
        </button>
      </div>

      {showUnfreezeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-canvas/85 backdrop-blur-[6px] overflow-y-auto"
          data-testid="unfreeze-modal"
        >
          <div className="w-full max-w-[500px] bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl flex flex-col overflow-hidden my-auto">
            <div className="px-5 py-3.5 bg-bg-elevated border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[4px] bg-status-danger/15 text-status-danger flex items-center justify-center">
                  <Unlock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-on-surface">Lift Platform Emergency Freeze</h3>
              </div>
              <button
                onClick={() => setShowUnfreezeModal(false)}
                className="text-secondary hover:text-on-surface p-1 rounded hover:bg-state-hover transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                unfreezeMutation.mutate()
              }}
              className="p-5 flex flex-col gap-4 text-xs"
            >
              {errorMessage && (
                <div className="p-3 rounded-[4px] bg-status-danger/10 border border-status-danger/30 text-status-danger flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block font-mono uppercase text-secondary mb-1">
                  Operator Dual-Key Security Passcode *
                </label>
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter FIPS hardware security key / PIN..."
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-2 text-on-surface font-mono focus:border-gold-accent focus:outline-none"
                  data-testid="unfreeze-passcode-input"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-secondary mb-1">
                  Statutory Unfreeze Justification *
                </label>
                <textarea
                  required
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Describe resolution of emergency cause and audit authorization..."
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-2 text-on-surface focus:border-gold-accent focus:outline-none resize-none"
                  data-testid="unfreeze-justification-input"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowUnfreezeModal(false)}
                  className="px-3 py-1.5 rounded-[4px] bg-bg-elevated hover:bg-state-hover border border-border-subtle text-secondary hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unfreezeMutation.isPending || !passcode.trim() || !justification.trim()}
                  className="px-4 py-1.5 rounded-[4px] bg-status-danger hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  data-testid="confirm-unfreeze-btn"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{unfreezeMutation.isPending ? "Unfreezing..." : "Authorize Platform Resume"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
