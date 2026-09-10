# Sprint 3 Implementation Prompt: Interactive Portfolio Simulator & 3D Allocation Donut

## Unit Overview
- **Sprint**: Sprint 3 (Week 3)
- **Unit**: Interactive Portfolio Simulator, Compounding Yield Engine, 3D Allocation Donut & Asset Discovery Hub
- **Target Files**:
  - `src/lib/calculator.ts` [NEW]
  - `src/components/simulator/DonutChart3D.tsx` [NEW]
  - `src/components/simulator/PortfolioSimulator.tsx` [NEW]
  - `src/components/discovery/AssetDiscoveryHub.tsx` [NEW]
  - `src/App.tsx` [MODIFY]
  - `Tests/UnitTest/calculator.test.ts` [NEW]
  - `Tests/IntegrationTest/simulatorIntegration.test.tsx` [NEW]
  - `.ai/progress-tracker.md` [MODIFY]

---

## 1. Context & Specifications Reference
- **`tools/Implementation Strategy And Timeline.pdf`**: Sprint 3 milestones: dual Radix slider controls (Capital: $10k–$10M, Aggressiveness: 1–3 modes), real-time compounding return calculation engine with monospaced tabular metrics, 3D radial donut visualizer with reactive segment animations, and zero CLS layout.
- **`tools/UI/3 aura_assets_interactive_tools_asset_discovery_hub/code.html`**:
  - Command Deck: Institutional Status Strip with NY4.EQUINIX / Merkle proof route, latency (0.28ms), Tier-1 Multi-Custody audit badge.
  - Section Hero: Institutional eyebrow `[ INTERACTIVE ENGINE // REAL-TIME CROSS-ASSET YIELD MATRIX ]`, headline, subtitle, quick metrics strip ($1.482B AUM Mapped, 2.91 Mean 3Y Sharpe).
  - 2-Column Obsidian Console:
    - Left: Capital Allocation slider ($50k–$10M, step $25k) with quick select chips ($100k, $250k, $500k, $1.0M, $5.0M), Strategy Mandate & Risk Posture slider (1: Capital Preservation 8.6%, 2: Balanced Growth 14.2%, 3: Maximum Alpha 22.4%), parameter chips (Continuous Epoch Rebalance, Zurich/NY4 Equinix Enclave, 1:1 Non-Hypothecated Cross-Margin).
    - Right: Blended Exposure & Return Matrix with Radial Donut Visualizer, segment breakdown (Bonded Hypercars & Gold, AI H100 GPU Lease Arbitrage, DMA Equities & Swiss Staking), estimated 12-month net return and monthly runrate, Risk Metrics Matrix (Max Drawdown -3.2%, Sharpe Ratio 2.86, Capital Shield Tier-1 Lloyds), and action buttons (`Lock Mandate & Export Simulation (PDF)`, `Custom Weights`).
  - Dynamic Discovery Verticals Hub: Segmented horizontal tabs for the 7 vault classes (`crypto`, `stocks`, `ai-funds`, `real-estate`, `cars`, `vip-cards`, `wallet`) with active depository details and cadastre proof.
- **`GEMINI.md`**: Micro-chamfer geometry (`4px` / `0.25rem` default, `8px` / `0.5rem` for elevated panels, no pills >8px), Obsidian Dark (`#08090B`) / Luxury Light (`#f9f9ff`), `JetBrains Mono` tabular lining figures, sub-50ms panel swaps, and zero CLS (`min-height: 540px`).

---

## 2. Planned Changes & Implementation Steps

### A. Mathematical Return Calculation Engine (`src/lib/calculator.ts`)
- Implement institutional calculation algorithms:
  - Risk Posture definitions:
    1. **Capital Preservation**: 8.6% Blended APY (Exposure: 50% Gold/Hypercars, 30% DMA Equities, 20% AI GPU; Max Drawdown: -1.8%, Sharpe: 3.42)
    2. **Balanced Growth**: 14.2% Blended APY (Exposure: 35% Gold/Hypercars, 40% AI GPU, 25% DMA Equities; Max Drawdown: -3.2%, Sharpe: 2.86)
    3. **Maximum Alpha**: 22.4% Blended APY (Exposure: 20% Gold/Hypercars, 55% AI GPU, 25% DMA Equities; Max Drawdown: -6.4%, Sharpe: 2.28)
  - Functions:
    - `calculatePortfolioMetrics(capital: number, aggressiveness: number)`:
      - `blendedApy`: percentage rate
      - `annualReturn`: `capital * (blendedApy / 100)`
      - `monthlyRunrate`: `annualReturn / 12`
      - `projectedValue`: `capital + annualReturn`
      - `weights`: segment breakdown with percentages
      - `riskMetrics`: Max Drawdown, Sharpe Ratio, Capital Shield Underwriting
- Guarantee high precision tabular numbers compatible with `JetBrains Mono`.

### B. 3D Radial Donut Visualizer (`src/components/simulator/DonutChart3D.tsx`)
- High-performance SVG + 3D radial donut visualizer with smooth Framer Motion transitions:
  - Dynamic stroke-dasharray and stroke-dashoffset responsive to active strategy weights.
  - Hover highlights and segment tooltips.
  - Center readout: Blended APY metric in `JetBrains Mono` with pulsing emerald indicator.
  - Exposure breakdown legend rows with color chips (Sovereign Gold, Secondary Teal, High-Beta Emerald).

### C. Portfolio Simulator Console (`src/components/simulator/PortfolioSimulator.tsx`)
- 2-Column Obsidian Console:
  - Left:
    - Header with live UTC timestamp.
    - Capital slider using shadcn/Radix Slider with range $50k–$10,000,000.
    - Quick-select buttons ($100k, $250k, $500k, $1.0M, $5.0M).
    - Risk Posture slider (1 to 3: Capital Preservation, Balanced Growth, Maximum Alpha).
    - Rebalance, Enclave, and Cross-Margin parameter badges.
  - Right:
    - DonutChart3D visualizer with blended exposure.
    - Big-impact projected readout: Estimated 12-Month Net Return, Monthly Runrate (`+$X,XXX / Mo`), Tax Alpha Stripped note.
    - Risk metrics strip: Max 3-Yr Drawdown, Sharpe Ratio, Capital Shield Lloyds.
    - CTAs: `Lock Mandate & Export Simulation (PDF)` (triggers auth modal), and `Custom Weights`.

### D. Dynamic Asset Discovery Hub (`src/components/discovery/AssetDiscoveryHub.tsx`)
- Section header with verified physical and digital vaults status.
- Horizontal segmented tabs for the 7 vault classes:
  - `crypto` (01 // CRYPTO)
  - `stocks` (02 // EQUITIES)
  - `ai-funds` (03 // COMPUTE)
  - `real-estate` (04 // ESTATES)
  - `cars` (05 // DEPOSITORY)
  - `vip-cards` (06 // PRIVILEGE)
  - `wallet` (07 // TREASURY)
- Interactive depository overview card displaying active inventory, audit verification cadastre, Freeport vault depository details, and direct deep-link to the asset panel (`#/services/:assetId`).

### E. App Integration (`src/App.tsx`)
- Mount Institutional Status Strip & Command Deck.
- Mount Section Hero & Portfolio Simulator Console with explicit `id="simulator"`.
- Mount Dynamic Asset Discovery Hub.
- Enforce strict `min-height: 540px` and zero CLS.

### F. Unit & Integration Testing
- **`Tests/UnitTest/calculator.test.ts`**:
  - Test calculation formulas across all 3 risk postures.
  - Test capital scale edge cases ($50k, $250k, $10M).
  - Verify monthly run-rate and annual returns add up deterministically.
- **`Tests/IntegrationTest/simulatorIntegration.test.tsx`**:
  - Test slider interactions and state synchronization with Zustand store.
  - Verify metric recalculations update displayed values.
  - Verify tab switching in Asset Discovery Hub updates `activeAssetId` and URL hash.
- Run `node ./node_modules/typescript/bin/tsc -b`, `npm run lint`, and `npm test`.
- Update `.ai/progress-tracker.md`.

---

## 3. Acceptance Criteria
1. **Mathematical Accuracy**: Yields and run-rates calculated deterministically to the exact dollar.
2. **Typography & Layout**: Financial figures displayed in `JetBrains Mono` tabular lining; micro-chamfer geometry strictly 4px/8px with zero pills (>8px).
3. **Reactive Visualizer**: DonutChart segments dynamically resize on slider input without layout lag or CLS.
4. **State Synchronization**: Capital and aggressiveness persist to Zustand `simulator` state and react in <50ms.
5. **Quality Gates**: All Vitest unit and integration tests pass (100%); TypeScript compiles with 0 errors (`tsc -b`); ESLint clean.
