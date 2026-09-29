# Security Architecture & Threat Model — WavyAssets Backend Admin Panel

**Subsystem**: `Backend/admin-panel`  
**Mandatory Git Branch**: `backend-admin-panel`  

---

## 1. Threat Model & Security Boundaries

The Admin Panel operates as the most privileged interface in the WavyAssets infrastructure. Any compromise poses systemic risk to institutional assets and compliance status.

### Core Threat Vectors Mitigated:
1. **Rogue Administrative Withdrawal**: Mitigated by FINMA AMLA Article 14 dual-sign-off engine. No single administrator can settle withdrawals exceeding $100,000 USD.
2. **Credential Stuffing & Brute Force**: Mitigated by Argon2id password hashing, mandatory TOTP 2FA, and sliding window rate limiting.
3. **Session Hijacking**: Short-lived (15-min) JWT access tokens paired with deterministic HMAC-SHA256 hashed refresh tokens stored in HttpOnly, Secure, SameSite=Strict cookies.
4. **Data Exfiltration / Insider Threat**: Lead PII (work email, phone, telegram) is encrypted at rest using AES-256-GCM. Plaintext is only provided to authorized operators during active review.
5. **Card Data Leakage (PCI-DSS Level 1)**: Metal card PINs are encrypted via AES-256-GCM; CVVs are strictly ephemeral and never persisted in database or logs.
6. **System-Wide Anomaly / Operational Emergency**: Mitigated by the Super Admin emergency platform freeze kill-switch (`POST /api/v1/admin/emergency/freeze`). Dual-key execution halts all deposits, withdrawals, trading, and VIP card operations in real time, broadcasting `platform:emergency_freeze`.

---

## 2. FINMA AMLA Article 14 Dual Sign-Off Engine

- Automated straight-through processing (STP) for withdrawals $> \$100,000$ USD is prohibited by design.
- The `TreasurySignOff` model stores:
  - `withdrawalId`: ID of the pending withdrawal.
  - `officerId`: Admin ID of the signing officer.
  - `signedAt`: Cryptographic timestamp of sign-off.
- A withdrawal remains in state `PENDING_SECOND_SIGN_OFF` until a **second distinct** officer verifies destination rails, memo, and beneficiary before triggering payout settlement.

---

## 3. Cryptographic Invariants

- **Passwords**: Argon2id memory-hard parameters ($m=65536, t=3, p=4$).
- **PII Encryption**: AES-256-GCM with authenticated tags (`iv`, `encryptedData`, `authTag`).
- **Refresh Tokens & Tickets**: HMAC-SHA256 deterministic blind hashing.
- **Redacted Logging**: Interceptor automatically scrubs passwords, tokens, full names, email addresses, and account numbers.
