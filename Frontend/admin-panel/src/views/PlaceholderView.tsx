import React from "react"
import { ArrowLeft, Shield } from "lucide-react"
import { useAdminNavStore, type AdminRoute } from "../store/useAdminNavStore"

interface PlaceholderViewProps {
  route: AdminRoute
  title: string
  sprintPhase: string
  description: string
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  sprintPhase,
  description,
}) => {
  const { setActiveRoute } = useAdminNavStore()

  return (
    <div className="w-full min-h-[500px] bg-bg-panel border border-border-subtle rounded-[4px] p-8 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
      <div className="w-12 h-12 rounded-[4px] bg-gold-accent/10 border border-gold-accent/30 flex items-center justify-center text-gold-accent mb-4">
        <Shield className="w-6 h-6" />
      </div>
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-bg-canvas border border-border-subtle text-secondary font-mono text-[11px] mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-gold-accent" />
        <span>Roadmap Phase: {sprintPhase}</span>
      </div>
      <h2 className="text-lg font-semibold text-on-surface mb-2">{title}</h2>
      <p className="text-xs text-secondary max-w-md mb-6">{description}</p>
      <button
        onClick={() => setActiveRoute("overview")}
        className="px-4 py-2 bg-bg-elevated hover:bg-state-hover border border-border-subtle text-xs font-mono text-on-surface rounded-[4px] flex items-center gap-2 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-gold-accent" />
        <span>Return to Executive Overview</span>
      </button>
    </div>
  )
}
