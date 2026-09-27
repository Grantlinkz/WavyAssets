import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { CryptoService } from '../../common/services/crypto.service';
import { TotpService } from '../../common/services/totp.service';
import { PrismaService } from '../../common/services/prisma.service';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret:
        process.env.JWT_ACCESS_SECRET ||
        process.env.JWT_SECRET ||
        'wavy_admin_jwt_access_super_secret_sovereign_enclave_2026',
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
