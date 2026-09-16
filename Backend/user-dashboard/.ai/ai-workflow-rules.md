# AI Workflow Rules — WavyAssets Sovereign Backend User Dashboard

## Development Approach: 6-Sprint Architecture-Driven Execution

All implementation work follows the structured 6-sprint roadmap defined in `tools/IMPLEMENTATION_STRATEGY.md`. Implementation proceeds strictly against the relational schemas, API contracts, and security invariants documented in the blueprint.

```
[Sprint 1: Core Foundation, Prisma Schema & Auth Handoff Engine]
  ├── NestJS 11 scaffold, tsconfig, Dockerfile, and Vitest setup
  ├── Complete Prisma Schema (7 verticals, double-entry ledger, 48h time-lock)
  ├── AuthService & ticket exchange controller (POST /api/v1/auth/exchange-ticket)
  ├── GlobalExceptionFilter & RedactedLoggingInterceptor
  └── Automated test suite: 15 passing tests (ticket crypto, auth guard, exceptions)

[Sprint 2: Universal Command Bar Aggregator & Real-Time WebSocket Gateway]
  ├── DashboardModule: consolidated net worth calculation across 7 asset classes
  ├── Dynamic 1D, 1W, 1M, 1Y, ALL returns engine
  ├── Socket.IO Gateway (/ws/portfolio) with authenticated room broadcasting
  ├── Global Action Rail check endpoints (KYC tier limits, deposit/withdraw status)
  └── Automated test suite: 20 passing tests (aggregation math, WebSocket rooms)

[Sprint 3: Liquid Asset Engines (Crypto, Stocks & Double-Entry Wallet)]
  ├── CryptoModule: live holdings, custody segregation, DCA scheduler, staking compounding
  ├── StocksModule: DMA order book, order state machine (MARKET/LIMIT), DRIP manager
  ├── WalletModule: Double-Entry Ledger (Available vs Invested split, cash sweep pot)
  ├── Fiat & Crypto On/Off-Ramp state machine (Initiated -> Pending -> Settled)
  └── Automated test suite: 35 passing tests (ledger balance equation, order matching)

[Sprint 4: Alternative Asset Engines (AI Funds, Real Estate & Exotic Cars)]
  ├── AiFundsModule: quant telemetry, risk tier selector, rationale feed, circuit breaker
  ├── RealEstateModule: property deck, rental yield distributions, P2P secondary OTC board
  ├── CarsModule: Hagerty valuation comp tracker, bonded vault logistics, drive booking calendar
  ├── Pre-signed URL secure document vault for deeds, affidavits, and vehicle provenance
  └── Automated test suite: 30 passing tests (OTC order execution, drive slot concurrency)

[Sprint 5: VIP Cards, Compliance Dossiers & 48-Hour Security Time-Lock]
  ├── VipCardsModule: card freeze controls, WebAuthn-guarded 60s CVV/PIN reveal
  ├── ComplianceModule: Tiered KYC progression, file upload virus scan, Form 8949 tax generator
  ├── SecurityModule: Remote session termination, WebAuthn FIDO2 registration & challenge validation
  ├── Inviolable 48-Hour Whitelist Time-Lock state machine with hardware key counter
  └── Automated test suite: 25 passing tests (time-lock rejection, WebAuthn, CVV encryption)

[Sprint 6: End-to-End Monorepo Integration, Hardening & Enterprise Deployment]
  ├── Wire Frontend/user-dashboard API clients to Backend/user-dashboard endpoints
  ├── Configure Docker Compose networking and container health checks
  ├── Automated load testing simulating 1,000 concurrent institutional sessions
  ├── Static security analysis (npm audit, OWASP top 10 compliance, sanitization review)
  └── Automated test suite: Full suite (>125 passing unit and integration tests)
```

---

## Human-in-the-Loop Protocol

1. **Plan / Prompt First**: Before writing any implementation code, create a dedicated prompt file in `prompts/<sprint-name>-<unit-name>.md` detailing:
   - Target Sprint & Epic from `tools/IMPLEMENTATION_STRATEGY.md`
   - Prisma models and schema migrations impacted
   - DTOs, controllers, services, guards, and interceptors to create or modify
   - Error handling strategy (code-based exceptions and global filter mapping)
   - Non-negotiable technical requirements (e.g., ledger zero-sum conservation, 48h quarantine enforcement)
   - Acceptance criteria and automated test verification plan
2. **Approval Gateway**: Request user review:
   > _"I prepared the implementation plan at `prompts/<file-name>.md`. Is this good to execute?"_
3. **Strict Execution**: Implement only after receiving explicit user approval.
4. **Demonstrate & Verify**: Provide clear automated test results, TypeScript typecheck confirmation, and manual verification steps after every step.
5. **Update Documentation**: Synchronize `.ai/progress-tracker.md` immediately upon completing any sprint task.

---

## Non-Negotiable Invariants

1. **Adherence to `tools/IMPLEMENTATION_STRATEGY.md`**: Never invent arbitrary endpoints, schema fields, or workflows outside of what is documented in `tools/`.
2. **Ledger Zero-Sum Conservation**: For every transaction, $\sum \text{Debits} + \sum \text{Credits} = 0$. No user balance may ever be adjusted without a corresponding balanced ledger entry.
3. **48-Hour Quarantine Enforcement**: No withdrawal to an address with `status === 'QUARANTINE'` or `NOW() < quarantineUntil` shall ever be permitted by the query engine.
4. **Comprehensive Error Handling**:
   - Every service and controller must throw semantic NestJS HTTP exceptions (`BadRequestException`, `NotFoundException`, `ForbiddenException`, etc.) or custom domain exceptions.
   - `GlobalExceptionFilter` must intercept all uncaught exceptions, sanitize payloads, and return a standardized custom unified JSON response envelope without leaking stack traces or database schema details.
5. **Redacted Logging**: All emitted logs must redact PII, authorization tokens, secrets, passphrases, and private credentials.
6. **Continuous Testing**: Unit and Integration tests must be created and updated in `Tests/UnitTest/<test-name>` and `Tests/IntegrationTest/<test-name>`.
7. **Zero Plaintext Sensitive Storage**: Passphrases (Argon2id), session tokens (HMAC-SHA256), PII/Card Data (AES-256-GCM).

---

## Git Commit Standards

- **Git Commit Frequency**: Commit code as you build. Every working session or phase must contain **at least two git commits**.
- **Conventional Commit Patterns**: All git commit messages must strictly adhere to the following prefixes:
  - `feat:` for new features (e.g. `feat: implement double-entry ledger journal balance check`)
  - `fix:` for bug fixes (e.g. `fix: resolve 48-hour quarantine datetime comparison bug`)
  - `refactor:` for code refactoring (e.g. `refactor: clean up command-bar aggregation pipeline`)
  - `docs:` for documentation updates (e.g. `docs: update progress-tracker and architecture context`)
  - `tests:` for test additions and modifications (e.g. `tests: add Vitest suite for time-lock rejection`)
  - `chore:` for maintenance tasks and environment setup (e.g. `chore: configure Prisma schema and seed data`)

---

## Protected Files & Directories

- `tools/**`: Blueprint source-of-truth. Read-only reference material. Never delete or alter files in `tools/`.
- `prisma/migrations/**`: Version-controlled schema history. Never manually alter applied migration SQL files.

---

## Pre-Commit Verification Checklist

Before marking any task complete or committing changes:

1. **TypeScript Typecheck**: Run `npx tsc --noEmit` with zero errors.
2. **Linter**: Run `npm run lint` and verify zero ESLint errors or warnings.
3. **Automated Tests**: Execute `npm run test` (Vitest) ensuring all tests in `Tests/UnitTest/` and `Tests/IntegrationTest/` pass.
4. **Error Handling & Logging**: Verify that all new pathways have comprehensive error handling and secure, redacted logging.
5. **Database Transaction Check**: Verify that all balance mutations execute within `prisma.$transaction`.
6. **Progress Tracker**: Update `.ai/progress-tracker.md` with completed items and current state.
