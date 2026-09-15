# Implementation Plan: Sprint 2 — Global Command Bar & 3D Allocation Engine

**Sprint:** Sprint 2  
**Epic:** Global Financial Command Bar, 3D Sovereign Allocation Engine & Institutional Modal Rail  
**Target Platform:** WavyAssets Sovereign Institutional User Dashboard (`Frontend/user-dashboard`)  
**Reference Files:**
- `tools/IMPLEMENTATION_STRATEGY.md` (Sections 4, 7, 8, 9)
- `tools/GOOGLE_STITCH_UI_UX_PROMPT_STRATEGY.md` (Module 00: Global Master Command Shell)
- `tools/UI/# sovereign_asset_terminal/DESIGN.md` (Color tokens, micro-chamfer 4px geometry, typography)
- `tools/UI/#1 wavyassets_sovereign_terminal_executive_overview/code.html` (Command Bar layout, allocation breakdown, figures)
- `tools/UI/#11 wavyassets_sovereign_modal_overlays_rapid_execution_suite/code.html` (Deposit, Withdraw, Trade, Timelock dialogs)

---

## 1. Objectives

1. **Install Three.js & Engine Dependencies**:
   - Install `three` and `@types/three` for deterministic WebGL 3D allocation rendering.
2. **Portfolio State Management (`usePortfolioStore.ts`)**:
   - Implement `usePortfolioStore` managing consolidated net worth ($14,820,450.00 default), 7-vertical asset allocations (Crypto, Equities, Real Estate, AI Funds, Gold Vault, Exotic Cars, Liquid Cash), target vs actual weighting, and P&L timeframe metrics (`1D`, `1W`, `1M`, `1Y`, `ALL`).
3. **Consolidated Net Worth & P&L Engine**:
   - Format tabular figures with emerald `#53DC98` for gains and ruby `#FFB4AB` for drawdowns.
   - Dynamic timeframe switcher (`1D | 1W | 1M | 1Y | ALL`).
   - One-click privacy masking (`maskBalances`) displaying `••••••••` across all balance DOM elements.
4. **3D Radial Allocation Donut (`AllocationDonut3D.tsx`)**:
   - Interactive Three.js WebGL donut chart with 7 vertical segments, golden rim accents, and smooth rotation.
   - Raycasting for hover detection with segment tooltip showing asset class, percentage, and value.
   - Deterministic WebGL lifecycle: explicit `.dispose()` of geometries, materials, and renderer on component unmount.
   - Frame throttling when `document.hidden` is true.
   - Graceful fallback for headless/jsdom testing environments.
5. **Universal Command Bar (`GlobalCommandBar.tsx`)**:
   - Fixed high-density bar pinned directly beneath the top header across all views:
     - Cell 1: Consolidated Net Worth + Dynamic Timeframe P&L chips.
     - Cell 2: 3D Allocation Donut preview & 7-vertical micro bar indicator.
     - Cell 3: Privacy eyeball toggle ("Hide Balances" / "Show Balances").
     - Cell 4: Action Rail buttons (`Deposit`, `Withdraw`, `Trade / Swap`, `KYC Level 3`).
6. **Institutional Modals & Dialogs**:
   - `DepositModal`: Bank Wire (SIC/Fedwire IBAN, SWIFT, memo reference), on-chain Crypto deposit, and VIP Card rail.
   - `WithdrawModal`: Outbound transfer with 24-48h whitelist lock status and FIDO2/WebAuthn trigger.
   - `TradeModal`: Sovereign OTC Swap Engine (pair selection, limit/market, slippage, sub-50ms execution).
   - `KycDrawer`: Accreditation badge, Tier 3 limits ($Unlimited), FINMA/VARA status, document checklist.
7. **Automated Verification**:
   - Add >= 25 unit and integration tests covering calculations, store transitions, command bar rendering, privacy toggle, and modal trigger flows (target: >= 55 total passing tests).
   - Strict TypeScript check (`tsc -b`) passing with 0 errors.

---

## 2. Component & Architecture Layout

```
Frontend/user-dashboard/
├── src/
│   ├── components/
│   │   ├── command-bar/
│   │   │   ├── GlobalCommandBar.tsx     # Persistent master command bar
│   │   │   ├── NetWorthWidget.tsx       # Net worth figure + P&L engine + timeframe selector
│   │   │   ├── AllocationPreview.tsx    # 3D Donut embed & 7-vertical distribution ribbon
│   │   │   ├── PrivacyToggle.tsx        # Eyeball toggle for DOM balance masking
│   │   │   └── ActionRail.tsx           # Deposit, Withdraw, Trade, KYC trigger buttons
│   │   ├── 3d/
│   │   │   └── AllocationDonut3D.tsx    # Three.js WebGL 3D donut with .dispose() cleanup
│   │   └── modals/
│   │       ├── DepositModal.tsx         # Multi-rail inbound treasury dialog
│   │       ├── WithdrawModal.tsx        # Outbound withdrawal with 24-48h whitelist status
│   │       ├── TradeModal.tsx           # Sovereign OTC Swap & execution dialog
│   │       └── KycDrawer.tsx            # Tier 3 accreditation & compliance status modal
│   ├── lib/
│   │   └── calculations.ts              # Portfolio math, P&L timeframes, allocation ratios
│   ├── store/
│   │   └── usePortfolioStore.ts         # Portfolio state, positions, 7 verticals, timeframes
│   └── App.tsx                          # App shell updated with persistent GlobalCommandBar & modals
├── Tests/
│   ├── UnitTest/
│   │   ├── portfolioStore.test.ts       # Portfolio store transitions & calculation tests
│   │   └── calculations.test.ts         # P&L deltas, allocation percentages, privacy masking
│   └── IntegrationTest/
│       ├── commandBar.test.tsx          # Command bar rendering, timeframe switches, privacy toggle
│       └── modalOverlays.test.tsx       # Deposit, Withdraw, Trade, KYC modal opening & interaction
```

---

## 3. Acceptance Criteria & SLAs

- [x] Consolidated Net Worth displays `$14,820,450.00` with instant reactivity.
- [x] Timeframe switcher (`1D | 1W | 1M | 1Y | ALL`) updates delta metrics and indicators.
- [x] Privacy toggle instantly masks and unmasks all monetary numbers (`••••••••`).
- [x] Three.js canvas implements deterministic `.dispose()` and throttles on `document.hidden`.
- [x] All 4 Action Rail modals open with proper Radix UI accessibility, focus trap, and escape key handling.
- [x] Zero CLS (Cumulative Layout Shift) with pre-dimensioned containers.
- [x] Minimum 25 new automated tests passing (total suite >= 55 tests).
- [x] Strict TypeScript check passing with 0 errors.
