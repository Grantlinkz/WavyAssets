# Sprint 5 Implementation Prompt: Dynamic Asset Sub-Views, Hash-Routing Engine & Unified Auth Modal

## Unit Overview
- **Sprint**: Sprint 5 / Milestone Phase 5
- **Unit**: Standardized `AssetContainer` (CLS = 0, min-height 540px), Client-Side `#/services/:assetId` Hash-Routing Engine, 7 Modular Asset Verticals Sub-Views, and Root-Mounted `UnifiedAuthModal` with 2FA Input-OTP
- **Source of Truth & Reference**:
  - `tools/UI/5a aura_assets_dynamic_asset_sub_views_terminal/code.html`
  - `tools/UI/5b aura_assets_crypto_investment_terminal_algorithmic_yield_flow_variant/code.html`
  - `tools/UI/5c aura_assets_global_stocks_pre_ipo_sub_view_terminal/code.html`
  - `tools/UI/5d aura_assets_ai_systematic_funds_sub_view_terminal/code.html`
  - `tools/UI/5e aura_assets_real_estate_asset_sub_view_terminal/code.html`
  - `tools/UI/5f aura_assets_vip_concierge_cards_asset_sub_view_terminal/code.html`
  - `tools/Implementation Strategy And Timeline.pdf` (Pages 1–5: Standardized Panels, Dynamic Routing, Unified 2FA Modal)
- **Target Files**:
  - `src/components/panels/AssetContainer.tsx` [NEW]
  - `src/components/panels/AssetNavRail.tsx` [NEW]
  - `src/components/panels/views/CryptoPanel.tsx` [NEW]
  - `src/components/panels/views/StocksPanel.tsx` [NEW]
  - `src/components/panels/views/AiFundsPanel.tsx` [NEW]
  - `src/components/panels/views/RealEstatePanel.tsx` [NEW]
  - `src/components/panels/views/CarsPanel.tsx` [NEW]
  - `src/components/panels/views/VipCardsPanel.tsx` [NEW]
  - `src/components/panels/views/WalletPanel.tsx` [NEW]
  - `src/components/auth/UnifiedAuthModal.tsx` [NEW]
  - `src/store/useTerminalStore.ts` [MODIFY]
  - `src/App.tsx` [MODIFY]
  - `.ai/progress-tracker.md` [MODIFY]
  - `Tests/UnitTest/hashRouter.test.ts` [NEW]
  - `Tests/IntegrationTest/assetPanelsAndAuthIntegration.test.tsx` [NEW]

---

## 1. Architectural & Engineering Specifications

### A. Zero Cumulative Layout Shift (CLS = 0) Standard
- Standardized `AssetContainer` with locked `min-height: 540px`.
- High-performance exit/enter transitions using Framer Motion (`opacity` and lateral `x` translation).
- Animated pre-dimensioned skeleton shimmer during asynchronous view swaps.

### B. Client-Side Hash Router (`#/services/:assetId`)
- Native browser URL synchronization with hash changes (`#/services/crypto`, `#/services/stocks`, `#/services/ai-funds`, `#/services/real-estate`, `#/services/cars`, `#/services/vip-cards`, `#/services/wallet`).
- Bidirectional sync: deep linking on page load, browser back/forward buttons, and mega-menu/navigation clicks.
- Sub-50ms swap latency benchmark with view-switch telemetry logging.
- Fallback route: default any unrecognized hash parameter to `'crypto'`.

### C. 7 Modular Sub-View Terminals (Prototypes 5a through 5f)
1. **Crypto Yield & Custody (`crypto`)**: Algorithmic yield flows, staking matrix, LST vault deposits, and real-time APY streams.
2. **Global Stocks & Pre-IPO (`stocks`)**: Direct Market Access (DMA) equities, private equity secondary shares, dark pool execution.
3. **AI Systematic Funds (`ai-funds`)**: GPU H100 lease arbitrage, high-frequency quantitative alpha models, real-time compute telemetry.
4. **Fractional Real Estate (`real-estate`)**: Tokenized Swiss and London commercial trophy assets, title deed SPVs, net rental yields.
5. **Exotic Vehicles & Horology (`cars`)**: Freeport bonded vaults (Zurich/Geneva), Classiche-250 index, climate telemetry (19°C/48% RH), acquisition slots.
6. **VIP Concierge & Metal Cards (`vip-cards`)**: Pure titanium sovereign credit lines, cross-collateralized by reserve deposits, 0% FX spread.
7. **Sovereign Custody & Wallet (`wallet`)**: Multi-sig MPC quorum controls, FIPS 140-3 Level 4 HSM clusters, sub-minute Merkle proofs.

### D. Unified 2FA Auth Modal (`UnifiedAuthModal.tsx`)
- Radix Dialog primitive integration with accessible modal portal, focus trapping, and ESC dismissal (<200ms SLA).
- Step 1: Tabbed Credentials (`Sign In` vs. `Institutional Onboarding`), corporate allocator email, allocation tier selection, password field.
- Step 2: Auto-advancing 6-digit segmented Input-OTP verification using `input-otp` primitive with auto-focus and resend timer.
- Redacted audit logging (PII privacy invariant from `GEMINI.md`).

---

## 2. Planned Changes & Implementation Steps

### Step 1: Hash Router & Store Synchronization (`src/store/useTerminalStore.ts`)
- Add hash listener helper that initializes and listens to `window.location.hash`.
- Add telemetry tracking for view switches (capturing `viewDuration` and `swapLatency`).

### Step 2: Standardized AssetContainer & NavRail (`AssetContainer.tsx`, `AssetNavRail.tsx`)
- Implement locked container with `min-height: 540px` and skeleton shimmer state.
- Implement horizontal 7-vertical navigation tab rail with numbered index badges (`01` through `07`) and active gold indicator.

### Step 3: 7 Dedicated Asset Sub-View Panels (`src/components/panels/views/`)
- Build high-density institutional panels for each vertical matching `tools/UI/5*` prototypes.
- Include live telemetry sparklines, institutional data matrices, and action triggers ("Request Allocation", "Inspect Audit").

### Step 4: Root-Mounted Unified Auth Modal (`src/components/auth/UnifiedAuthModal.tsx`)
- Build 2-step modal with credentials and segmented 6-digit Input-OTP.
- Connect to `openAuthModal` / `closeAuthModal` in terminal store.
- Wire into header login triggers, simulator CTA, and asset panels.

### Step 5: Master Layout Integration (`src/App.tsx`)
- Integrate `AssetContainer` in place of or paired with the discovery hub.
- Mount `UnifiedAuthModal` at the root layout.

### Step 6: Testing & Pre-Commit Verification
- Unit test suite: `Tests/UnitTest/hashRouter.test.ts` verifying hash parsing, fallbacks, and telemetry.
- Integration test suite: `Tests/IntegrationTest/assetPanelsAndAuthIntegration.test.tsx` verifying panel switching, zero CLS bounds, deep-linking, and auth modal OTP flow.
- Pre-commit checks: `tsc -b`, `npm test` (100% pass rate).
- Minimum 2 Git commits with conventional commit prefixes.
- Update `.ai/progress-tracker.md`.

---

## 3. Acceptance Criteria
- [ ] Hash-routing correctly parses `#/services/:assetId` and synchronizes with browser history without page reloads.
- [ ] Invalid hashes default safely to `'crypto'`.
- [ ] All 7 asset panels render dedicated institutional data matrices, metrics, and action triggers.
- [ ] `AssetContainer` enforces `min-height: 540px` with zero Cumulative Layout Shift (CLS = 0).
- [ ] `UnifiedAuthModal` opens from header and panel CTAs, supports Step 1 credentials and Step 2 6-digit Input-OTP.
- [ ] Tabular figures render strictly with `Inter` and `tabular-nums`; headlines and labels render in `Noto Serif`.
- [ ] 100% test pass rate in Vitest, zero TypeScript errors (`tsc -b`).
- [ ] At least two git commits using conventional commit patterns.
