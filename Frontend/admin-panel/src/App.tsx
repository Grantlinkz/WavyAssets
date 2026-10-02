import React, { useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ErrorBoundary } from "./components/common/ErrorBoundary"
import { AdminLayout } from "./components/layout/AdminLayout"
import { useAdminNavStore } from "./store/useAdminNavStore"
import { useAdminAuthStore } from "./store/useAdminAuthStore"
import { OverviewView } from "./views/OverviewView"
import { InquiriesView } from "./views/InquiriesView"
import { UserDirectoryView } from "./views/UserDirectoryView"
import { ComplianceView } from "./views/ComplianceView"
import { TreasuryView } from "./views/TreasuryView"
import { DepositRailsView } from "./views/DepositRailsView"
import { VipCardsView } from "./views/VipCardsView"
import { AuditLogView } from "./views/AuditLogView"
import { AdminDirectoryView } from "./views/AdminDirectoryView"

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
  const { isAuthenticated, logout, setLoginModalOpen, rehydrateSession } = useAdminAuthStore()

  useEffect(() => {
    rehydrateSession().catch(() => {})
  }, [rehydrateSession])

  useEffect(() => {
    if (!isAuthenticated) {
      setLoginModalOpen(true)
    }
  }, [isAuthenticated, setLoginModalOpen])

  useEffect(() => {
    const handleSessionExpired = () => {
      logout()
      setLoginModalOpen(true)
    }

    window.addEventListener("wavy:session_expired", handleSessionExpired)
    return () => {
      window.removeEventListener("wavy:session_expired", handleSessionExpired)
    }
  }, [logout, setLoginModalOpen])

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
      case "admin-directory":
        return <AdminDirectoryView />
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
