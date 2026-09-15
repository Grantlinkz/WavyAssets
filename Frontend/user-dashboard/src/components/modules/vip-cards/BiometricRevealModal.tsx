import React, { useState } from 'react';
import { Fingerprint, Key, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { useGovernanceStore } from '../../../store/useGovernanceStore';

export const BiometricRevealModal: React.FC = () => {
  const { isBiometricModalOpen, closeBiometricModal, revealCvv } = useGovernanceStore();
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  const handleSimulateTouch = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      setTimeout(() => {
        setVerificationSuccess(false);
        revealCvv();
      }, 700);
    }, 900);
  };

  if (!isBiometricModalOpen) return null;

  return (
    <Dialog open={isBiometricModalOpen} onOpenChange={(open) => !open && closeBiometricModal()}>
      <DialogContent data-testid="biometric-reveal-modal" className="max-w-[460px]">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border-hairline">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-DEFAULT border border-primary/20">
              <Fingerprint className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-serif text-sm uppercase tracking-wide">
                Hardware Enclave Challenge
              </DialogTitle>
              <span className="font-mono text-[10px] text-tertiary">
                FIPS 140-2 LEVEL 4 ATTESTATION
              </span>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-biometric-modal-btn"
            aria-label="Close biometric challenge"
            onClick={closeBiometricModal}
            className="text-outline hover:text-on-surface p-1 rounded-DEFAULT transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-xs font-sans text-on-surface-variant leading-relaxed">
            Full 16-digit primary account number (PAN), CVV2 security code, and physical card PIN are encrypted within the Zurich HSM Vault. Access requires biometric verification or physical FIDO2 hardware token touch.
          </p>

          {/* Interactive Hardware Touch Sensor Simulation */}
          <div
            onClick={handleSimulateTouch}
            data-testid="simulated-touch-sensor"
            className="p-6 bg-surface-container rounded-DEFAULT border border-border-hairline flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary transition-all group"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                verificationSuccess
                  ? 'bg-tertiary/20 text-tertiary ring-4 ring-tertiary/30'
                  : isVerifying
                  ? 'bg-primary/20 text-primary ring-4 ring-primary/30 animate-pulse'
                  : 'bg-surface-container-high text-outline group-hover:text-primary'
              }`}
            >
              {verificationSuccess ? (
                <ShieldCheck className="w-8 h-8" />
              ) : (
                <Fingerprint className="w-8 h-8" />
              )}
            </div>

            <div className="text-center font-mono">
              <span className="text-xs font-bold text-on-surface block">
                {verificationSuccess
                  ? 'WebAuthn Cryptographic Signature Verified'
                  : isVerifying
                  ? 'Querying YubiKey 5C NFC / Apple Secure Enclave...'
                  : 'Touch Physical Hardware Key or Scan Biometrics'}
              </span>
              <span className="text-[10px] text-outline mt-0.5 block">
                Algorithm: ECDSA P-256 (Enclave CH)
              </span>
            </div>
          </div>

          {/* Auto-lock warning */}
          <div className="p-3 bg-surface-container-low rounded-DEFAULT border border-border-hairline flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <span className="text-[11px] font-sans text-on-surface-variant leading-relaxed">
              Once verified, sensitive credentials remain unmasked for strictly <strong>60 seconds</strong> before zero-exposure memory purge.
            </span>
          </div>

          <button
            type="button"
            data-testid="confirm-biometric-auth-btn"
            disabled={isVerifying || verificationSuccess}
            onClick={handleSimulateTouch}
            className="w-full py-2 bg-primary hover:bg-primary-hover text-surface font-mono text-xs font-bold uppercase tracking-wider rounded-DEFAULT transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Key className="w-4 h-4" />
            <span>
              {isVerifying ? 'Verifying Hardware Token...' : 'Authorize Hardware Decryption'}
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
