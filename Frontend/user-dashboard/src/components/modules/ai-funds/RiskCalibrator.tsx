import React from 'react';
import { Sliders } from 'lucide-react';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { AI_RISK_TIERS } from '../../../lib/alternativeAssetData';

export const RiskCalibrator: React.FC = () => {
  const selectedTier = useAlternativeStore((s) => s.selectedRiskTier);
  const setRiskTier = useAlternativeStore((s) => s.setRiskTier);

  return (
    <div className="p-3.5 bg-surface-container border border-border-hairline rounded flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary shrink-0" />
          <span className="font-serif font-semibold text-on-surface text-base">
            Dynamic Risk Posture &amp; Leverage Calibrator
          </span>
        </div>
        <span className="font-mono text-xs text-outline uppercase tabular-nums">
          Autonomous Engine: Continuous Mark-To-Market
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {AI_RISK_TIERS.map((tier) => {
          const isActive = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => setRiskTier(tier.id)}
              className={`p-3 rounded text-left transition-all relative ${
                isActive
                  ? 'bg-surface border-2 border-primary shadow-sm'
                  : 'bg-surface border border-border-hairline hover:border-outline/50'
              }`}
            >
              {isActive && (
                <div className="absolute -top-2.5 right-3 px-1.5 py-0.5 bg-primary text-on-primary rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                  ACTIVE EXECUTION
                </div>
              )}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`font-mono text-xs uppercase tracking-wider font-semibold ${
                    isActive ? 'text-primary' : 'text-outline'
                  }`}
                >
                  {tier.tierLabel}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    isActive ? 'text-primary' : 'text-outline'
                  }`}
                >
                  Lev: {tier.leverage}
                </span>
              </div>
              <div className="font-serif font-semibold text-on-surface text-sm mb-1 flex items-center gap-1.5">
                <span>{tier.title}</span>
                {isActive && <span className="inline-block h-2 w-2 rounded-full bg-tertiary"></span>}
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                {tier.description}
              </p>
              <div className="mt-2.5 pt-2 border-t border-border-hairline flex items-center justify-between text-[11px] font-mono">
                <span className="text-outline">
                  {tier.volBand ? `Vol Band: ${tier.volBand}` : 'Target APY'}
                </span>
                <span
                  className={`font-semibold tabular-nums ${
                    isActive ? 'text-tertiary' : 'text-on-surface'
                  }`}
                >
                  {tier.targetApy}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
