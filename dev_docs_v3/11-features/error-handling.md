# Error Handling & Logging

> Source: `dev_docs/10-features/81-error-handling-logging-standards.md`
> Last updated: 2026-03-07

---

## Overview

Ultra TMS uses **structured JSON logging** with correlation IDs for request tracing. Errors are categorized by severity and never exposed raw to users.

---

## Core Rules

1. **NEVER swallow errors silently** — Always log or rethrow
2. **NEVER expose internal errors to users** — Sanitize all responses
3. **ALWAYS include correlation IDs** — For request tracing across services
4. **Use structured logging** — JSON format for searchability
5. **Log at appropriate levels** — ERROR for failures, WARN for issues, INFO for events

---

## Log Levels

| Level | When to Use | Examples |
|-------|-------------|----------|
| `ERROR` | System failures requiring attention | Database down, external API failure, unhandled exception |
| `WARN` | Issues that don't break functionality | Deprecated API usage, rate limit approaching, retry occurred |
| `INFO` | Significant business events | User login, load dispatched, payment received |
| `DEBUG` | Development troubleshooting | Request/response details, variable values |
| `VERBOSE` | Detailed tracing | Function entry/exit (rarely used in prod) |

---

## Backend: Custom Logger

```typescript
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;
  private defaultMeta: LogContext = {};

  setContext(context: string) { this.context = context; }
  setMeta(meta: LogContext) { this.defaultMeta = { ...this.defaultMeta, ...meta }; }

  private formatLog(level: string, message: string, meta?: LogContext) {
    return {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...this.defaultMeta,
      ...meta,
      environment: process.env.NODE_ENV,
      service: 'ultra-tms-api',
    };
  }

  log(message: string, meta?: LogContext) { console.log(JSON.stringify(this.formatLog('INFO', message, meta))); }
  error(message: string, trace?: string, meta?: LogContext) { console.error(JSON.stringify(this.formatLog('ERROR', message, { ...meta, trace }))); }
  warn(message: string, meta?: LogContext) { console.warn(JSON.stringify(this.formatLog('WARN', message, meta))); }
  debug(message: string, meta?: LogContext) { console.debug(JSON.stringify(this.formatLog('DEBUG', message, meta))); }
}
```

---

## Backend: Global Exception Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    // Log full error internally
    this.logger.error(message, {
      correlationId: request.headers['x-correlation-id'],
      path: request.url,
      method: request.method,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // Sanitized response to client
    response.status(status).json({
      error: message,
      code: this.getErrorCode(status),
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

## Backend: Correlation ID Middleware

```typescript
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] || uuidv4();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}
```

---

## Frontend: Error Boundary

```typescript
export class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    // Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## Frontend: API Error Handling

```typescript
// In React Query hooks
const { data, error } = useQuery({
  queryKey: queryKeys.loads.list(filters),
  queryFn: () => apiClient.get('/loads', { params: filters }),
});

// Global error handler in API client
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      toast.error('You do not have permission for this action');
    }
    if (error.response?.status >= 500) {
      toast.error('Something went wrong. Please try again.');
    }
    return Promise.reject(error);
  }
);
```

---

## Error Response Format

```typescript
// Standard error envelope
{
  error: string;        // Human-readable message
  code: string;         // Machine-readable code (e.g., "VALIDATION_ERROR")
  statusCode: number;   // HTTP status code
  timestamp: string;    // ISO timestamp
  path: string;         // Request path
  details?: object;     // Validation errors, field-level detail
}
```

---

## Monitoring Architecture

```
Application → Log Aggregator (CloudWatch/DataDog) → Dashboards
                                                   → Alerting (PagerDuty/Slack)
```

Alert thresholds:
- Error rate > 1% of requests → WARN
- Error rate > 5% of requests → CRITICAL
- p95 latency > 500ms → WARN
- Any 5xx in production → immediate alert
