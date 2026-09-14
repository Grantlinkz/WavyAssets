# AI Workflow Rules — WavyAssets Sovereign Institutional User Dashboard

## Development Approach: 6-Sprint Architecture Roadmap

All implementation work follows the structured 6-sprint roadmap defined in `tools/IMPLEMENTATION_STRATEGY.md`. Implementation proceeds strictly against the designs, prototypes, and specifications stored in the `tools/` folder.

```
[SPRINT 1: Foundation, Shell & Auth Handoff]
  ├── Initialize Vite 8 + React 19 + Tailwind v4 with shared design tokens
  ├── Implement handoff ticket consumption & session initialization (/auth/callback)
  ├── Build responsive dashboard sidebar navigation and theme provider
  └── Setup Vitest testing foundation (Tests/UnitTest/ & Tests/IntegrationTest/)

[SPRINT 2: Global Command Bar & 3D Allocation Engine]
  ├── Implement Consolidated Net Worth, 24h/All-Time P&L with timeframes
  ├── Build 3D Radial Allocation Donut (Three.js/Drei) with GPU cleanup
  ├── Implement Privacy Toggle (maskBalances) with global DOM masking
  └── Deliver Deposit/Withdraw/Trade modal skeletons

[SPRINT 3: Liquid Asset Modules (Crypto, Stocks & Wallet)]
  ├── Build Crypto module (holdings, custody badges, DCA scheduler, gas preview)
  ├── Build Stocks module (DMA order book, position details, pre/post market)
  ├── Build Unified Wallet (Available vs Invested ledger, fiat on/off-ramp)
  └── Automated tests for order submission and balance sweeping

[SPRINT 4: Alternative Asset Modules (AI Funds, Real Estate & Cars)]
  ├── Build AI Systematic module (Sharpe gauges, rationale feed, circuit breaker)
  ├── Build Tokenized Real Estate (SPV decks, rental tracker, P2P secondary board)
  ├── Build Exotic Cars & Horology (Hagerty index, drive booking calendar, vault telemetry)
  └── Integration tests for alternative asset sub-views

[SPRINT 5: VIP Cards, Compliance & Security Command Center]
  ├── Build VIP Card module (3D Obsidian card visualizer, freeze controls, PIN/CVV biometric gate)
  ├── Build Tiered KYC/AML tracker with document verification checklist
  ├── Build Unified Tax Pack generator and Security Command Center (24-48h address lock)
  └── Automated security and compliance verification tests

[SPRINT 6: Performance Optimization, Hardening & Enterprise Deployment]
  ├── Audit sub-50ms tab transition benchmarks and eliminate layout shifts (CLS < 0.01)
  ├── Enforce WebGL loop throttling on background tabs and off-screen culling
  ├── Multi-stage Docker containerization (Nginx Alpine on port 5174)
  └── Full test suite verification (>130 passing unit and integration tests)
```

---

## Human-in-the-Loop Protocol

1. **Plan / Prompt First**: Before writing any implementation code, create a dedicated prompt file in `prompts/<sprint-name>-<unit-name>.md` detailing:
   - Target Sprint & Epic from `tools/IMPLEMENTATION_STRATEGY.md`
   - Specific reference files inspected in `tools/` (e.g., `tools/UI/<folder>/code.html`)
   - Files to create or modify
   - Non-negotiable technical requirements (CLS = 0, GPU memory disposal, tabular lining numbers)
   - Acceptance criteria and verification plan
2. **Approval Gateway**: Request user review: _"I prepared the implementation plan at prompts/<file-name>.md. Is this good to execute?"_
3. **Strict Execution**: Implement only after receiving explicit user approval.
4. **Demonstrate & Verify**: Provide clear automated test results, TypeScript typecheck confirmation, and manual verification steps after every step.

---

## Non-Negotiable Invariants

1. **Adherence to `tools/`**: Never invent arbitrary layouts, colors, or feature sets outside of what is documented in `tools/`.
2. **Zero Hardcoded Colors**: All styling must utilize Tailwind CSS v4 variables mapped in `index.css` (`var(--surface)`, `var(--primary)`, etc.).
3. **Tabular Typography**: All quantitative figures and numbers must render in `Inter` with tabular lining numbers (`tabular-nums`).
4. **Performance Budgets**:
   - Dynamic asset panel switch: `< 50ms`
   - Cumulative Layout Shift: `0`
   - WebGL frame throttling: Throttled to 5–10 FPS when `document.hidden` or scrolled out of view.
5. **Secure Error Handling**: Client responses must never leak stack traces, internal errors, or infrastructure details. Handle exceptions or route to global handlers securely.
6. **Secure Logging**: All emitted logs must redact PII, authorization tokens, secrets, and private credentials.
7. **Continuous Testing**: Unit and Integration tests must be created and updated in `Tests/UnitTest/<test-name>` and `Tests/IntegrationTest/<test-name>`.
8. **Documentation Synchronization**: Update `.ai/progress-tracker.md` immediately upon completing any sprint task.

---

## Git Commit Standards

- **Git Commit Frequency**: Commit code as you build. Every working session or phase must contain **at least two git commits**.
- **Conventional Commit Patterns**: All git commit messages must strictly adhere to the following prefixes:
  - `feat:` for new features (e.g. `feat: add Global Command Bar net worth widget`)
  - `fix:` for bug fixes (e.g. `fix: resolve P&L percentage division by zero`)
  - `refactor:` for code refactoring (e.g. `refactor: extract allocation donut geometry`)
  - `docs:` for documentation updates (e.g. `docs: update progress-tracker and architecture context`)
  - `tests:` for test additions and modifications (e.g. `tests: add unit tests for net worth calculation`)
  - `chore:` for maintenance tasks and environment setup (e.g. `chore: configure vite proxy for backend socket`)

---

## Protected Files & Directories

- `tools/**`: Design and architectural source-of-truth. Read-only reference material. Never delete or alter files in `tools/`.
- `src/components/ui/**`: Generated shadcn/Radix UI base primitives. Modify only when adjusting theme bindings or accessibility props.

---

## Pre-Commit Verification Checklist

Before marking any task complete or committing changes:

1. **TypeScript Typecheck**: Run `npm run build` or `tsc -b` with zero errors.
2. **Linter**: Run `npm run lint` and verify zero ESLint errors or warnings.
3. **Automated Tests**: Execute `npm run test` (Vitest) ensuring all tests in `Tests/UnitTest/` and `Tests/IntegrationTest/` pass.
4. **Error Handling & Logging**: Verify that all new pathways have comprehensive error handling and secure, redacted logging.
5. **CLS & Performance Check**: Verify layout stability during tab switches and ensure WebGL resources dispose cleanly on unmount.
6. **Progress Tracker**: Update `.ai/progress-tracker.md` with completed items and current state.
