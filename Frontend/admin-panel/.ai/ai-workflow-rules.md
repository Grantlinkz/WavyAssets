# AI Workflow Rules & Sprint Execution — WavyAssets Frontend Admin Command Deck

**Subsystem**: `Frontend/admin-panel`  
**Mandatory Git Branch**: `frontend-admin-panel`  

---

## 1. Scope Definition

### In scope
- **Official Institutional Branding**: Integration of official `BrandLogo` (Vault Squircle, Gold `#D4AF37` / Emerald `#00C288` dual sinusoidal wave, apex spark, and pulsing `#00C288` `SECURED` badge) and official `favicon.svg`.
- **Top Bar & Command Bar**: Operator identity, role badge, WebSocket sync indicator ("Live Sync: 18ms", `#06B6D4`), urgent ticker banner, emergency kill-switch, `Cmd+K` global search.
- **Executive Overview & Telemetry Deck (`/` or `/overview`)**: Primary 4-metric grid (Total Vault Balance, Liquid Settlement Capital, Action Queue, 24h Net Settlement), live shard telemetry (14ms RTT), and real-time settlement ledger table.
- **Mandate Inquiries Feed (`/inquiries`)**: Chronological lead inbox, decrypted work emails, corporate domain trust scores, workflow stages, and slide-over `LeadDetailDrawer` with 1-click lead conversion.
- **User Directory & Ledger Governance (`/users`)**: Searchable directory, balance breakdown (`AVAILABLE_CASH` vs `INVESTED_CAPITAL`), `CreateUserModal`, `SuspendUserModal`, `DirectFundingModal`.
- **KYC & AML Compliance Queue (`/compliance`)**: Review queue, split-screen document preview, FINMA AML checklist, 1-click tier upgrade engine (`TIER_1` to `INSTITUTIONAL`).
- **Treasury Operations Hub (`/treasury`)**: Inbound wire matching with proof receipt viewer, outbound withdrawals with FINMA AMLA Article 14 dual-sign-off card.
- **Global Deposit Rail Command (`/deposit-rails`)**: Dynamic forms for Swiss IBAN, BIC/SWIFT, Memo format, and crypto MPC vault matrix with real-time broadcast and sync test with client `DepositModal.tsx`.
- **Obsidian VIP Cards (`/vip-cards`)**: Issued cards catalog, 3D card minting modal, spend limit slider ($10k - $500k), 1-click freeze/unfreeze toggle syncing with client `ObsidianMetalCard`.
- **Emergency Platform Freeze (`/emergency-freeze` / Modal)**: Dual-key platform freeze modal halting system-wide deposits, withdrawals, trading, and VIP card operations with mandatory reason logging.
- **Immutable Audit Trail (`/audit`)**: Historical audit log viewer with side-by-side JSON diff inspector (`DiffModal`).
- **Rigid Skeleton Loaders**: Standardized `.wavy-skeleton` shimmer loaders with exact column widths and 540px minimum container height for zero CLS.

### Out of scope
- Automated straight-through processing for withdrawals $> \$100,000$ USD (dual human sign-off is mandatory per FINMA AMLA Article 14).
- Plaintext storage or display of full card PINs or CVVs.
- Hardcoded static mock data or fake fallback arrays.
- Public retail marketing / unauthenticated registration views.
- Retail trading and order placement views.

---

## 2. Input Sanitization & Injection Defense

- **Schema Validation via React Hook Form & Zod**: Validate all forms client-side (`CreateUserModal`, `DirectFundingModal`, `FiatRailForm`, `EmergencyFreezeModal`) before dispatch.
- **XSS & Content Injection Prevention**: Render all dynamic strings through standard React JSX text nodes with automatic context-aware escaping. Never use `dangerouslySetInnerHTML`.
- **Financial Input Clamping**: Enforce positive numeric boundaries ($>0$) without exponential formatting.
- **IBAN & Address Sanitization**: Validate regex patterns (`^CH[0-9]{2}[0-9A-Z]{17}$` for Swiss IBANs, valid crypto address checksums) and strip whitespace.

---

## 3. Non-Negotiable Invariants

1. **Mandatory Branch Commitment**: Always commit on `frontend-admin-panel`.
2. **Zero Static / Fallback Data**: No mock records; live backend data only.
3. **Sub-50ms Interaction SLA**: Local filtering and tab switching must execute $<50$ms.
4. **Zero Cumulative Layout Shift (CLS = 0.00)**: Pre-dimensioned rigid skeleton tables (`min-height: 540px`) with `.wavy-skeleton` shimmer animation.
5. **Official Institutional Branding**: Header and root document must use official `BrandLogo` and `favicon.svg`.
6. **Obsidian Dark & Micro-Chamfer Token System**: Micro-chamfer 4px (`rounded-DEFAULT` / `rounded-[4px]`, strictly no round pill buttons $>8\text{px}$) per `tools/UI/institutional_vault_capital/DESIGN.md`.
7. **Tabular Lining Figures**: Monospace numbers (`font-mono tabular-nums` with OpenType flags `'tnum' on, 'zero' on, 'cv01' on`) across all financial amounts, hashes, and dates.
8. **Role-Based Access Control Masking**: Operators only see action buttons authorized for their role.
9. **Real-Time Cross-Deck Synchronization**: Live Socket.IO event listener for instant updates across admin and client command decks.

---

## 4. 4-Sprint Implementation Roadmap

- **Sprint 1: Deck Foundation, Admin Auth & Mandate Intake**
  - Setup Vite + React 19 + Tailwind CSS v4 design tokens.
  - Build persistent `TopBar` and `AdminSidebar` navigation components.
  - Implement `useAdminAuthStore` and login gateway with role badge attribution.
  - Build the Mandate Inquiries feed (`/inquiries`) with decrypted lead data and `LeadDetailDrawer`.

- **Sprint 2: User Directory & KYC Compliance Deck**
  - Build the User & Ledger Directory (`/users`) with search, filter, and balance breakdown.
  - Implement `CreateUserModal`, `SuspendUserModal`, and `DirectFundingModal` with mandatory audit justifications.
  - Build the KYC & AML review deck (`/compliance`) with side-by-side document inspection and 1-click tier upgrade engine.

- **Sprint 3: Treasury Operations Hub & Global Deposit Rails**
  - Implement Treasury Deposits view with wire memo matching and 1-click credit.
  - Implement Treasury Withdrawals view with FINMA AMLA Article 14 dual-sign-off modal.
  - Build the Global Deposit Rail configuration interface (`/deposit-rails`) with live sync testing against client `DepositModal.tsx`.

- **Sprint 4: VIP Card Minting, Audit Log & Hardening**
  - Build the Obsidian VIP Card minting engine (`/vip-cards`) with visual card preview.
  - Wire up the instant 1-click Lock / Unlock toggle switch and test real-time WebSocket sync to the client `ObsidianMetalCard`.
  - Implement the Immutable Audit Log viewer (`/audit`) with JSON diff comparison modal.
  - Execute full Vitest component test suites and verify sub-50ms SLA and zero CLS.

---

## 5. Execution, Progress & Reporting Protocol

- **Prompt Protocol**: Draft `prompts/<sprint>-<unit>.md` and obtain user approval before executing code.
- **Git Branch Directives**: All work must strictly be committed on **`frontend-admin-panel`**. Minimum 2 commits per unit. Conventional commit prefixes (`feat:`, `fix:`, `refactor:`, `docs:`, `tests:`, `chore:`).
- **Update Progress & Docs**:
  - Update `.ai/progress-tracker.md` after every phase or step.
  - Keep documentation in `.ai/` in strict lockstep with component code.
- **Deliver Report**: After completing any sprint, unit, or operational task, deliver a comprehensive structured report to the user summarizing:
  - Architectural components built and modified.
  - Verification output (typecheck, lint, automated test results).
  - Live API contracts and security validations.
  - Next milestone recommendations.
