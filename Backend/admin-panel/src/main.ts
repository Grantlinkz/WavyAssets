import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';

async function bootstrap() {
  const logger = new Logger('SupremeAdminBootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Trust proxy for accurate req.ip behind reverse proxies
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Security Headers
  app.use(helmet());

  // Body limit for documents and dossiers
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Cookie Parser
  app.use(cookieParser());

  // CORS Configuration
  const frontendOrigins = (process.env.FRONTEND_ORIGINS || 'http://localhost:5175,http://localhost:5174,http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (frontendOrigins.includes(origin) || frontendOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS policy'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token', 'x-sandbox-mode'],
  });

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global Response Envelope Interceptor
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4002;
  await app.listen(port);
  logger.log(`WavyAssets Supreme Admin Panel running on internal port :${port} [api/v1]`);
}

bootstrap();
