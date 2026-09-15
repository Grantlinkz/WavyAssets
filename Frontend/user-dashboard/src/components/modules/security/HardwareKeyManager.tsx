import React, { useState } from 'react';
import { KeyRound, Usb, Lock, Fingerprint, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { HARDWARE_SECURITY_KEYS } from '../../../lib/governanceAssetData';

export const HardwareKeyManager: React.FC = () => {
  const [challengeKeyId, setChallengeKeyId] = useState<string | null>(null);
  const [registerNotice, setRegisterNotice] = useState<string | null>(null);

  const handleTestChallenge = (id: string) => {
    setChallengeKeyId(id);
    setTimeout(() => setChallengeKeyId(null), 2500);
  };

  const handleRegisterKey = () => {
    setRegisterNotice('Insert hardware security key into USB-C or tap via NFC to register.');
    setTimeout(() => setRegisterNotice(null), 3500);
  };

  return (
    <div
      data-testid="hardware-key-manager-panel"
      className="bg-surface-container-low border border-border-hairline rounded-DEFAULT p-5 space-y-4 shadow-md flex flex-col justify-between"
    >
      <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-serif text-sm font-semibold text-on-surface">
              Hardware Security Keys (WebAuthn / FIDO2)
            </h2>
            <p className="font-sans text-[11px] text-outline">
              Cryptographic enclave authenticator tokens
            </p>
          </div>
        </div>

        <button
          type="button"
          data-testid="register-key-btn"
          onClick={handleRegisterKey}
          className="flex items-center gap-1 px-2.5 py-1 bg-primary text-surface hover:bg-primary-hover font-mono text-xs font-bold uppercase rounded-DEFAULT transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Key</span>
        </button>
      </div>

      {registerNotice && (
        <div className="p-2.5 bg-primary/10 border border-primary/30 text-primary font-mono text-xs rounded-DEFAULT">
          {registerNotice}
        </div>
      )}

      {/* Keys List */}
      <div className="space-y-3 font-mono">
        {HARDWARE_SECURITY_KEYS.map((key) => (
          <div
            key={key.id}
            data-testid={`hardware-key-row-${key.id}`}
            className="bg-surface-container p-3.5 rounded-DEFAULT border border-border-hairline space-y-2 hover:bg-surface-container-high transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {key.icon === 'usb' ? (
                  <Usb className="w-5 h-5 text-primary" />
                ) : key.icon === 'lock' ? (
                  <Lock className="w-5 h-5 text-secondary" />
                ) : (
                  <Fingerprint className="w-5 h-5 text-outline" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-bold text-on-surface">{key.name}</span>
                    <span className="px-1.5 py-0.2 bg-tertiary/15 text-tertiary text-[9px] font-bold rounded-DEFAULT">
                      {key.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-outline tabular-nums">
                    Serial: {key.serial} • Registered: {key.registeredDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  data-testid={`test-challenge-btn-${key.id}`}
                  onClick={() => handleTestChallenge(key.id)}
                  className="px-2 py-1 bg-surface-container-highest hover:bg-surface-bright text-on-surface font-mono text-[10px] font-semibold rounded-DEFAULT transition-colors cursor-pointer"
                >
                  {challengeKeyId === key.id ? 'Attesting...' : 'Test Challenge'}
                </button>
              </div>
            </div>

            {challengeKeyId === key.id && (
              <div className="p-1.5 bg-tertiary/10 border border-tertiary/30 text-tertiary text-[10px] rounded-DEFAULT flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Enclave Challenge Verified: Signature 0x48...e9 OK (12ms)</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-border-hairline/60 text-outline">
              <div>
                <span>Algorithm: </span>
                <span className="text-on-surface font-mono">{key.algorithm}</span>
              </div>
              <div className="text-right">
                <span>Last Touch: </span>
                <span className="text-tertiary font-medium">{key.lastTouch}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fiduciary Mandate Notice */}
      <div className="p-3 bg-surface-container-highest/60 rounded-DEFAULT border border-border-hairline flex items-start gap-2.5 text-on-surface-variant font-sans text-xs">
        <ShieldAlert className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-on-surface font-semibold">Tier 3 Fiduciary Mandate:</strong> Physical hardware touch confirmation is strictly enforced for any outbound settlement exceeding $10,000 USD equivalent. SMS authentication and mobile TOTP apps are permanently disabled.
        </p>
      </div>
    </div>
  );
};
