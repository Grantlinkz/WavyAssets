import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { CryptoService } from '../../common/services/crypto.service';
import { TotpService } from '../../common/services/totp.service';
import { PrismaService } from '../../common/services/prisma.service';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

const jwtSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_ACCESS_SECRET or JWT_SECRET must be configured');
}

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AdminAuthController],
  providers: [
    AdminAuthService,
    CryptoService,
    TotpService,
    PrismaService,
    AdminAuthGuard,
    RolesGuard,
  ],
  exports: [
    AdminAuthService,
    CryptoService,
    TotpService,
    PrismaService,
    AdminAuthGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class AdminAuthModule {}
