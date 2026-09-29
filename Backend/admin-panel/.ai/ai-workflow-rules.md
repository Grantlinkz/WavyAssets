# AI Workflow Rules & Sprint Execution — WavyAssets Backend Admin Panel

**Subsystem**: `Backend/admin-panel`  
**Mandatory Git Branch**: `backend-admin-panel`  

---

## 1. Scope Definition

### In scope
- **Administrative RBAC & Auth**: Argon2id, TOTP 2FA, JWT access/refresh lifecycle, `RolesGuard`.
- **Executive Overview & Telemetry Metrics Aggregation (`/api/v1/admin/overview`)**: Total vault balance aggregation across 7 asset verticals ($142.8M+), liquid settlement capital ($28.4M+), action queue triage counters (unverified wires, KYC dossiers, withdrawals $> \$100\text{k}$), 24h net settlement, and real-time settlement ledger stream.
- **Mandate Pipeline & Lead Conversion (`/api/v1/admin/inquiries`)**: Decrypting AES-256-GCM `LeadInquiry` data, domain trust scoring, workflow transitions (`NEW`, `IN_REVIEW`, `MANDATE_ISSUED`, `ARCHIVED`), notes, and 1-click lead-to-user conversion.
- **User Governance**: Directory management, aggregated balances (`AVAILABLE_CASH`, `INVESTED_CAPITAL`), kill-switch suspension, cascading deletion, direct capital funding with atomic double-entry bookkeeping.
- **KYC & Compliance**: FINMA AMLA tier elevation queue, document inspection, 1-click approvals.
- **Treasury Clearances**: Inbound deposit matching with 1-click balance credit, outbound withdrawals with FINMA AMLA Article 14 dual-sign-off engine.
- **Deposit Rails**: Fiat bank wire (Swiss IBAN, BIC/SWIFT) and crypto MPC vault configuration with real-time WebSocket sync.
- **Obsidian VIP Cards**: Metal card minting engine, spend limit governance, 1-click freeze/unfreeze real-time toggle.
- **Emergency Platform Freeze & Kill-Switch Engine (`/api/v1/admin/emergency`)**: Dual-key platform lockdown, system-wide mutation suspension middleware, mandatory written reason audit logging, and `platform:emergency_freeze` broadcast.
- **Audit Logging**: Differential immutable state logging in `AdminAuditLog` (before/after JSON diffs).

### Out of scope
- Automated straight-through processing (STP) for withdrawals $> \$100,000$ USD (prohibited by FINMA AMLA Article 14).
- Plaintext storage of PINs, CVVs, or passwords (prohibited by PCI-DSS Level 1).
- Public retail marketing / unauthenticated registration.
- Static mock data or fallback arrays.

---

## 2. Input Sanitization & Injection Defense

- **DTO Validation**: Enforce class-validator rules with `whitelist: true, forbidNonWhitelisted: true`.
- **SQL / NoSQL Injection Defense**: Strict usage of Prisma parameterized queries; zero raw unescaped SQL.
- **XSS & Content Sanitization**: Sanitize all text fields (admin notes, justifications, memo references).
- **Path Traversal Defense**: Validate file retrieval UUIDs strictly; forbid relative path traversal tokens.
- **Financial Precision Clamping**: Parse all financial amounts into Prisma `Decimal` with positive boundary checks.

---

## 3. Non-Negotiable Invariants

1. **Mandatory Branch Commitment**: Always commit on `backend-admin-panel`.
2. **FINMA AMLA Article 14 Dual Sign-Off**: Withdrawals $> \$100,000$ strictly require two distinct officer approvals.
3. **Atomic Double-Entry Conservation**: $\sum \text{Debits} + \sum \text{Credits} = 0$ for all ledger adjustments.
4. **Emergency Platform Freeze & Kill-Switch**: The emergency freeze mechanism halts all mutating transactions immediately, requiring Super Admin dual-key confirmation.
5. **Zero Plaintext Secrets**: Argon2id for passphrases, AES-256-GCM for card PINs, ephemeral CVVs.
6. **Strict DTO Validation**: Global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`.
7. **Zero PII Logging**: Redact auth tokens, passphrases, emails, and account numbers.
8. **Sub-50ms SLA**: Low-latency queries and mutations.

---

## 4. 4-Sprint Implementation Roadmap

- **Sprint 1: Foundations, Database Extensions & Mandate Intake**
  - Augment schema with `AdminUser`, `AdminAuditLog`, `FiatDepositRailConfig`, `CryptoDepositRailConfig`, and `TreasurySignOff`.
  - Implement `AdminAuthModule` with Argon2id, TOTP, and `RolesGuard`.
  - Implement `InquiriesModule` with AES-256-GCM lead decryption and workflow stage transitions.

- **Sprint 2: User Lifecycle & KYC Compliance Engine**
  - Implement `UsersModule` directory with aggregated `LedgerAccount` balances.
  - Implement user creation, instant kill-switch suspension, and cascading deletion.
  - Implement `fund-balance` endpoint with atomic double-entry bookkeeping.
  - Implement `ComplianceModule` queue, signed document access URLs, and tier upgrade engine.

- **Sprint 3: Treasury Operations & Global Deposit Rails**
  - Implement pending deposits queue and 1-click **Approve & Credit Balance** engine.
  - Implement pending withdrawals queue and FINMA AMLA Article 14 dual-sign-off engine.
  - Implement `DepositRailsModule` for fiat wire and crypto MPC vault configuration.
  - Implement WebSocket/SSE broadcast gateway for real-time synchronization with client apps.

- **Sprint 4: VIP Cards, Audit Trail & Hardening**
  - Implement `VipCardsModule` minting engine, spend limit controls, and 1-click lock/unlock protocols.
  - Implement `AuditModule` with structured JSON diff logging and regulatory queries.
  - Implement comprehensive Vitest test suites (Unit tests in `Tests/UnitTest/` and Integration tests in `Tests/IntegrationTest/`).
  - Final security audit: verify Zero PII logging, ensure `ProductionSandboxGuard` compliance, and validate sub-50ms API latency benchmarks.

---

## 5. Execution, Progress & Reporting Protocol

- **Prompt Protocol**: Draft `prompts/<sprint>-<unit>.md` and obtain user approval before executing code.
- **Git Commit Standards**: Commit on `backend-admin-panel` with conventional commit prefixes (`feat:`, `fix:`, `refactor:`, `docs:`, `tests:`, `chore:`). Minimum 2 commits per unit.
- **Update Progress & Docs**:
  - Update `.ai/progress-tracker.md` after every phase or step.
  - Synchronize context files in `.ai/` and OpenAPI annotations at `/api/docs`.
- **Deliver Report**: After completing any sprint, unit, or operational task, deliver a comprehensive structured report to the user summarizing:
  - Architectural components built and modified.
  - Verification output (typecheck, lint, automated test results).
  - Live API contracts and security validations.
  - Next milestone recommendations.
