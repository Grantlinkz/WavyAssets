# Implementation Plan: Sprint 1 (Phase 2: Core Gateway Services & Middleware)

## Context & Objectives
In Sprint 1 Phase 1, the foundational infrastructure was initialized: dependencies (NestJS 11, Prisma 6, Vitest, Argon2, Helmet, Throttler, Swagger, Socket.IO, Resend), root governance, database schema, SQLite sync, and baseline security tests.

Sprint 1 Phase 2 builds the **Core Gateway Services & Middleware** for `Backend/landing-page`, creating the operational server boundary before domain features are wired in Sprint 2 (Auth), Sprint 3 (Leads & Simulation), and Sprint 4 (Telemetry).

## Target Deliverables
1. **Config & Environment Module** (`src/config/`):
   - Strongly-typed configuration schema and runtime environment validator.
2. **Database Lifecycle Service** (`src/modules/prisma/`):
   - `PrismaService` handling connection, graceful teardown, and database readiness checks.
3. **Standardized Response Envelope & Interceptor** (`src/common/interceptors/`):
   - Unified `{ success, data, error, timestamp }` output contract.
4. **PII-Redacted Logging Interceptor** (`src/common/interceptors/`):
   - Sanitization of credentials, bearer tokens, OTPs, and email prefixes.
5. **Defensive Error Handling** (`src/common/filters/`):
   - `AllExceptionsFilter` catching all errors, preventing stack/internal leakage, and formatting into the standardized envelope.
6. **Health & Readiness Gateway** (`src/modules/health/`):
   - `/health/live` (process liveness, uptime)
   - `/health/ready` (SQLite database ping, memory pressure, heap)
7. **Application Bootstrap & Root Wiring** (`src/app.module.ts`, `src/main.ts`):
   - Global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`)
   - Helmet security headers (HSTS, CSP, X-Frame-Options)
   - CORS origin whitelisting (`http://localhost:5173`, `http://localhost:5174`, etc.)
   - Cookie parser integration
   - Interactive OpenAPI/Swagger documentation at `/api/docs`
8. **Automated Test Suites (Vitest)**:
   - Unit tests: Exception filter, response transform interceptor, PII redaction interceptor, health service.
   - Integration tests: Gateway health endpoints, 404 shielding, response envelope compliance.
9. **Documentation & Governance Synchronization**:
   - Update `.ai/progress-tracker.md` to mark Sprint 1 Phase 2 complete.
