import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AdminAuthService } from '../../src/modules/admin-auth/admin-auth.service';
import { AdminRole } from '../../src/common/constants/roles.constant';

describe('AdminAuthService', () => {
  let authService: AdminAuthService;
  let mockPrisma: any;
  let mockJwtService: any;
  let mockCryptoService: any;
  let mockTotpService: any;

  beforeEach(() => {
    mockPrisma = {
      adminUser: {
        findUnique: vi.fn(),
      },
      adminSession: {
        create: vi.fn().mockResolvedValue({ id: 'sess-1' }),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        delete: vi.fn(),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };

    mockJwtService = {
      signAsync: vi.fn().mockResolvedValue('mock_jwt_access_token'),
    };

    mockCryptoService = {
      verifyPassword: vi.fn(),
      decrypt: vi.fn(),
    };

    mockTotpService = {
      verifyTotp: vi.fn(),
    };

    authService = new AdminAuthService(
      mockPrisma,
      mockJwtService,
      mockCryptoService,
      mockTotpService,
    );
  });

  describe('login', () => {
    it('should successfully authenticate an operator and return JWT + session', async () => {
      const mockAdmin = {
        id: 'op-treasury_officer-01',
        email: 'e.vance@wavyassets.ch',
        fullName: 'Eleanor Vance',
        passphraseHash: 'hashed_pass',
        role: AdminRole.TREASURY_OFFICER,
        totpSecretHash: null,
        isActive: true,
      };

      mockPrisma.adminUser.findUnique.mockResolvedValue(mockAdmin);
      mockCryptoService.verifyPassword.mockResolvedValue(true);

      const result = await authService.login({
        email: 'e.vance@wavyassets.ch',
        password: 'ValidPassword123!',
      });

      expect(result.accessToken).toBe('mock_jwt_access_token');
      expect(result.operator.email).toBe('e.vance@wavyassets.ch');
      expect(result.operator.role).toBe(AdminRole.TREASURY_OFFICER);
      expect(result.operator.initials).toBe('EV');
      expect(result.permissions).toContain('canApproveDualSignOff');
      expect(mockPrisma.adminSession.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for non-existent operator', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@wavyassets.ch',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'op-1',
        email: 'test@wavyassets.ch',
        passphraseHash: 'hash',
        isActive: true,
      });
      mockCryptoService.verifyPassword.mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@wavyassets.ch',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should enforce TOTP 2FA when configured for the operator', async () => {
      const mockAdmin = {
        id: 'op-super_admin-01',
        email: 'a.wright@wavyassets.ch',
        fullName: 'Alexander Wright',
        passphraseHash: 'hash',
        role: AdminRole.SUPER_ADMIN,
        totpSecretHash: 'encrypted_secret',
        isActive: true,
      };

      mockPrisma.adminUser.findUnique.mockResolvedValue(mockAdmin);
      mockCryptoService.verifyPassword.mockResolvedValue(true);
      mockCryptoService.decrypt.mockReturnValue('SECRET32CHARBASE32STRING123456');
      mockTotpService.verifyTotp.mockReturnValue(true);

      // Without totpCode -> should fail
      await expect(
        authService.login({
          email: 'a.wright@wavyassets.ch',
          password: 'Password123!',
        }),
      ).rejects.toThrow('TOTP 2FA code is required');

      // With valid totpCode -> should succeed
      const result = await authService.login({
        email: 'a.wright@wavyassets.ch',
        password: 'Password123!',
        totpCode: '123456',
      });
      expect(result.accessToken).toBe('mock_jwt_access_token');
    });
  });

  describe('refresh', () => {
    it('should rotate session and return fresh token', async () => {
      const mockSession = {
        id: 'sess-123',
        expiresAt: new Date(Date.now() + 100000),
        admin: {
          id: 'op-1',
          email: 'op@wavyassets.ch',
          role: AdminRole.DESK_LEAD,
          isActive: true,
        },
      };

      mockPrisma.adminSession.findUnique.mockResolvedValue(mockSession);
      mockPrisma.adminSession.updateMany.mockResolvedValue({ count: 1 });

      const result = await authService.refresh('raw_refresh_token_sample');

      expect(result.accessToken).toBe('mock_jwt_access_token');
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.adminSession.updateMany).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return operator profile and role permissions', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'op-super_admin-01',
        email: 'a.wright@wavyassets.ch',
        fullName: 'Alexander Wright',
        role: AdminRole.SUPER_ADMIN,
      });

      const profile = await authService.getProfile('op-super_admin-01');
      expect(profile.operator.fullName).toBe('Alexander Wright');
      expect(profile.operator.role).toBe(AdminRole.SUPER_ADMIN);
      expect(profile.permissions).toContain('canFreezePlatform');
      expect(profile.permissions).toContain('canDirectFund');
    });

    it('should throw NotFoundException if operator is missing', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue(null);
      await expect(authService.getProfile('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
