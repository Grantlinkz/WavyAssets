# Project Overview — WavyAssets Frontend Admin Command Deck

**Target Subsystem**: `Frontend/admin-panel`  
**Port**: `5175`  
**Mandatory Git Branch**: `frontend-admin-panel`  
**Operational Target**: Air-gapped sovereign administration deck with sub-50ms interaction SLA  
**Visual & UI Reference**: [`tools/UI/`](../tools/UI/) & [`tools/UI/institutional_vault_capital/DESIGN.md`](../tools/UI/institutional_vault_capital/DESIGN.md)  
**Official Branding**: [`Frontend/landing-page/src/components/common/BrandLogo.tsx`](../../landing-page/src/components/common/BrandLogo.tsx) & [`Frontend/landing-page/public/favicon.svg`](../../landing-page/public/favicon.svg)  

---

## 1. System Mission

The **WavyAssets Frontend Admin Command Deck** is an institutional-grade, high-density operations center engineered for rapid triage, zero-error execution, and decisive governance across all 7 asset verticals. It replaces fragmented back-office tools with a unified sovereign terminal for managing clients, compliance, treasury clearances, global deposit rails, and VIP card minting.

---

## 2. Target Operator Personas & Viewport Mapping

| Operator Persona | Primary Viewport | Key Operational Actions |
| :--- | :--- | :--- |
| **Treasury Officer** | `/treasury`, `/deposit-rails` | Wire clears, crypto deposit credits, dual-sign-off withdrawals, IBAN/BIC editing. |
| **Compliance Officer** | `/compliance`, `/audit` | FINMA AMLA tier review, split-screen passport/corporate inspection, 1-click tier elevation. |
| **Executive Concierge** | `/vip-cards` | Obsidian metal card minting, 3D card preview, spending limits slider, 1-click lock/unlock. |
| **Client Desk Lead** | `/inquiries`, `/users` | Decrypted lead review, convert lead to user, balance inspection, direct funding. |
| **Super Admin** | Universal (`TopBar`) | Platform kill-switch modal, RBAC management, global audit diff inspection. |

---

## 3. Scope Definition

### In scope
- **Official Institutional Branding**: Integration of official `BrandLogo` (Vault Squircle, Gold `#D4AF37` / Emerald `#00C288` dual sinusoidal wave, apex spark, and pulsing `#00C288` `SECURED` badge) and official `favicon.svg`.
- **Executive Top Bar & Command Bar**: Operator identity, role badge (`SUPER_ADMIN`, `TREASURY_OFFICER`, etc.), live WebSocket sync heartbeat ("Live Sync: 18ms", `#06B6D4`), urgent ticker banner, emergency platform kill-switch button, and `Cmd+K` global search.
- **Executive Overview & Telemetry Deck (`/` or `/overview`)**: Primary 4-metric grid (Total Vault Balance, Liquid Settlement Capital, Action Queue, 24h Net Settlement), live shard telemetry (14ms RTT), and real-time settlement ledger table.
- **Mandate Inquiries Feed (`/inquiries`)**: Chronological `LeadInquiry` inbox, decrypted work emails and telegram handles, corporate domain trust scores, workflow stage transitions (`NEW`, `IN_REVIEW`, `MANDATE_ISSUED`, `ARCHIVED`), and slide-over `LeadDetailDrawer` with 1-click client conversion.
- **User & Ledger Directory (`/users`)**: Searchable sovereign directory with segregated `AVAILABLE_CASH` vs `INVESTED_CAPITAL`, `CreateUserModal`, `SuspendUserModal` (kill-switch), and `DirectFundingModal` with mandatory audit justifications.
- **KYC & AML Compliance Queue (`/compliance`)**: Pending verification dossiers, split-screen document inspector (passports, certificates of incorporation), FINMA AML checklist, and 1-click tier approval engine (`TIER_1` to `INSTITUTIONAL`).
- **Treasury Operations Hub (`/treasury`)**: Inbound wire/crypto deposits matching with proof receipt viewer and 1-click balance credit; outbound withdrawals with FINMA AMLA Article 14 dual-sign-off card.
- **Global Deposit Rail Command (`/deposit-rails`)**: Dynamic forms for Swiss IBAN, BIC/SWIFT, Memo format, and crypto MPC vault matrix with real-time broadcast and live sync testing against client `DepositModal.tsx`.
- **Obsidian VIP Cards (`/vip-cards`)**: Issued cards catalog, 3D card minting modal with real-time preview, spend limit slider ($10k - $500k), and instant 1-click lock/unlock toggle syncing with client `ObsidianMetalCard`.
- **Emergency Platform Freeze (`/emergency-freeze` / Modal)**: Dual-key platform freeze modal halting system-wide deposits, withdrawals, trading, and VIP card operations with mandatory reason logging.
- **Immutable Audit Trail (`/audit`)**: Filterable event log with side-by-side JSON before/after diff inspector (`DiffModal`).
- **Rigid Skeleton Loaders**: Standardized `.wavy-skeleton` shimmer loaders with exact column widths and 540px minimum container height for zero CLS.

### Out of scope
- Automated straight-through processing for withdrawals $> \$100,000$ USD (dual human sign-off is mandatory per FINMA AMLA Article 14).
- Plaintext storage or display of full card PINs or CVVs.
- Hardcoded static mock data or fake fallback arrays.
- Public retail marketing / unauthenticated registration views (handled exclusively by `Frontend/landing-page`).
- Retail trading and order placement views (handled exclusively by `Frontend/user-dashboard`).

---

## 4. Input Sanitization & Injection Defense

- **Schema Validation via React Hook Form & Zod**: Validate all forms client-side (`CreateUserModal`, `DirectFundingModal`, `FiatRailForm`, `EmergencyFreezeModal`) before dispatch.
- **XSS & Content Injection Prevention**: Render all dynamic strings through standard React JSX text nodes with automatic context-aware escaping. Never use `dangerouslySetInnerHTML`.
- **Financial Input Clamping**: Enforce positive numeric boundaries ($>0$) without exponential formatting.
- **IBAN & Address Sanitization**: Validate regex patterns (`^CH[0-9]{2}[0-9A-Z]{17}$` for Swiss IBANs, valid crypto address checksums) and strip whitespace.

---

## 5. Non-Negotiable Invariants

1. **Mandatory Branch Commitment**: Always commit on `frontend-admin-panel`.
2. **Zero Static / Fallback Data**: No mock records; live backend data only.
3. **Sub-50ms Interaction SLA**: Local filtering and tab switching must execute $<50$ms.
4. **Zero Cumulative Layout Shift (CLS = 0.00)**: Pre-dimensioned rigid skeleton tables (`min-height: 540px`) with `.wavy-skeleton` shimmer animation.
5. **Official Institutional Branding**: Strict integration of official `BrandLogo` and `favicon.svg`.
6. **Obsidian Dark & Micro-Chamfer Token System**: Micro-chamfer 4px (`rounded-DEFAULT` / `rounded-[4px]`, strictly no round pill buttons $>8\text{px}$) per `tools/UI/institutional_vault_capital/DESIGN.md`.
7. **Tabular Lining Figures**: Monospace numbers (`font-mono tabular-nums` with OpenType flags `'tnum' on, 'zero' on, 'cv01' on`) across all financial amounts, hashes, and dates.
8. **High Information Density Layout**: Compact table rows (`36px` to `40px` height) with alternating transparent and `#0C101A` backgrounds.
9. **Role-Based Access Control Masking**: Operators only see action buttons authorized for their role.
10. **Real-Time Cross-Deck Synchronization**: Live Socket.IO event listener for instant updates across admin and client viewports.
