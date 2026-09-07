import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTerminalStore, type AssetVerticalId } from '../../store/useTerminalStore';
import { AssetNavRail } from './AssetNavRail';
import { CryptoPanel } from './views/CryptoPanel';
import { StocksPanel } from './views/StocksPanel';
import { AiFundsPanel } from './views/AiFundsPanel';
import { RealEstatePanel } from './views/RealEstatePanel';
import { CarsPanel } from './views/CarsPanel';
import { VipCardsPanel } from './views/VipCardsPanel';
import { WalletPanel } from './views/WalletPanel';

interface AssetContainerProps {
  initialAssetId?: AssetVerticalId;
}

export const AssetContainer: React.FC<AssetContainerProps> = ({ initialAssetId }) => {
  const storeAssetId = useTerminalStore((state) => state.activeAssetId);
  const syncFromHash = useTerminalStore((state) => state.syncFromHash);
  const activeAssetId = initialAssetId ?? storeAssetId;

  // Window hash listener for client-side deep linking and history back/forward traversal
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial sync
    syncFromHash();

    const handleHashChange = () => {
      syncFromHash();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [syncFromHash]);

  const renderActivePanel = () => {
    switch (activeAssetId) {
      case 'crypto':
        return <CryptoPanel />;
      case 'stocks':
        return <StocksPanel />;
      case 'ai-funds':
        return <AiFundsPanel />;
      case 'real-estate':
        return <RealEstatePanel />;
      case 'cars':
        return <CarsPanel />;
      case 'vip-cards':
        return <VipCardsPanel />;
      case 'wallet':
        return <WalletPanel />;
      default:
        return <CryptoPanel />;
    }
  };

  return (
    <div
      id="asset-container"
      data-testid="asset-container"
      className="w-full space-y-0 scroll-mt-20"
    >
      {/* 7-Vertical Segmented Navigation Rail */}
      <AssetNavRail />

      {/* Standardized Frame with locked min-height: 540px to strictly enforce CLS = 0 */}
      <div
        data-testid="asset-panel-viewport"
        className="w-full min-h-[540px] bg-surface-container-lowest/50 border-b border-x border-outline/30 rounded-b-sm p-4 sm:p-6 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAssetId}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            {renderActivePanel()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
