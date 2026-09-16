# System Governance & Execution Directives — WavyAssets Sovereign Backend User Dashboard

This document (`GEMINI.md`) defines the authoritative AI agent governance, architectural invariants, code quality standards, and mandatory execution rules for **WavyAssets Backend User Dashboard** (`Backend/user-dashboard`).

All AI agents and engineers operating within this repository must strictly adhere to the guidelines set forth herein.

---

## 1. Application Building Context & Reading Sequence

Before writing any code, modifying schemas, or making architectural decisions, read the following system context files in order:

1. [`.ai/agents.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/user-dashboard/.ai/agents.md) — AI agent persona (Principal Backend Systems & Quantitative Financial Engineer), approved tools, prompt-planning protocol, and execution guardrails.
2. [`.ai/project-overview.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/user-dashboard/.ai/project-overview.md) — Product mission, target capacity (10,000 active institutional accounts), 7 sovereign asset verticals, cross-domain handoff, and scope.
3. [`.ai/architecture.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/user-dashboard/.ai/architecture.md) — Modular NestJS 11 architecture, directory boundaries, Prisma relational schema, and Socket.IO real-time gateway (`/ws/portfolio`).
4. [`.ai/code-standards.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/user-dashboard/.ai/code-standards.md) — TypeScript strict standards, class-validator DTOs, Prisma `$transaction` guidelines, and testing requirements.
5. [`.ai/security.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/user-dashboard/.ai/security.md) — Threat model, zero-trust cryptographic hygiene (Argon2id, HMAC-SHA256, AES-256-GCM), 48-hour time-lock, and rate limiting.
6. [`.ai/ai-workflow-rules.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/user-dashboard/.ai/ai-workflow-rules.md) — 6-Sprint implementation roadmap, human-in-the-loop approval protocol, and conventional commit governance.
7. [`.ai/ui-context.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/user-dashboard/.ai/ui-context.md) — API data contracts, command bar aggregate response, color tokens, and RFC 7807 error envelopes.
8. [`.ai/progress-tracker.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/user-dashboard/.ai/progress-tracker.md) — Current sprint status, task checklists, and historical execution records.

Additionally, consult the foundational architectural blueprint:
- [`tools/IMPLEMENTATION_STRATEGY.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/user-dashboard/tools/IMPLEMENTATION_STRATEGY.md) — Comprehensive technical implementation blueprint and database specifications.

---

## 2. Comprehensive Two-Tier Error Handling Rules

Error handling is an inviolable architectural pillar of the WavyAssets platform. The system enforces a mandatory two-tier error handling architecture: **Code-Based Error Handling** (within controllers, services, guards, and domain models) and **Global Error Handling** (at the application boundary via NestJS exception filters).

### Tier 1: Code-Based Error Handling

Code-based error handling ensures that errors are detected, validated, and thrown as close to the failure point as possible, with explicit business context:

1. **Semantic NestJS HTTP Exceptions**:
   - Never throw generic `Error` instances or return `{ error: string }` literals.
   - Throw semantic NestJS HTTP exceptions that accurately convey the failure reason and status code:
     - `BadRequestException` (400): Malformed request bodies, failed class-validator DTO checks, out-of-range parameters.
     - `UnauthorizedException` (401): Missing/expired access JWTs, invalid handoff ticket signatures, failed password verification.
     - `ForbiddenException` (403): KYC tier insufficient for operation, attempting withdrawal to a quarantined address, accessing another user's resources.
     - `NotFoundException` (404): Resource not found (e.g. holding, order, property, car, or session).
     - `ConflictException` (409): Unique constraint violation, duplicate idempotency reference ID (`referenceId`), concurrent state modification.
     - `UnprocessableEntityException` (422): Syntactically valid request failing business rule verification (e.g. buying power exceeded, balance would become negative).
2. **Domain-Specific Exception Hierarchy**:
   - Create and throw custom domain exceptions in `src/common/exceptions/`:
     - `QuarantineTimeLockException`: Thrown when a withdrawal is attempted against a destination currently under 48-hour quarantine (`status === 'QUARANTINE'` or `NOW() < quarantineUntil`). Returns HTTP 403 with `errorCode: 'ERR_DESTINATION_QUARANTINED'` and unlock timestamp.
     - `LedgerImbalanceException`: Thrown if a proposed ledger transaction violates the zero-sum invariant ($\sum \text{Debits} + \sum \text{Credits} \neq 0$). Returns HTTP 500/422 with `errorCode: 'ERR_LEDGER_IMBALANCE'`.
     - `InsufficientAvailableBalanceException`: Thrown when an order or withdrawal exceeds `AVAILABLE_CASH`. Returns HTTP 422 with `errorCode: 'ERR_INSUFFICIENT_FUNDS'`.
     - `InvalidHandoffTicketException`: Thrown when a ticket is expired, already burned, or signature verification fails. Returns HTTP 401 with `errorCode: 'ERR_INVALID_HANDOFF_TICKET'`.
     - `CircuitBreakerTriggeredException`: Thrown when an AI systematic fund operation is attempted while the emergency circuit breaker is active. Returns HTTP 403 with `errorCode: 'ERR_CIRCUIT_BREAKER_ACTIVE'`.
3. **Database & Transactional Error Handling**:
   - All multi-record balance modifications must execute within `prisma.$transaction(async (tx) => { ... })`.
   - Catch known Prisma errors (e.g. `P2002` unique constraint, `P2025` record not found) and translate them into semantic NestJS exceptions (`ConflictException`, `NotFoundException`).
   - Never swallow database exceptions. Any unhandled error inside `$transaction` must trigger an automatic transaction rollback.
4. **Third-Party Service & Market Feed Resilience**:
   - External APIs (CoinGecko, Pyth, Hagerty index, Web3 RPCs, DHL courier API) must be wrapped in `try/catch` blocks with:
     - Configurable timeouts (max 3000ms).
     - Automatic fallback to cached prices or mock feeds if the external service fails or rate-limits.
     - Circuit breaker pattern to prevent cascading timeouts.
5. **Precondition & Invariant Assertions**:
   - Enforce business preconditions at the entry of every service method. If a precondition fails, immediately throw the corresponding domain exception before mutating any state.

### Tier 2: Global Error Handling

Global error handling guarantees that regardless of any unexpected failure, the client receives a secure, uniform response while operational telemetry captures full diagnostics:

1. **`GlobalExceptionFilter` Implementation**:
   - Register a global exception filter in `src/common/filters/global-exception.filter.ts` via `app.useGlobalFilters(new GlobalExceptionFilter())`.
   - The filter intercepts:
     - NestJS `HttpException` instances.
     - `PrismaClientKnownRequestError` and `PrismaClientValidationError`.
     - Uncaught generic `Error` instances, `TypeError`, and unhandled promise rejections.
2. **Zero Internal Diagnostic Leakage**:
   - Under **no circumstances** may a client response include:
     - Internal stack traces.
     - Database connection strings, SQL queries, table names, or column names.
     - Internal server file paths (`c:\...` or `/usr/src/...`).
     - Encryption keys, hashes, or bearer tokens.
   - For all uncaught 500 errors, the client receives a generic, professional message: `"An unexpected error occurred while processing your request. Please quote the reference ID to support."`
3. **Unified Standardized Response Envelope (RFC 7807 Compliant)**:
   - All error responses must adhere strictly to the following JSON schema:
   ```json
   {
     "success": false,
     "statusCode": 403,
     "errorCode": "ERR_DESTINATION_QUARANTINED",
     "message": "Target withdrawal address is currently quarantined under the 48-hour security time-lock.",
     "timestamp": "2026-09-16T01:30:00.000Z",
     "path": "/api/v1/wallet/withdraw",
     "correlationId": "req-9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
     "details": null
   }
   ```
4. **Correlated Server-Side Logging**:
   - Every request is tagged with a unique `correlationId` (UUID v4) generated by correlation middleware.
   - The `GlobalExceptionFilter` logs the full internal error, stack trace, and request metadata to the server-side log, tagged with the `correlationId`.
   - All PII (emails, IPs, card numbers) and secrets (passwords, tokens) are strictly redacted before logging.

---

## 3. Non-Negotiable Invariants

1. **Ledger Zero-Sum Conservation**: For every transaction, $\sum \text{Debits} + \sum \text{Credits} = 0$. No user balance may ever be adjusted without a corresponding balanced ledger entry.
2. **Inviolable 48-Hour Withdrawal Whitelist Time-Lock**: Any withdrawal request pointing to a destination with `status === 'QUARANTINE'` or `NOW() < quarantineUntil` must fail immediately with `QuarantineTimeLockException` (HTTP 403 Forbidden).
3. **Zero Plaintext Secrets**: Passphrases (Argon2id), session tokens (HMAC-SHA256), PII and card PINs/CVVs (AES-256-GCM). Never log or return sensitive credentials.
4. **Strict DTO Validation**: All incoming requests must be validated using `class-validator` with `whitelist: true, forbidNonWhitelisted: true`.
5. **Redacted Logging**: All emitted logs must redact authorization headers, access tokens, email addresses, passphrases, and account numbers.
6. **Documentation Synchronization**: Keep context files, progress tracking, and code in strict lockstep. Update `.ai/progress-tracker.md` after completing any unit of work.

---

## 4. Human-in-the-Loop Protocol

- Always propose an implementation plan or prompt in `prompts/<sprint-name>-<unit-name>.md` and obtain user approval before writing code.
- Stop and prompt for human review whenever encountering ambiguity, architectural pivots, or destructive actions.
- Provide clear verification steps, automated test outputs, and proof of correctness after completing any unit of work.

---

## 5. Git Commit Standards

- **Commit Frequency**: Commit code incrementally as you build. Every working session or phase must contain **at least two git commits**.
- **Conventional Commit Patterns**: All git commit messages must strictly adhere to the following prefixes:
  - `feat:` for new features (e.g. `feat: implement double-entry ledger journal balance check`)
  - `fix:` for bug fixes (e.g. `fix: resolve 48-hour quarantine datetime comparison bug`)
  - `refactor:` for code refactoring (e.g. `refactor: clean up command-bar aggregation pipeline`)
  - `docs:` for documentation updates (e.g. `docs: update progress-tracker and architecture context`)
  - `tests:` for test additions and modifications (e.g. `tests: add Vitest suite for time-lock rejection`)
  - `chore:` for maintenance tasks and environment setup (e.g. `chore: configure Prisma schema and seed data`)

---

## 6. Testing & Quality Assurance

All automated tests must be organized strictly into:
- `Tests/UnitTest/<test-name>/`: Unit tests for financial math, time-locks, cryptographic utilities, and service logic.
- `Tests/IntegrationTest/<test-name>/`: End-to-end integration tests for REST API endpoints, authentication flows, and WebSocket gateways.

---

## 7. Pre-Commit Verification Checklist

Before committing code, submitting changes, or marking a task complete:

1. **Static Analysis**: Run and pass all static analysis checks (`npm run lint`).
2. **TypeScript Typecheck**: Run `npx tsc --noEmit` ensuring zero errors.
3. **Automated Tests**: Run and pass all tests in `Tests/UnitTest/` and `Tests/IntegrationTest/`.
4. **Error Handling Check**: Confirm that all new pathways have comprehensive code-based exception throwing and are covered by `GlobalExceptionFilter`.
5. **Redacted Logging Check**: Verify that newly added logs do not expose sensitive tokens or PII.
6. **Documentation**: Update `.ai/progress-tracker.md` with completed items and current state.
