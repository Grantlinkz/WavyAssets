import { Module } from '@nestjs/common';
import { OverviewController } from './overview.controller';
import { OverviewService } from './overview.service';
import { PrismaService } from '../../common/services/prisma.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
  controllers: [OverviewController],
  providers: [OverviewService, PrismaService],
  exports: [OverviewService],
})
export class OverviewModule {}
