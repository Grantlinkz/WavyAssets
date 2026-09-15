import React from 'react';
import { Globe, CheckCircle2 } from 'lucide-react';
import { REGULATORY_CORRIDORS } from '../../../lib/governanceAssetData';

export const RegulatoryGatewayMatrix: React.FC = () => {
  return (
    <div
      data-testid="regulatory-gateway-matrix-panel"
      className="bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-5 space-y-4"
    >
      <div className="flex items-center justify-between pb-2 border-b border-border-hairline">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-primary" />
          <div>
            <span className="font-mono text-[10px] text-outline uppercase tracking-widest block">
              Cross-Border Settlement Channels
            </span>
            <h2 className="font-serif text-sm font-semibold text-on-surface">
              Global Regulatory Gateway Matrix
            </h2>
          </div>
        </div>

        <span className="font-mono text-[11px] text-tertiary flex items-center gap-1 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          All Corridors Fully Cleared
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {REGULATORY_CORRIDORS.map((corr) => (
          <div
            key={corr.countryCode}
            className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-5 bg-surface-container-high border border-border-hairline flex items-center justify-center text-[10px] font-bold text-primary rounded-DEFAULT">
                  {corr.countryCode}
                </span>
                <span className="font-sans text-xs font-bold text-on-surface">
                  {corr.countryName}
                </span>
              </div>
              <span className="px-1.5 py-0.2 bg-tertiary/15 text-tertiary rounded-DEFAULT text-[10px] font-bold">
                {corr.status}
              </span>
            </div>

            <div className="text-[11px]">
              <span className="text-outline uppercase text-[10px] block">Regulatory Framework</span>
              <span className="text-on-surface font-medium block mt-0.5">{corr.framework}</span>
            </div>

            <div className="flex items-center justify-between text-[10px] pt-2 border-t border-border-hairline text-outline">
              <span>Channel:</span>
              <span className="text-on-surface font-semibold">{corr.settlementChannel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
