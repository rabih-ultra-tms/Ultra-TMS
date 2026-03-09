# PST-24: Scheduler — Per-Service Tribunal Audit

> **Date:** 2026-03-09 | **Auditor:** Claude Code (Opus 4.6)
> **Hub file:** `dev_docs_v3/01-services/p3-future/24-scheduler.md`
> **Backend:** `apps/api/src/modules/scheduler/` (30 files, 2,007 LOC)

---

## Verdict: MODIFY | Health: 2/10 → 7.5/10 (+5.5)

---

## Phase 1: Hub vs Reality Cross-Check

### Endpoint Count: 25=25 (11th CONSECUTIVE perfect match)

| Controller | Hub | Actual | Match |
|-----------|-----|--------|-------|
| JobsController | 8 | 8 | ✅ |
| ExecutionsController | 4 | 4 | ✅ |
| RemindersController | 6 | 6 | ✅ |
| TasksController | 4 | 4 | ✅ |
| TemplatesController | 3 | 3 | ✅ |
| **Total** | **25** | **25** | **✅ 100%** |

### Path Accuracy: ~100%

All 5 controller prefixes match hub documentation exactly.

### Data Models: Hub 6, Actual 8

| Model | In Hub | In Prisma | Notes |
|-------|--------|-----------|-------|
| ScheduledJob | ✅ | ✅ | 35+ Prisma fields vs 28 hub fields (~60% accuracy) |
| JobExecution | ✅ | ✅ | 3 field name mismatches (output→result, error→errorMessage, duration→durationMs) |
| JobLock | ✅ | ✅ | ~90% accurate |
| JobTemplate | ✅ | ✅ | Misses category, defaultSchedule, isSystemRequired, isTenantConfigurable |
| ScheduledTask | ✅ | ✅ | ~50% field accuracy (many legacy dual-name fields) |
| Reminder | ✅ | ✅ | Misses reminderType, entityType, entityId, sentAt, completedAt, snoozeCount |
| **JobAlert** | ❌ | ✅ | 11 fields — alerting on job thresholds |
| **JobDependency** | ❌ | ✅ | 5 fields — inter-job DAG dependency graph |

### Enum Mismatches (3 value-level errors)

| Enum | Hub Value | Actual Prisma Value |
|------|-----------|---------------------|
| JobExecutionStatus | `SUCCESS` | `COMPLETED` |
| JobExecutionStatus | `TIMED_OUT` | `TIMEOUT` |
| TaskStatus | `PROCESSING` | `IN_PROGRESS` |
| ReminderStatus | (missing) | `COMPLETED` (5th value undocumented) |

### Hub "Scaffolded" Claim: FALSE

Hub uses "Scaffolded" 6 times. Reality: production-grade CRUD with full execution lifecycle (lock → create execution → run handler → update stats → release lock → auto-retry on failure), exponential backoff with jitter, database-backed distributed locking with heartbeat, template system with default merging, reminder system with snooze/dismiss/recurring/multi-channel.

Correct term: "Framework built, handler implementations pending."

---

## Phase 2: Security Audit

### JwtAuthGuard: 5/5 (100%)

All 5 controllers have `@UseGuards(JwtAuthGuard)` at class level.

### RolesGuard: 0/5 (0%)

No controller uses RolesGuard or @Roles. Any authenticated user can create/delete/run SYSTEM jobs.

### Tenant Isolation: 4/5 (80%)

| Controller | Tenant Filtered | Notes |
|-----------|----------------|-------|
| JobsController | Partial | OR-based query shows system + tenant jobs; findJob checks ownership |
| ExecutionsController | ✅ | Via job ownership verification |
| RemindersController | ✅ | tenantId + userId (most restrictive) |
| TasksController | ✅ | Direct tenantId filter |
| TemplatesController | N/A | JobTemplate has no tenantId — system-wide by design |

### Soft Delete Compliance

| Service Method | Filtered | Issue |
|---------------|----------|-------|
| JobsService.list() | ✅ `deletedAt: null` | — |
| JobsService.findJob() | ✅ checks deletedAt | — |
| **ExecutionsService.list()** | ❌ | JobExecution HAS deletedAt but no filter |
| TasksService.list() | ✅ | — |
| RemindersService.list() | ✅ | — |
| RemindersService.find() | ✅ | — |
| TemplatesService.list() | N/A | JobTemplate has no deletedAt |

---

## Phase 3: Code Quality & Bugs

### BUG-1 (P2): LockService TOCTOU Race Condition
**File:** `locking/lock.service.ts:12-27`
**Issue:** `findUnique` then conditional `create/update` is non-atomic. Two workers can both see no lock and both attempt create. The `@unique` constraint on `jobId` prevents double-lock but causes an **unhandled PrismaClientKnownRequestError** instead of graceful failure.
**Fix:** Use Prisma `upsert` or wrap in try/catch for unique constraint violation.

### BUG-2 (P2): HandlerRegistry Silent No-Op
**File:** `handlers/handler-registry.ts:15-17`
**Issue:** Missing handler returns `null` silently. JobExecutorService treats null as success. A job with typo'd handler name "succeeds" with null result.
**Fix:** Throw `NotFoundException` or log warning when handler not found.

### BUG-3 (P2): TaskProcessor Doesn't Invoke Handler
**File:** `processors/task.processor.ts:9-14`
**Issue:** Just marks task as COMPLETED with timestamps. Never calls HandlerRegistry. Completely non-functional for actual task execution.
**Fix:** Inject HandlerRegistry and call `execute()` before marking complete.

### BUG-4 (P2): No Scheduling Loop
**Issue:** `JobSchedulerService` only computes `nextRunAt`. No `@Cron`/`@Interval` decorator polls for due jobs. Jobs can only execute via manual `POST /jobs/:id/run`.
**Impact:** Cron/interval/once schedule types are cosmetically stored but never auto-triggered.

### BUG-5 (P3): UpdateJobDto/UpdateReminderDto Missing PartialType
**Files:** `dto/job.dto.ts:91`, `dto/reminder.dto.ts:50`
**Issue:** Both extend Create DTO without `PartialType()`. All required fields (code, name, handler, scheduleType, title, remindAt) required on update.
**Fix:** Use `PartialType(CreateJobDto)` from `@nestjs/swagger`.

### BUG-6 (P3): No Cron Expression Validation at API Level
**File:** `dto/job.dto.ts:23`
**Issue:** `cronExpression` is `@IsString()` only. Invalid cron accepted, fails silently when computing nextRunAt (returns null).
**Fix:** Add custom validator using `cron-parser`.

### BUG-7 (P3): ExecutionsService.list() Missing deletedAt Filter
**File:** `executions/executions.service.ts:20`
**Issue:** JobExecution has `deletedAt` field but query doesn't filter it.

### BUG-8 (P3): Dual Duration Fields (Legacy)
**Issue:** Code writes both `timeoutSeconds` AND `timeoutMinutes`, both `intervalSeconds` AND `intervalMinutes`. Prisma has both field pairs as migration artifacts. Fragile.

---

## Phase 4: Architecture Assessment

### Strengths
1. **Best sub-module structure of any P3 service** — 10 sub-modules (jobs, executions, reminders, tasks, templates, locking, retry, handlers, processors, dto)
2. **Execution lifecycle** — Lock → Execute → Track → Retry → Release pattern is production-grade
3. **Retry logic** — Exponential backoff with 30% jitter, 1h cap, retry chain via `retryOf` FK
4. **Module exports** — `[JobsService, JobSchedulerService, HandlerRegistry]` (other modules can register handlers)
5. **cron-parser** imported and used for schedule computation

### Gaps
1. **No scheduling loop** — Framework built, no engine to poll/trigger
2. **No task polling** — Nothing picks up due ScheduledTasks
3. **Handler registry empty** — No `onModuleInit()` registering defaults
4. **No EventEmitter integration** — Other services can't trigger via events

---

## Phase 5: Test Verification

| Stat | Hub Claims | Actual |
|------|-----------|--------|
| Spec files | 6 | **9** |
| Test cases | (unspecified) | **43** |
| Test LOC | (unspecified) | ~600 |

| Spec File | Tests |
|-----------|-------|
| executions.service.spec | 6 |
| job-executor.service.spec | 3 |
| job-scheduler.service.spec | 4 |
| jobs.service.spec | 8 |
| lock.service.spec | 5 |
| reminders.service.spec | 8 |
| retry.service.spec | 2 |
| tasks.service.spec | 4 |
| templates.service.spec | 3 |

Hub "Partial — 6 spec files" understates by 3 files but is directionally correct. First P3 service where hub didn't claim "None" — a rare non-false test claim.

---

## Hub Known Issues Accuracy: 9/10 (90%) — BEST of all 24 services

| Hub Issue | Verified |
|-----------|----------|
| No frontend exists | ✅ TRUE |
| HandlerRegistry no pre-registered handlers | ✅ TRUE |
| Silent no-op if handler not found | ✅ TRUE |
| TaskProcessor only marks complete | ✅ TRUE |
| Lock TTL hardcoded to 5 minutes | ✅ TRUE |
| LockService.acquire() not atomic | ✅ TRUE |
| No hooks | ✅ TRUE |
| UpdateJobDto all fields required | ✅ TRUE |
| No cron expression validation | ⚠️ PARTIAL — DTO lacks it, but scheduler uses cron-parser |
| Job scheduling loop unverified | ✅ TRUE (loop doesn't exist) |

---

## Tribunal Summary

| Round | Question | Verdict |
|-------|----------|---------|
| 1 | "Scaffolded" vs production? | Framework is production-grade, "Scaffolded" is misleading |
| 2 | Lock race exploitable? | P2 — unique constraint prevents double-lock but throws unhandled error |
| 3 | 0/5 RolesGuard acceptable? | P2 for jobs (system-level), P3 for reminders (user-scoped) |
| 4 | Hub data model accuracy? | Structurally right, detail-wrong (~55% field accuracy, 2 missing models) |
| 5 | Overall health? | 7.5/10 — excellent framework, no fuel (no handlers + no polling) |

---

## Action Items

| # | Priority | Action |
|---|----------|--------|
| 1 | P2 | Fix LockService — use Prisma `upsert` or try/catch for unique constraint |
| 2 | P2 | HandlerRegistry — throw/log when handler not found |
| 3 | P2 | TaskProcessor — wire up HandlerRegistry for handler invocation |
| 4 | P2 | Add `@Cron` or `@Interval` scheduler loop to poll for due jobs |
| 5 | P2 | Register default handlers in `onModuleInit()` |
| 6 | P2 | Add RolesGuard to Jobs, Executions, Tasks controllers (ADMIN-only minimum) |
| 7 | P3 | Fix UpdateJobDto/UpdateReminderDto with `PartialType()` |
| 8 | P3 | Add cron-parser validation to CreateJobDto |
| 9 | P3 | Add `deletedAt: null` filter to ExecutionsService.list() |
| 10 | P3 | Resolve dual duration fields (timeoutSeconds/timeoutMinutes, intervalSeconds/intervalMinutes) |
| 11 | DOC | Update hub: 8 models, fix enum values, change "Scaffolded" to "Built", fix spec count to 9 |
| 12 | DOC | Document JobAlert and JobDependency models in hub Section 8 |
