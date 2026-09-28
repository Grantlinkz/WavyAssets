import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ErrorBoundary } from "./components/common/ErrorBoundary"
import { AdminLayout } from "./components/layout/AdminLayout"
import { useAdminNavStore } from "./store/useAdminNavStore"
import { OverviewView } from "./views/OverviewView"
import { InquiriesView } from "./views/InquiriesView"
import { UserDirectoryView } from "./views/UserDirectoryView"
import { ComplianceView } from "./views/ComplianceView"
import { TreasuryView } from "./views/TreasuryView"
import { DepositRailsView } from "./views/DepositRailsView"
import { VipCardsView } from "./views/VipCardsView"
import { AuditLogView } from "./views/AuditLogView"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
})

export const AppContent: React.FC = () => {
  const { activeRoute } = useAdminNavStore()

  const renderActiveView = () => {
    switch (activeRoute) {
      case "overview":
        return <OverviewView />
      case "inquiries":
        return <InquiriesView />
      case "user-directory":
        return <UserDirectoryView />
      case "compliance":
        return <ComplianceView />
      case "treasury":
        return <TreasuryView />
      case "deposit-rails":
        return <DepositRailsView />
      case "vip-cards":
        return <VipCardsView />
      case "audit-log":
        return <AuditLogView />
      default:
        return <OverviewView />
    }
  }

  return <AdminLayout>{renderActiveView()}</AdminLayout>
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
