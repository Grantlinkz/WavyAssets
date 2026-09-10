# Implementation Prompt: WavyAssets Brand Identity, Light Mode Wave Dynamics, Service Menu Scroll & Footer Contrast

## Unit Overview

- **Sprint**: UX & Brand Refinements (Post-Sprint 5)
- **Unit**: Brand Logo & Favicon Identity, Light Mode Wave Support, Services MegaMenu Scrollability & Dark Mode Footer Contrast
- **Target Files**:
  - `src/components/common/BrandLogo.tsx` [MODIFY]
  - `public/favicon.svg` [MODIFY]
  - `index.html` [MODIFY]
  - `src/components/canvas/WavyBackground.tsx` [MODIFY]
  - `src/components/nav/ServicesMegaMenu.tsx` [MODIFY]
  - `src/components/footer/InstitutionalFooter.tsx` [MODIFY]
  - `Tests/IntegrationTest/brandAndThemeIntegration.test.tsx` [NEW]
  - `Tests/IntegrationTest/trustAndComplianceIntegration.test.tsx` [MODIFY]
  - `.ai/progress-tracker.md` [MODIFY]

---

## 1. Context & User Requirements Reference

The user has specified four concrete directives:
1. **Logo & Favicon ("WavyAssets" Inspiration)**:
   - Design an institutional logo and matching favicon inspired by "WavyAssets", featuring fluid sinusoidal waves intertwined with sovereign geometric vault lines.
   - Make it the default logo everywhere (`BrandLogo.tsx`, `public/favicon.svg`, `index.html`).
   - Clicking the logo must navigate back to the homepage (clearing active deep-link hash and smoothly scrolling to top).
2. **Light Mode Contrast for `WavyBackground.tsx`**:
   - In light mode (`resolvedTheme === 'light'`), render opposite light luxury colors (e.g. pure white `#FFFFFF` and subtle silvery alabaster `#EAEFF8` / `#F0F3FA`).
   - In dark mode (`resolvedTheme === 'dark'`), preserve the exact existing `#08090B` (Licorice) and `#0F1115` (Jet Black) sine-wave stripes.
3. **Scrollable Service Tab Details (`ServicesMegaMenu.tsx`)**:
   - As shown in the user's screenshot, the 7-vertical grid overflows smaller displays, clipping the lower asset cards.
   - Enable vertical scrolling (`overflow-y-auto` with a clean custom scrollbar and responsive `max-h`) on the asset grid / menu body so all 7 classes (including Cars, VIP Cards, and Wallet) are fully accessible.
4. **Footer `<p>` & Disclaimer Font Color in Dark Mode (`InstitutionalFooter.tsx`)**:
   - The footer disclaimers, `<p>` sections, and copyright bar currently use `text-outline` (`#222632`), making them nearly invisible against dark surfaces as highlighted in the user's screenshot.
   - Update text colors to `text-on-surface-variant` (`#9CA3AF`) and `text-neutral-300` / high contrast readable tokens in dark mode without altering the dark mode colors of `WavyBackground.tsx`.
   - Restore the missing `19.4% APY` badge on Crypto Yields in `InstitutionalFooter.tsx` to fix the failing test in `trustAndComplianceIntegration.test.tsx`.

---

## 2. Planned Changes & Technical Specifications

### A. Brand Logo & Favicon (`BrandLogo.tsx`, `favicon.svg`, `index.html`)
- **Symbolic Motif**:
  - Twin sinusoidal wave curves rendered in Sovereign Gold (`#D4AF37`) and Emerald Accent (`#00C288`) flowing into an ascending crest.
  - Accompanied by refined typography: "WAVY" (`font-sans font-bold text-on-surface`) and "ASSETS" (`font-sans font-medium text-primary`).
- **Homepage Navigation**:
  - Wrap `BrandLogo` in a semantic clickable element (`<button>` or `<a href="#">` with accessible aria-label) that clears `#` hash routing and executes `window.scrollTo({ top: 0, behavior: 'smooth' })`.
- **Favicon**:
  - Update `public/favicon.svg` with the new standalone WavyAssets sovereign wave emblem with dark/gold geometry.

### B. Dynamic Theme Colors in `WavyBackground.tsx`
- Subscribe to `useTerminalStore((state) => state.resolvedTheme)`.
- Recompute stripe colors based on `resolvedTheme`:
  - `dark`: Stripe 1 = `#08090B`, Stripe 2 = `#0F1115`, Base = `#08090B`, Vignette = `from-[#08090B]/40 via-transparent to-[#08090B]/60`.
  - `light`: Stripe 1 = `#FFFFFF`, Stripe 2 = `#EDF2FB`, Base = `#FFFFFF`, Vignette = `from-white/40 via-transparent to-white/60`.
- Preserve seamless 1440x900 SVG coordinate math and linear horizontal translation loop.

### C. Scrollable Service Tab in `ServicesMegaMenu.tsx`
- In the 7-vertical cards column (`lg:col-span-8`):
  - Add `max-h-[62vh] sm:max-h-[520px] overflow-y-auto pr-2 custom-scrollbar` (or on the main menu wrapper) with smooth scrolling.
  - Ensure all 7 asset classes (Crypto, Stocks, AI Funds, Real Estate, Cars, VIP Cards, Wallet) and diagnostics rail render gracefully on laptops and low-height viewports.

### D. Footer `<p>` & Text Contrast Fix (`InstitutionalFooter.tsx`)
- Replace illegible `text-outline` on disclaimers, paragraphs, and compliance links with `text-on-surface-variant` (`text-gray-400` in dark mode, `#4E4637` in light mode).
- Ensure headers and strong tags retain `text-on-surface` (`#F3F4F6` in dark mode).
- Restore `<span className="font-mono text-[10px] text-secondary font-semibold">19.4% APY</span>` inside Crypto Yields button.

---

## 3. Acceptance Criteria & Pre-Commit Verification

1. **Logo & Navigation**:
   - `BrandLogo` renders the new WavyAssets emblem with wave geometry in both Header and Footer.
   - Clicking `BrandLogo` scrolls smoothly to the top and resets hash routing.
   - `favicon.svg` displays the new WavyAssets wave icon.
2. **WavyBackground Theme Reactivity**:
   - Switching to light mode renders soft white/alabaster waves (`#FFFFFF` / `#EDF2FB`).
   - Switching to dark mode retains dark licorice/jet black waves (`#08090B` / `#0F1115`).
3. **Services MegaMenu Scrollability**:
   - Menu cards area scrolls vertically when vertical space is constrained, allowing access to all 7 cards.
4. **Footer Readability**:
   - Disclaimers and regulatory paragraphs are clearly legible with high contrast against the dark background.
5. **Quality & Test Gates**:
   - `npx tsc -b` passes with 0 errors.
   - `npm run lint` passes with 0 errors.
   - `npm test` runs 100% passing across all unit and integration test suites.
   - `.ai/progress-tracker.md` is updated.
