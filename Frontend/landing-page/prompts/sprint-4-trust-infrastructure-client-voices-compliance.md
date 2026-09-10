# Sprint 4 Implementation Prompt: Trust Infrastructure, Client Voices & Global Compliance Footprint

## Unit Overview
- **Sprint**: Sprint 4 / Milestone Phase 4
- **Unit**: Trust Infrastructure, Allocator Client Voices with Specular 3D Tilt, Custody Clearing Network & Compliance-Ready Multi-Column Footer
- **Source of Truth & Reference**:
  - `tools/UI/4 aura_assets_trust_infrastructure_client_voices_global_compliance/code.html`
  - `tools/UI/4 aura_assets_trust_infrastructure_client_voices_global_compliance/screen.png`
  - `tools/Implementation Strategy And Timeline.pdf` (Trust Footprint & Compliance Specifications, Page 1–5)
- **Target Files**:
  - `src/components/trust/TrustInfrastructure.tsx` [NEW]
  - `src/components/trust/ClientVoices.tsx` [NEW]
  - `src/components/trust/CustodyNetworkGrid.tsx` [NEW]
  - `src/components/footer/InstitutionalFooter.tsx` [NEW]
  - `src/components/footer/NewsletterDispatch.tsx` [NEW]
  - `src/store/useTerminalStore.ts` [MODIFY]
  - `src/App.tsx` [MODIFY]
  - `.ai/progress-tracker.md` [MODIFY]
  - `Tests/UnitTest/trustMetrics.test.ts` [NEW]
  - `Tests/IntegrationTest/trustAndComplianceIntegration.test.tsx` [NEW]

---

## 1. Architectural & Design Specifications

### A. Design System & Theming Strict Fidelity
- **Color Tokens**: Obsidian Dark (`#08090B`, surfaces `#0F1115`, elevated `#161920`) and Luxury Light (`#F9F9FF`, `#FFFFFF`, elevated `#F0F0F5`) mapped directly to CSS variables (`var(--color-surface)`, `var(--color-outline)`, `var(--color-primary)`, `var(--color-secondary)`). Zero hardcoded colors.
- **Chamfer Standard**: Precise `4px` (`rounded-sm`) for metric cards, testimonial tiles, clearing nodes, and input fields. True pill buttons (>8px) strictly forbidden.
- **Typography Standard**:
  - Editorial headings, narrative quotes, and labels: **Noto Serif**.
  - All quantitative metrics, dollar allocations, AUM figures, APYs, SHA256 roots, and latency measurements: **Inter** (`tabular-nums font-mono`).

### B. Interactive Client Tier State Machine
- Dynamic toggle: **Private Wealth** vs. **Institutional & Funds**.
- State integrated into `src/store/useTerminalStore.ts` (`clientTier: 'private-wealth' | 'institutional'`).
- Toggling triggers smooth data morphing across:
  1. Audited AUM metrics ($4.82B vs. $12.4B, uptime 99.998%, Merkle proof 100%, 0 breaches).
  2. Testimonials (Koenig Family Office, Octave Quant Syndicate, Thorne Capital vs. Sovereign Allocator, Systematic HFT Desks, Multi-Family Office Consortium).
  3. Shared layout spring transition indicator (`layoutId="clientTierTab"`).

### C. Kinetic Motion & 3D Specular Testimonial Cards
- Integrated mouse-coordinate tilt tracking (`perspective: 1000px`, `rotateX`, `rotateY`) on testimonial cards.
- Dynamic radial gradient specular shine overlay that tracks cursor position across the card surface.
- Automatic fallback for `prefers-reduced-motion` to static opacity transitions.

### D. Multi-Jurisdiction Regulatory Footer & Institutional Dispatch
- 5-column institutional directory:
  1. Brand positioning with regulatory badges (SEC Registered RIA `#801-128491`, FINMA Regulated VQF, MAS Exempt Operator).
  2. Asset Verticals (7 asset classes matching terminal navigation).
  3. Institutional Protocol (MPC custody, Merkle reserves, FIX 4.4).
  4. Governance & Disclosures (Form ADV Part 2A, SOC 2 Type II, AML/KYC).
  5. Institutional Dispatch newsletter sign-up with client-side validation, encrypted PGP notice, and secure sanitized feedback state.
- Mandatory regulatory disclaimer block covering SEC Rule 206(4)-1, FinSA/FinIA compliance, SIPC/FINRA member clearing, and SGS vault auditing.

---

## 2. Planned Changes & Implementation Steps

### Step 1: Store Enhancement (`src/store/useTerminalStore.ts`)
- Add `clientTier: 'private-wealth' | 'institutional'` state and `setClientTier(tier)` action.
- Persist user preference to `localStorage`.

### Step 2: Trust Infrastructure Component (`src/components/trust/TrustInfrastructure.tsx`)
- Implement Enclave Status Bar with live Merkle root, HSM cluster verification, and clearing latency.
- Implement Audited Performance & Sovereign Trust header with segmented tier switcher (`Private Wealth` / `Institutional & Funds`).
- Implement 4-cell Audited Return Metrics Strip ($4.82B AUM, 99.998% Uptime, 100% Merkle Proof, 0 Breaches) with progress indicators.
- Implement live Telemetry Stream bar (Epoch #984,210, Zurich HSM 03, ISO/IEC 27001).

### Step 3: Specular Client Voices Component (`src/components/trust/ClientVoices.tsx`)
- Construct testimonial data matrix for both `private-wealth` and `institutional` tiers.
- Build 3D perspective tilt cards with cursor-following specular spotlight highlight.
- Display verified allocator identifiers (`FO-ZUR-091`, `QUANT-LD4-118`, `CORP-DXB-404`), APY badges, allocation chips, and allocator credentials.

### Step 4: Clearing & Custody Network Grid (`src/components/trust/CustodyNetworkGrid.tsx`)
- Render 6-node institutional infrastructure grid:
  - BNY Mellon (Tri-Party Custody)
  - State Street (Fund Admin & NAV)
  - LGT Bank Schweiz (Swiss Segregated Vault)
  - Equinix NY4 / LD4 (DMA Cross-Connect)
  - Lloyd's of London (Specie Asset Insurance)
  - DTCC Direct (Real-Time Clearing)
- Synchronized node status indicator with pulsing emerald telemetry.

### Step 5: Institutional Footer & Dispatch (`src/components/footer/InstitutionalFooter.tsx`, `NewsletterDispatch.tsx`)
- Build multi-column layout with links, RIA/FINMA credentials, and responsive grid.
- Implement `NewsletterDispatch` with sanitized input, PGP notice, and success message.
- Mount comprehensive regulatory disclosures and legal copyright bar.

### Step 6: Terminal App Integration (`src/App.tsx`)
- Integrate `TrustInfrastructure`, `ClientVoices`, `CustodyNetworkGrid`, and replace the temporary footer with `InstitutionalFooter`.

### Step 7: Quality Assurance & Testing
- Unit tests in `Tests/UnitTest/trustMetrics.test.ts` validating metric transformations across tiers.
- Integration tests in `Tests/IntegrationTest/trustAndComplianceIntegration.test.tsx` verifying tier switching, specular card interaction, newsletter validation, and disclaimer presence.
- Pre-commit verification: `tsc -b`, `npm run lint`, `npm test`.
- Minimum 2 Git commits with conventional commit prefixes.
- Update `.ai/progress-tracker.md`.

---

## 3. Acceptance Criteria
- [ ] Tier switcher seamlessly morphs metrics and testimonials between Private Wealth and Institutional modes.
- [ ] Testimonial cards react to mouse coordinates with 3D perspective tilt and radial specular highlight.
- [ ] Clearing node network renders all 6 custodian partners with live synchronized indicators.
- [ ] Institutional footer displays full 5-column structure, RIA badges, working newsletter dispatch, and SEC/FINMA disclaimers.
- [ ] Tabular figures render strictly with `Inter` and `tabular-nums`; headlines and narrative prose render in `Noto Serif`.
- [ ] 100% test pass rate across Vitest suites, zero TypeScript errors (`tsc -b`), zero ESLint errors (`npm run lint`).
- [ ] At least two git commits using conventional commit patterns.
