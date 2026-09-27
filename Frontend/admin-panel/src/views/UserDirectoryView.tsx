import React from "react"
import { Users, DollarSign, Shield, Vault } from "lucide-react"
import { UserDirectoryTable } from "../components/users/UserDirectoryTable"
import { CreateUserModal } from "../components/users/CreateUserModal"
import { SuspendUserModal } from "../components/users/SuspendUserModal"
import { DirectFundingModal } from "../components/users/DirectFundingModal"

export const UserDirectoryView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6" data-testid="user-directory-view">
      {/* View Header with Title and Sovereign Metric Cards */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-accent" />
            <span>Sovereign User Directory & Ledger Governance</span>
          </h1>
          <p className="text-xs text-secondary mt-0.5">
            Segregated capital custody, access tier elevation, and FINMA Article 14 operational kill-switch
          </p>
        </div>

        {/* 4-Metric High-Density Telemetry Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-bg-panel border border-border-subtle rounded-[4px]">
            <div className="flex items-center justify-between text-secondary mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Total Managed Accounts</span>
              <Users className="w-3.5 h-3.5 text-gold-accent" />
            </div>
            <div className="font-mono tabular-nums text-lg font-bold text-on-surface">1,429</div>
            <div className="text-[10px] text-secondary font-mono mt-0.5">Across 28 Jurisdictions</div>
          </div>

          <div className="p-3 bg-bg-panel border border-border-subtle rounded-[4px]">
            <div className="flex items-center justify-between text-secondary mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Aggregate Available Cash</span>
              <DollarSign className="w-3.5 h-3.5 text-status-success" />
            </div>
            <div className="font-mono tabular-nums text-lg font-bold text-on-surface">$48,290,120.00</div>
            <div className="text-[10px] text-status-success font-mono mt-0.5">Liquid Settlement Ready</div>
          </div>

          <div className="p-3 bg-bg-panel border border-border-subtle rounded-[4px]">
            <div className="flex items-center justify-between text-secondary mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Invested Vault Capital</span>
              <Vault className="w-3.5 h-3.5 text-telemetry-cyan" />
            </div>
            <div className="font-mono tabular-nums text-lg font-bold text-telemetry-cyan">$94,600,300.00</div>
            <div className="text-[10px] text-secondary font-mono mt-0.5">Cold Enclave Custody</div>
          </div>

          <div className="p-3 bg-bg-panel border border-border-subtle rounded-[4px]">
            <div className="flex items-center justify-between text-secondary mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Regulatory Invariants</span>
              <Shield className="w-3.5 h-3.5 text-status-success" />
            </div>
            <div className="font-mono tabular-nums text-lg font-bold text-status-success">100% Balanced</div>
            <div className="text-[10px] text-secondary font-mono mt-0.5">FINMA AML Article 14 Attested</div>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <UserDirectoryTable />

      {/* Governance Modals */}
      <CreateUserModal />
      <SuspendUserModal />
      <DirectFundingModal />
    </div>
  )
}

export default UserDirectoryView
