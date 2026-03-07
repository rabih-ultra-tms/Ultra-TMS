# Integration Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Integration | Third-party integration configs | APIRequestLog, SyncJob, WebhookDelivery |
| IntegrationProviderConfig | Provider catalog | |
| APIRequestLog | API call logging | Integration |
| CircuitBreakerStateRecord | Circuit breaker state | Integration |
| SyncJob | Data sync job records | Integration |
| WebhookDelivery | Webhook delivery tracking | Integration |
| HubspotSyncLog | HubSpot-specific sync logs | |
| DistributedLock | Distributed locking | |

## Integration

Third-party integration configuration.

| Field | Type | Notes |
|-------|------|-------|
| name | String | VarChar(255) |
| description | String? | |
| category | IntegrationCategory enum | CRM, ACCOUNTING, MAPPING, CARRIER_DATA, PAYMENT |
| provider | String | VarChar(100) — HUBSPOT, QUICKBOOKS, GOOGLE_MAPS, DAT |
| authType | AuthType enum | API_KEY, OAUTH2, BASIC, NONE |
| apiKey/apiSecret | String? | Encrypted credentials |
| oauthTokens | Json? | |
| config | Json | @default("{}") |
| syncFrequency | SyncFrequency enum | REALTIME, HOURLY, DAILY, WEEKLY, MANUAL |
| lastSyncAt/nextSyncAt | DateTime? | |
| status | String | @default("ACTIVE") |

**Relations:** APIRequestLog[], CircuitBreakerStateRecord?, SyncJob[], WebhookDelivery[]

## APIRequestLog

Per-request logging for integration API calls.

| Field | Type | Notes |
|-------|------|-------|
| integrationId | String | FK to Integration |
| endpoint | String | VarChar(500) |
| method | String | VarChar(10) |
| requestHeaders | Json | |
| requestBody | Json? | |
| responseStatus | Int | |
| responseBody | Json? | |
| durationMs | Int | |
| timestamp | DateTime | |

## CircuitBreakerStateRecord

Circuit breaker pattern for fault tolerance.

| Field | Type | Notes |
|-------|------|-------|
| integrationId | String | @unique |
| state | CircuitState | @default(CLOSED) — CLOSED, OPEN, HALF_OPEN |
| failureCount | Int | @default(0) |
| lastFailureAt | DateTime? | |
| nextRetryAt | DateTime? | |
| halfOpenAttempts | Int | @default(0) |

## HubspotSyncLog

HubSpot CRM synchronization audit.

| Field | Type | Notes |
|-------|------|-------|
| entityType | String | VarChar(50) — COMPANY, CONTACT, DEAL |
| entityId | String | |
| hubspotId | String | VarChar(50) |
| syncDirection | String | VarChar(20) — PUSH, PULL |
| syncStatus | String | VarChar(20) — SUCCESS, FAILED |
| payloadSent/payloadReceived | Json? | |
| errorMessage | String? | |
