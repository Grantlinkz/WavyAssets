import { Module, Global } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { EmergencyController } from './emergency.controller';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { EventsModule } from '../events/events.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { EmergencyLockdownGuard } from '../../common/guards/emergency-lockdown.guard';

@Global()
@Module({
  imports: [EventsModule, AdminAuthModule],
  controllers: [EmergencyController],
  providers: [
    EmergencyService,
    PrismaService,
    CryptoService,
    EmergencyLockdownGuard,
  ],
  exports: [EmergencyService, EmergencyLockdownGuard],
})
export class EmergencyModule {}
