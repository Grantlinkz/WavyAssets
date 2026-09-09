# Implementation Prompt: Interactive 3D Asset Hero Gyroscope & Kinetic Typography Entrance

## Unit Overview

- **Sprint**: Post-Sprint 5 Interactive 3D & Kinetic Typography Elevation
- **Unit**: Interactive 3D Gyroscope Asset Container & Horizontal Blur-Expand Kinetic Hero Typography
- **Target Files**:
  - `src/components/canvas/HeroAssetGyroscope.tsx` [NEW]
  - `src/components/hero/KineticHeroTypography.tsx` [NEW]
  - `src/App.tsx` [MODIFY]
  - `Tests/IntegrationTest/hero3DAndTypographyIntegration.test.tsx` [NEW]
  - `.ai/progress-tracker.md` [MODIFY]

---

## 1. Context & User Directives Reference

The user has specified two concrete enhancements based on uploaded screenshots:

### Directive 1: Interactive Lightweight 3D Web Asset Hero Container (Screenshot 1 & 2)
- **Placement**: Replace / place in the hero section row where the Quick Metrics Strip (`$1.482B`, `14.2%`) is located.
- **Layout**: Central multi-layered orbital gyroscope representing the 7 asset tiers:
  1. Crypto (Electric Cyan / Gold orbital ring)
  2. DMA Equities (Brushed Titanium orbital ring)
  3. Quant AI (Luminous Node ring)
  4. Tokenized Deeds (Emerald Gold orbital ring)
  5. Provenance Vaults (Matte Obsidian & Titanium ring)
  6. Titanium Metal Cards (Polished Metallic orbital ring)
  7. MPC Custody (Central Sovereign Core Vault sphere / icosahedron)
- **Style**: Luxury fintech dark mode. Matte obsidian (`#0A0D14`), frosted glass (`roughness: 0.15, transmission: 0.95`), brushed titanium accents, subtle electric-cyan (`#00E5FF`) and warm-gold (`#D4AF37`) rim highlights.
- **Animation**: Continuous slow-axis rotation (0.2 rad/s) with a gentle floating vertical bob (sine wave). Zero camera shake, perfectly loopable ambient idle state.
- **Interaction**: Smooth damping on cursor/pointer parallax tracking; hover states that subtly expand the orbital rings.
- **Performance**: Low polygon budget (`TorusGeometry` with optimized segments), optimized directional/ambient lighting, transparent canvas background, throttled on `document.hidden` or off-screen, with complete geometry/material disposal on unmount.
- **Integrated Telemetry HUD**: Retains the live `$1.482B` Total Assets Tracked and `14.2%` Average Annual Return metrics as a sleek, non-intrusive HUD overlay.

### Directive 2: Kinetic Typography Entrance Effect (Screenshot 3)
- **Target**: The Hero typography (`Smart Multi-Asset Wealth & Digital Money Wallet`, eyebrow badge, and subdeck description).
- **Visuals & Mechanics**:
  - Starts tightly clustered horizontally (`letterSpacing: "-0.04em"` or contracted cluster) and smoothly expands outward along the horizontal axis to resting geometry.
  - Enters the viewport with a vertical slide (`translateY: 28px` to `0px`).
  - Simultaneous transition from `opacity: 0` and soft Gaussian blur (`filter: blur(14px)`) to full clarity (`blur(0px)` and `opacity: 1`).
  - Expressive easing curve (`cubic-bezier(0.22, 1, 0.36, 1)` / `power3.out`) for a fast entrance that glides gracefully into its resting state on page load.
  - Staggered word/phrase orchestration for institutional depth.
  - Respects `prefers-reduced-motion`.

---

## 2. Planned Changes & Technical Specifications

### A. Interactive 3D Gyroscope Asset Container (`HeroAssetGyroscope.tsx`)
- Build using React Three Fiber (`@react-three/fiber`) and Three.js (`three`).
- Create nested 7-tier orbital rings with varying radius, tilt angles, and opposing rotation vectors:
  - Ring 1: Radius 2.2, Tilt X 25°, Z 15° (Crypto)
  - Ring 2: Radius 1.9, Tilt X -35°, Y 20° (DMA Equities)
  - Ring 3: Radius 1.6, Tilt Y 45°, Z -10° (Quant AI)
  - Ring 4: Radius 1.3, Tilt X 50°, Y -30° (Tokenized Deeds)
  - Ring 5: Radius 1.05, Tilt X -20°, Z 60° (Provenance Vaults)
  - Ring 6: Radius 0.8, Tilt Y -60°, Z 25° (Titanium Cards)
  - Central Core: Radius 0.45 Icosahedron/Sphere with pulsing wireframe vault glow (MPC Custody)
- Pointer parallax tracking: `useFrame` with lerp damping (`THREE.MathUtils.damp`) for smooth cursor tilt without abrupt jerks.
- Hover interaction: Pointer hover expands rings (`scale: 1.08`), lighting up rim highlights.
- Ambient floating bob: `sin(time * 1.5) * 0.08`.
- Container HUD: Integrated top status chip (`7-TIER SOVEREIGN GYROSCOPE`) and bottom metrics bar displaying `$1.482B AUM` and `14.2% RETURN`.

### B. Kinetic Typography Component (`KineticHeroTypography.tsx`)
- Build with Framer Motion (`motion.h1`, `motion.div`, `motion.p`).
- Wrap the hero header words in `motion.span` items with staggered sequence (`staggerChildren: 0.08`).
- Animate `y: [28, 0]`, `opacity: [0, 1]`, `filter: ['blur(14px)', 'blur(0px)']`, and `letterSpacing: ['-0.035em', '0em']`.
- Custom cubic-bezier transition: `ease: [0.22, 1, 0.36, 1]`, `duration: 0.9`.

### C. Application Shell Mounting (`App.tsx`)
- Mount `<KineticHeroTypography />` in place of static hero typography.
- Mount `<HeroAssetGyroscope />` in place of the static metrics card.

---

## 3. Acceptance Criteria & Verification

1. `npx tsc -b` compiles with 0 errors.
2. `npm run lint` passes with 0 errors.
3. `npm test` runs 100% passing across all unit and integration test suites.
4. The 3D Gyroscope renders smoothly with continuous rotation, bobbing, and pointer damping.
5. On page load, the hero typography enters with the horizontal expand, vertical glide, and blur-to-clear transition.
