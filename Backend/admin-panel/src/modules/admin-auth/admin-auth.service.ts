import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { TotpService } from '../../common/services/totp.service';
import { AdminLoginDto } from './dto/login.dto';
import { AdminRole, ROLE_PERMISSIONS } from '../../common/constants/roles.constant';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly totpService: TotpService,
  ) {}

  async login(dto: AdminLoginDto, ipAddress?: string, userAgent?: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid operator credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Operator access has been suspended');
    }

    const isPasswordValid = await this.cryptoService.verifyPassword(
      admin.passphraseHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid operator credentials');
    }

    // Verify TOTP if enabled for this operator
    if (admin.totpSecretHash) {
      if (!dto.totpCode) {
        throw new UnauthorizedException('TOTP 2FA code is required for this operator');
      }

      const decryptedSecret = this.cryptoService.decrypt(admin.totpSecretHash);
      const isTotpValid = this.totpService.verifyTotp(dto.totpCode, decryptedSecret);

      if (!isTotpValid) {
        throw new UnauthorizedException('Invalid TOTP 2FA code');
      }
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'ADMIN',
    };

    const accessTokenSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!accessTokenSecret) {
      throw new UnauthorizedException('JWT access secret is not configured on the server');
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessTokenSecret,
      expiresIn: (process.env.JWT_ACCESS_EXPIRATION as any) || '15m',
    });

    // Generate Refresh Token
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.adminSession.create({
      data: {
        adminId: admin.id,
        refreshTokenHash,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'Supreme Console',
        expiresAt,
      },
    });

    const initials = this.getInitials(admin.fullName);
    const roleKey = admin.role as AdminRole;
    const permissions = ROLE_PERMISSIONS[roleKey] || [];

    return {
      accessToken,
      token: accessToken,
      refreshToken: rawRefreshToken,
      operator: {
        id: admin.id,
        name: admin.fullName,
        fullName: admin.fullName,
        initials,
        email: admin.email,
        role: admin.role as AdminRole,
      },
      permissions,
    };
  }

  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const session = await this.prisma.adminSession.findUnique({
      where: { refreshTokenHash },
      include: { admin: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
      }
      throw new UnauthorizedException('Refresh session expired or invalid');
    }

    if (!session.admin || !session.admin.isActive) {
      throw new UnauthorizedException('Operator access revoked');
    }

    // Refresh Token Rotation
    const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updateResult = await this.prisma.adminSession.updateMany({
      where: {
        id: session.id,
        refreshTokenHash,
      },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: newExpiresAt,
      },
    });

    if (updateResult.count === 0) {
      throw new UnauthorizedException('Refresh session expired or already rotated');
    }

    const payload = {
      sub: session.admin.id,
      email: session.admin.email,
      role: session.admin.role,
      type: 'ADMIN',
    };

    const accessTokenSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!accessTokenSecret) {
      throw new UnauthorizedException('JWT access secret is not configured on the server');
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessTokenSecret,
      expiresIn: (process.env.JWT_ACCESS_EXPIRATION as any) || '15m',
    });

    return {
      accessToken,
      token: accessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  async logout(adminId: string, rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
      await this.prisma.adminSession
        .deleteMany({
          where: { refreshTokenHash },
        })
        .catch(() => {});
    } else {
      await this.prisma.adminSession
        .deleteMany({
          where: { adminId },
        })
        .catch(() => {});
    }

    return { success: true, message: 'Administrative session terminated successfully' };
  }

  async getProfile(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Operator profile not found');
    }

    const roleKey = admin.role as AdminRole;
    return {
      operator: {
        id: admin.id,
        name: admin.fullName,
        fullName: admin.fullName,
        initials: this.getInitials(admin.fullName),
        email: admin.email,
        role: admin.role as AdminRole,
      },
      permissions: ROLE_PERMISSIONS[roleKey] || [],
    };
  }

  private getInitials(name: string): string {
    if (!name) return 'OP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
