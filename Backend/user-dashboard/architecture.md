# WavyAssets User Dashboard Backend Architecture

## Overview
The WavyAssets User Dashboard Backend is a robust, modular API built using **NestJS**. It serves as the institutional multi-asset core and double-entry transactional backbone for the WavyAssets platform.

## Technology Stack
- **Core Framework:** NestJS (Node.js)
- **Database ORM:** Prisma
- **Real-time Communication:** Socket.io (WebSockets)
- **Authentication:** JWT, WebAuthn
- **Testing:** Vitest

## Core Architectural Patterns
The application follows the standard NestJS modular architecture, dividing responsibilities into clearly defined layers:
- **Controllers:** Handle incoming HTTP requests and route them to appropriate services.
- **Services:** Contain the core business logic.
- **DTOs (Data Transfer Objects):** Define and validate the shape of incoming data.
- **Modules:** Encapsulate related components (Controllers, Services) into cohesive domains.

### Global Enhancements
The application utilizes several global NestJS constructs to maintain a consistent and secure API:
- **`GlobalExceptionFilter`**: Catches all unhandled exceptions and formats them into a standardized error response.
- **`TransformResponseInterceptor`**: Standardizes the format of successful API responses.
- **`RedactedLoggingInterceptor`**: Ensures sensitive information is stripped out before requests/responses are logged.
- **`CorrelationMiddleware`**: Injects a unique `X-Correlation-ID` into every request for distributed tracing and debugging.

## Feature Modules (`src/modules`)
The application's business logic is highly modularized, with the following key domains located in `src/modules`:

### Core Domain Modules
*   **`auth`**: Handles user authentication, authorization, JWT issuance, and WebAuthn.
*   **`dashboard`**: Aggregates data from various asset classes to present a unified view to the user.
*   **`wallet`**: Manages segregated balances (liquid, invested, staking), handles fiat ramps, and processes deposit/withdrawal receipts with strict business rules.
*   **`compliance`**: Manages KYC (Know Your Customer) and AML compliance tiers.
*   **`security`**: Handles advanced security settings like 2FA.
*   **`websocket`**: Manages real-time data streaming to the client dashboard.

### Asset Class Modules
The platform supports a diverse "multi-asset" strategy, separated into distinct modules:
*   **`crypto`**: Cryptocurrency assets.
*   **`stocks`**: Traditional equities.
*   **`real-estate`**: Tokenized or fractional real estate holdings.
*   **`ai-funds`**: Algorithmic / AI-managed investment funds.
*   **`cars`**: Luxury car assets.
*   **`vip-cards`**: Exclusive membership or VIP card assets.

### Infrastructure Modules
*   **`health`**: Provides health check endpoints for infrastructure monitoring (e.g., Kubernetes readiness/liveness probes).

## Database
The application relies on a relational database managed through **Prisma**. The Prisma schema defines the core entities such as Users, LedgerTransactions, Accounts, and various asset-specific tables, ensuring data integrity and strong typing across the backend.
