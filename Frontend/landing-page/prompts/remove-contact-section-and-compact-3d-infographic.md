# Implementation Prompt: Remove ContactSection & Compact 3D Unified Finance Infographic

## Task Overview

1. **Remove ContactSection**:
   - Delete `src/components/contact/ContactSection.tsx` and remove its import and mounting in `src/App.tsx`.
   - Leave `src/components/contact/ContactModal.tsx` and `src/components/contact/ContactSentinelGraphic.tsx` completely untouched and fully functional.
   - Ensure clicking "Contact" in `GlobalHeader` or navigating to `#contact` continues to trigger the `ContactModal` without issue.

2. **Compact Spacing & Enlarge 3D Animation in UnifiedFinanceInfographic3D**:
   - Eliminate the large empty vertical gap between the narrative text block ("Pioneering Multi-Asset Freedom and Cold-Storage Security") and the interactive infographic grid (as highlighted in the reference screenshot).
   - Maintain the existing 4-column horizontal layout and relative positioning:
     1. Left column: _Pioneering Multi-Asset Freedom_ (Fiat currencies, Gold Bars & Bullion, Bitcoin & Ethereum).
     2. Center column: 3D Shield with Cyan Ocean Wave and Heavy Golden Padlock, with _Cold-Storage Security_ card anchored below.
     3. Right column: _Target Client Segments_ (Family Offices, Institutions, Smart Individual Investors).
     4. Far Right column: _Eliminates The Chaos_ (Scattered Charts, Bank Facade, Locked Safe, Pie Charts).
     5. Bottom: _Total Control, Mathematical Transparency, and Peace of Mind_ pill banner.
   - Make the 3D WebGL animation (the central Shield, Cyan Ocean Wave, Golden Padlock with glowing keyhole, wireframe Globe with orbital rings, and the 3 flow splines with moving photons) visibly bigger and more immersive by adjusting scale, camera distance, and canvas viewport bounds.
   - Ensure seamless responsiveness across mobile (`grid-cols-1`) and desktop (`grid-cols-12`).

3. **Test & Verification Integrity**:
   - Update `Tests/IntegrationTest/contactIntegration.test.tsx` to verify `ContactModal` and App deck mounting without expecting the removed on-page `ContactSection`.
   - Ensure `Tests/IntegrationTest/aboutAndResearchIntegration.test.tsx` matches badges and passes 100%.
   - Verify zero TypeScript errors (`tsc -b`), zero lint errors (`npm run lint`), and 100% test pass rate across all 17 test suites (`npm test`).
   - Update `.ai/progress-tracker.md`.

---

## Planned Code Changes

### 1. [DELETE] `src/components/contact/ContactSection.tsx`

- Remove the file as requested by the user.

### 2. [MODIFY] `src/App.tsx`

- Remove `import { ContactSection } from './components/contact/ContactSection';`
- Remove `<ContactSection />` from `<main>`.

### 3. [MODIFY] `src/components/about/UnifiedFinanceInfographic3D.tsx`

- Remove the excessive vertical centering gap (`min-h-[580px] flex items-center`) that pushed the cards ~160px down from the narrative text.
- Change canvas container and grid alignment to `items-start` with compact spacing (`pt-2 sm:pt-4`, `space-y-4` to `space-y-3`).
- Scale up the 3D scene elements:
  - Increase the scale of `centerGroup` (Shield + Wave + Padlock) by ~25-30% (`scale.set(1.28, 1.28, 1.28)`).
  - Increase the scale of `leftGlobeGroup` (Globe + orbital rings + tokens) by ~25% (`scale.set(1.22, 1.22, 1.22)`).
  - Adjust camera position from `z = 11` to `z = 9.4` and position `y = 0.2` so the 3D animation renders significantly larger, sharper, and fills the visual space between the left and right cards.
  - Recalibrate the centerpiece `pt-` spacing (e.g. `pt-44 sm:pt-52 lg:pt-60`) to position the _Cold-Storage Security_ card directly beneath the larger 3D shield without overlap.
- Ensure the header badge contains `ABOUT WAVYASSETS ` to maintain test parity.

### 4. [MODIFY] `Tests/IntegrationTest/contactIntegration.test.tsx`

- Refactor test suite 1 from testing `ContactSection` to testing `ContactModal` inline and dialog modes.
- Update suite 5 (App deck mounting) to assert `ContactModal` is mounted and `contact-section` is no longer present.

### 5. [MODIFY] `Tests/IntegrationTest/aboutAndResearchIntegration.test.tsx`

- Verify assertion strings match the exact headers and badges.

### 6. [MODIFY] `.ai/progress-tracker.md`

- Document the removal of `ContactSection`, the compacting of infographic spacing, the enlargement of the 3D scene, and test suite results.

---

## Acceptance Criteria

- [ ] `ContactSection.tsx` is removed and not rendered in `App.tsx`.
- [ ] `ContactModal.tsx` remains untouched and functional via header and hash routing.
- [ ] Dead empty space between narrative text and infographic cards is eliminated.
- [ ] 4-column layout and bottom pill remain arranged exactly as originally specified.
- [ ] 3D WebGL animation (Shield, Padlock, Wave, Globe, Splines) is visibly larger and more prominent.
- [ ] `npm test` passes 100% across all 17 test suites (89/89 tests passing).
- [ ] `npm run lint` and `tsc -b` pass with zero errors.
