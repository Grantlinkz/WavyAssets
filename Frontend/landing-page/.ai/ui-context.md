# UI Context — WavyAssets Institutional Terminal

## Visual Theme & Philosophy

The design system establishes a **Sovereign Institutional Terminal** for elite multi-asset wealth management and digital custody. Drawing from Swiss typographic rigor, physical vault architecture, and ultra-high-performance financial command terminals, this system prioritizes extreme information density without sensory fatigue.

- **Obsidian Foundation**: Deep near-black background engineered to eliminate eye strain across marathon monitoring sessions.
- **Architectural Depth**: Structural depth is achieved purely through **tonal stratification** and **subtle 1px hairline boundaries** (`#222632`) rather than heavy elevation dropshadows.
- **Scarcity of Accent**: Bullion Gold (`#D4AF37`) is deployed with strict restraint—reserved exclusively for sovereign execution triggers, active states, and high-tier portfolio indicators.
- **Dual Typographic Pairing**: Sovereign Swiss serif typography (`Noto Serif`) for structural navigation and headers combined with relentless tabular monospaced figures (`Inter`) for all financial data.

---

## Color Tokens (Obsidian Dark Mode — Default)

| Token Role              | CSS Variable           | Value                      | Description                                  |
| :---------------------- | :--------------------- | :------------------------- | :------------------------------------------- |
| **Canvas Base**         | `--bg-base`            | `#08090B`                  | Primary zero-elevation background canvas     |
| **Panel Surface**       | `--bg-surface-1`       | `#0F1115`                  | Secondary layer for data modules & grids     |
| **Elevated Surface**    | `--bg-surface-2`       | `#161920`                  | Hover states, active tabs, nested cells      |
| **Subtle Border**       | `--border-default`     | `#222632`                  | Crisp 1px structural dividing lines          |
| **Active/Focus Border** | `--border-focus`       | `#3A4050`                  | Selected panes and focused input boundaries  |
| **Sovereign Gold**      | `--accent-gold`        | `#D4AF37`                  | Primary brand accent & execution triggers    |
| **Gold Hover**          | `--accent-gold-bright` | `#E5C158`                  | Hover state for gold triggers                |
| **Gold Muted Wash**     | `--accent-gold-wash`   | `rgba(212, 175, 55, 0.08)` | Active matrix selection & tab highlight      |
| **Emerald Yield**       | `--state-yield`        | `#00C288`                  | Positive delta, capital inflow, APY gains    |
| **Emerald Wash**        | `--state-yield-wash`   | `rgba(0, 194, 136, 0.10)`  | Positive spread badge backgrounds            |
| **Crimson Risk**        | `--state-risk`         | `#FF4D4D`                  | Negative delta, drawdown risk, margin alerts |
| **Crimson Wash**        | `--state-risk-wash`    | `rgba(255, 77, 77, 0.10)`  | Risk indicator badge backgrounds             |
| **Text Primary**        | `--text-primary`       | `#F3F4F6`                  | High-contrast headers, critical figures      |
| **Text Secondary**      | `--text-secondary`     | `#9CA3AF`                  | Column headers, descriptions, metadata       |
| **Text Tertiary**       | `--text-muted`         | `#4B5563`                  | Inactive timestamps, grid axes, units        |

_(Luxury Light Mode shifts canvas to `#F8F9FA`, surfaces to `#FFFFFF`, borders to `#E5E7EB`, and text to `#111827`, with Gold shifting to `#B89324`.)_

---

## Typography

| Context                 | Font Family  | Size / Leading | Weight         | Letter Spacing        |
| :---------------------- | :----------- | :------------- | :------------- | :-------------------- |
| **Headline XL**         | `Noto Serif` | 32px / 38px    | 600 (Semibold) | `-0.02em`             |
| **Headline LG**         | `Noto Serif` | 24px / 30px    | 600 (Semibold) | `-0.015em`            |
| **Headline SM**         | `Noto Serif` | 18px / 24px    | 500 (Medium)   | `-0.01em`             |
| **Label Caps (Badges)** | `Noto Serif` | 11px / 14px    | 600 (Semibold) | `+0.08em` (Uppercase) |
| **Data Metric LG**      | `Inter`      | 28px / 32px    | 600 (Semibold) | `-0.02em` (Tabular)   |
| **Data Metric MD**      | `Inter`      | 18px / 24px    | 500 (Medium)   | `-0.01em` (Tabular)   |
| **Body MD (Data)**      | `Inter`      | 13px / 18px    | 400 (Regular)  | `0em`                 |
| **Body SM (Data)**      | `Inter`      | 12px / 16px    | 400 (Regular)  | `0em`                 |
| **Data Micro**          | `Inter`      | 10px / 12px    | 500 (Medium)   | `+0.02em`             |

---

## Border Radius & Shapes

- **Precision Micro-Chamfer (`0.25rem` / `4px`)**: Mandatory for base surfaces, tabular rows, cards, inputs, and buttons. Maintains an instrument-grade, sharp terminal silhouette.
- **Elevated Modals (`0.5rem` / `8px`)**: Reserved exclusively for modal dialogs (`UnifiedAuthModal`), floating context tooltips, and deep flyouts.
- **Prohibition**: True pill shapes and heavy rounding (>8px) are **strictly forbidden** to prevent consumerization of the institutional aesthetic.

---

## Component Specifications

### 1. Primary Sovereign CTA

- Background: `#D4AF37` (Gold), Text: `#08090B` (`Noto Serif` 12px semibold, uppercase).
- Hover: `#E5C158`, Active: `#B89324`. Radius: `4px`.

### 2. Secondary Terminal Button

- Background: `#0F1115`, Border: `1px solid #222632`, Text: `#F3F4F6`.
- Hover: Background `#161920`, Border `#3A4050`. Radius: `4px`.

### 3. Financial Data Tables & Matrices

- Header: `11px` uppercase label-caps in `#9CA3AF`, flush left for names, right-aligned for numbers.
- Row height: Fixed `1.75rem` (`28px`), bottom hairline border `1px solid rgba(34, 38, 50, 0.5)`.
- Hover row: Background `#161920`. Selected row: Left border `2px solid #D4AF37`.

### 4. Chips & Delta Badges

- Positive: Background `rgba(0, 194, 136, 0.10)`, Text `#00C288`, `Inter` 11px.
- Negative: Background `rgba(255, 77, 77, 0.10)`, Text `#FF4D4D`, `Inter` 11px.

### 5. Unified Auth Modal (2-Step)

- Root-mounted with Radix Dialog. Backdrop: `rgba(8, 9, 11, 0.85)` with `backdrop-filter: blur(12px)`.
- Border: `1px solid #3A4050` with subtle inner gold hairline highlight.
- Step 1: Institutional email & password / KYC tier selector.
- Step 2: 6-digit segmented `Input-OTP` auto-focused with resend countdown.

### 6. Portfolio Simulator

- Dual Radix Sliders with linear track `#161920`, filled track `#D4AF37`, and micro-rounded square thumb in `#F3F4F6`.
- Synchronized SVG / WebGL 3D radial donut visualizer with reactive stroke animations.
