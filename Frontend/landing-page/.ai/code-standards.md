# Code Standards — WavyAssets Institutional Terminal

## General Principles

1. **Precision & Single Responsibility**: Keep components, hooks, and mathematical modules small, well-scoped, and single-purpose.
2. **Deterministic UI State**: The user interface must be a pure, predictable reflection of the global hash route and store state.
3. **Zero Layout Shifts (CLS = 0)**: Pre-dimension all dynamic view containers (`min-height: 540px`) and skeleton frames to guarantee zero cumulative layout shift during asset transitions.

---

## TypeScript Conventions

- **Strict Type Checking**: Strict mode is enabled (`tsconfig.app.json`). Never use `any`. Use strict interfaces, discards, and unions.
- **Normalized Data Schemas**: Define explicit TypeScript interfaces for all 7 asset classes (e.g., `CryptoAssetData`, `StockAssetData`, `RealEstateData`), ensuring strong typing across metric strips, order books, and inventory grids.
- **Input Validation**: Validate and sanitize all numeric inputs and slider bounds before passing them to the compounding returns math engine.

---

## React 19 & Vite Standards

- **Functional Components & Hooks**: Use modern React 19 hooks and patterns.
- **Client-Side Hash Routing**: Listen to `hashchange` and `popstate` to synchronize URL hashes (`#/services/:assetId`) with the Zustand active tab state without causing hard browser reloads.
- **Lazy Loading & Suspense**: Lazy-load heavy asset sub-views (`React.lazy`) and wrap them in `<Suspense fallback={<SkeletonPanel />}>` to keep the initial landing page bundle lightweight.

---

## WebGL & Three.js Standards

1. **Resource Lifecycle & Disposal**:
   - Every Three.js geometry, material, texture, and custom shader instance must be explicitly deallocated (`geometry.dispose()`, `material.dispose()`) in component unmount / `useEffect` cleanup return functions.
2. **Loop Throttling**:
   - Throttle the `useFrame` or `requestAnimationFrame` render loop down to 5–10 FPS when the page is not visible (`document.hidden === true`).
   - Use `IntersectionObserver` to pause 3D rendering when the canvas is scrolled out of the viewport.
3. **Accessibility Fallback**:
   - Check `window.matchMedia('(prefers-reduced-motion: reduce)')`. When active, bypass 3D camera animations, cursor-reactive mesh tilts, and perspective card hover effects, substituting subtle static CSS opacity transitions.

---

## Styling & Token Discipline

- **CSS Custom Properties**: Always use design system CSS variables (`var(--bg-base)`, `var(--accent-gold)`, `var(--border-default)`) via Tailwind v4. Hardcoded ad-hoc hex values in component JSX are strictly prohibited.
- **Border Radius Adherence**: Use `rounded-sm` (`4px`) for buttons, inputs, and cards. Use `rounded-md` (`8px`) only for modal windows and elevated dialogs. True pill shapes are prohibited.
- **Tabular Lining Numbers**: Always apply `font-mono` (`Inter`) with `tabular-nums` styling to financial figures, APYs, balances, and metrics.

---

## Error Handling & Resilience

- **Component Error Boundaries**: Wrap all 3D WebGL canvases and dynamic asset sub-views in an `ErrorBoundary` that renders a graceful, dark-themed fallback banner with a manual reload trigger rather than crashing the page shell.
- **Graceful Math Fallbacks**: Compounding returns math and currency formatters must catch NaN or out-of-range inputs and fail-safe to formatted default values (e.g., `$0.00`).
- **Security Invariant**: Never leak internal component stack traces or unhandled promise rejections to the client UI.
- 5. **Secure Error Handling**: Client responses must never leak stack traces, internal errors, or infrastructure details. Handle exceptions or route to global handlers securely.

---

## Logging & Telemetry

- Instrument view-swap telemetry (`telemetry.trackViewSwapped(assetId, source)`) to monitor navigation flows.
- Sanitize and redact all user-entered email addresses, passwords, and 6-digit OTP codes prior to logging.
- 6. **Secure Logging**: All emitted logs must redact PII, authorization tokens, secrets, and private credentials.

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

## Testing & Quality Assurance

- **Unit Tests (`Tests/UnitTest/<test-name>/`)**:
  - `Tests/UnitTest/returns-math/`: Verify compounding returns calculations, APY logic, and slider boundary handling.
  - `Tests/UnitTest/formatters/`: Verify currency, tabular lining figures, and BPS formatting across edge cases.
  - `Tests/UnitTest/store/`: Validate Zustand state transitions (active tab, modal steps, theme changes).
- **Integration Tests (`Tests/IntegrationTest/<test-name>/`)**:
  - `Tests/IntegrationTest/hash-routing/`: Verify URL hash changes accurately swap the dynamic panel in under 50ms.
  - `Tests/IntegrationTest/auth-modal/`: Verify the 2-step modal opens, switches between Step 1 and Step 2 OTP, and traps focus correctly.
  - `Tests/IntegrationTest/theme-engine/`: Verify dark/light theme switching persists to `localStorage`.
