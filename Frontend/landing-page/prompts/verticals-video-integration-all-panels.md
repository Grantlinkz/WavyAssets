# Implementation Prompt: Verticals Video Integration for Remaining 6 Asset Panels

## Objective
Replace the static benchmark/metrics blocks on the right of the hero section in the remaining 6 asset vertical panels (`CryptoPanel`, `StocksPanel`, `RealEstatePanel`, `CarsPanel`, `VipCardsPanel`, `WalletPanel`) with continuous, autoplaying MP4 video loops from `src/assets/verticals/`, matching each vertical by filename. Apply Framer Motion opposing kinematics and institutional telemetry frames across all 6 panels.

---

## Technical Specifications & Architecture

### 1. Video Asset Mapping & Video Configuration
Each panel imports its corresponding MP4 asset from `src/assets/verticals/`:
1. **CryptoPanel**: `src/assets/verticals/crypto.mp4` (`data-testid="crypto-video"`)
   - Top Pill Badge: `LIVE | CRYPTO YIELD VAULT`
   - Bottom Telemetry Bar: `30-DAY AVERAGE YIELD: 19.4% APY | AAA COLD STORAGE`
2. **StocksPanel**: `src/assets/verticals/stock.mp4` (`data-testid="stocks-video"`)
   - Top Pill Badge: `LIVE | DIRECT MARKET ACCESS`
   - Bottom Telemetry Bar: `LOW-LATENCY EQUINIX NY4 | PRE-IPO ALLOCATIONS`
3. **RealEstatePanel**: `src/assets/verticals/real estate.mp4` (`data-testid="real-estate-video"`)
   - Top Pill Badge: `LIVE | PRIME REAL ESTATE`
   - Bottom Telemetry Bar: `TOKENIZED TITLE DEEDS | 100% LEASED OCCUPANCY`
4. **CarsPanel**: `src/assets/verticals/cars.mp4` (`data-testid="cars-video"`)
   - Top Pill Badge: `LIVE | EXOTIC CAR VAULT`
   - Bottom Telemetry Bar: `CLIMATE CONTROLLED 19°C | HERITAGE HOROLOGY & AUTO`
5. **VipCardsPanel**: `src/assets/verticals/vip cards.mp4` (`data-testid="vip-cards-video"`)
   - Top Pill Badge: `LIVE | VIP CONCIERGE & CARDS`
   - Bottom Telemetry Bar: `ASSET-BACKED LINE | 0.00% ZERO-FX SURCHARGE`
6. **WalletPanel**: `src/assets/verticals/wallet.mp4` (`data-testid="wallet-video"`)
   - Top Pill Badge: `LIVE | MULTI-SIG MPC CUSTODY`
   - Bottom Telemetry Bar: `3-OF-5 MULTI-KEY SECURITY | $500M UNDERWRITTEN VAULT`

### 2. Video Player Invariants
- `autoPlay={true}`
- `loop={true}`
- `muted={true}`
- `playsInline={true}`
- `preload="auto"`
- Strict absence of `controls` attribute (zero play, pause, or seek buttons).
- Mounted with `useRef` and silent catch on `.play()` for resilient autoplay policy handling across browsers.
- Dimensioned Obsidian container (`w-full h-[260px] sm:h-[280px] rounded-sm bg-surface-container-lowest border border-outline/30 shadow-lg group hover:border-primary/50 transition-all duration-300`) to ensure zero Cumulative Layout Shift (CLS = 0).

### 3. Motion & Physics (`framer-motion`)
- **Left Column**:
  - `initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}`
  - `whileInView={{ opacity: 1, x: 0 }}`
  - `viewport={{ once: true, amount: 0.2 }}`
  - `transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}`
  - `style={{ willChange: 'transform, opacity' }}`
- **Right Column (Video Container)**:
  - `initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 30, scale: shouldReduceMotion ? 1 : 0.98 }}`
  - `whileInView={{ opacity: 1, x: 0, scale: 1 }}`
  - `viewport={{ once: true, amount: 0.2 }}`
  - `transition={{ duration: 0.85, delay: shouldReduceMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}`
  - `style={{ willChange: 'transform, opacity' }}`
- Respects `useReducedMotion()` for accessibility compliance.

---

## Files to Modify
1. `src/components/panels/views/CryptoPanel.tsx`
2. `src/components/panels/views/StocksPanel.tsx`
3. `src/components/panels/views/RealEstatePanel.tsx`
4. `src/components/panels/views/CarsPanel.tsx`
5. `src/components/panels/views/VipCardsPanel.tsx`
6. `src/components/panels/views/WalletPanel.tsx`
7. `Tests/IntegrationTest/assetPanelsAndAuthIntegration.test.tsx` (Add video assertions across all 7 panels)
8. `.ai/progress-tracker.md`

---

## Acceptance Criteria
- [ ] All 6 remaining panels have continuous, autoplaying videos from `src/assets/verticals/` matching their names.
- [ ] All videos loop infinitely without displaying play/pause controls.
- [ ] Opposing Framer Motion animations implemented across all 6 panels with `useReducedMotion()` fallback.
- [ ] Zero layout shift (CLS = 0) with pre-dimensioned containers.
- [ ] Full type safety (`tsc -b`), linting (`npm run lint`), and 100% test pass rate across all 15 Vitest suites.
- [ ] Minimum two conventional git commits logged.
