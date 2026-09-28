import React from "react"

interface SkeletonTableProps {
  rows?: number
  columns?: number
  columnWidths?: string[]
  minHeight?: string
  title?: string
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 8,
  columns = 7,
  columnWidths,
  minHeight = "min-h-[540px]",
  title = "Ingesting Shard Buffers...",
}) => {
  return (
    <div
      className={`w-full bg-bg-panel border border-border-subtle rounded-[4px] overflow-hidden flex flex-col ${minHeight}`}
      data-testid="skeleton-table"
    >
      {/* Telemetry Header */}
      <div className="px-4 py-2.5 bg-bg-panel border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full wavy-skeleton" />
          <span className="text-xs uppercase font-mono tracking-wider text-secondary">
            {title}
          </span>
          <span className="text-xs font-mono text-secondary/60">• Hydrating Shards</span>
        </div>
      </div>

      {/* Table Structure */}
      <div className="overflow-x-auto w-full flex-1">
        <table className="w-full border-collapse text-left">
          {/* Table Header Skeleton */}
          <thead>
            <tr className="bg-bg-panel border-b border-border-subtle">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="py-2.5 px-4">
                  <div
                    className={`h-3 wavy-skeleton rounded-[2px] ${
                      columnWidths && columnWidths[i] ? columnWidths[i] : "w-20"
                    }`}
                  />
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Rows Skeleton */}
          <tbody className="divide-y divide-border-subtle">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="bg-bg-panel/40 hover:bg-state-hover/20 transition-colors"
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="py-3 px-4">
                    <div
                      className={`h-4 wavy-skeleton rounded-[2px] ${
                        columnWidths && columnWidths[colIndex]
                          ? columnWidths[colIndex]
                          : colIndex === 0
                          ? "w-24"
                          : colIndex === 1
                          ? "w-36"
                          : "w-16"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer Shimmer */}
      <div className="px-4 py-3 bg-bg-panel/80 border-t border-border-subtle flex items-center justify-between">
        <div className="w-32 h-3 wavy-skeleton rounded-[2px]" />
        <div className="flex gap-2">
          <div className="w-16 h-6 wavy-skeleton rounded-[4px]" />
          <div className="w-16 h-6 wavy-skeleton rounded-[4px]" />
        </div>
      </div>
    </div>
  )
}
