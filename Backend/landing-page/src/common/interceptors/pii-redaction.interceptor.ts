import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

const SENSITIVE_KEYS = new Set([
  'password',
  'passphrase',
  'otp',
  'otpcode',
  'code',
  'token',
  'refreshtoken',
  'accesstoken',
  'handoffticket',
  'secret',
  'authorization',
  'cookie',
  'set-cookie',
]);

export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return '[REDACTED]';
  }
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 1) {
    return `*@${domain}`;
  }
  const maskedLocal = `${localPart[0]}***${localPart[localPart.length - 1]}`;
  return `${maskedLocal}@${domain}`;
}

export function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  if (typeof data === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();

      if (SENSITIVE_KEYS.has(lowerKey)) {
        redacted[key] = '[REDACTED]';
      } else if (lowerKey.includes('email') && typeof value === 'string') {
        redacted[key] = maskEmail(value);
      } else if (
        (lowerKey.includes('fullname') || lowerKey.includes('telegram') || lowerKey.includes('phone')) &&
        typeof value === 'string'
      ) {
        redacted[key] = '[REDACTED_PII]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = redactSensitiveData(value);
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }

  return data;
}

@Injectable()
export class PiiRedactionInterceptor implements NestInterceptor {
  private readonly logger = new Logger('GatewayTraffic');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const startTime = Date.now();
    const { method, originalUrl, ip } = req;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;

          this.logger.log(
            `[GATEWAY] ${method} ${originalUrl} ${statusCode} - ${duration}ms [ip: ${ip || 'unknown'}]`,
          );
        },
        error: (err: unknown) => {
          const duration = Date.now() - startTime;
          const status = (err as { status?: number })?.status || 500;
          this.logger.warn(
            `[GATEWAY-ERR] ${method} ${originalUrl} ${status} - ${duration}ms [ip: ${ip || 'unknown'}]`,
          );
        },
      }),
    );
  }
}
