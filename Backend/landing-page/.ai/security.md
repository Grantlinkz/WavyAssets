# Security Context — WavyAssets Landing Page Backend

## Threat Model & Trust Boundaries

```
                      [ PUBLIC INTERNET / UNTRUSTED CLIENTS ]
                                        │
                                        ▼  (TLS 1.3, Strict CORS, Helmet CSP)
                       ┌─────────────────────────────────┐
                       │  Defensive Ingestion Perimeter  │
                       │  - Sliding Rate Limiter (5-120) │
                       │  - Anti-DDoS & IP Reputation    │
                       └────────────────┬────────────────┘
                                        │
                                        ▼  (Global ValidationPipe, Whitelist DTOs)
                       ┌─────────────────────────────────┐
                       │  Application Controller Domain  │
                       │  - Production Sandbox Guard     │
                       │  - PII Redaction Interceptor    │
                       │  - Standardized Envelope Guard  │
                       └────────────────┬────────────────┘
                                        │
                                        ▼  (Argon2id, AES-256-GCM, Parameterized SQL)
                       ┌─────────────────────────────────┐
                       │  Encrypted Persistence Layer    │
                       │  - SQLite / Prisma ORM Layer    │
                       │  - Encrypted Lead PII at Rest   │
                       └─────────────────────────────────┘
```

1. **Client / Browser (Untrusted)**: All incoming payloads are treated as hostile. Every body, query param, and header must be validated and sanitized before passing into service logic.
2. **Gateway Perimeter (Defensive)**: Protects against volumetric abuse, credential stuffing, and injection attacks using rate limiting, CORS whitelisting, and strict security headers.
3. **Application Domain (Zero Leakage)**: Isolates business logic, sanitizes internal exceptions, redacts logs, and blocks unauthorized sandbox bypasses.
4. **Persistence Layer (Encrypted at Rest)**: Sensitive contact information is encrypted using AES-256-GCM, and passwords/OTPs are stored strictly as memory-hard Argon2id hashes.

---

## 1. Production Sandbox Guard (Strict Non-Negotiable Invariant)

Local development and testing configurations (`DEV_STATIC_OTP`, `EMAIL_PROVIDER=console`, `DEV_CONSOLE_OTP_FALLBACK`) are strictly for local isolated debugging:

- **Production Rejection Rule**: When `NODE_ENV=production`, any presence or submission of `DEV_STATIC_OTP` or attempt to invoke console fallback is strictly forbidden by the security guard.
- **Enforcement**:
  - The request is immediately aborted with HTTP `403 Forbidden`.
  - The attempt is flagged as an intrusion anomaly and recorded in the audit log with IP address hash and timestamp.
  - Under no circumstances may a static dev OTP be accepted as valid in production.

---

## 2. Zero PII Logging & Redaction Standard

Server logs must maintain complete PII hygiene to comply with institutional fiduciary standards, GDPR, and Swiss banking secrecy expectations:

- **Redaction Rules**:
  - `passphrase` / `password`: Replaced with `[REDACTED]`.
  - `otpCode` / `code`: Replaced with `[REDACTED]`.
  - `authorization` / `token` / `refreshToken`: Replaced with `[BEARER_REDACTED]`.
  - `email` / `workEmail`: Masked to show only domain or sanitized initial (`a***@domain.com`).
  - `telegram` / phone numbers: Replaced with `[ENCRYPTED_PII]`.
  - Full names: Replaced with initials or `[REDACTED]`.
- All emitted console logs, file logs, and external APM telemetry must pass through the `PiiRedactionInterceptor` and custom sanitized logger.

---

## 3. Cryptographic Hygiene & Parameter Specifications

### Password & OTP Hashing (Argon2id)
- Passwords and OTP challenge codes must be hashed using Argon2id with memory-hard parameters:
  - `type`: `argon2id`
  - `memoryCost`: `65536` (64 MB RAM allocation per hash)
  - `timeCost`: `3` iterations
  - `parallelism`: `4` threads
- Verification must use constant-time comparison to prevent timing attacks.

### Field-Level Encryption at Rest (AES-256-GCM)
- Sensitive institutional lead fields (`workEmail`, `telegram`, phone) must be encrypted before writing to the database:
  - Algorithm: AES-256-GCM
  - Key: 256-bit cryptographically random key (`FIELD_ENCRYPTION_KEY`)
  - IV: Cryptographically random 12-byte initialization vector generated per encryption operation
  - Auth Tag: 16-byte authentication tag ensuring ciphertext integrity
  - Stored format: `${ivHex}:${authTagHex}:${cipherTextHex}`
  - Blind Indexing: A separate HMAC-SHA256 hash (`workEmailHash`) is stored for fast, deterministic lookups without decrypting all rows.

### Cryptographic OTP Generation
- Generated using cryptographically secure random integers: `crypto.randomInt(100000, 1000000)`.
- Stored exclusively as an Argon2id hash with a strict 5-minute time-to-live (TTL).
- Rate-limited verification: Maximum 3 failed attempts before the challenge record is permanently consumed/invalidated.

### Session Security & Tokens
- Access Tokens: Short-lived JWT (15-minute TTL) signed using Ed25519 or HMAC-SHA256 with a 64-character secret.
- Refresh Tokens: Long-lived (7-day TTL) stored in encrypted form, delivered via `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- Dashboard Exchange Ticket: Cryptographically random one-time token (`crypto.randomBytes(32).toString('hex')`) with a 60-second lifespan, single-use, burned immediately upon redemption by `user-dashboard`.

---

## 4. Input Sanitization & Injection Defense

- **Global ValidationPipe**:
  - Enforced globally on all incoming requests with `whitelist: true` and `forbidNonWhitelisted: true`.
  - Unknown properties cause immediate HTTP `400 Bad Request` rejection.
- **SQL Injection Prevention**:
  - All database interactions must use Prisma ORM parameterized queries. Raw string concatenation in database queries is strictly forbidden.
- **Corporate Domain Verification**:
  - Mandatory check on `/api/v1/leads/inquire` blocking known disposable, temporary, or burner email domains (e.g. Mailinator, GuerillaMail, TempMail).
- **Anti-Spam Honeypots**:
  - Hidden form fields and timing thresholds to detect automated bot submissions without adding friction to legitimate institutional allocators.

---

## 5. Adaptive Rate Limiting & Anti-DDoS

Powered by `@nestjs/throttler` with a sliding window:
- **General Public Endpoints** (telemetry, simulation, health): 120 requests per 60-second window.
- **Sensitive Endpoints** (auth initiate, OTP verify, lead inquiries, newsletter subscription): Strict limit of 5 requests per 60-second window per IP.
- **Brute-Force Lockout**: Repeated failures trigger exponential backoff lockouts (e.g., 15-minute block after 5 failed password attempts).

---

## 6. Content Security & Security Headers (Helmet)

All responses must include hardened HTTP security headers:
- `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options`: `nosniff`
- `X-Frame-Options`: `DENY`
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `Content-Security-Policy`:
  - `default-src 'self'`
  - `script-src 'self'`
  - `connect-src 'self' http://localhost:4000 http://localhost:5173 http://localhost:5174 https://api.wavyassets.com wss://api.wavyassets.com https://dashboard.wavyassets.com https://api.coingecko.com`
  - `frame-ancestors 'none'`

---

## 7. Non-Negotiable Security Invariants

1. **Zero Secret Leaks**: No API keys, JWT secrets, database credentials, or private encryption keys may be committed to version control.
2. **Production Sandbox Prohibition**: In `NODE_ENV=production`, `DEV_STATIC_OTP` is unconditionally rejected with HTTP 403.
3. **No Plaintext Sensitive Data**: Passwords and OTPs must always be Argon2id hashed; lead PII must always be AES-256-GCM encrypted.
4. **Zero Error Stack Leaks**: Error responses must never expose stack traces, database error messages, or internal infrastructure details.
5. **Mandatory Testing of Security Boundaries**: Vitest integration tests must explicitly assert that rate limiting, sandbox guard rejection, password hashing, and encryption operate correctly before code is merged.
