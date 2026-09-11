import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PiiRedactionInterceptor } from './common/interceptors/pii-redaction.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('server.port') || 4000;
  const clientUrl = configService.get<string>('server.clientUrl') || 'http://localhost:5173';
  const dashboardUrl = configService.get<string>('server.dashboardUrl') || 'http://localhost:5174';

  // 1. Helmet Defensive Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", clientUrl, dashboardUrl],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      frameguard: { action: 'deny' },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      noSniff: true,
    }),
  );

  // 2. Cookie Parser
  app.use(cookieParser());

  // 3. Strict CORS Origin Whitelisting
  const allowedOrigins = [
    clientUrl,
    dashboardUrl,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ].filter(Boolean);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps, curl, or container health probes)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked unauthorized CORS origin: ${origin}`);
        callback(new Error('Cross-Origin Request Blocked by Institutional Security Policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // 4. Global API Prefix with Health Route Exclusions
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'health/live', 'health/ready'],
  });

  // 5. Global Input Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: false,
    }),
  );

  // 6. Global Defensive Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 7. Global Response Envelope & PII Redaction Interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new PiiRedactionInterceptor(),
  );

  // 8. Interactive OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('WavyAssets Institutional Gateway API')
    .setDescription(
      'High-availability NestJS API gateway, cryptographic authentication engine, live syndicate telemetry broadcaster, and institutional mandate pipeline for WavyAssets.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your institutional JWT bearer token',
      },
      'bearer',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      description: 'HttpOnly secure refresh session cookie',
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'WavyAssets Gateway API Docs',
  });

  // 9. Start Server
  await app.listen(port);
  logger.log(`WavyAssets Gateway active on port ${port} [NODE_ENV=${process.env.NODE_ENV || 'development'}]`);
  logger.log(`OpenAPI documentation accessible at http://localhost:${port}/api/docs`);
  logger.log(`Liveness probe: http://localhost:${port}/health/live`);
  logger.log(`Readiness probe: http://localhost:${port}/health/ready`);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
