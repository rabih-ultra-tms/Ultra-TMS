# Scheduler Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| ScheduledJob | Cron/scheduled job definitions | JobExecution, JobAlert, JobLock, JobDependency |
| JobExecution | Job run history | ScheduledJob |
| ScheduledTask | One-time scheduled tasks | |
| Reminder | User reminders/notifications | |
| JobTemplate | Reusable job templates | |
| JobLock | Distributed job locking | ScheduledJob |
| JobAlert | Job failure/threshold alerts | ScheduledJob |
| JobDependency | Job dependency chains | ScheduledJob |

## ScheduledJob

Recurring job definitions with cron scheduling.

| Field | Type | Notes |
|-------|------|-------|
| jobName | String | VarChar(255) |
| jobType | String | VarChar(100) |
| handler | String | VarChar(255) — handler class/function |
| schedule | String | VarChar(100) — cron expression |
| timezone | String | @default("UTC") |
| isActive | Boolean | @default(true) |
| parameters | Json | @default("{}") |
| maxRetries | Int | @default(3) |
| retryDelayMs | Int | @default(60000) |
| timeoutMs | Int | @default(300000) |
| lastRunAt | DateTime? | |
| nextRunAt | DateTime? | |
| lastStatus | String? | VarChar(50) |
| consecutiveFailures | Int | @default(0) |
| maxConsecutiveFailures | Int | @default(5) |
| isPaused | Boolean | @default(false) |

**Relations:** JobExecution[], JobAlert[], JobLock?, JobDependency[]

## JobExecution

Individual job run records.

| Field | Type | Notes |
|-------|------|-------|
| jobId | String | FK to ScheduledJob |
| status | JobExecutionStatus | PENDING, RUNNING, COMPLETED, FAILED, CANCELLED |
| startedAt/completedAt | DateTime? | |
| result | Json? | |
| errorMessage | String? | |
| attemptNumber | Int | @default(1) |
| executionNumber | Int | @default(1) |
| durationMs | Int? | |
| progressPercent | Int | @default(0) |
| progressMessage | String? | |
| parameters | Json? | |
| workerId | String? | VarChar(100) |
| workerHostname | String? | |
| willRetry | Boolean | @default(false) |

## JobLock

Distributed locking to prevent concurrent execution.

| Field | Type | Notes |
|-------|------|-------|
| jobId | String | @unique — FK to ScheduledJob |
| workerId | String | VarChar(100) |
| lockedAt | DateTime | |
| expiresAt | DateTime | |
| lastHeartbeat | DateTime? | |

## Reminder

User-facing reminders and notifications.

| Field | Type | Notes |
|-------|------|-------|
| userId | String | FK to User |
| title | String | VarChar(255) |
| description | String? | |
| reminderDate | DateTime | |
| entityType/entityId | String? | Related entity |
| isCompleted | Boolean | @default(false) |
| completedAt | DateTime? | |
| snoozeUntil | DateTime? | |

## JobTemplate

Reusable job configuration templates.

| Field | Type | Notes |
|-------|------|-------|
| code | String | @unique, VarChar(100) |
| name | String | |
| handler | String | Handler reference |
| defaultSchedule | String? | Default cron |
| defaultParameters | Json | @default("{}") |
| isSystemRequired | Boolean | @default(false) — cannot be disabled |
| isTenantConfigurable | Boolean | @default(true) |
