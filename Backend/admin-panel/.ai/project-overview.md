# Project Overview — WavyAssets Backend Admin Panel

**Target Subsystem**: `Backend/admin-panel`  
**Port**: `4002`  
**Mandatory Git Branch**: `backend-admin-panel`  
**Operational Target**: High-availability air-gapped sovereign administration deck  

---

**UI Blueprints Reference**: [`Frontend/admin-panel/tools/UI/`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/)  

---

## 1. System Mission

WavyAssets operates across 7 sovereign asset verticals (Crypto, Equities, AI Funds, Real Estate, VIP Cards, Exotic Cars, Custodial Wallet). The **Backend Admin Panel** provides administrative operators with the critical backend infrastructure to govern client accounts, verify AML/KYC compliance, manage liquidity and deposit rails, mint VIP metal cards, aggregate real-time telemetry metrics, and enforce emergency regulatory controls with sub-50ms latency.

---

## 2. Target Operator Personas

| Operator Persona | Primary Responsibilities | Core Pain Points Resolved |
| :--- | :--- | :--- |
| **Treasury Officer** | Inbound wire clears, crypto sweeps, dual-sign-off withdrawals. | Manual wire matching without memo validation; risk of misallocated funds or unapproved withdrawals. |
| **Compliance Officer** | FINMA AMLA tier limits, passport & corporate review, KYC elevation. | Decentralized document review; lack of one-click audit trails and automated tier synchronization. |
| **Executive Concierge** | VIP Obsidian metal card issuance, spending limits, freeze protocols. | Disconnected card governance; lack of real-time card minting and lock/unlock synchronization to client command decks. |
| **Client Desk Lead** | Intake mandate review, domain trust scoring, account lifecycle. | Fragmented lead intake; inability to fund client balances directly or suspend anomalous accounts. |
| **Super Admin** | Platform kill-switch, RBAC operator provisioning, system config. | Coarse permissions; lack of differential audit logging for privileged actions. |

---

## 3. Scope Definition

### In scope
- **Administrative RBAC & Session Gateway**: Multi-tenant admin authentication with Argon2id, TOTP 2FA, JWT access tokens, HttpOnly refresh cookies, and `RolesGuard`.
- **Executive Overview & Telemetry Metrics Aggregation (`/api/v1/admin/overview`)**: Total vault balance aggregation across 7 asset verticals ($142.8M+), liquid settlement capital ($28.4M+), action queue triage counters (unverified wires, KYC dossiers, withdrawals $> \$100\text{k}$), 24h net settlement, and real-time settlement ledger stream.
- **Institutional Mandate Ingestion & Lead Conversion (`/api/v1/admin/inquiries`)**: Ingesting `LeadInquiry`, AES-256-GCM field decryption for authorized desk operators, corporate trust scoring, workflow transitions (`NEW`, `IN_REVIEW`, `MANDATE_ISSUED`, `ARCHIVED`), and 1-click atomic conversion into active platform users.
- **User & Balance Governance (`/api/v1/admin/users`)**: Directory management, segregated `LedgerAccount` balance calculation (`AVAILABLE_CASH` and `INVESTED_CAPITAL`), instant kill-switch suspension, cascading deletion, and direct capital funding with atomic double-entry bookkeeping.
- **KYC & Compliance Queue (`/api/v1/admin/compliance`)**: FINMA AMLA tier elevation queue, secure signed document inspection URLs, and 1-click tier approvals.
- **Treasury Clearances & Dual Sign-Off (`/api/v1/admin/treasury`)**: Verification queue for incoming wires and crypto receipts with 1-click credit balance, and pending withdrawal settlements with FINMA AMLA Article 14 dual-sign-off engine.
- **Global Deposit Rail Configuration (`/api/v1/admin/deposit-rails`)**: Dynamic editable parameters for fiat bank wires (Swiss IBAN, BIC/SWIFT, Clearing rail, Memo format) and multi-network crypto MPC vault addresses with real-time WebSocket sync.
- **Obsidian VIP Card Minting & Governance (`/api/v1/admin/vip-cards`)**: Metal card minting engine, spend limit controls, and instant 1-click lock/unlock toggle syncing in real time with client viewports.
- **Emergency Platform Freeze & Kill-Switch Engine (`/api/v1/admin/emergency`)**: Super Admin dual-key authorization endpoints (`/freeze`, `/unfreeze`), system-wide transaction suspension middleware, mandatory written reason audit logging, and immediate real-time broadcast (`platform:emergency_freeze`).
- **Immutable Differential Audit Trail (`/api/v1/admin/audit`)**: Recording structured JSON before/after state diffs for all mutations in `AdminAuditLog`.

### Out of scope
- Automated straight-through processing for withdrawals $> \$100,000$ USD (prohibited by FINMA AMLA Article 14).
- Plaintext storage of PINs, CVVs, or passwords (prohibited by PCI-DSS Level 1).
- Public retail client registration and order execution.
- Static mock data or fallback arrays.

---

## 4. Input Sanitization & Injection Defense

- **DTO Validation & Ingress Whitelisting**: Every request payload is bound to class-validator DTOs through the global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`.
- **SQL / NoSQL Injection Defense**: All database queries execute via Prisma ORM parameterized queries; raw unsanitized SQL string concatenation is forbidden.
- **XSS & Content Sanitization**: Admin notes, justifications, and memo references are scrubbed of HTML tags and script injection characters.
- **Path Traversal Defense**: File access for KYC documents uses strictly validated UUIDs, rejecting relative path traversal tokens.
- **Financial Input Clamping**: Financial amounts are validated as positive numbers and parsed into Prisma `Decimal` types.

---

## 5. Non-Negotiable Invariants

1. **Mandatory Branch Commitment**: Always commit on `backend-admin-panel`.
2. **FINMA AMLA Article 14 Dual Sign-Off**: Withdrawals $> \$100,000$ strictly require two distinct officer approvals before capital settlement.
3. **Atomic Double-Entry Conservation**: $\sum \text{Debits} + \sum \text{Credits} = 0$ for all ledger adjustments.
4. **Emergency Platform Freeze & Kill-Switch**: The emergency freeze mechanism halts all mutating transactions immediately, requiring Super Admin dual-key confirmation.
5. **Zero Plaintext Secrets**: Argon2id for passphrases, AES-256-GCM for card PINs, ephemeral CVVs.
6. **Strict DTO Validation**: Global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`.
7. **Zero PII Logging**: Redact auth tokens, passphrases, emails, and account numbers.
8. **Sub-50ms SLA**: Low-latency queries and mutations.
