# Implementation Plan: Sprint 3 (Lead Pipeline, Simulation Intent & Compliance Modules)

## Context & Objectives
In Sprints 1 and 2, the foundational infrastructure, SQLite schema, core gateway services, global validation, exception filtering, PII redaction, health probes, and complete two-step cryptographic authentication and dashboard hand-off pipeline were established and verified with 46/46 passing tests.

Sprint 3 delivers the institutional business pipelines connecting the public marketing landing page (`Frontend/landing-page`) with core WavyAssets systems:
1. **Institutional Mandates & Lead Pipeline (`LeadModule` - `/api/v1/leads`)**: Ingests high-value mandate inquiries from `ContactModal`, enforcing AES-256-GCM field encryption on contact PII, blind index hashing (`workEmailHash`), disposable email blocking, honeypot anti-spam defense, mandate priority classification, and CRM/Telegram notifications.
2. **Portfolio Simulation Intent Persistence (`SimulationModule` - `/api/v1/simulation`)**: Tokenizes simulator compounding allocations ($50k–$10M across 3 risk postures: *Capital Preservation*, *Balanced Growth*, *Max Alpha*) to seamlessly carry user parameters into onboarding and account creation.
3. **Newsletter Double Opt-in (`NewsletterModule` - `/api/v1/newsletter`)**: Institutional research subscriptions with cryptographically signed confirmation tokens and Swiss-style verification email dispatch.
4. **Regulatory Compliance & Audit Trail (`ComplianceModule` - `/api/v1/compliance`)**: Logs user acknowledgments of SEC Rule 206(4)-1, FINMA disclosures, and GDPR consents with hashed IP addresses.

---

## Target Deliverables

### 1. Crypto & Blind Index Utilities (`src/common/utils/crypto.service.ts`)
- `hashBlindIndex(value: string)`: Computes a deterministic HMAC-SHA256 hash for fast exact-match lookups on encrypted fields (e.g. `workEmailHash`).
- `hashIpAddress(ip: string)`: Deterministic HMAC-SHA256 hash for GDPR-compliant zero-raw-IP audit logging.

### 2. Lead Pipeline Module (`src/modules/leads/`)
- `LeadInquiryDto`:
  - `fullName`: string (min 2, max 100).
  - `workEmail`: valid email with corporate domain validation.
  - `companyName`: string (min 2, max 100).
  - `websiteUrl`: optional URL string.
  - `telegram`: optional string handle.
  - `service`: enum (`CRYPTO | STOCKS | AI_FUNDS | REAL_ESTATE | VIP_CARDS | CARS | WALLET`).
  - `allocationRange`: enum (`$500K - $1M | $1M - $5M | $5M - $10M | $10M+ | CUSTOM`).
  - `notes`: optional string (max 1000).
  - `honeypot`: hidden field for anti-spam bot detection (if present, silently marks as spam).
- `LeadsService`:
  - Blocks disposable email providers (e.g., Mailinator, TempMail, GuerrillaMail).
  - Calculates `domainScore` based on authentic corporate domain detection.
  - Encrypts contact fields (`fullNameEncrypted`, `workEmailEncrypted`, `telegramEncrypted`) with AES-256-GCM.
  - Generates HMAC-SHA256 blind index `workEmailHash`.
  - Classifies priority mandates (e.g. allocation >= `$5M`) and dispatches dual notification to Telegram Enclave bot.
  - Persists record in Prisma `LeadInquiry` model.
- `LeadsController`:
  - `POST /api/v1/leads/inquire`: Rate-limited at 5 req/min via Throttler, fully documented in Swagger.

### 3. Simulation Intent Module (`src/modules/simulation/`)
- `SaveSimulationDto`:
  - `capitalAmount`: number ($50k–$50M).
  - `riskPosture`: number (1 = Capital Preservation, 2 = Balanced Growth, 3 = Max Alpha).
  - `projectedYield`: number (1.0%–100.0%).
- `SimulationService`:
  - Generates cryptographically secure `token` (`sim_<hex>`) with 30-day sliding TTL.
  - Persists to Prisma `SimulationIntent` model.
  - Resolves intent token on request to pre-fill registration and onboarding workflows.
- `SimulationController`:
  - `POST /api/v1/simulation/save`: Saves intent and returns token.
  - `GET /api/v1/simulation/:token`: Resolves simulation intent parameters.

### 4. Newsletter Module (`src/modules/newsletter/`)
- `SubscribeNewsletterDto`: Validated email address.
- `NewsletterService`:
  - Generates high-entropy confirmation token.
  - Upserts `NewsletterSubscriber` record with `isConfirmed: false`.
  - Dispatches Swiss-style double opt-in confirmation email via `EmailService`.
  - Verifies confirmation token via `GET /api/v1/newsletter/verify`.
  - Handles unsubscribes cleanly.
- `NewsletterController`:
  - `POST /api/v1/newsletter/subscribe`
  - `GET /api/v1/newsletter/verify`
  - `POST /api/v1/newsletter/unsubscribe`

### 5. Compliance & Regulatory Audit Module (`src/modules/compliance/`)
- `AcknowledgeComplianceDto`:
  - `action`: string (e.g. `SEC_RULE_206_4_1_ACK`, `FINMA_DISCLOSURE_ACK`, `TERMS_OF_SERVICE_ACK`).
  - `actorId`: optional string.
  - `metadata`: optional JSON object.
- `ComplianceService`:
  - Anonymizes IP address using deterministic HMAC-SHA256.
  - Records event in Prisma `AuditLog` table.
- `ComplianceController`:
  - `POST /api/v1/compliance/ack`

### 6. Automated Vitest Test Suites
- Unit tests:
  - `Tests/UnitTest/crypto/blind-index.test.ts`
  - `Tests/UnitTest/leads/leads.service.test.ts`
  - `Tests/UnitTest/simulation/simulation.service.test.ts`
  - `Tests/UnitTest/newsletter/newsletter.service.test.ts`
  - `Tests/UnitTest/compliance/compliance.service.test.ts`
- Integration tests:
  - `Tests/IntegrationTest/leads-pipeline/leads-pipeline.integration.test.ts`
  - `Tests/IntegrationTest/simulation/simulation-intent.integration.test.ts`
  - `Tests/IntegrationTest/compliance/compliance-audit.integration.test.ts`

### 7. Documentation & Governance
- Expose all endpoints with `@nestjs/swagger` decorators for `/api/docs`.
- Update `.ai/progress-tracker.md` to reflect Sprint 3 deliverables and milestones.
