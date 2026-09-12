import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';

describe('Gateway & Health Probes Integration Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Wire global filters and interceptors identically to main.ts
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  }, 30000);

  it('GET /health/live should respond 200 with standardized envelope', async () => {
    const response = await request(app.getHttpAdapter().getInstance())
      .get('/health/live')
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.status).toBe('ok');
    expect(typeof response.body.data.uptimeSeconds).toBe('number');
    expect(response.body.timestamp).toBeDefined();
  });

  it('GET /health/ready should verify SQLite connectivity and return 200 with readiness data', async () => {
    const response = await request(app.getHttpAdapter().getInstance())
      .get('/health/ready')
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.status).toBe('ready');
    expect(response.body.data.database).toBe('connected');
    expect(response.body.data.memory).toBeDefined();
    expect(response.body.data.memory.heapUsedMB).toBeGreaterThan(0);
    expect(response.body.timestamp).toBeDefined();
  });

  it('GET /unknown-route should be caught by AllExceptionsFilter and return 404 standardized envelope', async () => {
    const response = await request(app.getHttpAdapter().getInstance())
      .get('/unknown-route')
      .expect(404);

    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Cannot GET /unknown-route');
    expect(response.body.timestamp).toBeDefined();
    // Zero stack trace leakage
    expect(response.body.stack).toBeUndefined();
  });
});
