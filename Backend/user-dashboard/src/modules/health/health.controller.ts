import { Controller, Get, HttpStatus, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface HealthResponse {
  success: boolean;
  status: 'ok' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    database: {
      status: 'connected' | 'disconnected';
      latencyMs?: number;
    };
  };
  system: {
    nodeVersion: string;
    memoryUsageMb: {
      heapUsed: number;
      heapTotal: number;
      rss: number;
    };
  };
}

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Comprehensive Container Health Check
   * Invoked by Docker Compose, Kubernetes, and reverse proxy healthchecks.
   */
  @Get()
  async getHealth(): Promise<HealthResponse> {
    const start = performance.now();
    const isDbHealthy = await this.prisma.isHealthy();
    const latencyMs = Math.round((performance.now() - start) * 100) / 100;

    const mem = process.memoryUsage();
    const memMb = {
      heapUsed: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotal: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      rss: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
    };

    const response: HealthResponse = {
      success: isDbHealthy,
      status: isDbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: isDbHealthy ? 'connected' : 'disconnected',
          latencyMs,
        },
      },
      system: {
        nodeVersion: process.version,
        memoryUsageMb: memMb,
      },
    };

    if (!isDbHealthy) {
      this.logger.error(
        `Health verification failed: database disconnected (latency: ${latencyMs}ms, mem: ${memMb}MB)`,
      );
      throw new ServiceUnavailableException({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        errorCode: 'ERR_DATABASE_DISCONNECTED',
        message: 'Service is currently unavailable',
      });
    }

    return response;
  }

  /**
   * Lightweight Container Liveness Probe
   */
  @Get('live')
  getLiveness(): { success: boolean; status: string; timestamp: string; uptime: number } {
    return {
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }

  /**
   * Container Readiness Probe
   */
  @Get('ready')
  async getReadiness(): Promise<{ success: boolean; ready: boolean; timestamp: string }> {
    const isDbHealthy = await this.prisma.isHealthy();
    if (!isDbHealthy) {
      this.logger.error('Readiness probe failed: database connection unavailable');
      throw new ServiceUnavailableException('Service is currently unavailable');
    }
    return {
      success: true,
      ready: true,
      timestamp: new Date().toISOString(),
    };
  }
}
