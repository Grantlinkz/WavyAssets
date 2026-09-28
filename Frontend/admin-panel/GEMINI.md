# System Governance & Execution Directives — WavyAssets Sovereign Frontend Admin Command Deck

This document (`GEMINI.md`) defines the authoritative AI agent governance, architectural invariants, code quality standards, and mandatory execution rules for the **WavyAssets Frontend Admin Panel** (`Frontend/admin-panel`).

All AI agents and engineers operating within this repository must strictly adhere to the guidelines set forth herein.

---

## 1. Mandatory Git Branch Isolation

> [!IMPORTANT]
> **Branch Rule**: All development, UI components, state stores, bug fixes, and documentation for `Frontend/admin-panel` must strictly be committed on the **`frontend-admin-panel`** branch.
> 
> ```bash
> # Always verify active branch before committing
> git checkout frontend-admin-panel
> git status
> ```
> Never commit frontend admin panel changes directly to `main` or `backend-admin-panel`.

---

## 2. Inviolable Rule: Zero Static Values & Zero Mock Fallbacks

> [!CAUTION]
> **Simultaneous Implementation Invariant**:
> Both the frontend (`Frontend/admin-panel`) and backend (`Backend/admin-panel`) are implemented simultaneously using **Antigravity IDE -> Duplicate Workspace**.
> 
> **Under NO CIRCUMSTANCES should static mock arrays, fake user lists, hardcoded transactions, or fallback data structures be authored into `Frontend/admin-panel`**.
> 
> - All components must wire directly to live REST endpoints via TanStack Query v5 at `http://localhost:4002/api/v1` and WebSocket at `http://localhost:4002/ws/admin`.
> - During pending async requests, render rigid, pre-dimensioned skeleton loaders (`min-height: 540px`).
> - During network failure, display semantic error states with retry actions; never fall back to fake in-memory data.

---

## 3. Scope Definition

### In scope
- **Official Institutional Branding**: Integration of official `BrandLogo` (Obsidian Squircle, dual sinusoidal wave in Gold `#D4AF37` and Emerald `#00C288`, apex spark, and pulsing `#00C288` `SECURED` badge) and official `favicon.svg`.
- **Executive Top Bar & Command Bar**: Operator identity, role badge (`SUPER_ADMIN`, `TREASURY_OFFICER`, etc.), live WebSocket sync heartbeat ("Live Sync: 18ms", `#06B6D4`), urgent ticker banner, emergency platform kill-switch button, and `Cmd+K` global search.
- **Executive Overview & Telemetry Deck (`/` or `/overview`)**: Primary 4-metric grid (Total Vault Balance, Liquid Settlement Capital, Action Queue, 24h Net Settlement), live shard telemetry (14ms RTT), and real-time settlement ledger table.
- **Mandate Inquiries Feed (`/inquiries`)**: Chronological `LeadInquiry` inbox, decrypted work emails and telegram handles, corporate domain trust scores, workflow stage transitions (`NEW`, `IN_REVIEW`, `MANDATE_ISSUED`, `ARCHIVED`), and slide-over `LeadDetailDrawer` with 1-click lead conversion.
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

To prevent Cross-Site Scripting (XSS), script injection, and corrupted data payloads, the frontend strictly enforces multi-layer input defenses:

1. **Schema Validation via React Hook Form & Zod**:
   - Every input form (`CreateUserModal`, `DirectFundingModal`, `FiatRailForm`, `MintVipCardModal`, `EmergencyFreezeModal`) must be validated against a strict Zod schema before form submission.
   - Enforce type coercion, string trimming, positive decimal bounds, and length restrictions.
2. **XSS & Content Injection Prevention**:
   - Strict avoidance of `dangerouslySetInnerHTML`. User-generated and API-returned strings (lead company names, telegram handles, admin notes, memo references) must be rendered exclusively through standard React JSX text nodes, utilizing automatic context-aware escaping.
   - External links (e.g. company websites, block explorers) must use `rel="noopener noreferrer" target="_blank"` with validated HTTPS URLs.
3. **Financial Input Masking & Clamping**:
   - Currency inputs must clamp to positive decimal values ($>0$), format numeric amounts without exponential notation, and enforce maximum caps according to platform rules.
4. **IBAN & Cryptographic Address Sanitization**:
   - Swiss IBAN and crypto wallet inputs must sanitize whitespace, validate regex formats (e.g. `^CH[0-9]{2}[0-9A-Z]{17}$` for Swiss IBANs, standard hex / bech32 patterns for crypto), and reject invalid checksums before dispatching API mutations.

---

## 5. Application Building Context & Reading Sequence

Before writing any code, creating components, or making architectural decisions, read the following system context files in order:

1. [`.ai/agent.md`](.ai/agent.md) (and [`.ai/agents.md`](.ai/agents.md)) — AI agent persona (Principal Sovereign Frontend & Command Deck Architect), approved skills (`vitest`), prompt-planning protocol, and execution guardrails.
2. [`.ai/project-overview.md`](.ai/project-overview.md) — Product mission, sovereign command deck, 5 core operator personas, and high-density view modules.
3. [`.ai/architecture.md`](.ai/architecture.md) — React 19 + TypeScript + Vite architecture, component topology, Zustand 5 stores, TanStack Query v5, and Socket.IO real-time client.
4. [`.ai/code-standards.md`](.ai/code-standards.md) — React 19 standards, strict TypeScript typing, Tailwind CSS v4 design tokens, Radix UI primitives, tabular lining numbers, and rigid skeleton layouts (zero CLS).
5. [`.ai/security.md`](.ai/security.md) — Threat model, RBAC view masking, operator session handling, and Zero PII in client console/telemetry.
6. [`.ai/ai-workflow-rules.md`](.ai/ai-workflow-rules.md) — 4-Sprint implementation roadmap, simultaneous duplicate workspace protocol, and pre-commit verification checklist.
7. [`.ai/ui-context.md`](.ai/ui-context.md) — Live API contracts with `Backend/admin-panel` (:4002), client dashboard synchronization (`DepositModal.tsx` and `ObsidianMetalCard.tsx`), and strict NO STATIC/FALLBACK DATA directive.
8. [`.ai/progress-tracker.md`](.ai/progress-tracker.md) — Current sprint status, task checklists, and historical execution records.

Additionally, consult the authoritative design system, UI blueprints, and architectural blueprints:
- [`tools/UI/institutional_vault_capital/DESIGN.md`](tools/UI/institutional_vault_capital/DESIGN.md) — Master design system: color tokens, typography scales, elevation levels, buttons, status chips, tables, and modal specifications.
- [`tools/UI/`](tools/UI/) — 12 Google Stitch screen prototypes (`code.html` + `screen.png`) defining the visual, layout, and component benchmarks.
- [`Frontend/landing-page/src/components/common/BrandLogo.tsx`](../landing-page/src/components/common/BrandLogo.tsx) — Official WavyAssets institutional brand logo component.
- [`Frontend/landing-page/public/favicon.svg`](../landing-page/public/favicon.svg) — Official WavyAssets favicon asset.
- [`tools/STITCH_UI_PROMPTS.md`](tools/STITCH_UI_PROMPTS.md) — Detailed UI design prompts and layout requirements.
- [`tools/IMPLEMENTATION_STRATEGY.md`](tools/IMPLEMENTATION_STRATEGY.md) — Authoritative frontend implementation blueprint and component specifications.
- [`tools/requirements_document.md`](tools/requirements_document.md) — Product requirements and institutional operating system framing.

---

## 6. Comprehensive Two-Tier Error Handling Rules

Error handling is an inviolable architectural pillar. The frontend enforces a two-tier error handling architecture:

### Tier 1: Component-Level Error Handling
1. **Network Error Boundaries & Retry Mechanics**:
   - Wrap TanStack Query mutations and queries with semantic error toasts (`sonner` or Radix `Toast`).
   - If an API call fails (e.g. HTTP 403 Forbidden due to insufficient role permissions, or HTTP 422 Unprocessable Entity during balance funding), display the server-returned `message` and `errorCode`.
   - Never suppress or swallow API errors.
2. **Form Validation & Ingress Guards**:
   - All forms (`CreateUserModal`, `DirectFundingModal`, `FiatRailForm`, `EmergencyFreezeModal`) must use `react-hook-form` paired with `zod` schemas.
   - Prevent invalid submissions client-side (e.g. mandatory `auditReason`, positive funding amounts, valid IBAN format).

### Tier 2: Global Application Error Handling
1. **Root `ErrorBoundary`**:
   - Global React Error Boundary wrapping the application root in `src/components/common/ErrorBoundary.tsx`.
   - Prevents white-screen crashes on runtime errors; displays a sovereign institutional recovery interface with error correlation ID and reload action.
2. **Zero Stack Trace Leaks**:
   - In production builds, stack traces and internal variables must never be rendered to the user viewport.
3. **Session Expiration Interceptor**:
   - The Axios/Fetch HTTP client automatically catches HTTP 401 Unauthorized responses, clears the operator session in `useAdminAuthStore`, and redirects to `/login`.

---

## 7. Non-Negotiable Invariants

1. **Mandatory Branch Commitment**: Always commit on `frontend-admin-panel`.
2. **Zero Static / Fallback Data**: No mock records; live backend data only.
3. **Sub-50ms Interaction SLA**: Local filtering and tab switching must execute $<50$ms.
4. **Zero Cumulative Layout Shift (CLS = 0.00)**: Pre-dimensioned rigid skeleton tables (`min-height: 540px`) using `.wavy-skeleton` shimmer animation (`linear-gradient(90deg, #141B29 25%, #1D2232 50%, #141B29 75%)`).
5. **Official Institutional Branding**: Header and document root must use official `BrandLogo` (Vault Squircle + Gold `#D4AF37` / Emerald `#00C288` dual sinusoidal wave + Apex Spark + pulsing `SECURED` badge) and official `favicon.svg`.
6. **Obsidian Dark & Micro-Chamfer Token System**:
   - Palette: `bg-canvas` (`#090D14`), `bg-panel` (`#0F141F`), `bg-elevated` (`#141B29`), `state-hover` (`#1D2232`), `border-subtle` (`#1E293B`).
   - Signals: `gold-accent` (`#D4AF37`), `status-success` (`#10B981`), `status-warning` (`#F59E0B`), `status-danger` (`#EF4444`), `telemetry-cyan` (`#06B6D4`).
   - Micro-chamfer: Strict 4px (`rounded-DEFAULT` / `rounded-[4px]`); consumer pill buttons $>8\text{px}$ are strictly forbidden.
7. **Tabular Lining Figures**:
   - Monospace numbers (`font-mono tabular-nums` with OpenType flags `'tnum' on, 'zero' on, 'cv01' on`) across all financial amounts, hashes, timestamps, and delta metrics.
8. **High Information Density Layout**:
   - Compact table rows (`36px` to `40px` height) with alternating transparent and `#0C101A` backgrounds, left-aligned text, and right-aligned numeric data.
9. **Role-Based Access Control Masking**: Operators only see action buttons authorized for their role.
10. **Real-Time Cross-Deck Synchronization**: Live Socket.IO event listener for instant updates across admin and client command decks.

---

## 8. Human-in-the-Loop Protocol

- Propose an implementation plan in `prompts/<sprint>-<unit>.md` and obtain user approval before writing code.
- Stop and prompt for review whenever encountering ambiguity or design trade-offs.
- Provide clear verification steps, automated test outputs, and proof of correctness after completing any unit of work.
- **Deliver Report**: After completing any sprint, unit, or operational task, deliver a comprehensive structured report to the user summarizing architectural components built/modified, verification output (typecheck, lint, automated tests), and next milestone recommendations.
- **Update Progress & Docs**:
  - Update `.ai/progress-tracker.md` after every phase or step.
  - Keep documentation in `.ai/` in strict lockstep with component code before declaring work complete.

---

## 9. Git Commit Standards

- **Active Branch**: `frontend-admin-panel`.
- **Commit Frequency**: At least two git commits per phase/unit.
- **Prefixes**: `feat:`, `fix:`, `refactor:`, `docs:`, `tests:`, `chore:`.

---

## 10. Pre-Commit Verification Checklist

1. Confirm current branch is `frontend-admin-panel`.
2. Run static analysis (`npm run lint`).
3. Run TypeScript typecheck (`npx tsc --noEmit`).
4. Ensure production build succeeds (`npm run build`).
5. Run all automated tests in `Tests/UnitTest/` and `Tests/IntegrationTest/`.
6. Confirm zero static mock arrays exist in active components.
7. Verify official `BrandLogo` and `favicon.svg` branding integrity.
8. Verify `.wavy-skeleton` shimmer states and zero CLS (`min-height: 540px`).
9. **Update Progress & Docs**: Update `.ai/progress-tracker.md` with completed items and sync context files.
10. **Deliver Report**: Deliver a clear, concise verification summary with test outcomes to the user.
