# Implementation Prompt: Separate and Connect 3D Infographic Animation

## Task Overview

Per user directive and reference screenshots:
1. **Separate the Two 3D Animation Parts**:
   - **Part 1 (Far Left)**: Place the wireframe Globe with its dual orbital rings and floating asset tokens (`leftGlobeGroup`) on the **far left** (positioned at `x = -4.8`).
   - **Part 2 (Close to Far Right)**: Place the 3D Shield with the Cyan Ocean Wave and Golden Padlock (`centerGroup`) **close to the far right** (positioned at `x = 3.8`).
   - Create wide, uncluttered space between the two 3D components in the central visual area.

2. **Connect the Two Parts**:
   - Build a glowing, high-tech connection bridge (luminous cyan & sovereign gold energy conduit) bridging directly from the Globe on the far left across the central expanse into the Shield on the far right.
   - Animate continuous photon energy pulses streaming from the Multi-Asset Globe into the Cold-Storage Vault Shield.

3. **DOM Card Layout & Camera Calibration**:
   - Calibrate camera distance (`z = 9.6`) so both the far-left Globe and far-right Shield are fully visible within the canvas viewport with zero edge clipping.
   - Ensure the overlay DOM cards ("Pioneering Multi-Asset Freedom", "Cold-Storage Security", "Target Client Segments", "Eliminates The Chaos") have unobstructed text visibility.

4. **Testing & Verification**:
   - Run `npm test` verifying 100% pass rate across all 17 test suites (89/89 passing).
   - Verify `tsc -b` and `npm run lint`.
   - Update `.ai/progress-tracker.md`.

---

## Planned Code Changes

### [MODIFY] `src/components/about/UnifiedFinanceInfographic3D.tsx`
- Set `leftGlobeGroup` position to `(-4.8, 0.2, 0)` on the far left.
- Set `centerGroup` (Shield + Wave + Padlock) position to `(3.8, 0.25, 0)` close to the far right.
- Add `connectingBridgeCurve` (CatmullRomCurve3) bridging from `(-3.5, 0.2, 0)` through `(0.1, 0.45, 0.2)` to `(2.5, 0.25, 0)` with a glowing tube mesh.
- Add animated photon pulses traversing the connecting bridge.
- Update camera position to `(0, 0.2, 9.6)` for balanced horizontal coverage across both sides.
- Recalibrate overlay card padding to maintain alignment.

---

## Acceptance Criteria
- [ ] Globe is positioned on the far left of the 3D canvas.
- [ ] Shield and Padlock are positioned close to the far right.
- [ ] Open space exists between the two 3D parts.
- [ ] A luminous connection spline visibly connects the Globe to the Shield with flowing energy photons.
- [ ] All 17 automated test suites pass (89/89 tests).
