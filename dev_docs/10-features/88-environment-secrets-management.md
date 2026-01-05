# 83 - Environment & Secrets Management

**Configuration, secrets, and feature flags across environments**

---

## ⚠️ CLAUDE CODE: Environment Requirements

1. **NEVER commit secrets** - Use .env files (gitignored) or secret managers
2. **NEVER hardcode URLs** - All URLs from environment variables
3. **Validate env vars on startup** - Fail fast if missing
4. **Separate configs per environment** - dev, staging, production
5. **Use feature flags** - For gradual rollouts and kill switches

---

## Environment Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Environment Hierarchy                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  .env.example          → Checked into git (template)            │
│       ↓                                                         │
│  .env.local            → Local development (gitignored)         │
│       ↓                                                         │
│  .env.development      → Development defaults                    │
│  .env.staging          → Staging overrides                       │
│  .env.production       → Production (from secret manager)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
project-root/
├── .env.example           # Template with all vars (no values)
├── .env.local             # Local overrides (gitignored)
├── .env.development       # Dev defaults
├── .env.test              # Test environment
├── apps/
│   ├── api/
│   │   └── src/
│   │       └── config/
│   │           ├── configuration.ts      # Config module
│   │           ├── validation.ts         # Env validation schema
│   │           └── index.ts
│   └── web/
│       └── env.ts         # Next.js env validation
├── .gitignore             # Ignores .env.local, .env.*.local
└── docker-compose.yml     # Uses .env for local services
```

---

## Environment Variables

### .env.example (Template)

```bash
# ===========================================
# 3PL Platform Environment Configuration
# ===========================================
# Copy this file to .env.local and fill in values
# NEVER commit .env.local to git

# -----------------------------
# Application
# -----------------------------
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# -----------------------------
# Database
# -----------------------------
DATABASE_URL=postgresql://user:password@localhost:5432/freight_db?schema=public

# -----------------------------
# Authentication
# -----------------------------
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# -----------------------------
# Redis
# -----------------------------
REDIS_URL=redis://localhost:6379

# -----------------------------
# AWS / Storage
# -----------------------------
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=freight-platform-dev

# -----------------------------
# External APIs
# -----------------------------
FMCSA_API_KEY=
DAT_API_KEY=
DAT_API_SECRET=
TRUCKSTOP_API_KEY=

# -----------------------------
# Email (SendGrid/SES)
# -----------------------------
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@example.com

# -----------------------------
# Monitoring
# -----------------------------
SENTRY_DSN=
LOG_LEVEL=debug

# -----------------------------
# Feature Flags
# -----------------------------
FEATURE_NEW_DISPATCH_BOARD=false
FEATURE_CARRIER_PORTAL=true
FEATURE_DRIVER_APP=false
```

### Required vs Optional

```typescript
// apps/api/src/config/validation.ts

import { z } from 'zod';

// Required in ALL environments
const requiredEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url(),
});

// Required in production only
const productionEnvSchema = z.object({
  SENTRY_DSN: z.string().url(),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
});

// Optional with defaults
const optionalEnvSchema = z.object({
  API_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
  S3_BUCKET: z.string().default('freight-platform-dev'),
});

export function validateEnv() {
  const env = { ...process.env };

  // Validate required
  const required = requiredEnvSchema.safeParse(env);
  if (!required.success) {
    console.error('❌ Missing required environment variables:');
    console.error(required.error.format());
    process.exit(1);
  }

  // Validate production-only
  if (env.NODE_ENV === 'production') {
    const production = productionEnvSchema.safeParse(env);
    if (!production.success) {
      console.error('❌ Missing production environment variables:');
      console.error(production.error.format());
      process.exit(1);
    }
  }

  // Parse optional with defaults
  const optional = optionalEnvSchema.parse(env);

  return {
    ...required.data,
    ...optional,
  };
}
```

---

## NestJS Configuration Module

### Configuration Service

```typescript
// apps/api/src/config/configuration.ts

import { validateEnv } from './validation';

export default () => {
  const env = validateEnv();

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,

    api: {
      url: env.API_URL,
      frontendUrl: env.FRONTEND_URL,
    },

    database: {
      url: env.DATABASE_URL,
    },

    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },

    redis: {
      url: env.REDIS_URL,
    },

    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      s3Bucket: env.S3_BUCKET,
    },

    external: {
      fmcsa: {
        apiKey: process.env.FMCSA_API_KEY,
      },
      dat: {
        apiKey: process.env.DAT_API_KEY,
        apiSecret: process.env.DAT_API_SECRET,
      },
    },

    email: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.EMAIL_FROM || 'noreply@example.com',
    },

    monitoring: {
      sentryDsn: process.env.SENTRY_DSN,
      logLevel: env.LOG_LEVEL,
    },

    features: {
      newDispatchBoard: process.env.FEATURE_NEW_DISPATCH_BOARD === 'true',
      carrierPortal: process.env.FEATURE_CARRIER_PORTAL === 'true',
      driverApp: process.env.FEATURE_DRIVER_APP === 'true',
    },
  };
};
```

### Module Setup

```typescript
// apps/api/src/config/config.module.ts

import { Module, Global } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import configuration from './configuration';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', `.env.${process.env.NODE_ENV}`, '.env'],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
```

### Using Config in Services

```typescript
// Usage in any service
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SomeService {
  constructor(private config: ConfigService) {}

  someMethod() {
    // Type-safe access
    const jwtSecret = this.config.get<string>('jwt.secret');
    const s3Bucket = this.config.get<string>('aws.s3Bucket');

    // Feature flag check
    const newDispatchEnabled = this.config.get<boolean>(
      'features.newDispatchBoard'
    );

    if (newDispatchEnabled) {
      // New feature code
    }
  }
}
```

---

## Next.js Environment

### env.ts Validation

```typescript
// apps/web/env.ts

import { z } from 'zod';

const envSchema = z.object({
  // Public (exposed to browser)
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_WS_URL: z.string().url(),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(['development', 'staging', 'production']),

  // Server-only
  API_INTERNAL_URL: z.string().url().optional(),
});

// Validate at build time
export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  API_INTERNAL_URL: process.env.API_INTERNAL_URL,
});
```

### next.config.js

```javascript
// apps/web/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expose only NEXT_PUBLIC_ vars to browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  },

  // Runtime config (server-side)
  serverRuntimeConfig: {
    apiInternalUrl: process.env.API_INTERNAL_URL,
  },
};

module.exports = nextConfig;
```

---

## Feature Flags

### Feature Flag Service

```typescript
// apps/api/src/modules/config/feature-flag.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';

interface FeatureFlag {
  key: string;
  enabled: boolean;
  tenantIds?: string[]; // If set, only enabled for these tenants
  percentage?: number; // Gradual rollout percentage
}

@Injectable()
export class FeatureFlagService {
  private envFlags: Map<string, boolean>;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService
  ) {
    // Load env-based flags
    this.envFlags = new Map([
      ['newDispatchBoard', this.config.get('features.newDispatchBoard')],
      ['carrierPortal', this.config.get('features.carrierPortal')],
      ['driverApp', this.config.get('features.driverApp')],
    ]);
  }

  // Check if feature is enabled for tenant
  async isEnabled(key: string, tenantId?: string): Promise<boolean> {
    // 1. Check env override first
    if (this.envFlags.has(key)) {
      return this.envFlags.get(key)!;
    }

    // 2. Check database flags
    const flag = await this.prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!flag) {
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    // 3. Check tenant-specific
    if (flag.tenantIds && flag.tenantIds.length > 0) {
      if (!tenantId || !flag.tenantIds.includes(tenantId)) {
        return false;
      }
    }

    // 4. Check percentage rollout
    if (flag.percentage && flag.percentage < 100) {
      // Consistent hashing for same tenant
      const hash = this.hashString(tenantId || 'default');
      return hash % 100 < flag.percentage;
    }

    return true;
  }

  // Get all flags for tenant
  async getFlags(tenantId: string): Promise<Record<string, boolean>> {
    const dbFlags = await this.prisma.featureFlag.findMany();

    const result: Record<string, boolean> = {};

    // Add env flags
    for (const [key, value] of this.envFlags) {
      result[key] = value;
    }

    // Add/override with DB flags
    for (const flag of dbFlags) {
      result[flag.key] = await this.isEnabled(flag.key, tenantId);
    }

    return result;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
```

### Feature Flag Prisma Model

```prisma
model FeatureFlag {
  id          String   @id @default(cuid())
  key         String   @unique
  name        String
  description String?
  enabled     Boolean  @default(false)
  tenantIds   String[] // Empty = all tenants
  percentage  Int?     // Gradual rollout (0-100)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Using Feature Flags

```typescript
// In controller/service
@Injectable()
export class DispatchService {
  constructor(private featureFlags: FeatureFlagService) {}

  async getDispatchBoard(tenantId: string) {
    const useNewBoard = await this.featureFlags.isEnabled('newDispatchBoard', tenantId);

    if (useNewBoard) {
      return this.getNewDispatchBoard(tenantId);
    }

    return this.getLegacyDispatchBoard(tenantId);
  }
}

// In React component
function DispatchPage() {
  const { flags, loading } = useFeatureFlags();

  if (loading) return <Loading />;

  if (flags.newDispatchBoard) {
    return <NewDispatchBoard />;
  }

  return <LegacyDispatchBoard />;
}
```

---

## Secrets Management

### Local Development

```bash
# .env.local (gitignored)
DATABASE_URL=postgresql://user:localpassword@localhost:5432/freight_db
JWT_SECRET=local-development-secret-not-for-production
AWS_ACCESS_KEY_ID=local-dev-key
AWS_SECRET_ACCESS_KEY=local-dev-secret
```

### Production (AWS Secrets Manager)

```typescript
// apps/api/src/config/secrets.service.ts

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

export async function loadProductionSecrets() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

  const secretName =
    process.env.AWS_SECRET_NAME || 'freight-platform/production';

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);

    if (response.SecretString) {
      const secrets = JSON.parse(response.SecretString);

      // Inject into process.env
      Object.entries(secrets).forEach(([key, value]) => {
        process.env[key] = value as string;
      });

      console.log('✅ Production secrets loaded from AWS Secrets Manager');
    }
  } catch (error) {
    console.error('❌ Failed to load secrets:', error);
    throw error;
  }
}
```

### Docker Compose (Local Services)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: ${DB_USER:-freight}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-freight123}
      POSTGRES_DB: ${DB_NAME:-freight_db}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  # LocalStack for S3 development
  localstack:
    image: localstack/localstack
    ports:
      - '4566:4566'
    environment:
      SERVICES: s3
      DEFAULT_REGION: us-east-1
    volumes:
      - localstack_data:/var/lib/localstack

volumes:
  postgres_data:
  localstack_data:
```

---

## Environment-Specific Behavior

```typescript
// lib/env-utils.ts

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';
export const isStaging = process.env.NODE_ENV === 'staging';

// Conditional logging
export function debugLog(...args: any[]) {
  if (isDevelopment) {
    console.log('[DEBUG]', ...args);
  }
}

// Environment-specific URLs
export function getApiUrl(): string {
  if (isProduction) {
    return 'https://api.freightplatform.com';
  }
  if (isStaging) {
    return 'https://api.staging.freightplatform.com';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}
```

---

## Environment Checklist

### Before Deploying

- [ ] All required env vars set
- [ ] Secrets in secret manager (not env files)
- [ ] No hardcoded URLs or credentials
- [ ] .env.example up to date
- [ ] Feature flags configured for environment

### Security

- [ ] JWT_SECRET is 32+ chars and unique per environment
- [ ] Database credentials from secret manager
- [ ] API keys rotated regularly
- [ ] No secrets in git history
- [ ] .env\* in .gitignore

### Validation

- [ ] App fails fast on missing required vars
- [ ] Type-safe config access throughout
- [ ] Defaults only for non-sensitive values

---

## Cross-References

- **Error Handling (doc 76)**: Config errors on startup
- **Testing (doc 68)**: Test environment setup
- **Pre-Release Checklist (doc 71)**: Env var verification
- **Performance (doc 80)**: Redis configuration

---

## Navigation

- **Previous:** [Code Generation Templates](./82-code-generation-templates.md)
- **Index:** [Documentation Home](./59-documentation-index.md)
