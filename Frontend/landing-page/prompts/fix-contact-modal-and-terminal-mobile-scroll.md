# Implementation Prompt: Fix Contact Modal Mobile Top-Scroll & Asset Terminal Mobile Vertical Scroll

## Problem Statement

1. **Issue 1 (First Screenshot)**:
   - In mobile view, the **Contact Modal** does not start at the top and cannot be scrolled up to the top. The top telemetry banner, close button, and top half of the headline ("Fill out form and we contact you") are clipped above the top edge in negative scroll space.
   - **Root Cause**: `DialogContent` in `ContactModal.tsx` applied `flex items-center justify-center my-auto` on top of Radix UI's `fixed top-1/2 left-1/2 -translate-y-1/2`. In CSS Flexbox, `align-items: center` on a scrollable container (`overflow-y-auto`) centers overflowing children vertically, pushing the top part into negative scroll coordinates where `scrollTop` cannot reach.

2. **Issue 2 (Second Screenshot)**:
   - In mobile view, the **Asset Terminal** (`AssetNavRail` and panel view) does not allow vertical page scrolling when touched.
   - **Root Causes**:
     1. In `AssetNavRail.tsx`, the horizontal tabs container (`overflow-x-auto`) lacks `touch-pan-y` and `overscroll-x-contain`. On touch devices, swiping vertically on an `overflow-x` container without `touch-pan-y` causes the browser to trap the touch gesture inside the horizontal scroller, suppressing vertical page scroll.
     2. In `GlobalHeader.tsx`, when users navigate on mobile (e.g. clicking "Research" or other nav links), `closeMegaMenu()` was not invoked. If the mega menu was opened, its fixed overlay (`z-40`, `pointer-events-auto`) remained mounted across the viewport, intercepting touch events.
     3. In `VipCardsPanel.tsx` and the other 6 asset panels, the autoplaying continuous `<video>` element lacked `pointer-events-none`. When a mobile user swipes their thumb over the large video block, touch gestures are captured by the media element instead of scrolling the page.

---

## Planned Code Changes

### 1. [MODIFY] `src/components/contact/ContactModal.tsx`
- In `DialogContent`:
  - Replace `flex items-center justify-center my-auto` with `block outline-none`.
  - Add `max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto overscroll-contain`.
  - This ensures `modalBody` is in normal block flow within the scroll container: the top of the modal starts strictly at `scrollTop = 0` (showing the full headline, close button, and telemetry tag), with smooth scrolling down and up.
- In headless fallback:
  - Change `items-center` to `items-start sm:items-center` with `overflow-y-auto`.

### 2. [MODIFY] `src/components/panels/AssetNavRail.tsx`
- Add `touch-pan-y touch-pan-x overscroll-x-contain` to the horizontal tab scroller:
  `<div className="flex items-center gap-1 overflow-x-auto scrollbar-none -mb-px touch-pan-y overscroll-x-contain">`
- This ensures any vertical swipe gesture over the tab bar immediately scrolls the page vertically with zero resistance.

### 3. [MODIFY] `src/components/nav/GlobalHeader.tsx`
- In the mobile nav drawer (`mobileNavOpen`), ensure `closeMegaMenu()` is called whenever any link is clicked (e.g., "Research", "Simulator", "About", "Contact", "Welcome Back").
- This guarantees no dangling fixed overlays block mobile page interactions.

### 4. [MODIFY] `src/components/panels/views/*.tsx`
- In `VipCardsPanel.tsx`, `CryptoPanel.tsx`, `StocksPanel.tsx`, `AiFundsPanel.tsx`, `RealEstatePanel.tsx`, `CarsPanel.tsx`, and `WalletPanel.tsx`:
  - Add `pointer-events-none` to the `<video>` elements so mobile touches pass cleanly through to native page scrolling.

### 5. [TESTS & TRACKER]
- Run `npm test` verifying all 17 test suites pass (89/89 tests).
- Update `.ai/progress-tracker.md` and commit changes.

---

## Acceptance Criteria
- [ ] Contact modal in mobile view starts at the very top (`scrollTop = 0`), showing the complete headline, close button, and telemetry tag.
- [ ] Contact modal scrolls smoothly all the way down to the submit button and back to the top.
- [ ] In mobile view, vertical swipe gestures over the asset tabs rail and panel content smoothly scroll the page vertically.
- [ ] All 17 automated test suites pass (89/89 tests).
