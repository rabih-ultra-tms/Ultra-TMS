# 20 - Integration Hub Service

| Field            | Value                                              |
| ---------------- | -------------------------------------------------- |
| **Service ID**   | 20                                                 |
| **Service Name** | Integration Hub                                    |
| **Category**     | Platform                                           |
| **Module Path**  | `@modules/integration-hub`                         |
| **Phase**        | A (MVP)                                            |
| **Weeks**        | 39-42                                              |
| **Priority**     | P1                                                 |
| **Dependencies** | Auth, all services requiring external integrations |

---

## Purpose

Central integration platform managing all external API connections, webhooks, data transformations, and third-party service orchestration. Provides a unified interface for configuring, monitoring, and maintaining integrations with external systems including load boards, accounting software, ELD providers, and customer platforms.

---

## Features

- **API Gateway** - Centralized routing for all external API calls
- **Webhook Management** - Inbound/outbound webhook configuration and processing
- **Connector Library** - Pre-built connectors for common logistics platforms
- **Custom Integrations** - User-defined API integrations via configuration
- **Transformation Engine** - Data mapping and format conversion between systems
- **Rate Limiting** - Protect external APIs from overuse
- **Retry Logic** - Intelligent retry with exponential backoff
- **Circuit Breaker** - Automatic failover when services are unavailable
- **Request/Response Logging** - Full audit trail of all integration calls
- **Health Monitoring** - Real-time status of all connected services
- **OAuth Management** - Token refresh and credential storage
- **Batch Processing** - Bulk data sync for high-volume integrations

---

## Database Schema

```sql
-- Integration Providers (pre-built connectors)
CREATE TABLE integration_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code VARCHAR(50) NOT NULL UNIQUE,        -- DAT, TRUCKSTOP, QUICKBOOKS, etc.
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,           -- LOAD_BOARD, ACCOUNTING, ELD, CRM, RATING
    description TEXT,

    -- Configuration Schema
    config_schema JSONB NOT NULL,            -- JSON schema for required config fields
    auth_type VARCHAR(50) NOT NULL,          -- API_KEY, OAUTH2, BASIC, NONE
    oauth_config JSONB,                      -- OAuth URLs, scopes, etc.

    -- Endpoints
    base_url VARCHAR(500),
    api_version VARCHAR(20),
    documentation_url VARCHAR(500),

    -- Capabilities
    supports_webhooks BOOLEAN DEFAULT false,
    supports_batch BOOLEAN DEFAULT false,
    supports_realtime BOOLEAN DEFAULT false,

    -- Rate Limits
    rate_limit_requests INTEGER,             -- Max requests per window
    rate_limit_window INTEGER,               -- Window in seconds

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',     -- ACTIVE, DEPRECATED, COMING_SOON

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant Integration Instances
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    provider_id UUID NOT NULL REFERENCES integration_providers(id),

    -- Identity
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Configuration
    config JSONB NOT NULL,                   -- Provider-specific config (encrypted sensitive fields)
    environment VARCHAR(20) DEFAULT 'PRODUCTION', -- PRODUCTION, SANDBOX, TEST

    -- Authentication
    auth_type VARCHAR(50) NOT NULL,
    api_key_encrypted TEXT,                  -- Encrypted API key
    oauth_tokens JSONB,                      -- Encrypted access/refresh tokens
    oauth_expires_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',     -- ACTIVE, PAUSED, ERROR, PENDING_AUTH
    last_successful_call TIMESTAMPTZ,
    last_error TEXT,
    last_error_at TIMESTAMPTZ,
    error_count INTEGER DEFAULT 0,

    -- Settings
    is_enabled BOOLEAN DEFAULT true,
    retry_enabled BOOLEAN DEFAULT true,
    max_retries INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,

    -- Sync Settings
    sync_frequency VARCHAR(50),              -- REALTIME, HOURLY, DAILY, MANUAL
    last_sync_at TIMESTAMPTZ,
    next_sync_at TIMESTAMPTZ,

    -- Migration Support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, provider_id, environment)
);

CREATE INDEX idx_integrations_tenant ON integrations(tenant_id);
CREATE INDEX idx_integrations_provider ON integrations(provider_id);
CREATE INDEX idx_integrations_status ON integrations(tenant_id, status);

-- Webhook Endpoints (inbound)
CREATE TABLE webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    integration_id UUID REFERENCES integrations(id),

    -- Endpoint Configuration
    endpoint_path VARCHAR(200) NOT NULL,     -- /webhooks/{tenant}/{path}
    secret_key TEXT NOT NULL,                -- For signature verification

    -- Event Handling
    event_types JSONB NOT NULL DEFAULT '[]', -- Events this endpoint handles
    handler_type VARCHAR(50) NOT NULL,       -- LOAD_STATUS, TRACKING, INVOICE, CUSTOM

    -- Processing
    transform_template JSONB,                -- Data transformation rules
    target_service VARCHAR(50),              -- Internal service to route to

    -- Security
    ip_whitelist JSONB,                      -- Allowed source IPs
    signature_header VARCHAR(100),           -- Header containing signature
    signature_algorithm VARCHAR(50),         -- HMAC-SHA256, etc.

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',     -- ACTIVE, PAUSED, DISABLED
    is_enabled BOOLEAN DEFAULT true,

    -- Stats
    total_received INTEGER DEFAULT 0,
    total_processed INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    last_received_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, endpoint_path)
);

CREATE INDEX idx_webhooks_tenant ON webhook_endpoints(tenant_id);
CREATE INDEX idx_webhooks_integration ON webhook_endpoints(integration_id);

-- Webhook Subscriptions (outbound)
CREATE TABLE webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Subscription Details
    name VARCHAR(200) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,               -- Target URL

    -- Events
    event_types JSONB NOT NULL DEFAULT '[]', -- ORDER_CREATED, LOAD_DELIVERED, etc.

    -- Authentication
    auth_type VARCHAR(50) DEFAULT 'NONE',    -- NONE, BASIC, API_KEY, OAUTH2, HMAC
    auth_config JSONB,                       -- Auth-specific configuration
    secret_key TEXT,                         -- For HMAC signing

    -- Delivery Settings
    content_type VARCHAR(50) DEFAULT 'application/json',
    headers JSONB DEFAULT '{}',              -- Custom headers
    transform_template JSONB,                -- Payload transformation

    -- Retry Policy
    retry_enabled BOOLEAN DEFAULT true,
    max_retries INTEGER DEFAULT 5,
    retry_intervals JSONB DEFAULT '[60, 300, 900, 3600, 7200]', -- Seconds

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',     -- ACTIVE, PAUSED, FAILED
    is_enabled BOOLEAN DEFAULT true,

    -- Stats
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    consecutive_failures INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_webhook_subs_tenant ON webhook_subscriptions(tenant_id);
CREATE INDEX idx_webhook_subs_events ON webhook_subscriptions USING GIN(event_types);

-- Webhook Delivery Log
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id),

    -- Event Details
    event_type VARCHAR(100) NOT NULL,
    event_id UUID NOT NULL,                  -- Reference to source event
    payload JSONB NOT NULL,

    -- Delivery Attempt
    attempt_number INTEGER DEFAULT 1,

    -- Request
    request_url VARCHAR(500) NOT NULL,
    request_headers JSONB,
    request_body TEXT,

    -- Response
    response_status INTEGER,
    response_headers JSONB,
    response_body TEXT,
    response_time_ms INTEGER,

    -- Status
    status VARCHAR(20) NOT NULL,             -- PENDING, DELIVERED, FAILED, RETRYING
    error_message TEXT,
    next_retry_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_del_subscription ON webhook_deliveries(subscription_id);
CREATE INDEX idx_webhook_del_status ON webhook_deliveries(status, next_retry_at);
CREATE INDEX idx_webhook_del_created ON webhook_deliveries(created_at);

-- API Request Log
CREATE TABLE api_request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    integration_id UUID REFERENCES integrations(id),

    -- Request Details
    direction VARCHAR(10) NOT NULL,          -- INBOUND, OUTBOUND
    method VARCHAR(10) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    path VARCHAR(500),
    query_params JSONB,
    headers JSONB,
    body TEXT,
    body_size INTEGER,

    -- Response Details
    response_status INTEGER,
    response_headers JSONB,
    response_body TEXT,
    response_size INTEGER,
    response_time_ms INTEGER,

    -- Context
    correlation_id VARCHAR(100),             -- Track related requests
    user_id UUID REFERENCES users(id),
    source_ip VARCHAR(45),

    -- Result
    status VARCHAR(20) NOT NULL,             -- SUCCESS, CLIENT_ERROR, SERVER_ERROR, TIMEOUT
    error_message TEXT,
    retry_of UUID REFERENCES api_request_logs(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_logs_tenant ON api_request_logs(tenant_id, created_at DESC);
CREATE INDEX idx_api_logs_integration ON api_request_logs(integration_id, created_at DESC);
CREATE INDEX idx_api_logs_correlation ON api_request_logs(correlation_id);
CREATE INDEX idx_api_logs_status ON api_request_logs(status, created_at DESC);

-- Data Transformation Templates
CREATE TABLE transformation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),   -- NULL for system templates

    -- Identity
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Transformation
    source_format VARCHAR(50) NOT NULL,      -- JSON, XML, CSV, X12
    target_format VARCHAR(50) NOT NULL,
    mapping_rules JSONB NOT NULL,            -- Field mapping configuration
    validation_rules JSONB,                  -- Input validation

    -- Type
    is_system BOOLEAN DEFAULT false,         -- System vs tenant template
    category VARCHAR(50),                    -- LOAD, CARRIER, INVOICE, etc.

    -- Version Control
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transform_tenant ON transformation_templates(tenant_id);

-- Sync Jobs (batch processing)
CREATE TABLE sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    integration_id UUID NOT NULL REFERENCES integrations(id),

    -- Job Configuration
    job_type VARCHAR(50) NOT NULL,           -- FULL_SYNC, INCREMENTAL, EXPORT, IMPORT
    entity_type VARCHAR(50) NOT NULL,        -- LOADS, CARRIERS, INVOICES, etc.
    direction VARCHAR(10) NOT NULL,          -- INBOUND, OUTBOUND

    -- Filters
    filters JSONB,                           -- Date range, status, etc.

    -- Progress
    status VARCHAR(20) DEFAULT 'PENDING',    -- PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Results
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_details JSONB,                     -- Array of errors

    -- Scheduling
    scheduled_by VARCHAR(20),                -- MANUAL, SCHEDULED, TRIGGER
    scheduled_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_sync_jobs_tenant ON sync_jobs(tenant_id);
CREATE INDEX idx_sync_jobs_integration ON sync_jobs(integration_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status, scheduled_at);

-- Circuit Breaker State
CREATE TABLE circuit_breaker_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) UNIQUE,

    -- State
    state VARCHAR(20) DEFAULT 'CLOSED',      -- CLOSED, OPEN, HALF_OPEN
    failure_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,

    -- Thresholds
    failure_threshold INTEGER DEFAULT 5,
    success_threshold INTEGER DEFAULT 3,     -- Successes needed to close from half-open
    timeout_seconds INTEGER DEFAULT 60,      -- Time before moving to half-open

    -- Timing
    last_failure_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    half_open_at TIMESTAMPTZ,

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate Limit Tracking
CREATE TABLE rate_limit_buckets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id),

    -- Bucket Details
    bucket_key VARCHAR(200) NOT NULL,        -- Unique key for this limit
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,

    -- Counts
    request_count INTEGER DEFAULT 0,
    max_requests INTEGER NOT NULL,

    -- Status
    is_exceeded BOOLEAN DEFAULT false,

    UNIQUE(integration_id, bucket_key, window_start)
);

CREATE INDEX idx_rate_limit_integration ON rate_limit_buckets(integration_id, window_end);
```

---

## API Endpoints

### Integration Management

| Method | Endpoint                                 | Description              |
| ------ | ---------------------------------------- | ------------------------ |
| GET    | `/api/v1/integrations/providers`         | List available providers |
| GET    | `/api/v1/integrations/providers/:code`   | Get provider details     |
| GET    | `/api/v1/integrations`                   | List tenant integrations |
| POST   | `/api/v1/integrations`                   | Create integration       |
| GET    | `/api/v1/integrations/:id`               | Get integration details  |
| PUT    | `/api/v1/integrations/:id`               | Update integration       |
| DELETE | `/api/v1/integrations/:id`               | Delete integration       |
| POST   | `/api/v1/integrations/:id/test`          | Test connection          |
| POST   | `/api/v1/integrations/:id/enable`        | Enable integration       |
| POST   | `/api/v1/integrations/:id/disable`       | Disable integration      |
| POST   | `/api/v1/integrations/:id/refresh-oauth` | Refresh OAuth tokens     |
| GET    | `/api/v1/integrations/:id/health`        | Get health status        |
| GET    | `/api/v1/integrations/:id/stats`         | Get usage statistics     |

### Webhook Management

| Method | Endpoint                                        | Description                 |
| ------ | ----------------------------------------------- | --------------------------- |
| GET    | `/api/v1/webhooks/endpoints`                    | List inbound endpoints      |
| POST   | `/api/v1/webhooks/endpoints`                    | Create endpoint             |
| GET    | `/api/v1/webhooks/endpoints/:id`                | Get endpoint details        |
| PUT    | `/api/v1/webhooks/endpoints/:id`                | Update endpoint             |
| DELETE | `/api/v1/webhooks/endpoints/:id`                | Delete endpoint             |
| POST   | `/api/v1/webhooks/endpoints/:id/rotate-secret`  | Rotate secret key           |
| GET    | `/api/v1/webhooks/subscriptions`                | List outbound subscriptions |
| POST   | `/api/v1/webhooks/subscriptions`                | Create subscription         |
| GET    | `/api/v1/webhooks/subscriptions/:id`            | Get subscription details    |
| PUT    | `/api/v1/webhooks/subscriptions/:id`            | Update subscription         |
| DELETE | `/api/v1/webhooks/subscriptions/:id`            | Delete subscription         |
| POST   | `/api/v1/webhooks/subscriptions/:id/test`       | Send test webhook           |
| GET    | `/api/v1/webhooks/subscriptions/:id/deliveries` | Get delivery history        |
| POST   | `/api/v1/webhooks/subscriptions/:id/replay`     | Replay failed deliveries    |

### Inbound Webhook Processing

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| POST   | `/webhooks/:tenant/:path` | Receive webhook (public) |

### Data Transformation

| Method | Endpoint                           | Description            |
| ------ | ---------------------------------- | ---------------------- |
| GET    | `/api/v1/transformations`          | List templates         |
| POST   | `/api/v1/transformations`          | Create template        |
| GET    | `/api/v1/transformations/:id`      | Get template           |
| PUT    | `/api/v1/transformations/:id`      | Update template        |
| DELETE | `/api/v1/transformations/:id`      | Delete template        |
| POST   | `/api/v1/transformations/preview`  | Preview transformation |
| POST   | `/api/v1/transformations/validate` | Validate mapping       |

### Sync Jobs

| Method | Endpoint                         | Description        |
| ------ | -------------------------------- | ------------------ |
| GET    | `/api/v1/sync-jobs`              | List sync jobs     |
| POST   | `/api/v1/sync-jobs`              | Create sync job    |
| GET    | `/api/v1/sync-jobs/:id`          | Get job details    |
| POST   | `/api/v1/sync-jobs/:id/cancel`   | Cancel running job |
| GET    | `/api/v1/sync-jobs/:id/progress` | Get progress       |
| GET    | `/api/v1/sync-jobs/:id/errors`   | Get error details  |

### API Logs

| Method | Endpoint                        | Description       |
| ------ | ------------------------------- | ----------------- |
| GET    | `/api/v1/integrations/:id/logs` | Get API call logs |
| GET    | `/api/v1/api-logs/:logId`       | Get log details   |
| GET    | `/api/v1/api-logs/search`       | Search logs       |

---

## Events

### Published Events

| Event                      | Trigger                  | Payload                |
| -------------------------- | ------------------------ | ---------------------- |
| `integration.created`      | Integration configured   | Integration details    |
| `integration.updated`      | Configuration changed    | Updated fields         |
| `integration.deleted`      | Integration removed      | Integration ID         |
| `integration.connected`    | Successful connection    | Integration ID, status |
| `integration.disconnected` | Connection lost          | Integration ID, error  |
| `integration.error`        | API call failed          | Error details          |
| `webhook.received`         | Inbound webhook received | Endpoint, payload      |
| `webhook.delivered`        | Outbound webhook sent    | Subscription, status   |
| `webhook.failed`           | Delivery failed          | Subscription, error    |
| `sync.started`             | Sync job started         | Job details            |
| `sync.completed`           | Sync job finished        | Results                |
| `sync.failed`              | Sync job failed          | Error details          |
| `circuit.opened`           | Circuit breaker tripped  | Integration ID         |
| `circuit.closed`           | Circuit breaker reset    | Integration ID         |

### Subscribed Events

| Event                  | Action                    |
| ---------------------- | ------------------------- |
| `order.created`        | Trigger outbound webhooks |
| `order.status_changed` | Trigger webhooks, sync    |
| `load.delivered`       | Trigger webhooks          |
| `carrier.approved`     | Sync to external systems  |
| `invoice.generated`    | Trigger accounting sync   |
| `*`                    | Log for audit trail       |

---

## Business Rules

### Integration Management

1. **Connection Testing**: Test connection before activating integration
2. **Credential Storage**: All API keys and tokens encrypted at rest
3. **OAuth Refresh**: Auto-refresh tokens 5 minutes before expiry
4. **Environment Isolation**: Sandbox and production configs separate
5. **Deactivation**: Paused integrations retain config but stop processing

### Webhook Processing

1. **Signature Verification**: All inbound webhooks verified via signature
2. **Idempotency**: Duplicate webhook detection via event ID
3. **Timeout**: Webhook processing must complete within 30 seconds
4. **Response**: Return 200 immediately, process asynchronously
5. **Retry Policy**: Exponential backoff (1m, 5m, 15m, 1h, 2h)
6. **Max Retries**: 5 attempts before marking failed
7. **Auto-Disable**: Disable subscription after 10 consecutive failures

### Rate Limiting

1. **Respect Limits**: Honor external API rate limits
2. **Queue Excess**: Queue requests exceeding limits
3. **Priority**: High-priority requests bypass queue
4. **Tracking**: Track usage per integration per hour

### Circuit Breaker

1. **Failure Threshold**: Open circuit after 5 consecutive failures
2. **Timeout**: Wait 60 seconds before trying half-open
3. **Half-Open**: Allow 1 test request in half-open state
4. **Recovery**: 3 successes needed to close circuit
5. **Notification**: Alert on circuit state changes

### Data Sync

1. **Conflict Resolution**: Most recent timestamp wins
2. **Validation**: Validate all incoming data against schema
3. **Rollback**: Support rollback of failed batch imports
4. **Audit**: Log all sync operations for audit trail

---

## Pre-Built Connectors

### Load Boards

| Provider     | Features                         | Auth Type |
| ------------ | -------------------------------- | --------- |
| DAT          | Post loads, search trucks, rates | OAuth2    |
| Truckstop    | Post loads, search trucks        | API Key   |
| 123Loadboard | Basic posting                    | API Key   |

### Accounting

| Provider   | Features                       | Auth Type |
| ---------- | ------------------------------ | --------- |
| QuickBooks | AR/AP sync, invoices, payments | OAuth2    |
| Xero       | Invoices, payments, GL         | OAuth2    |
| Sage       | GL integration                 | API Key   |

### ELD/Telematics

| Provider    | Features                   | Auth Type |
| ----------- | -------------------------- | --------- |
| KeepTruckin | Location, HOS, DVIR        | OAuth2    |
| Samsara     | Location, HOS, diagnostics | API Key   |
| Omnitracs   | Location tracking          | API Key   |

### CRM

| Provider   | Features                   | Auth Type |
| ---------- | -------------------------- | --------- |
| HubSpot    | Contacts, companies, deals | OAuth2    |
| Salesforce | Full CRM sync              | OAuth2    |
| Zoho       | Contacts, leads            | OAuth2    |

---

## Screens

| Screen                   | Description                  |
| ------------------------ | ---------------------------- |
| Integration Marketplace  | Browse available connectors  |
| Integration List         | View configured integrations |
| Integration Setup Wizard | Configure new integration    |
| Integration Details      | Status, logs, settings       |
| Webhook Configuration    | Inbound/outbound setup       |
| Webhook Deliveries       | Delivery history and replay  |
| Transformation Builder   | Visual mapping editor        |
| Sync Job History         | View past sync operations    |
| API Logs                 | Request/response explorer    |
| Health Dashboard         | Integration health overview  |

---

## Configuration

### Environment Variables

```bash
# Encryption
INTEGRATION_ENCRYPTION_KEY=          # AES key for credentials

# Rate Limits
DEFAULT_RATE_LIMIT=100               # Requests per minute
RATE_LIMIT_WINDOW_SECONDS=60

# Timeouts
DEFAULT_TIMEOUT_SECONDS=30
WEBHOOK_TIMEOUT_SECONDS=30

# Retries
DEFAULT_MAX_RETRIES=3
WEBHOOK_MAX_RETRIES=5

# Circuit Breaker
CIRCUIT_FAILURE_THRESHOLD=5
CIRCUIT_TIMEOUT_SECONDS=60

# Logging
LOG_REQUEST_BODIES=true
LOG_RESPONSE_BODIES=true
LOG_RETENTION_DAYS=30

# Webhook Processing
WEBHOOK_QUEUE_SIZE=1000
WEBHOOK_WORKERS=4
```

### Default Settings

| Setting             | Default    |
| ------------------- | ---------- |
| Connection timeout  | 30 seconds |
| Request timeout     | 30 seconds |
| Max retries         | 3          |
| Webhook max retries | 5          |
| Log retention       | 30 days    |
| Rate limit window   | 60 seconds |

---

## Testing Checklist

### Unit Tests

- [ ] Credential encryption/decryption
- [ ] Webhook signature verification
- [ ] Rate limit calculation
- [ ] Circuit breaker state transitions
- [ ] Transformation rule application
- [ ] Retry logic with backoff

### Integration Tests

- [ ] OAuth flow completion
- [ ] Webhook endpoint registration
- [ ] Outbound webhook delivery
- [ ] API request logging
- [ ] Sync job execution
- [ ] Provider connectivity

### E2E Tests

- [ ] Full integration setup flow
- [ ] Webhook round-trip
- [ ] Batch sync processing
- [ ] Error handling and recovery
- [ ] Circuit breaker behavior

---

## Navigation

- **Previous:** [19 - Workflow](../19-workflow/README.md)
- **Next:** [21 - Search](../21-search/README.md)
- **Index:** [All Services](../README.md)
