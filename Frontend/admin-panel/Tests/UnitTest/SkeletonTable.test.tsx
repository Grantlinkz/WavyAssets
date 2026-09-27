// Vitest globals enabled
import { renderToString } from "react-dom/server"
import { SkeletonTable } from "../../src/components/common/SkeletonTable"

describe("SkeletonTable", () => {
  it("renders with default minHeight and telemetry header", () => {
    const html = renderToString(<SkeletonTable />)
    expect(html).toContain('data-testid="skeleton-table"')
    expect(html).toContain("min-h-[540px]")
    expect(html).toContain("Ingesting Shard Buffers...")
    expect(html).toContain("14ms RTT")
  })

  it("applies custom title and custom minHeight", () => {
    const html = renderToString(
      <SkeletonTable
        title="Hydrating Real-Time Settlement Ledger Rails"
        minHeight="min-h-[600px]"
      />
    )
    expect(html).toContain("Hydrating Real-Time Settlement Ledger Rails")
    expect(html).toContain("min-h-[600px]")
  })

  it("renders requested number of rows and columns with wavy-skeleton shimmer", () => {
    const html = renderToString(<SkeletonTable rows={5} columns={6} />)
    expect(html).toContain("wavy-skeleton")
  })

  it("applies custom column widths", () => {
    const html = renderToString(
      <SkeletonTable rows={2} columns={3} columnWidths={["w-32", "w-48", "w-20"]} />
    )
    expect(html).toContain("w-32")
    expect(html).toContain("w-48")
  })
})