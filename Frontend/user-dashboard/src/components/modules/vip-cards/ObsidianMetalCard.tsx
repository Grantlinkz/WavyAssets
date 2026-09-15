import React from 'react';
import { Shield, Fingerprint, Lock, EyeOff } from 'lucide-react';
import { useGovernanceStore } from '../../../store/useGovernanceStore';
import { useDashboardStore } from '../../../store/useDashboardStore';

interface ObsidianMetalCardProps {
  maskBalances?: boolean;
}

export const ObsidianMetalCard: React.FC<ObsidianMetalCardProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const {
    isCardFrozen,
    cardMode,
    isCvvRevealed,
    cvvCountdown,
    toggleFreezeCard,
    setCardMode,
    openBiometricModal,
    hideCvv,
  } = useGovernanceStore();

  return (
    <div
      data-testid="obsidian-metal-card-panel"
      className="bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-5 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Background Subtle Watermark */}
      <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none select-none text-primary">
        <Shield className="w-80 h-80" />
      </div>

      {/* Top Toolbar: Mode Switch & Instant Freeze */}
      <div className="flex flex-wrap items-center justify-between gap-3 z-10 mb-5">
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-DEFAULT border border-border-hairline">
          <button
            type="button"
            data-testid="card-mode-physical-btn"
            onClick={() => setCardMode('physical')}
            className={`px-3 py-1 font-mono text-xs font-bold rounded-DEFAULT transition-all cursor-pointer ${
              cardMode === 'physical'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            PHYSICAL METAL (42g TUNGSTEN)
          </button>
          <button
            type="button"
            data-testid="card-mode-virtual-btn"
            onClick={() => setCardMode('virtual')}
            className={`px-3 py-1 font-mono text-xs font-bold rounded-DEFAULT transition-all cursor-pointer ${
              cardMode === 'virtual'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            VIRTUAL NFC (APPLE PAY)
          </button>
        </div>

        {/* Freeze / Unfreeze Action */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
            STATUS:
          </span>
          <span
            data-testid="card-status-badge"
            className={`font-mono text-[11px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-DEFAULT ${
              isCardFrozen
                ? 'bg-error/15 text-error border border-error/30'
                : 'bg-tertiary/15 text-tertiary border border-tertiary/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isCardFrozen ? 'bg-error' : 'bg-tertiary animate-pulse'
              }`}
            />
            {isCardFrozen ? 'FROZEN // LOCKED' : 'ACTIVE // ARMED'}
          </span>
          <button
            type="button"
            data-testid="freeze-toggle-btn"
            onClick={toggleFreezeCard}
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high border border-border-hairline hover:border-error text-on-surface-variant hover:text-error font-mono text-[11px] font-semibold rounded-DEFAULT transition-colors cursor-pointer"
          >
            {isCardFrozen ? 'UNFREEZE CARD' : 'INSTANT FREEZE'}
          </button>
        </div>
      </div>

      {/* 3D-Look Obsidian Heavy Metal Card Viewport */}
      <div className="w-full flex justify-center items-center py-3 z-10">
        <div
          data-testid="metal-card-viewport"
          className={`relative w-full max-w-[480px] aspect-[1.586/1] rounded-DEFAULT p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 border ${
            isCardFrozen
              ? 'bg-gradient-to-br from-[#12141a] via-[#090b0e] to-[#040507] border-error/40 opacity-80'
              : 'bg-gradient-to-br from-[#1b1e25] via-[#0b0d11] to-[#040507] border-primary-container/40'
          }`}
        >
          {/* Top Edge Chamfer Accent Line */}
          <div className="absolute inset-0 rounded-DEFAULT pointer-events-none border border-white/5" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-container/60 to-transparent" />

          {/* Top Row: Sovereign Crest & Weight */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xs text-primary-container font-bold tracking-wider uppercase">
                  WavyAssets Sovereign
                </span>
                <span className="font-mono text-[8px] text-outline tracking-widest uppercase">
                  ZURICH PRIVATE DESK // ENCLAVE CH
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-secondary/90 tracking-widest border border-secondary/30 px-1.5 py-0.5 rounded-DEFAULT bg-secondary/5">
                {cardMode === 'physical' ? '42g SOLID TUNGSTEN' : 'NFC ENCLAVE ACTIVE'}
              </span>
            </div>
          </div>

          {/* Center Row: EMV Chip & Hardware Key Stamp */}
          <div className="flex items-center justify-between relative z-10 my-1">
            <div className="w-11 h-8 rounded-xs bg-gradient-to-br from-[#c9a74a] via-[#e5c76e] to-[#987823] p-[2px] shadow-sm">
              <div className="w-full h-full border border-[#5d4608] rounded-xs grid grid-cols-3 grid-rows-2 gap-0.5 p-0.5 bg-[#ad8a2a]/20">
                <div className="border border-[#72540b]/40" />
                <div className="border border-[#72540b]/40" />
                <div className="border border-[#72540b]/40" />
                <div className="border border-[#72540b]/40" />
                <div className="border border-[#72540b]/40" />
                <div className="border border-[#72540b]/40" />
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-[8px] text-outline block tracking-widest">ENCLAVE SECURE KEY</span>
              <span className="text-[9px] text-on-surface-variant">ID: 0x9AF...82C</span>
            </div>
          </div>

          {/* Bottom Row: Card Details, Unmask Action & World Elite Crest */}
          <div className="relative z-10 flex items-end justify-between">
            <div className="flex flex-col gap-1.5">
              <div
                data-testid="card-number-display"
                className="font-mono text-base tracking-[0.2em] text-on-surface font-semibold select-none tabular-nums"
              >
                {isCvvRevealed && !maskBalances
                  ? '4921 •••• •••• 9412'
                  : '•••• •••• •••• 9412'}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-mono text-[8px] text-outline uppercase tracking-wider">
                    CARDHOLDER
                  </span>
                  <span className="font-mono text-xs text-primary-fixed tracking-wider font-semibold uppercase">
                    M. GRANT // SOVEREIGN
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-mono text-[8px] text-outline uppercase tracking-wider">
                    VALID THRU
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant tabular-nums">
                    {isCvvRevealed && !maskBalances ? '11/28' : '••/••'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-mono text-[8px] text-outline uppercase tracking-wider">
                    CVV2
                  </span>
                  <span
                    data-testid="card-cvv-display"
                    className="font-mono text-xs text-secondary font-bold tabular-nums"
                  >
                    {isCvvRevealed && !maskBalances ? '842' : '•••'}
                  </span>
                </div>
              </div>
            </div>

            {/* World Elite Dual Ellipse Crest */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center -space-x-2.5 opacity-85">
                <div className="w-7 h-7 rounded-full border border-primary-container/80 bg-primary-container/30 backdrop-blur-xs" />
                <div className="w-7 h-7 rounded-full border border-secondary/80 bg-secondary/30 backdrop-blur-xs" />
              </div>
              <span className="font-mono text-[8px] tracking-widest text-outline uppercase font-semibold">
                WORLD ELITE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Credential Gate Controls & Security Notice */}
      <div className="pt-3 border-t border-border-hairline flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-outline z-10">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-tertiary shrink-0" />
          <span className="text-[11px]">
            HSM Zero-Exposure Masking Armed // Gemalto Thales Luna Enclave
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCvvRevealed ? (
            <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/30 text-secondary px-2.5 py-1 rounded-DEFAULT">
              <EyeOff className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">Revealed ({cvvCountdown}s)</span>
              <button
                type="button"
                data-testid="hide-cvv-btn"
                onClick={hideCvv}
                className="underline hover:text-on-surface ml-1 cursor-pointer"
              >
                Hide
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-testid="reveal-credentials-btn"
              onClick={openBiometricModal}
              className="flex items-center gap-1.5 px-3 py-1 bg-primary text-surface hover:bg-primary-hover font-mono text-xs font-bold uppercase tracking-wider rounded-DEFAULT transition-colors cursor-pointer shadow-sm"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Biometric CVV & PIN Reveal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
