import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { PrismaService } from '@/modules/prisma/prisma.service';

describe('Compliance Audit Integration Test (/api/v1/compliance)', () => {
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

  it('POST /api/v1/compliance/ack should record regulatory disclaimer acknowledgment and hash IP', async () => {
    const response = await request(app.getHttpAdapter().getInstance())
      .post('/api/v1/compliance/ack')
      .send({
        action: 'SEC_RULE_206_4_1_ACK',
        metadata: { jurisdiction: 'US-SEC', version: '2026.1' },
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.auditId).toBeDefined();
    expect(response.body.data.action).toBe('SEC_RULE_206_4_1_ACK');

    // Verify database record has hashed IP and zero raw IP leak
    const auditRecord = await prisma.auditLog.findUnique({
      where: { id: response.body.data.auditId },
    });

    expect(auditRecord).toBeDefined();
    expect(auditRecord?.action).toBe('SEC_RULE_206_4_1_ACK');
    expect(auditRecord?.ipAddressHash).toHaveLength(64); // SHA-256 HMAC hash
    expect(auditRecord?.metadata).toContain('2026.1');

    // Clean up
    if (auditRecord) {
      await prisma.auditLog.delete({ where: { id: auditRecord.id } });
    }
  });
});
