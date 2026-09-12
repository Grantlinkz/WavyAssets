import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { PrismaService } from '@/modules/prisma/prisma.service';

describe('Simulation Intent Integration Test (/api/v1/simulation)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: ['health', 'health/live', 'health/ready'],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
    prisma = app.get(PrismaService);
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  }, 30000);

  it('POST /api/v1/simulation/save should tokenize capital intent and return token', async () => {
    const response = await request(app.getHttpAdapter().getInstance())
      .post('/api/v1/simulation/save')
      .send({
        capitalAmount: 1500000,
        riskPosture: 2,
        projectedYield: 14.8,
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.token).toMatch(/^sim_[a-f0-9]+$/);
    expect(response.body.data.riskLabel).toBe('Balanced Growth');
    expect(response.body.data.capitalAmount).toBe(1500000);

    // Verify token can be retrieved
    const getResponse = await request(app.getHttpAdapter().getInstance())
      .get(`/api/v1/simulation/${response.body.data.token}`)
      .expect(200);

    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.data.token).toBe(response.body.data.token);
    expect(getResponse.body.data.capitalAmount).toBe(1500000);

    // Clean up
    await prisma.simulationIntent.delete({
      where: { token: response.body.data.token },
    });
  });

  it('GET /api/v1/simulation/:token with non-existent token should return 404', async () => {
    const response = await request(app.getHttpAdapter().getInstance())
      .get('/api/v1/simulation/sim_non_existent_token_12345')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Simulation intent');
  });
});
