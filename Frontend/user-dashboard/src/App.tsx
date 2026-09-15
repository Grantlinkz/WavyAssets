import React, { useEffect, useState } from 'react';
import { useDashboardStore } from './store/useDashboardStore';
import { TopHeader } from './components/nav/TopHeader';
import { SidebarRail } from './components/nav/SidebarRail';
import { MobileHeader } from './components/nav/MobileHeader';
import { AuthCallback } from './components/auth/AuthCallback';
import { VerticalPlaceholder } from './components/modules/VerticalPlaceholder';
import { GlobalCommandBar } from './components/command-bar/GlobalCommandBar';
import { DepositModal } from './components/modals/DepositModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { TradeModal } from './components/modals/TradeModal';
import { KycDrawer } from './components/modals/KycDrawer';

export const App: React.FC = () => {
  const { theme, activeVertical } = useDashboardStore();

  // Synchronize theme class with document element
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Compute initial route state without synchronous effect call
  const [isAuthCallbackRoute, setIsAuthCallbackRoute] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname.includes('/auth/callback') ||
        window.location.search.includes('ticket=') ||
        window.location.hash.includes('ticket=')
      );
    }
    return false;
  });

  if (isAuthCallbackRoute) {
    return <AuthCallback onComplete={() => setIsAuthCallbackRoute(false)} />;
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Persistent Master Header */}
      <TopHeader />

      {/* Persistent Universal Command Bar */}
      <GlobalCommandBar />

      {/* Mobile Slide-over Drawer */}
      <MobileHeader />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex w-full relative">
        {/* Docked Left Sidebar Navigation Rail */}
        <SidebarRail />

        {/* Dynamic Vertical Workspace (Sub-50ms swapping, zero CLS) */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 flex flex-col min-w-0 bg-surface focus:outline-none"
        >
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            <VerticalPlaceholder key={activeVertical} />
          </div>
        </main>
      </div>

      {/* Global Institutional Action Modals */}
      <DepositModal />
      <WithdrawModal />
      <TradeModal />
      <KycDrawer />
    </div>
  );
};

export default App;

