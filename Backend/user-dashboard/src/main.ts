import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Environment Security Secrets Validation
  const requiredKeys = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'HANDOFF_TICKET_SECRET',
    'ENCRYPTION_KEY_HEX',
  ];
  for (const key of requiredKeys) {
    const val = process.env[key];
    if (!val || val.trim() === '') {
      throw new Error(`FATAL: Environment variable ${key} is missing or whitespace-only.`);
    }
    if (process.env.NODE_ENV === 'production') {
      if (val.startsWith('CHANGE_ME_') || val.includes('insecure') || val.length < 32) {
        throw new Error(
          `FATAL: Production environment variable ${key} does not meet minimum strength requirements.`,
        );
      }
      if (key === 'ENCRYPTION_KEY_HEX' && !/^[0-9a-fA-F]{64}$/.test(val)) {
        throw new Error(
          `FATAL: Production environment variable ${key} must be exactly 64 hexadecimal characters.`,
        );
      }
    }
  }

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Cookie Parser for HttpOnly Refresh Tokens
  app.use(cookieParser());

  // Strict CORS configuration
  const allowedOrigins = process.env.FRONTEND_ORIGINS
    ? process.env.FRONTEND_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174'];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-Request-ID'],
  });

  // Strict Request DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 4001;
  await app.listen(port);
  logger.log(`WavyAssets Sovereign Backend User Dashboard initialized on port ${port}`);
}

bootstrap();
