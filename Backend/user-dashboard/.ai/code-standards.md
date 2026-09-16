# Code Standards — WavyAssets Sovereign Backend User Dashboard

## General Principles

1. **Precision & Single Responsibility**: Every module, controller, service, and utility must have a single, well-defined responsibility. Business logic lives in services; controllers handle HTTP/WebSocket routing, DTO validation, and response mapping.
2. **Deterministic Financial Math**: Never use raw floating-point arithmetic for balances, ledger movements, or fees. Use integer cents/basis points or exact decimal arithmetic to prevent precision drift.
3. **Database Transaction Atomicity**: Any operation modifying multiple records or balances must execute within a `prisma.$transaction()` block with serializable isolation.
4. **Comprehensive Error Resilience**: Every failure pathway must be explicitly anticipated, validated with code-based exceptions, and safeguarded by global error handling filters.

---

## TypeScript Conventions

- **Strict Type Checking**: Strict mode is enabled (`tsconfig.json`). Never use `any` or `unknown` casts without type guards. Use strict interfaces, enums, branded types, and Discriminated Unions.
- **DTOs and Data Contracts**: All ingress payloads must be defined as class DTOs decorated with `class-validator` and `class-transformer`. NestJS validation pipes must enforce `whitelist: true, forbidNonWhitelisted: true, transform: true`.
- **Immutability & Readonly**: Declare configuration objects, ledger entry definitions, and utility constants as `readonly` or `as const`.

---

## Comprehensive Error Handling Standards

Error handling in WavyAssets Backend User Dashboard is structured in two complementary tiers: **Code-Based Error Handling** (within controllers, services, guards, and domain models) and **Global Error Handling** (at the application boundary via NestJS exception filters).

### 1. Code-Based Error Handling

Code-based error handling ensures that errors are detected, validated, and thrown as close to the failure point as possible, with explicit business context:

1. **Semantic NestJS HTTP Exceptions**:
   - Never throw raw `Error` instances or return `{ error: string }` literals.
   - Throw semantic NestJS HTTP exceptions that convey the precise HTTP status code:
     - `BadRequestException` (400): Invalid request payloads, malformed inputs, failed DTO validation, out-of-range parameters.
     - `UnauthorizedException` (401): Missing/expired access JWTs, invalid handoff ticket signatures, failed password verification.
     - `ForbiddenException` (403): KYC tier insufficient for operation, attempting withdrawal to a quarantined address, accessing another user's resources.
     - `NotFoundException` (404): Resource not found (e.g. holding, order, property, car, or session).
     - `ConflictException` (409): Unique constraint violation, duplicate idempotency reference ID (`referenceId`), concurrent modification.
     - `UnprocessableEntityException` (422): Syntactically valid request failing business rule verification (e.g. buying power exceeded, balance would become negative).
2. **Domain-Specific Exception Hierarchy**:
   - Create custom domain exceptions extending NestJS built-in exceptions in `src/common/exceptions/`:
     - `QuarantineTimeLockException`: Thrown when a withdrawal is attempted against a destination currently under 48-hour quarantine (`status === 'QUARANTINE'` or `NOW() < quarantineUntil`). Returns HTTP 403 with `errorCode: 'ERR_DESTINATION_QUARANTINED'` and unlock timestamp.
     - `LedgerImbalanceException`: Thrown if a proposed ledger transaction violates the zero-sum invariant ($\sum \text{Debits} + \sum \text{Credits} \neq 0$). Returns HTTP 500/422 with `errorCode: 'ERR_LEDGER_IMBALANCE'`.
     - `InsufficientAvailableBalanceException`: Thrown when an order or withdrawal exceeds `AVAILABLE_CASH`. Returns HTTP 422 with `errorCode: 'ERR_INSUFFICIENT_FUNDS'`.
     - `InvalidHandoffTicketException`: Thrown when a ticket is expired, already burned, or signature verification fails. Returns HTTP 401 with `errorCode: 'ERR_INVALID_HANDOFF_TICKET'`.
     - `CircuitBreakerTriggeredException`: Thrown when an AI systematic fund operation is attempted while the emergency circuit breaker is active. Returns HTTP 403 with `errorCode: 'ERR_CIRCUIT_BREAKER_ACTIVE'`.
3. **Database & Transactional Error Handling**:
   - In `prisma.$transaction(async (tx) => { ... })`:
     - Catch known Prisma errors (e.g. `P2002` unique constraint, `P2025` record not found) and rethrow them as semantic NestJS exceptions (`ConflictException`, `NotFoundException`).
     - Never swallow database exceptions. Any unhandled error inside `$transaction` must cause an immediate, automatic transaction rollback.
4. **Third-Party Service & Market Feed Resilience**:
   - External APIs (CoinGecko, Pyth, Hagerty index, Web3 RPCs, DHL courier API) must be wrapped in `try/catch` blocks with:
     - Configurable timeouts (max 3000ms).
     - Automatic fallback to cached prices or mock feeds if the external service fails or rate-limits.
     - Circuit breaker pattern to prevent cascading timeouts.
5. **Validation & Invariant Assertions**:
   - Enforce preconditions at the beginning of service methods. If a precondition fails, immediately throw the corresponding domain exception before mutating any state.

### 2. Global Error Handling

Global error handling guarantees that no matter what runtime failure occurs, the client receives a secure, uniform response while operational telemetry captures full diagnostics:

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
   - Every request is tagged with a unique `correlationId` (UUID v4) generated by middleware.
   - The `GlobalExceptionFilter` logs the full internal error, stack trace, and request metadata to the server-side log, tagged with the `correlationId`.
   - All PII (emails, IPs, card numbers) and secrets (passwords, tokens) are strictly redacted before logging.

---

## Prisma & Database Standards

1. **Explicit Schema Migrations**: All database schema changes must be applied via version-controlled Prisma migrations (`npx prisma migrate dev`). Manual direct schema edits are forbidden.
2. **Parametric Queries**: Always use Prisma Client query methods. Never construct raw SQL strings with interpolated user inputs.
3. **Ledger Immutability**: `LedgerTransaction` and `LedgerEntry` records are write-once, append-only. Updates and deletes on these tables are prohibited in production. Corrections must be made via offsetting reversal transactions.
4. **Cascade Rules**: Configure foreign keys with explicit `onDelete` rules (`Cascade` for user child records like `Session`, `Restrict` for financial ledger entries).

---

## Logging & Telemetry Standards

1. **Redacted Logging Interceptor**:
   - Register `RedactedLoggingInterceptor` globally to record all incoming requests and outgoing responses.
   - Strip `Authorization`, `Cookie`, `Set-Cookie`, `ticket`, `passphrase`, `cvv`, `pin`, `refreshToken`, and sensitive PII.
2. **Structured JSON Logs**:
   - In production, output logs in single-line JSON format with timestamp, log level (`INFO`, `WARN`, `ERROR`), `correlationId`, `userId`, `action`, and duration in milliseconds.

---

## Testing & Quality Assurance

- **Unit Tests (`Tests/UnitTest/<test-name>/`)**:
  - `Tests/UnitTest/ledger-math/`: Verify double-entry balancing ($\sum \text{Debits} + \sum \text{Credits} = 0$), negative balance prevention, and currency conversions.
  - `Tests/UnitTest/time-lock/`: Validate the 48-hour quarantine calculation, early withdrawal rejection, and hardware signer countdown.
  - `Tests/UnitTest/auth-ticket/`: Validate HMAC-SHA256 ticket hashing, single-use burning, and expiration logic.
  - `Tests/UnitTest/crypto-utils/`: Validate AES-256-GCM encryption/decryption of card CVV/PIN and Argon2id hashing.
- **Integration Tests (`Tests/IntegrationTest/<test-name>/`)**:
  - `Tests/IntegrationTest/auth-handoff/`: Test end-to-end ticket exchange (`POST /api/v1/auth/exchange-ticket`), cookie issuance, and protected route access.
  - `Tests/IntegrationTest/command-bar/`: Test `GET /api/v1/dashboard/command-bar` aggregate output across all 7 asset classes.
  - `Tests/IntegrationTest/error-handling/`: Test that `GlobalExceptionFilter` properly intercepts 4xx and 5xx errors, sanitizes payloads, and returns the unified response envelope with zero stack traces.
  - `Tests/IntegrationTest/websocket/`: Test Socket.IO `/ws/portfolio` connection authentication, user room isolation, and event broadcasting.

---

## Git Commit Standards

- **Commit Frequency**: Commit code incrementally as you build. Every working session or phase must contain **at least two git commits**.
- **Conventional Commit Patterns**: All commit messages must strictly adhere to the following prefixes:
  - `feat:` for new features (e.g. `feat: implement double-entry ledger balance validator`)
  - `fix:` for bug fixes (e.g. `fix: resolve time-lock quarantine comparison logic`)
  - `refactor:` for code refactoring (e.g. `refactor: extract crypto vault balance calculator`)
  - `docs:` for documentation updates (e.g. `docs: update progress-tracker and architecture context`)
  - `tests:` for test additions and modifications (e.g. `tests: add unit tests for 48h withdrawal time-lock`)
  - `chore:` for maintenance tasks and environment setup (e.g. `chore: configure Prisma SQLite datasource`)
