# Config Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| TenantConfig | Per-tenant configuration | Tenant |
| SystemConfig | Global system configuration | |
| FeatureFlag | Feature flag management | FeatureFlagOverride |
| FeatureFlagOverride | Per-tenant/user flag overrides | FeatureFlag, Tenant, User |
| NumberSequence | Auto-incrementing number generators | |
| ConfigHistory | Configuration change audit | Tenant |
| ConfigTemplate | Configuration templates | Tenant |
| CacheConfig | Cache key configuration | Tenant |
| CacheInvalidationRule | Cache invalidation rules | Tenant |
| CacheStats | Cache performance metrics | Tenant |

## TenantConfig

Per-tenant settings (business hours, defaults, preferences).

| Field | Type | Notes |
|-------|------|-------|
| tenantId | String | @index |
| configKey | String | VarChar(255) |
| configValue | Json | |
| description | String? | |
| category | String? | VarChar(100) |
| isEncrypted | Boolean | @default(false) |

**Unique:** `[tenantId, configKey]`

## SystemConfig

Global system-wide configuration.

| Field | Type | Notes |
|-------|------|-------|
| configKey | String | @unique, VarChar(255) |
| configValue | Json | |
| description | String? | |
| category | String? | VarChar(100) |
| isEncrypted | Boolean | @default(false) |
| isReadOnly | Boolean | @default(false) |

## FeatureFlag

Feature flag system with rollout support.

| Field | Type | Notes |
|-------|------|-------|
| key | String | @unique, VarChar(100) — FEATURE_LOAD_BOARD, etc. |
| name | String | VarChar(255) |
| description | String? | |
| status | FeatureFlagStatus | @default(ACTIVE) |
| enabled | Boolean | @default(false) |
| rolloutPercent | Int | @default(0) — 0-100 |
| tenantIds | String[] | Specific tenant allowlist |
| userIds | String[] | Specific user allowlist |

**Relations:** FeatureFlagOverride[]

## NumberSequence

Auto-incrementing number generators for business entities.

| Field | Type | Notes |
|-------|------|-------|
| entityType | String | VarChar(50) — ORDER, LOAD, INVOICE, etc. |
| prefix | String? | VarChar(10) — "ORD-", "LD-" |
| currentValue | Int | Current counter |
| incrementBy | Int | @default(1) |
| minValue | Int | |
| maxValue | Int | |
| format | String? | VarChar(50) — format pattern |

**Unique:** `[tenantId, entityType]`

## ConfigHistory

Tracks all configuration changes.

| Field | Type | Notes |
|-------|------|-------|
| configKey | String | VarChar(255) |
| oldValue | Json? | |
| newValue | Json | |
| changedBy | String? | |
| changeReason | String? | |
| changedAt | DateTime | @default(now()) |
