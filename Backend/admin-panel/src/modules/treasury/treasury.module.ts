import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { EmailService } from '../../common/services/email.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule, ConfigModule],
  controllers: [TreasuryController],
  providers: [TreasuryService, PrismaService, CryptoService, EmailService, ConfigService],
  exports: [TreasuryService],
})
export class TreasuryModule {}