import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { PrismaService } from '@/modules/prisma/prisma.service';

describe('Auth Flow Integration Test (Two-Step Authentication & Dashboard Hand-Off)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    email: 'integration_allocator@swiss-vault.ch',
    passphrase: 'InstitutionalVaultPass2026!',
    fullName: 'Lady Beatrice Montgomery',
    tier: 'INSTITUTIONAL' as const,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1', {
      exclude: ['health', 'health/live', 'health/ready'],
    });
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();

    prisma = app.get(PrismaService);

    // Clean up any prior test state for idempotent execution
    await prisma.session.deleteMany({
      where: { user: { email: testUser.email } },
    });
    await prisma.otpCode.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.session.deleteMany({
        where: { user: { email: testUser.email } },
      });
      await prisma.otpCode.deleteMany({
        where: { email: testUser.email },
      });
      await prisma.user.deleteMany({
        where: { email: testUser.email },
      });
    }
    if (app) {
      await app.close();
    }
  }, 30000);

  let challengeId: string;
  let handoffTicket: string;
  let handoffCookie: string;
  let accessToken: string;

  it('Step 1: POST /api/v1/auth/initiate (Registration) should return step 2 challenge', async () => {
    const res = await request(app.getHttpAdapter().getInstance())
      .post('/api/v1/auth/initiate')
      .send({
        email: testUser.email,
        passphrase: testUser.passphrase,
        fullName: testUser.fullName,
        tier: testUser.tier,
        mode: 'register',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.step).toBe(2);
    expect(res.body.data.challengeId).toBeDefined();
    expect(res.body.data.deliveryChannel).toBe('TELEGRAM_ENCLAVE');
    expect(res.body.data.maskedDestination).toContain('i***r@swiss-vault.ch');

    challengeId = res.body.data.challengeId;
  });

  it('Step 2: POST /api/v1/auth/verify-otp (Dev Static Sandbox) should issue JWT, session, and cookies', async () => {
    const res = await request(app.getHttpAdapter().getInstance())
      .post('/api/v1/auth/verify-otp')
      .send({
        challengeId,
        otpCode: '123456', // Valid dev sandbox code
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.tier).toBe('INSTITUTIONAL');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.handoffTicket).toBeDefined();
    expect(res.body.data.dashboardUrl).toContain('/auth/exchange');

    accessToken = res.body.data.accessToken;
    handoffTicket = res.body.data.handoffTicket;

    // Verify Set-Cookie headers
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    const hasRefresh = cookies.some((c) => c.includes('refreshToken='));
    const hasHandoff = cookies.some((c) => c.includes('wavy_handoff='));
    expect(hasRefresh).toBe(true);
    expect(hasHandoff).toBe(true);

    const handoffCookieRaw = cookies ? cookies.find((c) => c.includes('wavy_handoff=')) : undefined;
    handoffCookie = handoffCookieRaw ? handoffCookieRaw.split(';')[0] : '';
  });

  it('Protected Profile: GET /api/v1/auth/me should authenticate using issued JWT Bearer token', async () => {
    const res = await request(app.getHttpAdapter().getInstance())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
    expect(res.body.data.tier).toBe('INSTITUTIONAL');
  });

  it('Dashboard Hand-Off: POST /api/v1/auth/exchange should redeem single-use ticket via cookie or ticket body', async () => {
    const req = request(app.getHttpAdapter().getInstance()).post('/api/v1/auth/exchange');
    if (handoffCookie) {
      req.set('Cookie', handoffCookie);
    }
    const res = await req.send({ ticket: handoffTicket }).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('Single-Use Security Invariant: Second POST /api/v1/auth/exchange attempt must be rejected (401)', async () => {
    // Attempting to reuse the already consumed handoff ticket
    const res = await request(app.getHttpAdapter().getInstance())
      .post('/api/v1/auth/exchange')
      .send({ ticket: handoffTicket })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid or expired handoff ticket');
  });

  it('Login Flow: POST /api/v1/auth/initiate (Login mode) should verify registered user and issue challenge', async () => {
    const res = await request(app.getHttpAdapter().getInstance())
      .post('/api/v1/auth/initiate')
      .send({
        email: testUser.email,
        passphrase: testUser.passphrase,
        mode: 'login',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.step).toBe(2);
    expect(res.body.data.challengeId).toBeDefined();
  });
});
