import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    const maxRetries = 5;
    let attempt = 0;
    let delayMs = 1000;

    while (attempt < maxRetries) {
      try {
        attempt++;
        await this.$connect();
        this.logger.log('Prisma ORM connected to PostgreSQL database successfully');
        return;
      } catch (error) {
        if (attempt >= maxRetries) {
          this.logger.error(`Failed to connect to database via Prisma after ${attempt} attempts: ${(error as Error)?.message || error}`);
          return;
        }
        this.logger.warn(`Prisma connection attempt ${attempt}/${maxRetries} failed. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs = Math.min(delayMs * 1.5, 5000);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma ORM disconnected gracefully');
  }

  /**
   * Health probe method to verify SQLite database readiness.
   * Executes a lightweight query and returns true if responsive.
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health ping failed', error);
      return false;
    }
  }
}
