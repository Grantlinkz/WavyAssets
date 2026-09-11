# UI Context & Frontend Interoperability — WavyAssets Landing Page Backend

## 1. Frontend Interoperability Mandate

The backend must deliver 100% interoperability with `Frontend/landing-page` (React 19, Vite 8, Zustand store, `UnifiedAuthModal`, and `ContactModal`). All API payloads, field naming conventions, and HTTP response envelopes must match the client-side expectations without necessitating breaking frontend rewrites.

---

## 2. Modal & Component Data Contracts

### 1. `UnifiedAuthModal` Interoperability Contract

The modal operates as a 2-step state machine:

#### Step 1: Credential Intake & Challenge Initiation
- **Endpoint**: `POST /api/v1/auth/initiate`
- **Frontend Request Payload**:
  ```typescript
  {
    email: string;        // e.g. "investor@familyoffice.ch"
    passphrase: string;   // e.g. "SovereignPass123!"
    fullName?: string;    // Required if mode is "register"
    tier?: "RETAIL" | "PRIVATE_WEALTH" | "INSTITUTIONAL";
    mode: "login" | "register";
  }
  ```
- **Backend Response**:
  ```typescript
  {
    success: true,
    data: {
      step: 2,
      challengeId: "chl_8f9e1b2c3d4e",
      expiresInSeconds: 300,
      deliveryChannel: "EMAIL", // or "TELEGRAM_ENCLAVE"
      maskedDestination: "i***@familyoffice.ch"
    },
    timestamp: "2026-09-11T05:00:00.000Z"
  }
  ```

#### Step 2: 6-Digit OTP Verification & Dashboard Handshake
- **Endpoint**: `POST /api/v1/auth/verify-otp`
- **Frontend Request Payload**:
  ```typescript
  {
    challengeId: string;  // "chl_8f9e1b2c3d4e"
    otpCode: string;      // "123456" (strict 6 numeric digits)
  }
  ```
- **Backend Response**:
  ```typescript
  {
    success: true,
    data: {
      user: {
        id: "usr_4a5b6c7d8e9f",
        email: "investor@familyoffice.ch",
        fullName: "Eleanor Vance",
        tier: "INSTITUTIONAL"
      },
      accessToken: "eyJhbGciOi...",
      handoffTicket: "ticket_99a88b77c66d", // Used to redirect into user-dashboard
      dashboardUrl: "http://localhost:5174/dashboard?ticket=ticket_99a88b77c66d"
    },
    timestamp: "2026-09-11T05:00:00.000Z"
  }
  ```
- **Cookie Set**: `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/api/v1/auth` refresh token cookie.

---

### 2. `ContactModal` Mandate Ingestion Contract

- **Endpoint**: `POST /api/v1/leads/inquire`
- **Frontend Request Payload**:
  ```typescript
  {
    fullName: string;     // e.g. "Marcus Thorne"
    workEmail: string;    // Corporate domain required (e.g. "m.thorne@geneva-capital.ch")
    telegram?: string;    // e.g. "@marcusthorne"
    companyName: string;  // e.g. "Geneva Capital Management"
    websiteUrl?: string;  // e.g. "https://geneva-capital.ch"
    service: "CRYPTO" | "STOCKS" | "AI_FUNDS" | "REAL_ESTATE" | "VIP_CARDS" | "CARS" | "WALLET";
    allocation: string;   // e.g. "$5M - $10M"
  }
  ```
- **Backend Response**:
  ```typescript
  {
    success: true,
    data: {
      leadId: "lead_71a2b3c4d5",
      message: "Mandate recorded. An institutional relationship partner will contact you within 2 business hours."
    },
    timestamp: "2026-09-11T05:00:00.000Z"
  }
  ```

---

### 3. Continuous Syndicate Ticker Feed (`/api/v1/telemetry/ticker`, `/ws/ticker`)

The frontend's continuous sliding marquee (`.animate-ticker-continuous`) and matrix strips consume:
```typescript
interface TickerQuote {
  symbol: string;      // "BTC/USD", "NVDA", "XAU/USD", "US 10Y"
  price: number;       // 92450.00
  change24h: number;   // 2.84 (percentage)
  volume24h?: number;  // 482000000
  assetClass: "CRYPTO" | "EQUITY" | "COMMODITY" | "TREASURY";
}
```

---

### 4. Portfolio Simulator Intent Persistence (`/api/v1/simulation`)

- **Endpoint**: `POST /api/v1/simulation/save`
- **Frontend Request Payload**:
  ```typescript
  {
    capitalAmount: number;   // $50,000 to $10,000,000
    riskPosture: number;     // 1: Capital Preservation, 2: Balanced Growth, 3: Max Alpha
    projectedYield: number;  // 8.4 to 19.4 (%)
  }
  ```
- **Backend Response**:
  ```typescript
  {
    success: true,
    data: {
      intentToken: "sim_tok_1a2b3c4d",
      expiresAt: "2026-09-12T05:00:00.000Z"
    },
    timestamp: "2026-09-11T05:00:00.000Z"
  }
  ```

---

## 3. Transactional Email Styling Guidelines (Resend Gateway)

All transactional emails dispatched via Resend must embody Swiss typography and vault aesthetics:

- **Typography**: Clean, sans-serif Swiss structure (`Inter` or system fonts `Helvetica Neue`, `Arial`).
- **Color Palette**:
  - Background Canvas: Dark Obsidian (`#08090B`) or crisp white (`#FFFFFF`) with high-contrast card borders (`#222632`).
  - Accent Color: Sovereign Gold (`#D4AF37`) for header banners and button accents.
  - Security Notice Accent: Emerald (`#00C288`) for verified transmission badge.
- **6-Digit OTP Presentation**: Displayed in large tabular monospaced numbers (`font-family: monospace; font-size: 32px; letter-spacing: 8px; color: #D4AF37; font-weight: 700;`).
- **Security Context Ribbon**:
  - Clear statement of 5-minute countdown validity.
  - Requester metadata: Date/Time (UTC), Requester IP Hash, and approximate Geolocation.
  - Warning: "WavyAssets personnel will never ask for this code over the phone or via Telegram."

---

## 4. Swagger / OpenAPI Documentation Styling (`/api/docs`)

- **Title**: `WavyAssets Institutional Gateway API`
- **Description**: Institutional backend service specification for the WavyAssets Landing Page terminal, Enclave proof-of-reserves, and user-dashboard authentication gateway.
- **Version**: `1.0.0`
- **Tags**:
  - `Authentication`: 2-Step OTP, session management, and dashboard hand-off
  - `Institutional Leads`: Mandate inquiries and CRM dispatch
  - `Telemetry`: Market tickers and cryptographic Enclave proof-of-reserves
  - `Simulation`: Portfolio intent tokenization and pre-fill
  - `Compliance`: Regulatory disclaimers and double opt-in research newsletter
  - `Health`: Readiness and liveness telemetry probes
