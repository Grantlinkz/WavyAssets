# Security Context — WavyAssets Sovereign Institutional User Dashboard

## Threat Model & Trust Boundaries

- **Client / Browser (Untrusted Boundary)**: The dashboard runs entirely in the user's browser. It must never store backend admin keys, private wallet seed phrases, or unredacted infrastructure credentials.
- **Client Storage Invariant**: `localStorage` and `sessionStorage` are strictly restricted to non-sensitive presentation preferences (`wavy_theme`, `wavy_dashboard_sidebar_collapsed`, `wavy_locale`). Access tokens live exclusively in volatile memory (`useAuthStore`). Refresh tokens are secured in `HttpOnly; SameSite=Strict; Secure` cookies.
- **Input Boundaries**: All form inputs (deposit amounts, withdrawal addresses, order limits, KYC uploads) are untrusted and must be rigorously validated and sanitized before dispatching to the API.

---

## Authentication & Session Lifecycle

1. **Handoff Ticket Protocol**:
   - Single-use, deterministic HMAC-SHA256 ticket passed from `Frontend/landing-page` via `/auth/callback?ticket=<handoffTicket>`.
   - The ticket is immediately consumed via `POST /api/v1/auth/exchange-ticket` and burned by the backend.
   - The backend returns a short-lived access JWT (15-minute expiry) and sets an HttpOnly refresh cookie.
2. **Auto-Purge on Inactivity / Logout**:
   - Explicit logout or session expiration immediately clears all user entity data and access tokens from `useAuthStore` and redirects to the landing page.

---

## Zero-Trust Ergonomics & Privacy Controls

1. **One-Click Privacy Eyeball (`maskBalances`)**:
   - Accessible via the persistent Universal Command Bar.
   - Instantly converts all monetary values, account balances, and asset holdings into masked bullets (`••••••••`) to protect client confidentiality in public or shared terminal environments.
2. **Biometric & WebAuthn / FIDO2 Triggers**:
   - Hardware keys (YubiKey) or biometric sensors (Touch ID / Face ID) are required via WebAuthn for high-risk actions:
     - Revealing physical/virtual card CVV and PIN in the VIP Cards module.
     - Submitting withdrawal requests exceeding standard session thresholds.
     - Authorizing emergency circuit breaker freezes in AI Systematic Funds.
3. **Inviolable 24-to-48 Hour Whitelist Address Lock**:
   - Any newly registered external cryptocurrency withdrawal address is subjected to a mandatory 24–48 hour lock period.
   - No capital transfers may be executed to that address until the lock period expires and multi-factor re-confirmation is completed.
4. **Active Session Management**:
   - Security Command Center displays all active browser sessions, IP origins, and device signatures, with 1-click instant remote revocation.

---

## Content Security & Environment Boundaries

- **Environment Variables**:
  - Only `VITE_` prefixed public variables are accessible in the client bundle.
  - Never commit `.env` or `.env.local` files to source control.
- **Content Security Policy (CSP)**:
  - Script execution restricted strictly to self.
  - WebGL context creation and inline shader compilation permitted strictly for Three.js.
  - Connect-src restricted to backend API and WebSocket endpoints (`localhost:4000`, production enclave origins).

---

## Security Pre-Commit Rules

Before committing, submitting changes, or pushing to remote:

1. **Error Handling & Logging**: Verify that all new pathways have comprehensive error handling and secure, redacted logging.
2. **Automated Secret Scanning**: Verify no secrets, credentials, or `.env` files are staged.
3. **Static Security Checks**: Verify no unescaped user inputs (XSS risk) or insecure direct object references exist in the changeset.

---

## Non-Negotiable Security Invariants

1. **Zero Secret Leaks**: No institutional private keys, API secrets, or backend tokens may exist in the codebase, client bundles, or repository commit history.
2. **No Persistent Sensitive State**: Sensitive auth tokens and credentials must never be written to `localStorage`.
3. **PII Redaction**: All telemetry and console logging must redact email addresses, IP addresses, card PINs, and OTP codes.
4. **Secure Error Shielding**: Unhandled exceptions caught by Error Boundaries or API catch blocks must display generic institutional failure messages without exposing stack traces or system paths.
5. **Secure Error Handling**: Client responses must never leak stack traces, internal errors, or infrastructure details.
6. **Secure Logging**: All emitted logs must redact PII, authorization tokens, secrets, and private credentials.
