import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';

import { EmailService } from '../../common/services/email.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, CryptoService, EmailService],
  exports: [UsersService, EmailService],
})
export class UsersModule {}
