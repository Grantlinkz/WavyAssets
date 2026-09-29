import { Module } from '@nestjs/common';
import { InquiriesController, UsersConversionController } from './inquiries.controller';
import { InquiriesService } from './inquiries.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
  controllers: [InquiriesController, UsersConversionController],
  providers: [InquiriesService, PrismaService, CryptoService],
  exports: [InquiriesService],
})
export class InquiriesModule {}
