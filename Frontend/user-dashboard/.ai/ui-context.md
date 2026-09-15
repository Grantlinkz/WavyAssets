# UI Context — WavyAssets Sovereign Institutional User Dashboard

## Visual Theme & Design Philosophy

The design system establishes a **Sovereign Institutional Terminal** for ultra-high-net-worth allocators, family offices, and institutional fund managers. In harmony with Swiss private bank rigor and physical vault aesthetics, this interface prioritizes extreme data density, spatial calm, and high contrast without sensory fatigue.

- **Obsidian Dark (Default)**: Deep obsidian canvas (`#101319` / `#08090B`) engineered to eliminate eye fatigue during extended portfolio management sessions.
- **Luxury Light (Theme Mode)**: Crisp, high-trust private wealth daylight aesthetic (`#F9F9FF`, `#D5DAE7`) with refined hairline borders.
- **Tonal Stratification**: Structural depth is achieved purely through layered surface containers (`#0B0E14` -> `#191C22` -> `#1D2026` -> `#272A30`) and hairline 1px borders (`#232A38` / `#4D4635`) rather than blurred drop shadows.
- **Scarcity of Accent**: Bullion Gold (`#D4AF37` / `#F2CA50`) is reserved exclusively for sovereign actions, active tab indicators, and primary execution triggers.
- **Anti-SaaS-Slop Principle**: Strictly zero purple neon glows, zero floating orbs, zero cartoon gamification, and zero empty hero bloat.

---

## Color Tokens & Palette (`tools/UI/# sovereign_asset_terminal/DESIGN.md`)

| Token Role | Obsidian Dark Value | Luxury Light Value | Description |
| :--- | :--- | :--- | :--- |
| **`surface`** | `#101319` / `#08090B` | `#F9F9FF` | Primary background canvas |
| **`surface-container-lowest`** | `#0B0E14` | `#FFFFFF` | Deepest inset well / background grid |
| **`surface-container-low`** | `#191C22` | `#F0F3FA` | Primary data module container |
| **`surface-container`** | `#1D2026` | `#E8EDF5` | Standard card surface |
| **`surface-container-high`** | `#272A30` | `#DDE3EC` | Hovered rows, elevated modules |
| **`surface-container-highest`**| `#32353B` | `#D3DAE4` | Active tabs, popover flyouts |
| **`on-surface`** | `#E1E2EB` | `#101319` | High-contrast primary text and values |
| **`on-surface-variant`** | `#D0C5AF` / `#9CA3AF`| `#4A5568` | Column headers, descriptions, timestamps |
| **`outline` / `border-hairline`**| `#232A38` / `#4D4635`| `#E2E8F0` | Razor-sharp 1px structural dividing lines |
| **`primary` (Sovereign Gold)** | `#F2CA50` / `#D4AF37` | `#926F13` | Primary brand accent & execution triggers |
| **`tertiary` (Emerald Gain)** | `#53DC98` / `#5FE7A2` | `#006D42` | Positive delta, APY gains, capital inflows |
| **`error` (Ruby Drawdown)** | `#FFB4AB` | `#BA1A1A` | Negative delta, drawdown alerts, circuit breaker |

---

## Typography

| Style Hierarchy | Font Family | Weight | Size / Line-Height | Tracking & Alignment |
| :--- | :--- | :--- | :--- | :--- |
| **Headline XL** | `Noto Serif` | Medium (500) | `2.25rem` / `2.75rem` | `-0.02em` |
| **Headline LG** | `Noto Serif` | Medium (500) | `1.75rem` / `2.25rem` | `-0.015em` |
| **Headline MD** | `Noto Serif` | Medium (500) | `1.25rem` / `1.75rem` | `-0.01em` |
| **Headline SM** | `Noto Serif` | Medium (500) | `1.05rem` / `1.5rem` | `0em` |
| **Data Metric LG** | `Inter` | Semibold (600) | `1.5rem` / `1.75rem` | `-0.02em`, `tabular-nums` |
| **Data Metric MD** | `Inter` | Semibold (600) | `1.125rem` / `1.375rem`| `-0.01em`, `tabular-nums` |
| **Body LG / MD** | `Inter` | Regular (400) | `1.0rem` / `0.875rem` | `-0.005em` |
| **Label Caps / Badges**| `Inter` | Semibold (600) | `0.6875rem` / `0.875rem`| `+0.06em`, Uppercase |

---

## Geometry & Corner Radii

- **Precision Micro-Chamfer (`0.25rem` / `4px`)**: Mandatory default for all panels, cards, data rows, action buttons, and inputs.
- **Subtle Chamfer (`0.125rem` / `2px`)**: Applied to badges, table cell tags, and status chips.
- **Elevated Modals (`0.5rem` / `8px`)**: Reserved exclusively for modal dialogs (`DepositModal`, `WithdrawModal`, `TradeModal`, `KycDrawer`).
- **Prohibition**: Generic consumer pill shapes (>8px) are **strictly forbidden**.

---

## Key Screen Component Specifications

### 1. Universal Global Command Bar
- Mounted persistently directly below header navigation across all views.
- **Cell 1: Consolidated Net Worth**: Primary balance display ($14,820,450.00) with dynamic 24h P&L chip (+$184,210.40 / +1.26% emerald) and timeframe selector (`1D | 1W | 1M | 1Y | ALL`).
- **Cell 2: Interactive Allocation Preview**: Mini 3D radial donut visualizer displaying weights across the 7 verticals.
- **Cell 3: Privacy Eyeball Toggle**: Clicking toggles `maskBalances`, instantly masking numbers into `••••••••`.
- **Cell 4: Global Action Rail**: High-contrast micro-chamfered action buttons: `[Deposit]`, `[Withdraw]`, `[Trade / Swap]`, `[Tier 3 Verified]`.

### 2. Left-Hand Vertical Navigation Rail
- Docked left rail (64px collapsed icon rail / 220px expanded).
- Direct access to: Overview, Crypto, Global Stocks, AI Funds, Real Estate, Exotic Cars, VIP Cards, Wallet, Compliance & Tax, Security.
- Active item indicated by a left 2px Sovereign Gold accent and elevated surface tint (`#1D2026`).

### 3. Rapid Execution Modal Suite (`tools/UI/#11 wavyassets_sovereign_modal_overlays_rapid_execution_suite`)
- **Deposit Modal**: Multi-currency rails (Fedwire/SWIFT, SEPA, USDC/USDT on-chain deposit address with QR code).
- **Withdraw Modal**: Whitelist address selector, dynamic gas/wire fee calculator, mandatory 2FA / WebAuthn confirmation.
- **Trade / Swap Modal**: Asset pair selector, real-time FX/AMM rate quote, slippage tolerance settings.
- **Whitelist Lock Modal**: Address submission requiring WebAuthn verification and enforcing the **24-to-48 hour lock timer**.
