# Implementation Plan: Sprint 2 (Authentication Gateway & User Dashboard Hand-off)

## Context & Objectives
In Sprint 1, the foundational infrastructure, SQLite schema, core gateway services, global validation, exception filtering, PII redaction, and health probes were implemented and verified with 22/22 passing tests.

Sprint 2 delivers the **Authentication Gateway & User Dashboard Hand-off** (`/api/v1/auth`), connecting the public `UnifiedAuthModal` on the marketing landing page with the authenticated institutional infrastructure and orchestrating client transition into `user-dashboard`.

## Target Deliverables

1. **Crypto & Hashing Infrastructure** (`src/common/utils/crypto.service.ts`):
   - Memory-hard Argon2id password hashing and constant-time verification (`memoryCost: 65536`, `timeCost: 3`, `parallelism: 4`).
   - Cryptographic 6-digit numeric OTP generator (`crypto.randomInt(100000, 1000000)`).
   - Deterministic HMAC-SHA256 token hashing for bearer tokens (`refreshTokenHash`, `handoffTicketHash`).
   - High-entropy cryptographic token generators (`crypto.randomBytes(32)`).

2. **Dispatch Gateways**:
   - **Resend Transactional Email Gateway** (`src/modules/auth/services/email.service.ts`):
     - Dispatches 2FA OTP with Swiss typography, 5-minute countdown notice, UTC timestamp, and security ribbon.
     - Resilient error handling (graceful fallback in dev when `EMAIL_PROVIDER=console`).
   - **Telegram Enclave Dispatch** (`src/modules/auth/services/telegram.service.ts`):
     - Real-time dual delivery for institutional and accredited wealth tiers via Telegram bot API.

3. **Authentication Gateway Endpoints** (`src/modules/auth/`):
   - `POST /api/v1/auth/initiate`:
     - Accepts email, passphrase, optional fullName and tier, and mode (`login` | `register`).
     - Validates credentials or prepares registration challenge.
     - Generates 6-digit numeric OTP with 5-minute TTL.
     - Dispatches OTP via Resend (and Telegram for institutional accounts).
     - Returns `{ step: 2, challengeId, expiresInSeconds: 300, deliveryChannel, maskedDestination }`.
   - `POST /api/v1/auth/verify-otp`:
     - Validates challenge ID, constant-time OTP hash, and 3-attempt maximum limit.
     - **Production Sandbox Guard**: Strictly rejects `DEV_STATIC_OTP` in `NODE_ENV=production` with `HTTP 403 Forbidden`.
     - Issues signed JWT access token and sets `HttpOnly`, `Secure`, `SameSite=Strict` refresh cookie.
     - Generates single-use dashboard exchange ticket (`handoffTicket`) and sets `wavy_handoff` cookie (`SameSite=Lax`, 60s TTL).
     - Returns `{ user, accessToken, handoffTicket, dashboardUrl }`.
   - `POST /api/v1/auth/exchange`:
     - Validates and consumes the single-use exchange ticket (hashed at rest).
     - Burns ticket immediately to prevent replay attacks.
   - `POST /api/v1/auth/refresh`:
     - Rotates refresh session and issues new access token.
   - `POST /api/v1/auth/logout`:
     - Invalidates session in database and clears HTTP cookies.

4. **Security Safeguards**:
   - **Production Sandbox Guard**: Rejects `DEV_STATIC_OTP` and `EMAIL_PROVIDER=console` in production with `403 Forbidden`.
   - Rate limiting: 5 req/min on `/initiate` and `/verify-otp`.
   - Zero plain text credentials in SQLite database.
   - Zero bearer credentials in URL query strings.

5. **Automated Test Suites (Vitest)**:
   - Unit tests: Password hashing, OTP generation, auth service logic, 3-attempt invalidation.
   - Integration tests: Complete 2-step auth flow, cookie issuance, ticket exchange, and Production Sandbox Guard rejection.

6. **Documentation & Governance**:
   - OpenAPI annotations across all auth endpoints at `/api/docs`.
   - Update `.ai/progress-tracker.md` to mark Sprint 2 completed.
