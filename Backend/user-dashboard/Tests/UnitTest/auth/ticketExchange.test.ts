import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { CryptoUtils } from '../../../src/common/utils/crypto.utils';
import { InvalidHandoffTicketException } from '../../../src/common/exceptions';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService — Ticket Exchange & Session Lifecycle', () => {
  let authService: AuthService;
  let mockPrisma: {
    session: {
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
    };
  };
  let mockJwtService: {
    signAsync: ReturnType<typeof vi.fn>;
  };
  let mockConfigService: {
    get: ReturnType<typeof vi.fn>;
  };

  const handoffSecret = 'test-handoff-secret-key-2026';
  const refreshSecret = 'test-refresh-secret-key-2026';

  beforeEach(() => {
    mockPrisma = {
      session: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn(),
      },
    };

    mockJwtService = {
      signAsync: vi.fn().mockResolvedValue('mock-jwt-access-token-15m'),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'HANDOFF_TICKET_SECRET') return handoffSecret;
        if (key === 'JWT_REFRESH_SECRET') return refreshSecret;
        return null;
      }),
    };

    authService = new AuthService(
      mockPrisma as unknown as PrismaService,
      mockJwtService as unknown as JwtService,
      mockConfigService as unknown as ConfigService,
    );
  });

  describe('exchangeTicket', () => {
    const rawTicket = 'sovereign-handoff-ticket-xyz789';
    const computedHash = CryptoUtils.hashHmacSha256(rawTicket, handoffSecret);

    it('successfully exchanges a valid single-use ticket and burns it', async () => {
      const mockUser = {
        id: 'usr-999',
        email: 'founder@wavyassets.com',
        fullName: 'Elena Rostova',
        tier: 'INSTITUTIONAL',
        kycTier: 'TIER_3',
        isCorporate: true,
        isActive: true,
      };

      const mockSession = {
        id: 'sess-001',
        userId: mockUser.id,
        handoffTicketHash: computedHash,
        expiresAt: new Date(Date.now() + 60000),
        user: mockUser,
      };

      mockPrisma.session.findFirst.mockResolvedValue(mockSession);
      mockPrisma.session.update.mockResolvedValue({ id: 'sess-001' });

      const result = await authService.exchangeTicket(rawTicket, '127.0.0.1', 'Mozilla/5.0');

      expect(result.accessToken).toBe('mock-jwt-access-token-15m');
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toEqual({
        id: 'usr-999',
        email: 'founder@wavyassets.com',
        fullName: 'Elena Rostova',
        tier: 'INSTITUTIONAL',
        kycTier: 'TIER_3',
        isCorporate: true,
      });

      // Verify single-use ticket burning (handoffTicketHash set to null)
      expect(mockPrisma.session.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sess-001' },
          data: expect.objectContaining({
            handoffTicketHash: null,
            refreshTokenHash: expect.any(String),
          }),
        }),
      );
    });

    it('throws InvalidHandoffTicketException when ticket hash is not found or expired', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);

      await expect(authService.exchangeTicket('invalid-or-expired-ticket')).rejects.toThrow(
        InvalidHandoffTicketException,
      );
    });

    it('throws InvalidHandoffTicketException when associated user is inactive', async () => {
      const mockSession = {
        id: 'sess-002',
        user: { id: 'usr-inactive', isActive: false },
      };
      mockPrisma.session.findFirst.mockResolvedValue(mockSession);

      await expect(authService.exchangeTicket(rawTicket)).rejects.toThrow(
        InvalidHandoffTicketException,
      );
    });
  });

  describe('refreshTokens', () => {
    const rawRefreshToken = 'existing-refresh-token-hex';
    const computedHash = CryptoUtils.hashHmacSha256(rawRefreshToken, refreshSecret);

    it('successfully rotates refresh token and returns fresh access token', async () => {
      const mockUser = {
        id: 'usr-777',
        email: 'investor@wavyassets.com',
        fullName: 'Carl Weber',
        tier: 'PRIVATE_WEALTH',
        kycTier: 'TIER_2',
        isCorporate: false,
        isActive: true,
      };

      const mockSession = {
        id: 'sess-003',
        userId: mockUser.id,
        refreshTokenHash: computedHash,
        expiresAt: new Date(Date.now() + 100000),
        user: mockUser,
      };

      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.session.update.mockResolvedValue({ id: 'sess-003' });

      const result = await authService.refreshTokens(rawRefreshToken);

      expect(result.accessToken).toBe('mock-jwt-access-token-15m');
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe(rawRefreshToken); // Rotated
      expect(mockPrisma.session.update).toHaveBeenCalled();
    });

    it('throws UnauthorizedException when refresh token is missing or session expired', async () => {
      await expect(authService.refreshTokens(undefined)).rejects.toThrow(UnauthorizedException);

      mockPrisma.session.findUnique.mockResolvedValue(null);
      await expect(authService.refreshTokens('non-existent-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('deletes session matching the refresh token hash', async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 1 });

      const result = await authService.logout('sample-token');
      expect(result).toEqual({ success: true });
      expect(mockPrisma.session.deleteMany).toHaveBeenCalled();
    });
  });
});
