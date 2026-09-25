import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { CryptoModule } from './modules/crypto/crypto.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { AiFundsModule } from './modules/ai-funds/ai-funds.module';
import { RealEstateModule } from './modules/real-estate/real-estate.module';
import { CarsModule } from './modules/cars/cars.module';
import { VipCardsModule } from './modules/vip-cards/vip-cards.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { SecurityModule } from './modules/security/security.module';
import { HealthModule } from './modules/health/health.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RedactedLoggingInterceptor } from './common/interceptors/redacted-logging.interceptor';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { CorrelationMiddleware } from './common/middleware/correlation.middleware';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    DashboardModule,
    WebsocketModule,
    WalletModule,
    CryptoModule,
    StocksModule,
    AiFundsModule,
    RealEstateModule,
    CarsModule,
    VipCardsModule,
    ComplianceModule,
    SecurityModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RedactedLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
