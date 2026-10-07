# WavyAssets Landing Page Architecture

## Overview

The WavyAssets Landing Page is a high-performance, institutional-grade single-page application (SPA) designed to showcase sovereign multi-asset wealth management services. Built with React 19, TypeScript, and Three.js, it delivers an immersive experience with 3D visualizations, real-time market data, and seamless client-side routing.

---

## Technology Stack

### Core Framework & Build
- **React 19.2.8** - Latest React with concurrent features
- **TypeScript 6.0** - Strict mode for type safety
- **Vite 8.2** - Fast development server and optimized production builds
- **Vitest 5.0** - Unit testing with React Testing Library (113 tests)

### Styling & Design System
- **Tailwind CSS v4.3** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives (Dialog, Navigation Menu, Slider, Input OTP)
- **shadcn/ui** - Pre-built UI components built on Radix UI
- **Framer Motion 13.2** - Production-grade animation library
- **Lucide React** - Icon library
- **@fontsource-variable/geist** - Variable font for typography

### 3D & Graphics
- **Three.js 0.185** - WebGL 3D rendering engine
- **React Three Fiber 9.7** - React renderer for Three.js
- **@react-three/drei 10.7** - Helper components for React Three Fiber

### State Management
- **Zustand 5.0** - Lightweight state management for theme, routing, modals, and simulator state

### Utilities
- **class-variance-authority** - Component variant management
- **clsx & tailwind-merge** - Conditional class utilities
- **input-otp** - One-time password input component

---

## Project Structure

```
landing-page/
├── src/
│   ├── components/          # React components organized by feature
│   │   ├── about/          # About section with 3D vault canvas
│   │   ├── auth/           # Authentication modal (2FA)
│   │   ├── canvas/         # 3D WebGL canvases (Gyroscope, Background)
│   │   ├── common/         # Shared components (AnimatedNumber, NotFound)
│   │   ├── contact/        # Contact modal with 3D sentinel graphic
│   │   ├── discovery/      # Asset discovery hub
│   │   ├── error/          # Error boundary
│   │   ├── footer/         # Institutional footer
│   │   ├── hero/           # Kinetic typography
│   │   ├── nav/            # Navigation components (Header, Mega Menu)
│   │   ├── panels/         # Asset vertical panels
│   │   │   └── views/      # Individual asset views (7 verticals)
│   │   ├── simulator/      # Portfolio simulator with 3D donut chart
│   │   ├── trust/          # Trust infrastructure & client voices
│   │   └── ui/             # Base UI primitives (shadcn components)
│   ├── lib/                # Utility libraries
│   │   ├── api.ts          # API client layer
│   │   ├── calculator.ts   # Financial calculations
│   │   ├── formatters.ts   # Currency, percentage, basis point formatters
│   │   ├── locale.ts       # Internationalization (i18n)
│   │   └── utils.ts        # General utilities
│   ├── store/              # Zustand state management
│   │   └── useTerminalStore.ts  # Global state store
│   ├── assets/             # Static assets (images, videos)
│   ├── App.tsx             # Root application component
│   ├── main.tsx            # Application entry point
│   ├── index.css           # Global styles
│   └── App.css             # Component-specific styles
├── public/                 # Static public assets
├── Tests/                  # Vitest test suites
├── Dockerfile              # Production container build
├── docker-compose.yml      # Production orchestration
├── docker-compose.dev.yml  # Development orchestration
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

---

## Component Architecture

### Root Application Flow

```
main.tsx
  └─> App.tsx (TerminalErrorBoundary)
       ├─> GlobalHeader
       ├─> ServicesMegaMenu
       ├─> WavyBackground (Canvas)
       ├─> AmbientCanvas (3D Mesh)
       ├─> Syndicate Ticker Bar
       ├─> Main Content Area
       │   ├─> KineticHeroTypography
       │   ├─> HeroAssetGyroscope (3D)
       │   ├─> AboutSection
       │   ├─> PortfolioSimulator
       │   ├─> AssetDiscoveryHub
       │   ├─> AssetContainer
       │   │   ├─> AssetNavRail
       │   │   └─> [Active Asset Panel]
       │   ├─> TrustInfrastructure
       │   └─> ClientVoices
       ├─> InstitutionalFooter
       ├─> UnifiedAuthModal (Global)
       └─> ContactModal (Global)
```

### Component Categories

#### 1. Navigation Components (`src/components/nav/`)
- **GlobalHeader**: Fixed header with logo, theme toggle, and mega menu trigger
- **ServicesMegaMenu**: Dropdown menu for 7 asset verticals with category filtering
- **CategoryFilter**: Mega menu category filter (All, Liquid Digital, DMA Equities, Physical Vaults)
- **ThemeToggle**: System/light/dark theme switcher
- **Asset3DVectorIcons**: Custom 3D-style icons for asset verticals

#### 2. Canvas & 3D Components (`src/components/canvas/`)
- **HeroAssetGyroscope**: Interactive 3D orbital gyroscope representing 7 asset tiers
  - Uses React Three Fiber and Drei
  - Implements IntersectionObserver for off-screen culling
  - Cursor parallax effects
- **WavyBackground**: Seamless sine-wave animated background
- **AmbientCanvas**: Decoupled ambient mesh canvas for visual depth

#### 3. Asset Panels (`src/components/panels/`)
- **AssetContainer**: Container for asset panel switching with hash routing
  - Enforces `min-h-[540px]` for zero CLS
  - Uses Framer Motion AnimatePresence for sub-50ms transitions
- **AssetNavRail**: Segmented navigation rail for 7 asset verticals
- **Views**: Individual panels for each asset:
  - `CryptoPanel`: Bitcoin/Ethereum staking and custody
  - `StocksPanel`: Global equities and pre-IPO shares
  - `AiFundsPanel`: AI quantitative trading funds
  - `RealEstatePanel`: Tokenized prime real estate
  - `VipCardsPanel`: Titanium concierge cards
  - `CarsPanel`: Exotic vehicles and horology
  - `WalletPanel`: Sovereign multi-sig wallet

#### 4. Simulator Components (`src/components/simulator/`)
- **PortfolioSimulator**: Interactive portfolio simulator with dual sliders
  - Capital range: $50,000 to $10,000,000
  - Aggressiveness tiers: Capital Preservation, Balanced Growth, Maximum Alpha
- **DonutChart3D**: Interactive 3D donut chart for asset allocation visualization

#### 5. Trust Components (`src/components/trust/`)
- **TrustInfrastructure**: Audited returns and enclave telemetry display
- **ClientVoices**: Verified allocator endorsements with 3D specular cards
- **CustodyNetworkGrid**: Visual grid of custody network locations

#### 6. Authentication (`src/components/auth/`)
- **UnifiedAuthModal**: Two-step institutional 2FA authentication
  - Step 1: Email/passphrase or tier selection
  - Step 2: 6-digit OTP verification via `input-otp`
  - Supports login, register, and mandate modes

#### 7. UI Primitives (`src/components/ui/`)
Base shadcn/ui components:
- `button`: Styled button with variants
- `dialog`: Accessible dialog modal
- `input-otp`: One-time password input
- `navigation-menu`: Radix navigation menu
- `skeleton`: Loading skeleton
- `slider`: Range slider for simulator

---

## State Management (Zustand)

### Global Store: `useTerminalStore`

Located in `src/store/useTerminalStore.ts`, the Zustand store manages:

#### State Slices

1. **Theme State**
   - `theme`: 'dark' | 'light' | 'system'
   - `resolvedTheme`: 'dark' | 'light'
   - `setTheme(theme)`: Set theme and persist to localStorage
   - `toggleTheme()`: Toggle between dark/light

2. **Asset Routing**
   - `activeAssetId`: Currently selected asset vertical
   - `setActiveAssetId(id)`: Update active asset and update hash
   - `syncFromHash()`: Sync state from window hash

3. **Mega Menu State**
   - `isMegaMenuOpen`: Boolean for menu visibility
   - `megaMenuCategory`: Current filter category
   - `setMegaMenuOpen(open)`: Toggle menu
   - `setMegaMenuCategory(category)`: Update filter

4. **Auth Modal State**
   - `authModal`: Object with isOpen, step, initialTier, initialMode
   - `openAuthModal(tier, mode)`: Open auth modal
   - `closeAuthModal()`: Close modal and reset step
   - `setAuthStep(step)`: Navigate between steps 1 and 2

5. **Contact Modal State**
   - `isContactModalOpen`: Boolean for contact modal visibility
   - `openContactModal()`: Open contact modal
   - `closeContactModal()`: Close contact modal

6. **Trust Mode & Client Tier**
   - `trustMode`: 'private-wealth' | 'institutional'
   - `clientTier`: Current client tier
   - `setTrustMode(mode)`: Set and persist trust mode

7. **Simulator State**
   - `simulator.capital`: Current capital amount (default: $250,000)
   - `simulator.aggressiveness`: Risk level (1-3)
   - `setSimulatorCapital(capital)`: Update capital
   - `setSimulatorAggressiveness(aggressiveness)`: Update risk level

8. **Telemetry State**
   - `telemetry.lastSwitchDurationMs`: Last view switch duration
   - `telemetry.switchHistory`: Array of view switch events
   - `recordViewSwitch(from, to, durationMs)`: Log navigation performance

9. **404 Route State**
   - `is404`: Boolean for 404 page state
   - `setIs404(is404)`: Update 404 state

10. **Locale State**
    - `locale`: Current locale (e.g., 'en-US')
    - `setLocale(locale)`: Update locale

---

## Routing Architecture

### Client-Side Hash Routing

The application uses hash-based routing for SPA navigation without full page reloads:

- **Base Path**: `/` or `/research`
- **Asset Routes**: `#/services/:assetId`
  - Valid asset IDs: `crypto`, `stocks`, `ai-funds`, `real-estate`, `vip-cards`, `cars`, `wallet`
- **Section Routes**: `#about`, `#portfolio-simulator`, `#asset-terminal`, `#trust-infrastructure`, `#client-voices`, `#contact`, `#research`
- **404 Route**: `#/404` or invalid routes

### Route Validation

The `isRoute404()` function in `useTerminalStore.ts` validates routes:
- Checks pathname validity (/, /index.html, /contact, /research)
- Validates hash patterns against `VALID_SECTION_HASHES` and `VALID_ASSET_VERTICALS`
- Returns true for invalid routes, triggering 404 page

### Hash Sync Mechanism

1. **Initial Load**: `syncFromHash()` parses window hash and sets initial state
2. **Navigation**: `setActiveAssetId()` updates window hash via `window.location.hash`
3. **Browser Events**: Listens for `hashchange` and `popstate` events
4. **Deep Linking**: Supports direct navigation to specific asset views via URL

### Query Parameter Handling

Special handling for authentication redirection:
- `?auth=signin` or `?auth=login`: Opens institutional login modal
- `?auth=mandate`: Opens mandate registration modal
- `?auth=register`: Opens institutional registration modal
- Parameters are cleaned from URL after processing

---

## API Layer

### API Client (`src/lib/api.ts`)

The API layer provides a centralized, type-safe interface to the backend gateway (`Backend/landing-page` on port 4000).

#### Core Transport

- **Base URL**: Configurable via `VITE_API_BASE_URL` or defaults to `/api/v1`
- **Request Function**: Generic `request<T>()` with:
  - Automatic JSON serialization/deserialization
  - 60-second timeout with AbortController
  - Standardized error handling via `ApiError` class
  - Credential inclusion for cookie-based auth
  - Timeout and abort signal handling

#### API Modules

1. **authApi**: Authentication operations
   - `initiate(payload)`: Start auth flow (login/register)
   - `verifyOtp(payload)`: Verify 2FA code
   - `forgotPassword(payload)`: Initiate password reset
   - `resetPassword(payload)`: Complete password reset
   - `getProfile()`: Fetch user profile
   - `logout()`: Terminate session

2. **leadsApi**: Lead management
   - `submitInquiry(payload)`: Submit institutional lead inquiry

3. **newsletterApi**: Newsletter subscriptions
   - `subscribe(payload)`: Subscribe to newsletter
   - `verify(token)`: Verify subscription via email token

4. **simulationApi**: Portfolio simulation
   - `saveSimulation(payload)`: Save simulation results
   - `getSimulation(token)`: Retrieve saved simulation

5. **telemetryApi**: Real-time market data
   - `getTickerQuotes()`: Fetch live market quotes
   - `getEnclave()`: Fetch enclave telemetry (HSM status, AUM, etc.)

#### Data Contracts

TypeScript interfaces define all request/response payloads for type safety.

---

## Data Flow

### Real-Time Market Data Flow

```
App.tsx (Component Mount)
  ├─> telemetryApi.getTickerQuotes() [30s interval]
  │   └─> Backend: GET /api/v1/telemetry/ticker
  │       └─> Returns: { quotes: AssetQuote[], feedStatus, timestamp }
  │           └─> Map to TickerFeedItem[]
  │               └─> setLiveFeeds(state)
  │                   └─> Syndicate Ticker Bar renders live feeds
  └─> Fallback: Default syndicateFeeds if API fails
```

### Asset Panel Switching Flow

```
User clicks AssetNavRail button
  ├─> setActiveAssetId(newAssetId)
  │   ├─> Record view switch telemetry
  │   ├─> Update window.location.hash = #/services/newAssetId
  │   ├─> Set store.activeAssetId = newAssetId
  │   └─> Close mega menu
  └─> AssetContainer detects activeAssetId change
      ├─> Framer Motion AnimatePresence triggers exit animation
      ├─> New panel renders with enter animation
      └─> Complete sub-50ms transition
```

### Authentication Flow

```
User clicks "Sign In" / "Get Mandate"
  ├─> openAuthModal(tier, mode)
  │   └─> Set authModal = { isOpen: true, step: 1, initialTier, initialMode }
  └─> UnifiedAuthModal renders
      ├─> Step 1: User enters email/passphrase
      │   └─> authApi.initiate(payload)
      │       └─> Backend: POST /api/v1/auth/initiate
      │           └─> Returns: { challengeId, expiresInSeconds, maskedDestination }
      │               └─> setAuthStep(2)
      └─> Step 2: User enters 6-digit OTP
          └─> authApi.verifyOtp(payload)
              └─> Backend: POST /api/v1/auth/verify-otp
                  └─> Returns: { user, accessToken, handoffTicket, dashboardUrl }
                      └─> Redirect to dashboard or close modal
```

---

## Performance Optimizations

### 1. Sub-50ms Panel Transitions
- Client-side hash routing avoids full page reloads
- Framer Motion AnimatePresence with optimized transitions
- Minimal state updates via Zustand
- Pre-dimensioned containers prevent layout shifts

### 2. Zero Cumulative Layout Shift (CLS)
- AssetContainer enforces `min-h-[540px]` on panel viewport
- Skeleton loaders for async content
- Pre-loaded fonts with `@fontsource-variable/geist`
- Tabular numbers for stable width (e.g., currency, percentages)

### 3. WebGL Lifecycle Management
- Geometries, materials, and textures disposed on unmount
- Render loops throttle on `document.hidden` (tab blur)
- IntersectionObserver culls off-screen 3D canvases
- RequestAnimationFrame for efficient rendering

### 4. Code Splitting
- Vite manual chunks in `vite.config.ts`:
  - `three-vendor`: Three.js and React Three Fiber
  - `motion-vendor`: Framer Motion
  - `radix-vendor`: Radix UI and Lucide React
  - `react-vendor`: React and Zustand
- Entry chunk size: ~328 kB
- Lazy loading for heavy components

### 5. Asset Optimization
- Static assets served from `/public/`
- Video assets compressed for web playback
- Images optimized for web
- 1-year immutable caching on `/assets/*` in production

### 6. Request Optimization
- 30-second polling interval for ticker quotes (not 1-second)
- AbortController for request timeouts
- Silent fallback to default data on API failures
- Debounced user inputs where applicable

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- Skip-to-content link (`#main-content`) with `sr-only` focus styles
- All interactive elements keyboard accessible
- Tab order follows visual layout
- Focus indicators on all interactive elements

### Screen Reader Support
- ARIA live regions for route announcements
- `role="status"` and `aria-live="polite"` for dynamic content
- Semantic HTML structure
- Alt text for images
- Descriptive labels for form inputs

### Reduced Motion Support
- `prefers-reduced-motion` media query respected
- Framer Motion respects system preferences
- 3D canvases pause animations when reduced motion is enabled
- Ticker marquee can be paused or slowed

### Color Contrast
- Obsidian Dark theme uses high-contrast colors
- Luxury Light theme meets AA contrast ratios
- Text colors tested against backgrounds
- Delta colors (green/red) distinguishable

---

## Security Guardrails

### 1. Error Boundary
- `TerminalErrorBoundary` wraps entire app
- Sanitized error messages prevent stack trace leakage
- Institutional-grade error display
- No credential exposure in errors

### 2. Content Security Policy
- `vercel.json` enforces strict CSP
- `unsafe-eval` forbidden
- Script sources restricted
- Inline scripts blocked

### 3. API Security
- Credentials included for cookie-based auth
- HTTPS enforced in production
- Request timeouts prevent hanging
- AbortController for cancellation

### 4. Input Validation
- TypeScript interfaces validate API payloads
- Form validation on client side
- Honeypot field for bot detection in lead forms
- OTP length validation (6 digits)

### 5. Route Protection
- 404 validation prevents invalid route access
- Query parameter sanitization
- Hash validation against whitelist

---

## Deployment Architecture

### Development
- **Vite Dev Server**: `npm run dev` on port 5173
- **Proxy**: `/api` and `/health` proxied to `http://localhost:4000` (backend)
- **Hot Module Replacement**: Instant code updates
- **Docker Dev**: `docker-compose -f docker-compose.dev.yml up` with volume mounts

### Production Docker
- **Multi-stage Build**:
  1. Node 22 Alpine: TypeScript compilation and Vite build
  2. Nginx Alpine: Static asset serving
- **Features**:
  - SPA fallback routing: `try_files $uri $uri/ /index.html`
  - API proxy: `/api/`, `/health/`, `/ws/` to backend
  - Gzip compression
  - 1-year caching on `/assets/`
  - Liveness probe: `/healthz` endpoint
- **Environment Variables**:
  - `BACKEND_HOST`: Backend container hostname
  - `BACKEND_PORT`: Backend port (default: 4000)

### Vercel Deployment
- **Framework Preset**: Vite
- **Root Directory**: `Frontend/landing-page`
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **vercel.json Configuration**:
  - SPA catch-all rewrites
  - Security headers (CSP, HSTS, X-Frame-Options)
  - Static asset caching rules
- **Zero Configuration**: Optimized out of the box

### Monorepo Integration
- **Root Compose**: All 6 frontends & backends on `wavyassets-network`
- **Frontend Stack Compose**: All 3 frontends on `wavyassets-frontend-network`
- **Container Name**: `wavyassets-landing-frontend`
- **Network**: Connected to backend via `wavyassets-landing-backend:4000`

---

## Testing Strategy

### Test Framework
- **Vitest 5.0**: Fast unit test runner
- **React Testing Library**: Component testing utilities
- **jsdom**: Browser environment simulation

### Test Coverage
- **113 Tests** across 20 test suites
- Component rendering tests
- State management tests
- API client tests
- Utility function tests
- Routing logic tests

### Test Setup
- Located in `Tests/` directory
- Setup file: `Tests/setup.ts`
- Global test environment: Node
- Test timeout: 25 seconds
- Isolation disabled for shared state tests

### Running Tests
```bash
npm test                    # Run all tests
npm run test -- --ui       # Run with Vitest UI
npm run test -- --coverage # Generate coverage report
```

---

## Internationalization (i18n)

### Locale Management
- **System Detection**: Auto-detects browser language on load
- **Override Support**: Manual locale override via `setLocale()`
- **Persistence**: Locale preference stored in localStorage
- **Default**: `en-US`

### Supported Locales
- `en-US`: English (United States)
- Additional locales can be added to `src/lib/locale.ts`

### Format Functions
- `formatCurrency(value)`: Locale-aware currency formatting
- `formatPercent(value, showSymbol)`: Percentage with optional % symbol
- `formatBps(value)`: Basis point formatting
- Currency symbols adapt to locale (e.g., $, €, £)

---

## Engineering Invariants

### Performance Invariants
1. **Sub-50ms Panel Switches**: Asset transitions must complete in <50ms
2. **Zero CLS**: Cumulative Layout Shift score must be 0
3. **WebGL Disposal**: All 3D resources must be disposed on unmount
4. **Tab Blur Throttling**: Render loops must pause when tab is hidden

### Security Invariants
1. **No Secret Leaks**: Error boundaries must sanitize stack traces
2. **CSP Compliance**: No inline scripts or eval()
3. **Credential Protection**: No credentials in client-side code or logs
4. **Route Validation**: All routes must be validated before rendering

### Accessibility Invariants
1. **Keyboard Navigation**: All features must be keyboard accessible
2. **Screen Reader Support**: ARIA labels and live regions must be present
3. **Reduced Motion**: Animations must respect `prefers-reduced-motion`
4. **Color Contrast**: All text must meet WCAG AA contrast ratios

### Code Quality Invariants
1. **TypeScript Strict Mode**: No `any` types unless absolutely necessary
2. **Component Composition**: Prefer composition over inheritance
3. **Single Responsibility**: Each component should have one clear purpose
4. **No Prop Drilling**: Use Zustand for global state, context for feature state

---

## Future Extensibility

### Planned Enhancements
1. **WebSocket Integration**: Real-time streaming quotes instead of polling
2. **Additional Asset Verticals**: New asset classes can be added to panels/views
3. **Advanced Analytics**: Enhanced telemetry tracking and reporting
4. **A/B Testing Framework**: Support for feature flags and experiments
5. **Offline Support**: Service worker for offline functionality
6. **Additional Locales**: Full i18n support for multiple languages

### Scalability Considerations
- Modular component structure allows easy addition of new features
- API layer designed for easy endpoint additions
- State management via Zustand scales well with new features
- Code splitting ensures performance remains optimal as app grows

---

## Maintenance & Development Guidelines

### Adding New Asset Verticals
1. Add new asset ID to `AssetVerticalId` type in `useTerminalStore.ts`
2. Add to `VALID_ASSET_VERTICALS` array
3. Create new panel component in `src/components/panels/views/`
4. Add case to `renderActivePanel()` in `AssetContainer.tsx`
5. Add navigation item to `AssetNavRail.tsx`
6. Add discovery card to `AssetDiscoveryHub.tsx`

### Adding New API Endpoints
1. Define TypeScript interfaces in `src/lib/api.ts`
2. Add method to appropriate API module (authApi, leadsApi, etc.)
3. Implement request handling in backend
4. Add error handling and loading states in components
5. Write unit tests for new API methods

### Styling Guidelines
- Use Tailwind utility classes for all styling
- Follow existing color tokens (primary, secondary, surface, outline)
- Use semantic class names when necessary
- Maintain consistent spacing and typography scales
- Test in both dark and light themes

### 3D Component Guidelines
- Always dispose geometries, materials, and textures on unmount
- Use IntersectionObserver for off-screen culling
- Implement `prefers-reduced-motion` fallbacks
- Keep render loops efficient (avoid heavy calculations in loop)
- Use React Three Fiber patterns (useFrame, useThree)

---

## Related Documentation

- **README.md**: User-facing documentation and setup instructions
- **GEMINI.md**: AI agent integration guidelines
- **.ai.md**: AI configuration and rules
- **vercel.json**: Vercel deployment configuration
- **render.yaml**: Render deployment configuration
- **nginx.conf.template**: Nginx configuration template

---

## Contact & Support

For questions about architecture, implementation details, or contribution guidelines, refer to the project maintainers or the main README.md file.
