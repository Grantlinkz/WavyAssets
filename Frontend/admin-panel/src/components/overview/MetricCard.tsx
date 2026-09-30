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
      <div className="bg-bg-panel border border-border-subtle rounded-[4px] p-4 flex flex-col justify-between min-h-[148px]">
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
    <div className="bg-bg-panel border border-border-subtle rounded-[4px] p-4 flex flex-col justify-between hover:border-gold-accent/40 transition-colors min-h-[148px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle gap-2">
        <span
          className="font-mono text-[11px] text-secondary uppercase tracking-wider font-medium truncate"
          title={title}
        >
          {title}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {badgeText && (
            <span
              className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] border font-medium whitespace-nowrap ${badgeColorClass}`}
            >
              {badgeText}
            </span>
          )}
          <Icon className={`w-4 h-4 shrink-0 ${iconColorClass}`} />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="py-2.5 flex-1 flex flex-col justify-center">
        <div
          className="font-mono text-xl sm:text-2xl text-on-surface font-semibold tracking-tight tabular-nums truncate"
          title={value}
        >
          {value}
          {subValue && (
            <span className="text-secondary text-xs sm:text-sm font-normal ml-1.5">
              {subValue}
            </span>
          )}
        </div>
      </div>

      {/* Footer Delta / Description */}
      <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/50 text-xs">
        {change && (
          <span
            className={`inline-flex items-center font-mono text-[11px] font-medium shrink-0 ${
              isPositive ? "text-status-success" : "text-status-danger"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
            )}
            {change}
          </span>
        )}
        <span
          className="text-secondary text-[11px] truncate leading-tight"
          title={description}
        >
          {description}
        </span>
      </div>
    </div>
  )
}
