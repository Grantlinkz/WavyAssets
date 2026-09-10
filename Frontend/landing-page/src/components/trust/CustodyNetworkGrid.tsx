import React from 'react';
import { Network } from 'lucide-react';
import { custodyNodes, type CustodyNode } from './trustData';

export type { CustodyNode };

export const CustodyNetworkGrid: React.FC = () => {
  return (
    <div
      className="w-full bg-surface-container-low/60 rounded-sm p-5 border border-outline/30 shadow-sm space-y-4"
      data-testid="custody-network-grid"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-outline flex items-center gap-2">
          <Network className="w-3.5 h-3.5 text-primary" />
          INSTITUTIONAL CLEARING &amp; CUSTODY INFRASTRUCTURE NETWORK
        </span>
        <span className="font-mono text-[11px] text-secondary flex items-center gap-1.5 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          6/6 NODES SYNCHRONIZED
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {custodyNodes.map((node) => (
          <div
            key={node.id}
            data-testid={`custody-node-${node.id}`}
            className="bg-surface-container-lowest p-3.5 rounded-sm border border-outline/20 hover:border-primary/40 flex flex-col items-center justify-center text-center gap-1 shadow-sm transition-colors group"
          >
            <span className="font-sans font-bold text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors tracking-tight">
              {node.name}
            </span>
            <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
              {node.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
