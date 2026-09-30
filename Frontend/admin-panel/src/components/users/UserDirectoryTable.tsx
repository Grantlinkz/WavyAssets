import React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Search,
  UserPlus,
  DollarSign,
  Lock,
  Unlock,
  AlertCircle,
  RefreshCw,
  Building,
  Shield,
  Filter,
  Pencil,
  Mail,
  Trash2,
} from "lucide-react"
import { fetchUsers, type SupremeUser, type UserTier, type UserStatus } from "../../api/users"
import { useUserRegistryStore } from "../../store/useUserRegistryStore"
import { SkeletonTable } from "../common/SkeletonTable"
import { formatCurrency, formatTimestamp } from "../../lib/formatters"

const TIERS: { label: string; value: string }[] = [
  { label: "All Tiers", value: "ALL" },
  { label: "Private Wealth", value: "PRIVATE_WEALTH" },
  { label: "Institutional", value: "INSTITUTIONAL" },
  { label: "Retail", value: "RETAIL" },
  { label: "Tier 3", value: "TIER_3" },
  { label: "Tier 2", value: "TIER_2" },
  { label: "Tier 1", value: "TIER_1" },
]

const STATUSES: { label: string; value: string }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Pending", value: "PENDING_VERIFICATION" },
]

export const UserDirectoryTable: React.FC = () => {
  const {
    searchQuery,
    selectedTier,
    selectedStatus,
    setSearchQuery,
    setSelectedTier,
    setSelectedStatus,
    openCreateUserModal,
    openSuspendModal,
    openFundingModal,
    openEditUserModal,
    openDeleteUserModal,
    openEmailUserModal,
  } = useUserRegistryStore()

  const {
    data: rawUsers,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<SupremeUser[], Error>({
    queryKey: ["users", selectedTier, selectedStatus, searchQuery],
    queryFn: () =>
      fetchUsers({
        search: searchQuery,
        tier: selectedTier,
        status: selectedStatus,
      }),
  })

  const users: SupremeUser[] = Array.isArray(rawUsers) ? rawUsers : []

  const getTierBadge = (tier: UserTier) => {
    switch (tier) {
      case "INSTITUTIONAL":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-gold-accent/15 text-gold-accent border border-gold-accent/30 tracking-wider">
            INSTITUTIONAL
          </span>
        )
      case "PRIVATE_WEALTH":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 tracking-wider">
            PRIVATE WEALTH
          </span>
        )
      case "RETAIL":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 tracking-wider">
            RETAIL
          </span>
        )
      case "TIER_3":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-telemetry-cyan/15 text-telemetry-cyan border border-telemetry-cyan/30 tracking-wider">
            TIER 3
          </span>
        )
      case "TIER_2":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 tracking-wider">
            TIER 2
          </span>
        )
      case "TIER_1":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-secondary/15 text-secondary border border-border-subtle tracking-wider">
            TIER 1
          </span>
        )
    }
  }

  const getStatusChip = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold bg-status-success/15 text-status-success border border-status-success/30">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            ACTIVE
          </span>
        )
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold bg-status-danger/15 text-status-danger border border-status-danger/30">
            <span className="w-1.5 h-1.5 rounded-full bg-status-danger" />
            SUSPENDED
          </span>
        )
      case "FROZEN":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            FROZEN
          </span>
        )
      case "PENDING_VERIFICATION":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold bg-secondary/15 text-secondary border border-border-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            PENDING
          </span>
        )
    }
  }

  const getRiskChip = (riskScore: number) => {
    if (riskScore < 25) {
      return (
        <span className="font-mono text-[11px] text-status-success flex items-center gap-1">
          <Shield className="w-3 h-3 text-status-success" />
          <span>{riskScore} (Low)</span>
        </span>
      )
    }
    if (riskScore < 60) {
      return (
        <span className="font-mono text-[11px] text-amber-400 flex items-center gap-1">
          <Shield className="w-3 h-3 text-amber-400" />
          <span>{riskScore} (Med)</span>
        </span>
      )
    }
    return (
      <span className="font-mono text-[11px] text-status-danger flex items-center gap-1 font-bold">
        <Shield className="w-3 h-3 text-status-danger" />
        <span>{riskScore} (High)</span>
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-4" data-testid="user-directory-container">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-bg-panel border border-border-subtle rounded-[4px] p-3">
        <div className="flex items-center gap-2 flex-1 max-w-md relative">
          <Search className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Users, emails, or IDs..."
            className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 text-xs text-on-surface focus:border-gold-accent focus:outline-none"
            data-testid="user-search-input"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tier Filter */}
          <div className="flex items-center gap-1 bg-bg-canvas border border-border-subtle rounded-[4px] p-1 text-xs">
            <Filter className="w-3 h-3 text-secondary ml-1" />
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-transparent text-secondary hover:text-on-surface focus:outline-none text-xs font-mono cursor-pointer pr-1"
              data-testid="tier-filter-select"
            >
              {TIERS.map((t) => (
                <option key={t.value} value={t.value} className="bg-bg-panel text-on-surface">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-bg-canvas border border-border-subtle rounded-[4px] p-1 text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-secondary hover:text-on-surface focus:outline-none text-xs font-mono cursor-pointer px-1"
              data-testid="status-filter-select"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value} className="bg-bg-panel text-on-surface">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary hover:text-on-surface transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-gold-accent" : ""}`} />
          </button>

          {/* Provision User Button */}
          <button
            onClick={openCreateUserModal}
            className="px-3 py-1.5 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            data-testid="new-user-button"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Main Directory Table View */}
      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : isError ? (
        <div
          className="w-full min-h-[540px] bg-bg-panel border border-border-subtle rounded-[4px] p-8 flex flex-col items-center justify-center text-center"
          data-testid="user-directory-error"
        >
          <div className="w-12 h-12 rounded-full bg-status-danger/10 border border-status-danger/30 flex items-center justify-center text-status-danger mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-on-surface mb-1">
            User Directory Ingestion Error
          </h3>
          <p className="text-xs text-secondary max-w-md mb-4 font-mono">
            {error?.message || "Failed to query Supreme user accounts from primary database shard."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-xs text-on-surface font-medium flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </button>
        </div>
      ) : !users || users.length === 0 ? (
        <div
          className="w-full min-h-[540px] bg-bg-panel border border-border-subtle rounded-[4px] p-8 flex flex-col items-center justify-center text-center"
          data-testid="user-directory-empty"
        >
          <div className="w-12 h-12 rounded-full bg-gold-accent/10 border border-gold-accent/30 flex items-center justify-center text-gold-accent mb-4">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-on-surface mb-1">
            No Users Match Query
          </h3>
          <p className="text-xs text-secondary max-w-md mb-4">
            Adjust active filters or provision a new institutional entity to begin ledger management.
          </p>
          <button
            onClick={openCreateUserModal}
            className="px-4 py-1.5 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-xs text-bg-canvas font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New User</span>
          </button>
        </div>
      ) : (
        <div className="w-full bg-bg-panel border border-border-subtle rounded-[4px] overflow-hidden">
          <div className="overflow-x-auto min-h-[540px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-bg-canvas/60 border-b border-border-subtle text-secondary font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Supreme Entity / Principal</th>
                  <th className="py-2.5 px-3">Corporate Contact</th>
                  <th className="py-2.5 px-3">Access Tier</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Available Cash</th>
                  <th className="py-2.5 px-3 text-right">Invested Capital</th>
                  <th className="py-2.5 px-3 text-right">Total Vault Balance</th>
                  <th className="py-2.5 px-3">Risk Rating</th>
                  <th className="py-2.5 px-3 text-right">Ledger Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 font-sans">
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-state-hover/50 transition-colors ${
                      idx % 2 === 1 ? "bg-bg-canvas/30" : "bg-transparent"
                    }`}
                    data-testid={`user-row-${user.id}`}
                  >
                    {/* Entity Name & Country */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-[2px] bg-bg-elevated border border-border-subtle flex items-center justify-center text-gold-accent shrink-0">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-on-surface flex items-center gap-1.5">
                            <span>{user.fullLegalName}</span>
                            <span className="font-mono text-[9px] px-1 py-0.2 bg-bg-elevated border border-border-subtle text-secondary rounded-[2px]">
                              {user.country}
                            </span>
                          </div>
                          {user.institutionName && (
                            <div className="text-[11px] text-secondary">
                              {user.institutionName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-2 px-3">
                      <div className="font-mono text-secondary text-[11px]">{user.email}</div>
                      <div className="text-[10px] text-secondary/70">
                        Joined {formatTimestamp(user.joinedAt).substring(0, 10)}
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="py-2 px-3">{getTierBadge(user.accessTier)}</td>

                    {/* Status */}
                    <td className="py-2 px-3">{getStatusChip(user.status)}</td>

                    {/* Available Cash (Liquid) */}
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-on-surface font-medium">
                      {formatCurrency(user.balances.availableCash, user.balances.currency)}
                    </td>

                    {/* Invested Capital */}
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-telemetry-cyan font-medium">
                      {formatCurrency(user.balances.investedCapital, user.balances.currency)}
                    </td>

                    {/* Total Vault Balance */}
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-gold-accent font-bold">
                      {formatCurrency(user.balances.totalVaultBalance, user.balances.currency)}
                    </td>

                    {/* Risk Rating */}
                    <td className="py-2 px-3">{getRiskChip(user.riskScore)}</td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Edit details */}
                        <button
                          onClick={() => openEditUserModal(user)}
                          className="px-2 py-1 rounded-[2px] bg-bg-elevated hover:bg-state-hover border border-border-subtle text-secondary hover:text-on-surface font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit User Details"
                          data-testid={`edit-user-${user.id}`}
                        >
                          <Pencil className="w-3 h-3 text-secondary" />
                          <span>Edit</span>
                        </button>

                        {/* Direct Funding (Credit/Debit) */}
                        <button
                          onClick={() => openFundingModal(user)}
                          className="px-2 py-1 rounded-[2px] bg-bg-elevated hover:bg-state-hover border border-border-subtle text-gold-accent hover:border-gold-accent/40 font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Fund User (Credit / Debit)"
                          data-testid={`fund-user-${user.id}`}
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>Fund</span>
                        </button>

                        {/* Email user */}
                        <button
                          onClick={() => openEmailUserModal(user)}
                          className="px-2 py-1 rounded-[2px] bg-bg-elevated hover:bg-state-hover border border-border-subtle text-telemetry-cyan hover:border-telemetry-cyan/40 font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Send Email to User"
                          data-testid={`email-user-${user.id}`}
                        >
                          <Mail className="w-3 h-3" />
                          <span>Email</span>
                        </button>

                        {/* Suspend / Reactivate */}
                        <button
                          onClick={() => openSuspendModal(user)}
                          className={`px-2 py-1 rounded-[2px] font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer border ${
                            user.status === "SUSPENDED"
                              ? "bg-status-success/10 hover:bg-status-success/20 text-status-success border-status-success/30"
                              : "bg-status-warning/10 hover:bg-status-warning/20 text-amber-300 border-status-warning/30"
                          }`}
                          title={user.status === "SUSPENDED" ? "Re-activate Account" : "Enact Account Suspension"}
                          data-testid={`suspend-user-${user.id}`}
                        >
                          {user.status === "SUSPENDED" ? (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>Reactivate</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Suspend</span>
                            </>
                          )}
                        </button>

                        {/* Delete user */}
                        <button
                          onClick={() => openDeleteUserModal(user)}
                          className="px-2 py-1 rounded-[2px] bg-status-danger/10 hover:bg-status-danger/20 border border-status-danger/30 text-status-danger font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete User and All Database Records"
                          data-testid={`delete-user-${user.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
