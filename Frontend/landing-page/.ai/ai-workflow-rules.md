# AI Workflow Rules — WavyAssets Institutional Terminal

## Development Approach: 6-Sprint Spec-Driven Execution

All implementation work follows the structured 6-sprint roadmap defined in `tools/Implementation Strategy And Timeline.pdf`. Implementation proceeds strictly against the designs, prototypes, and specifications stored in the `tools/` folder.

```
[Sprint 1: Core Shell & Theme Engine]
  ├── Design tokens in index.css (Obsidian Dark & Luxury Light)
  └── System-first theme detector & formatters
[Sprint 2: 3D Canvas & Global Navigation]
  ├── Three.js / R3F ambient cursor light mesh
  └── 7-vertical mega-menu with 3D perspective hover tilt
[Sprint 3: Interactive Portfolio Simulator]
  ├── Dual-slider controls & compounding return engine
  └── 3D radial allocation donut visualizer
[Sprint 4: Standardized Asset Panels & Hash Routing]
  ├── AssetContainer wrapper & normalized data schemas
  └── Lazy-loaded chunks & #/services/:assetId router (<50ms swap, CLS=0)
[Sprint 5: Trust Layer, Auth Modal & Footer]
  ├── 2-step registration modal with 6-digit Input-OTP
  └── Client voices tier switch & regulatory compliance footer
[Sprint 6: Performance Hardening & Launch]
  ├── WebGL render loop throttling & GPU memory disposal
  └── Lighthouse optimization & cross-browser validation
```

---

## Human-in-the-Loop Protocol

1. **Plan / Prompt First**: Before writing any implementation code, create a dedicated prompt file in `prompts/<unit-name>.md` detailing:
   - Target Sprint & Epic from `Implementation Strategy And Timeline.pdf`
   - Reference files inspected in `tools/` (e.g., `tools/UI/<folder>/code.html`)
   - Files to create or modify
   - Acceptance criteria and verification plan
2. **Approval Gateway**: Request user review: _"I prepared the implementation plan at prompts/<file-name>.md. Is this good to execute?"_
3. **Strict Execution**: Implement only after receiving explicit user approval.
4. **Demonstrate & Verify**: Provide clear automated test results, TypeScript typecheck confirmation, and manual verification steps after every step.

---

## Non-Negotiable Invariants

1. **Adherence to `tools/`**: Never invent arbitrary layouts, colors, or feature sets outside of what is documented in `tools/`.
2. **Zero Hardcoded Colors**: All styling must utilize Tailwind CSS v4 variables mapped in `index.css` (`var(--bg-base)`, `var(--accent-gold)`, etc.).
3. **Tabular Typography**: All quantitative figures and numbers must render in `Inter` with tabular lining numbers.
4. **Performance Budgets**:
   - Mega-menu dropdown response: `< 100ms`
   - Dynamic asset panel swap: `< 50ms`
   - Cumulative Layout Shift: `0`
5. **Secure Error Handling**: Client responses must never leak stack traces, internal errors, or infrastructure details. Handle exceptions or route to global handlers securely.
6. **Secure Logging**: All emitted logs must redact PII, authorization tokens, secrets, and private credentials.
7. **Continuous Testing**: Unit and Integration tests must be created and updated in `Tests/UnitTest/<test-name>` and `Tests/IntegrationTest/<test-name>`.
8. **Documentation Synchronization**: Update `.ai/progress-tracker.md` immediately upon completing any sprint task.

---

## Git Commit Standards

- **Git Commit Frequency**: Commit code as you build. Every working session or phase must contain **at least two git commits**.
- **Conventional Commit Patterns**: All git commit messages must strictly adhere to the following prefixes:
  - `feat:` for new features (e.g. `feat: add Gemini structured vision output parser`)
  - `fix:` for bug fixes (e.g. `fix: resolve Ollama embedding cosine distance score bug`)
  - `refactor:` for code refactoring (e.g. `refactor: clean up Mismatch Guard validation logic`)
  - `docs:` for documentation updates (e.g. `docs: update progress-tracker and architecture context`)
  - `tests:` for tests addition and modification (e.g. `tests: add pytest suite for confidence gate`)
  - `chore:` for maintenance tasks and environment setup (e.g. `chore: configure requirements.txt and dotenv`)

---

## Protected Files & Directories

- `tools/**`: Design source-of-truth. Read-only reference material. Never delete or alter files in `tools/`.
- `src/components/ui/**`: Generated shadcn/Radix UI base primitives. Modify only when adjusting theme bindings or accessibility props.

---

## Pre-Commit Verification Checklist

Before marking any task complete or committing changes:

1. **TypeScript Typecheck**: Run `npm run build` or `tsc -b` with zero errors.
2. **Linter**: Run `npm run lint` and verify zero ESLint errors or warnings.
3. **Automated Tests**: Execute `npm run test` (Vitest) ensuring all tests in `Tests/UnitTest/` and `Tests/IntegrationTest/` pass.
4. **Error Handling & Logging**: Verify that all new pathways have comprehensive error handling and secure, redacted logging.
5. **CLS & Performance Check**: Verify layout stability during tab swaps and ensure WebGL resources dispose cleanly on unmount.
6. **Progress Tracker**: Update `.ai/progress-tracker.md` with completed items and current state.
