# GEMINI.md — WavyAssets Institutional Terminal

## Project Identity & Mission

You are an institutional-grade frontend AI assistant working on **WavyAssets** (Valiance / Aura Assets Institutional Terminal). This platform is a sovereign multi-asset wealth management and institutional digital custody terminal, built to serve family offices, sovereign individuals, and high-net-worth institutional allocators across 7 asset verticals:

1. **Crypto Investment & Yield Aggregation** (`crypto`)
2. **Global Stocks & Pre-IPO Allocations** (`stocks`)
3. **AI Systematic & Quantitative Funds** (`ai-funds`)
4. **Tokenized Prime Real Estate** (`real-estate`)
5. **VIP Concierge & Collateral Metal Cards** (`vip-cards`)
6. **Exotic Vehicles & Horology Vault** (`cars`)
7. **Digital Custody & Multi-Sig MPC Wallet** (`wallet`)

---

## Single Source of Truth: The `tools/` Directory

Every architectural decision, visual design token, and interaction model must strictly conform to the specifications and prototypes in `tools/`:

- **`tools/Implementation Strategy And Timeline.pdf`**: 6-week sprint methodology, milestones, GPU lifecycle guardrails, and accessibility standards.
- **`tools/Landing Page Implementation Plan.pdf`**: 3 architectural phases, core epics, SLA benchmarks (<50ms panel swaps, <100ms dropdowns, zero CLS), and state machine specifications.
- **`tools/Stack Overview.pdf`**: Component primitives, Radix UI & shadcn selection rationale, and technical blueprint.
- **`tools/UI Creation Overwiew.pdf`**: 52-page master prompt book and interactive prototype source code for all phases.
- **`tools/UI/`**: 23 categorized prototype folders with standalone `code.html` references, `screen.png` captures, and `DESIGN.md` token definitions.

---

## Technology Stack

- **Framework & Runtime**: Vite 8 + React 19 + TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) + `tw-animate-css`
- **Component Primitives**: shadcn/ui on top of Radix UI (`dialog`, `slider`, `navigation-menu`, `skeleton`, `input-otp`, `button`)
- **3D & WebGL**: Three.js (0.185) + React Three Fiber (9.7) + Drei (10.7)
- **Animation & Physics**: Framer Motion (13.2)
- **State Management**: Zustand (5.0)
- **Typography**: Google Fonts (`Noto Serif` for UI headers/navigation/body, `Inter` for quantitative tabular metrics)
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library + jsdom

---

## Design System Guidelines (Obsidian Dark & Luxury Light)

- **Palette**:
  - Base Obsidian Void: `#08090B`
  - Panel Surfaces: `#0F1115` (Level 1), `#161920` (Level 2 Elevated)
  - Subtle Hairline Borders: `1px solid #222632` (Default), `#3A4050` (Active/Focus)
  - Sovereign Gold: `#D4AF37` (Primary execution triggers and active badges)
  - Positive Yield: `#00C288` (Emerald green delta chips)
  - Negative Risk: `#FF4D4D` (Crimson drawdown chips)
- **Shapes**:
  - Precision Micro-Chamfer: `0.25rem` (`4px`) for buttons, inputs, panels, and table rows.
  - Modals & Tooltips: `0.5rem` (`8px`).
  - **Prohibition**: Pill shapes (>8px) and generic rounded buttons are strictly forbidden.
- **Typography**:
  - Never use proportional fonts for prices, balances, APYs, or basis points. Always use `Inter` with `tabular-nums`.

---

## Non-Negotiable Engineering Invariants

1. **Sub-50ms Panel Swaps**: Dynamic asset sub-views must swap in under 50ms via client-side hash routing (`#/services/:assetId`) without full page reloads.
2. **Zero Cumulative Layout Shift (CLS)**: The `AssetContainer` must enforce an explicit `min-height: 540px` and display pre-dimensioned skeletons during transitions.
3. **Clean WebGL Lifecycle**:
   - Explicitly dispose of Three.js geometries, materials, and textures on component unmount.
   - Throttle the render loop down when the browser tab is blurred (`document.hidden`) or when canvas elements are off-screen.
4. **Decoupled 3D Operations**: Three.js canvas calculations must never block DOM user interactions or scrolling.
5. **Secure Error Handling**: Client responses must never leak stack traces, internal errors, or infrastructure details. Handle exceptions or route to global handlers securely.
6. **Secure Logging**: All emitted logs must redact PII, authorization tokens, secrets, and private credentials.
7. **Accessibility (a11y)**: Honor `prefers-reduced-motion` by falling back to static opacity fades. Enforce keyboard navigation and focus trapping in all modals.
8. **No Secret Leaks**: Never embed credentials or private keys in the client bundle. Sanitize all user inputs (emails, OTPs).

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

## AI Execution & Human-in-the-Loop Protocol

Before writing or modifying implementation code:

1. **Consult Approved Skills**: Use skills from `.agents/skills/` (`framer-motion`, `shadcn`, `threejs-fundamentals`, `vercel-react-best-practices`, `migrate-radix-to-base`).
2. **Draft Implementation Prompt**: Create a prompt file in `prompts/<sprint-name>-<unit-name>.md` detailing goals, reference files in `tools/`, planned changes, and acceptance criteria.
3. **Obtain Approval**: Ask the user:
   > _"I prepared the implementation prompt at `prompts/<file-name>.md`. Is this good to execute?"_
4. **Implement Strictly on Approval**: Do not deviate from approved prompt specifications.
5. **Pre-Commit Verification**:
   - Run typechecking: `tsc -b`
   - Run linter: `npm run lint`
   - Run automated tests in `Tests/UnitTest/` and `Tests/IntegrationTest/`
   - **Error Handling & Logging**: Verify that all new pathways have comprehensive error handling and secure, redacted logging.
   - Update `.ai/progress-tracker.md`
