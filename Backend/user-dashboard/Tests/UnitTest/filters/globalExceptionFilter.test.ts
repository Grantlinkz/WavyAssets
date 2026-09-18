import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { GlobalExceptionFilter } from '../../../src/common/filters/global-exception.filter';
import { InvalidHandoffTicketException } from '../../../src/common/exceptions';
import { ERROR_CODES } from '../../../src/common/constants/system.constants';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    setHeader: ReturnType<typeof vi.fn>;
  };
  let mockRequest: {
    url: string;
    method: string;
    correlationId?: string;
    headers: Record<string, string>;
  };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/api/v1/wallet/withdraw',
      method: 'POST',
      correlationId: 'test-corr-id-12345',
      headers: {},
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('formats HttpException into custom standardized envelope with correlationId', () => {
    const exception = new InvalidHandoffTicketException('Ticket has expired');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-Correlation-ID',
      'test-corr-id-12345',
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 401,
        errorCode: ERROR_CODES.ERR_INVALID_HANDOFF_TICKET,
        message: 'Ticket has expired',
        path: '/api/v1/wallet/withdraw',
        correlationId: 'test-corr-id-12345',
      }),
    );
  });

  it('maps string HttpException responses to mapped errorCode rather than ERR_INTERNAL_SERVER', () => {
    const exception = new HttpException('Validation query failed', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        errorCode: ERROR_CODES.ERR_BAD_REQUEST,
        message: 'Validation query failed',
      }),
    );
  });

  it('shields internal errors without leaking stack traces or database schema', () => {
    const rawError = new Error('Database connection string failure: postgres://admin:secret@db:5432/core');

    filter.catch(rawError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const jsonCall = mockResponse.json.mock.calls[0][0];

    expect(jsonCall.success).toBe(false);
    expect(jsonCall.statusCode).toBe(500);
    expect(jsonCall.errorCode).toBe(ERROR_CODES.ERR_INTERNAL_SERVER);
    expect(jsonCall.message).not.toContain('postgres://');
    expect(jsonCall.message).not.toContain('secret');
    expect(jsonCall.message).toContain('unexpected error occurred');
    expect(jsonCall.stack).toBeUndefined();
  });

  it('translates Prisma unique constraint violation (P2002) into HTTP 409 Conflict', () => {
    const prismaError = {
      name: 'PrismaClientKnownRequestError',
      code: 'P2002',
      message: 'Unique constraint failed on field: email',
    };

    filter.catch(prismaError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 409,
        errorCode: ERROR_CODES.ERR_CONFLICT,
      }),
    );
  });
});
