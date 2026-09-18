import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('E2E Integration — Production Health & Telemetry Controller', () => {
  let app: INestApplication;

  const mockPrisma = {
    isHealthy: vi.fn().mockResolvedValue(true),
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health — returns 200 OK with connected database status and system telemetry', async () => {
    mockPrisma.isHealthy.mockResolvedValueOnce(true);

    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.data).toMatchObject({
      success: true,
      status: 'ok',
      services: {
        database: {
          status: 'connected',
        },
      },
    });
    expect(response.body.data.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(response.body.data.system.nodeVersion).toBe(process.version);
    expect(response.body.data.system.memoryUsageMb.heapUsed).toBeGreaterThan(0);
  });

  it('GET /health/live — returns 200 OK with uptime probe', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/live')
      .expect(200);

    expect(response.body.data).toMatchObject({
      success: true,
      status: 'ok',
    });
    expect(response.body.data.uptime).toBeGreaterThanOrEqual(0);
  });

  it('GET /health/ready — returns 200 OK when database is ready', async () => {
    mockPrisma.isHealthy.mockResolvedValueOnce(true);

    const response = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200);

    expect(response.body.data).toMatchObject({
      success: true,
      ready: true,
    });
  });

  it('GET /health — returns 503 Service Unavailable when database health ping fails', async () => {
    mockPrisma.isHealthy.mockResolvedValueOnce(false);

    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(503);

    expect(response.body.success).toBe(false);
    expect(response.body.statusCode).toBe(503);
    expect(response.body.errorCode).toBe('ERR_DATABASE_DISCONNECTED');
  });

  it('GET /health/ready — returns 503 Service Unavailable when database is not ready', async () => {
    mockPrisma.isHealthy.mockResolvedValueOnce(false);

    const response = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(503);

    expect(response.body.success).toBe(false);
    expect(response.body.statusCode).toBe(503);
  });
});
