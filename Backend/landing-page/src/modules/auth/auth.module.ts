import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CryptoService } from '../../common/utils/crypto.service';
import { EmailService } from './services/email.service';
import { TelegramService } from './services/telegram.service';
import { AuthGuard } from './guards/auth.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('security.jwtSecret') ||
          'wavy_sovereign_terminal_jwt_secret_dev_key_must_be_rotated_in_prod',
        signOptions: {
          expiresIn: (config.get<string>('security.jwtExpiration') || '15m') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CryptoService,
    EmailService,
    TelegramService,
    AuthGuard,
  ],
  exports: [AuthService, CryptoService, AuthGuard, JwtModule, EmailService, TelegramService],
})
export class AuthModule {}
