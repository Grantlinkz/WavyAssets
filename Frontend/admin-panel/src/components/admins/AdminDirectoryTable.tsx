import React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Search,
  UserPlus,
  Lock,
  Unlock,
  AlertCircle,
  RefreshCw,
  Filter,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
} from "lucide-react"
import { fetchAdmins, type AdminPersonnel, type AdminPersonnelRole } from "../../api/admins"
import { useAdminDirectoryStore } from "../../store/useAdminDirectoryStore"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import { SkeletonTable } from "../common/SkeletonTable"
import { formatTimestamp } from "../../lib/formatters"

const ROLES: { label: string; value: string }[] = [
  { label: "All Roles", value: "ALL" },
  { label: "Super Admin", value: "SUPER_ADMIN" },
  { label: "Treasury Officer", value: "TREASURY_OFFICER" },
  { label: "Compliance Officer", value: "COMPLIANCE_OFFICER" },
  { label: "Desk Lead", value: "DESK_LEAD" },
  { label: "VIP Concierge", value: "CONCIERGE" },
]

const STATUSES: { label: string; value: string }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
]

export const AdminDirectoryTable: React.FC = () => {
  const {
    searchQuery,
    selectedRole,
    selectedStatus,
    setSearchQuery,
    setSelectedRole,
    setSelectedStatus,
    openCreateModal,
    openEditModal,
    openSuspendModal,
    openDeleteModal,
  } = useAdminDirectoryStore()

  const { operator } = useAdminAuthStore()
  const isSuperAdmin = operator?.role === "SUPER_ADMIN"

  const {
    data: rawAdmins,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<AdminPersonnel[], Error>({
    queryKey: ["admins", selectedRole, selectedStatus, searchQuery],
    queryFn: () =>
      fetchAdmins({
        search: searchQuery,
        role: selectedRole,
        status: selectedStatus,
      }),
  })

  const admins: AdminPersonnel[] = Array.isArray(rawAdmins) ? rawAdmins : []

  const getRoleBadge = (role: AdminPersonnelRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-gold-accent/15 text-gold-accent border border-gold-accent/30 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-accent" />
            SUPER ADMIN
          </span>
        )
      case "TREASURY_OFFICER":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            TREASURY OFFICER
          </span>
        )
      case "COMPLIANCE_OFFICER":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            COMPLIANCE OFFICER
          </span>
        )
      case "DESK_LEAD":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-telemetry-cyan/15 text-telemetry-cyan border border-telemetry-cyan/30 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-telemetry-cyan" />
            DESK LEAD
          </span>
        )
      case "CONCIERGE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            VIP CONCIERGE
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-secondary/15 text-secondary border border-border-subtle tracking-wider">
            {role}
          </span>
        )
    }
  }

  const getStatusChip = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold bg-status-success/15 text-status-success border border-status-success/30">
          <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
          ACTIVE
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold bg-status-danger/15 text-status-danger border border-status-danger/30">
        <span className="w-1.5 h-1.5 rounded-full bg-status-danger" />
        SUSPENDED
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-4" data-testid="admin-directory-container">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-bg-panel border border-border-subtle rounded-[4px] p-3">
        <div className="flex items-center gap-2 flex-1 max-w-md relative">
          <Search className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Personnel, emails, or IDs..."
            className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 text-xs text-on-surface focus:border-gold-accent focus:outline-none"
            data-testid="admin-search-input"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-bg-canvas border border-border-subtle rounded-[4px] p-1 text-xs">
            <Filter className="w-3 h-3 text-secondary ml-1" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent text-secondary hover:text-on-surface focus:outline-none text-xs font-mono cursor-pointer pr-1"
              data-testid="role-filter-select"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-bg-panel text-on-surface">
                  {r.label}
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
              data-testid="admin-status-filter-select"
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

          {/* Register Admin Button */}
          <button
            onClick={openCreateModal}
            disabled={!isSuperAdmin}
            title={isSuperAdmin ? "Register New Personnel" : "Super Admin Clearance Required"}
            className={`px-3 py-1.5 rounded-[4px] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
              isSuperAdmin
                ? "bg-gold-accent hover:bg-[#C5A028] text-bg-canvas"
                : "bg-bg-panel border border-border-subtle text-secondary opacity-60 cursor-not-allowed"
            }`}
            data-testid="new-admin-button"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New Personnel</span>
          </button>
        </div>
      </div>

      {/* Main Directory Table View */}
      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : isError ? (
        <div
          className="w-full min-h-[400px] bg-bg-panel border border-border-subtle rounded-[4px] p-8 flex flex-col items-center justify-center text-center"
          data-testid="admin-directory-error"
        >
          <div className="w-12 h-12 rounded-full bg-status-danger/10 border border-status-danger/30 flex items-center justify-center text-status-danger mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-on-surface mb-1">
            Personnel Directory Ingestion Error
          </h3>
          <p className="text-xs text-secondary max-w-md mb-4 font-mono">
            {error?.message || "Failed to query administrative personnel records from primary database."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-xs text-on-surface font-medium flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </button>
        </div>
      ) : !admins || admins.length === 0 ? (
        <div
          className="w-full min-h-[300px] bg-bg-panel border border-border-subtle rounded-[4px] p-8 flex flex-col items-center justify-center text-center"
          data-testid="admin-directory-empty"
        >
          <UserCheck className="w-10 h-10 text-secondary mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-on-surface mb-1">
            No Administrative Personnel Found
          </h3>
          <p className="text-xs text-secondary max-w-sm mb-4">
            No administrative operators matched the query criteria or active filters.
          </p>
          {isSuperAdmin && (
            <button
              onClick={openCreateModal}
              className="px-3 py-1.5 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register First Personnel</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-bg-panel border border-border-subtle rounded-[4px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="admin-directory-table">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-canvas/50 text-[11px] font-mono text-secondary uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-medium">Personnel Identity</th>
                  <th className="py-2.5 px-4 font-medium">Role Clearance</th>
                  <th className="py-2.5 px-4 font-medium min-w-[280px]">Permissions & Scope</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium">Provisioned Date</th>
                  <th className="py-2.5 px-4 font-medium text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-xs">
                {admins.map((admin) => {
                  const isCurrentSelf = operator?.id === admin.id

                  return (
                    <tr
                      key={admin.id}
                      className="hover:bg-state-hover transition-colors"
                      data-testid={`admin-row-${admin.id}`}
                    >
                      {/* Identity: Name, Email & ID */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-on-surface">
                              {admin.fullName}
                            </span>
                            {isCurrentSelf && (
                              <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-telemetry-cyan/15 text-telemetry-cyan border border-telemetry-cyan/30">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-secondary font-mono">
                            {admin.email}
                          </span>
                          <span className="text-[9px] text-outline font-mono">
                            ID: {admin.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getRoleBadge(admin.role)}
                      </td>

                      {/* Permissions / Description (What they can do) */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 max-w-md">
                          <p className="text-[11px] text-secondary font-sans leading-relaxed">
                            {admin.roleDescription}
                          </p>
                          {admin.permissions && admin.permissions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {admin.permissions.slice(0, 4).map((perm) => (
                                <span
                                  key={perm}
                                  className="px-1.5 py-0.5 rounded-[2px] bg-bg-canvas border border-border-subtle text-[9px] font-mono text-outline"
                                >
                                  {perm}
                                </span>
                              ))}
                              {admin.permissions.length > 4 && (
                                <span className="px-1 py-0.5 text-[9px] font-mono text-secondary">
                                  +{admin.permissions.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusChip(admin.isActive)}
                      </td>

                      {/* Date Created */}
                      <td className="py-3 px-4 font-mono text-[11px] text-secondary whitespace-nowrap">
                        {formatTimestamp(admin.createdAt)}
                      </td>

                      {/* Actions: Edit, Suspend/Unsuspend, Delete */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Action */}
                          <button
                            onClick={() => openEditModal(admin)}
                            disabled={!isSuperAdmin}
                            title={isSuperAdmin ? "Edit Personnel Credentials" : "Super Admin Required"}
                            className="p-1.5 rounded-[3px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary hover:text-telemetry-cyan transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            data-testid={`edit-admin-btn-${admin.id}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Unsuspend Action */}
                          <button
                            onClick={() => openSuspendModal(admin)}
                            disabled={!isSuperAdmin || isCurrentSelf}
                            title={
                              isCurrentSelf
                                ? "Self-suspension prohibited"
                                : isSuperAdmin
                                ? admin.isActive
                                  ? "Suspend Access"
                                  : "Unsuspend Access"
                                : "Super Admin Required"
                            }
                            className={`p-1.5 rounded-[3px] bg-bg-panel hover:bg-state-hover border border-border-subtle transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              admin.isActive
                                ? "text-secondary hover:text-status-danger"
                                : "text-status-success hover:text-status-success"
                            }`}
                            data-testid={`suspend-admin-btn-${admin.id}`}
                          >
                            {admin.isActive ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete Action */}
                          <button
                            onClick={() => openDeleteModal(admin)}
                            disabled={!isSuperAdmin || isCurrentSelf}
                            title={
                              isCurrentSelf
                                ? "Self-deletion prohibited"
                                : isSuperAdmin
                                ? "Permanently Delete Personnel"
                                : "Super Admin Required"
                            }
                            className="p-1.5 rounded-[3px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary hover:text-status-danger transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            data-testid={`delete-admin-btn-${admin.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Telemetry Strip */}
          <div className="border-t border-border-subtle bg-bg-panel/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-secondary">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-telemetry-cyan" />
              <span>RBAC Enforcement: FINMA Circular 2023/1 Multi-Control Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-secondary/70">Total Personnel Records:</span>
              <span className="text-on-surface font-semibold">{admins.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
