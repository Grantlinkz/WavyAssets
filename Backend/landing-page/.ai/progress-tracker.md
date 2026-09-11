# Progress Tracker — WavyAssets Landing Page Backend

## Project Status

- **Current Phase**: Sprint 1 (Architecture Foundation, Database & Core Security) — Foundation Setup Complete
- **Overall Roadmap**: 4 Technical Sprints defined in `tools/WavyAssets LandingPage Backend Execution.md`
- **Target SLA**: <50ms API response latency, 100,000+ MAU throughput, zero leaked stack traces

---

## 4-Sprint Technical Roadmap Status

### [x] Sprint 1 (Phase 1: Dependencies, Database & Foundations)
- [x] Configure approved agent skills in `.agents/skills/` (`vitest`, `prisma-database-setup`, `prisma-cli`, `prisma-client-api`).
- [x] Establish root governance in `GEMINI.MD` and synchronize `.ai/` documentation suite.
- [x] Define environment variables and production security warnings in `.env.example`.
- [x] Create institutional `package.json`, `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, and `vitest.config.ts`.
- [x] Install all production and development dependencies (NestJS 11, Prisma 6, Vitest, Argon2id, Helmet, Throttler, Swagger, Socket.IO, Resend, Class-Validator).
- [x] Formulate `prisma/schema.prisma` with institutional models (`User`, `Session`, `OtpCode`, `LeadInquiry`, `SimulationIntent`, `NewsletterSubscriber`, `AuditLog`).
- [x] Generate Prisma Client (`v6.19.3`) and synchronize local SQLite database (`dev.db`).
- [x] Establish baseline Vitest unit test suite verifying Argon2id, crypto OTP, and AES-256-GCM ciphers (3/3 tests passing).

### [x] Sprint 1 (Phase 2: Core Gateway Services & Middleware)
- [x] Implement global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`) and standardized JSON response envelope (`{ success, data, error, timestamp }`).
- [x] Implement global `AllExceptionsFilter` preventing stack trace leaks and sanitizing system errors.
- [x] Implement Helmet security headers, CORS origin whitelisting, and PII-redacted logger.
- [x] Scaffold `AppModule`, `PrismaService`, and health check controllers (`/health/live`, `/health/ready`).

### [ ] Sprint 2: Authentication Gateway & User Dashboard Hand-off
- [ ] Implement `AuthModule` with `/api/v1/auth/initiate` and `/api/v1/auth/verify-otp`.
- [ ] Build Argon2id password hashing and constant-time verification service.
- [ ] Implement cryptographically secure 6-digit OTP generator (`crypto.randomInt`) with 5-minute TTL and max 3-attempt invalidation.
- [ ] Configure transactional email gateway via Resend API (`security@wavyassets.com`) with Swiss typography.
- [ ] Configure encrypted enclave dispatch via Telegram bot for accredited/institutional tier accounts.
- [ ] Implement **Production Sandbox Guard**: strictly reject `DEV_STATIC_OTP` and `EMAIL_PROVIDER=console` in production with HTTP 403 Forbidden.
- [ ] Implement signed JWT access token issuance and `HttpOnly`, `Secure`, `SameSite=Strict` refresh cookies.
- [ ] Implement dashboard hand-off exchange ticket mechanism for seamless client redirection to `user-dashboard`.
- [ ] Establish unit and integration tests validating auth flows, password hashing, and brute-force lockouts in `Tests/UnitTest/auth/` and `Tests/IntegrationTest/auth-flow/`.

### [ ] Sprint 3: Lead Pipeline, Simulation Intent & Newsletter Modules
- [ ] Implement `LeadModule` with `/api/v1/leads/inquire` validating corporate domains and filtering disposable email providers.
- [ ] Build AES-256-GCM field encryption for sensitive contact PII (`workEmail`, `telegram`, phone) with blind index hashing (`workEmailHash`).
- [ ] Implement anti-spam honeypot detection and mandate priority classifier.
- [ ] Implement webhook dispatcher for institutional CRM / Slack / Telegram notifications.
- [ ] Implement `SimulationModule` with `/api/v1/simulation/save` tokenizing capital allocation and risk posture for onboarding pre-fill.
- [ ] Implement `NewsletterModule` with double opt-in verification links and `ComplianceModule` logging regulatory disclaimer acknowledgments.
- [ ] Establish unit and integration test suites in `Tests/UnitTest/leads/`, `Tests/UnitTest/crypto/`, and `Tests/IntegrationTest/leads-pipeline/`.

### [ ] Sprint 4: Live Telemetry, WebSocket Ticker & Production Hardening
- [ ] Implement `TelemetryModule` with REST endpoint `/api/v1/telemetry/ticker` and WebSocket gateway `/ws/ticker` broadcasting live multi-asset quotes.
- [ ] Implement Enclave telemetry endpoint `/api/v1/telemetry/enclave` publishing Merkle root, HSM status, clearing latency, and Tier AUM.
- [ ] Build in-memory quote caching engine with circuit-breaker protection against upstream API failures.
- [ ] Configure interactive Swagger/OpenAPI documentation at `/api/docs`.
- [ ] Final security audit, end-to-end integration test suite validation, and production Docker containerization.

---

## Completed Items

- Installed approved project skills into `.agents/skills/`:
  - `vitest`: Unit and integration testing orchestration.
  - `prisma-database-setup`: SQLite and PostgreSQL datasource configuration.
  - `prisma-cli`: Database CLI migrations and client generation.
  - `prisma-client-api`: Type-safe queries, atomic transactions, and relation filters.
- Created `GEMINI.MD` root governance file establishing documentation synchronization, global error handling, testing standards, and agent skills.
- Created `.ai/agent.md` and updated `.ai/agents.md` defining the Principal Institutional Backend Engineer persona, workflows, and guardrails.
- Formulated `.ai/project-overview.md` capturing target personas, problem definitions, 5 core modules, and operational SLAs (<50ms).
- Formulated `.ai/architecture.md` defining NestJS modular structure, Prisma SQLite schema, standardized response envelope, and dashboard hand-off flow.
- Formulated `.ai/code-standards.md` establishing DTO validation, Argon2id/AES-256-GCM standards, error boundaries, and test colocation rules.
- Formulated `.ai/security.md` detailing the threat model, Zero PII logging, and the strict Production Sandbox Guard.
- Formulated `.ai/ai-workflow-rules.md` structuring the 4-sprint roadmap, prompt-planning protocol, and pre-commit verification checklist.
- Formulated `.ai/ui-context.md` aligning API data contracts with `Frontend/landing-page`, Resend email templates, and Swagger UI at `/api/docs`.
- Synchronized root `.ai.md` with complete reading order and non-negotiable invariants.
- Created `package.json` with NestJS 11, Prisma 6, Vitest, Argon2, Helmet, Throttler, Swagger, Socket.IO, Resend, and strict TypeScript.
- Configured `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, and `vitest.config.ts`.
- Installed all 587 npm packages cleanly.
- Formulated `prisma/schema.prisma`, generated Prisma Client, and pushed SQLite database (`dev.db`).
- Verified baseline Vitest test suite in `Tests/UnitTest/foundation/environment.test.ts` (4/4 passing).
- Configured strongly typed configuration service and runtime environment validator with Production Sandbox Guard (`src/config/`).
- Implemented global `TransformInterceptor` emitting standardized institutional API responses (`{ success, data, timestamp }`).
- Implemented `PiiRedactionInterceptor` stripping credentials, tokens, OTPs, full names, and sensitive email prefixes from server traffic logs.
- Implemented global `AllExceptionsFilter` preventing stack trace leaks, formatting sanitized error envelopes, and suppressing internal Prisma/SQLite database errors.
- Built `PrismaService` handling connection lifecycle and database readiness probes.
- Built `HealthModule` exposing `/health/live` and `/health/ready` with process uptime, memory metrics, and database connectivity.
- Configured `src/main.ts` with Helmet defensive headers, CORS whitelisting, Cookie Parser, global `ValidationPipe`, global prefix `/api/v1`, and OpenAPI/Swagger UI at `/api/docs`.
- Verified complete Vitest test suite with 6 test files and 22/22 passing tests across unit and integration levels.

---

## Next Up

- **Sprint 2: Authentication Gateway & User Dashboard Hand-off**:
  1. Formulate prompt `prompts/sprint-2-auth-gateway.md` and obtain approval.
  2. Implement `AuthModule` with `/api/v1/auth/initiate` and `/api/v1/auth/verify-otp`.
  3. Implement Argon2id password hashing, cryptographic 6-digit OTP generator, and 3-attempt invalidation.
  4. Configure Resend email gateway and Telegram Enclave alerts.
  5. Enforce **Production Sandbox Guard** (`403 Forbidden` on sandbox flags in production).
  6. Issue signed JWT tokens, `HttpOnly` refresh cookies, and dashboard handoff ticket mechanism.
