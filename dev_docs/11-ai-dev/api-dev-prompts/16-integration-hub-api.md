# 16 - Integration Hub Service API Implementation

> **Service:** Integration Hub  
> **Priority:** P1 - High  
> **Endpoints:** 40  
> **Dependencies:** Auth ✅, All services requiring external integrations  
> **Doc Reference:** [27-service-integration-hub.md](../../02-services/27-service-integration-hub.md)

---

## 📋 Overview

Central integration platform managing all external API connections, webhooks, data transformations, and third-party service orchestration. Provides unified interface for configuring, monitoring, and maintaining integrations with external systems.

### Key Capabilities
- API gateway for external calls
- Inbound/outbound webhook management
- Pre-built connector library
- Data transformation engine
- Rate limiting and circuit breaker
- OAuth token management
- Full request/response logging

---

## ✅ Pre-Implementation Checklist

- [ ] Auth service is working (credentials)
- [ ] Encryption keys configured
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### IntegrationProvider Model
```prisma
model IntegrationProvider {
  id                String            @id @default(cuid())
  
  code              String            @unique
  name              String
  category          ProviderCategory
  description       String?           @db.Text
  
  configSchema      Json
  authType          AuthType
  oauthConfig       Json?
  
  baseUrl           String?
  apiVersion        String?
  documentationUrl  String?
  
  supportsWebhooks  Boolean           @default(false)
  supportsBatch     Boolean           @default(false)
  supportsRealtime  Boolean           @default(false)
  
  rateLimitRequests Int?
  rateLimitWindow   Int?
  
  status            String            @default("ACTIVE")
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  integrations      Integration[]
}

enum ProviderCategory {
  LOAD_BOARD
  ACCOUNTING
  ELD
  CRM
  RATING
  TRACKING
  PAYMENT
  EDI
}

enum AuthType {
  API_KEY
  OAUTH2
  BASIC
  NONE
}
```

### Integration Model
```prisma
model Integration {
  id                String            @id @default(cuid())
  tenantId          String
  providerId        String
  
  name              String
  description       String?           @db.Text
  
  config            Json
  environment       IntegrationEnv    @default(PRODUCTION)
  
  authType          AuthType
  apiKeyEncrypted   String?           @db.Text
  oauthTokens       Json?
  oauthExpiresAt    DateTime?
  
  status            IntegrationStatus @default(ACTIVE)
  lastSuccessfulCall DateTime?
  lastError         String?           @db.Text
  lastErrorAt       DateTime?
  errorCount        Int               @default(0)
  
  isEnabled         Boolean           @default(true)
  retryEnabled      Boolean           @default(true)
  maxRetries        Int               @default(3)
  timeoutSeconds    Int               @default(30)
  
  syncFrequency     String?
  lastSyncAt        DateTime?
  nextSyncAt        DateTime?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  provider          IntegrationProvider @relation(fields: [providerId], references: [id])
  webhookEndpoints  WebhookEndpoint[]
  requestLogs       ApiRequestLog[]
  syncJobs          SyncJob[]
  
  @@unique([tenantId, providerId, environment])
  @@index([tenantId])
}

enum IntegrationEnv {
  PRODUCTION
  SANDBOX
  TEST
}

enum IntegrationStatus {
  ACTIVE
  PAUSED
  ERROR
  PENDING_AUTH
}
```

### WebhookEndpoint Model (Inbound)
```prisma
model WebhookEndpoint {
  id                String            @id @default(cuid())
  tenantId          String
  integrationId     String?
  
  endpointPath      String
  secretKey         String            @db.Text
  
  eventTypes        Json              @default("[]")
  handlerType       String
  
  transformTemplate Json?
  targetService     String?
  
  ipWhitelist       Json?
  signatureHeader   String?
  signatureAlgorithm String?
  
  status            String            @default("ACTIVE")
  isEnabled         Boolean           @default(true)
  
  totalReceived     Int               @default(0)
  totalProcessed    Int               @default(0)
  totalFailed       Int               @default(0)
  lastReceivedAt    DateTime?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  integration       Integration?      @relation(fields: [integrationId], references: [id])
  
  @@unique([tenantId, endpointPath])
  @@index([tenantId])
}
```

### WebhookSubscription Model (Outbound)
```prisma
model WebhookSubscription {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  description       String?           @db.Text
  url               String
  
  eventTypes        Json              @default("[]")
  
  authType          String            @default("NONE")
  authConfig        Json?
  secretKey         String?           @db.Text
  
  contentType       String            @default("application/json")
  headers           Json              @default("{}")
  transformTemplate Json?
  
  retryEnabled      Boolean           @default(true)
  maxRetries        Int               @default(5)
  retryIntervals    Json              @default("[60, 300, 900, 3600, 7200]")
  
  status            String            @default("ACTIVE")
  isEnabled         Boolean           @default(true)
  
  totalSent         Int               @default(0)
  totalDelivered    Int               @default(0)
  totalFailed       Int               @default(0)
  lastTriggeredAt   DateTime?
  lastSuccessAt     DateTime?
  lastFailureAt     DateTime?
  consecutiveFailures Int             @default(0)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  deliveries        WebhookDelivery[]
  
  @@index([tenantId])
}
```

### WebhookDelivery Model
```prisma
model WebhookDelivery {
  id                String            @id @default(cuid())
  subscriptionId    String
  
  eventType         String
  eventId           String
  payload           Json
  
  attemptNumber     Int               @default(1)
  
  requestUrl        String
  requestHeaders    Json?
  requestBody       String?           @db.Text
  
  responseStatus    Int?
  responseHeaders   Json?
  responseBody      String?           @db.Text
  responseTimeMs    Int?
  
  status            DeliveryStatus
  errorMessage      String?           @db.Text
  nextRetryAt       DateTime?
  
  createdAt         DateTime          @default(now())
  
  subscription      WebhookSubscription @relation(fields: [subscriptionId], references: [id])
  
  @@index([subscriptionId])
  @@index([status, nextRetryAt])
}

enum DeliveryStatus {
  PENDING
  DELIVERED
  FAILED
  RETRYING
}
```

### TransformationTemplate Model
```prisma
model TransformationTemplate {
  id                String            @id @default(cuid())
  tenantId          String?
  
  code              String
  name              String
  description       String?           @db.Text
  
  sourceFormat      String
  targetFormat      String
  mappingRules      Json
  validationRules   Json?
  
  isSystem          Boolean           @default(false)
  category          String?
  
  version           Int               @default(1)
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
}
```

### SyncJob Model
```prisma
model SyncJob {
  id                String            @id @default(cuid())
  tenantId          String
  integrationId     String
  
  jobType           SyncJobType
  entityType        String
  direction         SyncDirection
  
  filters           Json?
  
  status            SyncJobStatus     @default(PENDING)
  startedAt         DateTime?
  completedAt       DateTime?
  
  totalRecords      Int               @default(0)
  processedRecords  Int               @default(0)
  successRecords    Int               @default(0)
  failedRecords     Int               @default(0)
  
  errorLog          Json?
  
  createdAt         DateTime          @default(now())
  createdBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  integration       Integration       @relation(fields: [integrationId], references: [id])
  
  @@index([integrationId])
  @@index([status])
}

enum SyncJobType {
  FULL_SYNC
  INCREMENTAL
  EXPORT
  IMPORT
}

enum SyncDirection {
  INBOUND
  OUTBOUND
}

enum SyncJobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## 🛠️ API Endpoints

### Providers (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/integrations/providers` | List providers |
| GET | `/api/v1/integrations/providers/:id` | Get provider |
| GET | `/api/v1/integrations/providers/:id/schema` | Get config schema |
| GET | `/api/v1/integrations/providers/categories` | List categories |

### Integrations (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/integrations` | List integrations |
| POST | `/api/v1/integrations` | Create integration |
| GET | `/api/v1/integrations/:id` | Get integration |
| PUT | `/api/v1/integrations/:id` | Update integration |
| DELETE | `/api/v1/integrations/:id` | Delete integration |
| POST | `/api/v1/integrations/:id/test` | Test connection |
| PATCH | `/api/v1/integrations/:id/status` | Toggle status |
| POST | `/api/v1/integrations/:id/oauth/authorize` | Start OAuth |
| POST | `/api/v1/integrations/:id/oauth/callback` | OAuth callback |
| GET | `/api/v1/integrations/:id/health` | Health status |

### Webhook Endpoints - Inbound (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/webhooks/endpoints` | List endpoints |
| POST | `/api/v1/webhooks/endpoints` | Create endpoint |
| GET | `/api/v1/webhooks/endpoints/:id` | Get endpoint |
| PUT | `/api/v1/webhooks/endpoints/:id` | Update endpoint |
| DELETE | `/api/v1/webhooks/endpoints/:id` | Delete endpoint |
| POST | `/api/v1/webhooks/endpoints/:id/rotate-secret` | Rotate secret |

### Webhook Subscriptions - Outbound (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/webhooks/subscriptions` | List subscriptions |
| POST | `/api/v1/webhooks/subscriptions` | Create subscription |
| GET | `/api/v1/webhooks/subscriptions/:id` | Get subscription |
| PUT | `/api/v1/webhooks/subscriptions/:id` | Update subscription |
| DELETE | `/api/v1/webhooks/subscriptions/:id` | Delete subscription |
| GET | `/api/v1/webhooks/subscriptions/:id/deliveries` | List deliveries |
| POST | `/api/v1/webhooks/subscriptions/:id/test` | Send test |

### Transformations (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/integrations/transformations` | List templates |
| POST | `/api/v1/integrations/transformations` | Create template |
| GET | `/api/v1/integrations/transformations/:id` | Get template |
| PUT | `/api/v1/integrations/transformations/:id` | Update template |
| POST | `/api/v1/integrations/transformations/test` | Test transform |

### Sync Jobs (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/integrations/:id/sync-jobs` | List jobs |
| POST | `/api/v1/integrations/:id/sync` | Start sync |
| GET | `/api/v1/sync-jobs/:id` | Get job status |
| POST | `/api/v1/sync-jobs/:id/cancel` | Cancel job |
| GET | `/api/v1/sync-jobs/:id/logs` | Get job logs |

### Logs & Monitoring (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/integrations/:id/logs` | Request logs |
| GET | `/api/v1/integrations/health` | All health |
| GET | `/api/v1/integrations/stats` | Usage stats |

---

## 📝 DTO Specifications

### CreateIntegrationDto
```typescript
export class CreateIntegrationDto {
  @IsString()
  providerId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  config: Record<string, any>;

  @IsOptional()
  @IsEnum(IntegrationEnv)
  environment?: IntegrationEnv;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsInt()
  timeoutSeconds?: number;

  @IsOptional()
  @IsString()
  syncFrequency?: string;
}
```

### CreateWebhookEndpointDto
```typescript
export class CreateWebhookEndpointDto {
  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsString()
  endpointPath: string;

  @IsArray()
  @IsString({ each: true })
  eventTypes: string[];

  @IsString()
  handlerType: string;

  @IsOptional()
  @IsObject()
  transformTemplate?: Record<string, any>;

  @IsOptional()
  @IsString()
  targetService?: string;

  @IsOptional()
  @IsArray()
  ipWhitelist?: string[];

  @IsOptional()
  @IsString()
  signatureHeader?: string;

  @IsOptional()
  @IsString()
  signatureAlgorithm?: string;
}
```

### CreateWebhookSubscriptionDto
```typescript
export class CreateWebhookSubscriptionDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsArray()
  @IsString({ each: true })
  eventTypes: string[];

  @IsOptional()
  @IsString()
  authType?: string;

  @IsOptional()
  @IsObject()
  authConfig?: Record<string, any>;

  @IsOptional()
  @IsString()
  secretKey?: string;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @IsOptional()
  @IsInt()
  maxRetries?: number;
}
```

### StartSyncDto
```typescript
export class StartSyncDto {
  @IsEnum(SyncJobType)
  jobType: SyncJobType;

  @IsString()
  entityType: string;

  @IsEnum(SyncDirection)
  direction: SyncDirection;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
```

---

## 📋 Business Rules

### Circuit Breaker
```typescript
const circuitBreakerConfig = {
  failureThreshold: 5,    // Open after 5 failures
  successThreshold: 3,    // Close after 3 successes
  timeout: 30000          // 30 second timeout in open state
};
```

### Retry Logic
```typescript
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000,        // 1 second
  maxDelay: 30000,        // 30 seconds
  backoffMultiplier: 2,   // Exponential backoff
  retryableErrors: [408, 429, 500, 502, 503, 504]
};
```

### Rate Limiting
```typescript
function checkRateLimit(integration: Integration): boolean {
  const provider = integration.provider;
  if (!provider.rateLimitRequests) return true;
  
  const windowStart = Date.now() - (provider.rateLimitWindow * 1000);
  const recentCalls = getCallsSince(integration.id, windowStart);
  
  return recentCalls < provider.rateLimitRequests;
}
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `integration.created` | New integration | `{ integrationId }` |
| `integration.connected` | Successful auth | `{ integrationId }` |
| `integration.error` | Connection fail | `{ integrationId, error }` |
| `webhook.received` | Inbound webhook | `{ endpointId, data }` |
| `webhook.delivered` | Outbound success | `{ subscriptionId, deliveryId }` |
| `webhook.failed` | Outbound fail | `{ subscriptionId, error }` |
| `sync.started` | Job started | `{ jobId }` |
| `sync.completed` | Job done | `{ jobId, stats }` |
| `sync.failed` | Job failed | `{ jobId, error }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `*` | All Services | Match to webhook subs |
| `scheduler.hourly` | Scheduler | Process sync jobs |

---

## 🧪 Integration Test Requirements

```typescript
describe('Integration Hub API', () => {
  describe('Integrations', () => {
    it('should create integration');
    it('should test connection');
    it('should handle OAuth flow');
    it('should detect connection errors');
  });

  describe('Webhook Endpoints', () => {
    it('should create endpoint');
    it('should receive webhook');
    it('should verify signature');
    it('should transform payload');
  });

  describe('Webhook Subscriptions', () => {
    it('should create subscription');
    it('should send on event');
    it('should retry on failure');
    it('should track deliveries');
  });

  describe('Sync Jobs', () => {
    it('should start sync job');
    it('should track progress');
    it('should handle errors');
    it('should cancel job');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/integration-hub/
├── integration-hub.module.ts
├── providers/
│   ├── providers.controller.ts
│   └── providers.service.ts
├── integrations/
│   ├── integrations.controller.ts
│   ├── integrations.service.ts
│   ├── oauth.service.ts
│   └── dto/
├── webhooks/
│   ├── inbound/
│   │   ├── endpoints.controller.ts
│   │   ├── endpoints.service.ts
│   │   └── webhook-receiver.controller.ts
│   └── outbound/
│       ├── subscriptions.controller.ts
│       ├── subscriptions.service.ts
│       └── delivery.service.ts
├── transformations/
│   ├── transformations.controller.ts
│   └── transform-engine.service.ts
├── sync/
│   ├── sync.controller.ts
│   ├── sync.service.ts
│   └── sync-processor.service.ts
└── common/
    ├── circuit-breaker.ts
    ├── rate-limiter.ts
    └── retry.service.ts
```

---

## ✅ Completion Checklist

- [ ] All 40 endpoints implemented
- [ ] Provider registry seeded
- [ ] Integration CRUD with encryption
- [ ] OAuth flow working
- [ ] Inbound webhook handling
- [ ] Outbound webhook delivery
- [ ] Circuit breaker logic
- [ ] Rate limiting
- [ ] Transformation engine
- [ ] Sync job processing
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>29</td>
    <td>Integration Hub</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>40/40</td>
    <td>7/7</td>
    <td>100%</td>
    <td>Providers, Integrations, Endpoints, Subscriptions, Transforms, Sync, Logs</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[17-search-api.md](./17-search-api.md)** - Implement Search Service API
