import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';

describe('Telemetry API Integration Tests (/api/v1/telemetry)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: ['health', 'health/live', 'health/ready'],
    });
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  }, 30000);

  it('GET /api/v1/telemetry/ticker should return 200 with multi-asset benchmarks and standardized envelope', async () => {
    const response = await request(app.getHttpAdapter().getInstance())
      .get('/api/v1/telemetry/ticker')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.quotes).toBeDefined();
    expect(response.body.data.quotes.length).toBeGreaterThanOrEqual(10);
    expect(response.body.data.feedStatus).toBe('OPTIMAL');
    expect(response.body.timestamp).toBeDefined();
  });

  it('GET /api/v1/telemetry/enclave should return 200 with Merkle proof-of-reserves and HSM status', async () => {
    const response = await request(app.getHttpAdapter().getInstance())
      .get('/api/v1/telemetry/enclave')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.merkleRoot).toHaveLength(64);
    expect(response.body.data.clearingLatencyMs).toBe(14.2);
    expect(response.body.data.hsmClusters).toHaveLength(3);
    expect(response.body.data.tierAum).toBeDefined();
    expect(response.body.data.tierAum.total).toBe('$17,220,000,000');
  });
});
