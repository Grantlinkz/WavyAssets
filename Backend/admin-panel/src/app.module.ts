import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { OverviewModule } from './modules/overview/overview.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { PrismaService } from './common/services/prisma.service';
import { CryptoService } from './common/services/crypto.service';
import { TotpService } from './common/services/totp.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    AdminAuthModule,
    OverviewModule,
    InquiriesModule,
  ],
  controllers: [],
  providers: [PrismaService, CryptoService, TotpService],
})
export class AppModule {}
