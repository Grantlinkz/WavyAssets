# Implementation Prompt: Portfolio Simulator Left-Right Opposing Entrance Animations

## Objective
Implement smooth opposing horizontal entrance animations for the two main columns of the Portfolio Simulator:
1. **First Screenshot (Left Column)**: Portfolio Estimation Settings (Investment Amount slider, Investment Strategy slider, description, and fiduciary protocol chips) must smoothly animate in from the left (`x: -80px -> 0px` with `opacity: 0 -> 1`).
2. **Second Screenshot (Right Column)**: Portfolio Breakdown & Estimated Return (3D Donut visualizer, net return readout, risk metrics matrix, and CTA triggers) must smoothly animate in from the right (`x: +80px -> 0px` with `opacity: 0 -> 1`).

---

## Technical Specifications & Architecture

### Motion & Physics (`framer-motion`)
- **Left Column**:
  - `initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -80 }}`
  - `whileInView={{ opacity: 1, x: 0 }}`
  - `viewport={{ once: true, amount: 0.2 }}`
  - `transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}`
  - `style={{ willChange: 'transform, opacity' }}`
  - Tagged with `data-testid="simulator-left-column"`

- **Right Column**:
  - `initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 80 }}`
  - `whileInView={{ opacity: 1, x: 0 }}`
  - `viewport={{ once: true, amount: 0.2 }}`
  - `transition={{ duration: 0.85, delay: shouldReduceMotion ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] }}`
  - `style={{ willChange: 'transform, opacity' }}`
  - Tagged with `data-testid="simulator-right-column"`

### Accessibility & Reduced Motion
- Uses `useReducedMotion()` from `framer-motion` to ensure users with vestibular motion sensitivities receive a smooth, static opacity fade without lateral displacement.

### Performance & GPU Guardrails
- Animates exclusively GPU-accelerated transforms (`x`) and `opacity` with explicit `willChange: 'transform, opacity'`, causing zero reflows or layout recalculation.
- Viewport trigger set to `{ once: true, amount: 0.2 }` so calculations freeze once settled, saving CPU/GPU cycles during active simulation interactions.

---

## Files to Modify
1. `src/components/simulator/PortfolioSimulator.tsx`:
   - Import `useReducedMotion` from `framer-motion`.
   - Wrap Left Column in `<motion.div>` with left entrance kinematics (`x: -80 -> 0`).
   - Wrap Right Column in `<motion.div>` with right entrance kinematics (`x: 80 -> 0`).
2. `Tests/IntegrationTest/simulatorIntegration.test.tsx`:
   - Add assertions for `data-testid="simulator-left-column"` and `data-testid="simulator-right-column"`.
   - Verify SSR rendering and zero CLS parity.

---

## Acceptance Criteria
- [ ] Left column (`PORTFOLIO ESTIMATION SETTINGS`) slides in from the left on view.
- [ ] Right column (`PORTFOLIO BREAKDOWN & ESTIMATED RETURN`) slides in from the right on view.
- [ ] High-frequency simulation interactions (dragging sliders, changing risk modes) remain butter-smooth at 60fps.
- [ ] SSR / Node 24 rendering succeeds without layout shift or hydration mismatch.
- [ ] All 15 Vitest suites pass (74+ tests passing).
- [ ] Two conventional git commits logged per `GEMINI.md`.
