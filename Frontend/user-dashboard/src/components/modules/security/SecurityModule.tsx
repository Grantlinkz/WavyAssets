import React, { useState } from 'react';
import { ShieldCheck, Download, Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SecurityScorecard } from './SecurityScorecard';
import { HardwareKeyManager } from './HardwareKeyManager';
import { ActiveSessionsBlotter } from './ActiveSessionsBlotter';
import { WhitelistAddressManager } from './WhitelistAddressManager';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useGovernanceStore } from '../../../store/useGovernanceStore';

interface SecurityModuleProps {
  maskBalances?: boolean;
}

export const SecurityModule: React.FC<SecurityModuleProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const revokeAllOtherSessions = useGovernanceStore((s) => s.revokeAllOtherSessions);
  const isCardFrozen = useGovernanceStore((s) => s.isCardFrozen);
  const toggleFreezeCard = useGovernanceStore((s) => s.toggleFreezeCard);

  const [lockdownActive, setLockdownActive] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportAudit = () => {
    if (typeof window !== 'undefined' && window.document) {
      const csvContent =
        'data:text/csv;charset=utf-8,Module,Status,Defense_Score,HSM_Attestation\nSecurity_Command_Center,Armed,100/100,0x9f1a...c44d\n';
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `WavyAssets_Security_Audit_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setExportNotice('Cryptographic Security Audit exported successfully.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleEmergencyLockdown = () => {
    revokeAllOtherSessions();
    if (!isCardFrozen) {
      toggleFreezeCard();
    }
    setLockdownActive(true);
    setTimeout(() => setLockdownActive(false), 4000);
  };

  return (
    <div
      data-testid="security-module"
      data-mask-balances={maskBalances ? 'true' : 'false'}
      className="min-h-[540px] w-full space-y-6 select-none"
    >
      {/* 1. Header Ribbon & Attestation Badges */}
      <div className="bg-surface-container-low p-4 rounded-DEFAULT border border-border-hairline space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-[10px] text-outline tracking-wider uppercase">
            <span>Portfolio</span>
            <span>/</span>
            <span>Governance & Global Attestation</span>
            <span>/</span>
            <span className="text-primary font-semibold">Security Command Center & Access Vault</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              type="button"
              data-testid="export-security-audit-btn"
              onClick={handleExportAudit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-high hover:bg-surface-bright text-on-surface rounded-DEFAULT transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span className="uppercase text-[11px] font-bold">Export Audit (PDF)</span>
            </button>
            <button
              type="button"
              data-testid="emergency-lockdown-btn"
              onClick={handleEmergencyLockdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-error/15 hover:bg-error text-error hover:text-surface rounded-DEFAULT transition-colors cursor-pointer font-bold"
            >
              <Lock className="w-3.5 h-3.5 animate-pulse" />
              <span className="uppercase text-[11px]">Emergency Lockdown</span>
            </button>
          </div>
        </div>

        {/* Hardware Status Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-hairline/60 font-mono text-[10px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-DEFAULT border border-border-hairline">
            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_currentColor]" />
            <span className="text-on-surface uppercase font-semibold">
              HSM: Gemalto Luna SA FIPS 140-2 Level 4 Armed
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-DEFAULT border border-border-hairline">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-on-surface-variant font-mono uppercase">
              Attestation: 0x9f1a...c44d
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-DEFAULT border border-border-hairline">
            <span className="w-2 h-2 rounded-full bg-tertiary" />
            <span className="text-on-surface uppercase">
              Multi-Sig Threshold: 2-of-3 Airgapped Cold Enclave
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1.5 text-tertiary font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>FINMA / AMLA Art. 9 Verified</span>
          </div>
        </div>
      </div>

      {lockdownActive && (
        <div className="p-3 bg-error/15 border border-error/40 text-error font-mono text-xs rounded-DEFAULT flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>Emergency Lockdown broadcast: All pending sessions frozen; dual physical hardware touch required to lift.</span>
        </div>
      )}

      {exportNotice && (
        <div className="p-2.5 bg-tertiary/10 border border-tertiary/30 text-tertiary font-mono text-xs rounded-DEFAULT flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2. Security Posture Scorecard Deck */}
      <SecurityScorecard />

      {/* 3. Split: Hardware Key Vault & Active Client Sessions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <HardwareKeyManager />
        </div>
        <div className="lg:col-span-6">
          <ActiveSessionsBlotter />
        </div>
      </section>

      {/* 4. Mandatory Whitelist Address Guard & Time-Lock Matrix */}
      <WhitelistAddressManager />
    </div>
  );
};
