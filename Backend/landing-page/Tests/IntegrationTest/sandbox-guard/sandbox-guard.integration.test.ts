import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { PrismaService } from '@/modules/prisma/prisma.service';

describe('Production Sandbox Guard Integration Test', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let configService: ConfigService;

  const testEmail = 'production_guard_probe@Global-vault.ch';

  beforeAll(async () => {
    // Override NODE_ENV to production for this dedicated security test
    const originalEnv = process.env.NODE_ENV;
    const originalStaticOtp = process.env.DEV_STATIC_OTP;
    process.env.NODE_ENV = 'production';
    delete process.env.DEV_STATIC_OTP;

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

    prisma = app.get(PrismaService);
    configService = app.get(ConfigService);

    // Restore env
    process.env.NODE_ENV = originalEnv;
    if (originalStaticOtp) {
      process.env.DEV_STATIC_OTP = originalStaticOtp;
    }

    await prisma.otpCode.deleteMany({
      where: { email: testEmail },
    });
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.otpCode.deleteMany({
        where: { email: testEmail },
      });
    }
    if (app) {
      await app.close();
    }
  }, 30000);

  it('Strict Invariant: In production, submitting DEV_STATIC_OTP (123456) must be rejected with HTTP 403 Forbidden', async () => {
    // Create an active challenge record directly in SQLite
    const challenge = await prisma.otpCode.create({
      data: {
        email: testEmail,
        hashedCode: '$argon2id$mockHashedOtp',
        attempts: 0,
        isConsumed: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    const res = await request(app.getHttpAdapter().getInstance())
      .post('/api/v1/auth/verify-otp')
      .send({
        challengeId: challenge.id,
        otpCode: '123456', // Prohibited sandbox code in production
      })
      .expect(403);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Sandbox execution forbidden in production');
    expect(res.body.timestamp).toBeDefined();
    // Zero stack trace leakage
    expect(res.body.stack).toBeUndefined();
  });
});
