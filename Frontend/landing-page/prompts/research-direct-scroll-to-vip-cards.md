# Implementation Prompt: Research Direct Scroll Navigation to VIP Cards Panel

## Task Overview

When users navigate to `/research`, `/#research`, or click "Research" in the `GlobalHeader`, the terminal must take them directly to the **VIP Cards** asset panel in the **Asset Terminal** section (matching the provided screenshot), rather than only updating the URL string.

## Planned Changes

### 1. [MODIFY] `src/App.tsx`
- Add `scroll-mt-20` to the `#asset-terminal` section container so scrolling accounts for the fixed 64px global header and keeps the `AssetNavRail` tabs visible.
- Enhance the `useEffect` handling `/research` and `#research` to actively scroll the window to `#asset-terminal` via `scrollIntoView({ behavior: 'smooth', block: 'start' })`.

### 2. [MODIFY] `src/components/nav/GlobalHeader.tsx`
- In both desktop navigation and mobile drawer navigation, enhance the click event for the "Research" link (`/research#/services/vip-cards`):
  - Prevent default link jump.
  - Set `activeAssetId('vip-cards')`.
  - Update `window.location.hash = '#/services/vip-cards'`.
  - Smoothly scroll `#asset-terminal` into view.

### 3. [MODIFY] `src/store/useTerminalStore.ts`
- In `syncFromHash()`, when `isResearch` is detected, trigger smooth scroll to `#asset-terminal` if running in the browser.

### 4. [MODIFY] `Tests/IntegrationTest/aboutAndResearchIntegration.test.tsx`
- Verify that GlobalHeader Research link continues to point to `/research#/services/vip-cards` and resolves to `vip-cards` with `#asset-terminal` mounting.

### 5. [MODIFY] `.ai/progress-tracker.md`
- Document direct visual scroll navigation to VIP Cards for `/research` and `#research`.

---

## Acceptance Criteria
- [ ] Clicking "Research" in `GlobalHeader` scrolls directly to the VIP Cards panel in the Asset Terminal.
- [ ] Visiting `/research` or `/#research` directly scrolls the viewport down to the Asset Terminal displaying the VIP Cards panel.
- [ ] `AssetNavRail` with "VIP CARDS" active tab is fully visible beneath the fixed header without clipping (`scroll-mt-20`).
- [ ] 100% of automated tests pass across all 17 test suites (`npm test`).
