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

  async onModuleInit(): Promise<void> {
    const maxRetries = 5;
    let attempt = 0;
    let delayMs = 1500;

    while (attempt < maxRetries) {
      try {
        attempt++;
        await this.$connect();
        this.logger.log('Prisma ORM connected to database successfully');
        return;
      } catch (error) {
        if (attempt >= maxRetries) {
          this.logger.error(`Failed to connect to database via Prisma after ${attempt} attempts: ${(error as Error)?.message || error}`);
          return;
        }
        this.logger.warn(`Prisma connection attempt ${attempt}/${maxRetries} failed. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs = Math.min(delayMs * 1.5, 6000);
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

