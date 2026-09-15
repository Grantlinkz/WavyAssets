# Code Standards — WavyAssets Sovereign Institutional User Dashboard

## General Principles

1. **Precision & Single Responsibility**: Keep components, hooks, and mathematical modules small, well-scoped, and single-purpose.
2. **Deterministic UI State**: The user interface must be a pure, predictable reflection of global state (`useDashboardStore`, `useAuthStore`, `usePortfolioStore`) and client routing.
3. **Zero Layout Shifts (CLS = 0)**: Pre-dimension all dynamic view containers (`min-height: 540px`) and skeleton frames to guarantee zero cumulative layout shift during module transitions.

---

## TypeScript Conventions

- **Strict Type Checking**: Strict mode is enabled (`tsconfig.app.json`). Never use `any`. Use explicit interfaces, unions, and discards.
- **Normalized Data Schemas**: Define explicit TypeScript interfaces for all 7 asset classes (e.g., `CryptoHoldings`, `StockPosition`, `AiFundStrategy`, `RealEstateAsset`, `VehicleAsset`, `CardPrivileges`, `WalletLedger`).
- **Financial Calculation Integrity**: Validate and sanitize all numeric inputs before passing them to compounding math, P&L calculations, or gas estimators.

---

## React 19, Vite & Styling Standards

- **Modern Hooks**: Use modern React 19 hooks and patterns (`use`, `useActionState` where applicable).
- **Client-Side Routing**: Sub-50ms view switching using client-side routing. Keep URL state in sync with `useDashboardStore.activeVertical`.
- **CSS Custom Properties**: Always use design system CSS variables (`var(--surface)`, `var(--primary)`, `var(--outline)`) via Tailwind v4. Hardcoded ad-hoc hex values in component JSX are strictly prohibited.
- **Border Radius Adherence**: Use `rounded-sm` (`4px`) for buttons, inputs, and cards. Use `rounded-md` (`8px`) only for modal windows and elevated dialogs. True pill shapes are prohibited.
- **Tabular Lining Numbers**: Always apply `font-mono` (`Inter`) with `tabular-nums` styling to financial figures, APYs, balances, and metrics.

---

## WebGL & Three.js Standards

1. **Resource Lifecycle & Disposal**:
   - Every Three.js geometry, material, texture, and custom shader instance must be explicitly deallocated (`geometry.dispose()`, `material.dispose()`) in component unmount / `useEffect` cleanup return functions.
2. **Loop Throttling**:
   - Throttle the `useFrame` or `requestAnimationFrame` render loop down to 5–10 FPS when the page is not visible (`document.hidden === true`).
   - Use `IntersectionObserver` to pause 3D rendering when the canvas is scrolled out of the viewport.
3. **Accessibility Fallback**:
   - Check `window.matchMedia('(prefers-reduced-motion: reduce)')`. When active, bypass continuous camera animations and 3D gyroscope tilts, substituting subtle static CSS opacity transitions.

---

## Real-Time Streaming & State Management

- **Zustand Stores**: Keep stores cleanly segregated:
  - `useAuthStore`: User entity, access token, authentication state, KYC tier.
  - `useDashboardStore`: UI state, active view, `maskBalances` toggle, sidebar state.
  - `usePortfolioStore`: Real-time net worth, 24h P&L, allocation percentages, positions.
- **TanStack Query & WebSockets**: Use TanStack Query for caching REST endpoints (`/api/v1/user/portfolio`, `/api/v1/market/summary`) and Socket.IO for live ticker and order book streaming (`/ws/ticker`).

---

## Error Handling & Resilience

- **Component Error Boundaries**: Wrap all 3D WebGL canvases and dynamic asset modules in an `ErrorBoundary` that renders a graceful, dark-themed fallback banner with a manual reload trigger rather than crashing the page shell.
- **Graceful Math Fallbacks**: Financial math and currency formatters must catch NaN or out-of-range inputs and fail-safe to formatted default values (e.g., `$0.00`).
- **Secure Error Handling**: Client responses must never leak stack traces, internal errors, or infrastructure details. Handle exceptions or route to global handlers securely.

---

## Logging & Security

- **PII & Token Redaction**: All emitted logs must redact PII (names, email addresses), authorization tokens, private keys, and card PIN/CVV numbers.
- **Audit Telemetry**: Instrument critical financial actions (view switches, trade submissions, address whitelist submissions) with structured, redacted telemetry events.

---

## Testing & Quality Assurance

- **Unit Tests (`Tests/UnitTest/<test-name>/`)**:
  - `Tests/UnitTest/calculations/`: Verify net worth aggregation, weighted APY, 24h P&L delta formulas.
  - `Tests/UnitTest/formatters/`: Verify tabular currency, percentage, and date formatters with international fallbacks.
  - `Tests/UnitTest/store/`: Validate Zustand state transitions (auth state, privacy toggle, active vertical).
- **Integration Tests (`Tests/IntegrationTest/<test-name>/`)**:
  - `Tests/IntegrationTest/command-bar/`: Verify Universal Command Bar rendering, timeframe switching, and privacy masking.
  - `Tests/IntegrationTest/modules/`: Verify sub-50ms module switching across all 7 asset classes with zero CLS.
  - `Tests/IntegrationTest/modals/`: Verify deposit, withdraw, and whitelist modal flows including 24-48h lock prompts.

---

## Git Commit Standards

- **Git Commit Frequency**: Commit code as you build. Every working session or phase must contain **at least two git commits**.
- **Conventional Commit Patterns**: All git commit messages must strictly adhere to the following prefixes:
  - `feat:` for new features (e.g. `feat: add Global Command Bar net worth widget`)
  - `fix:` for bug fixes (e.g. `fix: resolve P&L percentage division by zero`)
  - `refactor:` for code refactoring (e.g. `refactor: clean up allocation donut geometry`)
  - `docs:` for documentation updates (e.g. `docs: update progress-tracker and architecture context`)
  - `tests:` for test additions and modifications (e.g. `tests: add unit tests for net worth calculation`)
  - `chore:` for maintenance tasks and environment setup (e.g. `chore: configure vite proxy for backend socket`)
