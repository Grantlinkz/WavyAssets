import React from 'react';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { Lock, ShieldCheck, Key, CheckCircle2 } from 'lucide-react';

export const WalletPanel: React.FC = () => {
  const { openAuthModal } = useTerminalStore();

  const securityNodes = [
    {
      id: 'node-zh',
      name: 'Zurich Military Bunker Enclave',
      hardware: 'Thales Luna PCIe HSM (FIPS 140-3 Level 4)',
      role: 'Sovereign Root Key Shard A',
      status: 'Active • 0.04ms Ping',
    },
    {
      id: 'node-ge',
      name: 'Geneva Freeport Deep Storage',
      hardware: 'Securosys Primus HSM Cluster',
      role: 'Time-Lock Quorum Shard B',
      status: 'Active • Air-Gapped',
    },
    {
      id: 'node-ny',
      name: 'New York Equinix NY4 Cage',
      hardware: 'Hardware Co-Processor MPC Mesh',
      role: 'Execution Validator Shard C',
      status: 'Active • Direct Cross-Connect',
    },
  ];

  return (
    <div className="w-full space-y-6" data-testid="panel-wallet">
      {/* Hero */}
      <div className="w-full bg-surface-container-low p-6 rounded-sm border border-outline/30 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-surface-container-high text-primary font-mono text-[10px] uppercase tracking-widest rounded-sm border border-outline/20">
                [ INSTITUTIONAL DIGITAL CUSTODY // MPC MULTI-SIG QUORUM ]
              </span>
              <span className="px-2 py-0.5 bg-secondary/15 text-secondary font-mono text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1 border border-secondary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                FIPS 140-3 LEVEL 4 HSM ENCLAVES
              </span>
            </div>

            <h3 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Digital Custody &amp; Multi-Sig MPC Enclave
            </h3>

            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Institutional digital asset vaulting powered by threshold cryptography and multi-party
              computation (MPC). Private keys never exist in complete form at rest or during
              signing. Governed under Swiss FINMA VQF frameworks and underwritten by Lloyd&apos;s of
              London.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="btn-open-vault"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-sans text-xs uppercase rounded-sm hover:bg-primary-hover transition-colors font-bold shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Initialize Vault Quorum</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface font-sans text-xs uppercase rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer border border-outline/20"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                <span>Verify Real-Time Merkle Proof</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-container-lowest p-4 rounded-sm border border-outline/20 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-outline/20">
              <span className="font-sans text-[11px] uppercase text-outline tracking-wider font-semibold">
                CUSTODY ENCLAVE METRICS
              </span>
              <span className="font-mono text-[10px] text-secondary font-semibold">
                100% MERKLE ATTESTED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">INSURANCE COVER</div>
                <div className="font-mono text-xl font-bold text-primary pt-0.5">$500M</div>
                <div className="font-mono text-[9px] text-outline">Lloyd&apos;s Specie</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">QUORUM MODEL</div>
                <div className="font-mono text-xl font-bold text-on-surface pt-0.5">3-of-5</div>
                <div className="font-mono text-[9px] text-secondary">MPC Threshold</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">TIME-LOCK SLA</div>
                <div className="font-mono text-xl font-bold text-secondary pt-0.5">24h</div>
                <div className="font-mono text-[9px] text-outline">Configurable Delay</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nodes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" />
            GEOGRAPHICALLY DISTRIBUTED HSM ENCLAVES
          </span>
          <span className="font-mono text-[10px] text-outline">
            CURRENT MERKLE ROOT: 0x8F92...C41A
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {securityNodes.map((n) => (
            <div
              key={n.id}
              className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/50 transition-colors flex flex-col justify-between gap-3 shadow-sm"
            >
              <div className="space-y-1">
                <div className="font-sans font-bold text-sm text-on-surface">{n.name}</div>
                <div className="font-mono text-xs text-outline">{n.hardware}</div>
                <div className="font-mono text-[11px] text-primary font-semibold">{n.role}</div>
              </div>

              <div className="pt-2 border-t border-outline/20 flex items-center justify-between text-[11px] font-mono">
                <span className="text-secondary flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-secondary" />
                  {n.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
