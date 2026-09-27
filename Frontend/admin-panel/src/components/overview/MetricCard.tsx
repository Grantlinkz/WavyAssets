import React from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export interface MetricCardProps {
  title: string
  value: string
  subValue?: string
  change?: string
  isPositive?: boolean
  description: string
  icon: React.ComponentType<{ className?: string }>
  iconColorClass?: string
  badgeText?: string
  badgeColorClass?: string
  isLoading?: boolean
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  change,
  isPositive,
  description,
  icon: Icon,
  iconColorClass = "text-gold-accent",
  badgeText,
  badgeColorClass = "text-status-warning bg-status-warning/10 border-status-warning/40",
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-bg-panel border border-border-subtle rounded-[4px] p-4 flex flex-col justify-between h-36">
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <div className="w-28 h-3 wavy-skeleton rounded-[2px]" />
          <div className="w-4 h-4 wavy-skeleton rounded-full" />
        </div>
        <div className="pt-2">
          <div className="w-40 h-7 wavy-skeleton rounded-[2px] mb-2" />
          <div className="w-24 h-3 wavy-skeleton rounded-[2px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-bg-panel border border-border-subtle rounded-[4px] p-4 flex flex-col justify-between hover:border-gold-accent/40 transition-colors h-36">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
        <span className="font-mono text-[11px] text-secondary uppercase tracking-wider font-medium">
          {title}
        </span>
        <Icon className={`w-4 h-4 ${iconColorClass}`} />
      </div>

      {/* Main Metric Value */}
      <div className="pt-2">
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-xl lg:text-2xl text-on-surface font-semibold tracking-tight tabular-nums">
            {value}
            {subValue && <span className="text-secondary text-sm font-normal">{subValue}</span>}
          </div>
          {badgeText && (
            <span
              className={`font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] border ${badgeColorClass}`}
            >
              {badgeText}
            </span>
          )}
        </div>

        {/* Footer Delta / Description */}
        <div className="flex items-center gap-2 mt-1.5 text-xs">
          {change && (
            <span
              className={`inline-flex items-center font-mono font-medium ${
                isPositive ? "text-status-success" : "text-status-danger"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {change}
            </span>
          )}
          <span className="text-secondary text-[11px] truncate">{description}</span>
        </div>
      </div>
    </div>
  )
}
