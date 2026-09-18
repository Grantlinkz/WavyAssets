import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtils } from '../../common/utils/crypto.utils';
import { InvalidHandoffTicketException } from '../../common/exceptions';
import { RedactedLoggingInterceptor } from '../../common/interceptors/redacted-logging.interceptor';

export interface AuthUserResponse {
  id: string;
  email: string;
  fullName: string | null;
  tier: string;
  kycTier: string;
  isCorporate: boolean;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user?: AuthUserResponse;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly handoffSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const handoff = this.configService.get<string>('HANDOFF_TICKET_SECRET');
    const refresh = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!handoff || !refresh) {
      throw new Error(
        'HANDOFF_TICKET_SECRET and JWT_REFRESH_SECRET must be defined in configuration.',
      );
    }

    this.handoffSecret = handoff;
    this.refreshSecret = refresh;
  }

  /**
   * Exchanges an ephemeral, single-use handoff ticket for an Access JWT and Refresh Token
   */
  async exchangeTicket(
    rawTicket: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthTokensResponse> {
    if (!rawTicket || typeof rawTicket !== 'string') {
      throw new InvalidHandoffTicketException('Ticket parameter is missing or invalid.');
    }

    // 1. Compute deterministic HMAC-SHA256 of the raw ticket
    const ticketHash = CryptoUtils.hashHmacSha256(rawTicket, this.handoffSecret);

    // 2. Query session with matching ticket hash that has not expired
    const session = await this.prisma.session.findFirst({
      where: {
        handoffTicketHash: ticketHash,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!session || !session.user || !session.user.isActive) {
      throw new InvalidHandoffTicketException();
    }

    const { user } = session;

    // 3. Generate fresh refresh token and compute hash
    const rawRefreshToken = CryptoUtils.generateRandomHex(32);
    const newRefreshTokenHash = CryptoUtils.hashHmacSha256(
      rawRefreshToken,
      this.refreshSecret,
    );
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // 4. Atomically burn handoff ticket conditioned on session ID and matching ticketHash
    const updateResult = await this.prisma.session.updateMany({
      where: {
        id: session.id,
        handoffTicketHash: ticketHash,
        expiresAt: { gt: new Date() },
      },
      data: {
        handoffTicketHash: null, // BURN SINGLE-USE TICKET
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: refreshExpiresAt,
        ipAddress: ipAddress || session.ipAddress,
        userAgent: userAgent || session.userAgent,
      },
    });

    if (updateResult.count === 0) {
      throw new InvalidHandoffTicketException(
        'Handoff ticket has already been consumed or invalidated.',
      );
    }

    // 5. Generate short-lived Access JWT (15 minutes)
    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      tier: user.tier,
      kycTier: user.kycTier,
      isCorporate: user.isCorporate,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      issuer: 'wavyassets.com',
      audience: 'wavyassets-client',
    });

    this.logger.log(`Session ticket successfully exchanged for user [${user.id}]`);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        tier: user.tier,
        kycTier: user.kycTier,
        isCorporate: user.isCorporate,
      },
    };
  }

  /**
   * Refreshes access token and rotates the refresh token
   */
  async refreshTokens(rawRefreshToken?: string): Promise<AuthTokensResponse> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshTokenHash = CryptoUtils.hashHmacSha256(
      rawRefreshToken,
      this.refreshSecret,
    );

    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash },
      include: { user: true },
    });

    if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
      throw new UnauthorizedException('Invalid or expired refresh session');
    }

    const { user } = session;

    // Rotate refresh token
    const newRawRefreshToken = CryptoUtils.generateRandomHex(32);
    const newRefreshTokenHash = CryptoUtils.hashHmacSha256(
      newRawRefreshToken,
      this.refreshSecret,
    );
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Atomically rotate conditioned on session ID, matching refreshTokenHash, and unexpired session
    const updateResult = await this.prisma.session.updateMany({
      where: {
        id: session.id,
        refreshTokenHash,
        expiresAt: { gt: new Date() },
      },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: newExpiresAt,
      },
    });

    if (updateResult.count === 0) {
      throw new UnauthorizedException('Session token was already rotated, invalidated, or has expired');
    }

    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      tier: user.tier,
      kycTier: user.kycTier,
      isCorporate: user.isCorporate,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      issuer: 'wavyassets.com',
      audience: 'wavyassets-client',
    });

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        tier: user.tier,
        kycTier: user.kycTier,
        isCorporate: user.isCorporate,
      },
    };
  }

  /**
   * Terminates active session
   */
  async logout(rawRefreshToken?: string): Promise<{ success: boolean }> {
    if (!rawRefreshToken) {
      return { success: true };
    }

    try {
      const refreshTokenHash = CryptoUtils.hashHmacSha256(
        rawRefreshToken,
        this.refreshSecret,
      );

      await this.prisma.session.deleteMany({
        where: { refreshTokenHash },
      });
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to revoke session on logout: ${RedactedLoggingInterceptor.redactString(errMessage)}`,
      );
      throw new InternalServerErrorException('Failed to revoke session during logout');
    }

    return { success: true };
  }
}
