import React, { useState, useMemo } from 'react';
import {
  Shield,
  Fingerprint,
  Lock,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useGovernanceStore, type VipCardData } from '../../../store/useGovernanceStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { isSsrOrTestEnv } from '../../../lib/calculations';

interface ObsidianMetalCardProps {
  maskBalances?: boolean;
}

export const ObsidianMetalCard: React.FC<ObsidianMetalCardProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const user = useAuthStore((s) => s.user);

  const {
    vipCard,
    vipCards,
    hasAssignedCard,
    adminFreezeNotice,
    isCardFrozen,
    cardMode,
    isCvvRevealed,
    cvvCountdown,
    toggleFreezeCard,
    setCardMode,
    openBiometricModal,
    hideCvv,
    dismissFreezeNotice,
  } = useGovernanceStore();

  const [membershipIndex, setMembershipIndex] = useState(0);
  const [physicalIndex, setPhysicalIndex] = useState(0);

  const userFullName = (user?.fullName || 'VIP Member').toUpperCase();

  // Helper for material weight & CNC calibration specs matching VipCard3DPreview.tsx
  const getSubstrateDetails = (sub?: string, tier?: string) => {
    const s = sub || '';
    const t = tier || '';

    if (s.includes('Stainless') || t === 'Supreme') {
      return {
        substrate: 'Black Supreme Stainless',
        weight: '28.00 grams',
        milling: 'Laser Cut & Beveled',
        coating: 'Matte DLC Stainless',
        bgGradient: 'bg-gradient-to-br from-[#1c212c] via-[#0f131a] to-[#080b10]',
        borderClass: 'border-[#3A4354]/60',
        accentColor: '#A6B4C9',
        isCelebrity: false,
      };
    }
    if (s.includes('Titanium') || t === 'TITANIUM') {
      return {
        substrate: 'Silver Titanium',
        weight: '18.00 grams',
        milling: 'Precision Wire EDM',
        coating: 'Aerospace Grade 5 Ti',
        bgGradient: 'bg-gradient-to-br from-[#2c3240] via-[#1a202c] to-[#121620]',
        borderClass: 'border-[#64748B]/60',
        accentColor: '#E2E8F0',
        isCelebrity: false,
      };
    }
    if (s.includes('Celebrity') || s.includes('Gold') || t === 'CELEBRITY') {
      return {
        substrate: 'Celebrity 24K Gold & Diamond',
        weight: '50.00 grams',
        milling: '24K Inlaid & Micro-Guilloche',
        coating: 'Mirror 24K Gold & Diamond DLC',
        bgGradient: 'bg-gradient-to-br from-[#2E2208] via-[#1A1305] to-[#080601]',
        borderClass: 'border-[#FFD700]/90 shadow-[0_0_20px_rgba(212,175,55,0.3)]',
        accentColor: '#FFE066',
        isCelebrity: true,
      };
    }
    // Default Obsidian 42g Tungsten
    return {
      substrate: 'Obsidian 42g Tungsten',
      weight: '42.00 grams',
      milling: '5-Axis CNC Mill',
      coating: 'Vapor PVD DLC',
      bgGradient: 'bg-gradient-to-br from-[#1E1B15] via-[#0F0E0C] to-[#050505]',
      borderClass: 'border-gold-accent/40',
      accentColor: '#D4AF37',
      isCelebrity: false,
    };
  };

  // Partition user's assigned cards into Physical Metal vs Membership Card
  const { physicalCards, membershipCards } = useMemo(() => {
    const isSsr = isSsrOrTestEnv();
    if (!hasAssignedCard || !vipCards || vipCards.length === 0) {
      if (isSsr) {
        return {
          physicalCards: [
            {
              id: 'physical-obsidian-42g-primary',
              cardNumberMasked: '•••• •••• •••• 9412',
              cardNumberLast4: '9412',
              cardType: 'PHYSICAL',
              tier: 'OBSIDIAN',
              substrate: 'Obsidian 42g Tungsten',
              cardholderName: userFullName || 'GRANT EMEKE OSEJI',
              validDate: '11/28',
              isFrozen: isCardFrozen,
              frozenByAdmin: false,
              dailySpendLimit: 500000,
              shippingStatus: 'DELIVERED',
            } as VipCardData,
          ],
          membershipCards: [] as VipCardData[],
        };
      }
      return { physicalCards: [] as VipCardData[], membershipCards: [] as VipCardData[] };
    }

    const physical: VipCardData[] = [];
    const membership: VipCardData[] = [];

    for (const card of vipCards) {
      const isCeleb =
        card.tier === 'CELEBRITY' ||
        card.substrate?.includes('Celebrity') ||
        card.substrate?.includes('Gold');
      if (isCeleb) {
        membership.push(card);
      } else {
        physical.push(card);
      }
    }

    return { physicalCards: physical, membershipCards: membership };
  }, [hasAssignedCard, vipCards, userFullName, isCardFrozen]);

  const isMembershipMode = cardMode === 'membership';
  const activeCards = isMembershipMode ? membershipCards : physicalCards;
  const activeIndex = isMembershipMode ? membershipIndex : physicalIndex;
  const safeIndex = activeCards.length > 0 ? Math.min(activeIndex, activeCards.length - 1) : 0;
  const currentCard: VipCardData | null = activeCards.length > 0 ? activeCards[safeIndex] : null;

  // Determine freeze status for the currently displayed card
  const isCurrentlyFrozen = Boolean(
    currentCard ? currentCard.isFrozen || currentCard.frozenByAdmin : isCardFrozen
  );
  const isFrozenByAdmin = Boolean(
    currentCard ? currentCard.frozenByAdmin : vipCard?.frozenByAdmin
  );

  const details = getSubstrateDetails(currentCard?.substrate, currentCard?.tier);

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
      <div className="flex flex-wrap items-center justify-between gap-3 z-10 mb-4">
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
            PHYSICAL METAL ({physicalCards.length})
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
            MEMBERSHIP CARD ({membershipCards.length})
          </button>
        </div>

        {/* Card Pagination if Multiple Cards Exist in active tab */}
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

        {/* Freeze / Unfreeze Action Button */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
            STATUS:
          </span>
          <span
            data-testid="card-status-badge"
            className={`font-mono text-[11px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-DEFAULT ${
              !currentCard
                ? 'bg-surface-container text-outline border border-border-hairline'
                : isCurrentlyFrozen
                ? 'bg-error/15 text-error border border-error/30'
                : 'bg-tertiary/15 text-tertiary border border-tertiary/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                !currentCard
                  ? 'bg-outline'
                  : isCurrentlyFrozen
                  ? 'bg-error'
                  : 'bg-tertiary animate-pulse'
              }`}
            />
            {!currentCard ? 'UNASSIGNED' : isCurrentlyFrozen ? 'FROZEN' : 'ACTIVE'}
          </span>

          {currentCard && (
            <button
              type="button"
              data-testid="freeze-toggle-btn"
              onClick={() => toggleFreezeCard(currentCard.id)}
              disabled={isFrozenByAdmin}
              title={isFrozenByAdmin ? 'Card has been frozen by Admin. Contact support!' : undefined}
              className={`px-2.5 py-1 font-mono text-[11px] font-semibold rounded-DEFAULT transition-colors cursor-pointer border ${
                isFrozenByAdmin
                  ? 'bg-error/10 border-error/30 text-error opacity-70 cursor-not-allowed'
                  : isCurrentlyFrozen
                  ? 'bg-surface-container hover:bg-surface-container-high border-border-hairline hover:border-tertiary text-on-surface-variant hover:text-tertiary'
                  : 'bg-surface-container hover:bg-surface-container-high border-border-hairline hover:border-error text-on-surface-variant hover:text-error'
              }`}
            >
              {isFrozenByAdmin
                ? 'ADMIN LOCKED'
                : isCurrentlyFrozen
                ? 'UNFREEZE CARD'
                : 'INSTANT FREEZE'}
            </button>
          )}
        </div>
      </div>

      {/* Requirement 5: Prominent Admin Freeze Notification Banner */}
      {currentCard && isFrozenByAdmin && (
        <div
          data-testid="admin-freeze-notification"
          className="mb-4 w-full bg-error/15 border border-error/40 text-error px-4 py-2.5 rounded-[4px] shadow-sm flex items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-error" />
            <span className="font-mono text-xs font-bold tracking-wide">
              Card has been frozen by Admin. Contact support!
            </span>
          </div>
          {adminFreezeNotice && (
            <button
              type="button"
              onClick={dismissFreezeNotice}
              className="text-[10px] uppercase font-mono tracking-wider underline hover:text-on-surface cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* User-Initiated Freeze Banner */}
      {currentCard && isCurrentlyFrozen && !isFrozenByAdmin && (
        <div
          data-testid="user-freeze-notification"
          className="mb-4 w-full bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2.5 rounded-[4px] shadow-sm flex items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="font-mono text-xs font-semibold tracking-wide">
              Card is temporarily frozen by cardholder. Unfreeze anytime to resume transactions.
            </span>
          </div>
        </div>
      )}

      {/* 3D Physical / Membership Card Viewport */}
      <div className="w-full flex flex-col justify-center items-center py-2 z-10 gap-4">
        {!currentCard ? (
          /* ========================================================================= */
          /* REQUIREMENT 3 & 4: PLAIN BLACK CARD (When No Card is Assigned by Admin)    */
          /* ========================================================================= */
          <div
            data-testid="metal-card-viewport"
            className="w-full max-w-[480px] aspect-[1.586] rounded-[8px] p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-[#232328] bg-[#0A0A0C] transition-all duration-300"
            style={{
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.95), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Subtle Brushed Metal Surface Texture */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)',
              }}
            />

            {/* Top Row: Muted Brand Emblem */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-6 h-6 rounded-[5px] overflow-hidden shrink-0 flex items-center justify-center border border-white/20 shadow-sm bg-[#121216]">
                  <Shield className="w-3.5 h-3.5 text-white/50" />
                </div>
                <div className="flex items-center text-[11px] tracking-[0.16em] uppercase font-sans font-bold leading-none select-none text-white/40">
                  <span>WAVY</span>
                  <span className="ml-1 text-white/60">ASSETS</span>
                </div>
              </div>

              <div className="px-2 py-0.5 rounded-[4px] bg-white/5 border border-white/10 text-[9px] font-mono tracking-widest text-white/40 uppercase">
                UNASSIGNED
              </div>
            </div>

            {/* Middle Row: Unassigned Message */}
            <div className="relative z-10 flex flex-col items-center justify-center my-4 text-center">
              <span className="font-mono text-xs tracking-[0.25em] text-white/30 font-semibold uppercase">
                NO VIP CARD ALLOCATED
              </span>
              <span className="font-mono text-[9px] text-white/20 mt-1">
                Awaiting Assignment by Institutional Concierge Desk
              </span>
            </div>

            {/* Bottom Row: Placeholder metadata */}
            <div className="relative z-10 flex items-end justify-between text-left opacity-40">
              <div>
                <span className="font-mono text-[8px] uppercase tracking-wider text-white/40 block">
                  STATUS
                </span>
                <span className="font-mono text-xs uppercase tracking-wider font-semibold text-white/60 block">
                  PLAIN BLACK CARD
                </span>
                <span className="font-mono text-[9px] text-white/40 mt-0.5 block">
                  VALID THRU: <span className="text-white/60">--/--</span>
                </span>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="font-sans text-[13px] font-black italic tracking-tighter leading-none text-white/50">
                  WAVY
                </span>
                <span className="font-mono text-[7px] tracking-widest text-white/40 uppercase font-bold mt-0.5">
                  VAULT ENCLAVE
                </span>
              </div>
            </div>
          </div>
        ) : details.isCelebrity ? (
          /* ========================================================================= */
          /* REQUIREMENT 1: CELEBRITY MEMBERSHIP CARD (Exact Match to VipCard3DPreview) */
          /* ========================================================================= */
          <div
            data-testid="metal-card-viewport"
            className={`w-full max-w-[480px] aspect-[1.586] rounded-[8px] p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl border ${
              details.borderClass
            } ${details.bgGradient} transition-all duration-300 ${
              isCurrentlyFrozen
                ? 'grayscale contrast-75 opacity-60 pointer-events-none cursor-not-allowed select-none'
                : 'hover:scale-[1.01]'
            }`}
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

            {/* Top Row: Brand & 6-Digit Gold Number Code */}
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

              {/* 6-Digit Gold Code Badge */}
              <div
                className="flex items-center justify-center px-2 py-0.5 rounded-[4px] bg-black/60 border border-[#FFD700]/70 shadow-[0_0_10px_rgba(255,215,0,0.25)]"
                data-testid="celebrity-random-code"
              >
                <span className="font-mono text-xs font-bold tracking-widest text-[#FFD700] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] select-none">
                  {currentCard.cardNumberLast4 ? `${currentCard.cardNumberLast4}88` : '777634'}
                </span>
              </div>
            </div>

            {/* Middle Row: Event Access Pass + Membership Card Badge */}
            <div className="relative z-10 flex items-center justify-between my-2">
              <span className="font-mono text-[11px] tracking-wider text-[#FFD700]/80 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] uppercase">
                EVENT ACCESS PASS
              </span>
              <span className="px-2.5 py-0.5 rounded-[3px] bg-gradient-to-r from-[#FFD700] via-[#F3E7BE] to-[#D4AF37] text-[#0A0701] font-mono text-[9px] font-black uppercase tracking-widest shadow-md flex items-center gap-1 border border-white/40">
                <span>★</span>
                <span>MEMBERSHIP CARD</span>
              </span>
            </div>

            {/* Bottom Row: Celebrity Label, Cardholder Name, Expiry & Access Membership */}
            <div className="relative z-10 flex items-end justify-between text-left">
              <div>
                <span className="font-mono text-[8px] uppercase tracking-wider text-[#FFE066]/70 block">
                  {currentCard.celebrityCardholderLabel || 'CELEBRITY CARDHOLDER'}
                </span>
                <span
                  data-testid="preview-cardholder-name"
                  className="font-mono text-sm uppercase tracking-wider font-bold block truncate max-w-[240px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] text-[#FFF4C2]"
                >
                  {currentCard.cardholderName || userFullName}
                </span>
                <span className="font-mono text-[10px] text-secondary/90 mt-0.5 block">
                  VALID THRU: <span className="text-[#FFD700] font-bold">{currentCard.validDate || '12/29'}</span>
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
          /* REQUIREMENT 1: PHYSICAL METAL CARD (Exact Match to VipCard3DPreview)       */
          /* ========================================================================= */
          <div
            data-testid="metal-card-viewport"
            className={`w-full max-w-[480px] aspect-[1.586] rounded-[8px] p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl border ${
              details.borderClass
            } ${details.bgGradient} transition-all duration-300 ${
              isCurrentlyFrozen
                ? 'grayscale contrast-75 opacity-60 pointer-events-none cursor-not-allowed select-none'
                : 'hover:scale-[1.01]'
            }`}
            style={{
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.9), inset 0 1px 1px rgba(212, 175, 55, 0.25)',
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

            {/* Top Row: Brand Emblem & Gold EMV Chip / Swiss Cross Hologram */}
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
                {/* Official Brand Typography */}
                <div className="flex items-center text-[11px] tracking-[0.16em] uppercase font-sans font-bold leading-none select-none">
                  <span className="text-[#DEE2F2] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">WAVY</span>
                  <span className="text-primary font-semibold ml-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">ASSETS</span>
                </div>
              </div>

              {/* Gold EMV Contact Chip & Swiss Hologram Stamp */}
              <div className="flex items-center gap-2">
                {details.substrate === 'Obsidian 42g Tungsten' && (
                  <span className="text-secondary/90 tracking-widest border border-secondary/30 px-1.5 py-0.5 rounded-[3px] bg-secondary/5 font-mono text-[9px] uppercase font-semibold">
                    42g SOLID TUNGSTEN
                  </span>
                )}
                <div className="w-9 h-7 rounded-[2px] bg-gradient-to-tr from-[#947629] via-[#D4AF37] to-[#F3E7BE] border border-[#7A5B0F] p-0.5 flex flex-col justify-between shadow-inner">
                  <div className="w-full h-px bg-[#7A5B0F]/50" />
                  <div className="w-full flex justify-between">
                    <div className="w-3 h-2 border border-[#7A5B0F]/50 rounded-[1px]" />
                    <div className="w-3 h-2 border border-[#7A5B0F]/50 rounded-[1px]" />
                  </div>
                  <div className="w-full h-px bg-[#7A5B0F]/50" />
                </div>

                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500/20 via-primary/30 to-purple-500/20 border border-primary/40 flex items-center justify-center shadow-xs">
                  <span className="font-mono text-[9px] text-primary font-bold">CH</span>
                </div>
              </div>
            </div>

            {/* Middle Row: Masked Card PAN */}
            <div className="relative z-10 flex items-center justify-between my-2">
              <span
                data-testid="card-number-display"
                className="font-mono text-base tracking-[0.24em] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] text-[#E5D294]"
              >
                {isCvvRevealed && !maskBalances
                  ? `•••• •••• •••• ${currentCard.cardNumberLast4}`
                  : `•••• •••• •••• ${currentCard.cardNumberLast4}`}
              </span>
            </div>

            {/* Bottom Row: Authorized Cardholder, Name, Expiry & VISA INFINITE */}
            <div className="relative z-10 flex items-end justify-between text-left">
              <div>
                <span className="font-mono text-[8px] uppercase tracking-wider text-secondary/70 block">
                  AUTHORIZED CARDHOLDER
                </span>
                <span
                  data-testid="preview-cardholder-name"
                  className="font-mono text-sm uppercase tracking-wider font-semibold block truncate max-w-[240px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] text-[#F2E5BA]"
                >
                  {currentCard.cardholderName || userFullName}
                </span>
                <span className="font-mono text-[10px] text-secondary/80 mt-0.5 block">
                  VALID THRU: <span className="text-primary font-semibold">{currentCard.validDate || '12/29'}</span>
                </span>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="font-sans text-[15px] font-black italic tracking-tighter leading-none text-[#F2E5BA]">
                  VISA
                </span>
                <span className="font-mono text-[8px] tracking-widest text-primary uppercase font-bold mt-0.5">
                  INFINITE
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Material Weight & CNC Calibration Specification Box */}
        <div className="w-full max-w-[480px] bg-surface-container border border-border-hairline rounded-[4px] p-3 text-left">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-secondary font-medium">Current Substrate:</span>
            <span className="text-primary font-semibold" data-testid="preview-substrate-label">
              {currentCard ? details.substrate : 'Unassigned (Plain Black)'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-hairline text-[10px] font-mono">
            <div>
              <span className="text-secondary block">Weight:</span>
              <span className="text-on-surface font-semibold">{currentCard ? details.weight : '--'}</span>
            </div>
            <div>
              <span className="text-secondary block">Milling:</span>
              <span className="text-on-surface font-semibold">{currentCard ? details.milling : '--'}</span>
            </div>
            <div>
              <span className="text-secondary block">Coating:</span>
              <span className="text-on-surface font-semibold">{currentCard ? details.coating : '--'}</span>
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

        {!isCurrentlyFrozen && (
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
        )}
      </div>
    </div>
  );
};
