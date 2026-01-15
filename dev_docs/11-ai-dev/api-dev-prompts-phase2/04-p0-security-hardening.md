# Prompt 04: Security Hardening

**Priority:** P0 (Critical)  
**Estimated Time:** 3-4 hours  
**Dependencies:** None  

---

## Objective

Remove insecure JWT defaults, add health check endpoints, implement request logging middleware, and add correlation ID tracking for production observability. Currently, the JWT strategy falls back to a hardcoded 'default-secret' if the environment variable is missing.

---

## Critical Security Issues

| Issue | Severity | Location |
|-------|----------|----------|
| JWT secret fallback to 'default-secret' | **CRITICAL** | `jwt.strategy.ts` |
| Portal JWT secret fallbacks | **CRITICAL** | `customer-portal/`, `carrier-portal/` |
| No rate limiting middleware | **HIGH** | Missing |
| No health check endpoints | HIGH | Missing |
| No request logging | MEDIUM | Missing |
| No correlation ID tracking | MEDIUM | Missing |

---

## Files to Create

| File | Description |
|------|-------------|
| `apps/api/src/modules/health/health.module.ts` | Health check module |
| `apps/api/src/modules/health/health.controller.ts` | Health and readiness endpoints |
| `apps/api/src/common/middleware/correlation-id.middleware.ts` | Correlation ID tracking |
| `apps/api/src/common/middleware/request-logging.middleware.ts` | Request/response logging |
| `apps/api/src/common/guards/custom-throttler.guard.ts` | Custom rate limiting guard |

## Files to Modify

| File | Changes |
|------|---------|
| `apps/api/src/modules/auth/strategies/jwt.strategy.ts` | Remove secret fallback |
| `apps/api/src/modules/customer-portal/strategies/*.ts` | Remove secret fallback |
| `apps/api/src/modules/carrier-portal/strategies/*.ts` | Remove secret fallback |
| `apps/api/src/main.ts` | Add startup validation |
| `apps/api/src/app.module.ts` | Register middleware, health module, and ThrottlerModule |

---

## Implementation Steps

### Step 1: Remove JWT Secret Fallbacks (CRITICAL)

**File: `apps/api/src/modules/auth/strategies/jwt.strategy.ts`**

```typescript
// BEFORE (INSECURE)
constructor(private configService: ConfigService, private prisma: PrismaService) {
  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret', // DANGER!
  });
}

// AFTER (SECURE)
constructor(private configService: ConfigService, private prisma: PrismaService) {
  const jwtSecret = configService.get<string>('JWT_SECRET');
  
  if (!jwtSecret) {
    throw new Error('FATAL: JWT_SECRET environment variable is required');
  }

  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: jwtSecret,
  });
}
```

**Apply same pattern to portal strategies:**
- `apps/api/src/modules/customer-portal/strategies/portal-jwt.strategy.ts`
- `apps/api/src/modules/carrier-portal/strategies/carrier-jwt.strategy.ts`

Use environment variables: `CUSTOMER_PORTAL_JWT_SECRET`, `CARRIER_PORTAL_JWT_SECRET`

### Step 2: Add Startup Validation

**File: `apps/api/src/main.ts`**

Add at the beginning of the `bootstrap()` function:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Validate required environment variables
  const requiredEnvVars = [
    'JWT_SECRET',
    'DATABASE_URL',
    'REDIS_URL',
  ];

  const optionalEnvVars = [
    'CUSTOMER_PORTAL_JWT_SECRET',
    'CARRIER_PORTAL_JWT_SECRET',
    'SENDGRID_API_KEY',
    'TWILIO_ACCOUNT_SID',
  ];

  const missing = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    logger.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Warn about optional missing vars
  const missingOptional = optionalEnvVars.filter(v => !process.env[v]);
  if (missingOptional.length > 0) {
    logger.warn(`Optional environment variables not set: ${missingOptional.join(', ')}`);
  }

  const app = await NestFactory.create(AppModule);
  
  // ... rest of bootstrap
}
```

### Step 3: Create Health Module

**File: `apps/api/src/modules/health/health.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [HealthController],
  providers: [PrismaService],
})
export class HealthModule {}
```

**File: `apps/api/src/modules/health/health.controller.ts`**

```typescript
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks?: {
    database: 'connected' | 'disconnected';
    redis?: 'connected' | 'disconnected';
  };
}

@Controller()  // No prefix - accessible at /health, /ready
export class HealthController {
  constructor(private prisma: PrismaService) {}

  /**
   * Basic health check - returns immediately
   * Use for load balancer health checks
   */
  @Get('health')
  async health(): Promise<HealthStatus> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  /**
   * Readiness check - verifies dependencies
   * Use for Kubernetes readiness probes
   */
  @Get('ready')
  async ready(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = {
      database: 'disconnected',
    };

    let status: HealthStatus['status'] = 'ok';

    // Check database connectivity
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'connected';
    } catch (error) {
      checks.database = 'disconnected';
      status = 'unhealthy';
    }

    // Check Redis connectivity (if available)
    // try {
    //   await this.redis.ping();
    //   checks.redis = 'connected';
    // } catch {
    //   checks.redis = 'disconnected';
    //   status = status === 'ok' ? 'degraded' : status;
    // }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks,
    };
  }

  /**
   * Liveness check - basic process health
   * Use for Kubernetes liveness probes
   */
  @Get('live')
  async live(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
```

### Step 4: Create Correlation ID Middleware

**File: `apps/api/src/common/middleware/correlation-id.middleware.ts`**

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Use existing correlation ID from header or generate new one
    const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) || randomUUID();
    
    // Attach to request object for use in services
    req.correlationId = correlationId;
    req.headers[CORRELATION_ID_HEADER] = correlationId;
    
    // Add to response headers
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    
    next();
  }
}
```

### Step 5: Create Request Logging Middleware

**File: `apps/api/src/common/middleware/request-logging.middleware.ts`**

```typescript
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CORRELATION_ID_HEADER } from './correlation-id.middleware';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '-';
    const correlationId = req.headers[CORRELATION_ID_HEADER] || '-';
    const startTime = Date.now();

    // Log request
    this.logger.log(`[${correlationId}] --> ${method} ${originalUrl}`);

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;

      const logMessage = `[${correlationId}] <-- ${method} ${originalUrl} ${statusCode} ${duration}ms ${contentLength}b`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
```

### Step 6: Register Middleware and Health Module

**File: `apps/api/src/app.module.ts`**

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { HealthModule } from './modules/health/health.module';
// ... other imports

@Module({
  imports: [
    HealthModule, // Add health module
    // ... other modules
  ],
  // ...
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
```

### Step 7: Add Rate Limiting

First, install the throttler package:

```bash
cd apps/api
pnpm add @nestjs/throttler
```

**File: `apps/api/src/common/guards/custom-throttler.guard.ts`**

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    throw new ThrottlerException('Too many requests. Please try again later.');
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use IP address + user ID (if authenticated) for tracking
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userId = req.user?.id || 'anonymous';
    return `${ip}-${userId}`;
  }

  // Skip rate limiting for health check endpoints
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const skipPaths = ['/health', '/ready', '/live'];
    return skipPaths.includes(request.path);
  }
}
```

**Update: `apps/api/src/app.module.ts`**

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { HealthModule } from './modules/health/health.module';
// ... other imports

@Module({
  imports: [
    // Rate limiting - 100 requests per minute per IP
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,    // 1 second
        limit: 3,     // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000,   // 10 seconds
        limit: 20,    // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000,   // 1 minute
        limit: 100,   // 100 requests per minute
      },
    ]),
    HealthModule,
    // ... other modules
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    // ... other providers
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
```

**Stricter Rate Limiting for Login (5 attempts per minute):**

**File: `apps/api/src/modules/auth/auth.controller.ts`**

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  // Stricter rate limit for login - 5 attempts per minute
  @Post('login')
  @Throttle({ long: { limit: 5, ttl: 60000 } })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Stricter rate limit for registration
  @Post('register')
  @Throttle({ long: { limit: 3, ttl: 60000 } })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // Normal rate limits for other endpoints
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }
}
```

### Step 8: Update .env.example

**File: `apps/api/.env.example`**

Add documentation for required variables:

```env
# REQUIRED - Application will not start without these
JWT_SECRET=your-secure-jwt-secret-min-32-chars
DATABASE_URL=postgresql://user:password@localhost:5432/ultratms
REDIS_URL=redis://localhost:6379

# RATE LIMITING (optional - uses defaults if not set)
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# REQUIRED FOR PORTALS - Will fail if portal modules are used
CUSTOMER_PORTAL_JWT_SECRET=your-customer-portal-secret
CARRIER_PORTAL_JWT_SECRET=your-carrier-portal-secret

# OPTIONAL - Gracefully disabled if not set
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

---

## Verification

### Test Health Endpoints

```bash
# Start server
cd apps/api
pnpm start:dev

# Test health endpoint
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"...","uptime":123.456,"version":"1.0.0"}

# Test readiness endpoint
curl http://localhost:3001/ready
# Expected: {"status":"ok",...,"checks":{"database":"connected"}}

# Test liveness endpoint
curl http://localhost:3001/live
# Expected: {"status":"alive","timestamp":"..."}
```

### Test Correlation ID

```bash
# Request without correlation ID (should generate one)
curl -v http://localhost:3001/health
# Response should include: x-correlation-id: <uuid>

# Request with correlation ID (should preserve it)
curl -v -H "x-correlation-id: my-trace-123" http://localhost:3001/health
# Response should include: x-correlation-id: my-trace-123
```

### Test Startup Validation

```bash
# Remove JWT_SECRET and try to start
unset JWT_SECRET
pnpm start:dev
# Expected: FATAL: Missing required environment variables: JWT_SECRET
# Process should exit with code 1
```

### Test Rate Limiting

```bash
# Test rate limiting - send many requests rapidly
for i in {1..10}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/v1/users; done
# Expected: First several return 200, then 429 (Too Many Requests)

# Test login rate limiting (stricter - 5/minute)
for i in {1..8}; do 
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Expected: After 5 attempts, returns 429

# Check rate limit headers in response
curl -v http://localhost:3001/api/v1/users 2>&1 | grep -i "x-ratelimit"
# Expected: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset headers
```

---

## Acceptance Criteria

- [ ] Application fails to start if `JWT_SECRET` is missing
- [ ] Application fails to start if `DATABASE_URL` is missing
- [ ] No hardcoded secrets in codebase (`grep -r "default-secret" src/` returns nothing)
- [ ] `GET /health` returns 200 with uptime info
- [ ] `GET /ready` checks database connectivity
- [ ] `GET /live` returns basic liveness status
- [ ] All requests have correlation ID in response headers
- [ ] Request logs include: correlation ID, method, path, status, duration
- [ ] Portal JWT strategies require their respective secrets
- [ ] `.env.example` documents all required variables
- [ ] Rate limiting returns 429 after threshold exceeded
- [ ] Login endpoint has stricter rate limit (5 attempts/minute)
- [ ] General API endpoints limited to 100 requests/minute

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

Change prompt 04 row in the status table:
```markdown
| 04 | [Security Hardening](...) | P0 | 3-4h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Add Changelog Entry

```markdown
### [Date] - Prompt 04: Security Hardening
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Removed JWT_SECRET fallback (was 'default-secret')
- Added startup validation for required environment variables
- Created health module with /health, /ready, /live endpoints
- Added correlation ID middleware for request tracing
- Added request logging middleware
- Added rate limiting (100 req/min general, 5/min login)
- Portal JWT strategies now require explicit secrets
```

---

## Notes

- Health endpoints do NOT require authentication (they're for infrastructure)
- Correlation IDs should be passed through to all downstream services
- Request logging can be disabled in production if too verbose
- Rate limits can be adjusted via environment variables
