import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { PrismaService } from '@/modules/prisma/prisma.service';

describe('Leads Pipeline Integration Test (/api/v1/leads)', () => {
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

  it('POST /api/v1/leads/inquire should reject disposable emails with HTTP 400 Bad Request', async () => {
    const response = await request(app.getHttpAdapter().getInstance())
      .post('/api/v1/leads/inquire')
      .send({
        fullName: 'Anonymous Attacker',
        workEmail: 'attacker@mailinator.com',
        companyName: 'Spam Capital',
        service: 'CRYPTO',
        allocationRange: '$1M - $5M',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Disposable');
  });

  it('POST /api/v1/leads/inquire should accept valid corporate inquiry and persist encrypted PII', async () => {
    const corporateEmail = 'partner@zurich-Global.ch';

    const response = await request(app.getHttpAdapter().getInstance())
      .post('/api/v1/leads/inquire')
      .send({
        fullName: 'Heinrich Zimmermann',
        workEmail: corporateEmail,
        companyName: 'Zurich Global AG',
        websiteUrl: 'https://zurich-Global.ch',
        telegram: '@heinrich_zurich',
        service: 'AI_FUNDS',
        allocationRange: '$5M - $10M',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.inquiryId).toBeDefined();
    expect(response.body.data.priority).toBe(true);
    expect(response.body.data.status).toBe('PRIORITY_REVIEW');

    // Verify database record has AES-256-GCM ciphertexts and zero plaintext PII
    const dbRecord = await prisma.leadInquiry.findUnique({
      where: { id: response.body.data.inquiryId },
    });

    expect(dbRecord).toBeDefined();
    expect(dbRecord?.workEmailEncrypted).not.toContain(corporateEmail);
    expect(dbRecord?.fullNameEncrypted).not.toContain('Heinrich Zimmermann');
    expect(dbRecord?.workEmailHash).toHaveLength(64); //  blind index
    expect(dbRecord?.domainScore).toBe(1.0);
    expect(dbRecord?.isSpam).toBe(false);

    // Clean up
    if (dbRecord) {
      await prisma.leadInquiry.delete({ where: { id: dbRecord.id } });
    }
  });
});
