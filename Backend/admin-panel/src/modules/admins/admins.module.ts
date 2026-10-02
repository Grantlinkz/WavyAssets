import { Module } from '@nestjs/common';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';

@Module({
  controllers: [AdminsController],
  providers: [AdminsService, PrismaService, CryptoService],
  exports: [AdminsService],
})
export class AdminsModule {}
