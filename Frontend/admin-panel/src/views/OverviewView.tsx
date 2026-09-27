import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Lock, Droplets, PenTool, CheckCircle, Clock, RefreshCw, Layers } from "lucide-react"
import { MetricCard } from "../components/overview/MetricCard"
import { SettlementLedger } from "../components/overview/SettlementLedger"
import { fetchOverviewMetrics, type OverviewMetrics } from "../api/overview"
import { formatCurrency, formatPercentage } from "../lib/formatters"

export const OverviewView: React.FC = () => {
  const [timeHorizon, setTimeHorizon] = useState("24h")
  const [currency, setCurrency] = useState("ALL")

  const {
    data: metrics,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<OverviewMetrics, Error>({
    queryKey: ["overview-metrics"],
    queryFn: fetchOverviewMetrics,
    retry: 2,
  })

  // Format metric values safely when loaded
  const totalBalance = metrics
    ? formatCurrency(metrics.totalVaultBalance, "USD")
    : "$142,890,420.00"
  const liquidCapital = metrics
    ? formatCurrency(metrics.liquidSettlementCapital, "USD")
    : "$28,450,110.50"
  const netSettlement = metrics
    ? `+${formatCurrency(metrics.netSettlement24h, "USD")}`
    : "+$12,410,900.00"
  const pendingActions = metrics ? `${metrics.actionQueuePending} Pending` : "10 Pending"

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200" data-testid="overview-view">
      {/* Top View Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-gold-accent rounded-[2px] shrink-0" />
          <div>
            <h1 className="text-xl font-semibold text-gold-accent tracking-tight flex items-center gap-2.5">
              <span>Executive Overview & Settlement Ledger</span>
              <span className="font-mono text-[10px] text-secondary uppercase bg-bg-panel px-2 py-0.5 rounded-[2px] border border-border-subtle tracking-widest font-normal">
                CH-8400 Depository
              </span>
            </h1>
            <p className="text-xs text-secondary mt-0.5">
              Real-time multi-asset liquidity, cold storage telemetry, and clearing rail ledger.
            </p>
          </div>
        </div>

        {/* Global Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Horizon Filter */}
          <div className="flex items-center bg-bg-panel border border-border-subtle rounded-[4px] px-2.5 py-1.5 text-secondary text-xs">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-secondary" />
            <span className="font-mono text-[10px] uppercase text-secondary/70 mr-1.5">Horizon:</span>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="bg-transparent text-on-surface font-medium focus:outline-none cursor-pointer"
            >
              <option value="24h" className="bg-bg-panel text-on-surface">Last 24 Hours</option>
              <option value="7d" className="bg-bg-panel text-on-surface">Last 7 Days</option>
              <option value="30d" className="bg-bg-panel text-on-surface">Last 30 Days</option>
            </select>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center bg-bg-panel border border-border-subtle rounded-[4px] px-2.5 py-1.5 text-secondary text-xs">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-gold-accent" />
            <span className="font-mono text-[10px] uppercase text-secondary/70 mr-1.5">Asset:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-on-surface font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-bg-panel text-on-surface">Multi-Asset Consolidated</option>
              <option value="USD" className="bg-bg-panel text-on-surface">USD Fiat</option>
              <option value="CHF" className="bg-bg-panel text-on-surface">CHF Sovereign</option>
              <option value="EUR" className="bg-bg-panel text-on-surface">EUR Reserve</option>
            </select>
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-bg-elevated hover:bg-state-hover text-on-surface border border-border-subtle rounded-[4px] px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-telemetry-cyan ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh Snapshot</span>
          </button>
        </div>
      </div>

      {/* Primary 4-Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Total Vault Balance */}
        <MetricCard
          title="Total Vault Balance"
          value={totalBalance}
          change={metrics ? formatPercentage(metrics.vaultBalanceChange24h) : "+3.4%"}
          isPositive={true}
          description="vs. 24h prior rolling"
          icon={Lock}
          iconColorClass="text-gold-accent"
          isLoading={isLoading}
        />

        {/* Metric 2: Liquid Settlement Capital */}
        <MetricCard
          title="Liquid Settlement Capital"
          value={liquidCapital}
          description="Active across 4 tier-1 liquidity rails"
          icon={Droplets}
          iconColorClass="text-telemetry-cyan"
          badgeText="TIER-1 LIQUIDITY"
          badgeColorClass="text-telemetry-cyan bg-telemetry-cyan/10 border-telemetry-cyan/30"
          isLoading={isLoading}
        />

        {/* Metric 3: Action Queue */}
        <MetricCard
          title="Action Queue"
          value={pendingActions}
          description={metrics?.actionQueueWarning || "3 multi-sig wires > $100k awaiting dual clearance"}
          icon={PenTool}
          iconColorClass="text-status-warning"
          badgeText="SIGNATURE REQUIRED"
          badgeColorClass="text-status-warning bg-status-warning/10 border-status-warning/40"
          isLoading={isLoading}
        />

        {/* Metric 4: 24h Net Settlement */}
        <MetricCard
          title="24h Net Settlement"
          value={netSettlement}
          change={metrics ? formatPercentage(8.2) : "+8.2%"}
          isPositive={true}
          description={`${metrics?.settledTransactionsCount24h || 42} gross settled transaction batches`}
          icon={CheckCircle}
          iconColorClass="text-status-success"
          isLoading={isLoading}
        />
      </div>

      {/* Real-time Settlement Ledger Table */}
      <SettlementLedger
        timeHorizon={timeHorizon}
        currency={currency}
      />
    </div>
  )
}
