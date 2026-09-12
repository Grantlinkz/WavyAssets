import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LivenessStatus {
  status: 'ok';
  uptimeSeconds: number;
  timestamp: string;
}

export interface ReadinessStatus {
  status: 'ready' | 'degraded';
  database: 'connected' | 'disconnected';
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  uptimeSeconds: number;
  timestamp: string;
}

@Injectable()
export class HealthService {
  private readonly processStartTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  getLiveness(): LivenessStatus {
    const uptimeSeconds = Math.floor((Date.now() - this.processStartTime) / 1000);
    return {
      status: 'ok',
      uptimeSeconds,
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<ReadinessStatus> {
    const isDbHealthy = await this.prisma.isHealthy();
    const mem = process.memoryUsage();
    const uptimeSeconds = Math.floor((Date.now() - this.processStartTime) / 1000);

    const memoryMetrics = {
      heapUsedMB: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMB: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      rssMB: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
    };

    if (!isDbHealthy) {
      throw new ServiceUnavailableException('Database readiness check failed');
    }

    return {
      status: 'ready',
      database: 'connected',
      memory: memoryMetrics,
      uptimeSeconds,
      timestamp: new Date().toISOString(),
    };
  }
}
