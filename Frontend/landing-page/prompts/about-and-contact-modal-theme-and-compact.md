# Implementation Prompt: Light Mode & Dark Mode for About and Contact Modal + Reduced Modal Size

## Task Overview

1. **Light Mode and Dark Mode for Contact Modal**:
   - Give `ContactModal.tsx` and `ContactSentinelGraphic.tsx` full dual-theme support (Obsidian Dark and Luxury Light).
   - In dark mode (`dark:`), keep the exact existing dark styling, colors, and aesthetics completely untouched.
   - In light mode, apply clean Luxury Light styling: crisp white/soft alabaster surfaces (`#FFFFFF`, `#F4F6FB`, `#EDF2FB`), high-contrast dark text (`text-on-surface`, `text-on-surface-variant`), and refined hairline borders (`border-outline/20`), with the electric lime `#A6FF00` accent and sentinel visor glow intact.

2. **Reduce Overall Size of Contact Modal**:
   - Scale down the modal from the oversized `max-w-5xl` footprint to a compact, elegant, and balanced footprint (`max-w-3xl` on desktop, `max-w-xl` on tablet).
   - Reduce form padding from `p-10` to `p-5 sm:p-6 lg:p-7` and streamline spacing (`space-y-3.5`).
   - Compact heading typography (`text-xl sm:text-2xl lg:text-3xl`), input paddings (`py-1.5`), and mascot column dimensions so the modal fits comfortably without taking over the entire screen.

3. **Light Mode and Dark Mode for About Section**:
   - Give `UnifiedFinanceInfographic3D.tsx` full dual-theme support:
     - Container: `dark:bg-[#08090B]/90 bg-[#FFFFFF]/95`
     - Subheader banner: `dark:bg-[#0F1115] bg-[#EDF2FB]`
     - Card panels: `dark:bg-[#0F1115]/80 bg-[#FFFFFF]/90`
     - Badge & tool pills: `dark:bg-[#161920] bg-[#EDF2FB]` / `bg-[#F4F6FB]`
     - Bottom pill: `dark:bg-[#0F1115] bg-[#FFFFFF]`
     - Three.js WebGL scene: light-mode responsive materials and lighting so 3D elements pop crisply against light mode while dark mode remains 100% identical to current look.
   - Verify `AboutSection.tsx` tokens seamlessly support both themes.

4. **Testing & Verification**:
   - Run `npm test` verifying 100% pass rate across all 17 test suites (89/89 tests).
   - Update `.ai/progress-tracker.md`.

---

## Planned Code Changes

### 1. [MODIFY] `src/components/contact/ContactModal.tsx`
- Reduce modal size: change `max-w-5xl` to `!max-w-lg sm:!max-w-2xl lg:!max-w-3xl w-[92vw] sm:w-[88vw] max-h-[88vh]`.
- Add light mode support with dark mode preservation:
  - Outer card: `dark:bg-[#08090B] bg-[#FFFFFF] border-outline/30 shadow-2xl`
  - Form inputs & selects: `dark:bg-[#0F1115] bg-[#F4F6FB] border-outline/30 focus-within:border-[#A6FF00]/70`
  - Mascot container: `dark:bg-[#07080A] bg-[#EDF2FB] border-outline/20`
  - Close button: `dark:bg-surface-container/60 bg-surface-container-high/80 text-on-surface`
- Compact form padding and input heights.

### 2. [MODIFY] `src/components/contact/ContactSentinelGraphic.tsx`
- Add light-mode background gradient: `dark:bg-gradient-to-b dark:from-[#0B0D11] dark:via-[#08090B] dark:to-[#050608] bg-gradient-to-b from-[#F4F6FB] via-[#EDF2FB] to-[#E2E7F4]`.
- Compact minimum height for reduced modal footprint (`min-h-[300px] sm:min-h-[360px] lg:min-h-[420px]`).

### 3. [MODIFY] `src/components/about/UnifiedFinanceInfographic3D.tsx`
- Add theme classes:
  - Main container: `dark:bg-[#08090B]/90 bg-[#FFFFFF]/95`
  - Top subheader: `dark:bg-[#0F1115] bg-[#EDF2FB]`
  - Infographic cards: `dark:bg-[#0F1115]/80 bg-[#FFFFFF]/90`
  - Badges/pills: `dark:bg-[#161920] bg-[#EDF2FB]`
  - Bottom banner: `dark:bg-[#0F1115] bg-[#FFFFFF]`
- Adapt Three.js scene lighting and metallic tone for light mode while preserving dark mode exactly.

### 4. [MODIFY] `.ai/progress-tracker.md`
- Document light and dark mode implementations and modal size reduction.

---

## Acceptance Criteria
- [ ] Contact modal supports both light mode and dark mode; dark mode remains unchanged.
- [ ] Contact modal overall size is reduced and compact (`max-w-3xl`).
- [ ] About section and 3D infographic support both light mode and dark mode.
- [ ] All 17 automated test suites pass at 100% (89/89 tests).
