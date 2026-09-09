# Implementation Prompt: AI Systematic Funds Robot Video & Section Animations

## Objective
Replace the static `HARDWARE PERFORMANCE` metrics block (second screenshot) in `AiFundsPanel.tsx` with a continuous autoplaying loop of the institutional robot video (`src/assets/verticals/Robot.mp4`), and add performant kinetic Framer Motion entrance and ambient animations to the entire top hero section (first screenshot).

---

## Technical Specifications & Architecture

### 1. Video Integration (`src/assets/verticals/Robot.mp4`)
- Replace the `lg:col-span-5` container holding the static hardware metrics with a dedicated interactive video frame.
- **Continuous Autoplay Guardrails**:
  - `autoPlay={true}`
  - `loop={true}`
  - `muted={true}` (browser prerequisite for autoplay policy compliance)
  - `playsInline={true}` (prevents mobile OS full-screen takeover)
  - `preload="auto"`
  - Strict omission of the `controls` attribute, ensuring no play, pause, seek, or volume controls are rendered.
  - Video tag styled with `w-full h-full object-cover rounded-sm`.
- **Institutional Overlay & Badge**:
  - Top-left or top-right telemetry pill badge: `AUTONOMOUS AI AGENT` with a pulsing emerald status indicator (`bg-secondary animate-pulse`).
  - Sleek Obsidian frame (`bg-surface-container-lowest border border-outline/30 rounded-sm overflow-hidden relative shadow-lg group hover:border-primary/50 transition-colors`).
  - Dimensioned container (`aspect-video sm:aspect-[16/10] min-h-[220px] max-h-[320px] flex items-center justify-center`) to eliminate any Cumulative Layout Shift (CLS = 0).

### 2. Motion & Physics (`framer-motion`)
- **Entire Hero Section (First Screenshot)**:
  - **Left Column** (Headline, plain-English subdeck, badges, and CTAs):
    - `initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}`
    - `whileInView={{ opacity: 1, x: 0 }}`
    - `viewport={{ once: true, amount: 0.2 }}`
    - `transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}`
    - `style={{ willChange: 'transform, opacity' }}`
  - **Right Column (Robot Video Container)**:
    - `initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 30, scale: shouldReduceMotion ? 1 : 0.97 }}`
    - `whileInView={{ opacity: 1, x: 0, scale: 1 }}`
    - `viewport={{ once: true, amount: 0.2 }}`
    - `transition={{ duration: 0.85, delay: shouldReduceMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}`
    - `style={{ willChange: 'transform, opacity' }}`
- **Reduced Motion Support**:
  - Respects `useReducedMotion()` from `framer-motion`, falling back to static opacity transitions for accessibility.

---

## Files to Modify
1. `src/components/panels/views/AiFundsPanel.tsx`:
   - Import `robotVideo` from `../../../assets/verticals/Robot.mp4`.
   - Import `motion`, `useReducedMotion` from `framer-motion`.
   - Replace lines 91–118 (`HARDWARE PERFORMANCE` container) with the animated continuous video container.
   - Wrap left and right columns with Framer Motion entrance kinematics.
2. `Tests/IntegrationTest/assetPanelsAndAuthIntegration.test.tsx`:
   - Verify SSR and DOM rendering of the continuous autoplay video in `AiFundsPanel` (verifying `autoPlay`, `loop`, `muted`, `playsInline`, and absence of controls).
   - Ensure existing assertions (`AI Systematic Funds & GPU Compute Mesh`, `NVIDIA H100 SXM5 80GB Cluster`, `14.8% APY`) continue to pass seamlessly.
3. `.ai/progress-tracker.md`:
   - Log the completed AI Systematic Funds Robot Video and section animation enhancement.

---

## Acceptance Criteria
- [ ] Static hardware metrics box in the second screenshot is replaced with `Robot.mp4`.
- [ ] Video plays continuously in an infinite loop without play/pause controls.
- [ ] Autoplay works reliably across browsers with `muted`, `autoPlay`, and `playsInline`.
- [ ] Entire hero section in the first screenshot has smooth Framer Motion entrance animations with reduced-motion fallback.
- [ ] Zero layout shift (CLS = 0) with a pre-dimensioned container.
- [ ] 100% test pass rate across all 15 Vitest test suites (74+ tests passing).
- [ ] Minimum two conventional git commits logged.
