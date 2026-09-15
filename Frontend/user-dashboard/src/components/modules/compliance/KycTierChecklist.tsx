import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { KYC_TIERS, CORPORATE_ENTITY_PROFILE } from '../../../lib/governanceAssetData';

export const KycTierChecklist: React.FC = () => {
  return (
    <div
      data-testid="kyc-tier-checklist-panel"
      className="bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-primary" />
          <div>
            <span className="font-mono text-[10px] text-outline uppercase tracking-widest block">
              Sovereign Tier Architecture
            </span>
            <h2 className="font-serif text-sm font-semibold text-on-surface">
              Institutional Accreditation & Custody Tier 3
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 bg-tertiary/10 text-tertiary border border-tertiary/30 rounded-DEFAULT font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            Perpetual Sovereign Standing Active
          </span>
          <span className="text-outline">Certified Re-Audit: 14 Jan 2025</span>
        </div>
      </div>

      {/* 3-Tier Flow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {KYC_TIERS.map((tier) => (
          <div
            key={tier.level}
            className={`p-4 rounded-DEFAULT border flex flex-col justify-between gap-3 relative overflow-hidden ${
              tier.status === 'ACTIVE_TIER'
                ? 'bg-primary/10 border-primary/40 text-primary shadow-md'
                : 'bg-surface-container-low border-border-hairline text-on-surface'
            }`}
          >
            {tier.status === 'ACTIVE_TIER' && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-container/20 to-transparent pointer-events-none rounded-bl-full" />
            )}

            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-outline uppercase tracking-widest block">
                  {tier.tag}
                </span>
                <span className="font-serif text-sm font-bold text-on-surface">
                  {tier.name}
                </span>
              </div>

              {tier.status === 'ACTIVE_TIER' ? (
                <span className="px-2 py-0.5 bg-primary text-surface font-mono text-[10px] font-bold rounded-DEFAULT">
                  CURRENT TIER
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-tertiary/15 text-tertiary font-mono text-[10px] font-semibold rounded-DEFAULT flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  COMPLETED
                </span>
              )}
            </div>

            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-outline">Daily Liquidity Cap:</span>
                <span className="font-bold text-on-surface tabular-nums">
                  {tier.dailyLiquidityCap}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-outline">Notarized Hash:</span>
                <span className="text-outline font-mono">{tier.hash}</span>
              </div>
            </div>

            <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  tier.status === 'ACTIVE_TIER' ? 'bg-primary' : 'bg-tertiary'
                } w-full`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Regulatory Telemetry Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 font-mono">
        <div className="bg-surface-container-low p-3 rounded-DEFAULT border border-border-hairline">
          <span className="text-[10px] text-outline uppercase block">Settlement Protocol</span>
          <span className="text-sm font-bold text-on-surface mt-0.5 block">Atomic Instant DvP</span>
          <span className="text-[10px] text-tertiary">Real-time Gross Settlement</span>
        </div>

        <div className="bg-surface-container-low p-3 rounded-DEFAULT border border-border-hairline">
          <span className="text-[10px] text-outline uppercase block">LEI (GLEIF Verified)</span>
          <span className="text-sm font-bold text-primary font-mono tracking-tight mt-0.5 block">
            {CORPORATE_ENTITY_PROFILE.lei}
          </span>
          <span className="text-[10px] text-outline">{CORPORATE_ENTITY_PROFILE.leiStatus}</span>
        </div>

        <div className="bg-surface-container-low p-3 rounded-DEFAULT border border-border-hairline">
          <span className="text-[10px] text-outline uppercase block">Risk Classification</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-sm font-bold text-tertiary tabular-nums">
              {CORPORATE_ENTITY_PROFILE.riskScore}
            </span>
            <span className="text-[10px] text-outline uppercase">Tier-1 Prime</span>
          </div>
          <span className="text-[10px] text-tertiary">Lowest Fiduciary Risk Profile</span>
        </div>

        <div className="bg-surface-container-low p-3 rounded-DEFAULT border border-border-hairline">
          <span className="text-[10px] text-outline uppercase block">Lead Supervisory Body</span>
          <span className="text-sm font-bold text-on-surface mt-0.5 block">
            Canton Zurich, CH
          </span>
          <span className="text-[10px] text-outline">{CORPORATE_ENTITY_PROFILE.supervisoryBody}</span>
        </div>
      </div>
    </div>
  );
};
