import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * SEC-007: Global input sanitization interceptor.
 *
 * Strips HTML tags and trims whitespace from all string inputs in request body,
 * query, and params. This prevents stored XSS without requiring a heavy HTML
 * sanitizer library — the TMS has no legitimate use case for HTML in user input.
 */
@Injectable()
export class SanitizeInputInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    if (request.body && typeof request.body === 'object') {
      request.body = this.sanitize(request.body);
    }

    if (request.query && typeof request.query === 'object') {
      request.query = this.sanitize(request.query);
    }

    if (request.params && typeof request.params === 'object') {
      request.params = this.sanitize(request.params);
    }

    return next.handle();
  }

  private sanitize<T>(value: T): T {
    if (typeof value === 'string') {
      return this.sanitizeString(value) as T;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item)) as T;
    }

    if (
      value !== null &&
      typeof value === 'object' &&
      !(value instanceof Date)
    ) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = this.sanitize(val);
      }
      return sanitized as T;
    }

    return value;
  }

  private sanitizeString(input: string): string {
    // Strip HTML tags (no legitimate HTML in TMS string fields)
    const stripped = input.replace(/<[^>]*>/g, '');
    // Trim whitespace
    return stripped.trim();
  }
}
