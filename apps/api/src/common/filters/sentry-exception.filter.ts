import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

/**
 * INFRA-004: Sentry exception filter
 *
 * Extends the default NestJS exception filter to report unhandled exceptions
 * to Sentry when the SDK is installed and configured (SENTRY_DSN is set).
 *
 * Zero-impact if @sentry/node is not installed: the dynamic require is
 * wrapped in try/catch so the app works identically without Sentry.
 */
@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger('SentryExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    // Report to Sentry if available (non-HTTP or 5xx errors only)
    this.reportToSentry(exception);

    // Delegate to NestJS default exception handling
    super.catch(exception, host);
  }

  private reportToSentry(exception: unknown): void {
    // Skip 4xx client errors — only report unexpected / server errors
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status < HttpStatus.INTERNAL_SERVER_ERROR) {
        return;
      }
    }

    try {
      // Dynamic require so the app works without @sentry/node installed
      const Sentry = require('@sentry/node');
      if (Sentry.isInitialized?.()) {
        Sentry.captureException(exception);
      }
    } catch {
      // @sentry/node is not installed — silently skip
    }
  }
}
