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
import { randomUUID } from 'crypto';

@Injectable()
export class RedactedLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const correlationId = req?.correlationId || `req-${randomUUID()}`;

    if (res?.setHeader) {
      res.setHeader('X-Correlation-ID', correlationId);
    }

    const startTime = Date.now();
    const { method, originalUrl } = req;
    const sanitizedUrl = RedactedLoggingInterceptor.redactString(originalUrl);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;
          this.logger.log(
            `[${correlationId}] ${method} ${sanitizedUrl} -> ${statusCode} (${duration}ms)`,
          );
        },
        error: () => {
          const duration = Date.now() - startTime;
          this.logger.warn(
            `[${correlationId}] ${method} ${sanitizedUrl} -> Execution failed after ${duration}ms`,
          );
        },
      }),
    );
  }

  public static redactString(str: string | undefined): string {
    if (!str) return '';
    return str
      // Bearer tokens and JWTs
      .replace(/Bearer\s+[A-Za-z0-9-_=.]+/gi, 'Bearer [REDACTED]')
      .replace(/eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.]+/g, '[REDACTED_JWT]')
      // Password / secret / token query params in URLs
      .replace(/([?&](?:password|passphrase|token|secret|ticket|key|refreshToken|accessToken|cvv|pin)=)[^&]+/gi, '$1[REDACTED]')
      // Password / secret / token in JSON fields
      .replace(/("(?:password|passphrase|token|secret|refreshToken|accessToken|cvv|pin)":\s*)"[^"]+"/gi, '$1"[REDACTED]"')
      // Email addresses
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  }

  public static redactObject(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') return obj;

    const SENSITIVE_KEYS = [
      'authorization',
      'cookie',
      'set-cookie',
      'password',
      'passphrase',
      'ticket',
      'refreshtoken',
      'accesstoken',
      'cvv',
      'pin',
      'cvvencrypted',
      'pinencrypted',
      'secret',
      'token',
      'bearer',
    ];

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactObject(item));
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.redactObject(value);
      } else if (typeof value === 'string') {
        result[key] = this.redactString(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
