import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArgumentsHost, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { Response, Request } from 'express';

describe('AllExceptionsFilter (Global Defensive Shielding)', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockHost: ArgumentsHost;
  let statusCodeCaptured: number;
  let jsonCaptured: Record<string, unknown>;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    statusCodeCaptured = 0;
    jsonCaptured = {};

    mockResponse = {
      status: vi.fn().mockImplementation((code: number) => {
        statusCodeCaptured = code;
        return {
          json: vi.fn().mockImplementation((body: Record<string, unknown>) => {
            jsonCaptured = body;
          }),
        };
      }),
    };

    mockRequest = {
      method: 'POST',
      url: '/api/v1/auth/initiate',
    };

    mockHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: () => mockResponse as Response,
        getRequest: () => mockRequest as Request,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should format standard HttpException into standardized envelope', () => {
    const exception = new HttpException('Access denied', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockHost);

    expect(statusCodeCaptured).toBe(403);
    expect(jsonCaptured.success).toBe(false);
    expect(jsonCaptured.error).toBe('Access denied');
    expect(jsonCaptured.timestamp).toBeDefined();
    expect(typeof jsonCaptured.timestamp).toBe('string');
  });

  it('should format class-validator array messages cleanly into a single string', () => {
    const exception = new BadRequestException({
      message: ['email must be a valid email', 'password is too weak'],
      error: 'Bad Request',
      statusCode: 400,
    });

    filter.catch(exception, mockHost);

    expect(statusCodeCaptured).toBe(400);
    expect(jsonCaptured.success).toBe(false);
    expect(jsonCaptured.error).toBe('email must be a valid email; password is too weak');
    expect(jsonCaptured.timestamp).toBeDefined();
  });

  it('should strictly sanitize unhandled system errors with zero stack trace leakage', () => {
    const unhandledError = new Error('Unexpected memory corruption at worker thread 42');

    filter.catch(unhandledError, mockHost);

    expect(statusCodeCaptured).toBe(500);
    expect(jsonCaptured.success).toBe(false);
    expect(jsonCaptured.error).toBe('Internal institutional error');
    // Ensure no stack trace or internal path is exposed to the client
    expect(JSON.stringify(jsonCaptured)).not.toContain('memory corruption');
    expect(JSON.stringify(jsonCaptured)).not.toContain('stack');
  });

  it('should suppress and translate Prisma/SQLite database errors into safe domain messages', () => {
    const prismaError = new Error('PrismaClientKnownRequestError: Unique constraint failed on the fields: (email)');
    prismaError.name = 'PrismaClientKnownRequestError';

    filter.catch(prismaError, mockHost);

    expect(statusCodeCaptured).toBe(400);
    expect(jsonCaptured.success).toBe(false);
    expect(jsonCaptured.error).toBe('A database persistence error occurred. Request could not be processed.');
    expect(JSON.stringify(jsonCaptured)).not.toContain('Unique constraint failed on the fields');
  });
});
