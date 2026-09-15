import React from 'react';
import { useGovernanceStore } from '../../../store/useGovernanceStore';

export const SecurityScorecard: React.FC = () => {
  const destinations = useGovernanceStore((s) => s.destinations);
  const approvedCount = destinations.filter((d) => !d.isTimeLocked).length;
  const quarantinedCount = destinations.filter((d) => d.isTimeLocked).length;

  return (
    <div
      data-testid="security-scorecard-deck"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 font-mono"
    >
      {/* Card 1: Overall Posture */}
      <div className="bg-surface-container-low p-4 rounded-DEFAULT border border-border-hairline flex flex-col justify-between hover:bg-surface-container transition-colors">
        <div className="flex items-start justify-between">
          <span className="text-[10px] text-outline uppercase tracking-wider">Overall Posture</span>
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-tertiary/10 text-tertiary text-[10px] rounded-DEFAULT font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            ACTIVE
          </span>
        </div>

        <div className="my-3">
          <div className="font-serif text-2xl text-primary font-bold tracking-tight">MAXIMUM</div>
          <div className="text-xs text-on-surface-variant font-sans mt-0.5">
            100 / 100 Defense Index
          </div>
        </div>

        <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-[10px] text-outline">
          <span>Pen-Test: 14D Clean</span>
          <span className="text-tertiary font-bold">0 Vulnerabilities</span>
        </div>
      </div>

      {/* Card 2: Auth Engine */}
      <div className="bg-surface-container-low p-4 rounded-DEFAULT border border-border-hairline flex flex-col justify-between hover:bg-surface-container transition-colors">
        <div className="flex items-start justify-between">
          <span className="text-[10px] text-outline uppercase tracking-wider">Auth Engine</span>
          <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-DEFAULT font-bold">
            FIPS 140-3
          </span>
        </div>

        <div className="my-3">
          <div className="text-lg text-on-surface font-bold">Argon2id + FIDO2</div>
          <div className="text-xs text-on-surface-variant font-sans mt-0.5">
            Memory-Hard KDF + WebAuthn
          </div>
        </div>

        <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-[10px] text-outline">
          <span>Policy Enforcement</span>
          <span className="text-primary font-bold">&gt;$0.00 Strict Challenge</span>
        </div>
      </div>

      {/* Card 3: Whitelist Guard */}
      <div className="bg-surface-container-low p-4 rounded-DEFAULT border border-border-hairline flex flex-col justify-between hover:bg-surface-container transition-colors">
        <div className="flex items-start justify-between">
          <span className="text-[10px] text-outline uppercase tracking-wider">Whitelist Guard</span>
          <span className="px-1.5 py-0.5 bg-secondary/15 text-secondary text-[10px] rounded-DEFAULT font-bold">
            48H COLD LOCK
          </span>
        </div>

        <div className="my-3">
          <div className="font-serif text-2xl text-secondary font-bold tracking-tight">
            STRICT TIME-LOCK
          </div>
          <div className="text-xs text-on-surface-variant font-sans mt-0.5">
            Quarantine on New Routes
          </div>
        </div>

        <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-[10px] text-outline tabular-nums">
          <span>{approvedCount} Approved Destinations</span>
          <span className="text-secondary font-bold">{quarantinedCount} In Quarantine</span>
        </div>
      </div>

      {/* Card 4: HSM Multisig Quorum */}
      <div className="bg-surface-container-low p-4 rounded-DEFAULT border border-border-hairline flex flex-col justify-between hover:bg-surface-container transition-colors">
        <div className="flex items-start justify-between">
          <span className="text-[10px] text-outline uppercase tracking-wider">
            HSM Multisig Quorum
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-tertiary/10 text-tertiary text-[10px] rounded-DEFAULT font-bold">
            HEALTHY
          </span>
        </div>

        <div className="my-3">
          <div className="text-lg text-on-surface font-bold tabular-nums">2 of 3 Keys Online</div>
          <div className="text-xs text-on-surface-variant font-sans mt-0.5">
            Airgapped Enclaves Synced
          </div>
        </div>

        <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-[10px] text-outline">
          <span>Consensus Gateway</span>
          <span className="text-tertiary font-bold">Ready for Execution</span>
        </div>
      </div>
    </div>
  );
};
