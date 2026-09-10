# Sprint 6 Implementation Prompt: Performance Profiling, WCAG Hardening, Custom 404 & System Language Verification

## Unit Overview

- **Sprint**: Sprint 6 (Week 6) / Go-Live & Hardening
- **Unit**: Performance Profiling, WebGL Render Culling, WCAG 2.1 AA Hardening, Sovereign Custom 404 Page, and System Language / Locale Verification
- **Source of Truth & Reference**:
  - `tools/Implementation Strategy And Timeline.pdf` (Week 6: Performance Profiling, GPU Lifecycle Guardrails, Accessibility Standards & Go-Live)
  - `tools/Landing Page Implementation Plan.pdf` (SLA benchmarks, zero CLS, sub-50ms panel swaps)
  - `GEMINI.md` (Obsidian Dark `#08090B` & Luxury Light `#f9f9ff` palettes, 4px micro-chamfers, clean WebGL lifecycle, secure error handling & redacted logging, prefers-reduced-motion)
- **Target Files**:
  - `src/lib/locale.ts` [NEW]
  - `src/lib/formatters.ts` [MODIFY]
  - `src/components/error/TerminalErrorBoundary.tsx` [NEW]
  - `src/components/common/NotFoundPage.tsx` [NEW]
  - `src/components/canvas/HeroAssetGyroscope.tsx` [MODIFY]
  - `src/components/about/AboutVaultCanvas3D.tsx` [MODIFY]
  - `src/store/useTerminalStore.ts` [MODIFY]
  - `src/App.tsx` [MODIFY]
  - `.ai/progress-tracker.md` [MODIFY]
  - `Tests/UnitTest/locale.test.ts` [NEW]
  - `Tests/UnitTest/formatters.test.ts` [MODIFY]
  - `Tests/IntegrationTest/sprint6HardeningAnd404Integration.test.tsx` [NEW]

---

## 1. Architectural & Engineering Specifications

### A. System Language & Locale Verification
- **System Detection**: Inspect `navigator.languages?.[0]` or `navigator.language` to automatically detect the user's default system language and regional locale (e.g., `'en-US'`, `'en-GB'`, `'de-DE'`, `'fr-FR'`, `'ja-JP'`), with fallback to `'en-US'`.
- **HTML Document Lang**: Synchronize `<html lang="...">` dynamically at runtime on initialization to match the detected system language (e.g. `document.documentElement.lang = getSystemLanguage()`).
- **Locale-Aware Tabular Financial Formatting**: Update `src/lib/formatters.ts` (`formatCurrency`, `formatPercent`, etc.) to accept and default to the detected system locale, ensuring currency formatting matches user expectations while maintaining tabular nums (`Inter` / `JetBrains Mono`) and zero layout shifts.
- **Persistence & Override**: Support `wavy_locale` in `localStorage` for manual regional overrides as defined in `.ai/architecture.md`.

### B. Sovereign Custom 404 Page (`NotFoundPage.tsx`)
- **Route Detection**:
  - Detect unknown pathname visits (e.g. any pathname other than `/` and `/research`) and invalid routes (`#/404` or invalid asset routing).
  - Render an institutional sovereign 404 page inside the terminal shell.
- **Design & UX Copy (Fintech UX Content Strategy)**:
  - Header badge: `ERROR 404 // DEPOSITORY RECORD NOT FOUND`.
  - Headline: `404 — Page or Vault Record Not Found`.
  - Subtitle: `The requested page, protocol route, or asset terminal does not exist or has been relocated to offline cold storage.`
  - Technical diagnostic card with sanitized telemetry (`Path`, `Status: HTTP 404`, `Cluster: Sovereign WebGL Node 01`, `Timestamp`).
  - Action buttons:
    - `Return to Sovereign Terminal` (navigates back to home `/`, resets hash to `#/services/crypto`, smooth scrolls to top).
    - `Browse Services` (opens Services MegaMenu).
    - `Contact Custody Desk` (opens institutional `ContactModal`).
- **Aesthetic**:
  - Micro-chamfered 4px borders, subtle hairline borders (`border-outline`), Sovereign Gold accents, dual Obsidian Dark & Luxury Light support, zero CLS.

### C. WebGL Render Loop Throttling & Off-Screen Canvas Culling
- **Lifecycle Safety**:
  - `HeroAssetGyroscope.tsx`: Integrate `IntersectionObserver` so the 3D Canvas render loop completely pauses when scrolled out of view (`frameloop={isIntersecting && isTabVisible && !reducedMotion ? 'always' : 'never'}`).
  - `AboutVaultCanvas3D.tsx`: Add `IntersectionObserver` culling alongside `visibilitychange` listener and explicitly dispose of Three.js geometries/materials on unmount.
  - `AmbientCanvas.tsx`: Retain visibility throttling and ensure full cleanup.
  - `UnifiedFinanceInfographic3D.tsx`: Retain complete geometry and material disposal with IntersectionObserver throttling.

### D. WCAG 2.1 AA Accessibility & Hardening
- **Skip Link**: Implement a keyboard-navigable `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to main content</a>` at the top of the viewport.
- **Focus Management & Landmarks**: Ensure `<main id="main-content">` has a clear focus target and proper landmark semantics.
- **Screen Reader Announcements**: Add a hidden ARIA live region (`aria-live="polite" aria-atomic="true"`) announcing route changes, modal openings, and active asset views.
- **Global Error Boundary**: Implement `TerminalErrorBoundary` to catch unhandled rendering exceptions gracefully:
  - Renders an institutional fallback UI ("Terminal Rendering Exception").
  - Redacts PII and internal stack traces per `GEMINI.md` security invariant #6.
  - Provides a "Reload Terminal" recovery button.

---

## 2. Planned Changes & Implementation Steps

### Step 1: System Language & Locale Engine (`src/lib/locale.ts` & `src/lib/formatters.ts`)
- Implement `getSystemLocale()` and `getSystemLanguage()`.
- Implement `initSystemLanguage()` to update `document.documentElement.lang`.
- Update `formatCurrency` in `src/lib/formatters.ts` to utilize `getSystemLocale()`.
- Add unit tests in `Tests/UnitTest/locale.test.ts` and update `Tests/UnitTest/formatters.test.ts`.

### Step 2: Sovereign Custom 404 Page (`src/components/common/NotFoundPage.tsx`)
- Build sovereign 404 component with diagnostic card, plain English copy, and CTAs.
- Wire route detection in `App.tsx` and `useTerminalStore.ts` to show `NotFoundPage` when an invalid path or `#/404` is visited.

### Step 3: WebGL Off-Screen Canvas Culling
- Update `HeroAssetGyroscope.tsx` with `IntersectionObserver` to halt rendering when out of viewport.
- Update `AboutVaultCanvas3D.tsx` with `IntersectionObserver` and verify geometry disposal.

### Step 4: WCAG 2.1 AA & Error Boundary Hardening (`TerminalErrorBoundary.tsx` & `App.tsx`)
- Create `TerminalErrorBoundary.tsx` with sanitized institutional fallback.
- Add skip to main content link and ARIA live announcements in `App.tsx`.
- Wrap main deck in `TerminalErrorBoundary`.

### Step 5: Test Coverage & Progress Tracker
- Create `Tests/IntegrationTest/sprint6HardeningAnd404Integration.test.tsx`.
- Verify all tests pass (100% pass rate).
- Update `.ai/progress-tracker.md` to mark Sprint 6 completed.

---

## 3. Acceptance Criteria

- [ ] Project verifies and automatically uses the default system language (`navigator.language`) and synchronizes `<html lang="...">`.
- [ ] Financial formatters respect system locale with robust fallbacks.
- [ ] Custom 404 page renders for unknown paths or `#/404`, with functional CTAs ("Return to Sovereign Terminal", "Browse Services", "Contact Custody Desk").
- [ ] WebGL canvases throttle loop on tab blur (`document.hidden`) and cull rendering when off-screen (`IntersectionObserver`).
- [ ] Accessible skip-to-content link and ARIA live region are present.
- [ ] Global `TerminalErrorBoundary` traps unexpected crashes with redacted, secure fallback UI.
- [ ] 100% automated test pass rate across all unit and integration test suites.
