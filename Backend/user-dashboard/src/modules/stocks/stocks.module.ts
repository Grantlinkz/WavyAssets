import { Module } from '@nestjs/common';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [PrismaModule, AuthModule, WalletModule, DashboardModule, WebsocketModule],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
