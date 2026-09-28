#### Implementation Plan: Sprint 2 — User Directory & KYC Compliance Deck

**Sprint:** Sprint 2  
**Epic:** Sovereign User & Ledger Directory Governance, Segregated Balances, Direct Funding & KYC/AML Compliance Verification Deck  
**Target Platform:** WavyAssets Sovereign Institutional Admin Command Deck (`Frontend/admin-panel`)  
**Mandatory Branch:** `frontend-admin-panel`  
**Reference Files:**
- `GEMINI.md` (System Governance, Invariants, Pre-Commit Verification)
- `.ai/agent.md` & `.ai/architecture.md` (React 19 + TypeScript + Vite, Zustand 5, TanStack Query v5)
- `.ai/code-standards.md` (Micro-chamfer 4px geometry, Obsidian Dark tokens, Tabular lining figures, Zero CLS)
- `.ai/ui-context.md` (Live API contracts, Zero mock data, Rigid skeleton loaders)
- `.ai/progress-tracker.md` (Sprint 2 deliverables)

---

## 1. Objectives

1. **User & Ledger Directory (`/users`)**:
   - High-density data table displaying Sovereign Users and Institutions.
   - Segregated balance breakdown: `AVAILABLE_CASH` vs `INVESTED_CAPITAL` and `TOTAL_VAULT_BALANCE`.
   - Formatted using OpenType tabular figures (`font-mono tabular-nums`).
   - Risk scoring indicator and access tier badges (`TIER_1`, `TIER_2`, `TIER_3`, `INSTITUTIONAL`).
   - Dynamic real-time search across legal entity name, corporate email, and country code.
   - Tier and status filtering tabs (`ALL`, `TIER_1`, `TIER_2`, `TIER_3`, `INSTITUTIONAL` / `ACTIVE`, `SUSPENDED`).
   - Pre-dimensioned rigid table skeleton loaders (`min-height: 540px`, zero CLS).

2. **User Governance Modals**:
   - `CreateUserModal`: Institutional onboarding form with full legal name, corporate email, access tier, initial capital credit, and mandatory audit justification.
   - `SuspendUserModal`: Sovereign platform account kill-switch with immediate session termination toggle and mandatory FINMA suspension justification.
   - `DirectFundingModal`: Direct balance ledger adjustment with segregated balance target selector (`AVAILABLE_CASH` vs `INVESTED_CAPITAL`), currency selection (`USD`, `CHF`, `EUR`), positive amount clamping, and mandatory audit justification + compliance reference.
   - Strict Zod schema validation on all inputs.
   - RBAC masking: Only operators with `canDirectFund` and `canSuspendUser` permissions can execute sensitive ledger modifications.

3. **KYC & AML Compliance Queue (`/compliance`)**:
   - Verification dossier feed with status tabs (`ALL`, `PENDING_REVIEW`, `IN_INSPECTION`, `ESCALATED_FINMA`, `APPROVED`).
   - High-density dossier table showing Dossier #, Sovereign Entity, Entity Type, Country, Current -> Target Tier, Risk Rating, Sanction/PEP clearance, and Action.
   - Rigid skeleton loader with zero CLS (`min-height: 540px`).

4. **Split-Screen Document Inspector & 1-Click FINMA Tier Upgrade Engine**:
   - Split-screen drawer / modal:
     - Left panel: Applicant profile, Entity classification, Risk score badge, Interactive FINMA AML Checklist (Identity verification, Proof of address, Source of wealth confirmation, UBO identification, Risk categorization), and 1-Click Tier Upgrade Engine (`TIER_1` -> `INSTITUTIONAL`).
     - Right panel: High-resolution document viewer with preview controls (zoom, rotate), document type metadata (Swiss Passport, Certificate of Incorporation, etc.), and file hash integrity checks.
   - RBAC masking: Only operators with `canElevateTier` (Super Admin, Compliance Officer) can approve tier elevations.

5. **State Management & Live API Interoperability**:
   - `src/api/users.ts`: Live REST client hooks for `/users`, `/users/create`, `/users/:id/suspend`, `/users/:id/fund`.
   - `src/api/compliance.ts`: Live REST client hooks for `/compliance/dossiers`, `/compliance/dossiers/:id`, `/compliance/dossiers/:id/elevate`, `/compliance/dossiers/:id/reject`.
   - `src/store/useUserRegistryStore.ts`: Filter states, search query, selected user, modal visibility states.
   - `src/store/useComplianceStore.ts`: Active queue filter, selected dossier, split-screen inspector visibility, active document index.
   - Connect directly to backend at `http://localhost:4002/api/v1` with zero mock arrays or fake fallbacks.

6. **Automated Verification**:
   - Unit tests for user registry store and compliance store.
   - Integration tests for User Directory table, search, filters, and modal interactions.
   - Integration tests for KYC Queue table, FINMA checklist, and Tier elevation engine.
   - Zero TypeScript errors (`npx tsc --noEmit`) and all tests passing.

---

## 2. Directory Layout & Components

```
Frontend/admin-panel/
├── src/
│   ├── api/
│   │   ├── users.ts                     # User directory API queries & mutations
│   │   └── compliance.ts                # KYC dossiers & FINMA tier elevation API
│   ├── components/
│   │   ├── users/
│   │   │   ├── UserDirectoryTable.tsx   # High-density user table with segregated balances
│   │   │   ├── CreateUserModal.tsx      # Sovereign user onboarding modal with Zod schema
│   │   │   ├── SuspendUserModal.tsx     # Account freeze kill-switch modal
│   │   │   └── DirectFundingModal.tsx   # Balance credit adjustment with audit trail
│   │   └── compliance/
│   │       ├── KycQueueTable.tsx        # High-density KYC dossiers table
│   │       └── SplitScreenDocInspector.tsx # Split-screen inspector + FINMA AML checklist
│   ├── store/
│   │   ├── useUserRegistryStore.ts      # User directory filters, selection & modals
│   │   └── useComplianceStore.ts        # Compliance queue filters & inspector state
│   ├── views/
│   │   ├── UserDirectoryView.tsx        # Full User Directory & Governance Deck
│   │   └── ComplianceView.tsx           # Full KYC & AML Compliance Queue Deck
│   └── App.tsx                          # Update router to mount real Sprint 2 views
└── Tests/
    ├── UnitTest/
    │   ├── userRegistryStore.test.ts    # Store logic & modal triggers
    │   └── complianceStore.test.ts      # Compliance state & checklist updates
    └── IntegrationTest/
        ├── userDirectory.test.tsx       # Table render, search, filter, funding modal
        └── complianceDeck.test.tsx      # KYC queue, split-screen viewer, tier elevation
```

---

## 3. Acceptance Criteria & Invariants

- [X] **Mandatory Branch**: All development committed strictly to `frontend-admin-panel`.
- [X] **Zero Static Data**: Direct TanStack Query integration with live backend endpoints (`http://localhost:4002/api/v1`).
- [X] **Zero CLS**: Rigid `.wavy-skeleton` table loaders (`min-height: 540px`) during async hydration.
- [X] **Segregated Balances**: Clear separation between `AVAILABLE_CASH` and `INVESTED_CAPITAL`.
- [X] **Mandatory Audit Justification**: Direct funding and user suspension forms require non-empty audit reasons and compliance references.
- [X] **FINMA AML Compliance**: 5-point verification checklist before 1-click tier elevation.
- [X] **RBAC Enforcement**: Actions disabled/masked for unauthorized operator roles.
- [X] **Design Tokens**: Micro-chamfer 4px (`rounded-[4px]`), Obsidian Dark palette, tabular lining figures (`font-mono tabular-nums`).
- [X] **Automated Testing**: >= 15 passing tests across unit and integration suites.
- [X] **Type Safety**: `npx tsc --noEmit` passes with 0 errors.
