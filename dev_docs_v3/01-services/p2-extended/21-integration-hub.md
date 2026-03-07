# Service Hub: Integration Hub (21)

> **Source of Truth** -- dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Integration Hub service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/20-integration-hub/` (10 files)
> **v2 hub (historical):** N/A

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Confidence** | Medium -- backend controllers exist but no frontend |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial -- 7 controllers, 45 endpoints in `apps/api/src/modules/integration-hub/` |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Tests** | None |
| **Active Blockers** | `.bak` directory needs resolution per QS-009; entire frontend must be built |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Integration Hub definition in dev_docs |
| Design Specs | Done | 10 files in `dev_docs/12-Rabih-design-Process/20-integration-hub/` |
| Backend -- Providers | Partial | `@Controller('integration-hub/providers')` -- integration providers catalog |
| Backend -- Integrations | Partial | `@Controller('integration-hub/integrations')` -- IntegrationsController |
| Backend -- Sync Jobs | Partial | `@Controller('integration-hub/sync-jobs')` -- SyncController |
| Backend -- API Logs | Partial | `@Controller('integration-hub/api-logs')` -- API request logs |
| Backend -- Transformations | Partial | `@Controller('integration-hub/transformations')` -- data transformation rules |
| Backend -- Webhook Endpoints | Partial | `@Controller('integration-hub/webhooks/endpoints')` -- WebhooksController |
| Backend -- Webhook Subscriptions | Partial | `@Controller('integration-hub/webhooks/subscriptions')` -- webhook subscriptions |
| Prisma Models | Done | Integration, SyncJob, DataTransformation, WebhookEndpoint, WebhookSubscription, APIRequestLog, CircuitBreakerStateRecord |
| Frontend Pages | Not Built | No routes exist |
| React Hooks | Not Built | No hooks exist |
| Components | Not Built | No components exist |
| Tests | None | No backend or frontend tests |
| Security | Unknown | Needs audit -- JWT/tenant guards not verified |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Integration Dashboard | `/settings/integrations` | Not Built | -- | Overview of all active integrations, health status |
| Available Integrations | `/settings/integrations/available` | Not Built | -- | Catalog of connectable providers |
| Integration Setup | `/settings/integrations/new` | Not Built | -- | Step-by-step integration configuration wizard |
| API Key Management | `/settings/integrations/api-keys` | Not Built | -- | Manage API keys for external services |
| Webhook Manager | `/settings/integrations/webhooks` | Not Built | -- | Inbound/outbound webhook endpoint management |
| Data Mapping | `/settings/integrations/[id]/mapping` | Not Built | -- | Field mapping between external and internal schemas |
| Sync Status | `/settings/integrations/[id]/sync` | Not Built | -- | Sync job history and status for an integration |
| Integration Logs | `/settings/integrations/[id]/logs` | Not Built | -- | API request/response log viewer |
| EDI Setup | `/settings/integrations/edi` | Not Built | -- | EDI document configuration (204, 210, 214, etc.) |
| Integration Reports | `/settings/integrations/reports` | Not Built | -- | Usage, error rates, sync success metrics |

---

## 4. API Endpoints

### Providers Controller -- `integration-hub/providers`
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/integration-hub/providers` | ProvidersController | Partial | List available integration providers |
| GET | `/api/v1/integration-hub/providers/:id` | ProvidersController | Partial | Provider detail (auth requirements, capabilities) |

### Integrations Controller -- `integration-hub/integrations`
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/integration-hub/integrations` | IntegrationsController | Partial | List configured integrations |
| POST | `/api/v1/integration-hub/integrations` | IntegrationsController | Partial | Create/configure new integration |
| GET | `/api/v1/integration-hub/integrations/:id` | IntegrationsController | Partial | Integration detail + status |
| PATCH | `/api/v1/integration-hub/integrations/:id` | IntegrationsController | Partial | Update integration config/credentials |
| DELETE | `/api/v1/integration-hub/integrations/:id` | IntegrationsController | Partial | Disable/remove integration |
| POST | `/api/v1/integration-hub/integrations/:id/test` | IntegrationsController | Partial | Test connection to external service |
| POST | `/api/v1/integration-hub/integrations/:id/sync` | IntegrationsController | Partial | Trigger manual sync |
| PATCH | `/api/v1/integration-hub/integrations/:id/status` | IntegrationsController | Partial | Enable/disable integration |

### Sync Jobs Controller -- `integration-hub/sync-jobs`
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/integration-hub/sync-jobs` | SyncController | Partial | List sync job history |
| GET | `/api/v1/integration-hub/sync-jobs/:id` | SyncController | Partial | Sync job detail (records processed, errors) |
| POST | `/api/v1/integration-hub/sync-jobs/:id/retry` | SyncController | Partial | Retry failed sync job |
| DELETE | `/api/v1/integration-hub/sync-jobs/:id` | SyncController | Partial | Cancel pending sync job |

### API Logs Controller -- `integration-hub/api-logs`
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/integration-hub/api-logs` | ApiLogsController | Partial | List API request logs (filterable) |
| GET | `/api/v1/integration-hub/api-logs/:id` | ApiLogsController | Partial | Log detail (full request/response body) |
| DELETE | `/api/v1/integration-hub/api-logs` | ApiLogsController | Partial | Purge old logs |

### Transformations Controller -- `integration-hub/transformations`
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/integration-hub/transformations` | TransformationsController | Partial | List data transformation rules |
| POST | `/api/v1/integration-hub/transformations` | TransformationsController | Partial | Create field mapping rule |
| GET | `/api/v1/integration-hub/transformations/:id` | TransformationsController | Partial | Transformation detail |
| PATCH | `/api/v1/integration-hub/transformations/:id` | TransformationsController | Partial | Update mapping rule |
| DELETE | `/api/v1/integration-hub/transformations/:id` | TransformationsController | Partial | Delete mapping rule |
| POST | `/api/v1/integration-hub/transformations/:id/test` | TransformationsController | Partial | Test transformation with sample data |

### Webhook Endpoints Controller -- `integration-hub/webhooks/endpoints`
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/integration-hub/webhooks/endpoints` | WebhooksController | Partial | List webhook endpoints |
| POST | `/api/v1/integration-hub/webhooks/endpoints` | WebhooksController | Partial | Create webhook endpoint |
| GET | `/api/v1/integration-hub/webhooks/endpoints/:id` | WebhooksController | Partial | Endpoint detail |
| PATCH | `/api/v1/integration-hub/webhooks/endpoints/:id` | WebhooksController | Partial | Update endpoint config |
| DELETE | `/api/v1/integration-hub/webhooks/endpoints/:id` | WebhooksController | Partial | Delete endpoint |
| POST | `/api/v1/integration-hub/webhooks/endpoints/:id/test` | WebhooksController | Partial | Send test webhook payload |

### Webhook Subscriptions Controller -- `integration-hub/webhooks/subscriptions`
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/integration-hub/webhooks/subscriptions` | SubscriptionsController | Partial | List webhook subscriptions |
| POST | `/api/v1/integration-hub/webhooks/subscriptions` | SubscriptionsController | Partial | Create subscription (event -> endpoint) |
| GET | `/api/v1/integration-hub/webhooks/subscriptions/:id` | SubscriptionsController | Partial | Subscription detail |
| PATCH | `/api/v1/integration-hub/webhooks/subscriptions/:id` | SubscriptionsController | Partial | Update subscription |
| DELETE | `/api/v1/integration-hub/webhooks/subscriptions/:id` | SubscriptionsController | Partial | Delete subscription |

**Total: 7 controllers, ~45 endpoints**

---

## 5. Components

No components built. Planned components for future frontend build:

| Component | Path (Planned) | Status |
|-----------|----------------|--------|
| IntegrationCard | `components/integration-hub/integration-card.tsx` | Not Built |
| IntegrationStatusBadge | `components/integration-hub/integration-status-badge.tsx` | Not Built |
| ProviderCatalogGrid | `components/integration-hub/provider-catalog-grid.tsx` | Not Built |
| IntegrationSetupWizard | `components/integration-hub/integration-setup-wizard.tsx` | Not Built |
| CredentialForm | `components/integration-hub/credential-form.tsx` | Not Built |
| SyncJobTimeline | `components/integration-hub/sync-job-timeline.tsx` | Not Built |
| ApiLogViewer | `components/integration-hub/api-log-viewer.tsx` | Not Built |
| DataMappingEditor | `components/integration-hub/data-mapping-editor.tsx` | Not Built |
| WebhookEndpointForm | `components/integration-hub/webhook-endpoint-form.tsx` | Not Built |
| CircuitBreakerIndicator | `components/integration-hub/circuit-breaker-indicator.tsx` | Not Built |

---

## 6. Hooks

No hooks built. Planned hooks for future frontend build:

| Hook | Endpoints Used | Status |
|------|---------------|--------|
| `useIntegrations` | GET `/integration-hub/integrations` | Not Built |
| `useIntegration` | GET `/integration-hub/integrations/:id` | Not Built |
| `useCreateIntegration` | POST `/integration-hub/integrations` | Not Built |
| `useUpdateIntegration` | PATCH `/integration-hub/integrations/:id` | Not Built |
| `useDeleteIntegration` | DELETE `/integration-hub/integrations/:id` | Not Built |
| `useTestIntegration` | POST `/integration-hub/integrations/:id/test` | Not Built |
| `useSyncJobs` | GET `/integration-hub/sync-jobs` | Not Built |
| `useTriggerSync` | POST `/integration-hub/integrations/:id/sync` | Not Built |
| `useApiLogs` | GET `/integration-hub/api-logs` | Not Built |
| `useProviders` | GET `/integration-hub/providers` | Not Built |
| `useWebhookEndpoints` | GET `/integration-hub/webhooks/endpoints` | Not Built |
| `useTransformations` | GET `/integration-hub/transformations` | Not Built |

---

## 7. Business Rules

1. **Integration Categories:** TMS, ACCOUNTING, ELD, LOADBOARD, MAPPING, COMMUNICATION, PAYMENT. Each category groups providers for organized display in the catalog.
2. **Auth Types:** API_KEY, OAUTH2, BASIC, BEARER, CUSTOM. The auth type determines which credential fields are required during integration setup. OAuth2 integrations require a full token exchange flow with refresh token management.
3. **Sync Frequencies:** REAL_TIME, EVERY_5_MIN, EVERY_15_MIN, HOURLY, DAILY, MANUAL. Each integration is configured with a sync frequency that determines how often data is pulled/pushed. REAL_TIME uses webhooks; all others use scheduled polling.
4. **Circuit Breaker:** Automatic disable after N consecutive failures, with configurable cooldown period. States: CLOSED (healthy), OPEN (tripped -- no calls allowed), HALF_OPEN (testing recovery). After cooldown, system sends a single test request; if it succeeds, circuit closes; if it fails, circuit re-opens.
5. **Data Transformations:** Configurable field mapping between external and internal schemas. Each transformation rule maps a source field path to a destination field path with optional value transformations (type casting, enum mapping, concatenation).
6. **Webhook Management:** Inbound webhooks receive data from external systems via signed endpoints. Outbound webhooks push events to configured URLs. All webhooks use HMAC-SHA256 signature verification. Failed deliveries retry 3 times with exponential backoff.
7. **API Logging:** All external API calls are logged with full request/response payloads for debugging. Logs include HTTP method, URL, headers (secrets masked), status code, response time, and error details. Logs are retained per tenant retention policy.
8. **Credential Security:** API keys, OAuth tokens, and secrets are encrypted at rest. Never returned in API responses in plaintext -- only masked display (e.g., `sk-****1234`). OAuth refresh tokens are rotated automatically before expiry.

---

## 8. Data Model

### Integration
```
Integration {
  id               String (UUID)
  tenantId         String (FK -> Tenant)
  name             String
  description      String?
  category         IntegrationCategory (TMS, ACCOUNTING, ELD, LOADBOARD, MAPPING, COMMUNICATION, PAYMENT)
  provider         String (VarChar 100)
  authType         AuthType (API_KEY, OAUTH2, BASIC, BEARER, CUSTOM)
  apiKey           String?
  apiSecret        String?
  oauthTokens      Json?
  config           Json
  syncFrequency    SyncFrequency (REAL_TIME, EVERY_5_MIN, EVERY_15_MIN, HOURLY, DAILY, MANUAL)
  lastSyncAt       DateTime?
  nextSyncAt       DateTime?
  status           String (default "ACTIVE")
  externalId       String?
  sourceSystem     String?
  customFields     Json?
  createdAt        DateTime
  updatedAt        DateTime
  deletedAt        DateTime?
  -- Relations
  apiRequestLogs   APIRequestLog[]
  circuitBreaker   CircuitBreakerStateRecord?
  webhookEndpoints WebhookEndpoint[]
}
```

### SyncJob
```
SyncJob {
  id              String (UUID)
  integrationId   String (FK -> Integration)
  tenantId        String
  direction       String (INBOUND, OUTBOUND)
  status          String (PENDING, RUNNING, COMPLETED, FAILED, CANCELLED)
  recordsTotal    Int?
  recordsProcessed Int?
  recordsFailed   Int?
  errorMessage    String?
  errorDetails    Json?
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime
  updatedAt       DateTime
}
```

### DataTransformation
```
DataTransformation {
  id              String (UUID)
  integrationId   String (FK -> Integration)
  tenantId        String
  name            String
  sourceField     String
  targetField     String
  transformType   String (DIRECT, ENUM_MAP, CONCAT, SPLIT, FORMAT, CUSTOM)
  transformConfig Json?
  isActive        Boolean (default true)
  createdAt       DateTime
  updatedAt       DateTime
}
```

### WebhookEndpoint
```
WebhookEndpoint {
  id              String (UUID)
  integrationId   String (FK -> Integration)
  tenantId        String
  url             String
  direction       String (INBOUND, OUTBOUND)
  secret          String
  isActive        Boolean (default true)
  lastTriggeredAt DateTime?
  createdAt       DateTime
  updatedAt       DateTime
  -- Relations
  subscriptions   WebhookSubscription[]
}
```

### WebhookSubscription
```
WebhookSubscription {
  id              String (UUID)
  endpointId      String (FK -> WebhookEndpoint)
  tenantId        String
  eventType       String
  filterConfig    Json?
  isActive        Boolean (default true)
  createdAt       DateTime
  updatedAt       DateTime
}
```

### APIRequestLog
```
APIRequestLog {
  id              String (UUID)
  integrationId   String (FK -> Integration)
  tenantId        String
  method          String (GET, POST, PUT, PATCH, DELETE)
  url             String
  requestHeaders  Json?
  requestBody     Json?
  responseStatus  Int?
  responseHeaders Json?
  responseBody    Json?
  durationMs      Int?
  errorMessage    String?
  createdAt       DateTime
}
```

### CircuitBreakerStateRecord
```
CircuitBreakerStateRecord {
  id                String (UUID)
  integrationId     String (FK -> Integration, unique)
  tenantId          String
  state             String (CLOSED, OPEN, HALF_OPEN)
  failureCount      Int (default 0)
  lastFailureAt     DateTime?
  nextRetryAt       DateTime?
  createdAt         DateTime
  updatedAt         DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `name` | Required, 1-200 chars | "Integration name is required" |
| `category` | IsEnum(IntegrationCategory) | "Invalid integration category" |
| `provider` | Required, max 100 chars | "Provider name is required" |
| `authType` | IsEnum(AuthType) | "Invalid authentication type" |
| `apiKey` | Required when authType = API_KEY | "API key is required for this auth type" |
| `oauthTokens` | Required when authType = OAUTH2 | "OAuth tokens are required for this auth type" |
| `syncFrequency` | IsEnum(SyncFrequency) | "Invalid sync frequency" |
| `config` | Valid JSON object | "Integration config must be valid JSON" |
| Webhook `url` | Valid URL, HTTPS required for production | "Webhook URL must be a valid HTTPS URL" |
| Webhook `secret` | Min 32 chars | "Webhook secret must be at least 32 characters" |
| Transformation `sourceField` | Required, valid field path | "Source field path is required" |
| Transformation `targetField` | Required, valid field path | "Target field path is required" |

---

## 10. Status States

### Integration Status Machine
```
INACTIVE -> ACTIVE (credentials configured + connection test passes)
ACTIVE -> INACTIVE (manual disable by admin)
ACTIVE -> SUSPENDED (circuit breaker tripped after N failures)
SUSPENDED -> ACTIVE (circuit breaker resets after cooldown + successful test)
ACTIVE -> DELETED (soft delete)
```

### Sync Job Status Machine
```
PENDING -> RUNNING (job picked up by scheduler)
RUNNING -> COMPLETED (all records processed successfully)
RUNNING -> FAILED (unrecoverable error during sync)
PENDING -> CANCELLED (manual cancel before execution)
FAILED -> PENDING (retry triggered)
```

### Circuit Breaker State Machine
```
CLOSED -> OPEN (failure count exceeds threshold)
OPEN -> HALF_OPEN (cooldown period elapsed)
HALF_OPEN -> CLOSED (test request succeeds)
HALF_OPEN -> OPEN (test request fails)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| `.bak` directory exists alongside active module | P1 Cleanup | `apps/api/src/modules/integration-hub.bak/` | Open -- QS-009 |
| No frontend exists at all | P2 Gap | -- | Open |
| No tests for any controller or service | P1 Quality | -- | Open |
| JWT/tenant guard coverage not verified | P1 Security | `apps/api/src/modules/integration-hub/` | Open |
| Credential encryption implementation not verified | P0 Security | -- | Open |
| Circuit breaker threshold/cooldown values not documented | P2 Config | -- | Open |
| API log retention/purge policy not implemented | P2 | -- | Open |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| INT-001 | Resolve integration-hub.bak directory | S (1h) | Open -- QS-009 |
| INT-002 | Audit JWT/tenant guards on all 45 endpoints | S (2h) | Open |
| INT-003 | Verify credential encryption at rest | S (2h) | Open |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| INT-101 | Build Integration Dashboard page | L (8h) | P2 |
| INT-102 | Build Available Integrations catalog page | M (5h) | P2 |
| INT-103 | Build Integration Setup wizard | L (8h) | P2 |
| INT-104 | Build API Key Management page | M (4h) | P2 |
| INT-105 | Build Webhook Manager page | M (5h) | P2 |
| INT-106 | Build Data Mapping editor page | L (8h) | P2 |
| INT-107 | Build Sync Status page | M (4h) | P2 |
| INT-108 | Build Integration Logs viewer page | M (4h) | P2 |
| INT-109 | Build EDI Setup page | L (8h) | P2 |
| INT-110 | Build Integration Reports page | M (5h) | P2 |
| INT-111 | Create React hooks for all 7 controllers | M (6h) | P2 |
| INT-112 | Write backend tests for integration controllers | L (8h) | P1 |
| INT-113 | Implement ELD integration (Samsara, KeepTruckin) | XL (16h) | P2 |
| INT-114 | Implement QuickBooks accounting sync | L (12h) | P2 |
| INT-115 | Implement DAT/Truckstop load board integration | XL (16h) | P2 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Integration Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/20-integration-hub/01-integration-dashboard.md` |
| Available Integrations | Full 15-section | `dev_docs/12-Rabih-design-Process/20-integration-hub/02-available-integrations.md` |
| Integration Setup | Full 15-section | `dev_docs/12-Rabih-design-Process/20-integration-hub/03-integration-setup.md` |
| API Key Management | Full 15-section | `dev_docs/12-Rabih-design-Process/20-integration-hub/04-api-key-management.md` |
| Webhook Manager | Full 15-section | `dev_docs/12-Rabih-design-Process/20-integration-hub/05-webhook-manager.md` |
| Data Mapping | Full 15-section | `dev_docs/12-Rabih-design-Process/20-integration-hub/06-data-mapping.md` |
| Sync Status | Full 15-section | `dev_docs/12-Rabih-design-Process/20-integration-hub/07-sync-status.md` |
| Integration Logs | Full 15-section | `dev_docs/12-Rabih-design-Process/20-integration-hub/08-integration-logs.md` |
| EDI Setup | Full 15-section | `dev_docs/12-Rabih-design-Process/20-integration-hub/09-edi-setup.md` |
| Integration Reports | Full 15-section | `dev_docs/12-Rabih-design-Process/20-integration-hub/10-integration-reports.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| 5 controllers estimated | 7 controllers with 45 endpoints | Backend exceeds plan |
| Basic integration CRUD | Full sub-module architecture (providers, sync, transformations, webhooks, logs) | Architecture ahead |
| Simple webhook support | Dedicated webhook endpoints + subscriptions controllers | More modular |
| Circuit breaker not planned | CircuitBreakerStateRecord model exists | Added resilience pattern |
| Data transformations not planned | Dedicated transformations controller + model | Added flexibility |
| Frontend planned for P2 | No frontend built at all | Behind -- 0/10 screens |
| Tests required | 0 tests | Behind -- no coverage |
| 10 design screens specified | 0 screens built | All 10 screens remain to be built |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT authentication, role-based access, tenantId scoping)
- All services that produce/consume external data (TMS Core, Accounting, Carriers, etc.)
- External APIs (Samsara, KeepTruckin, QuickBooks, DAT, Truckstop, Google Maps, etc.)
- Scheduler/Cron (sync job scheduling based on configured frequencies)

**Depended on by:**
- ELD integrations (driver hours of service, vehicle tracking)
- Accounting (QuickBooks/Sage sync for invoices, payments)
- Load Board (DAT/Truckstop load posting and matching)
- Mapping (Google Maps/HERE API for route planning, mileage)
- Communication (email/SMS provider integrations)
- All services requiring external data exchange
