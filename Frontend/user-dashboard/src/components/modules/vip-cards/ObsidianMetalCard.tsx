import React, { useState, useMemo } from 'react';
import { Shield, Fingerprint, Lock, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGovernanceStore } from '../../../store/useGovernanceStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAuthStore } from '../../../store/useAuthStore';

interface ObsidianMetalCardProps {
  maskBalances?: boolean;
}

export const ObsidianMetalCard: React.FC<ObsidianMetalCardProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const user = useAuthStore((s) => s.user);

  const {
    vipCard,
    isCardFrozen,
    cardMode,
    isCvvRevealed,
    cvvCountdown,
    toggleFreezeCard,
    setCardMode,
    openBiometricModal,
    hideCvv,
  } = useGovernanceStore();

  const [membershipIndex, setMembershipIndex] = useState(0);
  const [physicalIndex, setPhysicalIndex] = useState(0);

  const isCelebrityVip = vipCard?.tier === 'CELEBRITY';
  const userFullName = (user?.fullName || 'Grant Emeke Oseji').toUpperCase();
  const last4 = vipCard?.cardNumberLast4 || '5439';

  // Membership Card tab: Strictly contains the Celebrity Membership Cards of this user
  const membershipCards = useMemo(() => {
    return [
      {
        id: isCelebrityVip && vipCard ? vipCard.id : 'celebrity-pass-primary',
        cardholderName: userFullName || 'CELEBRITY GUEST',
        celebrityLabel: 'CELEBRITY CARDHOLDER',
        expiryDate: '09/31',
        randomCode: '777634',
        tier: 'CELEBRITY',
        substrate: 'Celebrity 24K Gold & Diamond',
        weight: '50.00 grams',
        milling: '24K Inlaid & Micro-Guilloche',
        coating: 'Mirror 24K Gold & Diamond DLC',
        isFrozen: isCardFrozen,
      },
    ];
  }, [isCelebrityVip, vipCard, userFullName, isCardFrozen]);

  // Physical Metal tab: Contains any other type of physical card (Obsidian 42g Tungsten, Supreme Stainless, Titanium, etc.)
  const physicalCards = useMemo(() => {
    const list = [];
    if (!isCelebrityVip && vipCard) {
      list.push({
        id: vipCard.id,
        cardholderName: userFullName || 'GRANT EMEKE OSEJI',
        maskedPan: `•••• •••• •••• ${vipCard.cardNumberLast4 || last4}`,
        last4: vipCard.cardNumberLast4 || last4,
        expiryDate: '11/28',
        cvv: '999',
        tier: vipCard.tier || 'OBSIDIAN',
        substrate: 'Obsidian 42g Tungsten',
        weight: '42.00 grams',
        milling: '5-Axis CNC Mill',
        coating: 'Vapor PVD DLC',
        isFrozen: isCardFrozen,
      });
    } else {
      list.push({
        id: 'physical-obsidian-42g-primary',
        cardholderName: userFullName || 'GRANT EMEKE OSEJI',
        maskedPan: `•••• •••• •••• ${last4}`,
        last4: last4,
        expiryDate: '11/28',
        cvv: '999',
        tier: 'OBSIDIAN',
        substrate: 'Obsidian 42g Tungsten',
        weight: '42.00 grams',
        milling: '5-Axis CNC Mill',
        coating: 'Vapor PVD DLC',
        isFrozen: isCardFrozen,
      });
    }
    return list;
  }, [isCelebrityVip, vipCard, userFullName, last4, isCardFrozen]);

  const isMembershipMode = cardMode === 'membership';
  const activeCards = isMembershipMode ? membershipCards : physicalCards;
  const activeIndex = isMembershipMode ? membershipIndex : physicalIndex;
  const safeIndex = Math.min(activeIndex, activeCards.length - 1);
  const currentCard = activeCards[safeIndex] || activeCards[0];

  return (
    <div
      data-testid="obsidian-metal-card-panel"
      className="bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-5 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Background Subtle Watermark */}
      <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none select-none text-primary">
        <Shield className="w-80 h-80" />
      </div>

      {/* Top Toolbar: Mode Switch & Freeze Action & Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 z-10 mb-5">
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-DEFAULT border border-border-hairline">
          <button
            type="button"
            data-testid="card-mode-physical-btn"
            onClick={() => setCardMode('physical')}
            className={`px-3 py-1 font-mono text-xs font-bold rounded-DEFAULT transition-all cursor-pointer ${
              !isMembershipMode
                ? 'bg-surface text-primary shadow-sm'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            PHYSICAL METAL (42g TUNGSTEN)
          </button>
          <button
            type="button"
            data-testid="card-mode-virtual-btn"
            onClick={() => setCardMode('membership')}
            className={`px-3 py-1 font-mono text-xs font-bold rounded-DEFAULT transition-all cursor-pointer ${
              isMembershipMode
                ? 'bg-surface text-primary shadow-sm'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            MEMBERSHIP CARD
          </button>
        </div>

        {/* Card Pagination if Multiple Cards Exist */}
        {activeCards.length > 1 && (
          <div className="flex items-center gap-2 font-mono text-[11px] text-outline bg-surface-container px-2 py-0.5 rounded-DEFAULT border border-border-hairline">
            <button
              type="button"
              disabled={safeIndex <= 0}
              onClick={() => {
                if (isMembershipMode) setMembershipIndex((p) => Math.max(0, p - 1));
                else setPhysicalIndex((p) => Math.max(0, p - 1));
              }}
              className="p-1 hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Card"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-on-surface font-semibold">
              Card {safeIndex + 1} of {activeCards.length}
            </span>
            <button
              type="button"
              disabled={safeIndex >= activeCards.length - 1}
              onClick={() => {
                if (isMembershipMode) setMembershipIndex((p) => Math.min(activeCards.length - 1, p + 1));
                else setPhysicalIndex((p) => Math.min(activeCards.length - 1, p + 1));
              }}
              className="p-1 hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Card"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
            {isCardFrozen ? 'FROZEN' : 'ACTIVE'}
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

      {/* 3D Physical / Membership Card Viewport */}
      <div className="w-full flex flex-col justify-center items-center py-3 z-10 gap-4">
        {isMembershipMode ? (
          /* ========================================================================= */
          /* CELEBRITY MEMBERSHIP CARD (Exact 3D Styling from Mint New Card - Screenshot 2) */
          /* ========================================================================= */
          <div
            data-testid="metal-card-viewport"
            className="w-full max-w-[480px] aspect-[1.586] rounded-[8px] p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-[#FFD700]/90 bg-gradient-to-br from-[#2E2208] via-[#1A1305] to-[#080601] transition-all duration-300 hover:scale-[1.01]"
            style={{
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.9), inset 0 1px 1px rgba(212, 175, 55, 0.3)',
            }}
          >
            {/* Subtle Brushed Metal Surface Texture */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)',
              }}
            />

            {/* Top Row: Brand & 6-Digit Number Code */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2" data-testid="card-brand-identity">
                {/* Official Favicon Squircle Emblem */}
                <div className="w-6 h-6 rounded-[5px] overflow-hidden shrink-0 flex items-center justify-center border border-gold-accent/40 shadow-sm bg-[#08090B]">
                  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full p-0.5" xmlns="http://www.w3.org/2000/svg">
                    <rect width="64" height="64" rx="14" fill="#08090B" />
                    <rect x="1" y="1" width="62" height="62" rx="13" stroke="#D4AF37" strokeWidth="2.5" strokeOpacity="0.8" />
                    <circle cx="32" cy="32" r="18" fill="#D4AF37" fillOpacity="0.15" />
                    <path d="M 12 33 C 18 19, 26 19, 32 33 C 38 47, 46 47, 52 33" stroke="#D4AF37" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 12 42 C 18 28, 26 28, 32 42 C 38 56, 46 56, 52 42" stroke="#00C288" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
                    <circle cx="32" cy="17" r="3.5" fill="#D4AF37" />
                  </svg>
                </div>
                {/* Brand Typography */}
                <div className="flex items-center text-[11px] tracking-[0.16em] uppercase font-sans font-bold leading-none select-none">
                  <span className="text-[#DEE2F2] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">WAVY</span>
                  <span className="text-primary font-semibold ml-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">ASSETS</span>
                </div>
              </div>

              {/* 6-Digit Random Code in Gold Box (Screenshot 2) */}
              <div
                className="flex items-center justify-center px-2 py-0.5 rounded-[4px] bg-black/60 border border-[#FFD700]/70 shadow-[0_0_10px_rgba(255,215,0,0.25)]"
                data-testid="celebrity-random-code"
              >
                <span className="font-mono text-xs font-bold tracking-widest text-[#FFD700] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] select-none">
                  {(currentCard as any).randomCode || '777634'}
                </span>
              </div>
            </div>

            {/* Middle Row: Event Access Pass + Membership Card Pill Badge */}
            <div className="relative z-10 flex items-center justify-between my-2">
              <span className="font-mono text-[11px] tracking-wider text-[#FFD700]/80 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] uppercase">
                EVENT ACCESS PASS
              </span>
              <span className="px-2.5 py-0.5 rounded-[3px] bg-gradient-to-r from-[#FFD700] via-[#F3E7BE] to-[#D4AF37] text-[#0A0701] font-mono text-[9px] font-black uppercase tracking-widest shadow-md flex items-center gap-1 border border-white/40">
                <span>★</span>
                <span>MEMBERSHIP CARD</span>
              </span>
            </div>

            {/* Bottom Row: Celebrity Cardholder, Expiry Date & Access Membership */}
            <div className="relative z-10 flex items-end justify-between text-left">
              <div>
                <span className="font-mono text-[8px] uppercase tracking-wider text-[#FFE066]/70 block">
                  CELEBRITY CARDHOLDER
                </span>
                <span
                  data-testid="preview-cardholder-name"
                  className="font-mono text-sm uppercase tracking-wider font-bold block truncate max-w-[240px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] text-[#FFF4C2]"
                >
                  {currentCard.cardholderName || 'CELEBRITY GUEST'}
                </span>
                <span className="font-mono text-[10px] text-secondary/90 mt-0.5 block">
                  VALID THRU: <span className="text-[#FFD700] font-bold">{(currentCard as any).expiryDate || '09/31'}</span>
                </span>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="font-sans text-[15px] font-black italic tracking-tighter leading-none text-[#FFF4C2]">
                  ACCESS
                </span>
                <span className="font-mono text-[8px] tracking-widest text-[#FFD700] uppercase font-bold mt-0.5">
                  MEMBERSHIP
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* PHYSICAL METAL CARD (Exact 3D Styling from Screenshot 3)                   */
          /* ========================================================================= */
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

            {/* Top Row: Global Crest & Weight Edition */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-xs text-primary-container font-bold tracking-wider uppercase">
                    WAVYASSETS {currentCard.tier}
                  </span>
                  <span className="font-mono text-[8px] text-outline tracking-widest uppercase">
                    ZURICH
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-secondary/90 tracking-widest border border-secondary/30 px-1.5 py-0.5 rounded-DEFAULT bg-secondary/5 uppercase">
                  {currentCard.tier === 'OBSIDIAN' ? '42g SOLID TUNGSTEN' : `${currentCard.tier} EDITION`}
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
                    ? `4921 •••• •••• ${(currentCard as any).last4 || last4}`
                    : `•••• •••• •••• ${(currentCard as any).last4 || last4}`}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-[8px] text-outline uppercase tracking-wider">
                      CARDHOLDER
                    </span>
                    <span className="font-mono text-xs text-primary-fixed tracking-wider font-semibold uppercase">
                      {currentCard.cardholderName}
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
                      title="Simulated Non-Sensitive Demo Code"
                      className="font-mono text-xs text-secondary font-bold tabular-nums"
                    >
                      {isCvvRevealed && !maskBalances ? '999' : '•••'}
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
        )}

        {/* Material Weight & CNC Calibration Specification Box (Matching Screenshot 2 & 3) */}
        <div className="w-full max-w-[480px] bg-surface-container border border-border-hairline rounded-[4px] p-3 text-left">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-secondary font-medium">Current Substrate:</span>
            <span className="text-primary font-semibold" data-testid="preview-substrate-label">
              {currentCard.substrate}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-hairline text-[10px] font-mono">
            <div>
              <span className="text-secondary block">Weight:</span>
              <span className="text-on-surface font-semibold">{currentCard.weight}</span>
            </div>
            <div>
              <span className="text-secondary block">Milling:</span>
              <span className="text-on-surface font-semibold">{currentCard.milling}</span>
            </div>
            <div>
              <span className="text-secondary block">Coating:</span>
              <span className="text-on-surface font-semibold">{currentCard.coating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Credential Gate Controls & Security Notice */}
      <div className="pt-3 border-t border-border-hairline flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-outline z-10">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-tertiary shrink-0" />
          <span className="text-[11px]">
            Gemalto Thales Luna Enclave
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
              <span>Biometric CVV &amp; PIN Reveal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
