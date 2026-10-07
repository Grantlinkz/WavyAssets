# WavyAssets Admin Panel Architecture

## Overview

The WavyAssets Admin Panel uses a **Modular Monolith Architecture** with **NestJS's Standard Module Pattern**. This architecture provides a well-structured, enterprise-grade foundation that balances simplicity with scalability, allowing for potential future extraction to microservices.

---

## Request Flow

```
Client Request
    ↓
Guards (Authentication/Authorization)
    ↓
Interceptors (Request Transform)
    ↓
Pipes (DTO Validation & Transformation)
    ↓
Controller (routes request)
    ↓
Service (business logic)
    ↓
Database (Prisma) / External APIs
    ↓
Service returns data
    ↓
Controller returns response
    ↓
Interceptors (Response Envelope)
    ↓
Client receives response

[Exception Path (on error at any stage)]:
Unhandled Exception → Exception Filters (GlobalExceptionFilter) → Error Response
```

---

## 1. Modular Monolith Architecture

### What It Is

A single application organized into distinct, self-contained modules (bounded contexts) that communicate through well-defined interfaces. Unlike a microservices architecture, all modules run in the same process and share the same database.

### Module Structure

```
modules/
├── admin-auth/          # Authentication & authorization
├── admins/              # Admin user management
├── audit/               # Audit logging & trails
├── compliance/          # KYC, AML, document verification
├── deposit-rails/       # Deposit rail management
├── emergency/           # Emergency controls (freeze, lockdown)
├── events/              # Event tracking
├── health/              # Health checks
├── inquiries/           # Lead/inquiry management
├── overview/            # Dashboard statistics
├── treasury/            # Treasury operations (deposits, withdrawals)
├── users/               # User management
└── vip-cards/           # VIP card issuance
```

Each module represents a **domain bounded context** - a specific business domain with its own logic.

---

## 2. NestJS Module Pattern (Layered Architecture)

Each module follows a **layered architecture** with clear separation of concerns:

```
Module Layer Structure:
┌─────────────────────────────────────┐
│         Module (.module.ts)         │  ← Dependency Injection Container
├─────────────────────────────────────┤
│      Controller (.controller.ts)     │  ← Presentation Layer (HTTP)
├─────────────────────────────────────┤
│        Service (.service.ts)        │  ← Business Logic Layer
├─────────────────────────────────────┤
│          DTO (.dto.ts)              │  ← Data Validation Layer
└─────────────────────────────────────┘
```

### Layer Responsibilities

**Presentation Layer (Controller)**
- Handles HTTP requests/responses
- Route definition
- Request parsing
- Delegates to services

**Business Logic Layer (Service)**
- Core business rules
- Database operations
- External API calls
- Transactions

**Data Validation Layer (DTO)**
- Input validation
- Type safety
- API contracts

**Dependency Injection Layer (Module)**
- Wires components together
- Manages dependencies
- Exports/imports providers

---

## 3. Shared/Common Layer Architecture

The `common/` directory provides **cross-cutting concerns** shared across all modules:

```
common/
├── constants/       # Shared constants (roles, permissions)
├── decorators/      # Custom decorators (@Public, @Roles, @CurrentAdmin)
├── filters/         # Exception filters (GlobalExceptionFilter)
├── guards/          # Authentication/authorization guards
├── interceptors/    # Response interceptors (ResponseEnvelopeInterceptor)
└── services/        # Shared services (Prisma, Crypto, TOTP, Email)
```

### Shared Components

- **PrismaService**: Database access (global)
- **CryptoService**: Password hashing, encryption
- **TotpService**: Two-factor authentication
- **EmailService**: Transactional emails
- **AdminAuthGuard**: JWT authentication
- **RolesGuard**: Role-based authorization
- **GlobalExceptionFilter**: Error handling
- **ResponseEnvelopeInterceptor**: Response formatting

---

## 4. Dependency Injection Pattern

NestJS uses **constructor-based dependency injection** throughout:

```typescript
// Service injects other services
@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,      // From common/
    private readonly jwtService: JwtService,      // From @nestjs/jwt
    private readonly cryptoService: CryptoService, // From common/
    private readonly totpService: TotpService,     // From common/
  ) {}
}

// Controller injects service
@Controller('auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}
}
```

### Benefits

- Loose coupling
- Easy testing (mock dependencies)
- Single responsibility
- Reusable components

---

## 5. Guard-Interceptor-Filter Pattern

The application uses NestJS's **aspect-oriented programming** concepts:

```
Successful Response Flow:
Request → Guard (Auth) → Interceptor (Transform) → Pipe (Validation) → Controller → Service → Interceptor (Response) → Response

Exception Flow (on error):
Any Stage / Unhandled Exception → Exception Filter (Error) → Formatted Error Response
```

### Guards (Authentication/Authorization)

- **AdminAuthGuard**: JWT verification
- **RolesGuard**: Role-based access control
- **EmergencyLockdownGuard**: Platform lockdown

### Interceptors (Cross-cutting)

- **ResponseEnvelopeInterceptor**: Wraps successful responses in standard format

### Pipes (Validation & Transformation)

- **ValidationPipe**: Global validation pipe transforms and validates request DTOs

### Filters (Error Handling)

- **GlobalExceptionFilter**: Catches unhandled exceptions on the separate exception path and formats error responses

---

## 6. Domain-Driven Design (DDD) Influences

The module structure shows DDD principles:

### Bounded Contexts

Each module represents a bounded context:
- **TreasuryModule**: Financial operations
- **ComplianceModule**: Regulatory compliance
- **AdminAuthModule**: Authentication domain

### Domain Models

Each module has its own domain logic:
- Treasury handles deposits/withdrawals
- Compliance handles KYC/AML
- Audit handles logging

### Shared Kernel

The `common/` directory acts as the shared kernel:
- Shared services (Prisma, Crypto)
- Shared decorators (guards, interceptors)
- Shared constants (roles, permissions)

---

## 7. Repository Pattern (via Prisma)

The application uses Prisma ORM as the repository abstraction:

```typescript
// Service uses PrismaService as repository
async login(dto: AdminLoginDto) {
  const admin = await this.prisma.adminUser.findUnique({
    where: { email: dto.email },
  });
  // ... business logic
}
```

### Benefits

- Type-safe database queries
- Automatic migrations
- Clean separation from raw SQL
- Consistent data access layer

---

## 8. Decorator-Based Configuration

Heavy use of decorators for declarative programming:

```typescript
@Controller('auth')                    // Route prefix
@UseGuards(AdminAuthGuard)            // Apply guard
@Public()                              // Bypass auth
@Post('login')                         // HTTP method
@HttpCode(HttpStatus.OK)              // Status code
async login(@Body() dto: AdminLoginDto) {  // Parameter decorator
  // ...
}
```

### Benefits

- Declarative configuration
- Metadata-driven behavior
- Clean, readable code
- Framework handles implementation

---

## Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     AppModule (Root)                         │
│  - Imports all feature modules                              │
│  - Provides global services (Prisma, Crypto, TOTP, Email)   │
│  - Applies global guards (EmergencyLockdownGuard)            │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│ AdminAuthModule │  │  TreasuryModule │  │  UsersModule    │
├────────────────┤  ├─────────────────┤  ├─────────────────┤
│ Controller     │  │ Controller      │  │ Controller      │
│ Service        │  │ Service         │  │ Service         │
│ DTOs           │  │ DTOs            │  │ DTOs            │
└────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                ┌─────────────▼─────────────┐
                │      Common Layer         │
                ├───────────────────────────┤
                │ PrismaService (DB)        │
                │ CryptoService (Security)  │
                │ TotpService (2FA)         │
                │ EmailService (Notifications)│
                │ Guards (Auth, Roles)      │
                │ Interceptors (Response)   │
                │ Filters (Errors)          │
                └───────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Database       │
                    │   (SQLite/Prisma) │
                    └───────────────────┘
```

---

## Architecture Characteristics

### Strengths

1. **Modularity**: Clear boundaries between domains
2. **Maintainability**: Easy to locate and modify code
3. **Testability**: Services can be tested independently
4. **Scalability**: Can extract modules to microservices later
5. **Type Safety**: TypeScript throughout
6. **Security**: Centralized guards and validation
7. **Consistency**: Shared patterns across modules

### Trade-offs

1. **Monolith**: All modules share the same database and process
2. **Coupling**: Some coupling through shared services
3. **Complexity**: NestJS has a learning curve

### When to Extract to Microservices

- Individual modules need independent scaling
- Different deployment requirements per module
- Team ownership per module
- Technology diversity needed

---

## Summary

The WavyAssets Admin Panel uses:

1. **Modular Monolith Architecture** - Single application with domain modules
2. **NestJS Module Pattern** - Standard controller/service/DTO structure
3. **Layered Architecture** - Presentation, business logic, data layers
4. **Dependency Injection** - Constructor-based DI throughout
5. **Guard-Interceptor-Filter Pattern** - Cross-cutting concerns
6. **Repository Pattern** - Prisma ORM for data access
7. **Decorator-Based Configuration** - Declarative programming
8. **Domain-Driven Design** - Bounded contexts per module

This is a **well-structured, enterprise-grade architecture** that balances simplicity with scalability. It is ideal for a monolithic admin panel that may evolve into microservices later.
