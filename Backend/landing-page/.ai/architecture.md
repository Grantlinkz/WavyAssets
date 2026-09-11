# Architecture Context — WavyAssets Institutional Terminal

## Technical Stack

| Layer                  | Technology                                                  | Role                                                                                           |
| :--------------------- | :---------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| **Runtime & Bundler**  | Vite 8 + React 19 + TypeScript (strict)                     | Ultra-fast HMR, ES module bundling, strict type safety                                         |
| **Styling & Tokens**   | Tailwind CSS v4 (`@tailwindcss/postcss`) + `tw-animate-css` | Atomic utility styling, CSS custom property design tokens, dark/light modes                    |
| **UI Primitives**      | shadcn/ui + Radix UI Primitives                             | Accessible headless components (`Dialog`, `Slider`, `NavigationMenu`, `Skeleton`, `Input-OTP`) |
| **3D & WebGL**         | Three.js (0.185) + React Three Fiber (9.7) + Drei (10.7)    | Non-blocking kinetic ambient cursor mesh, 3D radial allocation donut visualizer                |
| **Animations**         | Framer Motion (13.2)                                        | 60 FPS spring transitions, 3D card perspective tilt, layout crossfades                         |
| **State Management**   | Zustand (5.0)                                               | High-performance reactive state (active asset route, simulator params, auth modal state)       |
| **Typography & Icons** | Lucide React + Google Fonts (`Noto Serif` + `Inter`)        | Sovereign serif navigation/headers, tabular financial monospace typography                     |
| **Testing**            | Vitest + React Testing Library + jsdom                      | Isolated unit testing and DOM integration validation                                           |

---

## Directory Boundaries & Component Ownership

```
src/
├── components/
│   ├── 3d/                 # WebGL & Three.js graphics (AmbientCanvas.tsx, DonutChart3D.tsx)
│   ├── auth/               # Root-mounted modal (UnifiedAuthModal.tsx: Step 1 -> Step 2 OTP)
│   ├── footer/             # GlobalFooter.tsx, RegulatoryNotice.tsx, NewsletterCapture.tsx
│   ├── hero/               # HeroTerminal.tsx, MatrixStatsTicker.tsx
│   ├── nav/                # GlobalHeader.tsx, ServicesMegaMenu.tsx, ThemeToggle.tsx
│   ├── panels/             # Standardized dynamic asset sub-views & routing wrapper:
│   │   ├── AssetContainer.tsx   # Wrapper frame, skeleton loader, hash router sync
│   │   ├── CryptoPanel.tsx      # Algorithmic yield flow & execution mesh
│   │   ├── StocksPanel.tsx      # Pre-IPO allocations & order book depth
│   │   ├── AiFundsPanel.tsx     # Quantitative alpha strategies & backtests
│   │   ├── RealEstatePanel.tsx  # Tokenized luxury real estate holdings
│   │   ├── VipCardsPanel.tsx    # Obsidian metal card tier benefits & FX rates
│   │   ├── CarsPanel.tsx        # Exotic & historical vehicle vault inventory
│   │   └── WalletPanel.tsx      # MPC digital custody vault & proof of reserves
│   ├── simulator/          # PortfolioSimulator.tsx, DualSliderControls.tsx, ReturnsMath.ts
│   ├── trust/              # ClientVoices.tsx, AuditProofCards.tsx, TierSwitcher.tsx
│   └── ui/                 # Atomic shadcn primitives (button, dialog, slider, etc.)
├── lib/
│   ├── utils.ts            # Class merging utility (clsx + twMerge)
│   ├── math.ts             # Compound returns, APY, Sharpe ratio calculation formulas
│   ├── formatters.ts       # Tabular currency, BPS, percentage formatting with i18n fallbacks
│   └── telemetry.ts        # Navigation telemetry & view duration trackers
├── store/
│   └── useTerminalStore.ts # Zustand global store (activeTab, authModalOpen, simValues, theme)
└── index.css               # Design tokens, CSS custom properties, typography rules
```

---

## State & Storage Model

1. **Client-Side Hash State (`window.location.hash`)**:
   - Manages bookmarkable asset sub-views (`#/services/:assetId` where `assetId` ∈ `crypto`, `stocks`, `ai-funds`, `real-estate`, `vip-cards`, `cars`, `wallet`).
   - Deep-linking enabled: navigating to `#/services/crypto` automatically activates the correct tab and scrolls to the AssetContainer.
   - Synchronized via `popstate` and `hashchange` event listeners.

2. **Zustand In-Memory Store (`useTerminalStore`)**:
   - `activeAssetId`: Currently rendered vertical in the dynamic panel.
   - `authModal`: State (`isOpen`, `step: 1 | 2`, `credentials`, `otpCode`).
   - `simulator`: Allocation amount ($10,000–$10,000,000), aggressiveness index (1–5), calculated outputs.
   - `trustMode`: Toggle state (`private-wealth` | `institutional`).
   - `theme`: Active color palette (`dark` | `light` | `system`).

3. **Local Storage (`localStorage`)**:
   - `wavy_theme`: Cached theme preference (`dark` | `light`).
   - `wavy_locale`: Regional number and currency format override.

---

## Non-Negotiable Architectural Invariants

1. **Sub-50ms Panel Swap Latency**: Asset panel transitions must execute in under 50ms without hard page reloads.
2. **Zero Cumulative Layout Shift (CLS)**: The `AssetContainer` must enforce an explicit `min-height: 540px` and display pre-dimensioned skeleton loaders during chunk switches.
3. **GPU & WebGL Lifecycle Safety**:
   - Three.js geometries, materials, textures, and custom shaders must be explicitly disposed of in `useEffect` cleanup hooks when unmounted.
   - The WebGL animation loop must throttle down to low refresh rates when the tab loses visibility (`document.hidden`) or when canvas elements are out of the viewport.
4. **Tabular Lining Figures**: All financial figures, APYs, tickers, and balance numbers must render using `Inter` with tabular lining numbers to prevent layout jitter during real-time updates.
5. **Decoupled 3D Rendering**: Heavy Three.js computations must never block the main UI thread or interfere with DOM click/touch responsiveness.
6. **Strict Error Boundaries**: Unhandled component rendering errors in dynamic sub-views or 3D canvases must be caught by an `ErrorBoundary` that renders a graceful fallback UI without crashing the global shell.
7. **Secure Error Handling**: Client responses must never leak stack traces, internal errors, or infrastructure details. Handle exceptions or route to global handlers securely.
8. **Secure Logging**: All emitted logs must redact PII, authorization tokens, secrets, and private credentials.

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
