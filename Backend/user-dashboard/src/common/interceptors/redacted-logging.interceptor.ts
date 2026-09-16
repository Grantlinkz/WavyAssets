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

    const correlationId =
      (req?.headers?.['x-correlation-id'] as string) ||
      (req?.headers?.['x-request-id'] as string) ||
      `req-${randomUUID()}`;

    if (res?.setHeader) {
      res.setHeader('X-Correlation-ID', correlationId);
    }

    const startTime = Date.now();
    const { method, originalUrl } = req;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;
          this.logger.log(
            `[${correlationId}] ${method} ${originalUrl} -> ${statusCode} (${duration}ms)`,
          );
        },
        error: () => {
          const duration = Date.now() - startTime;
          this.logger.warn(
            `[${correlationId}] ${method} ${originalUrl} -> Execution failed after ${duration}ms`,
          );
        },
      }),
    );
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
      'refreshToken',
      'accessToken',
      'cvv',
      'pin',
      'cvvEncrypted',
      'pinEncrypted',
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
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
