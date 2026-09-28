#### Implementation Plan: Sprint 3 — Treasury Operations Hub & Global Deposit Rails

**Sprint:** Sprint 3  
**Epic:** Sovereign Treasury Operations (Inbound Wire Matching & FINMA AMLA Art. 14 Dual-Sign-Off Withdrawals) & Global Deposit Rails Command (Fiat Wire Clearing & Crypto MPC Matrix)  
**Target Platform:** WavyAssets Sovereign Institutional Admin Command Deck (`Frontend/admin-panel`)  
**Mandatory Branch:** `frontend-admin-panel`  
**Reference Files:**
- `GEMINI.md` (System Governance, Invariants, Zero Mock Data, Pre-Commit Verification)
- `.ai/agent.md` & `.ai/architecture.md` (React 19 + TypeScript + Vite, Zustand 5, TanStack Query v5)
- `.ai/code-standards.md` (Micro-chamfer 4px geometry, Obsidian Dark tokens, Tabular lining figures, Zero CLS)
- `.ai/ui-context.md` (Live API contracts, Zero mock data, Rigid skeleton loaders)
- `.ai/progress-tracker.md` (Sprint 3 deliverables)
- `tools/UI/wavyassets_admin_panel_treasury_settlements/` (UI screen prototype & layout)
- `tools/UI/wavyassets_admin_panel_global_deposit_coordinates/` (UI screen prototype & layout)
- `Backend/admin-panel/tools/IMPLEMENTATION_STRATEGY.md` (Treasury & Rails API contracts)

---

## 1. Objectives

1. **Treasury Operations Hub (`/treasury`)**:
   - Real-time settlement ticker (SIC RTGS: 11ms, Fedwire: Online, ERC-20 Gas: 14 Gwei).
   - High-density Outgoing Withdrawals Table with dual-approval status (1/2 Signed vs Awaiting Officer #2).
   - FINMA AMLA Article 14 Dual-Control Enforcement Panel / Modal for withdrawals > $100,000 USD:
     - Authorized account holder CIF & requested sum ($1,500,000.00 USD).
     - Whitelisted destination verification chip.
     - Co-signer status matrix (Officer 1: Signed with YubiKey FIPS Token, Officer 2: Active operator session awaiting co-sign).
     - 3 mandatory compliance attestation checkboxes.
     - Hardware FIPS security key / 6-digit token passcode input.
     - "Reject & Refund" and "Confirm & Release Funds" dual action buttons.
   - High-density Incoming Deposits Table:
     - Wire and crypto inflows awaiting manual receipt confirmation.
     - Proof-of-payment receipt viewer modal (`DepositReceiptViewerModal`).
     - 1-click "Approve & Credit" action dispatching atomic balance crediting.
   - Filter & segment tabs: Outgoing Withdrawals, Incoming Deposits, Split Console View.
   - Settlement rail filter: All Rails, SIC, Fedwire, USDC.
   - Real-time treasury ledger metrics (SIC Interbank, Federal Reserve Fedwire, Target2, Multisig Cold Vault).
   - Rigid table skeleton loaders (`min-height: 540px`, zero CLS).

2. **Global Deposit Rails Command (`/deposit-rails`)**:
   - Real-time cluster diagnostic strip (Broadcaster Bridge, WebSocket Sync Latency 14ms, HSM FIPS 140-2 Level 3).
   - Test Client Connection & Flush Invalidation Cache action controls.
   - Institutional Fiat Wire Coordinates Form:
     - Beneficiary Name, Depository Bank Name & Branch, Clearing System & Settlement Mode.
     - Swiss IBAN input with copy button and Mod 97 checksum indicator.
     - BIC / SWIFT code and Clearing System dropdown.
     - Mandatory Reference Memo format input with variable tags (`WY-{USER_REF}-TREASURY-03`).
     - Strict Zod schema validation.
     - "Save & Broadcast Bank Coordinates" mutation button.
   - Cryptographic Cold Storage Vault Matrix:
     - High-density table: Asset (USDC, USDT, BTC, ETH), Blockchain Network, Deposit Address (truncated with copy & QR triggers), Minimum Deposit, Required Confirmations, Rail Status toggle, Audit HSM button.
     - Interactive QR Code inspection modal (`DepositQrModal`).
     - Rigid table skeleton loaders (`min-height: 540px`, zero CLS).

3. **State Management & Live API Interoperability**:
   - `src/api/treasury.ts`: Live REST client hooks for `/treasury/pending-deposits`, `/treasury/deposits/:id/approve`, `/treasury/deposits/:id/reject`, `/treasury/pending-withdrawals`, `/treasury/withdrawals/:id/sign-off`, `/treasury/withdrawals/:id/reject-and-refund`.
   - `src/api/depositRails.ts`: Live REST client hooks for `/deposit-rails`, `/deposit-rails/fiat`, `/deposit-rails/crypto`.
   - `src/store/useTreasuryStore.ts`: Filter states, active tab, selected withdrawal for sign-off, selected deposit for receipt inspection.
   - `src/store/useDepositRailsStore.ts`: Form states, QR modal state, test connection status.
   - Real-time WebSocket invalidation listeners for `treasury:deposit_pending`, `treasury:withdrawal_pending`, `deposit_rails:updated`.

4. **Automated Verification**:
   - Unit tests for `treasuryStore` and `depositRailsStore`.
   - Integration tests for `TreasuryView` (withdrawals, dual sign-off, deposits table, receipt viewer).
   - Integration tests for `DepositRailsView` (fiat form validation, crypto matrix, QR modal).
   - Type safety (`npx tsc --noEmit`) and full test suite passing (`npm test`).

---

## 2. Directory Layout & Components

```
Frontend/admin-panel/
├── src/
│   ├── api/
│   │   ├── treasury.ts                 # Treasury deposits & withdrawals API
│   │   └── depositRails.ts             # Global deposit rails configuration API
│   ├── components/
│   │   ├── treasury/
│   │   │   ├── PendingWithdrawalsTable.tsx # High-density withdrawals awaiting co-signature
│   │   │   ├── DualSignOffCard.tsx         # FINMA AMLA Art. 14 dual-control inspector
│   │   │   ├── PendingDepositsTable.tsx    # High-density inbound deposits with 1-click credit
│   │   │   └── DepositReceiptViewerModal.tsx # Proof-of-payment inspection modal
│   │   └── deposit-rails/
│   │       ├── FiatRailForm.tsx            # Swiss IBAN, BIC/SWIFT & Memo format form
│   │       ├── CryptoVaultMatrix.tsx       # Cold storage addresses & confirmation requirements
│   │       └── DepositQrModal.tsx          # QR Code display modal for vault addresses
│   ├── store/
│   │   ├── useTreasuryStore.ts         # Treasury filters, tabs, active sign-off & receipt
│   │   └── useDepositRailsStore.ts     # Rail form drafts, QR modal & telemetry state
│   ├── views/
│   │   ├── TreasuryView.tsx            # Complete Treasury Operations Hub
│   │   └── DepositRailsView.tsx        # Complete Global Deposit Coordinates Deck
│   └── App.tsx                         # Connect /treasury and /deposit-rails views
└── Tests/
    ├── UnitTest/
    │   ├── treasuryStore.test.ts       # Treasury store tab & selection logic
    │   └── depositRailsStore.test.ts   # Deposit rail store & QR modal logic
    └── IntegrationTest/
        ├── treasuryView.test.tsx       # Treasury hub rendering, sign-off card & deposit actions
        └── depositRailsView.test.tsx   # Deposit rails form, crypto matrix & live broadcast
```

---

## 3. Acceptance Criteria & Invariants

- [X] **Mandatory Branch**: All development committed strictly to `frontend-admin-panel`.
- [X] **Zero Static Data**: Direct TanStack Query integration with live backend endpoints (`http://localhost:4002/api/v1`).
- [X] **Zero CLS**: Rigid `.wavy-skeleton` table loaders (`min-height: 540px`) during async hydration.
- [X] **FINMA AMLA Art. 14 Compliance**: Mandatory two-officer co-signature for withdrawals > $100,000 USD with 3-point attestation checklist and security token input.
- [X] **1-Click Deposit Settlement**: Direct balance credit mutation with wire receipt inspection.
- [X] **Dynamic Rail Configuration**: Live editable Swiss IBAN with Mod 97 validation, BIC/SWIFT, Clearing rail, Memo template, and multi-chain crypto vault matrix.
- [X] **RBAC Enforcement**: Actions restricted to `TREASURY_OFFICER` and `SUPER_ADMIN`.
- [X] **Design Tokens**: Micro-chamfer 4px (`rounded-[4px]`), Obsidian Dark palette, tabular lining figures (`font-mono tabular-nums`).
- [X] **Automated Testing**: Comprehensive unit and integration test coverage across all new components.
- [X] **Type Safety**: `npx tsc --noEmit` passes with 0 errors.
