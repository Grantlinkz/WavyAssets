# Implementation Prompt: Services MegaMenu Diagnostics Rewrite & Fixed Viewport Docking

## Unit Overview

- **Sprint**: Post-Sprint 5 Terminal UX Refinements
- **Unit**: MegaMenu Diagnostics Plain English Rewrite & Fixed Viewport Docking on Scroll
- **Target Files**:
  - `src/components/nav/MegaMenuDiagnostics.tsx` [MODIFY]
  - `src/components/nav/ServicesMegaMenu.tsx` [MODIFY]
  - `Tests/IntegrationTest/megaMenuIntegration.test.tsx` [MODIFY]
  - `Tests/IntegrationTest/brandAndThemeIntegration.test.tsx` [MODIFY]
  - `.ai/progress-tracker.md` [MODIFY]

---

## 1. Context & User Directives Reference

The user has specified two concrete tasks based on uploaded screenshots:
1. **Rewrite Diagnostics Section (Screenshot 1)**:
   - Rewrite the `MegaMenuDiagnostics.tsx` panel in friendly, plain English (approx. 8th-grade reading level) per Fintech UX Content Strategy, eliminating cryptic jargon ("enclaves", "mean tick", "cross-margin ratio", "sweeps", "asset class mandate", "deep simulator").
   - Increase text contrast (replacing `text-outline` with `text-on-surface-variant` / `text-neutral-300`).
2. **Fix Service Details Not Showing Fully on Scroll (Screenshot 2)**:
   - When the user scrolls down the page and clicks the "SERVICES" trigger in the sticky header, `ServicesMegaMenu` is currently positioned with `absolute top-16`, causing it to stay at the top of the whole document (scrolled off-screen above the viewport).
   - Fix positioning to `fixed top-16 left-0 right-0 z-40 max-h-[calc(100vh-4.5rem)] overflow-y-auto` so the mega-menu always opens docked directly beneath the sticky header in the active viewport, displaying all content completely regardless of scroll position.

---

## 2. Planned Changes & Technical Specifications

### A. Rewrite `MegaMenuDiagnostics.tsx` in Plain English & High Contrast
- **Header**:
  - Replace `ACTIVE VERTICAL DIAGNOSTICS` with `VAULT HEALTH & PLATFORM STATUS`
  - Replace `ONLINE` with `ALL SYSTEMS LIVE`
- **Capacity / Reserves Card**:
  - Replace `AGGREGATED COLLATERAL CAPACITY` with `TOTAL PROTECTED VAULT RESERVES`
  - Replace `$1,248,500,000 AVAIL` with `$1,248,500,000 AVAILABLE`
  - Replace `62% STAKED / ALLOCATED` with `62% ACTIVELY INVESTED`
  - Replace `38% BUFFER` with `38% CASH BUFFER`
  - Replace `text-outline` on label with `text-on-surface-variant dark:text-neutral-400`
- **Execution & Security Details**:
  - Replace `Custodial Enclaves:` with `Secure Vault Hubs:` and value `Zurich, New York, Singapore`
  - Replace `Clearing Latency:` with `Execution Speed:` and value `< 0.04ms (Instant)`
  - Replace `Daily Net Sweeps:` with `Daily Account Updates:` and value `04:00 UTC (Automated)`
  - Replace `Cross-Margin Ratio:` with `Reserve Backing:` and value `100% Fully Backed`
- **Action Triggers**:
  - Primary button: `Download Safety & Custody Guide` (replaces `Download Asset Class Mandate`)
  - Secondary button: `Calculate Potential Returns` (replaces `Launch Deep Simulator`)
  - Sub-link: `DEVELOPER & INSTITUTIONAL API DOCS →` (replaces `DIRECT ENCLAVE API DOCS (FIX 4.4 / REST) →`, with `text-on-surface-variant hover:text-on-surface`)

### B. Fix Services MegaMenu Viewport Docking (`ServicesMegaMenu.tsx`)
- Update outer motion wrapper:
  ```tsx
  className="w-full fixed top-16 left-0 right-0 z-40 px-4 sm:px-6 pt-2 pb-6 max-h-[calc(100vh-4.5rem)] overflow-y-auto custom-scrollbar"
  ```
- By using `fixed` instead of `absolute`, the flyout stays anchored directly below the sticky `GlobalHeader` (`top: 64px`) no matter where on the page the user has scrolled.
- `max-h-[calc(100vh-4.5rem)]` guarantees that the full menu (header, filter ribbon, 7 asset cards, diagnostics rail, and footer bar) fits comfortably within the viewport without getting cropped or hidden.

### C. Test Synchronization (`megaMenuIntegration.test.tsx`)
- Update test string assertions to match the rewritten plain-English labels (`VAULT HEALTH & PLATFORM STATUS`, `$1,248,500,000`, `< 0.04ms`, `Zurich, New York, Singapore`, `Download Safety & Custody Guide`).
- Verify that `ServicesMegaMenu` renders with `fixed top-16` class.

---

## 3. Acceptance Criteria & Verification

1. `npm test` runs with 100% passing rate across all 14 test suites.
2. `npx tsc -b` compiles with 0 errors.
3. `npm run lint` passes with 0 errors.
4. Scrolling down the page and clicking "SERVICES" displays the full mega-menu smoothly docked right beneath the header with zero clipping.
5. All diagnostics telemetry metrics and labels are plain, transparent, and easy to understand.
