# WavyAssets Admin Panel - Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Architecture Layers](#architecture-layers)
5. [Data Flow](#data-flow)
6. [State Management](#state-management)
7. [API Layer](#api-layer)
8. [Component Architecture](#component-architecture)
9. [Key Patterns](#key-patterns)
10. [Development Workflow](#development-workflow)

---

## Project Overview

The WavyAssets Admin Panel is a high-density administrative workspace for managing institutional financial operations. It provides a command center for:

- **Admin Personnel Management**: RBAC-based admin directory with role-based access control
- **Client Registry**: User onboarding, KYC verification, and account management
- **Treasury Operations**: Withdrawal processing, dual-sign-off workflows, and liquidity management
- **VIP Card Desk**: Metal card issuance, spend limit controls, and cardholder management
- **Deposit Rails**: Multi-network cryptocurrency address registry and fiat deposit configuration
- **Audit Trail**: Immutable logging of all administrative actions with cryptographic verification
- **Compliance**: KYC/AML verification, sanction screening, and risk profiling
- **Emergency Controls**: Platform-wide security switches and circuit breakers

**Design Philosophy**: Swiss typographic precision, obsidian luxury dark aesthetics, low-latency state caching, and hardened security practices aligned with FINMA regulatory requirements.

---

## Technology Stack

### Core Framework
- **React 19.2**: UI library with modern features (concurrent rendering, automatic batching)
- **TypeScript 6.0**: Type-safe development with strict mode enabled
- **Vite 8.2**: Build tool for fast development and optimized production builds

### State Management
- **Zustand 5.0**: Lightweight global state management
- **TanStack Query 5.66**: Server state management, caching, and synchronization

### Styling
- **Tailwind CSS 4.3**: Utility-first CSS framework
- **tailwind-merge 3.6**: Intelligent Tailwind class merging
- **clsx 2.1**: Conditional class name utility

### UI Components
- **Lucide React 1.41**: Icon library
- **QRCode 1.5**: QR code generation for 2FA

### Development Tools
- **ESLint 9.39**: Code linting with React-specific rules
- **Vitest 5.0**: Unit testing framework
- **Testing Library**: React component testing utilities

### Deployment
- **Docker**: Containerization with multi-stage builds
- **Nginx**: Reverse proxy for production serving

---

## Directory Structure

```
admin-panel/
├── src/
│   ├── api/                    # API client layer
│   │   ├── admins.ts          # Admin personnel operations
│   │   ├── audit.ts           # Audit log queries
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── client.ts          # Base HTTP client
│   │   ├── compliance.ts      # KYC/AML operations
│   │   ├── depositRails.ts    # Deposit rail configuration
│   │   ├── emergency.ts       # Emergency controls
│   │   ├── inquiries.ts       # Lead management
│   │   ├── overview.ts        # Dashboard statistics
│   │   ├── treasury.ts        # Treasury operations
│   │   ├── users.ts           # User management
│   │   ├── vipCards.ts        # VIP card operations
│   │   └── websocket.ts       # Real-time WebSocket client
│   │
│   ├── components/             # Reusable UI components
│   │   ├── admins/            # Admin directory components
│   │   ├── audit/             # Audit log components
│   │   ├── auth/              # Authentication components
│   │   ├── common/            # Shared components (SkeletonTable, etc.)
│   │   ├── compliance/        # KYC/AML components
│   │   ├── deposit-rails/     # Deposit rail components
│   │   ├── emergency/         # Emergency control components
│   │   ├── inquiries/         # Lead inquiry components
│   │   ├── layout/            # Layout components (Sidebar, Header)
│   │   ├── overview/          # Dashboard components
│   │   ├── treasury/          # Treasury components
│   │   ├── users/             # User directory components
│   │   └── vip-cards/         # VIP card components
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── formatters.ts      # Data formatting (currency, dates, etc.)
│   │   └── utils.ts           # General utilities (cn() for Tailwind)
│   │
│   ├── store/                  # Global state (Zustand)
│   │   ├── useAdminAuthStore.ts        # Admin authentication state
│   │   ├── useAdminDirectoryStore.ts   # Admin directory state
│   │   ├── useAdminNavStore.ts         # Navigation state
│   │   ├── useAuditStore.ts            # Audit log filters
│   │   ├── useComplianceStore.ts       # Compliance state
│   │   ├── useDepositRailsStore.ts     # Deposit rail state
│   │   ├── useEmergencyStore.ts        # Emergency control state
│   │   ├── useTreasuryStore.ts         # Treasury state
│   │   ├── useUserRegistryStore.ts     # User directory state
│   │   └── useVipCardsStore.ts         # VIP card state
│   │
│   ├── views/                  # Page-level components (routes)
│   │   ├── AdminDirectoryView.tsx
│   │   ├── AuditLogView.tsx
│   │   ├── ComplianceView.tsx
│   │   ├── DepositRailsView.tsx
│   │   ├── InquiriesView.tsx
│   │   ├── OverviewView.tsx
│   │   ├── PlaceholderView.tsx
│   │   ├── TreasuryView.tsx
│   │   ├── UserDirectoryView.tsx
│   │   └── VipCardsView.tsx
│   │
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── public/                     # Static assets
├── Tests/                      # Test files
├── Dockerfile                  # Container definition
├── docker-compose.yml          # Production orchestration
├── docker-compose.dev.yml      # Development orchestration
├── nginx.conf.template         # Nginx configuration
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation
```

---

## Architecture Layers

The application follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                    │
│                  (Views + Components)                     │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                    State Management Layer                 │
│              (Zustand Stores + React Query)               │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                       API Layer                           │
│              (HTTP Client + WebSocket)                    │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                   Backend Services                        │
│              (Admin Panel API on port 4002)               │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Presentation Layer**
- Renders UI components
- Handles user interactions
- Displays data from state
- Triggers state updates

**State Management Layer**
- Manages global application state (Zustand)
- Caches server state (React Query)
- Synchronizes data between components
- Handles optimistic updates

**API Layer**
- Executes HTTP requests
- Manages authentication headers
- Handles WebSocket connections
- Transforms API responses

---

## Data Flow

### Reading Data (GET requests)

```
User Action
    ↓
Component calls useQuery()
    ↓
React Query checks cache
    ↓
Cache hit? → Return cached data (instant)
    ↓ No
Execute queryFn (API call)
    ↓
API request to backend
    ↓
Store response in cache
    ↓
Component re-renders with data
```

**Example**: Fetching admin directory
```typescript
const { data: admins } = useQuery({
  queryKey: ["admins", selectedRole, searchQuery],
  queryFn: () => fetchAdmins({ role: selectedRole, search: searchQuery })
})
```

### Writing Data (POST/PUT/DELETE requests)

```
User Action (Submit form)
    ↓
Component calls mutation.mutate()
    ↓
mutationFn executes (API call)
    ↓
API request to backend
    ↓
On success → invalidateQueries()
    ↓
React Query refetches affected queries
    ↓
Components re-render with fresh data
```

**Example**: Creating a new admin
```typescript
const mutation = useMutation({
  mutationFn: createAdmin,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admins"] })
  }
})
```

### State Updates (Zustand)

```
User Action (Filter change)
    ↓
Component calls store setter
    ↓
Zustand updates state
    ↓
Subscribed components re-render
    ↓
React Query detects queryKey change
    ↓
Automatic refetch with new filters
```

**Example**: Updating search filter
```typescript
const { setSearchQuery } = useAdminDirectoryStore()
setSearchQuery("Marc") // Triggers refetch
```

---

## State Management

### Zustand (Client State)

Zustand manages **ephemeral, UI-related state** that doesn't need persistence:

- **Modal open/close states**
- **Form draft data** (e.g., VIP card minting draft)
- **Filter selections** (role, status, date range)
- **Navigation state**
- **Authentication session**

**Pattern**: Each feature has its own store file
```typescript
// useAdminDirectoryStore.ts
export const useAdminDirectoryStore = create<AdminDirectoryState>((set) => ({
  searchQuery: "",
  selectedRole: "ALL",
  setSearchQuery: (query) => set({ searchQuery: query }),
  // ...
}))
```

### React Query (Server State)

React Query manages **server state** with automatic caching and synchronization:

- **API responses** (admin lists, user data, audit logs)
- **Background refetching** (stale-while-revalidate)
- **Optimistic updates** (immediate UI feedback)
- **Cache invalidation** (automatic updates after mutations)

**Pattern**: Query keys include filter dependencies
```typescript
useQuery({
  queryKey: ["admins", selectedRole, searchQuery], // Refetches when these change
  queryFn: () => fetchAdmins({ role: selectedRole, search: searchQuery })
})
```

### State Ownership Rules

| State Type | Storage | Persistence | Example |
|------------|---------|-------------|---------|
| Form input | Component useState | Ephemeral | Email field value |
| Modal state | Zustand store | Ephemeral | Is modal open? |
| Filters | Zustand store | Session | Selected role filter |
| API data | React Query | Cached | Admin list |
| Auth session | Zustand store | Session | Current admin user |

---

## API Layer

### Base Client Configuration

The `client.ts` file configures the base HTTP client with:

- **Base URL**: From `VITE_API_BASE_URL` environment variable
- **Authentication headers**: JWT token from Zustand store
- **Error handling**: Standardized error responses
- **Request/response interceptors**: Logging and transformation

### API File Structure

Each feature has a dedicated API file:

```typescript
// api/admins.ts
export async function fetchAdmins(params: FetchAdminsParams): Promise<AdminPersonnel[]> {
  const response = await client.get("/admins", { params })
  return response.data
}

export async function createAdmin(data: CreateAdminDto): Promise<AdminPersonnel> {
  const response = await client.post("/admins", data)
  return response.data
}
```

### WebSocket Integration

Real-time updates via WebSocket for:

- **Live audit log streaming**
- **System status updates**
- **Emergency notifications**

```typescript
// api/websocket.ts
// Uses a short-lived, single-use ticket instead of exposing admin JWT in URL query parameters
export function connectWebSocket(ticket: string): WebSocket {
  const ws = new WebSocket(`${WS_BASE_URL}?ticket=${ticket}`)
  // Handle messages, reconnection, etc.
  return ws
}
```

---

## Component Architecture

### Component Hierarchy

```
App.tsx (Router)
    ↓
Layout Components (Sidebar, Header)
    ↓
View Components (Pages)
    ↓
Feature Components (Tables, Modals, Forms)
    ↓
UI Components (Buttons, Inputs, Badges)
```

### Component Types

**View Components** (`src/views/`)
- Page-level components corresponding to routes
- Compose feature components
- Manage page-level state
- Example: `AdminDirectoryView.tsx`

**Feature Components** (`src/components/{feature}/`)
- Reusable within a feature domain
- Business logic specific to the feature
- Example: `AdminDirectoryTable.tsx`, `CreateAdminModal.tsx`

**Common Components** (`src/components/common/`)
- Reusable across features
- No business logic
- Pure UI components
- Example: `SkeletonTable.tsx`, `FaviconSpinner.tsx`

### Component Patterns

**Compound Components**
```typescript
// Modal with internal state management
<CreateAdminModal
  isOpen={isCreateModalOpen}
  isSuperAdmin={operator?.role === "SUPER_ADMIN"}
/>
```

**Render Props for Conditional Rendering**
```typescript
{isLoading ? (
  <SkeletonTable />
) : isError ? (
  <ErrorState />
) : (
  <DataTable data={data} />
)}
```

**Controlled Components for Forms**
```typescript
<input
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
/>
```

---

## Key Patterns

### 1. Feature-Based Organization

Each feature has its own directory structure:
```
components/
├── admins/
│   ├── AdminDirectoryTable.tsx
│   ├── CreateAdminModal.tsx
│   └── EditAdminModal.tsx
├── vip-cards/
│   ├── MintVipCardModal.tsx
│   └── VipCard3DPreview.tsx
```

### 2. Dual-Sign-Off Pattern

For critical operations (treasury withdrawals, high spend limits):

```typescript
const [secondaryOfficerId, setSecondaryOfficerId] = useState("")
const [secondaryOfficerToken, setSecondaryOfficerToken] = useState("")

// Dual approval required for withdrawals strictly above $100,000
if (amount > 100000) {
  if (!secondaryOfficerToken) {
    setFormError("Secondary Officer authorization required for amounts > $100,000")
    return
  }
  if (secondaryOfficerId === currentOfficer.id) {
    setFormError("Secondary approval must be granted by an officer distinct from the initiator prior to settlement")
    return
  }
}

mutation.mutate({
  ...data,
  secondaryOfficerToken,
  secondaryOfficerId
})
```

### 3. Optimistic UI Updates

Using React Query's mutation callbacks:

```typescript
const mutation = useMutation({
  mutationFn: updateAdmin,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admins"] })
  }
})
```

### 4. Type-Safe API Responses

TypeScript interfaces for all API data:

```typescript
export interface AdminPersonnel {
  id: string
  email: string
  fullName: string
  role: AdminPersonnelRole
  isActive: boolean
  createdAt: string
}

export type AdminPersonnelRole =
  | "SUPER_ADMIN"
  | "TREASURY_OFFICER"
  | "COMPLIANCE_OFFICER"
  | "DESK_LEAD"
  | "CONCIERGE"
```

### 5. Form Draft Pattern

For multi-step forms (VIP card minting):

```typescript
// Store draft in Zustand
const { draftMint, setDraftMint, resetDraftMint } = useVipCardsStore()

// Update draft as user types
onChange={(e) => setDraftMint({ cardholderName: e.target.value })}

// Submit draft on form submit
mutation.mutate(draftMint)

// Reset after success
resetDraftMint()
```

### 6. Error Boundary Pattern

Graceful error handling at component level:

```typescript
const { data, isError, error } = useQuery({ ... })

{isError && (
  <div className="error-state">
    <AlertCircle />
    <p>{error?.message || "Failed to load data"}</p>
    <button onClick={() => refetch()}>Retry</button>
  </div>
)}
```

### 7. Cryptographic Verification

Audit log integrity verification:

```typescript
const handleVerifyMerkle = () => {
  const hasInvalidHashes = logs.some(
    (l) => !l.sha256Hash || !l.merkleBlock
  )

  if (hasInvalidHashes) {
    setVerificationResult({
      verified: false,
      message: "Cryptographic anomaly: Missing required hash or Merkle block fields"
    })
    return
  }

  // Set verified only after entries are validated against a trusted Merkle root;
  // if trusted root validation is unavailable, describe as a field-presence check
  if (trustedRoot && validateMerkleProof(logs, trustedRoot)) {
    setVerificationResult({
      verified: true,
      message: "All entries cryptographically validated against trusted root"
    })
  } else {
    setVerificationResult({
      verified: false,
      message: "Field-presence check passed: hashes and blocks present, but trusted root validation unavailable"
    })
  }
}
```

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm ci

# Start development server (port 5175)
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Build for production
npm run build
```

### Environment Setup

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:4002/api/v1
VITE_BACKEND_ORIGIN=http://localhost:4002
VITE_DASHBOARD_URL=http://localhost:5174
VITE_LANDING_URL=http://localhost:5173
```

### Docker Development

**Production build:**
```bash
docker build -t wavyassets/admin-panel-frontend:1.0.0 .
docker run -d -p 5175:80 wavyassets/admin-panel-frontend:1.0.0
```

**Development with hot reload:**
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Testing Strategy

**Unit Tests** (Vitest + Testing Library):
- Component rendering
- User interactions
- State updates
- API mocking

**Integration Tests**:
- Component composition
- State management flows
- API integration

**E2E Tests** (if added):
- Full user workflows
- Cross-page navigation
- Authentication flows

### Code Quality

**ESLint Configuration:**
- React Hooks rules
- React Refresh for HMR
- TypeScript strict mode
- Custom project rules

**TypeScript Configuration:**
- Strict mode enabled
- Path aliases configured
- No implicit any

---

## Security Considerations

### Authentication
- JWT token stored in Zustand (not localStorage)
- Token included in all API requests
- Automatic token refresh on expiry
- Session timeout handling

### Authorization
- Role-based access control (RBAC)
- Component-level permission checks
- API-level authorization
- Dual-sign-off for critical operations

### Data Protection
- No sensitive data in logs
- Input validation on all forms
- XSS prevention via React escaping
- CSRF protection via same-site cookies

### Audit Trail
- All admin actions logged
- Cryptographic hash verification
- Immutable audit records
- FINMA Article 73 compliance

---

## Performance Optimizations

### React Query Caching
- Automatic caching of API responses
- Stale-while-revalidate strategy
- Selective cache invalidation
- Background refetching

### Code Splitting
- Route-based code splitting (Vite)
- Lazy loading of heavy components
- Dynamic imports for modals

### Bundle Optimization
- Tree shaking (Vite)
- Minification
- Gzip compression (Nginx)
- Asset optimization

### Rendering Optimizations
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers
- Virtual scrolling for large lists (if needed)

---

## Deployment Architecture

### Container Image
Multi-stage Docker build:
1. **Build stage**: Install dependencies, compile TypeScript, build with Vite
2. **Production stage**: Nginx Alpine, copy static assets, configure reverse proxy

### Nginx Configuration
- Serves static files from `/usr/share/nginx/html`
- Reverse proxies `/api/*` to backend
- SPA routing support (fallback to index.html)
- Gzip compression enabled
- Security headers (CSP, X-Frame-Options)

### Service Discovery
- Container name: `wavyassets-admin-frontend`
- Network: `wavyassets-frontend-network`
- Backend resolution: `wavyassets-backend-admin-panel:4002`
- Health check: `GET /healthz`

---

## Future Enhancements

### Planned Features
- [ ] Real-time notifications via WebSocket
- [ ] Advanced analytics dashboard
- [ ] Bulk operations for admin management
- [ ] Custom report generation
- [ ] Multi-language support (i18n)
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts
- [ ] Offline mode support

### Technical Improvements
- [ ] E2E test suite (Playwright/Cypress)
- [ ] Performance monitoring (Sentry)
- [ ] Error tracking (Sentry)
- [ ] A/B testing framework
- [ ] PWA capabilities
- [ ] Service worker for offline caching
- [ ] Micro-frontend architecture consideration

---

## Documentation References

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vite.dev/guide/)
- [Docker Documentation](https://docs.docker.com/)

---

## Contact & Support

For architecture questions or contributions, refer to the project README or contact the development team.
