import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/modules/auth/auth.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CryptoService } from '@/common/utils/crypto.service';
import { EmailService } from '@/modules/auth/services/email.service';
import { TelegramService } from '@/modules/auth/services/telegram.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('AuthService (Two-Step Authentication & Gateway Logic)', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockCrypto: any;
  let mockEmailService: any;
  let mockTelegramService: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      otpCode: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      session: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation((cb: any) =>
        typeof cb === 'function' ? cb(mockPrisma) : Promise.all(cb),
      ),
    };

    mockCrypto = {
      hashPassword: vi.fn().mockResolvedValue('$argon2id$hashedPassword'),
      verifyPassword: vi.fn(),
      generateOtp: vi.fn().mockReturnValue('654321'),
      hashOtp: vi.fn().mockResolvedValue('$argon2id$hashedOtpCode'),
      verifyOtp: vi.fn(),
      hashToken: vi.fn().mockImplementation((token: string) => `hash_of_${token}`),
      hashHandoffTicket: vi.fn().mockImplementation((ticket: string) => `hash_of_${ticket}`),
      generateRefreshToken: vi.fn().mockReturnValue('refresh_token_xyz'),
      generateHandoffTicket: vi.fn().mockReturnValue('wavy_ticket_abc'),
    };

    mockEmailService = {
      sendOtpEmail: vi.fn().mockResolvedValue(true),
      sendPasswordResetOtpEmail: vi.fn().mockResolvedValue(true),
    };

    mockTelegramService = {
      sendEnclaveOtpAlert: vi.fn().mockResolvedValue(true),
    };

    mockJwtService = {
      signAsync: vi.fn().mockResolvedValue('mock_jwt_access_token'),
    };

    mockConfigService = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'server.nodeEnv') return 'development';
        if (key === 'sandbox.devStaticOtp') return '123456';
        if (key === 'server.dashboardUrl') return 'http://localhost:5174';
        return null;
      }),
    };

    authService = new AuthService(
      mockPrisma as PrismaService,
      mockCrypto as CryptoService,
      mockEmailService as EmailService,
      mockTelegramService as TelegramService,
      mockJwtService as JwtService,
      mockConfigService as ConfigService,
    );
  });

  describe('initiate()', () => {
    it('should initiate step 1 challenge for valid user login credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr_1',
        email: 'allocator@vault.ch',
        passphraseHash: '$argon2id$passphrase',
        tier: 'INSTITUTIONAL',
        isActive: true,
      });
      mockCrypto.verifyPassword.mockResolvedValue(true);
      mockPrisma.otpCode.create.mockResolvedValue({
        id: 'challenge_1',
        email: 'allocator@vault.ch',
      });

      const result = await authService.initiate({
        email: 'allocator@vault.ch',
        passphrase: 'SecurePassphrase123!',
        mode: 'login',
      });

      expect(result.step).toBe(2);
      expect(result.challengeId).toBe('challenge_1');
      expect(result.expiresInSeconds).toBe(300);
      expect(result.deliveryChannel).toBe('EMAIL');
      expect(result.backupChannel).toBe('TELEGRAM_ENCLAVE');
      expect(mockEmailService.sendOtpEmail).toHaveBeenCalled();
      expect(mockTelegramService.sendEnclaveOtpAlert).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for incorrect passphrase without leaking user existence', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr_1',
        email: 'allocator@vault.ch',
        passphraseHash: '$argon2id$passphrase',
        isActive: true,
      });
      mockCrypto.verifyPassword.mockResolvedValue(false);

      await expect(
        authService.initiate({
          email: 'allocator@vault.ch',
          passphrase: 'WrongPassword!',
          mode: 'login',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if registration mode is missing fullName', async () => {
      await expect(
        authService.initiate({
          email: 'newuser@firm.com',
          passphrase: 'SecurePassphrase123!',
          mode: 'register',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject registration if email is already registered (duplicate registration guard)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr_existing',
        email: 'duplicate@firm.com',
        isActive: true,
      });

      await expect(
        authService.initiate({
          email: 'duplicate@firm.com',
          fullName: 'Existing User',
          passphrase: 'SecurePassphrase123!',
          mode: 'register',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('verifyOtp()', () => {
    it('should strictly reject DEV_STATIC_OTP in production mode with HTTP 403 Forbidden', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'server.nodeEnv') return 'production';
        if (key === 'sandbox.devStaticOtp') return null;
        return null;
      });

      // Re-instantiate in production mode
      const prodAuthService = new AuthService(
        mockPrisma,
        mockCrypto,
        mockEmailService,
        mockTelegramService,
        mockJwtService,
        mockConfigService,
      );

      await expect(
        prodAuthService.verifyOtp({
          challengeId: 'challenge_1',
          otpCode: '123456',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should invalidate challenge after 3 failed verification attempts', async () => {
      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'challenge_1',
        email: 'investor@firm.com',
        hashedCode: '$argon2id$code',
        attempts: 2, // 2 prior failed attempts
        isConsumed: false,
        expiresAt: new Date(Date.now() + 60000),
      });
      mockCrypto.verifyOtp.mockResolvedValue(false); // 3rd failed attempt

      await expect(
        authService.verifyOtp({
          challengeId: 'challenge_1',
          otpCode: '000000',
        }),
      ).rejects.toThrow(UnauthorizedException);

      // Verify attempts incremented to 3 and marked consumed
      expect(mockPrisma.otpCode.update).toHaveBeenCalledWith({
        where: { id: 'challenge_1' },
        data: { attempts: 3, isConsumed: true },
      });
    });

    it('should reject challenge if already consumed or expired', async () => {
      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'challenge_expired',
        email: 'investor@firm.com',
        hashedCode: '$argon2id$code',
        attempts: 0,
        isConsumed: false,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      });

      await expect(
        authService.verifyOtp({
          challengeId: 'challenge_expired',
          otpCode: '654321',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should issue JWT access token, Authentication, and session on valid OTP', async () => {
      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'challenge_valid',
        email: 'investor@firm.com',
        hashedCode: '$argon2id$code',
        attempts: 0,
        isConsumed: false,
        expiresAt: new Date(Date.now() + 60000),
        user: {
          id: 'usr_valid',
          email: 'investor@firm.com',
          fullName: 'Eleanor Vance',
          tier: 'INSTITUTIONAL',
          isActive: true,
        },
      });
      mockCrypto.verifyOtp.mockResolvedValue(true);
      mockPrisma.session.create.mockResolvedValue({ id: 'sess_1' });

      const result = await authService.verifyOtp({
        challengeId: 'challenge_valid',
        otpCode: '654321',
      });

      expect(result.accessToken).toBe('mock_jwt_access_token');
      expect(result.handoffTicket).toBe('wavy_ticket_abc');
      expect(result.user.email).toBe('investor@firm.com');
      expect(mockPrisma.otpCode.update).toHaveBeenCalledWith({
        where: { id: 'challenge_valid' },
        data: { isConsumed: true },
      });
      expect(mockPrisma.session.create).toHaveBeenCalled();
    });
  });

  describe('exchangeTicket()', () => {
    it('should redeem single-use Authentication and burn ticket hash at rest', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        id: 'session_1',
        handoffTicketHash: 'hash_of_wavy_ticket_123',
        expiresAt: new Date(Date.now() + 60000),
        user: {
          id: 'usr_1',
          email: 'investor@firm.com',
          tier: 'PRIVATE_WEALTH',
        },
      });

      const result = await authService.exchangeTicket('wavy_ticket_123');

      expect(result.accessToken).toBe('mock_jwt_access_token');
      expect(result.user.id).toBe('usr_1');

      // Check that ticket was burned (single-use)
      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: 'session_1' },
        data: { handoffTicketHash: null },
      });
    });

    it('should reject already consumed or invalid exchange ticket', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      await expect(
        authService.exchangeTicket('invalid_or_consumed_ticket'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword()', () => {
    it('should dispatch reset OTP email if account exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr_reset',
        email: 'resetme@firm.com',
        fullName: 'Reset User',
        isActive: true,
      });
      mockPrisma.otpCode.create.mockResolvedValue({
        id: 'challenge_reset_1',
      });

      const res = await authService.forgotPassword({
        email: 'resetme@firm.com',
      });

      expect(res.step).toBe(2);
      expect(res.challengeId).toBe('challenge_reset_1');
      expect(res.expiresInSeconds).toBe(300);
      expect(mockEmailService.sendPasswordResetOtpEmail).toHaveBeenCalledWith(
        expect.objectContaining({ toEmail: 'resetme@firm.com' }),
      );
    });

    it('should return step 2 opaque challenge without sending email if account does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await authService.forgotPassword({
        email: 'nonexistent@firm.com',
      });

      expect(res.step).toBe(2);
      expect(res.challengeId).toBeDefined();
      expect(res.expiresInSeconds).toBe(300);
      expect(mockEmailService.sendPasswordResetOtpEmail).not.toHaveBeenCalled();
      expect(mockPrisma.otpCode.create).not.toHaveBeenCalled();
    });

    it('should invalidate challenge and throw BadRequestException if email delivery fails', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr_reset',
        email: 'resetme@firm.com',
        fullName: 'Reset User',
        isActive: true,
      });
      mockPrisma.otpCode.create.mockResolvedValue({
        id: 'challenge_reset_1',
      });
      mockEmailService.sendPasswordResetOtpEmail.mockResolvedValue(false);

      await expect(
        authService.forgotPassword({
          email: 'resetme@firm.com',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrisma.otpCode.update).toHaveBeenCalledWith({
        where: { id: 'challenge_reset_1' },
        data: { isConsumed: true },
      });
    });
  });

  describe('resetPassword()', () => {
    it('should verify reset OTP, update password hash, and revoke sessions atomically', async () => {
      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'challenge_reset_1',
        hashedCode: '$argon2id$hashedOtpCode',
        isConsumed: false,
        attempts: 0,
        expiresAt: new Date(Date.now() + 60000),
        email: 'resetme@firm.com',
        user: {
          id: 'usr_reset',
          email: 'resetme@firm.com',
          isActive: true,
        },
      });
      mockCrypto.verifyOtp.mockResolvedValue(true);
      mockCrypto.hashPassword.mockResolvedValue('$argon2id$newPasswordHash');
      mockPrisma.otpCode.updateMany.mockResolvedValue({ count: 1 });

      const res = await authService.resetPassword({
        challengeId: 'challenge_reset_1',
        otpCode: '654321',
        newPassphrase: 'NewBrandSecurePass123!',
      });

      expect(res.message).toContain('Password reset successfully');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.otpCode.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'challenge_reset_1',
          isConsumed: false,
          attempts: { lt: 3 },
        },
        data: { isConsumed: true },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'usr_reset' },
        data: {
          passphraseHash: '$argon2id$newPasswordHash',
          isActive: true,
        },
      });
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'usr_reset' },
      });
    });

    it('should reject invalid reset OTP', async () => {
      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'challenge_reset_1',
        hashedCode: '$argon2id$hashedOtpCode',
        isConsumed: false,
        attempts: 0,
        expiresAt: new Date(Date.now() + 60000),
        email: 'resetme@firm.com',
        user: {
          id: 'usr_reset',
          email: 'resetme@firm.com',
        },
      });
      mockCrypto.verifyOtp.mockResolvedValue(false);

      await expect(
        authService.resetPassword({
          challengeId: 'challenge_reset_1',
          otpCode: '000000',
          newPassphrase: 'NewBrandSecurePass123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
