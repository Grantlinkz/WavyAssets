# Sprint 3B Implementation Prompt: High-Frequency Kinetic Motion & Institutional Animation Suite

## Unit Overview
- **Sprint**: Sprint 3B (Motion & Kinetic Elevation)
- **Unit**: High-Frequency Kinetic Financial Counters, 3D Gyroscope Radial Donut Morphing, Shared Layout Glide Tabs, and Staggered Depository Reveal
- **Target Files**:
  - `src/components/common/AnimatedNumber.tsx` [NEW]
  - `src/components/simulator/DonutChart3D.tsx` [MODIFY]
  - `src/components/simulator/PortfolioSimulator.tsx` [MODIFY]
  - `src/components/discovery/AssetDiscoveryHub.tsx` [MODIFY]
  - `Tests/UnitTest/animatedNumber.test.ts` [NEW]
  - `Tests/IntegrationTest/simulatorIntegration.test.tsx` [MODIFY]
  - `.ai/progress-tracker.md` [MODIFY]

---

## 1. Context & Specifications Reference
- **User Feedback**: The current interface feels static/boring; requires dynamic institutional animation suite to make the terminal feel responsive, alive, and ultra-premium without compromising institutional dignity.
- **`tools/Landing Page Implementation Plan.pdf`**:
  - SLA benchmarks: Sub-50ms panel transitions, zero CLS (Cumulative Layout Shift = 0).
  - Micro-chamfer geometry (`4px` / `0.25rem` default, `8px` / `0.5rem` for elevated panels, strictly no pills >8px).
  - Strict `JetBrains Mono` tabular lining figures (`tabular-nums`) for all monetary values, percentages, and latency metrics.
  - Smooth 60fps GPU-accelerated motion using Framer Motion transforms and opacity (`will-change: transform`).
- **`GEMINI.md`**:
  - Clean accessibility: honor `prefers-reduced-motion` via `useReducedMotion` by falling back to instant/static transitions.
  - Zero Cumulative Layout Shift (CLS = 0) with enforced container heights.
  - Pre-commit verification: `tsc -b`, `npm run lint`, `npm test`.
  - Minimum of two git commits with conventional commit prefixes.

---

## 2. Planned Changes & Implementation Steps

### A. Reusable Institutional Rolling Counter (`src/components/common/AnimatedNumber.tsx`)
- High-performance, physics-driven financial odometer using Framer Motion springs (`stiffness: 280, damping: 32`).
- Accepts numeric `value`, formatting function `formatter: (n: number) => string` (e.g. `formatCurrency`, `formatPercent`), and optional flash highlight on change (`flashColor`).
- Flawless SSR / Node 24 test compatibility: renders the formatted target value immediately on initial mount/SSR to avoid hydration layout shifts or test mismatches in `renderToString`.
- Full `prefers-reduced-motion` compliance.

### B. Dynamic Arc Morphing & 3D Gyroscope Donut (`src/components/simulator/DonutChart3D.tsx`)
- SVG segment arcs converted to Framer Motion `motion.circle` with animated `strokeDasharray` and `strokeDashoffset` on mandate switch.
- 3D mouse gyroscope tilt effect: tracks cursor position relative to the donut container and applies subtle 3D perspective tilt (`rotateX`, `rotateY` capped to ±8 deg).
- Concentric radar pulse ring emitting from center gauge.
- Animated blended APY readout using `AnimatedNumber`.
- Segment hover pop with subtle elevation glow and synchronized legend item highlights.

### C. Kinetic Sliders & Specular Border Spotlight (`src/components/simulator/PortfolioSimulator.tsx`)
- Connect `AnimatedNumber` to:
  - Capital readout (`$250,000.00`)
  - Estimated 12-Month Net Return (`$35,500.00` / `$56,000.00` / `$224,000.00`)
  - Estimated Monthly Runrate (`+$2,958.00 / Mo` / `+$4,667.00 / Mo` / `+$18,667.00 / Mo`)
- Add subtle cursor spotlight tracking on the obsidian console container using radial gradient mask.
- Quick Select Capital chips enhanced with tactile spring hover & tap physics (`whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`).
- Mandate badge animated flip / cross-fade when switching risk postures.

### D. Shared Layout Glide Tabs & Staggered Reveal (`src/components/discovery/AssetDiscoveryHub.tsx`)
- Horizontal segmented 7-vault tabs enhanced with Framer Motion `layoutId="activeVaultTabIndicator"`:
  - An institutional gold border and ambient glow smoothly glides horizontally under/behind the selected tab when clicking between Crypto, Equities, Compute, Real Estate, Cars, VIP Cards, and Treasury.
- Active Depository Overview Card wrapped in `AnimatePresence mode="wait"`:
  - Staggered cascade entrance (`opacity: 0, y: 8` -> `opacity: 1, y: 0`) in under 50ms.
  - Quantitative diagnostics cards (NAV, Settlement Rail, SLA, Custody Auditor) enter with staggered micro-delays (0.03s intervals).
- Tactile hover feedback on the "INSPECT FULL ASSET ENCLAVE >" primary execution button.

### E. Verification & Testing
- `Tests/UnitTest/animatedNumber.test.ts`:
  - Verify initial SSR output matches formatted string without delay.
  - Verify accessibility attributes and reduced-motion fallback.
- `Tests/IntegrationTest/simulatorIntegration.test.tsx`:
  - Ensure all 28 existing test assertions remain 100% green.
  - Validate new animation attributes and interactive presence markup.
- Lint and typecheck verification.
- Progress tracker update in `.ai/progress-tracker.md`.

---

## 3. Acceptance Criteria
- [ ] Smooth 60fps transitions without any layout shifts or visual glitches.
- [ ] Numbers roll dynamically when dragging sliders or clicking quick select chips.
- [ ] Active vault tab indicator smoothly glides across all 7 asset classes via `layoutId`.
- [ ] Donut segments morph fluidly when changing strategy mandate.
- [ ] Micro-chamfer geometry (`4px` / `8px`) and `JetBrains Mono` tabular lining figures strictly maintained.
- [ ] Respects `prefers-reduced-motion` with instant fallbacks.
- [ ] 100% test pass rate (`npm test`), zero TypeScript errors (`tsc -b`), zero lint warnings (`npm run lint`).
- [ ] At least two git commits using conventional commit prefixes.
