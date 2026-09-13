import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal institutional error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resObj = exception.getResponse();

      if (typeof resObj === 'string') {
        errorMessage = resObj;
      } else if (resObj && typeof resObj === 'object') {
        const rawMsg = (resObj as Record<string, unknown>).message;
        if (Array.isArray(rawMsg)) {
          errorMessage = rawMsg.join('; ');
        } else if (typeof rawMsg === 'string') {
          errorMessage = rawMsg;
        } else if ((resObj as Record<string, unknown>).error) {
          errorMessage = String((resObj as Record<string, unknown>).error);
        }
      }
    } else if (exception instanceof Error) {
      // Check for Prisma or database error indicators to prevent schema leakage
      const isPrismaError =
        exception.name.includes('Prisma') ||
        exception.message.includes('Prisma') ||
        exception.message.includes('sqlite') ||
        exception.message.includes('UNIQUE constraint');

      if (isPrismaError) {
        this.logger.error(`[DATABASE-EXCEPTION] Suppressed raw database error: ${exception.message}`);
        errorMessage = 'A database persistence error occurred. Request could not be processed.';
        status = HttpStatus.BAD_REQUEST;
      } else {
        this.logger.error(
          `[UNHANDLED-EXCEPTION] ${request.method} ${request.url} failed: ${exception.message}`,
          exception.stack,
        );
        errorMessage = 'Internal institutional error';
      }
    } else {
      this.logger.error(
        `[UNKNOWN-EXCEPTION] Non-error exception captured: ${JSON.stringify(exception)}`,
      );
    }

    const errorEnvelope: ApiResponse<null> = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorEnvelope);
  }
}
