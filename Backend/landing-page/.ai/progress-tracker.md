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

### [ ] Sprint 1 (Phase 2: Core Gateway Services & Middleware)
- [ ] Implement global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`) and standardized JSON response envelope (`{ success, data, error, timestamp }`).
- [ ] Implement global `AllExceptionsFilter` preventing stack trace leaks and sanitizing system errors.
- [ ] Implement Helmet security headers, CORS origin whitelisting, and PII-redacted logger.
- [ ] Scaffold `AppModule`, `PrismaService`, and health check controllers (`/health/live`, `/health/ready`).

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
- Verified baseline Vitest test suite in `Tests/UnitTest/foundation/environment.test.ts` (3/3 passing).

---

## Next Up

- **Sprint 1 Phase 2 Execution**:
  1. Scaffold `src/main.ts` with global `ValidationPipe`, `AllExceptionsFilter`, Helmet, and Swagger setup.
  2. Implement `PrismaService` and `HealthModule` (`/health/live`, `/health/ready`).
  3. Wire PII-redacted logging and response transformation interceptor.
