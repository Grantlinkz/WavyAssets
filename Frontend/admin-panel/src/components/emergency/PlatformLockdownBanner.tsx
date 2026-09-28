import React from "react"
import { AlertOctagon, Unlock } from "lucide-react"
import { useEmergencyStore } from "../../store/useEmergencyStore"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { executePlatformUnfreeze } from "../../api/emergency"

interface PlatformLockdownBannerProps {
  isFrozen?: boolean
}

export const PlatformLockdownBanner: React.FC<PlatformLockdownBannerProps> = ({ isFrozen }) => {
  const queryClient = useQueryClient()
  const { isPlatformFrozen, setIsPlatformFrozen, freezeStatus } = useEmergencyStore()

  const unfreezeMutation = useMutation({
    mutationFn: () =>
      executePlatformUnfreeze({
        justification: "Risk mitigation complete. Authorized dual-key platform resume.",
        securityPasscode: "FIPS-9942",
      }),
    onSuccess: () => {
      setIsPlatformFrozen(false)
      queryClient.invalidateQueries({ queryKey: ["emergency-status"] })
      queryClient.invalidateQueries({ queryKey: ["overview-metrics"] })
    },
  })

  const activeFrozen = isFrozen !== undefined ? isFrozen : isPlatformFrozen
  if (!activeFrozen) return null

  return (
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
        onClick={() => unfreezeMutation.mutate()}
        disabled={unfreezeMutation.isPending}
        className="px-3 py-1 rounded-[4px] bg-white text-status-danger hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ml-auto cursor-pointer"
        data-testid="lift-freeze-btn"
      >
        <Unlock className="w-3.5 h-3.5" />
        <span>Lift Freeze (Dual-Key)</span>
      </button>
    </div>
  )
}
