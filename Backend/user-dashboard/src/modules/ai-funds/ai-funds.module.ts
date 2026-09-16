import { Module } from '@nestjs/common';
import { AiFundsController } from './ai-funds.controller';
import { AiFundsService } from './ai-funds.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WalletModule,
    DashboardModule,
    WebsocketModule,
  ],
  controllers: [AiFundsController],
  providers: [AiFundsService],
  exports: [AiFundsService],
})
export class AiFundsModule {}
