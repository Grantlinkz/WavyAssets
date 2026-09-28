# Implementation Plan — Sprint 3: Treasury Operations & Global Deposit Rails

**Subsystem:** `Backend/admin-panel`  
**Internal Port:** `4002`  
**Mandatory Git Branch:** `backend-admin-panel`  
**Reference Strategy:** [`tools/IMPLEMENTATION_STRATEGY.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/admin-panel/tools/IMPLEMENTATION_STRATEGY.md)  
**UI Contracts Reference:** [`Frontend/admin-panel/tools/UI/wavyassets_admin_panel_treasury_settlements/`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/wavyassets_admin_panel_treasury_settlements/) & [`Frontend/admin-panel/tools/UI/wavyassets_admin_panel_global_deposit_coordinates/`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/wavyassets_admin_panel_global_deposit_coordinates/)

---

## 1. Objectives & Scope for Sprint 3

Sprint 3 implements the sovereign financial settlement engine, multi-rail liquidity governance, and real-time operational event distribution for WavyAssets:
1. **Treasury Operations Hub (`TreasuryModule`)**:
   - Inbound Pending Deposits Queue (`GET /api/v1/admin/treasury/pending-deposits`):
     - Displays incoming bank wires (Swiss SIC, Fedwire) and crypto deposits (USDC, USDT, BTC, ETH) with declared amounts, reference memos, and counterparty metadata.
   - 1-Click Deposit Clearance Engine (`POST /api/v1/admin/treasury/deposits/:transactionId/approve`):
     - Validates transaction state `PENDING`.
     - Atomically transitions `LedgerTransaction.status = "SETTLED"`.
     - Credits the user's `AVAILABLE_CASH` `LedgerAccount` in the specified currency.
     - Books balanced `LedgerEntry` debits and credits ($\sum \text{Debits} + \sum \text{Credits} = 0$).
     - Dispatches real-time settlement notification across WebSocket channels.
   - Deposit Rejection Engine (`POST /api/v1/admin/treasury/deposits/:transactionId/reject`):
     - Rejects unverified deposits, records mandatory operator rejection justification, and marks transaction as `FAILED`.
   - Outbound Pending Withdrawals Queue (`GET /api/v1/admin/treasury/pending-withdrawals`):
     - Displays pending withdrawals, destination rails (Swiss IBAN, BIC/SWIFT, Crypto vault addresses), beneficiary names, and officer sign-off status.
   - FINMA AMLA Article 14 Dual Sign-Off Engine (`POST /api/v1/admin/treasury/withdrawals/:transactionId/sign-off`):
     - Non-negotiable regulatory invariant: Withdrawals $\le \$100,000$ USD settle upon a single authorized officer sign-off (`TREASURY_OFFICER` or `SUPER_ADMIN`).
     - Withdrawals $> \$100,000$ USD strictly require **two distinct authorized officer sign-offs** in `TreasurySignOff`.
     - First sign-off transitions transaction status to `PENDING_SECOND_SIGN_OFF`.
     - Second distinct officer sign-off transitions status to `SETTLED`.
     - Prevents duplicate sign-offs by the same officer (`ERR_DUPLICATE_SIGNOFF`).
   - Withdrawal Rejection & Capital Refund Engine (`POST /api/v1/admin/treasury/withdrawals/:transactionId/reject-and-refund`):
     - Marks transaction as `FAILED`, records audit reason, and atomically refunds reserved cash back to the user's `AVAILABLE_CASH` ledger account.
2. **Global Deposit Rail Configuration (`DepositRailsModule`)**:
   - Active Rails Catalog (`GET /api/v1/admin/deposit-rails` & public endpoint `GET /api/v1/public/deposit-rails`):
     - Serves dynamic fiat rail parameters (beneficiary, Swiss IBAN, BIC/SWIFT, clearing rail, memo format) and multi-network crypto MPC vault coordinates.
   - Fiat Rail Mutation (`PUT /api/v1/admin/deposit-rails/fiat`):
     - Updates `FiatDepositRailConfig` with operator attribution, validates IBAN/SWIFT formatting, and broadcasts `deposit_rail:updated`.
   - Crypto Rail Mutation (`PUT /api/v1/admin/deposit-rails/crypto`):
     - Upserts `CryptoDepositRailConfig` asset/network vault addresses, minimum deposit amounts, confirmation thresholds, and active status.
3. **Real-Time WebSocket Gateway (`EventsModule` & `/ws/admin`)**:
   - NestJS WebSocket Gateway on `/ws/admin` supporting dual protocols (Socket.IO events and standard WebSocket JSON messages).
   - Real-time broadcasts:
     - `SETTLEMENT_UPDATE`: Invalidation trigger for frontend queries (`settlement-ledger`, `overview-metrics`).
     - `treasury:deposit_pending` & `treasury:withdrawal_pending`: Operational queue alert counters.
     - `deposit_rail:updated`: Dynamic live sync to client deposit modals.
     - `overview:metrics_tick`: Real-time telemetry heartbeat.
4. **Automated Testing & Invariant Verification**:
   - Unit tests covering 1-click deposit clearance, FINMA AMLA dual sign-off thresholds, duplicate sign-off defense, and capital refund logic.
   - Integration tests covering all treasury and deposit rail endpoints, authorization guards, and standardized response envelopes.

---

## 2. Detailed Technical Breakdown

### Unit 3.1: `EventsModule` & WebSocket Gateway
- **Path**: `src/modules/events/`
  - `events.gateway.ts`:
    - `@WebSocketGateway({ namespace: '/ws/admin', cors: { origin: '*' } })`
    - In-memory client connection tracking with ping/pong latency measurement.
    - Methods:
      - `emitSettlementUpdate(payload)`
      - `emitDepositPending(payload)`
      - `emitWithdrawalPending(payload)`
      - `emitDepositRailUpdated(payload)`
      - `emitInquiryReceived(payload)`
      - `emitMetricsTick()`
  - `events.module.ts`:
    - Global module exporting `EventsGateway` for dependency injection across controllers and services.

### Unit 3.2: `TreasuryModule` DTOs, Service & Controller
- **Path**: `src/modules/treasury/`
  - `dto/approve-deposit.dto.ts`:
    - `notes`?: string (Optional operator verification notes)
  - `dto/reject-deposit.dto.ts`:
    - `reason`: string (MinLength: 5, mandatory rejection justification)
  - `dto/sign-off-withdrawal.dto.ts`:
    - `action`: string (IsEnum: `APPROVE`, `REJECT`)
    - `notes`?: string
  - `dto/reject-withdrawal.dto.ts`:
    - `reason`: string (MinLength: 5, mandatory refund justification)
  - `dto/treasury-query.dto.ts`:
    - `page`?: number
    - `limit`?: number
    - `rail`?: string
    - `search`?: string
  - `treasury.service.ts`:
    - `getPendingDeposits(query)`: Lists pending deposits with user profile, receipt, rail, and memo.
    - `approveDeposit(txId, adminId, dto)`:
      - Inside `prisma.$transaction`:
        - Verifies `LedgerTransaction` exists, `type === 'DEPOSIT'`, `status === 'PENDING'`.
        - Fetches or creates recipient user's `AVAILABLE_CASH` `LedgerAccount` in transaction currency.
        - Creates positive `LedgerEntry` (credit) for user account.
        - Updates `LedgerAccount.balance += amount`.
        - Sets `LedgerTransaction.status = 'SETTLED'`.
        - Records `AdminAuditLog` diff (`DEPOSIT_APPROVE`).
      - Emits `SETTLEMENT_UPDATE` via `EventsGateway`.
    - `rejectDeposit(txId, adminId, dto)`:
      - Inside `prisma.$transaction`:
        - Sets `LedgerTransaction.status = 'FAILED'`, records audit log (`DEPOSIT_REJECT`).
      - Emits `SETTLEMENT_UPDATE`.
    - `getPendingWithdrawals(query)`:
      - Lists pending withdrawals with current sign-off count, required sign-offs (1 or 2), and officer sign-off history.
    - `signOffWithdrawal(txId, adminId, dto)`:
      - Non-negotiable FINMA AMLA Article 14 enforcement:
        - If `amount <= 100,000`:
          - Creates `TreasurySignOff`.
          - Updates `LedgerTransaction.status = 'SETTLED'`.
        - If `amount > 100,000`:
          - Checks existing sign-offs for `txId`.
          - If current officer already signed: throws `ConflictException` (`ERR_DUPLICATE_SIGNOFF`).
          - Creates `TreasurySignOff`.
          - If this is first sign-off: sets `status = 'PENDING_SECOND_SIGN_OFF'`.
          - If this is second distinct sign-off: sets `status = 'SETTLED'`.
      - Emits `SETTLEMENT_UPDATE`.
    - `rejectAndRefundWithdrawal(txId, adminId, dto)`:
      - Inside `prisma.$transaction`:
        - Sets `LedgerTransaction.status = 'FAILED'`.
        - Finds debit entry or credits user's `AVAILABLE_CASH` ledger balance with the withdrawal amount.
        - Records audit diff (`WITHDRAWAL_REJECT_REFUND`).
      - Emits `SETTLEMENT_UPDATE`.
  - `treasury.controller.ts`:
    - `GET /api/v1/admin/treasury/pending-deposits` & `GET /api/v1/treasury/pending-deposits`
    - `POST /api/v1/admin/treasury/deposits/:id/approve` & `POST /api/v1/treasury/deposits/:id/approve`
    - `POST /api/v1/admin/treasury/deposits/:id/reject` & `POST /api/v1/treasury/deposits/:id/reject`
    - `GET /api/v1/admin/treasury/pending-withdrawals` & `GET /api/v1/treasury/pending-withdrawals`
    - `POST /api/v1/admin/treasury/withdrawals/:id/sign-off` & `POST /api/v1/treasury/withdrawals/:id/sign-off`
    - `POST /api/v1/admin/treasury/withdrawals/:id/reject-and-refund` & `POST /api/v1/treasury/withdrawals/:id/reject-and-refund`
  - `treasury.module.ts`: Wires controller, service, Prisma, and Events module.

### Unit 3.3: `DepositRailsModule` DTOs, Service & Controller
- **Path**: `src/modules/deposit-rails/`
  - `dto/update-fiat-rail.dto.ts`:
    - `beneficiaryName`: string
    - `swissIban`: string
    - `bicSwift`: string
    - `clearingRail`: string
    - `memoFormat`: string
  - `dto/update-crypto-rail.dto.ts`:
    - `asset`: string (USDC | USDT | BTC | ETH)
    - `network`: string (ERC-20 | BEP-20 | Polygon | TRC-20 | Bitcoin Native | Arbitrum | Optimism)
    - `vaultAddress`: string
    - `minDepositUsd`: number (Positive)
    - `confirmations`: number (Integer >= 1)
    - `isActive`: boolean
  - `deposit-rails.service.ts`:
    - `getAllRails()`: Returns fiat configuration and all crypto rails grouped by asset.
    - `updateFiatRail(dto, adminId)`: Upserts `FiatDepositRailConfig`, records `AdminAuditLog` (`DEPOSIT_RAIL_FIAT_UPDATE`), emits `deposit_rail:updated`.
    - `upsertCryptoRail(dto, adminId)`: Upserts `CryptoDepositRailConfig`, records `AdminAuditLog` (`DEPOSIT_RAIL_CRYPTO_UPDATE`), emits `deposit_rail:updated`.
    - `getPublicRails()`: High-performance cached query returning active rails for client deposit modals.
  - `deposit-rails.controller.ts`:
    - `GET /api/v1/admin/deposit-rails` & `GET /api/v1/deposit-rails`
    - `PUT /api/v1/admin/deposit-rails/fiat` & `PUT /api/v1/deposit-rails/fiat`
    - `PUT /api/v1/admin/deposit-rails/crypto` & `PUT /api/v1/deposit-rails/crypto`
    - `GET /api/v1/public/deposit-rails` (public rate-limited endpoint)
  - `deposit-rails.module.ts`: Wires controller, service, Prisma, and Events module.

### Unit 3.4: Root Wiring, Database Seed Expansion & Automated Tests
- Register `EventsModule`, `TreasuryModule`, and `DepositRailsModule` in `src/app.module.ts`.
- Expand `prisma/seed.ts` with:
  - Default `FiatDepositRailConfig` and multi-network `CryptoDepositRailConfig` records (USDC on ERC-20 & Polygon, BTC on Bitcoin Native, ETH on ERC-20).
  - Realistic pending inbound wires and crypto receipts in `LedgerTransaction` (status `PENDING`).
  - Realistic pending outbound withdrawals in `LedgerTransaction`:
    - Small withdrawal ($\le \$100,000$) ready for single sign-off.
    - Institutional withdrawal ($> \$100,000$, e.g. $\$500,000$) ready for FINMA dual sign-off.
- Unit Test Suites in `Tests/UnitTest/`:
  - `treasury.service.test.ts`:
    - Deposit approval & double-entry balance crediting.
    - Deposit rejection with failed status.
    - FINMA AMLA single sign-off for $\le \$100,000$.
    - FINMA AMLA dual sign-off progression for $> \$100,000$ (`PENDING_SECOND_SIGN_OFF` -> `SETTLED`).
    - Duplicate sign-off prevention by same officer.
    - Withdrawal rejection and atomic capital refund.
  - `deposit-rails.service.test.ts`:
    - Fiat rail parameters update and validation.
    - Crypto rail multi-network upsertion.
  - `events.gateway.test.ts`:
    - WebSocket connection handling and event emission.
- Integration Test Suite in `Tests/IntegrationTest/`:
  - `treasury-and-deposit-rails.test.ts`:
    - Full end-to-end integration test of all Sprint 3 endpoints with auth tokens and role verification.

---

## 3. Pre-Execution Verification Plan

1. Verify working branch is `backend-admin-panel`.
2. Execute implementation units 3.1 through 3.4.
3. Run TypeScript typecheck: `npx tsc --noEmit`.
4. Run all unit tests: `npx vitest run Tests/UnitTest/`.
5. Run integration tests: `npx vitest run Tests/IntegrationTest/`.
6. Update `.ai/progress-tracker.md` to reflect Sprint 3 completion.
7. Deliver structured milestone report to user.
