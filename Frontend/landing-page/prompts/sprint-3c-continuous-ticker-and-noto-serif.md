# Sprint 3C Implementation Prompt: Continuous Syndicate Ticker & Noto Serif Typography Migration

## Unit Overview
- **Sprint**: Sprint 3C (Visual Polish, Ticker Animation & Global Typography Migration)
- **Unit**: Continuous Infinite Sliding Ticker Stream & Full System Typography Migration from Inter to Noto Serif
- **Target Files**:
  - `index.html` [MODIFY]
  - `src/index.css` [MODIFY]
  - `src/App.tsx` [MODIFY]
  - `GEMINI.md` [MODIFY]
  - `.ai/ui-context.md` [MODIFY]
  - `.ai/architecture.md` [MODIFY]
  - `.ai/project-overview.md` [MODIFY]
  - `.ai/progress-tracker.md` [MODIFY]
  - `Tests/IntegrationTest/tickerIntegration.test.tsx` [NEW]

---

## 1. Context & Specifications Reference
- **User Request**:
  1. *"make this section slide on it continously on"* — Transform the top syndicate quote bar into an infinite, continuously sliding marquee ticker that glides across the screen seamlessly.
  2. *"Then change every font from 'inter' to 'Noto Serif'"* — Replace the UI font family (`Inter`) with Google Font `Noto Serif` across the entire application and update all governance/context files in `.ai/` and `GEMINI.md`.
- **System Typography Standard**:
  - Primary UI & Structural Navigation: **Noto Serif** (`"Noto Serif", Georgia, serif`)
  - Quantitative Metrics, Balances, APYs, Latencies & Tables: **Inter** (`tabular-nums`)
- **Ticker Motion Standard**:
  - GPU-accelerated continuous infinite marquee (`transform: translate3d(...)`), seamless zero-gap loop, pause-on-hover for quote inspection, and `prefers-reduced-motion` compliance.
  - Zero Cumulative Layout Shift (CLS = 0) preserved.

---

## 2. Planned Changes & Implementation Steps

### A. Documentation & System Governance Updates (`.ai/` & `GEMINI.md`)
- Update `GEMINI.md`:
  - Set typography: `Google Fonts (Noto Serif for UI headers/navigation/body, Inter for quantitative tabular metrics)`.
- Update `.ai/ui-context.md`:
  - Replace `Inter` with `Noto Serif` across all typography tables (Headline XL, Headline LG, Headline SM, Label Caps, and Button definitions).
- Update `.ai/architecture.md`:
  - Update typography stack specification to `Noto Serif + Inter`.
- Update `.ai/project-overview.md`:
  - Update typography specification to `Noto Serif + Inter`.

### B. Typography Migration to Noto Serif (`index.html` & `src/index.css`)
- In `index.html`:
  - Update Google Fonts link to load:
    `family=Noto+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;600&display=swap`
- In `src/index.css`:
  - Update `@theme`: `--font-sans: "Noto Serif", Georgia, serif;`, `--font-serif: "Noto Serif", Georgia, serif;`.
  - Update `:root`: `--font-sans: "Noto Serif", Georgia, serif;`, `--font-serif: "Noto Serif", Georgia, serif;`.
  - Update typography utility classes (`.font-headline-sm`, `.font-label-caps`, `body`) to ensure `Noto Serif` is applied globally for all UI text, while `var(--font-mono)` / `Inter` continues to govern numbers and tabular metrics.

### C. Infinite Continuous Sliding Ticker (`src/index.css` & `src/App.tsx`)
- In `src/index.css`:
  - Add `@keyframes ticker-slide` running continuously from `0% { transform: translate3d(0, 0, 0); }` to `100% { transform: translate3d(-50%, 0, 0); }`.
  - Add `.animate-ticker-continuous` class with `35s linear infinite` and `pause` on hover.
  - Include `@media (prefers-reduced-motion: reduce)` override.
- In `src/App.tsx`:
  - Fixed title badge on the left: `GLOBAL SYNDICATE FEED` with pulsing indicator.
  - Gradient edge fade masks (left/right) for seamless bleed into the terminal borders.
  - Infinite sliding duplicate feed `[...syndicateFeeds, ...syndicateFeeds]`.

### D. Verification & Automated Testing (`Tests/IntegrationTest/tickerIntegration.test.tsx`)
- Unit/integration test verifying continuous ticker feed elements, marquee presence, and typography token integration.
- Run complete verification: `tsc -b`, `npm run lint`, `npm test` (all tests passing).
- Update `.ai/progress-tracker.md`.
- Minimum 2 Git commits with conventional commit prefixes.

---

## 3. Acceptance Criteria
- [ ] Ticker bar slides continuously and seamlessly without stutter or visual seams.
- [ ] Ticker smoothly pauses when hovered by user.
- [ ] `Noto Serif` loaded in `index.html` and applied via CSS tokens.
- [ ] `.ai/ui-context.md`, `.ai/architecture.md`, `.ai/project-overview.md`, and `GEMINI.md` all reflect `Noto Serif`.
- [ ] Tabular financial metrics remain strictly in `Inter`.
- [ ] 100% test pass rate in Vitest, zero TypeScript errors (`tsc -b`), zero ESLint errors (`npm run lint`).
- [ ] At least two git commits using conventional commit prefixes.
