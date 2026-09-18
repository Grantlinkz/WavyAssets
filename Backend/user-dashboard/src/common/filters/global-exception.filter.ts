import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { ERROR_CODES } from '../constants/system.constants';
import { RedactedLoggingInterceptor } from '../interceptors/redacted-logging.interceptor';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Use request-owned property from correlation middleware, with fallback if not initialized
    const correlationId = request?.correlationId || `req-${randomUUID()}`;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode: string = ERROR_CODES.ERR_INTERNAL_SERVER;
    let message =
      'An unexpected error occurred while processing your request. Please quote the reference ID to support.';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorCode = this.mapStatusToErrorCode(statusCode);
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const respObj = exceptionResponse as Record<string, unknown>;
        message = (respObj['message'] as string) || exception.message;
        errorCode = (respObj['errorCode'] as string) || this.mapStatusToErrorCode(statusCode);
        if (respObj['details']) {
          details = respObj['details'];
        } else if (Array.isArray(respObj['message'])) {
          details = respObj['message'];
          message = 'Validation failed on incoming request.';
        }
      }
    } else if (this.isPrismaError(exception)) {
      const prismaError = exception as { code?: string; message?: string };
      // Translate known Prisma errors without leaking database internals
      if (prismaError.code === 'P2002') {
        statusCode = HttpStatus.CONFLICT;
        errorCode = ERROR_CODES.ERR_CONFLICT;
        message = 'A resource with conflicting unique attributes already exists.';
      } else if (prismaError.code === 'P2025') {
        statusCode = HttpStatus.NOT_FOUND;
        errorCode = ERROR_CODES.ERR_NOT_FOUND;
        message = 'The requested resource was not found.';
      } else {
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        errorCode = ERROR_CODES.ERR_INTERNAL_SERVER;
        message = 'A transactional database constraint failed. Operation aborted.';
      }
    }

    // Correlated Redacted Logging (Never leaks raw authorization tokens or passwords)
    const sanitizedUrl = request?.url || 'UNKNOWN_URL';
    const sanitizedMethod = request?.method || 'UNKNOWN_METHOD';
    const logDetails = {
      correlationId,
      statusCode,
      errorCode,
      method: sanitizedMethod,
      url: sanitizedUrl,
      exception: exception instanceof Error ? exception.message : 'Unknown exception',
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (statusCode >= 500) {
      const redactedException = RedactedLoggingInterceptor.redactString(logDetails.exception);
      const redactedStack = RedactedLoggingInterceptor.redactString(logDetails.stack);
      this.logger.error(`[${correlationId}] Server Error: ${redactedException}`, redactedStack);
    } else {
      const redactedMessage = RedactedLoggingInterceptor.redactString(message);
      this.logger.warn(`[${correlationId}] Client Warning (${statusCode}): ${redactedMessage}`);
    }

    // Set correlation ID header in response
    if (response?.setHeader) {
      response.setHeader('X-Correlation-ID', correlationId);
    }

    // Uniform RFC 7807 Standardized Response Envelope
    const responsePayload = {
      success: false,
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: sanitizedUrl,
      correlationId,
      details,
    };

    response.status(statusCode).json(responsePayload);
  }

  private mapStatusToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.ERR_BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.ERR_UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODES.ERR_FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ERROR_CODES.ERR_NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ERROR_CODES.ERR_CONFLICT;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ERROR_CODES.ERR_UNPROCESSABLE;
      default:
        return ERROR_CODES.ERR_INTERNAL_SERVER;
    }
  }

  private isPrismaError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const err = error as Record<string, unknown>;
    return (
      typeof err['code'] === 'string' &&
      (err['code'].startsWith('P2') || err['name'] === 'PrismaClientKnownRequestError')
    );
  }
}
