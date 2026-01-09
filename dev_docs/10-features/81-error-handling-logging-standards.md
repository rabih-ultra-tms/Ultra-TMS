# 76 - Error Handling & Logging Standards

**Structured logging, error tracking, and debugging patterns for the 3PL Platform**

---

## âš ï¸ CLAUDE CODE: Error Handling Requirements

1. **NEVER swallow errors silently** - Always log or rethrow
2. **NEVER expose internal errors to users** - Sanitize all responses
3. **ALWAYS include correlation IDs** - For request tracing
4. **Use structured logging** - JSON format for searchability
5. **Log at appropriate levels** - ERROR for failures, WARN for issues, INFO for events

---

## Logging Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Application   â”‚â”€â”€â”€â”€â–ºâ”‚   Log Aggregator â”‚â”€â”€â”€â”€â–ºâ”‚   Monitoring    â”‚
â”‚   (NestJS)      â”‚     â”‚   (CloudWatch/   â”‚     â”‚   (Dashboards)  â”‚
â”‚                 â”‚     â”‚    DataDog)      â”‚     â”‚                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚                                                 â”‚
        â”‚ Structured                                      â”‚
        â”‚ JSON Logs                                       â–¼
        â”‚                                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚                                        â”‚   Alerting      â”‚
        â”‚                                        â”‚   (PagerDuty/   â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚    Slack)       â”‚
                                                 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Log Levels

| Level     | When to Use                           | Examples                                                     |
| --------- | ------------------------------------- | ------------------------------------------------------------ |
| `ERROR`   | System failures requiring attention   | Database down, external API failure, unhandled exception     |
| `WARN`    | Issues that don't break functionality | Deprecated API usage, rate limit approaching, retry occurred |
| `INFO`    | Significant business events           | User login, load dispatched, payment received                |
| `DEBUG`   | Development troubleshooting           | Request/response details, variable values                    |
| `VERBOSE` | Detailed tracing                      | Every function entry/exit (rarely used in prod)              |

---

## NestJS Logger Setup

### Custom Logger Service

```typescript
// apps/api/src/common/logger/logger.service.ts

import {
  Injectable,
  LoggerService as NestLoggerService,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LogContext {
  correlationId?: string;
  tenantId?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;
  private defaultMeta: LogContext = {};

  constructor(private config: ConfigService) {}

  setContext(context: string) {
    this.context = context;
  }

  setMeta(meta: LogContext) {
    this.defaultMeta = { ...this.defaultMeta, ...meta };
  }

  private formatLog(level: string, message: string, meta?: LogContext) {
    const timestamp = new Date().toISOString();
    const env = this.config.get('NODE_ENV');

    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...this.defaultMeta,
      ...meta,
      environment: env,
      service: 'freight-api',
    };

    // In production, output JSON
    if (env === 'production') {
      return JSON.stringify(logEntry);
    }

    // In development, pretty print
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()} [${this.context}] ${message}${metaStr}`;
  }

  log(message: string, meta?: LogContext) {
    console.log(this.formatLog('info', message, meta));
  }

  error(message: string, trace?: string, meta?: LogContext) {
    console.error(this.formatLog('error', message, { ...meta, trace }));
  }

  warn(message: string, meta?: LogContext) {
    console.warn(this.formatLog('warn', message, meta));
  }

  debug(message: string, meta?: LogContext) {
    if (this.config.get('LOG_LEVEL') === 'debug') {
      console.debug(this.formatLog('debug', message, meta));
    }
  }

  verbose(message: string, meta?: LogContext) {
    if (this.config.get('LOG_LEVEL') === 'verbose') {
      console.log(this.formatLog('verbose', message, meta));
    }
  }
}
```

### Request Context (Correlation ID)

```typescript
// apps/api/src/common/middleware/request-context.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const requestContext = new AsyncLocalStorage<Map<string, any>>();

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuid();
    const requestId = uuid();

    // Add to response headers
    res.setHeader('x-correlation-id', correlationId);
    res.setHeader('x-request-id', requestId);

    // Store in async context
    const store = new Map<string, any>();
    store.set('correlationId', correlationId);
    store.set('requestId', requestId);
    store.set('startTime', Date.now());

    requestContext.run(store, () => next());
  }
}

// Helper to get context values
export function getRequestContext() {
  const store = requestContext.getStore();
  return {
    correlationId: store?.get('correlationId'),
    requestId: store?.get('requestId'),
    startTime: store?.get('startTime'),
    tenantId: store?.get('tenantId'),
    userId: store?.get('userId'),
  };
}

export function setRequestContext(key: string, value: any) {
  const store = requestContext.getStore();
  store?.set(key, value);
}
```

### Request Logging Interceptor

```typescript
// apps/api/src/common/interceptors/logging.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';
import { getRequestContext } from '../middleware/request-context.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const ctx = getRequestContext();

    // Log request
    this.logger.log('Incoming request', {
      ...ctx,
      method,
      url,
      userId: user?.id,
      tenantId: user?.tenantId,
      // Don't log sensitive fields
      body: this.sanitizeBody(body),
    });

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - (ctx.startTime || Date.now());
        this.logger.log('Request completed', {
          ...ctx,
          method,
          url,
          duration,
          statusCode: context.switchToHttp().getResponse().statusCode,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - (ctx.startTime || Date.now());
        this.logger.error('Request failed', error.stack, {
          ...ctx,
          method,
          url,
          duration,
          errorCode: error.code || error.name,
          errorMessage: error.message,
        });
        throw error;
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'creditCard',
      'ssn',
    ];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
```

---

## Error Handling

### Custom Exception Classes

```typescript
// apps/api/src/common/exceptions/index.ts

import { HttpException, HttpStatus } from '@nestjs/common';

// Base application exception
export class AppException extends HttpException {
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>
  ) {
    super({ message, code, details }, status);
    this.code = code;
    this.details = details;
  }
}

// Business logic exceptions
export class BusinessException extends AppException {
  constructor(message: string, code: string, details?: Record<string, any>) {
    super(message, code, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}

// Not found
export class EntityNotFoundException extends AppException {
  constructor(entity: string, id?: string) {
    super(
      id ? `${entity} with ID ${id} not found` : `${entity} not found`,
      'ENTITY_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { entity, id }
    );
  }
}

// Duplicate entry
export class DuplicateEntityException extends AppException {
  constructor(entity: string, field: string, value: string) {
    super(
      `${entity} with ${field} '${value}' already exists`,
      'DUPLICATE_ENTITY',
      HttpStatus.CONFLICT,
      { entity, field, value }
    );
  }
}

// Validation exception
export class ValidationException extends AppException {
  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 'VALIDATION_ERROR', HttpStatus.BAD_REQUEST, {
      errors,
    });
  }
}

// External service exception
export class ExternalServiceException extends AppException {
  constructor(service: string, message: string, details?: Record<string, any>) {
    super(
      `External service error: ${service} - ${message}`,
      'EXTERNAL_SERVICE_ERROR',
      HttpStatus.BAD_GATEWAY,
      { service, ...details }
    );
  }
}

// Rate limit exception
export class RateLimitException extends AppException {
  constructor(retryAfter: number) {
    super(
      'Too many requests',
      'RATE_LIMIT_EXCEEDED',
      HttpStatus.TOO_MANY_REQUESTS,
      { retryAfter }
    );
  }
}
```

### Global Exception Filter

```typescript
// apps/api/src/common/filters/global-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoggerService } from '../logger/logger.service';
import { getRequestContext } from '../middleware/request-context.middleware';
import { AppException } from '../exceptions';

interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, any>;
  correlationId?: string;
  timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {
    this.logger.setContext('ExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestContext = getRequestContext();

    let status: number;
    let errorResponse: ErrorResponse;

    if (exception instanceof AppException) {
      // Our custom exceptions
      status = exception.getStatus();
      errorResponse = {
        error: exception.message,
        code: exception.code,
        details: exception.details,
        correlationId: requestContext.correlationId,
        timestamp: new Date().toISOString(),
      };

      this.logger.warn('Application exception', {
        ...requestContext,
        code: exception.code,
        message: exception.message,
        path: request.url,
      });
    } else if (exception instanceof HttpException) {
      // NestJS HTTP exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      errorResponse = {
        error:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || 'An error occurred',
        code: this.getCodeFromStatus(status),
        correlationId: requestContext.correlationId,
        timestamp: new Date().toISOString(),
      };

      this.logger.warn('HTTP exception', {
        ...requestContext,
        status,
        message: errorResponse.error,
        path: request.url,
      });
    } else {
      // Unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        correlationId: requestContext.correlationId,
        timestamp: new Date().toISOString(),
      };

      // Log full error for debugging
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
        {
          ...requestContext,
          path: request.url,
          method: request.method,
        }
      );
    }

    // Don't expose internal details in production
    if (process.env.NODE_ENV === 'production' && status >= 500) {
      delete errorResponse.details;
    }

    response.status(status).json(errorResponse);
  }

  private getCodeFromStatus(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }
}
```

---

## Frontend Error Handling

### API Error Handler

```typescript
// lib/api-error.ts

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, any>;
  public readonly correlationId?: string;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: Record<string, any>,
    correlationId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.correlationId = correlationId;
  }

  static fromResponse(data: any, status: number): ApiError {
    return new ApiError(
      data.error || 'An error occurred',
      data.code || 'UNKNOWN',
      status,
      data.details,
      data.correlationId
    );
  }

  get isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR';
  }

  get isNotFound(): boolean {
    return this.code === 'NOT_FOUND' || this.code === 'ENTITY_NOT_FOUND';
  }

  get isUnauthorized(): boolean {
    return this.code === 'UNAUTHORIZED';
  }

  get isForbidden(): boolean {
    return this.code === 'FORBIDDEN';
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}
```

### API Client with Error Handling

```typescript
// lib/api-client.ts

import { ApiError } from './api-error';

interface ApiClientOptions {
  baseUrl?: string;
  onUnauthorized?: () => void;
  onError?: (error: ApiError) => void;
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl || '/api/v1';

  async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const url = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        if (!response.ok) {
          throw new ApiError('An error occurred', 'UNKNOWN', response.status);
        }
        return response as unknown as T;
      }

      const data = await response.json();

      if (!response.ok) {
        const error = ApiError.fromResponse(data, response.status);

        // Handle 401 globally
        if (error.isUnauthorized) {
          options.onUnauthorized?.();
        }

        // Global error callback
        options.onError?.(error);

        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network error or other fetch error
      throw new ApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        0
      );
    }
  }

  return {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

    post: <T>(endpoint: string, body?: any) =>
      request<T>(endpoint, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      }),

    put: <T>(endpoint: string, body?: any) =>
      request<T>(endpoint, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      }),

    patch: <T>(endpoint: string, body?: any) =>
      request<T>(endpoint, {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      }),

    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
  };
}

// Global instance
export const api = createApiClient({
  onUnauthorized: () => {
    // Redirect to login
    window.location.href = '/login';
  },
  onError: (error) => {
    // Log to error tracking service
    console.error('API Error:', error.code, error.message, error.correlationId);
  },
});
```

### Error Boundary Component

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error tracking service
    console.error('React Error Boundary caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);

    // Send to error tracking (e.g., Sentry)
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          <Button onClick={this.handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-4 p-4 bg-muted rounded text-xs overflow-auto max-w-full">
              {this.state.error.message}
              {'\n'}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Toast Notifications for Errors

```typescript
// hooks/use-api-mutation.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-error';

interface UseApiMutationOptions<T, R> {
  mutationFn: (data: T) => Promise<R>;
  onSuccess?: (result: R) => void;
  onError?: (error: ApiError) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useApiMutation<T, R>(options: UseApiMutationOptions<T, R>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (data: T): Promise<R | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await options.mutationFn(data);

        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError = err instanceof ApiError
          ? err
          : new ApiError('An unexpected error occurred', 'UNKNOWN', 500);

        setError(apiError);

        // Show appropriate toast
        if (apiError.isValidationError) {
          toast.error('Please check your input', {
            description: Object.values(apiError.details?.errors || {}).flat().join(', '),
          });
        } else if (apiError.isServerError) {
          toast.error('Server error', {
            description: `Please try again later. (${apiError.correlationId})`,
          });
        } else {
          toast.error(options.errorMessage || apiError.message);
        }

        options.onError?.(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  return { mutate, loading, error };
}

// Usage
function CreateCarrierForm() {
  const { mutate, loading, error } = useApiMutation({
    mutationFn: (data: CreateCarrierDto) => api.post('/carriers', data),
    successMessage: 'Carrier created successfully',
    onSuccess: (carrier) => {
      router.push(`/carriers/${carrier.data.id}`);
    },
  });

  const handleSubmit = async (data: CreateCarrierDto) => {
    await mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Carrier'}
      </Button>
    </form>
  );
}
```

---

## Audit Logging

### Audit Log Model

```prisma
model AuditLog {
  id            String    @id @default(cuid())

  // What happened
  action        String    // CREATE, UPDATE, DELETE, VIEW, EXPORT
  entityType    String    // Carrier, Load, Invoice
  entityId      String

  // Before/after for updates
  previousData  Json?
  newData       Json?
  changes       Json?     // Diff of changes

  // Context
  ipAddress     String?
  userAgent     String?
  correlationId String?

  // Who/when
  userId        String
  tenantId      String
  createdAt     DateTime  @default(now())

  @@index([tenantId, entityType, entityId])
  @@index([tenantId, userId])
  @@index([tenantId, createdAt])
}
```

### Audit Service

```typescript
// apps/api/src/modules/audit/audit.service.ts

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';
    entityType: string;
    entityId: string;
    previousData?: any;
    newData?: any;
    userId: string;
    tenantId: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const changes =
      params.previousData && params.newData
        ? this.computeChanges(params.previousData, params.newData)
        : undefined;

    return this.prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        previousData: params.previousData,
        newData: params.newData,
        changes,
        userId: params.userId,
        tenantId: params.tenantId,
        correlationId: params.correlationId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }

  private computeChanges(
    previous: any,
    current: any
  ): Record<string, { from: any; to: any }> {
    const changes: Record<string, { from: any; to: any }> = {};

    for (const key of Object.keys(current)) {
      if (previous[key] !== current[key]) {
        changes[key] = { from: previous[key], to: current[key] };
      }
    }

    return changes;
  }
}
```

---

## Error Tracking Integration

### Sentry Setup (Optional)

```typescript
// apps/api/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],
});

// In exception filter
catch(exception: unknown, host: ArgumentsHost) {
  // ... existing code

  if (status >= 500) {
    Sentry.captureException(exception, {
      extra: {
        correlationId: requestContext.correlationId,
        path: request.url,
        method: request.method,
      },
    });
  }
}
```

---

## Logging Checklist

### Every Service Method

- [ ] Log entry point for significant operations
- [ ] Log error with full context on catch
- [ ] Include correlation ID in all logs
- [ ] Include tenant ID for multi-tenant operations
- [ ] Sanitize sensitive data before logging

### Every API Endpoint

- [ ] Request logged with method/path
- [ ] Response logged with status/duration
- [ ] Errors logged with stack trace
- [ ] Rate limits logged when exceeded

### Error Handling

- [ ] Custom exception classes for business errors
- [ ] Global exception filter handles all errors
- [ ] User-facing errors are sanitized
- [ ] Internal errors include correlation ID for support

---

## Cross-References

- **API Standards (doc 62)**: Error response format
- **Testing Strategy (doc 68)**: Test error scenarios
- **i18n Standards (doc 73)**: Translate error messages
- **Pre-Release Checklist (doc 71)**: Check error handling before deploy

---

## Navigation

- **Previous:** [File Upload & Storage Standards](./75-file-upload-storage-standards.md)
- **Next:** [Git Workflow & Code Review Standards](./77-git-workflow-standards.md)
