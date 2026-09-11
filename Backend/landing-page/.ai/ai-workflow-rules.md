# AI Workflow Rules — WavyAssets Landing Page Backend

## Development Approach: 4-Sprint Backend Execution Roadmap

All implementation work follows the structured 4-sprint roadmap defined in `tools/WavyAssets LandingPage Backend Execution.md`. Implementation proceeds strictly against the specifications, data contracts, and security boundaries documented in `tools/`.

```
[Sprint 1: Architecture Foundation, Database & Core Security]
  ├── NestJS 11 scaffold with TypeScript strict mode, ESLint, Prettier
  ├── Prisma ORM 6 with SQLite database & initial relational schema migrations
  ├── Global ValidationPipe, AllExceptionsFilter, standardized response envelope
  ├── Helmet security headers, CORS origin whitelisting, PII-redacted logger
  └── Vitest unit & integration test runner setup with approved agent skills
[Sprint 2: Authentication Gateway & User Dashboard Hand-off]
  ├── AuthModule with /api/v1/auth/initiate & /api/v1/auth/verify-otp
  ├── Argon2id password hashing & cryptographically random 6-digit OTP (5-min TTL)
  ├── Dual delivery: Resend email API + Telegram Enclave bot
  ├── Production Sandbox Guard (strict rejection of DEV_STATIC_OTP in prod with HTTP 403)
  ├── Signed JWT access tokens, HttpOnly/SameSite=Strict refresh cookies
  └── Dashboard hand-off exchange ticket handshake & Vitest auth integration suites
[Sprint 3: Lead Pipeline, Simulation Intent & Newsletter Modules]
  ├── LeadModule with corporate email domain verification & anti-spam honeypots
  ├── AES-256-GCM database field-level encryption for sensitive contact PII
  ├── Webhook dispatcher for institutional CRM / Slack / Telegram notifications
  ├── SimulationModule for portfolio intent tokenization & onboarding pre-fill
  ├── NewsletterModule with double opt-in verification
  └── ComplianceModule logging regulatory audit trails (SEC Rule 206(4)-1 / FINMA)
[Sprint 4: Live Telemetry, WebSocket Ticker & Production Hardening]
  ├── TelemetryModule with WebSocket (/ws/ticker) & REST endpoints for live quotes
  ├── Cryptographic Enclave proof-of-reserves & HSM status telemetry
  ├── In-memory quote caching engine with circuit-breaker resilience
  ├── Interactive Swagger/OpenAPI documentation at /api/docs
  └── Final security audit, complete Vitest test run, and production Dockerfile
```

---

## Human-in-the-Loop Protocol

1. **Plan / Prompt First**: Before writing any implementation code, formulate a dedicated prompt file in `prompts/<sprint-name>-<unit-name>.md` detailing:
   - Target Sprint & Epic from `WavyAssets LandingPage Backend Execution.md`
   - Required skills consulted (`vitest`, `prisma-database-setup`, `prisma-cli`, `prisma-client-api`)
   - Files to create or modify (Controllers, Services, DTOs, Schemas, Tests)
   - Error handling strategy (Domain exceptions, global filter routing, envelope format)
   - Test plan (Unit tests in `Tests/UnitTest/`, Integration tests in `Tests/IntegrationTest/`)
   - Acceptance criteria and verification benchmarks
2. **Approval Gateway**: Request user review:
   > _"I prepared the implementation prompt at `prompts/<file-name>.md`. Is this good to execute?"_
3. **Strict Execution**: Implement only after receiving explicit user approval.
4. **Demonstrate & Verify**: Provide automated test results, TypeScript typecheck confirmation, and manual verification steps after every step.
5. **Sync Documentation**: Update `.ai/progress-tracker.md`, OpenAPI annotations at `/api/docs`, and context files immediately after completion.

---

## Non-Negotiable Invariants

1. **Adherence to `tools/`**: Never invent arbitrary endpoints, bypass specifications, or alter data contracts outside of what is documented in `tools/WavyAssets LandingPage Backend Execution.md`.
2. **Production Sandbox Guard**: In `NODE_ENV=production`, `DEV_STATIC_OTP` and `EMAIL_PROVIDER=console` are unconditionally forbidden. Any attempt to use sandbox codes in production must abort with `HTTP 403 Forbidden` and trigger an intrusion alert.
3. **Zero PII Logging**: Logs must never contain passwords, OTP codes, bearer tokens, full names, or sensitive email prefixes.
4. **Standardized Response Envelope**: Every HTTP response must adhere to `{ success: boolean, data?: T, error?: string, timestamp: string }`.
5. **Global Error Shielding**: Unhandled exceptions must be caught by `AllExceptionsFilter` and sanitized to prevent leaking stack traces, database schemas, or system paths.
6. **Continuous Testing**: Unit and Integration tests must be created and updated in `Tests/UnitTest/<test-name>` and `Tests/IntegrationTest/<test-name>`.
7. **Documentation Synchronization**: Docs must be updated after every phase or step. Keep context files, progress tracking, and code in strict lockstep before declaring work complete.

---

## Git Commit Standards

- **Git Commit Frequency**: Commit code as you build. Every working session or phase must contain **at least two git commits**.
- **Conventional Commit Patterns**: All git commit messages must strictly adhere to the following prefixes:
  - `feat:` for new features (e.g. `feat: add Argon2id password hashing and OTP challenge service`)
  - `fix:` for bug fixes (e.g. `fix: resolve rate limiter sliding window expiration bug`)
  - `refactor:` for code refactoring (e.g. `refactor: modularize AES-256-GCM encryption service`)
  - `docs:` for documentation updates (e.g. `docs: update progress-tracker and API contracts`)
  - `tests:` for test additions and modifications (e.g. `tests: add Vitest suite for OTP verification`)
  - `chore:` for maintenance tasks and environment setup (e.g. `chore: configure prisma schema and throttler`)

---

## Pre-Commit Verification Checklist

Before marking any task complete or committing changes:

1. **TypeScript Typecheck**: Run `npx tsc --noEmit` with zero errors.
2. **Linter**: Run `npm run lint` and verify zero ESLint errors or warnings.
3. **Automated Tests**: Execute `npm run test` (Vitest) ensuring all tests in `Tests/UnitTest/` and `Tests/IntegrationTest/` pass.
4. **Error Handling & Envelope Check**: Verify all endpoints return standardized `{ success, data, error, timestamp }` envelopes and error messages are sanitized.
5. **Production Sandbox Verification**: Verify that `ProductionSandboxGuard` blocks sandbox OTPs in production mode.
6. **PII Redaction Check**: Confirm logs strip all sensitive credentials and PII.
7. **Documentation & Swagger**: Update `.ai/progress-tracker.md` and ensure Swagger annotations at `/api/docs` reflect new endpoints.
