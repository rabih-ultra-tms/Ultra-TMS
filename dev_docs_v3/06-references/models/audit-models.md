# Audit Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| AuditLog | Primary audit trail | Tenant |
| ChangeHistory | Field-level change tracking | Tenant |
| APIAuditLog | API request auditing | Tenant, User |
| AccessLog | Resource access tracking | Tenant, User |
| AuditAlert | Audit-triggered alerts | AuditAlertIncident |
| AuditAlertIncident | Alert occurrences | AuditAlert |
| AuditRetentionPolicy | Data retention rules | Tenant |

## AuditLog

Primary audit trail for all system actions.

| Field | Type | Notes |
|-------|------|-------|
| userId | String? | FK to User (null for system actions) |
| action | AuditAction enum | CREATE, UPDATE, DELETE, LOGIN, etc. |
| category | AuditActionCategory enum | AUTH, DATA, ADMIN, SYSTEM |
| severity | AuditSeverity | @default(INFO) — INFO, WARNING, ERROR, CRITICAL |
| entityType | String? | VarChar(50) |
| entityId | String? | |
| description | String? | Human-readable |
| metadata | Json | @default("{}") — additional context |
| ipAddress | String? | VarChar(45) |
| userAgent | String? | |

**Indexes:** `[action]`, `[category]`, `[severity]`, `[entityType, entityId]`, `[tenantId, action]`, `[tenantId, userId]`, `[tenantId, createdAt]`

## ChangeHistory

Field-level change tracking for data entities.

| Field | Type | Notes |
|-------|------|-------|
| userId | String? | Who changed |
| entityType | String | VarChar(50) |
| entityId | String | |
| field | String | VarChar(100) — field name |
| oldValue | String? | Previous value |
| newValue | String? | New value |

**Indexes:** `[entityType, entityId]`, `[field]`, `[createdAt]`, `[userId]`

## APIAuditLog

HTTP API request/response auditing.

| Field | Type | Notes |
|-------|------|-------|
| userId | String? | |
| apiKeyId | String? | For API key auth |
| endpoint | String | VarChar(500) |
| method | String | VarChar(10) — GET, POST, etc. |
| requestParams | Json? | |
| responseStatus | Int | HTTP status code |
| responseTimeMs | Int | Latency |
| ipAddress | String? | |
| timestamp | DateTime | @default(now()) |

## AccessLog

Resource access control audit.

| Field | Type | Notes |
|-------|------|-------|
| userId | String? | |
| resourceType | String | VarChar(50) |
| resourceId | String | VarChar(255) |
| action | String | VarChar(100) |
| granted | Boolean | Access allowed/denied |
| denialReason | String? | |
| ipAddress | String? | |
| userAgent | String? | |

## AuditAlert / AuditAlertIncident

Automated alerts triggered by audit patterns.

**AuditAlert:** alertName, triggerConditions (Json), severity (AuditSeverityLevel), notifyUsers (Json), isActive
**AuditAlertIncident:** auditAlertId, triggeredAt, triggerData, severity, acknowledgedBy/At, resolvedAt, notes

## AuditRetentionPolicy

Data retention configuration per entity type.

| Field | Type | Notes |
|-------|------|-------|
| entityType | String | VarChar(100) |
| retentionDays | Int | Keep for N days |
| archiveAfterDays | Int? | Archive threshold |
| deleteAfterDays | Int? | Hard delete threshold |
| isActive | Boolean | @default(true) |

**Unique:** `[tenantId, entityType]`
