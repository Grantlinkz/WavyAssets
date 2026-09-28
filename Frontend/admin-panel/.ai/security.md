# Security Architecture & Operator Controls — WavyAssets Frontend Admin Command Deck

**Subsystem**: `Frontend/admin-panel`  
**Mandatory Git Branch**: `frontend-admin-panel`  

---

## 1. Role-Based Access Control (RBAC) & View Masking

The command deck strictly masks or disables unauthorized actions based on the authenticated operator's role:

- `SUPER_ADMIN`: All views, actions, direct funding, and emergency platform kill-switch modal (dual-key platform lockdown).
- `TREASURY_OFFICER`: Treasury deposits/withdrawals, dual-sign-off card, deposit rail configuration, direct balance funding.
- `COMPLIANCE_OFFICER`: KYC queue, document inspection, 1-click tier approval, audit trail viewer, account suspension.
- `CONCIERGE`: Obsidian VIP card minting, spending limit configuration, 1-click freeze/unfreeze toggle.
- `DESK_LEAD`: Mandate inquiries deck, decrypted lead telemetry, lead status workflow, user creation.

### 1.1 Emergency Platform Lockdown
- The `Emergency System Stop` button in the Top Bar triggers the `EmergencyFreezeModal`.
- Activation requires dual confirmation with a mandatory written operational justification.
- When active, the system displays the high-priority sovereign lockdown banner and disables all mutating financial forms across the platform.

---

## 2. Operator Session Handling & Token Storage

1. **Access Tokens**: Kept in-memory within Zustand `useAdminAuthStore`. Passed via `Authorization: Bearer <token>` in the Axios interceptor.
2. **Refresh Tokens**: Handled via browser `HttpOnly`, `SameSite=Strict`, `Secure` cookies by the backend.
3. **Session Invalidation**: If the API returns HTTP 401 Unauthorized, the client immediately resets local state and routes to `/login`.

---

## 3. Client-Side PII Hygiene

- Browser console logs must never print decrypted lead PII, raw passwords, or authorization tokens.
- Copying sensitive fields (IBAN, transaction hashes) uses a secure clipboard helper that clears memory after 30 seconds.
