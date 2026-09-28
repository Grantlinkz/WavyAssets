import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { OverviewModule } from './modules/overview/overview.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { UsersModule } from './modules/users/users.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { EventsModule } from './modules/events/events.module';
import { TreasuryModule } from './modules/treasury/treasury.module';
import { DepositRailsModule } from './modules/deposit-rails/deposit-rails.module';
import { VipCardsModule } from './modules/vip-cards/vip-cards.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { AuditModule } from './modules/audit/audit.module';
import { PrismaService } from './common/services/prisma.service';
import { CryptoService } from './common/services/crypto.service';
import { TotpService } from './common/services/totp.service';
import { EmergencyLockdownGuard } from './common/guards/emergency-lockdown.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    AdminAuthModule,
    OverviewModule,
    InquiriesModule,
    UsersModule,
    ComplianceModule,
    EventsModule,
    TreasuryModule,
    DepositRailsModule,
    VipCardsModule,
    EmergencyModule,
    AuditModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    CryptoService,
    TotpService,
    {
      provide: APP_GUARD,
      useClass: EmergencyLockdownGuard,
    },
  ],
})
export class AppModule {}
