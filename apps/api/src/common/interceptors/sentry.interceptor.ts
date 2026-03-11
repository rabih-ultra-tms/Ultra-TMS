import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

/**
 * INFRA-004: Sentry performance & breadcrumb interceptor
 *
 * Adds Sentry breadcrumbs for every request and captures errors that
 * bubble through the interceptor chain. Also records basic transaction
 * timing when Sentry tracing is enabled.
 *
 * Zero-impact if @sentry/node is not installed.
 */
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  private readonly logger = new Logger('SentryInterceptor');
  private sentry: typeof import('@sentry/node') | null = null;

  constructor() {
    try {
      this.sentry = require('@sentry/node');
    } catch {
      // @sentry/node not installed — interceptor becomes a no-op
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.sentry || !this.sentry.isInitialized?.()) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const method = request?.method ?? 'UNKNOWN';
    const url = request?.url ?? 'unknown';
    const startTime = Date.now();

    // Add breadcrumb for the incoming request
    this.sentry.addBreadcrumb({
      category: 'http',
      message: `${method} ${url}`,
      level: 'info',
      data: {
        method,
        url,
        handler: `${context.getClass().name}.${context.getHandler().name}`,
      },
    });

    return next.handle().pipe(
      tap({
        error: (error) => {
          this.sentry?.captureException(error, {
            extra: {
              method,
              url,
              handler: `${context.getClass().name}.${context.getHandler().name}`,
              duration: Date.now() - startTime,
            },
          } as Parameters<typeof this.sentry.captureException>[1]);
        },
      })
    );
  }
}
