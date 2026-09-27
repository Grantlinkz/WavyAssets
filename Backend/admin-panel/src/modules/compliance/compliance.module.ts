import { Module } from '@nestjs/common';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';

@Module({
  controllers: [ComplianceController],
  providers: [ComplianceService, PrismaService, CryptoService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
