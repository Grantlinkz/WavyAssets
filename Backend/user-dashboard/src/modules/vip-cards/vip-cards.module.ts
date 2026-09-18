import { Module } from '@nestjs/common';
import { VipCardsController } from './vip-cards.controller';
import { VipCardsService } from './vip-cards.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [PrismaModule, AuthModule, DashboardModule],
  controllers: [VipCardsController],
  providers: [VipCardsService],
  exports: [VipCardsService],
})
export class VipCardsModule {}
