import { Module } from '@nestjs/common';
import { WalletController, PublicDepositRailsController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { DashboardModule } from '../dashboard/dashboard.module';

import { EmailService } from '../../common/services/email.service';

@Module({
  imports: [PrismaModule, AuthModule, WebsocketModule, DashboardModule],
  controllers: [WalletController, PublicDepositRailsController],
  providers: [WalletService, EmailService],
  exports: [WalletService, EmailService],
})
export class WalletModule {}
