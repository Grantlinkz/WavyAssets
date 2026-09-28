import { Module } from '@nestjs/common';
import { DepositRailsController, PublicDepositRailsController } from './deposit-rails.controller';
import { DepositRailsService } from './deposit-rails.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [DepositRailsController, PublicDepositRailsController],
  providers: [DepositRailsService, PrismaService, CryptoService],
  exports: [DepositRailsService],
})
export class DepositRailsModule {}
