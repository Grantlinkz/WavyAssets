import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { validateEnvironment } from './config/env.validation';
import { PrismaModule } from './modules/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { LeadsModule } from './modules/leads/leads.module';
import { SimulationModule } from './modules/simulation/simulation.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnvironment,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: (config.get<number>('security.throttleTtl') || 60) * 1000,
          limit: config.get<number>('security.throttleLimit') || 120,
        },
        {
          name: 'auth',
          ttl: 60 * 1000,
          limit: config.get<number>('security.authThrottleLimit') || 5,
        },
      ],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    LeadsModule,
    SimulationModule,
    NewsletterModule,
    ComplianceModule,
    TelemetryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
