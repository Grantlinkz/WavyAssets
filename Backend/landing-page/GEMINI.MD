# GEMINI.MD — WavyAssets Landing Page Backend Governance

## 1. System Context & Governing Documentation

Before planning, implementing, or modifying any architectural component or code in `Backend/landing-page`, you MUST read and adhere to the following governance and context documents in sequential order:

1. **Agent Persona & Approved Skills**:
   - Primary: [.ai/agent.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/landing-page/.ai/agent.md)
   - Extended: [.ai/agents.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/landing-page/.ai/agents.md)
2. **Product Definition & System Scope**:
   - [.ai/project-overview.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/landing-page/.ai/project-overview.md) — Institutional product expectations, 100k+ MAU target, <50ms SLA, target personas, and 5 core modules.
3. **System Architecture & Boundaries**:
   - [.ai/architecture.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/landing-page/.ai/architecture.md) — NestJS 11 + TypeScript strict architecture, Prisma ORM 6 with SQLite relational storage, WebSocket/SSE gateways, and dashboard handoff handshake.
4. **Code Standards & Patterns**:
   - [.ai/code-standards.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/landing-page/.ai/code-standards.md) — NestJS module/controller/service patterns, DTO validation via `class-validator`, response envelope conventions, and test colocation.
5. **Threat Model & Security Safeguards**:
   - [.ai/security.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/landing-page/.ai/security.md) — Zero PII logging, **Production Sandbox Guard**, Argon2id hashing, AES-256-GCM encryption at rest, rate limiting, and defensive security boundaries.
6. **AI Workflow & Human-in-the-Loop Protocol**:
   - [.ai/ai-workflow-rules.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/landing-page/.ai/ai-workflow-rules.md) — 4-sprint backend execution lifecycle, prompt-driven planning (`prompts/`), git commit rules, and pre-commit verification.
7. **Progress Tracking & Roadmap State**:
   - [.ai/progress-tracker.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/landing-page/.ai/progress-tracker.md) — Current sprint status, completed deliverables, open questions, and next execution milestones.
8. **Frontend Interoperability & Client Styling Context**:
   - [.ai/ui-context.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/landing-page/.ai/ui-context.md) — Contract compatibility with `Frontend/landing-page`, Swiss transactional email formatting (Resend), and Swagger/OpenAPI UI specifications at `/api/docs`.
9. **Index & Invariants Reference**:
   - [.ai.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/landing-page/.ai.md) — Root documentation index and non-negotiable operational invariants.
10. **Institutional Execution Specification**:
   - [tools/WavyAssets LandingPage Backend Execution.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/landing-page/tools/WavyAssets%20LandingPage%20Backend%20Execution.md) — Source of truth for backend requirements, module expectations, and technical benchmarks.

---

## 2. Core Pillars

### Pillar 1: Documentation (Docs)
- **Mandatory Documentation Synchronization**: Documentation in `.ai/`, `README.md`, and OpenAPI specifications at `/api/docs` must be updated after every phase or step. Code, context files, and progress tracking must remain in strict lockstep before declaring work complete.
- **OpenAPI / Swagger Documentation**: Every endpoint across all modules (`/api/v1/auth`, `/api/v1/leads`, `/api/v1/telemetry`, `/api/v1/simulation`, `/api/v1/newsletter`, `/api/v1/compliance`, `/health`) must be fully annotated using `@nestjs/swagger` decorators (`@ApiOperation`, `@ApiResponse`, `@ApiProperty`, `@ApiTags`), exposing interactive API docs at `/api/docs`.
- **Environment & Variable Documentation**: All configuration variables must be maintained and explained in `.env.example` with security warnings for production deployment.

### Pillar 2: Global Error Handling & Error Handling When Required
- **Standardized Response Envelope**: All controller responses must return the unified JSON envelope:
  ```typescript
  {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
  }
  ```
- **Global Error Shielding (`AllExceptionsFilter`)**:
  - Catches all uncaught exceptions (`HttpException` and standard `Error`).
  - Formats errors into the standardized response envelope.
  - Sanitizes client error messages, completely stripping internal stack traces, SQLite/Prisma database error codes, and infrastructure details.
- **Domain Error Handling When Required**:
  - **DTO Input Validation**: Handled by NestJS `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`, rejecting unauthorized payload properties with `400 Bad Request`.
  - **Authentication Failures**: Return generic institutional error messages ("Invalid credentials or challenge expired") to prevent account enumeration. Limit OTP verification attempts to maximum 3 before permanent challenge invalidation.
  - **External Gateway Resilience**: Wrap external dispatchers (Resend email API, Telegram Enclave bot, CoinGecko price feed) in try/catch blocks with circuit-breaker fallbacks so external outages never crash core user workflows.
  - **Database Exceptions**: Prisma query errors (e.g. `P2002` unique constraint violation) must be captured and translated into safe domain exceptions (e.g. `ConflictException("Email already registered")`).

### Pillar 3: Comprehensive Testing
- **Test Framework**: Automated testing powered by **Vitest** for fast, deterministic execution with strict ESM support and Jest-compatible API.
- **Strict Test Organization**:
  - Unit tests MUST reside in: `Tests/UnitTest/<test-name>/`
  - Integration and E2E tests MUST reside in: `Tests/IntegrationTest/<test-name>/`
- **Security-Critical Test Coverage**: High branch coverage across:
  - Argon2id password hashing and constant-time verification.
  - Cryptographic 6-digit OTP generation, 5-minute TTL sliding expiration, and 3-attempt invalidation.
  - Dual-tier sliding window rate limiting (120 req/min general, 5 req/min auth/leads).
  - AES-256-GCM database field encryption and decryption for sensitive lead PII.
  - **Production Sandbox Guard**: Verifying that submission of `DEV_STATIC_OTP` or use of `EMAIL_PROVIDER=console` in production (`NODE_ENV=production`) is strictly rejected with `HTTP 403 Forbidden`.
- **Pre-Commit Requirement**: Unit and Integration test suites must be updated and passing (`npm run test`) before any unit of work is completed or committed.

### Pillar 4: Agent Skills
The AI coding assistant is authorized to invoke and consult the following specialized agent skills located in `.agents/skills/`:

1. **`vitest`** (`.agents/skills/vitest`):
   - Command: `npx skills add antfu/skills --skill vitest`
   - Capabilities: Vitest test suite runner, mocking (`vi.mock`), assertion patterns, and coverage configuration.
2. **`prisma-database-setup`** (`.agents/skills/prisma-database-setup`):
   - Command: `npx skills add prisma/skills --skill prisma-database-setup`
   - Capabilities: SQLite and PostgreSQL datasource configuration, connection URLs, connection pools, and migration strategies.
3. **`prisma-cli`** (`.agents/skills/prisma-cli`):
   - Command: `npx skills add prisma/skills --skill prisma-cli`
   - Capabilities: CLI commands (`prisma migrate dev`, `prisma generate`, `prisma db push`, `prisma studio`, `prisma validate`).
4. **`prisma-client-api`** (`.agents/skills/prisma-client-api`):
   - Command: `npx skills add prisma/skills --skill prisma-client-api`
   - Capabilities: Type-safe CRUD operations, relation queries (`include`/`select`), transactional execution (`$transaction`), and filter operators.

---

## 3. Non-Negotiable Architectural & Security Invariants

1. **Production Sandbox Guard (Zero Tolerance)**:
   Local development configurations (`DEV_STATIC_OTP`, `EMAIL_PROVIDER=console`) are strictly disabled in production (`NODE_ENV=production`). Any attempt to submit dev sandbox codes or bypass live OTP in production must abort with `403 Forbidden` and trigger an automated security alert.
2. **Zero PII Logging**:
   All emitted logs must automatically redact passwords, OTP codes, bearer tokens, full names, and sensitive email prefixes using the custom redaction logger/interceptor.
3. **Strict Content Security & CORS**:
   Whitelisted origin verification (`http://localhost:5173`, `http://localhost:5174`, production domains), Helmet security headers (HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict Referrer-Policy).
4. **Cryptographic Hygiene**:
   - Passwords hashed with Argon2id memory-hard parameters.
   - Field-level encryption for sensitive lead contact details using AES-256-GCM.
   - JWT tokens signed with environment-isolated 64-character secrets; refresh tokens stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
5. **Deterministic Data Contracts**:
   All input payloads must be strictly validated using `class-validator` via global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.
6. **Low Latency SLA**:
   API responses must satisfy an operational latency benchmark of `< 50ms`.

---

## 4. Human-in-the-Loop Workflow

1. Always inspect `tools/WavyAssets LandingPage Backend Execution.md` and `.ai/` documentation before planning.
2. Formulate a structured implementation prompt in `prompts/<sprint-name>-<unit-name>.md` and obtain explicit user approval before writing code.
3. Execute approved prompt with atomic changes.
4. Verify using linting (`npm run lint`), typechecking (`npx tsc --noEmit`), and automated tests (`npm run test`).
5. Update docs and `.ai/progress-tracker.md` immediately upon completing any unit of work.

---

## 5. Git Commit Standards

- **Commit Frequency**: Commit code as you build. Every working session or phase must contain **at least two git commits**.
- **Conventional Commit Pattern**: All commit messages must strictly adhere to conventional commit prefixes:
  - `feat:` for new features (e.g. `feat: add Argon2id password hashing and 2-step OTP challenge engine`)
  - `fix:` for bug fixes (e.g. `fix: resolve rate limiter sliding window TTL expiration bug`)
  - `refactor:` for code refactoring (e.g. `refactor: extract AES-256-GCM cipher into reusable encryption service`)
  - `docs:` for documentation updates (e.g. `docs: update progress-tracker and API contract matrix`)
  - `tests:` for test additions/modifications (e.g. `tests: add Vitest suite for brute-force auth lockout`)
  - `chore:` for maintenance tasks and environment setup (e.g. `chore: configure prisma schema and throttler module`)
