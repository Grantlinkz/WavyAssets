import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { PrismaService } from '../../common/services/prisma.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Global()
@Module({
  imports: [AdminAuthModule],
  controllers: [AuditController],
  providers: [AuditService, PrismaService],
  exports: [AuditService],
})
export class AuditModule {}
