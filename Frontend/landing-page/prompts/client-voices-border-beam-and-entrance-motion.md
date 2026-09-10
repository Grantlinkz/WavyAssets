# Implementation Prompt: Client Voices Entrance Animation, Border Beam & Card Hover Reaction

## Objective
Animate the "INVESTOR TESTIMONIALS" section in `src/components/trust/ClientVoices.tsx` without altering its DOM structure, typography, or Obsidian color scheme, strictly utilizing the project's Framer Motion and Tailwind CSS stack:
1. **Initial Entrance**: On scroll into view, animate the three cards from bottom to top (`translateY(40px) -> 0px`) with smooth fade-in (`opacity: 0 -> 1`), custom ease-out curve (`[0.16, 1, 0.3, 1]`), and a `0.15s` stagger delay between each card (`delay: index * 0.15s`).
2. **Border Beam Effect**: Add a continuous moving glow/light-trace along the outer 1px border path of the cards using an animated conic-gradient sweep with CSS `mask-composite: exclude` / `WebkitMaskComposite: 'xor'`.
3. **Card Hover Reaction**: Elevate the card on hover (`translateY(-6px)`) with a soft glow intensification (`box-shadow` amplification) and smooth cubic transition.

---

## Technical Specifications & Architecture

### 1. Initial Staggered Entrance
- Wrap each card in an entrance container with Framer Motion:
  - `initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}`
  - `whileInView={{ opacity: 1, y: 0 }}`
  - `viewport={{ once: true, amount: 0.2 }}`
  - `transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : index * 0.15, ease: [0.16, 1, 0.3, 1] }}`
  - `style={{ willChange: 'transform, opacity' }}`
  - Pass `index: number` to `SpecularCard` from the `.map((item, index) => ...)` loop.

### 2. Border Beam Continuous Light-Trace
- Inner border beam component inside `SpecularCard`:
  - Enclosed in an absolute container: `pointer-events-none absolute inset-0 rounded-sm overflow-hidden z-20`
  - Styled with:
    - `padding: '1px'`
    - `mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)'`
    - `WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)'`
    - `maskComposite: 'exclude'`
    - `WebkitMaskComposite: 'xor'`
  - Animated inner rotator (`w-[200%] h-[200%] absolute -top-1/2 -left-1/2`):
    - `background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, rgba(212, 175, 55, 0.25) 320deg, rgba(212, 175, 55, 0.95) 348deg, rgba(0, 194, 136, 0.95) 358deg, transparent 360deg)'`
    - Continuous infinite rotation: `animate={shouldReduceMotion ? {} : { rotate: 360 }}`
    - `transition={{ duration: 6, ease: 'linear', repeat: Infinity }}`
    - Tagged with `data-testid="border-beam-trace"`

### 3. Card Hover Reaction
- Smooth elevation and glow intensification:
  - Elevation: `whileHover={{ y: shouldReduceMotion ? 0 : -6 }}` with `transition={{ duration: 0.25, ease: 'easeOut' }}`
  - Soft glow intensification: `transition-all duration-300 hover:shadow-[0_12px_36px_-4px_rgba(212,175,55,0.16),0_0_24px_rgba(0,194,136,0.1)]`
  - Integrated seamlessly with the existing 3D specular spotlight without any interference with mouse coordinates.

### 4. Accessibility & Zero Layout Shift
- Honors `useReducedMotion()` from `framer-motion`:
  - Disables Y-axis displacement if reduced motion is requested.
  - Pauses the rotating beam animation for reduced motion.
- Fixed layout geometry and zero CLS preserved.

---

## Files to Modify
1. `src/components/trust/ClientVoices.tsx`:
   - Import `useReducedMotion` from `framer-motion`.
   - Update `SpecularCard` to accept `index: number`.
   - Add outer entrance motion container with `0.15s` stagger delay and ease-out curve.
   - Add the border beam light-trace element with conic-gradient sweep.
   - Add `whileHover={{ y: -6 }}` and soft glow shadow intensification.
2. `Tests/IntegrationTest/trustAndComplianceIntegration.test.tsx`:
   - Assert presence of `border-beam-trace` and verified card content.
3. `.ai/progress-tracker.md`:
   - Document the Client Voices entrance animation, border beam effect, and hover reaction.

---

## Acceptance Criteria
- [ ] Initial entrance smoothly animates cards from `translateY(40px) -> 0px` with opacity `0 -> 1` and `0.15s` stagger.
- [ ] Border beam effect smoothly traces the outer border path in a continuous loop.
- [ ] Card hover reaction elevates cards to `translateY(-6px)` with soft glow intensification.
- [ ] Existing structure, typography, and color scheme are 100% preserved.
- [ ] Full type safety (`tsc -b`), linting (`npm run lint`), and 100% test pass rate across all 15 Vitest suites.
- [ ] Minimum two conventional git commits logged.
