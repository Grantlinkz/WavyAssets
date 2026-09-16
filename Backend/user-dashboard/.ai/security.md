# Security Context — WavyAssets Sovereign Backend User Dashboard

## Threat Model & Trust Boundaries

- **Client / Browser (Untrusted Ingress)**: All incoming HTTP requests and WebSocket connections originating from browsers are untrusted. All parameters, headers, query strings, and body payloads must pass strict DTO validation (`whitelist: true, forbidNonWhitelisted: true`).
- **Internal Microservices & Handoff**: Tickets passed from `Backend/landing-page` must be cryptographically verified using HMAC-SHA256 with a shared secret before granting access tokens.
- **Database Boundary**: Direct database access is restricted to the Prisma Client. All inputs are parameterized to eliminate SQL injection vulnerabilities.
- **Third-Party API Boundary**: External feeds (CoinGecko, Pyth, Hagerty, FedEx/DHL) are treated as unreliable and untrusted; responses are validated against schemas before being stored or processed.

---

## Cryptographic Hygiene & Zero Plaintext Secrets

1. **Passphrase Storage**: User passphrases must be hashed with **Argon2id** using memory-hard cost parameters (`memoryCost: 65536`, `timeCost: 3`, `parallelism: 4`). Plaintext passphrases are never saved or logged.
2. **Session & Refresh Token Hashing**: Refresh tokens and handoff tickets are hashed using **HMAC-SHA256** before storage. Database compromises cannot recover usable bearer tokens.
3. **Card Data & PII Encryption**: VIP Card CVVs, PINs, and sensitive user PII are encrypted at rest using **AES-256-GCM** with unique initialization vectors (IVs) and authentication tags. Encryption keys are injected via environment variables and never checked into source control.
4. **Hardware Key Attestation (WebAuthn / FIDO2)**: High-risk operations (CVV/PIN reveal, manual circuit breaker toggles, withdrawal destination creation, large-volume OTC orders) require WebAuthn FIDO2 attestation.

---

## Inviolable 48-Hour Withdrawal Whitelist Time-Lock

To protect institutional capital against session hijacking, insider threats, and credential theft:

1. **Mandatory Quarantine State**:
   - Any newly registered crypto withdrawal address or bank wire IBAN is automatically assigned `status = 'QUARANTINE'`.
   - `quarantineUntil` is calculated deterministically as `NOW() + 48 hours`.
2. **Query-Level Enforcement**:
   - The withdrawal processing service must enforce the time-lock at the database query level:
     ```typescript
     const destination = await prisma.whitelistDestination.findFirst({
       where: {
         id: destinationId,
         userId,
         status: 'ACTIVE',
         quarantineUntil: { lte: new Date() },
       },
     });
     if (!destination) {
       throw new QuarantineTimeLockException('Destination is quarantined or unverified.');
     }
     ```
3. **Multi-Signer Requirement**:
   - Time-lock release requires 2-of-2 hardware security key signatures (`signersCompleted >= signersRequired`).
4. **Emergency Cancellation**:
   - Users and security admins can instantly revoke (`status = 'REVOKED'`) any quarantined address during the 48-hour window without penalty.

---

## Content Security, Headers & Network Hardening

- **Helmet Integration**: Enforce secure HTTP response headers via `@fastify/helmet` or `helmet`:
  - `Content-Security-Policy`: Disallow inline scripts, block unauthorized frames (`frame-ancestors 'none'`).
  - `X-Frame-Options`: `DENY` to prevent clickjacking.
  - `X-Content-Type-Options`: `nosniff`.
  - `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload`.
- **CORS Lockdown**:
  - Restrict CORS origins strictly to authorized frontend origins (e.g. `http://localhost:5173`, `http://localhost:5174`, and production domain).
  - Restrict allowed methods to `GET, POST, PUT, PATCH, DELETE`.
  - Restrict allowed headers to `Authorization, Content-Type, X-Correlation-ID, X-Request-ID`.
- **Rate Limiting (`@nestjs/throttler`)**:
  - Public endpoints (`/api/v1/auth/*`): 10 requests per minute per IP.
  - Authenticated endpoints: 50 requests per second per user.
  - Sensitive operations (`/api/v1/vip-cards/reveal-sensitive`): 3 requests per 10 minutes.

---

## Error Shielding & Redacted Logging

1. **Zero Stack Trace Leaks**:
   - Under no circumstances may client responses leak stack traces, database schema, table names, or file paths.
   - All uncaught exceptions must be captured by `GlobalExceptionFilter` and converted into sanitized RFC 7807 responses.
2. **PII and Secret Redaction**:
   - All logs emitted by controllers, services, or interceptors must redact:
     - Bearer tokens, refresh tokens, handoff tickets.
     - Passwords and passphrases.
     - Card numbers, CVVs, and PINs.
     - Email addresses and full phone numbers.
     - Bank IBANs (mask all but the last 4 characters: `CH** **** **** **** 8492`).

---

## Pre-Commit Security Verification Checklist

Before committing or pushing any backend code:

1. **Secret Scanning**: Verify that no `.env`, private keys, or credentials are staged.
2. **Error Boundary Verification**: Confirm that all new service methods throw semantic NestJS exceptions and that `GlobalExceptionFilter` covers all execution paths.
3. **Redacted Logging Check**: Verify that newly added logs do not expose sensitive tokens or PII.
4. **Database Query Review**: Ensure all Prisma queries are parameterized and that multi-record updates use `$transaction`.
5. **Time-Lock Invariant Check**: Ensure no withdrawal pathway bypasses the 48-hour quarantine verification.
