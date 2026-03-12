import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger as PinoLogger } from 'nestjs-pino';
import { join } from 'path';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import { SanitizeInputInterceptor } from './common/interceptors/sanitize-input.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // INFRA-004: Initialize Sentry error tracking (opt-in via SENTRY_DSN)
  if (process.env.SENTRY_DSN) {
    try {
      const Sentry = require('@sentry/node');
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 0.1,
      });
      logger.log('Sentry error tracking initialized');
    } catch {
      logger.warn(
        'SENTRY_DSN is set but @sentry/node is not installed — Sentry disabled'
      );
    }
  }

  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL', 'REDIS_URL'];
  const optionalEnvVars = [
    'CUSTOMER_PORTAL_JWT_SECRET',
    'CARRIER_PORTAL_JWT_SECRET',
    'SENDGRID_API_KEY',
    'TWILIO_ACCOUNT_SID',
  ];

  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    logger.error(
      `FATAL: Missing required environment variables: ${missing.join(', ')}`
    );
    process.exit(1);
  }

  const missingOptional = optionalEnvVars.filter((v) => !process.env[v]);
  if (missingOptional.length > 0) {
    logger.warn(
      `Optional environment variables not set: ${missingOptional.join(', ')}`
    );
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true, // Preserve raw body for webhook signature verification (e.g. HubSpot)
    bufferLogs: true, // Buffer logs until Pino logger is attached
  });

  // Replace default NestJS logger with Pino (INFRA-002)
  // All existing Logger usage (new Logger('Context')) will automatically route through Pino
  app.useLogger(app.get(PinoLogger));

  // Serve static files (uploads) in development
  if (process.env.NODE_ENV !== 'production') {
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads',
    });
  }

  // Cookie parser (SEC-001: needed for HttpOnly cookie auth)
  app.use(cookieParser());

  // Security headers (SEC-001)
  app.use(
    helmet({
      contentSecurityPolicy: false, // CSP handled by Next.js frontend
      crossOriginEmbedderPolicy: false, // Allow loading cross-origin resources
    })
  );

  // Enable CORS for frontend
  const corsOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3002'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // WebSocket adapter (Socket.io)
  app.useWebSocketAdapter(new IoAdapter(app));

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // SEC-007: Sanitize all string inputs (strip HTML, trim whitespace)
  app.useGlobalInterceptors(
    new SanitizeInputInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
    new SentryInterceptor()
  );

  // INFRA-004: Global Sentry exception filter (reports 5xx to Sentry, then delegates to default handler)
  const httpAdapter = app.getHttpAdapter();
  app.useGlobalFilters(new SentryExceptionFilter(httpAdapter));

  setupSwagger(app);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`API Server running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
