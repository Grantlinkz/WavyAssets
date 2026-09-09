import React from 'react';
import { motion } from 'framer-motion';
import { useTerminalStore, type AssetVerticalId } from '../../store/useTerminalStore';

interface AssetTabMeta {
  id: AssetVerticalId;
  name: string;
  countBadge?: string;
}

const assetTabsList: AssetTabMeta[] = [
  { id: 'crypto', name: 'CRYPTO INVESTMENT', countBadge: '19.4%' },
  { id: 'stocks', name: 'GLOBAL STOCKS', countBadge: 'DMA' },
  { id: 'ai-funds', name: 'AI SYSTEMATIC FUNDS', countBadge: 'H100' },
  { id: 'real-estate', name: 'REAL ESTATE', countBadge: 'SPV' },
  { id: 'cars', name: 'CARS INVENTORY', countBadge: '38' },
  { id: 'vip-cards', name: 'VIP CARDS', countBadge: 'TITANIUM' },
  { id: 'wallet', name: 'WALLET & MPC', countBadge: 'FIPS' },
];

export const AssetNavRail: React.FC = () => {
  const { activeAssetId, setActiveAssetId } = useTerminalStore();

  return (
    <div className="w-full space-y-0" data-testid="asset-nav-rail">
      {/* Asset Class Navigation Tab Rail */}
      <div className="w-full bg-surface-container-low px-4 sm:px-6 pt-2 rounded-t-sm border border-outline/30 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* 7 Horizontal Verticals Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none -mb-px">
            {assetTabsList.map((tab) => {
              const isActive = tab.id === activeAssetId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`asset-tab-${tab.id}`}
                  onClick={() => setActiveAssetId(tab.id)}
                  className={`group relative flex items-center gap-2 px-3 py-2.5 font-sans text-xs uppercase transition-colors shrink-0 cursor-pointer rounded-t-sm ${
                    isActive
                      ? 'text-primary font-bold bg-surface-container-high shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span>{tab.name}</span>
                  {tab.countBadge && (
                    <span
                      className={`font-mono text-[9px] px-1.5 py-0.5 rounded-sm uppercase ${
                        isActive
                          ? 'bg-primary/20 text-primary font-bold'
                          : 'bg-surface-container-highest text-outline'
                      }`}
                    >
                      {tab.countBadge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeAssetTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary -z-0"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          
        </div>
      </div>
    </div>
  );
};
