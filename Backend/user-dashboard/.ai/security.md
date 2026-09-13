# Security Context — WavyAssets Institutional Terminal

## Threat Model & Trust Boundaries

- **Client / Browser (Untrusted)**: The landing page runs entirely in the user's browser. It must never store backend credentials, admin secrets, private encryption keys, or institutional wallet seed phrases.
- **Client Storage Boundary**: `localStorage` and `sessionStorage` are strictly restricted to non-sensitive presentation preferences (`wavy_theme`, `wavy_locale`). User credentials, KYC tier choices, and OTP codes must **never** be persisted to web storage.
- **Input Boundaries**: Newsletter email inputs, registration forms, and 2FA OTP codes are untrusted user inputs that must be validated, length-capped, and sanitized before being processed or submitted.

---

## Authentication & Session Security (Landing Funnel)

- **2-Step Verification Integrity**: The root-mounted `UnifiedAuthModal` separates credential intake (Step 1) from the 6-digit one-time passcode (Step 2).
- **Auto-Clear on Dismiss**: When the modal is closed or canceled by the user, all entered credentials and OTP code state must be immediately wiped from the in-memory Zustand store.
- **Brute-Force & Rate-Limit Mocking**: The simulated OTP flow must enforce cooldown timers (e.g., 60-second resend delay) and error states after 3 failed attempts to reflect institutional security protocols.

---

## Content Security & Environment Boundaries

- **Environment Variables**:
  - Only `VITE_` prefixed public variables are allowed in the frontend.
  - Never commit `.env` or `.env.local` files to source control.
- **Content Security Policy (CSP)**:
  - Allow script execution only from self.
  - Allow WebGL context creation and inline shaders (`unsafe-eval` restricted strictly to WebGL shader compilation if required by Three.js).
  - Restrict font connections strictly to Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`).

---

## Input Validation & Sanitization

- **OTP Input**: Restrict the 6-digit OTP input strictly to numeric digits `[0-9]`, rejecting letters and special characters.
- **Email Sanitization**: Validate email format with standard RFC 5322 regex and sanitize against HTML injection before transmitting.
- **Slider Parameter Validation**: Bound the portfolio simulator slider values strictly between `$10,000` and `$10,000,000` to prevent buffer overflows or NaN calculation errors.

---

## Security Pre-Commit Rules

Before committing, submitting changes, or pushing to remote:

1. **Error Handling & Logging**: Verify that all new pathways have comprehensive error handling and secure, redacted logging.
2. **Automated Secret Scanning**: Verify no secrets, credentials, or `.env` files are staged.
3. **Static Security Checks**: Verify no unescaped user inputs (XSS risk) or insecure direct object references exist in the changeset.

---

## Non-Negotiable Security Invariants

1. **Zero Secret Leaks**: No institutional private keys, API secrets, or backend tokens may exist in the codebase, client bundles, or repository commit history.
2. **No Persistent Sensitive State**: Sensitive auth inputs (passwords, OTPs) must live exclusively in volatile component memory and be purged upon modal close.
3. **PII Redaction**: All telemetry and console logging must redact email addresses, IP addresses, and OTP codes.
4. **Secure Error Shielding**: Unhandled exceptions caught by Error Boundaries or math calculation catch blocks must display generic institutional failure messages without exposing stack traces or system paths.
5. **Secure Error Handling**: Client responses must never leak stack traces, internal errors, or infrastructure details. Handle exceptions or route to global handlers securely.
6. **Secure Logging**: All emitted logs must redact PII, authorization tokens, secrets, and private credentials.

