# Implementation Plan: Sprint 3 — Liquid Asset Modules (Crypto, Stocks & Wallet)

**Sprint:** Sprint 3  
**Epic:** Liquid Asset Verticals — Crypto Investment, Global Stocks DMA & Sovereign Multi-Currency Wallet  
**Target Platform:** WavyAssets Sovereign Institutional User Dashboard (`Frontend/user-dashboard`)  
**Reference Files:**
- `tools/IMPLEMENTATION_STRATEGY.md` (Sections 5.1, 5.2, 5.7, 7, 8, 9)
- `tools/GOOGLE_STITCH_UI_UX_PROMPT_STRATEGY.md` (Module 01: Crypto, Module 02: Global Stocks, Module 07: Sovereign Wallet)
- `tools/UI/# sovereign_asset_terminal/DESIGN.md` (Color tokens, micro-chamfer 4px geometry, typography)
- `tools/UI/#2 wavyassets_crypto_investment_sovereign_staking/code.html` (Crypto Holdings, Custody Badges, DCA, Staking gauges)
- `tools/UI/#3 wavyassets_global_stocks_pre_ipo_allocations/code.html` (Level-2 Order Book, Position Analytics, Pre-Market, DRIP)
- `tools/UI/#8 wavyassets_wallet_sovereign_finance_command_center/code.html` (Available vs Invested Split, 5.2% Sweep Pot, Stepper, Ledger)

---

## 1. Objectives

1. **Crypto Investment & Staking Terminal (`CryptoModule.tsx`)**:
   - 4-metric summary header: Crypto NAV ($5,187,157.50 / +$94,240.10 +1.85%), Total Staked ($3,200,000.00 / 61.7% bonded), Blended APY (7.42%), and Accrued Unclaimed Rewards ($18,492.30 with "Compound All" action).
   - Live Token Holdings Table: BTC, ETH, SOL, USDC, AVAX with spot prices, acquisition marks, unrealized P&L, and distinct visual badges:
     - `Sovereign Custody` (WavyAssets MPC Cold Vault)
     - `External Web3` (Connected non-custodial address)
     - `Staking Lockups` (Validators & yield-generating contracts)
   - Automated DCA Scheduler: Recurring buy frequency (`Daily | Weekly | Bi-Weekly | Monthly`), source currency, amount, and active toggle.
   - Staking Telemetry & Tax-Lot CSV Export: Live countdown, node status, and export triggers (FIFO / LIFO).

2. **Global Stocks & Pre-IPO Allocations (`StocksModule.tsx`)**:
   - 4-KPI ribbon: Equities NAV ($2,964,090.00), Day Gain (+$12,400.00 / +0.42%), Extended Trading Hours / Pre-Market Live (+0.18%), and Liquidity Vertical Split (Listed DMA 65.8% vs Sovereign OTC SPVs 34.2%).
   - Direct Market Access (DMA) Level-2 Order Book: Bids, asks, spread depth, and live quote stream across NYSE, NASDAQ, LSE, and Zurich SIX.
   - Position Analytics: Beta (0.94), 52-week range, VWAP ($112.40), dividend yield.
   - Active Limit Orders hub, stop-loss triggers, DRIP manager toggle, and pre-market/after-hours pricing toggle.

3. **Sovereign Multi-Currency Wallet & Treasury (`WalletModule.tsx`)**:
   - Dual-Split Master Ledger:
     - Card A: `Available Liquid Balance` ($1,820,450.00) split across USDC Circle ($1,115,337.50), USD Cash ($276,400.00), CHF Cash ($248,712.50), EUR Cash ($180,000.00).
     - Card B: `Invested & Encumbered Capital` ($13,000,000.00) locked in Real Estate SPVs, Staking Contracts, Cars, and AI Fund equity.
   - 5.2% Institutional Money Market Auto-Sweep Pot: active auto-sweep toggle, annual yield run rate, and sweep threshold.
   - Fiat On/Off-Ramp Stepper: Bank Wire (SIC/Fedwire/SWIFT) with dynamic state stepper (`Initiated` -> `Pending` -> `Cleared`).
   - Unified filterable transaction history table with statement download (PDF/CSV).

4. **Dynamic Workspace Integration in `App.tsx`**:
   - Sub-50ms tab switching when selecting `crypto`, `stocks`, or `wallet` from the sidebar or command bar.
   - Maintains zero Cumulative Layout Shift (`CLS < 0.01`) and full privacy mask integration (`maskBalances`).

5. **Automated Verification**:
   - Add >= 25 unit and integration tests covering liquid asset tables, DCA configuration, DMA order depth, cash sweep math, and transaction filters.
   - Total test suite target: >= 84 passing tests.
   - Strict TypeScript check passing with 0 errors.

---

## 2. Component & Architecture Layout

```
Frontend/user-dashboard/
├── src/
│   ├── components/
│   │   ├── modules/
│   │   │   ├── crypto/
│   │   │   │   ├── CryptoModule.tsx         # Master crypto terminal view
│   │   │   │   ├── HoldingsTable.tsx        # Token holdings with custody badges & P&L
│   │   │   │   ├── DcaScheduler.tsx         # Recurring DCA execution scheduler
│   │   │   │   └── StakingTelemetry.tsx     # Staking APY gauges & tax-lot export
│   │   │   ├── stocks/
│   │   │   │   ├── StocksModule.tsx         # Master stocks & pre-IPO terminal view
│   │   │   │   ├── OrderBookTable.tsx       # DMA Level-2 depth with live bids & asks
│   │   │   │   ├── PositionAnalytics.tsx    # VWAP, Beta, 52-week range, DRIP toggle
│   │   │   │   └── ActiveOrdersHub.tsx      # Limit orders and execution blotter
│   │   │   └── wallet/
│   │   │       ├── WalletModule.tsx         # Master sovereign treasury view
│   │   │       ├── LedgerSplitCards.tsx     # Available Liquid vs Invested Capital
│   │   │       ├── CashSweepPot.tsx         # 5.2% institutional money market auto-sweep
│   │   │       ├── FiatRampWizard.tsx       # Fedwire/SIC/SEPA 3-step state stepper
│   │   │       └── TxHistoryTable.tsx       # Filterable ledger with PDF/CSV export
│   ├── lib/
│   │   └── liquidAssetData.ts               # Mock and institutional telemetry feeds
│   ├── store/
│   │   └── useLiquidStore.ts                # DCA state, order book state, cash sweep toggle
│   └── App.tsx                              # Dynamic module routing switch
├── Tests/
│   ├── UnitTest/
│   │   ├── cryptoModule.test.ts             # Holdings valuation & custody separation tests
│   │   ├── stocksModule.test.ts             # Level-2 order book & position analytics tests
│   │   └── walletModule.test.ts             # Available vs Invested split & cash sweep tests
│   └── IntegrationTest/
│       └── liquidModules.test.tsx           # Module rendering, tab switching, and interactions
```

---

## 3. Acceptance Criteria & SLAs

- [x] Sub-50ms tab transition when navigating to `/crypto`, `/stocks`, and `/wallet`.
- [x] Full visual parity with `tools/UI/` prototypes #2, #3, and #8.
- [x] Zero CLS (Cumulative Layout Shift) with pre-dimensioned containers.
- [x] Full reactivity to global `maskBalances` privacy mode.
- [x] Minimum 25 new automated unit and integration tests passing.
- [x] Strict TypeScript check (`tsc -b`) passing with 0 errors.
