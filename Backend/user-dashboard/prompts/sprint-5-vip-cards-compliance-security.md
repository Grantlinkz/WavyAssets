# Implementation Prompt — Sprint 5: VIP Cards, Compliance Dossiers & 48-Hour Security Time-Lock

**Target Sprint:** Sprint 5  
**Architecture Reference:** [`tools/IMPLEMENTATION_STRATEGY.md`](tools/IMPLEMENTATION_STRATEGY.md) (Sections 5.6, 6.1, 6.2, 6.3)  
**System Governance:** [`GEMINI.md`](GEMINI.md)  
**UI Contract Reference:** [`.ai/ui-context.md`](.ai/ui-context.md)  

---

## 1. Objectives & Deliverables

1. **VIP & Metal Membership Cards Engine (`src/modules/vip-cards/`)**:
   - `vip-cards.controller.ts`, `vip-cards.service.ts`, `dto/vip-cards.dto.ts`, `vip-cards.module.ts`:
     - `GET /api/v1/vip-cards/status`: Active card status, tier badge (`SILVER`, `OBSIDIAN`, `BLACK`), spending limits, and net-worth/AUM tier progression metrics.
     - `PATCH /api/v1/vip-cards/controls`: Toggle card freeze (`isFrozen`), card type (`PHYSICAL` vs `VIRTUAL`), and customize daily spend limits within tier boundaries.
     - `POST /api/v1/vip-cards/reveal-sensitive`: Ephemeral 60-second CVV & PIN generation protected by WebAuthn/2FA verification and on-demand AES-256-GCM PIN decryption.
     - `GET /api/v1/vip-cards/privileges`: Dynamic fee schedule (0% maker fees, 0% FX margin, private equity drop priority, lounge access).
     - `GET /api/v1/vip-cards/shipping-tracker`: Physical metal card courier dispatch tracking (FedEx/DHL tracking, transit milestones).
     - `POST /api/v1/vip-cards/concierge`: Authenticated ticket dispatcher to dedicated private banker / concierge officer.

2. **Tiered KYC & Compliance Dossier Engine (`src/modules/compliance/`)**:
   - `compliance.controller.ts`, `compliance.service.ts`, `dto/compliance.dto.ts`, `compliance.module.ts`:
     - `GET /api/v1/compliance/status`: Current KYC tier (`TIER_1`, `TIER_2`, `TIER_3`), daily volume caps ($10k / $250k / Unlimited), verification checklist.
     - `POST /api/v1/compliance/dossier-upload`: Encrypted compliance document upload with virus scanning mock, metadata validation, and audit logging.
     - `POST /api/v1/compliance/upgrade-tier`: Evaluation and submission for higher KYC tier validation based on required uploaded document criteria.
     - `GET /api/v1/compliance/tax/pack`: Annual consolidated Form 8949 / Schedule D compatible tax bundle generator with capital gains, rental yields, compute yield, and CSV/JSON output.
     - `GET /api/v1/compliance/audit-logs`: Paginated user audit trail for regulatory compliance inspection.

3. **Security Command Center & 48-Hour Time-Lock (`src/modules/security/`)**:
   - `security.controller.ts`, `security.service.ts`, `dto/security.dto.ts`, `security.module.ts`:
     - `GET /api/v1/security/sessions`: Active sessions list with IP address, user-agent, creation date, and current session indicator.
     - `DELETE /api/v1/security/sessions/:id`: Instant single session revocation.
     - `POST /api/v1/security/sessions/revoke-others`: Instant atomic revocation of all concurrent sessions except caller.
     - `POST /api/v1/security/webauthn/register-challenge` & `POST /api/v1/security/webauthn/register-verify`: FIDO2 / WebAuthn registration ceremony.
     - `POST /api/v1/security/webauthn/auth-challenge` & `POST /api/v1/security/webauthn/auth-verify`: Hardware assertion step-up challenge and verification.
     - `GET /api/v1/security/webauthn/credentials` & `DELETE /api/v1/security/webauthn/credentials/:id`: Key management.
     - `GET /api/v1/security/whitelist-destinations`: Whitelist address management with real-time countdown to 48-hour time-lock expiry.
     - `POST /api/v1/security/whitelist-destinations`: Registers new crypto address or bank wire IBAN into mandatory `QUARANTINE` status with deterministic `NOW() + 48h` time-lock and multi-sig requirement.
     - `POST /api/v1/security/whitelist-destinations/:id/sign`: Hardware key co-signing for quarantined destinations. Inviolably enforces that destinations cannot be active before `quarantineUntil` elapses.
     - `DELETE /api/v1/security/whitelist-destinations/:id`: Immediate revocation / cancellation of quarantined or active destinations.

4. **Integration with Core Ecosystem**:
   - Wire `VipCardsModule`, `ComplianceModule`, and `SecurityModule` into `app.module.ts`.
   - Ensure all endpoints are protected by `JwtAuthGuard` and class-validator DTOs with strict validation.
   - Enforce RFC 7807 error envelopes and semantic exceptions (`QuarantineTimeLockException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `BadRequestException`).
   - Redacted logging of all PII and sensitive credentials.

5. **Automated Unit & Integration Test Suites**:
   - Unit tests covering tier progression math, AES-256 PIN decryption, ephemeral CVV generation, 48-hour time-lock state machine, WebAuthn ceremonies, session revocation, and tax pack math.
   - Integration tests verifying REST endpoints across `/api/v1/vip-cards`, `/api/v1/compliance`, and `/api/v1/security`.

---

## 2. Invariants & Acceptance Criteria

- Inviolable 48-Hour Time-Lock Invariant: Any destination registered must have `status === 'QUARANTINE'` and `quarantineUntil = NOW() + 48h`. Even with multi-signatures completed, destination cannot be used for withdrawal until `NOW() >= quarantineUntil`.
- Plaintext Secret Invariant: PINs must be encrypted via AES-256-GCM. CVVs must never be stored in the database; ephemeral CVVs expire in 60 seconds.
- Session Isolation Invariant: Session revocation must ensure that revoked sessions cannot authenticate or be refreshed.
- Zero Internal Diagnostic Leakage: Error responses must conform strictly to RFC 7807 and redact database traces or sensitive strings.
- Static type checking: `npx tsc --noEmit` must pass with 0 errors.
- Test coverage: All existing (153) and new unit & e2e tests (>25) must pass cleanly.
