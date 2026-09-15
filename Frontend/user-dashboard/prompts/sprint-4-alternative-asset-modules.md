# Implementation Plan: Sprint 4 — Alternative Asset Modules (AI Funds, Real Estate & Cars)

**Sprint:** Sprint 4  
**Epic:** Alternative Asset Verticals — AI Systematic & Quantitative Funds, Tokenized Prime Real Estate, Exotic Vehicles & Horology Vault  
**Target Platform:** WavyAssets Sovereign Institutional User Dashboard (`Frontend/user-dashboard`)  
**Reference Files:**
- `tools/IMPLEMENTATION_STRATEGY.md` (Sections 5.3, 5.4, 5.5, 7, 8, 9)
- `tools/GOOGLE_STITCH_UI_UX_PROMPT_STRATEGY.md` (Module 03: AI Funds, Module 04: Real Estate, Module 05: Exotic Cars)
- `tools/UI/# sovereign_asset_terminal/DESIGN.md` (Design tokens, micro-chamfer 4px geometry, typography)
- `tools/UI/#4 wavyassets_ai_systematic_quantitative_funds/code.html` (Sharpe/Sortino gauges, 3-stage calibrator, kill switch, rationale ledger, GPU cluster)
- `tools/UI/#5 wavyassets_tokenized_real_estate_infrastructure/code.html` (SPV asset deck, distribution tracker, occupancy SLA, secondary OTC bulletin)
- `tools/UI/#6 wavyassets_exotic_vehicles_horology_vault/code.html` (Hagerty valuation, vault telemetry, drive-day calendar, condition scores)

---

## 1. Objectives

1. **AI Systematic & Quantitative Funds (`AiFundsModule.tsx`)**:
   - **5-KPI Executive Matrix**: Capital Deployed ($1,450,000.00 / 9.8% NAV / 100% USDC Collateral / 14 Perp + 2 Basis), Net Strategy APY (18.40% / +$732.14/day / +$266,800.00 USD annualized / geometric sparkline), Sharpe Ratio (2.84 / T-Bill Rf 4.85% / Calmar 4.38), Sortino Ratio (3.12 / Downside Std Dev 2.14%), Max Historical Drawdown (-4.20% / Peak Aug 5, 2024 / 9-day recovery / VaR 99% Passed at 1.27%).
   - **3-Stage Dynamic Risk Calibrator**:
     - Stage 1: `Capital Preservation` (Tier 1 Low, Lev: 1.0x, Delta-neutral basis capture, Target 8.0% - 12.0% APY)
     - Stage 2: `Balanced Trend` (Tier 2 Selected ACTIVE, Lev: 1.45x, Statistical momentum, Vol band 6.8%, 14.0% - 20.0% APY)
     - Stage 3: `High-Volatility Alpha` (Tier 3 Dynamic, Lev: 2.5x, Cross-venue liquidations, Flash TWAP, 22.0% - 30.0% APY)
   - **Fiduciary Emergency Circuit Breaker (Kill Switch)**:
     - Armed status banner (`ARMED • T+0`), `< 4ms latency` FIX protocol route halt, instant derivative flatten to USDC, confirmation modal trigger.
   - **Execution Rationale & Rebalance Ledger**:
     - Filter chips (`All Events (42)`, `Delta Hedging`, `Stat Arb`, `Funding Capture`), cryptographic root proof badge (`0x9b4fa7c822e11d09e3e21ba99` Zurich Alpha enclave), live rebalance items.
   - **Statistical Cointegration Spread & Portfolio Exposures**:
     - Visual spread monitor with Z-score (+1.42σ vs ±2.00σ threshold), delta indicators (+0.04 BTC delta, Gross Notional $2,102,500.00, Net Exposure $142,000.00, Daily Funding Delta +$480.00/day).
   - **Tokenized GPU Compute Cluster Asset**:
     - 160x NVIDIA H100 SXM5 80GB (Facility #02 CH, Valais Hydro Grid), 94.2% utilization telemetry, $18.42/hr rate, $13,262.40/mo cash flow, active tenant (Llama-3 70B LoRA tuning), pending yield claim trigger ($1,842.10 USDC).

2. **Tokenized Prime Real Estate & Infrastructure (`RealEstateModule.tsx`)**:
   - **4-Card Executive Performance Matrix**: Total Property Equity ($2,850,000.00 / 19.2% NAV / +$270,000.00 unrealized uplift / sparkline / $2.58M basis), Net Rental Yield ($17,100.00/mo / $205,200.00/yr annualized), Average Net Cap Rate (7.20% / +305 bps spread / WALT 6.2 yrs), Portfolio Occupancy (98.4% / 100% Institutional / 0.00% Triple-Net NNN arrears).
   - **Institutional Asset Inventory Deck**:
     - 4 Enclave holdings: One Zurich Financial Center (CHF 1.2M), London Mayfair Prime (GBP 750k), Geneva Lakeside Villa (CHF 550k), Frankfurt Data Hub (EUR 350k).
     - Region filtering (`ALL REGIONS`, `SWITZERLAND`, `UNITED KINGDOM`, `GERMANY`).
     - Cadastre Swiss Land Registry badge, SPV contract data, RICS Red Book appraisals.
   - **Monthly Rental Distribution Tracker**:
     - Historical & current distribution blotter with projected vs actual cleared amounts, variance delta, and EVM settlement hash.
   - **Tenant Credit Health & Occupancy Matrix**:
     - Credit gauge (AAA/AA Sovereign 84%, A/BBB+ 16%), lease expiration schedule (WALT 6.2 years), custody architecture (Treuhand Zürich AG, CH-GEN-VAULT-04).
   - **Secondary OTC Liquidity Bulletin**:
     - Order book for fractional property tokens with tabs (`All Orders`, `Bids`, `Offers`), buyer/seller enclave IDs, discounts/premiums to NAV, and instant "EXECUTE BUY" / "FILL BID" modal hooks.

3. **Exotic Vehicles & Horology Vault (`CarsModule.tsx`)**:
   - **4-Metric Physical Asset Matrix**: Vaulted Valuation ($850,000.00 / 5.7% NAV / +$106,000.00 gain / +14.24%), 1-Year Index Growth (+14.2% vs Hagerty Blue Chip), Active Insured Limit ($1,200,000.00 agreed value under Lloyd's Specie Syndicate 2003), Physical Vault Telemetry (Geneva #4B Auto: 19.5°C / 48% RH; Zurich #02 Watch: 20.0°C / 45% N₂ inert).
   - **Curated Tangible Asset Inventory**:
     - Asset 1: 1997 Porsche 911 GT2 (993) Clubsport ($580,000.00 FMV / Acquisition $495,000.00 / VIN WP0ZZZ99ZTS390412 / Odometer 14,820 km / Hagerty 5-Yr +61.1% sparkline / Geneva Freeport Vault #4B / Sole Title).
     - Asset 2: Patek Philippe Grand Complications 5270P Perpetual Calendar Chronograph ($270,000.00 FMV / Acquisition $235,000.00 / Serial 5892104 / Factory blister unworn / Phillips auction index AAA sparkline / Zurich Old Town Class IX safe / Sole Title).
   - **Fleet Monetization Yield & Drive-Day Engine**:
     - Revenue readout strip: Quarterly rental clearance (+$8,500.00 net / $34,000.00 proj. annual yield), active filming placement (Sovereign luxury film campaign Geneva, 3 static filming days).
     - Member Drive-Day Interactive Calendar: Location selector (Monaco GP Circuit, Zurich Alps Gotthard Pass, Circuit Paul Ricard), April 2025 interactive calendar grid with available member slots, booked concours, maintenance days, and concierge reservation action.
   - **Custody, Underwriting & Provenance Ledger**:
     - Condition inspection scores (Porsche 99.4/100 Concours Gold, Patek 100/100 Factory Blister).
     - Lloyd's policy breakdown, archival extracts & certificate downloads, vault transfer triggers.

4. **Dynamic Workspace Integration in `App.tsx`**:
   - Sub-50ms tab switching when selecting `ai-funds`, `real-estate`, or `cars` from the sidebar navigation rail or command bar.
   - Maintains zero Cumulative Layout Shift (`CLS < 0.01`) and full privacy mask integration (`maskBalances`).

5. **Automated Verification**:
   - Add >= 25 unit and integration tests covering risk calibrator math, circuit breaker arming, real estate distributions, OTC order execution, Hagerty index valuation, and drive day bookings.
   - Total test suite target: >= 106 passing tests.
   - Strict TypeScript check (`tsc -b`) passing with 0 errors.

---

## 2. Component & Architecture Layout

```
Frontend/user-dashboard/
├── src/
│   ├── components/
│   │   ├── modules/
│   │   │   ├── ai-funds/
│   │   │   │   ├── AiFundsModule.tsx        # Master AI funds terminal view
│   │   │   │   ├── RiskCalibrator.tsx       # 3-stage risk posture & leverage calibrator
│   │   │   │   ├── CircuitBreakerPanel.tsx  # Fiduciary kill switch & freeze controls
│   │   │   │   ├── RationaleLedger.tsx      # Audit-grade execution rationale feed
│   │   │   │   ├── GpuComputeWidget.tsx     # 160x H100 cluster yield & utilization
│   │   │   │   └── CointegrationSpread.tsx  # Z-score statistical arb spread monitor
│   │   │   ├── real-estate/
│   │   │   │   ├── RealEstateModule.tsx     # Master tokenized real estate view
│   │   │   │   ├── PropertyDeck.tsx         # SPV property cards with valuation curves
│   │   │   │   ├── RentalDistributionBlotter.tsx # Projected vs actual rent tracker
│   │   │   │   ├── TenantCreditMatrix.tsx   # Credit distribution, WALT & custody
│   │   │   │   └── SecondaryOtcBulletin.tsx # P2P liquidity order book for SPV tokens
│   │   │   └── cars/
│   │   │       ├── CarsModule.tsx           # Master exotic vehicles & horology view
│   │   │       ├── AssetInventoryDeck.tsx   # Porsche 993 GT2 & Patek 5270P cards
│   │   │       ├── DriveBookingEngine.tsx   # Interactive April 2025 calendar & fleet yield
│   │   │       └── CustodyLedger.tsx        # Lloyd's insurance & condition scores
│   ├── lib/
│   │   └── alternativeAssetData.ts          # Telemetry, SPVs, vehicles, timepieces & orders
│   ├── store/
│   │   └── useAlternativeStore.ts           # Risk posture, circuit breaker, OTC orders, bookings
│   └── App.tsx                              # Dynamic module routing switch
├── Tests/
│   ├── UnitTest/
│   │   ├── aiFundsModule.test.ts            # Risk calibrator, Sharpe gauges & GPU yield tests
│   │   ├── realEstateModule.test.ts         # Rental distributions, Cap rates & OTC orders
│   │   └── carsModule.test.ts               # Hagerty index, vault telemetry & drive bookings
│   └── IntegrationTest/
│       └── alternativeModules.test.tsx      # Module rendering, tab switching, and interactions
```

---

## 3. Acceptance Criteria & SLAs

- [ ] Sub-50ms tab transition when navigating to `/ai-funds`, `/real-estate`, and `/cars`.
- [ ] Full visual parity with `tools/UI/` prototypes #4, #5, and #6.
- [ ] Zero CLS (Cumulative Layout Shift) with pre-dimensioned containers.
- [ ] Full reactivity to global `maskBalances` privacy mode.
- [ ] Minimum 25 new automated unit and integration tests passing (Total >= 106 tests).
- [ ] Strict TypeScript check (`tsc -b`) passing with 0 errors.
