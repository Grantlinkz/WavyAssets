import React from 'react';
import { Laptop, Smartphone, Terminal, Radio, Shield, Ban } from 'lucide-react';
import { useGovernanceStore } from '../../../store/useGovernanceStore';

export const ActiveSessionsBlotter: React.FC = () => {
  const { sessions, terminateSession, revokeAllOtherSessions } = useGovernanceStore();
  const activeCount = sessions.length;

  return (
    <div
      data-testid="active-sessions-panel"
      className="bg-surface-container-low border border-border-hairline rounded-DEFAULT p-5 space-y-4 shadow-md flex flex-col justify-between"
    >
      <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-serif text-sm font-semibold text-on-surface">
              Authorized Client Sessions & Perimeter
            </h2>
            <p className="font-sans text-[11px] text-outline">
              Real-time cryptographic heartbeat of authenticated enclaves
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2 py-0.5 bg-surface-container-high text-on-surface rounded-DEFAULT text-[11px]">
            {activeCount} Active
          </span>
          <button
            type="button"
            data-testid="revoke-all-others-btn"
            onClick={revokeAllOtherSessions}
            className="flex items-center gap-1 px-2 py-1 bg-error/15 hover:bg-error text-error hover:text-surface text-[10px] font-bold uppercase rounded-DEFAULT transition-colors cursor-pointer"
          >
            <Ban className="w-3 h-3" />
            <span>Revoke All Others</span>
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3 font-mono">
        {sessions.map((sess) => (
          <div
            key={sess.id}
            data-testid={`session-row-${sess.id}`}
            className="bg-surface-container p-3.5 rounded-DEFAULT border border-border-hairline space-y-2 hover:bg-surface-container-high transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {sess.icon === 'laptop_mac' ? (
                  <Laptop className="w-5 h-5 text-primary" />
                ) : sess.icon === 'smartphone' ? (
                  <Smartphone className="w-5 h-5 text-on-surface" />
                ) : (
                  <Terminal className="w-5 h-5 text-outline" />
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-bold text-on-surface">
                      {sess.deviceName}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded-DEFAULT text-[9px] font-bold ${
                        sess.isCurrent
                          ? 'bg-primary/20 text-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {sess.clientBadge}
                    </span>
                  </div>

                  <span className="text-[10px] text-outline tabular-nums">
                    {sess.location} • {sess.ipAddress}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {sess.isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                ) : (
                  <button
                    type="button"
                    data-testid={`terminate-session-btn-${sess.id}`}
                    onClick={() => terminateSession(sess.id)}
                    className="px-2 py-0.5 bg-surface-container-highest hover:bg-error hover:text-surface text-outline font-mono text-[10px] rounded-DEFAULT transition-colors cursor-pointer"
                  >
                    Terminate
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[10px] pt-1.5 border-t border-border-hairline/60 text-outline">
              <span>{sess.cipherSuite}</span>
              <span className="text-tertiary">{sess.latencyPing}</span>
              <span>{sess.lastActive}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Zero-Trust Geo-Fencing Banner */}
      <div className="p-3 bg-surface-container-highest/60 rounded-DEFAULT border border-border-hairline flex items-center gap-2.5 text-on-surface-variant font-sans text-xs">
        <Shield className="w-4 h-4 text-primary shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-on-surface font-semibold">Zero-Trust Geo-Fencing Active:</strong> Connection requests outside Switzerland, Germany, Singapore, and UK trigger an instantaneous security quarantine and dual-signatory bypass.
        </p>
      </div>
    </div>
  );
};
