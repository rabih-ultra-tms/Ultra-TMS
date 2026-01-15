import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

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
      `FATAL: Missing required environment variables: ${missing.join(', ')}`,
    );
    process.exit(1);
  }

  const missingOptional = optionalEnvVars.filter((v) => !process.env[v]);
  if (missingOptional.length > 0) {
    logger.warn(
      `Optional environment variables not set: ${missingOptional.join(', ')}`,
    );
  }

  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  setupSwagger(app);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`API Server running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
