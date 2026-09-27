import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, CryptoService],
  exports: [UsersService],
})
export class UsersModule {}
