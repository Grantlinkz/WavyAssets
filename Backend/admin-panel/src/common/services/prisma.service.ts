import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

function resolveDatabaseUrl(): string {
  const customUrl = process.env.DATABASE_URL;
  if (customUrl && !customUrl.includes('dev.db')) {
    return customUrl;
  }

  const candidates = [
    path.resolve(process.cwd(), '../user-dashboard/prisma/dev.db'),
    path.resolve(process.cwd(), 'Backend/user-dashboard/prisma/dev.db'),
    path.resolve(__dirname, '../../../../user-dashboard/prisma/dev.db'),
    path.resolve(__dirname, '../../../../../user-dashboard/prisma/dev.db'),
    path.resolve(__dirname, '../../../../../Backend/user-dashboard/prisma/dev.db'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return `file:${candidate}`;
    }
  }

  return customUrl || 'file:../user-dashboard/prisma/dev.db';
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const resolvedUrl = resolveDatabaseUrl();
    super({
      datasources: {
        db: {
          url: resolvedUrl,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

