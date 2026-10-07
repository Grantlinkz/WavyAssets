# WavyAssets User Dashboard Architecture

## Tech Stack Overview

The WavyAssets User Dashboard is a modern, high-performance single-page React application built with the following core technologies:

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8 for fast HMR and optimized production builds.
- **Styling**: Tailwind CSS 4 (via PostCSS) for utility-first styling.
- **State Management**: Zustand 5 for lightweight, modular, and performant global state.
- **Component Library / Primitives**: Radix UI for accessible, unstyled component primitives (Dialog, Dropdown, Tabs, etc.), heavily customized with Tailwind.
- **Animations**: Framer Motion for complex UI transitions and micro-interactions.
- **Icons**: Lucide React.
- **3D Graphics**: Three.js for rendering advanced 3D visual elements within the dashboard.

## Directory Structure (`src/`)

The application codebase is organized by feature and domain to ensure scalability:

```text
src/
├── components/          # All React components
│   ├── 3d/              # Three.js canvases and 3D rendering components
│   ├── auth/            # Authentication flows (e.g., AuthCallback)
│   ├── chat/            # AI or support chat interface components
│   ├── command-bar/     # Global command palette (Cmd+K) components
│   ├── common/          # Generic, highly reusable app components
│   ├── modals/          # Global application modals (e.g., TradeModal)
│   ├── modules/         # Domain-specific business logic and views (See below)
│   ├── nav/             # Sidebar, Header, and structural navigation
│   └── ui/              # Base UI components (Buttons, Inputs, Spinners)
├── lib/                 # Utility functions, API clients, and constants
├── store/               # Global Zustand State Management (see below)
├── App.tsx              # Root application component and router
├── index.css            # Global CSS and Tailwind entry point
└── main.tsx             # Application entry point (ReactDOM render)
```

## Modules Architecture (`src/components/modules/`)

The core business verticals of the application are organized inside the `modules` directory. This is where high-level, feature-specific components live. Each subdirectory represents a distinct "vertical" or tab in the user dashboard:

- **`overview/`**: The main portfolio dashboard. Aggregates data from all other stores (liquid, alternative) to present top-level net worth, performance charts, and recent activity.
- **`crypto/`**: Liquid Cryptocurrency asset management. Includes components for holdings tables, DCA (Dollar Cost Averaging) schedulers, and staking telemetry.
- **`stocks/`**: Traditional equities view.
- **`ai-funds/`**: Represents fractionalized investments in AI compute clusters and strategies. Includes components for browsing assets (`AiAssetDeck`), viewing yield telemetry, and executing buys/leases (`AiActionModal`).
- **`real-estate/`**: Real estate tokenization view. Manages tokenized property shares and rental yield interfaces.
- **`cars/`**: Exotic vehicle fractional ownership and driving slot reservations.
- **`wallet/`**: Core financial operations. Includes fiat balances, deposit/withdraw flows, and a unified transaction history table (`TxHistoryTable`).
- **`vip-cards/`**: Tiered membership systems, physical card issuance interfaces, and governance voting based on tier.
- **`compliance/`**: User KYC (Know Your Customer) and AML regulatory status checks and document uploads.
- **`security/`**: Account protection settings, including 2FA (Two-Factor Authentication) configuration.

This modular structure ensures that components related to one business domain (e.g., AI Funds) do not leak into another, making the codebase highly maintainable and strictly separated by concern.

## State Management (`src/store/`)

The application avoids "prop drilling" by utilizing Zustand for global state management. The store is modularized into specific "slices" or domains, ensuring components only subscribe to the state they need:

1. **`useDashboardStore.ts`**: Manages global UI preferences, such as the active navigation tab (vertical), dark/light theme, sidebar collapse state, and the global "mask balances" privacy toggle.
2. **`useAuthStore.ts`**: Manages the user session, authentication tokens, KYC tiers, and local storage persistence.
3. **`usePortfolioStore.ts`**: Manages top-level aggregate financial data, such as total net worth, available cash balance, and global modal visibility (e.g., opening the trade modal from anywhere).
4. **`useLiquidStore.ts`**: Manages high-velocity, liquid assets like Cryptocurrencies and Stocks, including DCA schedules, live prices, and transaction histories.
5. **`useAlternativeStore.ts`**: Manages alternative, fractionalized, and illiquid asset classes such as Real Estate, AI Funds, and Exotic Vehicles.
6. **`useGovernanceStore.ts`**: Handles state related to DAO proposals, voting mechanisms, and VIP tier benefits.

## Data Flow & Best Practices

1. **Selective Subscriptions**: Components subscribe only to specific store slices (e.g., `const maskBalances = useDashboardStore((s) => s.maskBalances)`) to prevent unnecessary re-renders.
2. **Memoization**: Heavy data filtering (like searching through AI funds or Crypto assets) is wrapped in `useMemo` hooks to ensure fast UI performance during typing.
3. **Privacy First**: Sensitive data components accept a `maskBalances` prop that falls back to the global `useDashboardStore` setting, ensuring privacy toggles apply instantaneously across the entire app.
