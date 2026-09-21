import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../../common/utils/crypto.service';
import { EmailService } from './services/email.service';
import { TelegramService } from './services/telegram.service';
import {
  InitiateAuthDto,
  VerifyOtpDto,
  InitiateAuthResponseDataDto,
  VerifyOtpResponseDataDto,
  ExchangeResponseDataDto,
  ForgotPasswordDto,
  ForgotPasswordResponseDataDto,
  ResetPasswordDto,
  ResetPasswordResponseDataDto,
} from './dto/auth.dto';
import { maskEmail } from '../../common/interceptors/pii-redaction.interceptor';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly isProduction: boolean;
  private readonly devStaticOtp: string | null;
  private readonly dashboardUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly emailService: EmailService,
    private readonly telegramService: TelegramService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.isProduction =
      this.configService.get<string>('server.nodeEnv') === 'production';
    this.devStaticOtp = this.configService.get<string | null>('sandbox.devStaticOtp') ?? null;
    this.dashboardUrl =
      this.configService.get<string>('server.dashboardUrl') || 'http://localhost:5174';
  }

  /**
   * Step 1: Initiate two-step authentication challenge.
   * Validates credentials or prepares registration, generates a 6-digit OTP, and dispatches it.
   */
  async initiate(
    dto: InitiateAuthDto,
    requesterIp = 'unknown',
  ): Promise<InitiateAuthResponseDataDto> {
    const email = dto.email.toLowerCase().trim();
    let targetUserId: string | null = null;
    let tier: string = dto.tier || 'PRIVATE_WEALTH';

    if (dto.mode === 'login') {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        this.logger.warn(`Failed login initiation for non-existent email: ${maskEmail(email)}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await this.crypto.verifyPassword(
        existingUser.passphraseHash,
        dto.passphrase,
      );

      if (!isPasswordValid) {
        this.logger.warn(`Invalid passphrase attempt for account: ${maskEmail(email)}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      targetUserId = existingUser.id;
      tier = existingUser.tier;
    } else {
      // Registration mode
      if (!dto.fullName || dto.fullName.trim().length < 2) {
        throw new BadRequestException('fullName is required for registration (minimum 2 characters)');
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('Account already registered with this email address');
      }

      const passphraseHash = await this.crypto.hashPassword(dto.passphrase);

      // Create new pending user
      const newUser = await this.prisma.user.create({
        data: {
          email,
          fullName: dto.fullName.trim(),
          passphraseHash,
          tier,
          kycTier: 'TIER_1',
          isActive: false, // Activated upon OTP confirmation
        },
      });
      targetUserId = newUser.id;
    }

    // Generate cryptographic 6-digit OTP
    const rawOtp = this.crypto.generateOtp();
    const hashedCode = await this.crypto.hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

    // Invalidate any existing unconsumed challenges for this email
    await this.prisma.otpCode.updateMany({
      where: { email, isConsumed: false },
      data: { isConsumed: true },
    });

    // Create new challenge record
    const challenge = await this.prisma.otpCode.create({
      data: {
        userId: targetUserId,
        email,
        hashedCode,
        attempts: 0,
        isConsumed: false,
        expiresAt,
      },
    });

    // Dispatch OTP via transactional channels
    await this.emailService.sendOtpEmail({
      toEmail: email,
      otpCode: rawOtp,
      requesterIp,
      userFullName: dto.fullName,
    });

    if (tier === 'INSTITUTIONAL') {
      await this.telegramService.sendEnclaveOtpAlert({
        email,
        otpCode: rawOtp,
        tier,
        requesterIp,
      });
    }

    const deliveryChannel = 'EMAIL';
    const backupChannel = tier === 'INSTITUTIONAL' ? 'TELEGRAM_ENCLAVE' : null;

    return {
      step: 2,
      challengeId: challenge.id,
      expiresInSeconds: 300,
      deliveryChannel,
      backupChannel,
      maskedDestination: maskEmail(email),
    };
  }

  /**
   * Step 2: Verify 6-digit OTP challenge, enforce Sandbox Guard, and issue session tokens.
   */
  async verifyOtp(
    dto: VerifyOtpDto,
    requesterIp = 'unknown',
    userAgent = 'unknown',
  ): Promise<VerifyOtpResponseDataDto & { rawRefreshToken: string }> {
    // 1. Production Sandbox Guard
    if (this.isProduction && (dto.otpCode === '123456' || dto.otpCode === this.devStaticOtp)) {
      this.logger.error(
        `[INTRUSION-ALERT] Production Sandbox Guard triggered: submission of dev static OTP from IP ${requesterIp}`,
      );
      throw new ForbiddenException('Sandbox execution forbidden in production');
    }

    // 2. Fetch challenge record
    const challenge = await this.prisma.otpCode.findUnique({
      where: { id: dto.challengeId },
      include: { user: true },
    });

    if (!challenge) {
      throw new UnauthorizedException('Verification challenge expired or invalid');
    }

    if (challenge.isConsumed) {
      throw new UnauthorizedException('Verification challenge expired');
    }

    if (challenge.expiresAt < new Date()) {
      await this.prisma.otpCode.update({
        where: { id: challenge.id },
        data: { isConsumed: true },
      });
      throw new UnauthorizedException('Verification challenge expired');
    }

    // Maximum 3 attempts limit
    if (challenge.attempts >= 3) {
      await this.prisma.otpCode.update({
        where: { id: challenge.id },
        data: { isConsumed: true },
      });
      throw new UnauthorizedException(
        'Verification challenge expired due to excessive failed attempts',
      );
    }

    // 3. Verify OTP code
    let isCodeValid = false;

    // Sandbox check in development mode
    if (!this.isProduction && this.devStaticOtp && dto.otpCode === this.devStaticOtp) {
      isCodeValid = true;
    } else {
      isCodeValid = await this.crypto.verifyOtp(challenge.hashedCode, dto.otpCode);
    }

    if (!isCodeValid) {
      const newAttempts = challenge.attempts + 1;
      await this.prisma.otpCode.update({
        where: { id: challenge.id },
        data: {
          attempts: newAttempts,
          isConsumed: newAttempts >= 3,
        },
      });

      if (newAttempts >= 3) {
        throw new UnauthorizedException(
          'Verification challenge expired due to excessive failed attempts',
        );
      }

      throw new UnauthorizedException('Invalid verification code');
    }

    // 4. Mark challenge consumed
    await this.prisma.otpCode.update({
      where: { id: challenge.id },
      data: { isConsumed: true },
    });

    // 5. Activate user if pending registration
    let user = challenge.user;
    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: challenge.email },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Associated user account could not be found');
    }

    if (!user.isActive) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { isActive: true },
      });
    }

    // 6. Generate signed JWT access token
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        tier: user.tier,
      },
      { expiresIn: '15m' },
    );

    // 7. Generate refresh token & dashboard Authentication
    const rawRefreshToken = this.crypto.generateRefreshToken();
    const refreshTokenHash = this.crypto.hashToken(rawRefreshToken);

    const rawHandoffTicket = this.crypto.generateHandoffTicket();
    const handoffTicketHash = this.crypto.hashHandoffTicket(rawHandoffTicket);

    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        handoffTicketHash,
        ipAddress: requesterIp,
        userAgent,
        expiresAt: sessionExpiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        tier: user.tier,
      },
      accessToken,
      rawRefreshToken,
      handoffTicket: rawHandoffTicket,
      dashboardUrl: `${this.dashboardUrl}/auth/exchange`,
    };
  }

  /**
   * Consumes a single-use dashboard exchange ticket and issues a dashboard session token.
   */
  async exchangeTicket(
    rawTicket: string,
    requesterIp = 'unknown',
  ): Promise<ExchangeResponseDataDto & { rawRefreshToken: string }> {
    if (!rawTicket || typeof rawTicket !== 'string') {
      throw new UnauthorizedException('Missing exchange ticket credential');
    }

    const ticketHash = this.crypto.hashHandoffTicket(rawTicket);

    const session = await this.prisma.session.findUnique({
      where: { handoffTicketHash: ticketHash },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired Authentication');
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Authentication session has expired');
    }

    // Burn ticket immediately: single-use protection
    await this.prisma.session.update({
      where: { id: session.id },
      data: { handoffTicketHash: null },
    });

    // Issue new access token and rotated refresh token
    const accessToken = await this.jwtService.signAsync(
      {
        sub: session.user.id,
        email: session.user.email,
        tier: session.user.tier,
      },
      { expiresIn: '15m' },
    );

    const newRawRefreshToken = this.crypto.generateRefreshToken();
    const newRefreshTokenHash = this.crypto.hashToken(newRawRefreshToken);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        ipAddress: requesterIp,
      },
    });

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        fullName: session.user.fullName,
        tier: session.user.tier,
      },
      accessToken,
      rawRefreshToken: newRawRefreshToken,
    };
  }

  /**
   * Rotates an existing refresh token session.
   */
  async refreshToken(
    rawRefreshToken: string,
  ): Promise<{ accessToken: string; rawRefreshToken: string; user: { id: string; email: string; fullName: string | null; tier: string } }> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Missing refresh token cookie');
    }

    const tokenHash = this.crypto.hashToken(rawRefreshToken);

    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: session.user.id,
        email: session.user.email,
        tier: session.user.tier,
      },
      { expiresIn: '15m' },
    );

    const newRawRefreshToken = this.crypto.generateRefreshToken();
    const newRefreshTokenHash = this.crypto.hashToken(newRawRefreshToken);

    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash: newRefreshTokenHash },
    });

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        fullName: session.user.fullName,
        tier: session.user.tier,
      },
      accessToken,
      rawRefreshToken: newRawRefreshToken,
    };
  }

  /**
   * Logs out the user by revoking the session corresponding to the refresh token.
   */
  async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }

    const tokenHash = this.crypto.hashToken(rawRefreshToken);
    await this.prisma.session.deleteMany({
      where: { refreshTokenHash: tokenHash },
    });
  }

  /**
   * Initiates a password reset challenge by verifying account existence and dispatching a 6-digit OTP.
   */
  async forgotPassword(
    dto: ForgotPasswordDto,
    requesterIp = 'unknown',
  ): Promise<ForgotPasswordResponseDataDto> {
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      this.logger.warn(`Forgot password requested for non-existent email: ${maskEmail(email)}`);
      return {
        step: 2,
        challengeId: randomUUID(),
        expiresInSeconds: 300,
        maskedDestination: maskEmail(email),
      };
    }

    // Generate cryptographic 6-digit OTP
    const rawOtp = this.crypto.generateOtp();
    const hashedCode = await this.crypto.hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

    // Invalidate any existing unconsumed challenges for this email
    await this.prisma.otpCode.updateMany({
      where: { email, isConsumed: false },
      data: { isConsumed: true },
    });

    // Create new challenge record
    const challenge = await this.prisma.otpCode.create({
      data: {
        userId: existingUser.id,
        email,
        hashedCode,
        attempts: 0,
        isConsumed: false,
        expiresAt,
      },
    });

    // Dispatch OTP via reset email
    const emailSent = await this.emailService.sendPasswordResetOtpEmail({
      toEmail: email,
      otpCode: rawOtp,
      requesterIp,
      userFullName: existingUser.fullName || undefined,
    });

    if (!emailSent) {
      await this.prisma.otpCode.update({
        where: { id: challenge.id },
        data: { isConsumed: true },
      });
      throw new BadRequestException('Failed to deliver password reset verification code');
    }

    return {
      step: 2,
      challengeId: challenge.id,
      expiresInSeconds: 300,
      maskedDestination: maskEmail(email),
    };
  }

  /**
   * Verifies the password reset OTP challenge and updates the user's password.
   */
  async resetPassword(
    dto: ResetPasswordDto,
    requesterIp = 'unknown',
  ): Promise<ResetPasswordResponseDataDto> {
    // 1. Production Sandbox Guard
    if (this.isProduction && (dto.otpCode === '123456' || dto.otpCode === this.devStaticOtp)) {
      this.logger.error(
        `[INTRUSION-ALERT] Production Sandbox Guard triggered: submission of dev static OTP in reset-password from IP ${requesterIp}`,
      );
      throw new ForbiddenException('Sandbox execution forbidden in production');
    }

    // 2. Fetch challenge record
    const challenge = await this.prisma.otpCode.findUnique({
      where: { id: dto.challengeId },
      include: { user: true },
    });

    if (!challenge) {
      throw new UnauthorizedException('Verification challenge expired or invalid');
    }

    if (challenge.isConsumed) {
      throw new UnauthorizedException('Verification challenge expired');
    }

    if (challenge.expiresAt < new Date()) {
      await this.prisma.otpCode.update({
        where: { id: challenge.id },
        data: { isConsumed: true },
      });
      throw new UnauthorizedException('Verification challenge expired');
    }

    if (challenge.attempts >= 3) {
      await this.prisma.otpCode.update({
        where: { id: challenge.id },
        data: { isConsumed: true },
      });
      throw new UnauthorizedException(
        'Verification challenge expired due to excessive failed attempts',
      );
    }

    // 3. Verify OTP code
    let isCodeValid = false;
    if (!this.isProduction && this.devStaticOtp && dto.otpCode === this.devStaticOtp) {
      isCodeValid = true;
    } else {
      isCodeValid = await this.crypto.verifyOtp(challenge.hashedCode, dto.otpCode);
    }

    if (!isCodeValid) {
      const newAttempts = challenge.attempts + 1;
      await this.prisma.otpCode.update({
        where: { id: challenge.id },
        data: {
          attempts: newAttempts,
          isConsumed: newAttempts >= 3,
        },
      });

      if (newAttempts >= 3) {
        throw new UnauthorizedException(
          'Verification challenge expired due to excessive failed attempts',
        );
      }

      throw new UnauthorizedException('Invalid verification code');
    }

    // 4. Fetch user
    let user = challenge.user;
    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: challenge.email },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Associated user account could not be found');
    }

    // 5. Hash new password
    const passphraseHash = await this.crypto.hashPassword(dto.newPassphrase);

    // 6. Atomically claim challenge, update user password, and revoke sessions in one database transaction
    await this.prisma.$transaction(async (tx) => {
      const claimResult = await tx.otpCode.updateMany({
        where: {
          id: challenge.id,
          isConsumed: false,
          attempts: { lt: 3 },
        },
        data: { isConsumed: true },
      });

      if (claimResult.count === 0) {
        throw new UnauthorizedException('Verification challenge expired or already consumed');
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          passphraseHash,
          isActive: true,
        },
      });

      await tx.session.deleteMany({
        where: { userId: user.id },
      });
    });

    this.logger.log(`Password reset completed successfully for account: ${maskEmail(user.email)}`);

    return {
      message: 'Password reset successfully. You may now sign in.',
    };
  }
}
