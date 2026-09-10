import React from 'react';
import { Download, Terminal } from 'lucide-react';
import { useTerminalStore } from '../../store/useTerminalStore';

export const MegaMenuDiagnostics: React.FC = () => {
  const openAuthModal = useTerminalStore((state) => state.openAuthModal);
  const setMegaMenuOpen = useTerminalStore((state) => state.setMegaMenuOpen);

  const handleDownloadMandate = () => {
    setMegaMenuOpen(false);
    openAuthModal('institutional');
  };

  const handleLaunchSimulator = () => {
    setMegaMenuOpen(false);
    const simulatorSection = document.getElementById('portfolio-simulator');
    if (simulatorSection) {
      simulatorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="lg:col-span-4 flex flex-col justify-between space-y-4 bg-surface-container-low/95 p-5 rounded-sm border border-outline/30">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-outline/30">
          <span className="text-[11px] font-semibold uppercase text-primary tracking-widest">
            VAULT HEALTH &amp; PLATFORM STATUS
          </span>
          <span className="text-[10px] text-secondary font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span>ALL SYSTEMS LIVE</span>
          </span>
        </div>

        {/* Collateral Gauge */}
        <div className="bg-surface-container-lowest p-3 rounded-sm space-y-2 border border-outline/20">
          <div className="text-on-surface-variant dark:text-neutral-400 font-mono text-[10px] uppercase">
            Total Protected Vault Reserves
          </div>
          <div className="font-mono text-lg font-semibold text-on-surface flex items-baseline gap-2">
            <span>$1,248,500,000</span>
            <span className="text-secondary text-xs font-normal">AVAILABLE</span>
          </div>
          <div className="w-full h-1.5 rounded-sm bg-surface-container-highest flex overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '62%' }} />
            <div className="h-full bg-secondary" style={{ width: '28%' }} />
          </div>
          <div className="flex justify-between text-on-surface-variant dark:text-neutral-400 font-mono text-[10px]">
            <span>62% ACTIVELY INVESTED</span>
            <span>38% CASH BUFFER</span>
          </div>
        </div>

        {/* Execution Telemetry Details */}
        <div className="space-y-2 text-on-surface-variant dark:text-neutral-300 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-outline/20">
            <span>Secure Vault Hubs:</span>
            <span className="font-mono text-on-surface font-medium">Zurich, New York, Singapore</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-outline/20">
            <span>Execution Speed:</span>
            <span className="font-mono text-secondary font-medium">&lt; 0.04ms (Instant)</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-outline/20">
            <span>Daily Account Updates:</span>
            <span className="font-mono text-on-surface font-medium">04:00 UTC (Automated)</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span>Reserve Backing:</span>
            <span className="font-mono text-primary font-medium">100% Fully Backed</span>
          </div>
        </div>
      </div>

      {/* Action Triggers */}
      <div className="space-y-2.5 pt-3 border-t border-outline/30">
        <button
          type="button"
          onClick={handleDownloadMandate}
          className="w-full py-2.5 px-3 rounded-sm bg-primary-container text-on-primary-container text-[11px] uppercase font-bold tracking-wider hover:bg-primary-hover transition-colors text-center flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Safety &amp; Custody Guide</span>
        </button>

        <button
          type="button"
          onClick={handleLaunchSimulator}
          className="w-full py-2.5 px-3 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] uppercase font-semibold tracking-wider transition-colors text-center flex items-center justify-center gap-2 border border-outline/40 cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span>Calculate Potential Returns</span>
        </button>

        <a
          href="#/docs/enclave-api"
          onClick={(e) => {
            e.preventDefault();
            setMegaMenuOpen(false);
          }}
          className="block w-full py-1 text-center text-on-surface-variant dark:text-neutral-400 hover:text-on-surface font-mono text-[10px] uppercase tracking-wider transition-colors"
        >
          DEVELOPER &amp; INSTITUTIONAL API DOCS &rarr;
        </a>
      </div>
    </div>
  );
};
