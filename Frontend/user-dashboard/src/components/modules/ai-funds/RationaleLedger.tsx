import React from 'react';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { AI_RATIONALE_EVENTS } from '../../../lib/alternativeAssetData';

const CATEGORIES = ['All Events', 'Delta Hedging', 'Stat Arb', 'Funding Capture'];

export const RationaleLedger: React.FC = () => {
  const activeFilter = useAlternativeStore((s) => s.activeRationaleFilter);
  const setFilter = useAlternativeStore((s) => s.setRationaleFilter);

  const filteredEvents = AI_RATIONALE_EVENTS.filter((evt) => {
    if (activeFilter === 'All Events') return true;
    return evt.category.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <div className="bg-surface-container border border-border-hairline rounded p-4 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-hairline">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-on-surface text-base">
              Execution Rationale &amp; Rebalance Ledger
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
            </span>
          </div>
          <span className="text-xs text-outline font-sans">
            Algorithmic decision tree with cryptographic verification &amp; state proofs
          </span>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = activeFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-2 py-0.5 font-mono text-xs rounded transition-colors ${
                  isSelected
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface border border-border-hairline text-outline hover:text-on-surface'
                }`}
              >
                {cat === 'All Events' ? `All Events (${AI_RATIONALE_EVENTS.length})` : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ledger Table / Rows */}
      <div className="mt-3 divide-y divide-border-hairline text-xs">
        {filteredEvents.map((evt) => {
          const dotColor =
            evt.categoryColor === 'tertiary'
              ? 'bg-tertiary'
              : evt.categoryColor === 'primary'
              ? 'bg-primary'
              : 'bg-amber-400';

          return (
            <div
              key={evt.id}
              className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 hover:bg-surface-container-low px-1 rounded transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className={`mt-1.5 w-2 h-2 rounded-full ${dotColor} shrink-0`}></div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] text-outline font-semibold">
                      {evt.timeUtc}
                    </span>
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded font-semibold">
                      {evt.category}
                    </span>
                    <span className="font-mono text-[11px] text-on-surface-variant font-medium">
                      {evt.venue}
                    </span>
                  </div>
                  <p className="mt-1 text-on-surface leading-relaxed">{evt.summary}</p>
                  <p className="text-[11px] text-on-surface-variant italic mt-0.5">
                    {evt.rationale}
                  </p>
                  <div className="mt-1.5 text-[11px] font-mono text-outline flex items-center gap-3 flex-wrap">
                    {evt.metrics.map((m, idx) => (
                      <React.Fragment key={idx}>
                        <span>{m}</span>
                        {idx < evt.metrics.length - 1 && <span>•</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sm:text-right shrink-0 font-mono text-[11px]">
                <span className="text-tertiary font-bold">{evt.pnlYield}</span>
                <div className="text-outline text-[10px] mt-0.5">Tx: {evt.txHash}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hash Verification Footer */}
      <div className="mt-3 pt-3 border-t border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-outline gap-2">
        <div className="flex items-center gap-2 truncate">
          <span className="material-symbols-outlined text-[14px] text-tertiary">lock</span>
          <span>
            Cryptographic Root:{' '}
            <strong className="text-on-surface font-semibold">0x9b4fa7c822e11d09e3e21ba99</strong>
          </span>
        </div>
        <span className="text-tertiary">Validated on Swiss Tier-3 Enclave (Zurich Alpha)</span>
      </div>
    </div>
  );
};
