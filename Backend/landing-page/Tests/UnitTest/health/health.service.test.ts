import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthService } from '@/modules/health/health.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { ServiceUnavailableException } from '@nestjs/common';

describe('HealthService (Liveness & Readiness Probes)', () => {
  let healthService: HealthService;
  let mockPrisma: Partial<PrismaService>;

  beforeEach(() => {
    mockPrisma = {
      isHealthy: vi.fn().mockResolvedValue(true),
    };
    healthService = new HealthService(mockPrisma as PrismaService);
  });

  it('should return valid liveness probe status', () => {
    const liveness = healthService.getLiveness();

    expect(liveness).toBeDefined();
    expect(liveness.status).toBe('ok');
    expect(typeof liveness.uptimeSeconds).toBe('number');
    expect(liveness.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(liveness.timestamp).toBeDefined();
  });

  it('should return valid readiness probe status when database is responsive', async () => {
    const readiness = await healthService.getReadiness();

    expect(readiness).toBeDefined();
    expect(readiness.status).toBe('ready');
    expect(readiness.database).toBe('connected');
    expect(readiness.memory).toBeDefined();
    expect(readiness.memory.heapUsedMB).toBeGreaterThan(0);
    expect(readiness.memory.heapTotalMB).toBeGreaterThan(0);
    expect(readiness.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(readiness.timestamp).toBeDefined();
  });

  it('should throw ServiceUnavailableException when database health ping fails', async () => {
    mockPrisma.isHealthy = vi.fn().mockResolvedValue(false);

    await expect(healthService.getReadiness()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
