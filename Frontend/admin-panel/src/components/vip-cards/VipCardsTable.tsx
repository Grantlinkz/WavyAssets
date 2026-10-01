import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, RefreshCw, Lock, Unlock, CreditCard, AlertCircle } from "lucide-react"
import { useVipCardsStore } from "../../store/useVipCardsStore"
import { fetchVipCards, toggleVipCardFreeze, type VipCardItem } from "../../api/vipCards"
import { SkeletonTable } from "../common/SkeletonTable"
import { formatCurrency } from "../../lib/formatters"

export const VipCardsTable: React.FC = () => {
  const queryClient = useQueryClient()
  const { searchQuery, setSearchQuery, statusFilter, setStatusFilter } = useVipCardsStore()
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null)

  const {
    data: cardsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vip-cards", searchQuery, statusFilter],
    queryFn: () => fetchVipCards({ search: searchQuery, status: statusFilter }),
  })

  const cards: VipCardItem[] = Array.isArray(cardsData) ? cardsData : []

  const toggleMutation = useMutation({
    mutationFn: ({ id, isFrozen }: { id: string; isFrozen: boolean }) =>
      toggleVipCardFreeze(id, isFrozen),
    onMutate: async ({ id, isFrozen }) => {
      setToggleLoadingId(id)
      // Optimistic update for <50ms interaction SLA
      await queryClient.cancelQueries({ queryKey: ["vip-cards"] })
      const previousCards = queryClient.getQueryData<VipCardItem[]>(["vip-cards", searchQuery, statusFilter])
      if (previousCards) {
        queryClient.setQueryData<VipCardItem[]>(
          ["vip-cards", searchQuery, statusFilter],
          previousCards.map((c) => (c.id === id ? { ...c, isFrozen } : c))
        )
      }
      return { previousCards }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(["vip-cards", searchQuery, statusFilter], context.previousCards)
      }
    },
    onSettled: () => {
      setToggleLoadingId(null)
      queryClient.invalidateQueries({ queryKey: ["vip-cards"] })
      queryClient.invalidateQueries({ queryKey: ["vip-cards-telemetry"] })
    },
  })

  const handleToggleFreeze = (card: VipCardItem) => {
    toggleMutation.mutate({ id: card.id, isFrozen: !card.isFrozen })
  }

  // Filter calculations
  const totalCount = cards.length
  const activeCount = cards.filter((c) => !c.isFrozen).length
  const lockedCount = cards.filter((c) => c.isFrozen).length
  const transitCount = cards.filter((c) => c.shippingStatus === "IN_TRANSIT").length

  const getSubstrateBadge = (sub: string) => {
    if (sub.includes("Tungsten")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-bg-canvas border border-gold-accent/40 text-gold-accent font-mono text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-accent shrink-0" />
          <span>Obsidian 42g Tungsten</span>
        </span>
      )
    }
    if (sub.includes("Titanium")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-bg-canvas border border-secondary/40 text-secondary font-mono text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
          <span>Silver Titanium 18g</span>
        </span>
      )
    }
    if (sub.includes("Celebrity") || sub.includes("Gold")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-bg-canvas border border-[#FFD700]/50 text-[#FFD700] font-mono text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shrink-0" />
          <span>Celebrity Membership Card</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-bg-canvas border border-border-subtle text-on-surface font-mono text-[10px]">
        <span className="w-1.5 h-1.5 rounded-full bg-on-surface shrink-0" />
        <span>Supreme 28g Steel</span>
      </span>
    )
  }

  return (
    <div
      className="bg-bg-panel border border-border-subtle rounded-[4px] flex flex-col overflow-hidden min-h-[540px]"
      data-testid="vip-cards-table-container"
    >
      {/* Table Controls Toolbar */}
      <div className="p-3 border-b border-border-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-bg-panel">
        {/* Filter Segmented Tabs */}
        <div className="flex items-center gap-1 bg-bg-canvas p-1 rounded-[4px] border border-border-subtle">
          {[
            { id: "ALL" as const, label: "All Cards", count: totalCount, countColor: "text-secondary" },
            { id: "ACTIVE" as const, label: "Active", count: activeCount, countColor: "text-status-success" },
            { id: "LOCKED" as const, label: "Locked", count: lockedCount, countColor: "text-status-danger" },
            { id: "IN_TRANSIT" as const, label: "In Transit", count: transitCount, countColor: "text-telemetry-cyan" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-[2px] text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-bg-elevated text-on-surface border border-border-subtle shadow-sm"
                  : "text-secondary hover:text-on-surface hover:bg-state-hover"
              }`}
              data-testid={`filter-tab-${tab.id.toLowerCase()}`}
            >
              {tab.label} <span className={`font-mono ml-1 ${tab.countColor}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Live Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by cardholder, masked PAN, CIF..."
              className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 text-xs text-on-surface placeholder:text-secondary focus:border-gold-accent focus:outline-none transition-colors"
              data-testid="vip-search-input"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-[4px] border border-border-subtle bg-bg-elevated hover:bg-state-hover text-secondary hover:text-on-surface cursor-pointer"
            title="Refresh Feed"
            data-testid="refresh-vip-btn"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table or Loading Skeleton */}
      {isLoading ? (
        <SkeletonTable minHeight="min-h-[540px]" columns={8} rows={8} />
      ) : isError ? (
        <div className="min-h-[540px] flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-10 h-10 text-status-danger mb-2" />
          <h3 className="text-sm font-semibold text-on-surface">Unable to load VIP cards ledger</h3>
          <p className="text-xs text-secondary font-mono mt-1 max-w-md">
            {(error as Error)?.message || "A network or RPC error occurred while connecting to the core ledger."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-3 py-1.5 rounded-[4px] bg-bg-elevated border border-border-subtle text-xs text-on-surface hover:border-gold-accent"
          >
            Retry Connection
          </button>
        </div>
      ) : cards.length === 0 ? (
        <div className="min-h-[540px] flex flex-col items-center justify-center p-6 text-center text-secondary">
          <CreditCard className="w-10 h-10 mb-2 opacity-40 text-gold-accent" />
          <span className="text-sm font-medium text-on-surface">No VIP Cards Found</span>
          <span className="text-xs font-mono text-secondary mt-0.5">
            Adjust search filter or click "+ Mint New VIP Card" to issue a high-density metal card.
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse text-left" data-testid="vip-cards-table">
            <thead>
              <tr className="bg-bg-canvas border-b border-border-subtle text-secondary font-mono text-[10px] uppercase tracking-wider select-none">
                <th className="py-2.5 px-4 font-semibold">Cardholder Name &amp; Account</th>
                <th className="py-2.5 px-3 font-semibold">Card Tier &amp; Density</th>
                <th className="py-2.5 px-3 font-semibold">Masked PAN</th>
                <th className="py-2.5 px-3 font-semibold text-right">Daily Limit</th>
                <th className="py-2.5 px-3 font-semibold">Medium</th>
                <th className="py-2.5 px-3 font-semibold">Vault &amp; Courier</th>
                <th className="py-2.5 px-3 font-semibold text-center">Terminal State</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {cards.map((card) => {
                const isMutating = toggleLoadingId === card.id
                return (
                  <tr
                    key={card.id}
                    className="hover:bg-state-hover transition-colors group"
                    data-testid={`card-row-${card.id}`}
                  >
                    {/* Cardholder & Account */}
                    <td className="py-2.5 px-4">
                      {(() => {
                        const rawCard = card as unknown as Record<string, unknown>
                        const rawUser = rawCard.user as Record<string, unknown> | undefined
                        const displayName =
                          card.userName ||
                          (typeof rawUser?.fullName === "string" ? rawUser.fullName : null) ||
                          (typeof rawCard.cardholderName === "string" ? rawCard.cardholderName : null) ||
                          "VIP Client"
                        const initials = displayName
                          .split(" ")
                          .filter(Boolean)
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("") || "VC"
                        const userCif =
                          card.userCif ||
                          `CIF-${(card.userId || card.id || "0000").slice(0, 8).toUpperCase()}`
                        const userTier =
                          card.userTier ||
                          (typeof rawUser?.tier === "string" ? `${rawUser.tier} Tier` : "Institutional Tier")

                        return (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-[4px] bg-bg-elevated border border-border-subtle flex items-center justify-center font-mono text-xs text-gold-accent font-bold">
                              {initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-on-surface group-hover:text-gold-accent transition-colors">
                                {displayName}
                              </span>
                              <span className="font-mono text-[10px] text-secondary">
                                {userCif} • {userTier}
                              </span>
                            </div>
                          </div>
                        )
                      })()}
                    </td>

                    {/* Substrate & Tier */}
                    <td className="py-2.5 px-3">
                      {getSubstrateBadge(
                        card.substrate ||
                          (card.tier === "CELEBRITY"
                            ? "Celebrity 24K Gold & Diamond"
                            : card.tier === "TITANIUM"
                            ? "Silver Titanium"
                            : card.tier === "Supreme"
                            ? "Black Supreme Stainless"
                            : "Obsidian 42g Tungsten")
                      )}
                    </td>

                    {/* Masked PAN */}
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-xs tracking-widest text-on-surface font-semibold">
                        {card.tier === "CELEBRITY" || card.substrate?.includes("Celebrity")
                          ? "MEMBERSHIP PASS"
                          : card.maskedPan || `•••• •••• •••• ${card.cardNumberLast4 || "0000"}`}
                      </span>
                    </td>

                    {/* Daily Limit */}
                    <td className="py-2.5 px-3 text-right">
                      {card.tier === "CELEBRITY" || card.substrate?.includes("Celebrity") ? (
                        <>
                          <span className="font-mono text-xs text-gold-accent font-semibold">
                            Event Pass (N/A)
                          </span>
                          <span className="block font-mono text-[10px] text-secondary">No Spend Limit</span>
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-xs text-on-surface font-semibold">
                            {formatCurrency(card.dailySpendLimit)}
                          </span>
                          <span className="block font-mono text-[10px] text-secondary">USD / 24h</span>
                        </>
                      )}
                    </td>

                    {/* Medium */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-secondary text-xs">
                        <CreditCard className="w-3.5 h-3.5 text-gold-accent" />
                        <span>{card.cardType === "PHYSICAL" ? "Physical Metal" : "Virtual NFC"}</span>
                      </span>
                    </td>

                    {/* Shipping / Vault Status */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-[11px] text-on-surface font-medium">
                          {card.destination}
                        </span>
                        <span className="font-mono text-[10px] text-secondary">
                          {card.shippingStatus === "DELIVERED"
                            ? "Custody Secured"
                            : card.shippingStatus === "IN_TRANSIT"
                            ? "Armored Courier En Route"
                            : "Vault Enclave"}
                        </span>
                      </div>
                    </td>

                    {/* Terminal State */}
                    <td className="py-2.5 px-3 text-center">
                      {card.isFrozen ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-status-danger/10 text-status-danger border border-status-danger/30 font-mono text-[10px] font-semibold">
                          <Lock className="w-3 h-3" />
                          <span>LOCKED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-status-success/10 text-status-success border border-status-success/30 font-mono text-[10px] font-semibold">
                          <Unlock className="w-3 h-3" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </td>

                    {/* Actions: 1-Click Killswitch Toggle */}
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleFreeze(card)}
                        disabled={isMutating}
                        className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors cursor-pointer border ${
                          card.isFrozen
                            ? "bg-status-success/10 border-status-success/40 text-status-success hover:bg-status-success hover:text-bg-canvas"
                            : "bg-status-danger/10 border-status-danger/40 text-status-danger hover:bg-status-danger hover:text-white"
                        }`}
                        data-testid={`freeze-toggle-${card.id}`}
                      >
                        {card.isFrozen ? (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Unlock Terminal</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Instant Freeze</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
