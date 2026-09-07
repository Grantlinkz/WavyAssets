# Sprint 1 Implementation Prompt: Foundation, Design Tokens, Theme Engine & Financial Formatters

## Unit Overview
- **Sprint**: Sprint 1 (Week 1)
- **Unit**: Foundation, Design Tokens, Theme Engine & Formatters
- **Target Files**:
  - `index.html`
  - `src/index.css`
  - `src/store/useTerminalStore.ts`
  - `src/lib/formatters.ts`
  - `src/components/common/BrandLogo.tsx`
  - `src/components/nav/ThemeToggle.tsx`
  - `src/App.tsx`
  - `Tests/UnitTest/formatters.test.ts`
  - `Tests/UnitTest/store.test.ts`
  - `.ai/progress-tracker.md`

---

## 1. Context & Specifications Reference
- **`tools/Implementation Strategy And Timeline.pdf`**: Sprint 1 goals, SLA definitions, design system baseline.
- **`tools/UI/1 global/DESIGN.md`**: Sovereign Institutional Terminal Obsidian Dark palette (`#08090B`, `#0F1115`, `#161920`, `#222632`, `#3A4050`, `#D4AF37`, `#00C288`, `#FF4D4D`), typography hierarchy (`Inter` + `JetBrains Mono`), micro-chamfer geometry (`0.25rem` / `4px` default, `0.5rem` / `8px` for modals, no pills >8px).
- **`tools/UI/1 global light/DESIGN.md`**: Sovereign Fiduciary Light palette (`surface: #f9f9ff`, `canvas-parchment: #fcfbf9`, `surface-panel: #f5f3ef`, `ink-obsidian: #111317`, `gold-bright: #bfa044`, `emerald: #006d42`, `border-hairline: #d8d4cc`).
- **`tools/UI/1a global logo/code.html`**: Institutional vector badge SVG geometry with polygon vault crest, AURA ASSETS typography, and green SECURED indicator.
- **`tools/UI/1 valiance_institutional_terminal_multi_asset_wealth_management/code.html`**: Header strip, live syndicate ticker, terminal workspace layouts and color class names.

---

## 2. Planned Changes & Implementation Steps

### A. Typography & Base Metadata (`index.html`)
- Update document `<title>` to: `"Valiance / Aura Assets — Sovereign Multi-Asset Institutional Terminal"`.
- Set descriptive meta tags for institutional wealth management and digital custody.
- Preconnect Google Fonts and load `Inter:wght@400;500;600;700` and `JetBrains Mono:wght@400;500;600` with `display=swap`.

### B. Sovereign Institutional Design System & CSS Variables (`src/index.css`)
- Configure Tailwind CSS v4 `@theme` block extending colors for:
  - Surface hierarchy: `surface`, `surface-dim`, `surface-bright`, `surface-container-lowest`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`
  - Brand accents: `primary` (`#D4AF37`), `primary-container`, `primary-hover` (`#E5C158`), `secondary` (`#00C288` yield green), `destructive` / `error` (`#FF4D4D` risk red), `outline` (`#222632`), `outline-focus` (`#3A4050`)
  - Border radius tokens: micro-chamfer `--radius: 0.25rem` (`4px`), `--radius-lg: 0.5rem` (`8px`). Strictly prohibit generic pill styling (`>8px`).
  - Typography families: `--font-sans: Inter, sans-serif`, `--font-mono: "JetBrains Mono", monospace`.
- Configure `:root` (Light / Sovereign Fiduciary) and `.dark` (Dark / Obsidian Void) variables.
- Configure utility classes for tabular monetary numbers (`font-mono tabular-nums`) and uppercase category tags (`font-sans uppercase tracking-[0.08em]`).
- Clean out default Vite starter styling (`#root`, `#spacer`, etc.).

### C. Terminal State Machine Store (`src/store/useTerminalStore.ts`)
- Build typed Zustand store:
  - `theme`: `'dark' | 'light' | 'system'` (persisted to `localStorage` key `'wavy_theme'`, synchronizing `document.documentElement.classList`).
  - `activeAssetId`: `'crypto' | 'stocks' | 'ai-funds' | 'real-estate' | 'vip-cards' | 'cars' | 'wallet'` (with client-side hash synchronization).
  - `authModal`: `{ isOpen: boolean; step: 1 | 2; initialTier?: 'private-wealth' | 'institutional' }`.
  - `trustMode`: `'private-wealth' | 'institutional'`.
  - `simulator`: `{ capital: number; aggressiveness: number }` with defaults ($250,000, aggressiveness 3).
- Implement clean, redacted logging for state actions where applicable.

### D. Institutional Financial Formatters (`src/lib/formatters.ts`)
- Provide bulletproof, localized, sanitized tabular formatting functions:
  - `formatCurrency(val: number, currency?: string, decimals?: number): string`
  - `formatPercent(val: number, includeSign?: boolean, decimals?: number): string`
  - `formatBps(val: number): string`
  - `formatCompactNumber(val: number): string` (e.g. `$4.82B`)
- Ensure all outputs guarantee compatibility with `JetBrains Mono` and `tabular-nums`.

### E. Brand Logo & Theme Toggle Components
- **`src/components/common/BrandLogo.tsx`**: Vector brand component based on `tools/UI/1a global logo/code.html`, fully scalable with dark/light dynamic styling.
- **`src/components/nav/ThemeToggle.tsx`**: Accessible, micro-chamfered toggle button with smooth icon transition (`lucide-react` Sun/Moon) and keyboard focus trap.

### F. Foundation Shell Mounting (`src/App.tsx`)
- Mount the foundational shell verifying theme switching, font loading, design tokens, and live ticker stream stub.

### G. Unit Testing & Verification
- Create tests in `Tests/UnitTest/formatters.test.ts` to validate financial numbers, APYs, BPS, and negative values.
- Create tests in `Tests/UnitTest/store.test.ts` to validate state transitions and theme persistence.
- Run `tsc -b`, `npm run lint`, and `npm test` / Vitest.
- Update `.ai/progress-tracker.md`.

---

## 3. Acceptance Criteria
1. **Zero CLS & Visual Conformity**: Tokens match `tools/UI/1 global/DESIGN.md` and `tools/UI/1 global light/DESIGN.md`.
2. **Typography Integrity**: Tabular lining figures render in `JetBrains Mono`; headers/badges in `Inter`.
3. **Strict Radius Rule**: Micro-chamfers adhere to `4px` (`0.25rem`) and `8px` (`0.5rem`). No pills (`>8px`).
4. **Theme Engine**: Seamless toggling between Obsidian Dark and Luxury Light with zero flicker and localStorage sync.
5. **Quality Gates**: `tsc -b` passes with 0 errors; Vitest test suites pass; linter clean.
