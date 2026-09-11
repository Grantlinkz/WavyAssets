# Code Standards — WavyAssets Landing Page Backend

## General Engineering Principles

1. **Precision & Single Responsibility**: Every module, controller, service, and DTO must have a clear, isolated purpose and minimal surface area.
2. **Defensive by Default**: Treat every incoming request as untrusted. Validate inputs via `class-validator`, sanitize outputs, and enforce security guards across all endpoints.
3. **Deterministic Data Contracts**: Strictly adhere to defined API contracts, request payloads, and standardized JSON envelopes.

---

## TypeScript & NestJS Standards

- **Strict Type Checking**: Strict mode is enforced (`tsconfig.json`). The `any` type is strictly forbidden. Use explicit interfaces, generics, discriminated unions, and strong DTO typings.
- **Explicit Return Types**: All controller methods and service functions must explicitly specify return types (e.g. `Promise<ApiResponse<InitiateAuthResponseDto>>`).
- **Dependency Injection**: Use NestJS constructor-based dependency injection. Avoid global singletons or direct instantiations of injectable services.
- **Lifecycle Management**: Properly implement NestJS lifecycle hooks (`onModuleInit`, `onModuleDestroy`) for services managing database pools (PrismaService) or background intervals (TickerGateway).

---

## DTOs & Input Validation Standards

- **Validation Decorators**: All request payloads must be defined as class DTOs decorated with `class-validator` and `class-transformer`:
  ```typescript
  export class InquireLeadDto {
    @ApiProperty({ example: 'Eleanor Vance' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    fullName: string;

    @ApiProperty({ example: 'vance@zurich-allocators.ch' })
    @IsEmail()
    @IsCorporateEmail() // Custom domain validator
    workEmail: string;

    @ApiProperty({ enum: ServiceVertical })
    @IsEnum(ServiceVertical)
    service: ServiceVertical;

    @ApiProperty({ example: '$5M - $10M' })
    @IsString()
    allocation: string;
  }
  ```
- **Global ValidationPipe Configuration**:
  ```typescript
  new ValidationPipe({
    whitelist: true,              // Strip unwhitelisted payload fields
    forbidNonWhitelisted: true,   // Abort with 400 if extra properties are sent
    transform: true,              // Auto-transform primitive types
    stopAtFirstError: false,
  });
  ```
- **Honeypot Fields**: Include silent anti-spam fields (e.g. `website_hp`) in public forms; if populated, silently discard or flag as spam without failing noisily.

---

## Global Error Handling & Error Boundaries

### 1. Standardized Response Envelope
All HTTP endpoints must emit responses adhering to the institutional envelope:
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

### 2. Global Exception Filter (`AllExceptionsFilter`)
- Must catch both `HttpException` and unhandled system errors.
- Never leak stack traces, database schema details, or system filepaths to client responses.
- Return structured, sanitized JSON:
  ```typescript
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      
      const status = exception instanceof HttpException 
        ? exception.getStatus() 
        : HttpStatus.INTERNAL_SERVER_ERROR;

      const resObj = exception instanceof HttpException 
        ? exception.getResponse() 
        : 'Internal institutional error';

      let errorMessage = 'Request failed';
      if (typeof resObj === 'string') {
        errorMessage = resObj;
      } else if (resObj && typeof resObj === 'object') {
        const rawMsg = (resObj as Record<string, unknown>).message;
        if (Array.isArray(rawMsg)) {
          errorMessage = rawMsg.join('; ');
        } else if (typeof rawMsg === 'string') {
          errorMessage = rawMsg;
        }
      }

      response.status(status).json({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  }
  ```

### 3. Domain Error Handling When Required
- **Auth Service**:
  - Failed credential verification must throw `UnauthorizedException('Invalid credentials or challenge expired')`.
  - Exceeded OTP attempts (>3) must permanently invalidate the challenge and throw `UnauthorizedException('Verification challenge expired')`.
  - Submission of dev static OTP in production must throw `ForbiddenException('Sandbox execution forbidden in production')`.
- **External Integration Boundaries**:
  - Resend email dispatches and Telegram bot alerts must be wrapped in `try/catch` blocks.
  - If Resend experiences a transient API error, log the failure with redacted PII and fallback gracefully (or queue retry) without failing the customer's initiate challenge.
  - Market data upstream queries (CoinGecko / financial APIs) must be protected with an in-memory circuit-breaker serving cached quotes on upstream degradation.
- **Database Exceptions**:
  - Intercept Prisma error codes (e.g. `P2002` unique constraint violation) and throw corresponding HTTP exceptions (`ConflictException`) rather than allowing raw database errors to bubble up.

---

## Cryptographic & Security Coding Standards

- **Password & OTP Hashing**: Use Argon2id with memory-hard parameters:
  ```typescript
  import * as argon2 from 'argon2';
  
  // Hashing
  const hash = await argon2.hash(plainText, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
  
  // Verification (constant-time)
  const isValid = await argon2.verify(hash, plainText);
  ```
- **Field-Level Encryption (AES-256-GCM)**:
  - Use authenticated encryption with a 256-bit key, random 12-byte initialization vector (IV), and 16-byte authentication tag.
  - Format storage payload as `iv:authTag:cipherText` (hex encoded).
- **Secure Random Generation**:
  - OTP numeric generation: `crypto.randomInt(100000, 1000000).toString()`.
  - Session tokens: `crypto.randomBytes(32).toString('hex')`.

---

## Prisma ORM Database Standards

- **Prisma Client Injection**: Always inject `PrismaService` into domain services; never instantiate new PrismaClient instances.
- **Atomic Transactions**: Multi-model writes (e.g. creating user, writing session token, invalidating OTP challenge) must be executed inside `prisma.$transaction([...])`.
- **No Raw SQL**: Raw SQL (`$queryRaw`) is prohibited unless performing high-performance aggregations, and even then, must use tagged template parameters to prevent SQL injection.
- **Database Soft Invariants**:
  - Sensitive lead fields must never be stored in plain text.
  - OTP codes must always be hashed before persistence; never store plain text OTPs in SQLite.

---

## Logging & Redaction Discipline

- Use NestJS built-in logger or Winston with a custom PII Redaction Interceptor.
- Strip or mask all occurrences of:
  - `passphrase`, `password`, `otpCode`, `code`
  - `authorization`, `cookie`, `token`
  - `email`, `workEmail`, `telegram` (redact prefix: `a***@domain.com`)
  - Full names and phone numbers.

---

## Testing Standards & Directory Layout

All tests are executed via **Vitest**:
- **Unit Tests (`Tests/UnitTest/<test-name>/`)**:
  - Test individual service methods, crypto ciphers, and DTO validators in complete isolation.
  - Mock PrismaService and external network dependencies using `vi.mock` or mock factories.
  - Fast execution benchmark: `< 10ms` per unit test.
- **Integration Tests (`Tests/IntegrationTest/<test-name>/`)**:
  - Test end-to-end controller flows using Supertest against a test NestJS instance.
  - Validate database persistence, transaction rollbacks, rate limiting, and HTTP response envelopes.
  - Verify the **Production Sandbox Guard** (`NODE_ENV=production` rejects `DEV_STATIC_OTP` with `403 Forbidden`).

---

## Pre-Commit Checklist

Before committing any backend code or declaring a unit of work complete:
1. **Typecheck**: `npx tsc --noEmit` with zero errors.
2. **Linter**: `npm run lint` with zero errors or warnings.
3. **Automated Tests**: `npm run test` ensuring all tests in `Tests/UnitTest/` and `Tests/IntegrationTest/` pass.
4. **Error Handling & Envelope Check**: Confirm all endpoints return `{ success, data, error, timestamp }` and errors are sanitized.
5. **PII Redaction Check**: Confirm no plain text credentials or PII appear in server logs.
6. **Progress Tracker**: Update `.ai/progress-tracker.md` and OpenAPI documentation at `/api/docs`.
