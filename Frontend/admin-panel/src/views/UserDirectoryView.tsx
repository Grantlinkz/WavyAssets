import React from "react"
import { Users } from "lucide-react"
import { UserDirectoryTable } from "../components/users/UserDirectoryTable"
import { CreateUserModal } from "../components/users/CreateUserModal"
import { SuspendUserModal } from "../components/users/SuspendUserModal"
import { DirectFundingModal } from "../components/users/DirectFundingModal"

export const UserDirectoryView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6" data-testid="user-directory-view">
      {/* View Header with Title and Supreme Metric Cards */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-accent" />
            <span>Supreme User Directory & Ledger Governance</span>
          </h1>
          <p className="text-xs text-secondary mt-0.5">
            Segregated capital custody, access tier elevation, and FINMA Article 14 operational kill-switch
          </p>
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
