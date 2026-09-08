import React from 'react';
import { motion } from 'framer-motion';
import { useTerminalStore, type AssetVerticalId } from '../../store/useTerminalStore';

interface AssetTabMeta {
  id: AssetVerticalId;
  index: string;
  name: string;
  countBadge?: string;
}

const assetTabsList: AssetTabMeta[] = [
  { id: 'crypto', index: '01', name: 'CRYPTO INVESTMENT', countBadge: '19.4%' },
  { id: 'stocks', index: '02', name: 'GLOBAL STOCKS', countBadge: 'DMA' },
  { id: 'ai-funds', index: '03', name: 'AI SYSTEMATIC FUNDS', countBadge: 'H100' },
  { id: 'real-estate', index: '04', name: 'REAL ESTATE', countBadge: 'SPV' },
  { id: 'cars', index: '05', name: 'CARS INVENTORY', countBadge: '38' },
  { id: 'vip-cards', index: '06', name: 'VIP CARDS', countBadge: 'TITANIUM' },
  { id: 'wallet', index: '07', name: 'WALLET & MPC', countBadge: 'FIPS' },
];

export const AssetNavRail: React.FC = () => {
  const { activeAssetId, setActiveAssetId, telemetry } = useTerminalStore();
  const currentTab = assetTabsList.find((t) => t.id === activeAssetId) || assetTabsList[0];

  return (
    <div className="w-full space-y-0" data-testid="asset-nav-rail">
      {/* 1. Protocol Sub-Header & Live Feed Bar */}
      <div className="w-full bg-surface-container-lowest px-4 sm:px-6 py-2.5 rounded-t-sm border-t border-x border-outline/30 flex flex-col xl:flex-row xl:items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="flex items-center gap-1.5 uppercase text-primary font-bold tracking-widest shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            LIVE RUNTIME
          </span>
          <span className="text-outline select-none">/</span>
          <span className="text-on-surface-variant tracking-wider truncate">
            SYSTEM ACTIVE <span className="text-outline mx-1">//</span> PROTOCOL FIX 4.4{' '}
            <span className="text-outline mx-1">//</span> VAULT SYNC: 100%{' '}
            <span className="text-outline mx-1">//</span> SPEED:{' '}
            <span className="text-secondary font-bold">
              {telemetry.lastSwitchDurationMs > 0
                ? `${telemetry.lastSwitchDurationMs}ms`
                : '0.04ms'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-on-surface-variant shrink-0">
          <span className="text-outline uppercase tracking-wider">WAVY ASSETS</span>
          <span className="text-outline">&rsaquo;</span>
          <span className="text-outline uppercase tracking-wider">INVESTMENT SERVICES</span>
          <span className="text-outline">&rsaquo;</span>
          <span className="text-primary font-bold uppercase tracking-wider bg-surface-container px-2 py-0.5 rounded-sm border border-outline/20">
            [{currentTab.index}] {currentTab.name}
          </span>
        </div>
      </div>

      {/* 2. Asset Class Navigation Tab Rail */}
      <div className="w-full bg-surface-container-low px-4 sm:px-6 pt-2 border-b border-x border-outline/30 shadow-sm">
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
                  <span
                    className={`font-mono text-[10px] ${
                      isActive ? 'text-primary' : 'text-outline group-hover:text-primary'
                    }`}
                  >
                    {tab.index}
                  </span>
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

          {/* Right Mode Filter Controls */}
          <div className="flex items-center gap-1.5 pb-2 lg:pb-0 shrink-0 font-mono text-[10px]">
            <span className="px-2.5 py-1 bg-surface-container-highest text-primary rounded-sm font-semibold tracking-wider">
              DIRECT ALLOCATION
            </span>
            <span className="px-2.5 py-1 bg-surface-container text-outline rounded-sm tracking-wider hidden sm:inline-block">
              100% MERKLE BACKED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
