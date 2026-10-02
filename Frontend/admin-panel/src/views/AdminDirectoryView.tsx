import React from "react"
import { useQuery } from "@tanstack/react-query"
import { UserCog, ShieldCheck, ShieldAlert, Users, UserCheck } from "lucide-react"
import { AdminDirectoryTable } from "../components/admins/AdminDirectoryTable"
import { CreateAdminModal } from "../components/admins/CreateAdminModal"
import { EditAdminModal } from "../components/admins/EditAdminModal"
import { SuspendAdminModal } from "../components/admins/SuspendAdminModal"
import { DeleteAdminModal } from "../components/admins/DeleteAdminModal"
import { fetchAdmins, type AdminPersonnel } from "../api/admins"

export const AdminDirectoryView: React.FC = () => {
  const { data: rawAdmins } = useQuery<AdminPersonnel[]>({
    queryKey: ["admins", "ALL", "ALL", ""],
    queryFn: () => fetchAdmins({ role: "ALL", status: "ALL" }),
  })

  const admins = Array.isArray(rawAdmins) ? rawAdmins : []
  const totalCount = admins.length
  const activeCount = admins.filter((a) => a.isActive).length
  const suspendedCount = admins.filter((a) => !a.isActive).length
  const superAdminCount = admins.filter((a) => a.role === "SUPER_ADMIN").length

  return (
    <div className="flex flex-col gap-6" data-testid="admin-directory-view">
      {/* View Header with Title & Subtitle */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <UserCog className="w-5 h-5 text-gold-accent" />
            <span>Institutional Administrative Directory & RBAC Governance</span>
          </h1>
          <p className="text-xs text-secondary mt-0.5 font-sans">
            Privileged personnel credentials, clearance elevation, and FINMA Article 14 multi-control audit
          </p>
        </div>

        {/* Supreme Metric Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Personnel */}
          <div className="bg-bg-panel border border-border-subtle rounded-[4px] p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gold-accent" />
              Total Personnel
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-on-surface">
                {totalCount}
              </span>
              <span className="text-[10px] font-mono text-secondary">Directory Entries</span>
            </div>
          </div>

          {/* Active Credentials */}
          <div className="bg-bg-panel border border-border-subtle rounded-[4px] p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-status-success" />
              Active Clearance
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-status-success">
                {activeCount}
              </span>
              <span className="text-[10px] font-mono text-status-success/80">Authorized</span>
            </div>
          </div>

          {/* Suspended Personnel */}
          <div className="bg-bg-panel border border-border-subtle rounded-[4px] p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-status-danger" />
              Suspended Access
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-status-danger">
                {suspendedCount}
              </span>
              <span className="text-[10px] font-mono text-status-danger/80">Revoked</span>
            </div>
          </div>

          {/* Super Administrators */}
          <div className="bg-bg-panel border border-border-subtle rounded-[4px] p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-accent" />
              Super Admins
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-gold-accent">
                {superAdminCount}
              </span>
              <span className="text-[10px] font-mono text-gold-accent/80">Root Quorum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <AdminDirectoryTable />

      {/* Administrative Governance Modals */}
      <CreateAdminModal />
      <EditAdminModal />
      <SuspendAdminModal />
      <DeleteAdminModal />
    </div>
  )
}

export default AdminDirectoryView
