import { Module } from '@nestjs/common';
import { VipCardsService } from './vip-cards.service';
import { VipCardsController } from './vip-cards.controller';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { EventsModule } from '../events/events.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [EventsModule, AdminAuthModule],
  controllers: [VipCardsController],
  providers: [VipCardsService, PrismaService, CryptoService],
  exports: [VipCardsService],
})
export class VipCardsModule {}
