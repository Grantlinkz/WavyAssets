# System Governance & Execution Directives — WavyAssets Sovereign Backend Admin Panel

This document (`GEMINI.md`) defines the authoritative AI agent governance, architectural invariants, code quality standards, and mandatory execution rules for the **WavyAssets Backend Admin Panel** (`Backend/admin-panel`).

All AI agents and engineers operating within this repository must strictly adhere to the guidelines set forth herein.

---

## 1. Mandatory Git Branch Isolation

> [!IMPORTANT]
> **Branch Rule**: All development, feature additions, bug fixes, refactoring, and documentation for `Backend/admin-panel` must strictly be committed on the **`backend-admin-panel`** branch.
> 
> ```bash
> # Always verify active branch before committing
> git checkout backend-admin-panel
> git status
> ```
> Never commit backend admin panel changes directly to `main` or `frontend-admin-panel`.

---

## 2. Application Building Context & Reading Sequence

Before writing any code, modifying schemas, or making architectural decisions, read the following system context files in order:

1. [`.ai/agent.md`](.ai/agent.md) (and [`.ai/agents.md`](.ai/agents.md)) — AI agent persona (Principal Administrative Systems & Quantitative Ledger Architect), approved skills (`vitest`, `prisma-database-setup`, `prisma-cli`, `prisma-client-api`), prompt-planning protocol, and execution guardrails.
2. [`.ai/project-overview.md`](.ai/project-overview.md) — Product mission, administrative operating system, 5 core operator personas, and domain scopes.
3. [`.ai/architecture.md`](.ai/architecture.md) — Modular NestJS 11 architecture, directory boundaries, Prisma relational schema extensions (`AdminUser`, `AdminAuditLog`, `DepositRailConfig`, `TreasurySignOff`), and Socket.IO real-time gateway (`/ws/admin`).
4. [`.ai/code-standards.md`](.ai/code-standards.md) — TypeScript strict standards, class-validator DTOs, double-entry `$transaction` guidelines, and testing requirements.
5. [`.ai/security.md`](.ai/security.md) — Threat model, FINMA AMLA Article 14 dual sign-off rule, zero plaintext secrets (Argon2id, AES-256-GCM), and rate limiting.
6. [`.ai/ai-workflow-rules.md`](.ai/ai-workflow-rules.md) — 4-Sprint implementation roadmap, human-in-the-loop approval protocol, and conventional commit governance.
7. [`.ai/ui-context.md`](.ai/ui-context.md) — API data contracts with `Frontend/admin-panel` (:5175), client dashboard synchronization (:5174), tools/UI screen alignment, and standardized response envelopes.
8. [`.ai/progress-tracker.md`](.ai/progress-tracker.md) — Current sprint status, task checklists, and historical execution records.

Additionally, consult the authoritative blueprints and UI data specifications:
- [`tools/IMPLEMENTATION_STRATEGY.md`](tools/IMPLEMENTATION_STRATEGY.md) — Comprehensive technical implementation blueprint and database specifications.
- [`c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/) — 12 Google Stitch UI screen blueprints defining the operational data contracts, real-time metrics, and action states required by the admin console.

---

## 3. Scope Definition

### In scope
- **Administrative Authentication & RBAC**: Admin login, Argon2id password verification, TOTP 2FA, JWT access/refresh token lifecycle, and `RolesGuard` (`SUPER_ADMIN`, `TREASURY_OFFICER`, `COMPLIANCE_OFFICER`, `CONCIERGE`, `DESK_LEAD`).
- **Executive Overview & Telemetry Metrics Aggregation (`/api/v1/admin/overview`)**: Total vault balance aggregation across 7 asset verticals ($142.8M+), liquid settlement capital ($28.4M+), action queue triage counters (unverified wires, KYC dossiers, withdrawals $> \$100\text{k}$), 24h net settlement, and real-time settlement ledger stream.
- **Institutional Mandate Ingestion & Lead Conversion (`/api/v1/admin/inquiries`)**: Ingesting landing page inquiries (`LeadInquiry`), AES-256-GCM field decryption for authorized operators, corporate domain trust scoring, workflow transitions (`NEW`, `IN_REVIEW`, `MANDATE_ISSUED`, `ARCHIVED`), operator notes, and 1-click atomic conversion into active platform users.
- **User Lifecycle & Balance Governance (`/api/v1/admin/users`)**: Directory management, segregated `LedgerAccount` balance calculation (`AVAILABLE_CASH` and `INVESTED_CAPITAL`), instant kill-switch suspension, cascading deletion, and direct capital funding with double-entry ledger bookkeeping.
- **KYC & Compliance Verification (`/api/v1/admin/compliance`)**: Queue for FINMA AMLA tier upgrades (`TIER_1` to `INSTITUTIONAL`), secure signed document inspection URLs (passports, corporate registry), and 1-click tier approvals immediately lifting platform limits.
- **Treasury Clearances & Dual Sign-Off (`/api/v1/admin/treasury`)**: Verification queue for incoming bank wires and crypto receipts with 1-click balance credit, and pending withdrawal settlements with FINMA AMLA Article 14 dual-sign-off engine.
- **Global Deposit Rail Configuration (`/api/v1/admin/deposit-rails`)**: Dynamic editable parameters for fiat bank wires (Swiss IBAN, BIC/SWIFT, Clearing rail, Memo format) and multi-network crypto MPC vault addresses with real-time WebSocket sync.
- **Obsidian VIP Card Minting & Governance (`/api/v1/admin/vip-cards`)**: Metal card minting engine, spend limit controls, and instant 1-click lock/unlock toggle syncing in real time with client viewports.
- **Emergency Platform Freeze & Kill-Switch Engine (`/api/v1/admin/emergency`)**: Super Admin dual-key authorization endpoints (`/freeze`, `/unfreeze`), system-wide transaction suspension middleware, mandatory written reason audit logging, and immediate real-time broadcast (`platform:emergency_freeze`).
- **Immutable Differential Audit Trail (`/api/v1/admin/audit`)**: Recording structured JSON before/after state diffs for all mutations in `AdminAuditLog`.

### Out of scope
- **Automated Straight-Through Processing for Large Withdrawals**: Fully automated withdrawals $> \$100,000$ USD are strictly omitted; dual human officer sign-off is mandatory per FINMA AMLA Article 14.
- **Plaintext Secret Persistence**: Storing plaintext card PINs, CVVs, user passphrases, or bearer tokens in database tables or server logs is strictly prohibited.
- **Public Retail Client Registration / Trading Execution**: Landing page marketing and retail trading execution are handled exclusively by `Backend/landing-page` and `Backend/user-dashboard`.
- **Static Mock Data**: Returning hardcoded fake responses when live database models exist.

---

## 4. Input Sanitization & Injection Defense

To defend against injection attacks, privilege escalations, and corrupted ledger records, the backend strictly enforces multi-layer input sanitization:

1. **DTO Validation & Payload Whitelisting**:
   - Every incoming HTTP payload must be bound to a strongly typed DTO class decorated with `class-validator` rules (`@IsString()`, `@IsEmail()`, `@IsNumber()`, `@IsEnum()`, `@Min()`, `@Max()`).
   - The global `ValidationPipe` enforces `whitelist: true` and `forbidNonWhitelisted: true`. Any unrecognized property in the request payload immediately terminates the request with HTTP `400 Bad Request`.
2. **SQL & NoSQL Injection Defense**:
   - All relational database interactions must execute through **Prisma ORM 6.4+ parameterized queries**.
   - Raw SQL string concatenation (`prisma.$queryRawUnsafe`) is strictly forbidden. Dynamic search and filtering parameters must use Prisma's strongly typed filter objects.
3. **Cross-Site Scripting (XSS) & Content Sanitization**:
   - All user-supplied text fields (e.g. operator notes, audit justifications, memo references, user full names) must be sanitized to strip HTML tags, script markers, and malicious control characters before persistence.
4. **Path Traversal & File Ingestion Defense**:
   - For KYC document review, all file retrieval operates on validated UUIDs and internal database keys. Dynamic client file path parameters (`../`, `..\`) are strictly rejected.
5. **Precision Clamping for Financial Inputs**:
   - Direct balance funding and withdrawal amounts must be validated as strictly positive finite numeric values, clamped to institutional limits, and parsed into exact `Decimal` types to prevent floating-point overflow or precision truncation attacks.

---

## 5. Comprehensive Two-Tier Error Handling Rules

The system enforces a mandatory two-tier error handling architecture: **Code-Based Error Handling** (within controllers, services, guards, and domain models) and **Global Error Handling** (at the application boundary via NestJS exception filters).

### Tier 1: Code-Based Error Handling
1. **Semantic NestJS HTTP Exceptions**:
   - Never throw generic `Error` instances or return `{ error: string }` literals.
   - Use semantic HTTP exceptions:
     - `BadRequestException` (400): Malformed requests, failed class-validator DTO checks.
     - `UnauthorizedException` (401): Missing/expired JWT, invalid admin credentials.
     - `ForbiddenException` (403): Role insufficient for operation, attempt to bypass dual sign-off.
     - `NotFoundException` (404): Resource not found (user, transaction, inquiry, card).
     - `ConflictException` (409): Unique constraint violation, duplicate idempotency reference ID.
     - `UnprocessableEntityException` (422): Business logic violation (e.g., balance would drop below zero, account already suspended).
2. **Domain-Specific Exception Hierarchy**:
   - Create custom domain exceptions in `src/common/exceptions/`:
     - `DualSignOffRequiredException`: Thrown when a withdrawal $> \$100\text{k}$ is executed without the requisite two distinct officer approvals. Returns HTTP 403 with `errorCode: 'ERR_DUAL_SIGNOFF_REQUIRED'`.
     - `LedgerImbalanceException`: Thrown if a proposed journal transaction violates zero-sum conservation ($\sum \text{Debits} + \sum \text{Credits} \neq 0$). Returns HTTP 422 with `errorCode: 'ERR_LEDGER_IMBALANCE'`.
     - `AccountSuspendedException`: Thrown when attempting an operation on a suspended account. Returns HTTP 403 with `errorCode: 'ERR_ACCOUNT_SUSPENDED'`.
3. **Database & Transactional Integrity**:
   - All balance mutations, deposit approvals, and withdrawal settlements must execute inside `prisma.$transaction(async (tx) => { ... })`.
   - Any unhandled error inside `$transaction` triggers an automatic rollback.
4. **Precondition & Invariant Assertions**:
   - Enforce business invariants at the entry of every service method.

### Tier 2: Global Error Handling
1. **`GlobalExceptionFilter` Implementation**:
   - Registered globally via `app.useGlobalFilters(new GlobalExceptionFilter())`.
   - Intercepts all `HttpException`, Prisma errors, and uncaught exceptions.
2. **Zero Internal Diagnostic Leakage**:
   - Never leak stack traces, database queries, file paths, or cryptographic keys to client responses.
   - All uncaught 500 errors return a sanitized message and a unique `correlationId`.
3. **Standardized Response Envelope**:
   ```json
   {
     "success": false,
     "statusCode": 403,
     "errorCode": "ERR_DUAL_SIGNOFF_REQUIRED",
     "message": "Withdrawal amount exceeds $100,000 and requires dual authorized officer sign-off.",
     "timestamp": "2026-09-25T16:00:00.000Z",
     "path": "/api/v1/admin/treasury/withdrawals/tx-9942/sign-off",
     "correlationId": "req-9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
     "details": null
   }
   ```
4. **Correlated Redacted Logging**:
   - Server-side logger records full internal diagnostics tagged with `correlationId`, stripping all PII and secrets.

---

## 6. Non-Negotiable Invariants

1. **Mandatory Branch Commitment**: Always commit on `backend-admin-panel`.
2. **FINMA AMLA Article 14 Dual Sign-Off**: Withdrawals $> \$100,000$ strictly require two distinct officer approvals before capital settlement.
3. **Atomic Double-Entry Conservation**: $\sum \text{Debits} + \sum \text{Credits} = 0$ for all ledger adjustments.
4. **Zero Plaintext Secrets**: Argon2id for passphrases, AES-256-GCM for card PINs, ephemeral CVVs.
5. **Strict DTO Validation**: Global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`.
6. **Zero PII Logging**: Redact auth tokens, passphrases, emails, and account numbers.
7. **Sub-50ms SLA**: Low-latency queries and mutations.

---

## 7. Human-in-the-Loop Protocol

- Always propose an implementation plan in `prompts/<sprint>-<unit>.md` and obtain user approval before writing code.
- Stop and prompt for review whenever encountering ambiguity, architectural pivots, or destructive database operations.
- Provide clear verification steps, automated test outputs, and proof of correctness after completing any unit of work.
- **Deliver Report**: After completing any sprint, unit, or operational task, deliver a comprehensive structured report to the user summarizing architectural components built/modified, verification output (typecheck, lint, automated tests), live API contracts, and next milestone recommendations.
- **Update Progress & Docs**:
  - Update `.ai/progress-tracker.md` after every phase or step.
  - Keep documentation in `.ai/` and OpenAPI specifications at `/api/docs` in strict lockstep with code before declaring work complete.

---

## 8. Git Commit Standards

- **Active Branch**: `backend-admin-panel`.
- **Commit Frequency**: At least two git commits per phase/unit.
- **Prefixes**: `feat:`, `fix:`, `refactor:`, `docs:`, `tests:`, `chore:`.

---

## 9. Pre-Commit Verification Checklist

1. Confirm current branch is `backend-admin-panel`.
2. Run static analysis (`npm run lint`).
3. Run TypeScript typecheck (`npx tsc --noEmit`).
4. Run all automated tests in `Tests/UnitTest/` and `Tests/IntegrationTest/`.
5. Verify standardized response envelope and zero PII logging.
6. **Update Progress & Docs**: Update `.ai/progress-tracker.md` with completed items and sync context files.
7. **Deliver Report**: Deliver a clear, concise verification summary with test outcomes to the user.
