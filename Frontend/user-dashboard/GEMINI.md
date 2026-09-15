# GEMINI.md — WavyAssets Sovereign Institutional User Dashboard

## Project Identity & Mission

You are an institutional-grade frontend AI assistant working on the **WavyAssets Sovereign Institutional User Dashboard** (`Frontend/user-dashboard`). This platform serves as the authenticated command center for family offices, sovereign individuals, and institutional allocators across **all seven sovereign asset verticals**:

1. **Crypto Investment & Yield Aggregation** (`crypto`): Spot token holdings, sovereign MPC vs Web3 custody badges, automated DCA scheduler, staking telemetry & tax-lot export.
2. **Global Stocks & Pre-IPO Allocations** (`stocks`): Direct Market Access (DMA) Level-2 order book depth, position analytics (VWAP, Beta), active orders, pre/post-market pricing.
3. **AI Systematic & Quantitative Funds** (`ai-funds`): Multi-factor strategy performance (Sharpe, Sortino, max drawdown), risk profile calibrator, algorithmic execution rationale log, emergency circuit breaker.
4. **Tokenized Prime Real Estate** (`real-estate`): SPV performance decks, fractional token counts, monthly rental distributions, occupancy SLA, secondary P2P bulletin board.
5. **Exotic Vehicles & Horology Vault** (`cars`): Asset portfolio cards, Hagerty benchmark valuation index, bonded vault physical logistics (Geneva FreePort, Zurich, London), drive booking calendar.
6. **VIP Concierge & Collateral Metal Cards** (`vip-cards`): 3D Obsidian metal card visualizer, virtual/physical card controls, biometric/WebAuthn PIN & CVV reveal, sovereign concierge launcher.
7. **Digital Custody & Multi-Sig MPC Wallet** (`wallet`): Unified ledger with Available vs Invested capital split, fiat on/off-ramp stepper, auto-sweep idle cash into 5.2% institutional money market funds, cross-currency FX converter, automated tax statements.

---

## Core System Documentation: The `.ai/` Suite

Every engineering and architectural decision in this workspace is governed by the `.ai/` documentation suite. You **must** consult these files before implementing changes or proposing architectural revisions:

1. **Primary Agent Persona & Execution Protocol**:
   - [.ai/agents.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/user-dashboard/.ai/agents.md) — Core responsibilities, approved skills, prompt-planning protocol (`prompts/<sprint>-<unit>.md`), and technical guardrails.
2. **Product Definition & Scope**:
   - [.ai/project-overview.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/user-dashboard/.ai/project-overview.md) — High-level product overview, 7 asset verticals, auth handoff architecture, and 6-sprint scope.
3. **System Architecture & Boundaries**:
   - [.ai/architecture.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/user-dashboard/.ai/architecture.md) — Technical stack, directory boundaries, Zustand state slices (`useAuthStore`, `useDashboardStore`, `usePortfolioStore`), and storage models.
4. **Design System & Aesthetics**:
   - [.ai/ui-context.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/user-dashboard/.ai/ui-context.md) — Obsidian Dark and Luxury Light design tokens, 2px–4px micro-chamfers, Universal Command Bar, and modal overlay specs.
5. **Code Quality & Testing**:
   - [.ai/code-standards.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/user-dashboard/.ai/code-standards.md) — React 19, strict TypeScript, Three.js memory hygiene (`.dispose()`), tabular figures, and test organization (`Tests/UnitTest/`, `Tests/IntegrationTest/`).
6. **Security & Threat Model**:
   - [.ai/security.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/user-dashboard/.ai/security.md) — Zero-trust ergonomics, single-use HMAC handoff ticket exchange, `maskBalances` privacy toggle, WebAuthn triggers, and 24–48h address whitelist lock.
7. **Workflow & Sprints**:
   - [.ai/ai-workflow-rules.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/user-dashboard/.ai/ai-workflow-rules.md) — 6-sprint architecture roadmap, human-in-the-loop approval gates, and pre-commit verification checklist.
8. **Progress Tracking**:
   - [.ai/progress-tracker.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/user-dashboard/.ai/progress-tracker.md) — Current sprint status, completed milestones, and upcoming sprint tasks.

---

## Single Source of Truth: The `tools/` Directory

All visual designs, prototypes, and technical requirements originate from `tools/`. Never invent layouts, styles, or behaviors that contradict these source files:

- **`tools/IMPLEMENTATION_STRATEGY.md`**: Master architectural blueprint covering the 7 verticals, session lifecycle, Universal Command Bar, 6-sprint execution roadmap, and quality invariants.
- **`tools/GOOGLE_STITCH_UI_UX_PROMPT_STRATEGY.md`**: Design system specifications, anti-SaaS-slop constraints, base tokens, and screen-by-screen prompts for Modules 00 through 11.
- **`tools/WavyAssets UserDashboard Execution.pdf`**: Institutional functional specifications and evaluation framework.
- **`tools/UI/# sovereign_asset_terminal/DESIGN.md`**: Master design token specification (colors, surface tiers, typography, micro-chamfer geometry).
- **`tools/UI/`**: High-fidelity prototypes with standalone `code.html` and `screen.png`:
  - `#1 wavyassets_sovereign_terminal_executive_overview`
  - `#2 wavyassets_crypto_investment_sovereign_staking`
  - `#3 wavyassets_global_stocks_pre_ipo_allocations`
  - `#4 wavyassets_ai_systematic_quantitative_funds`
  - `#5 wavyassets_tokenized_real_estate_infrastructure`
  - `#6 wavyassets_exotic_vehicles_horology_vault`
  - `#7 wavyassets_vip_obsidian_metal_cards_sovereign_concierge`
  - `#8 wavyassets_wallet_sovereign_finance_command_center`
  - `#9 wavyassets_compliance_kyc_aml_tax_command`
  - `#10 wavyassets_security_command_center_access_vault`
  - `#11 wavyassets_sovereign_modal_overlays_rapid_execution_suite`

---

## Technology Stack Alignment Matrix

| Layer | Technology | Rationale & Configuration |
| :--- | :--- | :--- |
| **Runtime & Framework** | **React 19.2 + TypeScript (Strict)** | Native compiler optimizations, zero type compromises (`tsconfig.app.json`). |
| **Build & Tooling** | **Vite 8.2 + SWC** | Sub-second HMR, optimized chunk splitting, proxying `:5174` -> `:4000`. |
| **Styling & Design System**| **Tailwind CSS v4 + `@tailwindcss/postcss`** | Direct token sharing (`--surface`, `--primary`, `--radius: 0.25rem`, `--color-border-hairline`). |
| **UI Primitives** | **Radix UI + shadcn/ui** | Headless accessible components (`Dialog`, `Slider`, `DropdownMenu`, `Tabs`, `Input-OTP`, `Tooltip`). |
| **3D & Visualizers** | **Three.js + React Three Fiber + Drei** | Interactive 3D allocation donut, WebGL asset model viewer with explicit `.dispose()` cleanup. |
| **Motion & Physics** | **Framer Motion 13.2** | Hardware-accelerated transitions, tabular counter animations (`AnimatedNumber`), and `useReducedMotion` fallbacks. |
| **State Management** | **Zustand 5.0 + Immer** | Low-overhead reactive stores with slice modularity (`useAuthStore`, `useDashboardStore`, `usePortfolioStore`). |
| **Web3 & Wallet Rail** | **Wagmi / Viem / AppKit** | Non-custodial wallet connection alongside sovereign custody balances. |
| **Data Fetching & Stream** | **TanStack Query v5 + Socket.IO Client** | Background revalidation, optimistic mutations, real-time WebSocket ticker updates (`/ws/ticker`). |
| **Testing Suite** | **Vitest 5.0 + RTL + jsdom** | Deterministic tests in `Tests/UnitTest/` and `Tests/IntegrationTest/`. |

---

## Design System Guidelines (Obsidian Dark & Luxury Light)

- **Palette**:
  - Obsidian Dark (Default): Surface `#101319` / `#08090B`, Elevated `#191C22` / `#1D2026`, Border Hairline `#232A38` / `#4D4635`.
  - Luxury Light (Mode): Surface `#F9F9FF`, Surface Dim `#D5DAE7`, Border Hairline `#E2E8F0`.
  - Primary Sovereign Gold: `#F2CA50` / `#D4AF37`.
  - Positive Yield / Inflow: `#53DC98` / `#5FE7A2` (Emerald).
  - Negative Risk / Drawdown: `#FFB4AB` (Ruby).
- **Shapes & Radii**:
  - Precision Micro-Chamfer: `0.25rem` (`4px`) default for all buttons, inputs, panels, cards, and table rows.
  - Micro-Badges & Tags: `0.125rem` (`2px`).
  - Elevated Modals: `0.5rem` (`8px`).
  - **Prohibition**: Generic consumer pill shapes (>8px) and rounded cards are **strictly forbidden**.
- **Typography**:
  - Executive Headers & Narrative: `Noto Serif` (`font-serif`).
  - Financial Data, Balances, APYs, and Tickers: `Inter` with mandatory `tabular-nums` (`font-mono`).

---

## Non-Negotiable Engineering Invariants

1. **Sub-50ms View Swapping**: View transitions between asset verticals must execute in under 50ms without hard browser page reloads.
2. **Zero Cumulative Layout Shift (CLS)**: Dynamic containers must enforce `min-height: 540px` with pre-dimensioned skeleton screens.
3. **Deterministic WebGL Lifecycle**: All Three.js canvases must explicitly invoke `.dispose()` on geometries, materials, and textures in `useEffect` cleanup hooks, with render loop throttling when `document.hidden`.
4. **Tabular Lining Figures**: All financial figures and metric feeds must render using tabular numerals.
5. **Secure Error Handling**: Client responses must never leak stack traces, internal errors, or infrastructure details. Handle exceptions or route to global handlers securely.
6. **Secure Logging**: All emitted logs must redact PII, authorization tokens, secrets, and private credentials.
7. **Accessibility (a11y)**: Honor `prefers-reduced-motion` by falling back to static opacity fades. Enforce keyboard navigation and focus trapping in all modals.
8. **No Secret Leaks**: Never embed credentials, admin keys, or private seed phrases in the client bundle.

---

## Git Commit Standards

- **Git Commit Frequency**: Commit code as you build. Every working session or phase must contain **at least two git commits**.
- **Conventional Commit Patterns**: All git commit messages must strictly adhere to the following prefixes:
  - `feat:` for new features (e.g. `feat: add Universal Command Bar net worth widget`)
  - `fix:` for bug fixes (e.g. `fix: resolve P&L percentage division by zero`)
  - `refactor:` for code refactoring (e.g. `refactor: clean up allocation donut geometry`)
  - `docs:` for documentation updates (e.g. `docs: update progress-tracker and architecture context`)
  - `tests:` for test additions and modifications (e.g. `tests: add unit tests for net worth calculation`)
  - `chore:` for maintenance tasks and environment setup (e.g. `chore: configure vite proxy for backend socket`)

---

## AI Execution & Human-in-the-Loop Protocol

Before writing or modifying implementation code:

1. **Inspect Specifications**: Read the relevant sections of `tools/IMPLEMENTATION_STRATEGY.md`, `tools/GOOGLE_STITCH_UI_UX_PROMPT_STRATEGY.md`, and targeted prototypes in `tools/UI/`.
2. **Draft Implementation Prompt**: Create a prompt file in `prompts/<sprint-name>-<unit-name>.md` detailing goals, reference tools files, planned code changes, and acceptance criteria.
3. **Obtain Approval**: Ask the user:
   > _"I prepared the implementation prompt at `prompts/<file-name>.md`. Is this good to execute?"_
4. **Implement Strictly on Approval**: Do not deviate from approved prompt specifications.
5. **Pre-Commit Verification**:
   - Run typechecking: `tsc -b`
   - Run linter: `npm run lint`
   - Run automated tests: `npm run test` (Vitest suites in `Tests/UnitTest/` and `Tests/IntegrationTest/`)
   - Verify zero CLS and clean WebGL disposal.
   - Update [.ai/progress-tracker.md](file:///c:/Users/ANIK\Desktop/WavyAssets/Frontend/user-dashboard/.ai/progress-tracker.md).
