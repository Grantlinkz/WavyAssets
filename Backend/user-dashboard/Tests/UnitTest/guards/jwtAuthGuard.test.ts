import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../../src/common/guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockJwtService: {
    verifyAsync: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockJwtService = {
      verifyAsync: vi.fn(),
    };
    guard = new JwtAuthGuard(mockJwtService as unknown as JwtService);
  });

  function createMockContext(headers: Record<string, string>, req: Record<string, unknown> = {}) {
    req.headers = headers;
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext;
  }

  it('throws UnauthorizedException when Authorization header is missing', async () => {
    const context = createMockContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when Authorization scheme is not Bearer', async () => {
    const context = createMockContext({ authorization: 'Basic dXNlcjpwYXNz' });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when JWT verification fails', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));
    const context = createMockContext({ authorization: 'Bearer expired-or-bad-jwt' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('attaches authenticated user payload to request and returns true on valid JWT', async () => {
    const mockUser = {
      id: 'usr-12345',
      sub: 'usr-12345',
      email: 'investor@wavyassets.com',
      fullName: 'Marcus Vance',
      tier: 'PRIVATE_WEALTH',
      kycTier: 'TIER_2',
      isCorporate: false,
    };

    mockJwtService.verifyAsync.mockResolvedValue(mockUser);
    const reqObj: Record<string, unknown> = {};
    const context = createMockContext({ authorization: 'Bearer valid-jwt-token' }, reqObj);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-jwt-token', {
      algorithms: ['HS256'],
      issuer: 'wavyassets.com',
      audience: 'wavyassets-client',
    });
    expect(reqObj['user']).toEqual({
      id: 'usr-12345',
      email: 'investor@wavyassets.com',
      fullName: 'Marcus Vance',
      tier: 'PRIVATE_WEALTH',
      kycTier: 'TIER_2',
      isCorporate: false,
    });
  });

  it('throws UnauthorizedException when required claim is missing or wrong type', async () => {
    // Missing kycTier and isCorporate
    const invalidPayload = {
      id: 'usr-12345',
      email: 'investor@wavyassets.com',
      tier: 'PRIVATE_WEALTH',
    };

    mockJwtService.verifyAsync.mockResolvedValue(invalidPayload);
    const context = createMockContext({ authorization: 'Bearer bad-claims-jwt' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
