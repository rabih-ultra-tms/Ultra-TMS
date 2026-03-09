# PST-21: Integration Hub — Per-Service Tribunal Audit

> **Date:** 2026-03-09
> **Auditor:** Claude Opus 4.6
> **Hub file:** `dev_docs_v3/01-services/p2-extended/21-integration-hub.md`
> **Verdict:** MODIFY
> **Health Score:** 8.0/10 (was 2/10, delta +6.0 — **NEW LARGEST SCORE DELTA**)

---

## Phase 1: Endpoint Inventory

**Hub claims:** 7 controllers, ~45 endpoints
**Actual:** 7 controllers, 45 endpoints — **9th perfect total match**

| Controller | Hub Count | Actual Count | Missing from Hub |
|---|---|---|---|
| ProvidersController | 2 | 3 | `GET /categories` |
| IntegrationsController | 8 | 14 | `GET /health` (all), `GET /:id/health`, `PUT /:id/credentials`, `POST /:id/oauth/authorize`, `POST /:id/oauth/callback`, `GET /:id/stats`, `GET /:id/logs` (nested — also on ApiLogsController) |
| SyncJobsController | 4 | 6 | `POST /` (create), `GET /:id/progress`, `GET /:id/errors` |
| ApiLogsController | 3 | 2 | Phantom: `DELETE /` (purge) does not exist |
| TransformationsController | 6 | 6 | Path difference: test is `POST /test` not `POST /:id/test` |
| WebhookEndpointsController | 6 | 8 | `POST /:id/rotate-secret`, `GET /:id/deliveries`, `POST /:id/deliveries/:deliveryId/replay` |
| WebhookSubscriptionsController | 5 | 6 | `POST /:id/test` |
| **TOTAL** | **~45** | **45** | 11 undocumented, 1 phantom |

**Hub path accuracy:** ~75% — base routes correct, but 11 endpoints entirely missing from documentation.

**HTTP method mismatches:**
- Hub says `PATCH /:id` for integrations update — actual uses `PUT /:id`
- Hub says `PATCH /:id/status` — actual uses `POST /:id/status`
- Hub says `POST /:id/sync` on IntegrationsController — not found (sync is via SyncJobsController `POST /`)
- Hub says `DELETE /:id` on SyncJobsController — actual is `POST /:id/cancel`

---

## Phase 2: Data Model Verification

**Hub claims:** 7 models — Integration, SyncJob, DataTransformation, WebhookEndpoint, WebhookSubscription, APIRequestLog, CircuitBreakerStateRecord
**Actual:** 9 Prisma models

| Model (Hub) | Actual Model | Field Accuracy | Notes |
|---|---|---|---|
| Integration | Integration | ~85% | Misses `createdById`, `updatedById`, indexes |
| SyncJob | SyncJob | ~50% | Hub has phantom `recordsTotal`, wrong field types (`direction: String` → `SyncDirection` enum, `status: String` → `ExecutionStatus` enum), misses `jobType`, `schedule`, `lastSyncAt`, `lastError` |
| DataTransformation | **TransformationTemplate** | ~15% | **COMPLETELY WRONG MODEL NAME AND FIELDS**. Hub: sourceField/targetField/transformType/transformConfig/isActive. Actual: templateName/sourceFormat/targetFormat/transformationLogic/testCases |
| WebhookEndpoint | WebhookEndpoint | ~55% | Hub misses `name`, `description`, `events: String[]`. Hub has phantom `direction`, `isActive`, `lastTriggeredAt`. Actual uses `status: String` not boolean |
| WebhookSubscription | WebhookSubscription | ~70% | Hub says `endpointId` → actual `webhookEndpointId`. Hub says `filterConfig` → actual `filterConditions` |
| APIRequestLog | APIRequestLog | ~75% | Hub uses `url` → actual `endpoint`. Hub has phantom `responseHeaders`, `errorMessage`. Actual uses `timestamp` not `createdAt` |
| CircuitBreakerStateRecord | CircuitBreakerStateRecord | ~85% | Actual adds `halfOpenAttempts: Int` |
| *(not in hub)* | **IntegrationProviderConfig** | N/A | **ENTIRELY UNDOCUMENTED** — provider catalog model (providerName, category, authType, baseUrl, documentationUrl, logoUrl) |
| *(not in hub)* | **WebhookDelivery** | N/A | **ENTIRELY UNDOCUMENTED** — delivery tracking model (event, payload, requestHeaders, requestBody, responseStatus, status: WebhookStatus, attempts, lastAttempt, nextRetry) |

**Enum mismatches:**

| Enum | Hub Values | Actual Values |
|---|---|---|
| IntegrationCategory | TMS, ACCOUNTING, ELD, LOADBOARD, MAPPING, COMMUNICATION, PAYMENT (7) | LOAD_BOARD, ACCOUNTING, ELD, CRM, RATING, TMS, DOCUMENT, TRACKING (8) |
| SyncFrequency | REAL_TIME, EVERY_5_MIN, EVERY_15_MIN, HOURLY, DAILY, MANUAL (6) | REALTIME, HOURLY, DAILY, MANUAL (4) |
| AuthType | API_KEY, OAUTH2, BASIC, BEARER, CUSTOM (5) | API_KEY, OAUTH2, BASIC, NONE (4) |
| SyncDirection | INBOUND, OUTBOUND (2) | INBOUND, OUTBOUND, BIDIRECTIONAL (3) |

---

## Phase 3: Security Audit

| Controller | @UseGuards(JwtAuthGuard, RolesGuard) | @Roles | Audit Decorator |
|---|---|---|---|
| IntegrationProvidersController | YES (class) | YES (per-method: SUPER_ADMIN, ADMIN, SYSTEM_INTEGRATOR) | — |
| IntegrationsController | YES (class) | YES (class SUPER_ADMIN + per-method) | YES (getIntegration: WARNING, updateCredentials: CRITICAL) |
| SyncJobsController | YES (class) | YES (per-method: SUPER_ADMIN, ADMIN, SYSTEM_INTEGRATOR) | — |
| ApiLogsController | YES (class) | YES (per-method: SUPER_ADMIN, ADMIN, SYSTEM_INTEGRATOR) | — |
| TransformationsController | YES (class) | YES (per-method: SUPER_ADMIN, ADMIN, SYSTEM_INTEGRATOR) | — |
| WebhookEndpointsController | YES (class) | YES (class SUPER_ADMIN) | — |
| WebhookSubscriptionsController | YES (class) | YES (class SUPER_ADMIN) | — |

**Result: 7/7 controllers fully guarded — 100% coverage. Hub "Unknown" is FALSE.**

### Security Architecture (Excellent)

- **AES-256-GCM encryption** at rest for apiKey, apiSecret, oauthTokens (`EncryptionService`)
- **Credential masking** on all GET responses — secrets never returned in plaintext (`CredentialMaskerService`)
- **Webhook secret generation** via `crypto.randomBytes(24)` (48-char hex)
- **Secret rotation** endpoint with one-time display pattern
- **@Audit decorator** on credential operations with `sensitiveFields` list
- **Tenant isolation** 100% — all queries filter by `@CurrentTenant()`
- **Soft-delete** ~90% compliant (APIRequestLog is append-only, acceptable)

### Security Bugs Found

| Bug | Severity | Details |
|---|---|---|
| EncryptionService hardcoded fallback | P1 | If `ENCRYPTION_KEY` not set, falls back to `JWT_SECRET` → `PORTAL_JWT_SECRET` → `'local-dev-secret'`. Hardcoded key is predictable. Should fail-fast in production. |
| testConnection is a stub | P2 | Uses `Math.random() > 0.2` to determine success. No actual HTTP connectivity test. Misleading UX. |

---

## Phase 4: Test & Code Quality

**Hub claims:** "No tests" — **FALSE (14th false "no tests" claim)**

### Test Inventory

| Spec File | Tests | Coverage |
|---|---|---|
| `integrations.service.spec.ts` | 15 | CRUD, encryption, OAuth flow, health, stats, logs |
| `sync.service.spec.ts` | 15 | Jobs CRUD, cancel, progress, errors, transformations, test logic |
| `webhooks.service.spec.ts` | 10 | Endpoints CRUD, secret rotation, subscriptions, deliveries, replay |
| `encryption.service.spec.ts` | 3 | Encrypt/decrypt round-trip, malformed input handling |
| `credential-masker.service.spec.ts` | 3 | Sensitive key detection, passthrough, secret masking |
| **TOTAL** | **46 tests / 5 spec files / 826 LOC** | |

### Code Metrics

| Metric | Value |
|---|---|
| Active LOC | 3,272 |
| .bak LOC | 2,682 (safe to delete) |
| Controllers | 7 (3 files) |
| Services | 5 (IntegrationsService, SyncService, WebhooksService, EncryptionService, CredentialMaskerService) |
| DTO classes | 37 (4 files) |
| Module exports | None (not externally consumable) |

### Code Quality Notes

- Proper response DTO mapping via private `to*Dto()` methods
- Consistent pagination pattern across all list endpoints
- EncryptionService uses proper IV + AuthTag + ciphertext format
- CredentialMaskerService has recursive object traversal with configurable sensitive key list
- Webhook create returns secret once with clear "save now" hint
- SyncJob uses `customFields.filters` for job-specific filter storage (JSON column pattern)
- TransformationTemplate test endpoint is a pass-through stub (echoes input with metadata)

---

## Phase 5: Tribunal Summary

### Hub Accuracy Scorecard

| Section | Accuracy | Notes |
|---|---|---|
| Status Box (health, confidence) | 15% | 2/10 health indefensible, "Unknown" security false |
| Endpoint count | 100% | 45=45 (9th perfect match) |
| Endpoint paths | ~75% | 11 missing, 1 phantom, 4 HTTP method mismatches |
| Data model names | 71% | 5/7 correct, DataTransformation phantom, 2 models missing |
| Data model fields | ~55% | SyncJob ~50%, WebhookEndpoint ~55%, TransformationTemplate ~15% |
| Security assessment | 0% | "Unknown" vs 100% guard coverage + encryption |
| Test assessment | 0% | "None" vs 46 tests |
| Frontend assessment | 100% | "Not Built" correctly documented |
| Business rules | ~80% | Enum values differ significantly from Prisma |
| Known issues | ~50% | 4/7 issues are already resolved or false |

### Cross-Cutting Patterns (consistent with all 21 services)

1. **False "no tests" claim** — 14th instance. Systemic hub documentation pattern.
2. **Security "Unknown" when fully guarded** — 3rd P2 service. Hub never verified any P2 service.
3. **Missing models** — Hub consistently misses supporting/infrastructure models (ProviderConfig, Delivery).
4. **Enum drift** — Hub documents design-phase enums, not actual Prisma enum values.

---

## Action Items

| # | Action | Priority | Effort |
|---|---|---|---|
| 1 | Update hub health score to 8.0/10, security to "100% guards", tests to "46 / 5 files / 826 LOC" | P0 | 15min |
| 2 | Fix endpoint table: add 11 missing, remove 1 phantom, correct 4 HTTP methods | P1 | 30min |
| 3 | Rename DataTransformation → TransformationTemplate in data model section, fix all fields | P1 | 20min |
| 4 | Add IntegrationProviderConfig and WebhookDelivery models to Section 8 | P1 | 15min |
| 5 | Fix all enum values to match Prisma schema (IntegrationCategory, SyncFrequency, AuthType, SyncDirection) | P1 | 15min |
| 6 | Close "JWT/tenant guard coverage not verified" (verified 100%) | P0 | 5min |
| 7 | Close "Credential encryption not verified" (AES-256-GCM verified + tested) | P0 | 5min |
| 8 | Add bug: EncryptionService hardcoded fallback key (P1 security) | P0 | 5min |
| 9 | Add bug: testConnection() is Math.random stub (P2) | P1 | 5min |
| 10 | Delete `.bak` directory — 2,682 LOC, pre-refactor, no unique features (QS-009) | P2 | 5min |
| 11 | Add `exports` to IntegrationHubModule if cross-module consumption needed | P2 | 5min |
