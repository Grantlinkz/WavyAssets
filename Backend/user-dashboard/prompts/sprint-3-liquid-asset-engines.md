# Implementation Prompt — Sprint 3: Liquid Asset Engines (Crypto, Stocks & Double-Entry Wallet)

**Target Sprint:** Sprint 3  
**Architecture Reference:** [`tools/IMPLEMENTATION_STRATEGY.md`](tools/IMPLEMENTATION_STRATEGY.md) (Sections 5.1, 5.2, 5.7)  
**System Governance:** [`GEMINI.md`](GEMINI.md)  
**UI Contract Reference:** [`.ai/ui-context.md`](.ai/ui-context.md)  

---

## 1. Objectives & Deliverables

1. **Crypto Investment & Staking Engine (`src/modules/crypto/`)**:
   - `crypto.controller.ts` & `crypto.service.ts`:
     - `GET /api/v1/crypto/holdings`: Multi-custody balance segregation (`SOVEREIGN_VAULT`, `EXTERNAL_WEB3`, `STAKED`), weighted average buy price, current valuation, unrealized P&L, and 24h delta.
     - `GET /api/v1/crypto/gas-preview`: Mempool gas estimation preview for EIP-1559 base fee, priority fee, total Gwei, and USD equivalent.
     - `POST /api/v1/crypto/dca-schedules`: Recurring purchase rules with frequency (`DAILY`, `WEEKLY`, `BIWEEKLY`, `MONTHLY`).
     - `PATCH /api/v1/crypto/dca-schedules/:id/toggle`: Activates/pauses recurring DCA schedules.
     - `POST /api/v1/crypto/staking/compound`: Re-invests accrued staking rewards into staked principal.
     - `GET /api/v1/crypto/tax-lot-export`: Generates downloadable CSV formatted for FIFO/LIFO tax accounting.

2. **Global Stocks & Pre-IPO Engine (`src/modules/stocks/`)**:
   - `stocks.controller.ts` & `stocks.service.ts`:
     - `GET /api/v1/stocks/order-book?symbol=NVDA`: Level-2 order book depth (top 10 bids/asks, spread, VWAP).
     - `GET /api/v1/stocks/positions`: Active positions with cost basis, current DMA price, unrealized P&L, beta, and 52-week range.
     - `POST /api/v1/stocks/orders`: Order placement engine supporting `MARKET`, `LIMIT`, and `STOP_LOSS`. Strictly checks available buying power against the double-entry ledger before order placement; reserves funds for buy orders.
     - `DELETE /api/v1/stocks/orders/:id`: Cancels pending orders and releases reserved funds back to available balance.
     - `PATCH /api/v1/stocks/positions/:id/drip`: Toggles Dividend Re-Investment Plan (DRIP).
     - `GET /api/v1/stocks/corporate-actions`: Feed of dividend dates, stock splits, and proxy notices.

3. **Digital Custody, Sovereign Wallet & Double-Entry Ledger (`src/modules/wallet/`)**:
   - `wallet.controller.ts` & `wallet.service.ts`:
     - `GET /api/v1/wallet/balances`: Multi-currency balance breakdown strictly segregating `Available Balance` (`AVAILABLE_CASH`) from `Invested Capital` (`INVESTED_CAPITAL`).
     - **Double-Entry Ledger Core**: Executes all balance modifications within `prisma.$transaction(async (tx) => { ... })` strictly enforcing $\sum \text{Debits} + \sum \text{Credits} = 0$. Throws `LedgerImbalanceException` (HTTP 422) if unbalanced.
     - `POST /api/v1/wallet/fiat-ramp`: Multi-stage wire deposit/withdrawal state machine (`INITIATED` -> `PENDING_REVIEW` -> `SETTLED`).
       - On withdrawal, strictly verifies the target destination: throws `QuarantineTimeLockException` (HTTP 403) if `status === 'QUARANTINE'` or `NOW() < quarantineUntil`.
       - Checks liquid balance: throws `InsufficientAvailableBalanceException` (HTTP 422) if funds are insufficient.
     - `GET /api/v1/wallet/transactions`: Filterable, paginated transaction ledger with statements.
     - `POST /api/v1/wallet/cash-sweep`: Sweeps idle cash into money market yield pots.
     - `POST /api/v1/wallet/fx-convert`: Instant cross-currency spot exchange with zero-spread quote locking and balanced ledger entry.

4. **Integration with Real-Time Portfolio Gateway**:
   - Inject `PortfolioGateway` and `DashboardService` to emit `allocation:rebalanced` and invalidate cached aggregates upon trade execution or fund settlement.

5. **Automated Unit & Integration Test Suites**:
   - Unit tests covering ledger math, buying power verification, time-lock enforcement, order cancellation, and gas calculation.
   - Integration tests verifying REST endpoints across `/api/v1/crypto`, `/api/v1/stocks`, and `/api/v1/wallet`.

---

## 2. Invariants & Acceptance Criteria

- Double-entry ledger balance conservation: Zero tolerance for unbalanced entries ($\sum \text{Debits} + \sum \text{Credits} = 0$).
- 48-Hour withdrawal whitelist quarantine: Hard rejection with `QuarantineTimeLockException` (HTTP 403).
- All DTOs validated via `class-validator` with strict whitelist.
- All unit and integration tests passing (`npm test`, `npm run test:e2e`).
- TypeScript typecheck passes with 0 errors (`npx tsc --noEmit`).
- Commits formatted according to conventional commits.
