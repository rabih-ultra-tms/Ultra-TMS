# Service Hub: Scheduler (24)

> **Priority:** P3 Future | **Status:** Backend Built, Frontend Not Built
> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-24 tribunal)
> **Original definition:** `dev_docs/02-services/` (Scheduler service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/36-scheduler/` (7 files)
> **v2 hub (historical):** N/A
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-24-scheduler.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B (7.5/10) |
| **Confidence** | High — code-verified via PST-24 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Built — 5 controllers, 25 endpoints (25=25, 100% match) in `apps/api/src/modules/scheduler/` (30 files, 2,007 LOC) |
| **Frontend** | Not Built — no pages, no components, no hooks |
| **Tests** | 43 tests across 9 spec files (~600 LOC) |
| **Infrastructure** | PostgreSQL-backed locking via `JobLock` Prisma model. No external queue (BullMQ) dependency. |
| **Active Blockers** | Entire frontend layer missing; no admin UI for job management; handler registry has no pre-registered handlers; no scheduling loop (jobs only run via manual trigger) |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Scheduler service definition in dev_docs |
| Design Specs | Done | 7 files in `dev_docs/12-Rabih-design-Process/36-scheduler/` |
| Backend — Jobs | Built | `jobs/jobs.controller.ts` — 8 endpoints (CRUD + run/pause/resume) |
| Backend — Executions | Built | `executions/executions.controller.ts` — 4 endpoints (list, get, cancel, retry) |
| Backend — Reminders | Built | `reminders/reminders.controller.ts` — 6 endpoints (CRUD + snooze/dismiss) |
| Backend — Tasks | Built | `tasks/tasks.controller.ts` — 4 endpoints (list, get, schedule, cancel) |
| Backend — Templates | Built | `templates/templates.controller.ts` — 3 endpoints (list, get, create from template) |
| Backend — Locking | Built | `locking/lock.service.ts` — distributed locking via Prisma `JobLock` model |
| Backend — Retry | Built | `retry/retry.service.ts` — exponential backoff with jitter, 1h cap |
| Backend — Handlers | Built | `handlers/handler-registry.ts` — name-based handler registration and dispatch |
| Backend — Processors | Built | `processors/job.processor.ts`, `processors/task.processor.ts` |
| Backend — Job Scheduler | Built | `jobs/job-scheduler.service.ts` — cron/interval scheduling orchestration (computes nextRunAt only, no polling loop) |
| Backend — Job Executor | Built | `executions/job-executor.service.ts` — execution lifecycle management |
| Prisma Models | Done | `ScheduledJob`, `JobExecution`, `JobLock`, `JobTemplate`, `ScheduledTask`, `Reminder`, `JobAlert`, `JobDependency` (8 models) |
| Frontend Pages | Not Built | No routes exist |
| Frontend Components | Not Built | No scheduler UI components |
| React Hooks | Not Built | No hooks in `lib/hooks/` |
| Tests | 43 tests / 9 spec files | All backend; 0 frontend tests |
| Security | Partial | All endpoints: JwtAuthGuard. No RolesGuard on any controller (0/5). Tenant isolation 4/5 (TemplatesController N/A — system-wide). |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Scheduler Dashboard | `/scheduler` | Not Built | — | Job list, execution stats, system health |
| Job Detail | `/scheduler/jobs/:id` | Not Built | — | Job config, execution history, logs |
| Job Create/Edit | `/scheduler/jobs/new` | Not Built | — | Form with schedule type, handler, parameters |
| Execution Detail | `/scheduler/jobs/:jobId/executions/:id` | Not Built | — | Execution result, duration, retry chain |
| Reminders | `/reminders` | Not Built | — | User reminder list with snooze/dismiss |
| Task Queue | `/scheduler/tasks` | Not Built | — | One-time scheduled tasks list |
| Templates | `/scheduler/templates` | Not Built | — | Browse and create jobs from templates |

---

## 4. API Endpoints

### JobsController — `@Controller('jobs')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/jobs` | Built | List all jobs for tenant |
| GET | `/api/v1/jobs/:id` | Built | Get job by ID |
| POST | `/api/v1/jobs` | Built | Create job (CreateJobDto) |
| PUT | `/api/v1/jobs/:id` | Built | Update job (UpdateJobDto) |
| DELETE | `/api/v1/jobs/:id` | Built | Delete job |
| POST | `/api/v1/jobs/:id/run` | Built | Trigger immediate job execution |
| POST | `/api/v1/jobs/:id/pause` | Built | Pause scheduled job |
| POST | `/api/v1/jobs/:id/resume` | Built | Resume paused job |

### ExecutionsController — `@Controller('jobs/:jobId/executions')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/jobs/:jobId/executions` | Built | List executions for a job |
| GET | `/api/v1/jobs/:jobId/executions/:executionId` | Built | Get execution detail |
| POST | `/api/v1/jobs/:jobId/executions/:executionId/cancel` | Built | Cancel running execution |
| POST | `/api/v1/jobs/:jobId/executions/:executionId/retry` | Built | Retry failed execution |

### RemindersController — `@Controller('reminders')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/reminders` | Built | List reminders for current user |
| POST | `/api/v1/reminders` | Built | Create reminder (CreateReminderDto) |
| PUT | `/api/v1/reminders/:id` | Built | Update reminder (UpdateReminderDto) |
| DELETE | `/api/v1/reminders/:id` | Built | Delete reminder |
| POST | `/api/v1/reminders/:id/snooze` | Built | Snooze reminder (SnoozeReminderDto: minutes) |
| POST | `/api/v1/reminders/:id/dismiss` | Built | Dismiss reminder |

### TasksController — `@Controller('tasks')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/tasks` | Built | List scheduled tasks for tenant |
| GET | `/api/v1/tasks/:id` | Built | Get task by ID |
| POST | `/api/v1/tasks` | Built | Schedule a task (ScheduleTaskDto) |
| DELETE | `/api/v1/tasks/:id` | Built | Cancel/delete scheduled task |

### TemplatesController — `@Controller('jobs/templates')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/jobs/templates` | Built | List all job templates |
| GET | `/api/v1/jobs/templates/:code` | Built | Get template by code |
| POST | `/api/v1/jobs/templates/:code/create` | Built | Create job from template with overrides |

**Total: 25 endpoints across 5 controllers.**

---

## 5. Components

| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| JobsTable | — | Not Built | No |
| JobForm (create/edit) | — | Not Built | No |
| ExecutionTimeline | — | Not Built | No |
| ExecutionDetailCard | — | Not Built | No |
| ReminderList | — | Not Built | No |
| ReminderForm | — | Not Built | No |
| SnoozeDialog | — | Not Built | No |
| TaskQueue | — | Not Built | No |
| TemplateCard | — | Not Built | No |
| CronExpressionBuilder | — | Not Built | Yes |
| SchedulerHealthIndicator | — | Not Built | Yes |

No frontend components exist. All are planned based on design specs.

---

## 6. Hooks

| Hook | Endpoints Used | Envelope Unwrapped? | Notes |
|------|---------------|---------------------|-------|
| `useJobs` | GET `/jobs` | — | Not Built |
| `useJob` | GET `/jobs/:id` | — | Not Built |
| `useCreateJob` | POST `/jobs` | — | Not Built |
| `useUpdateJob` | PUT `/jobs/:id` | — | Not Built |
| `useDeleteJob` | DELETE `/jobs/:id` | — | Not Built |
| `useRunJob` | POST `/jobs/:id/run` | — | Not Built |
| `usePauseJob` | POST `/jobs/:id/pause` | — | Not Built |
| `useResumeJob` | POST `/jobs/:id/resume` | — | Not Built |
| `useJobExecutions` | GET `/jobs/:jobId/executions` | — | Not Built |
| `useCancelExecution` | POST `/jobs/:jobId/executions/:id/cancel` | — | Not Built |
| `useRetryExecution` | POST `/jobs/:jobId/executions/:id/retry` | — | Not Built |
| `useReminders` | GET `/reminders` | — | Not Built |
| `useCreateReminder` | POST `/reminders` | — | Not Built |
| `useSnoozeReminder` | POST `/reminders/:id/snooze` | — | Not Built |
| `useDismissReminder` | POST `/reminders/:id/dismiss` | — | Not Built |
| `useScheduledTasks` | GET `/tasks` | — | Not Built |
| `useScheduleTask` | POST `/tasks` | — | Not Built |
| `useJobTemplates` | GET `/jobs/templates` | — | Not Built |
| `useCreateFromTemplate` | POST `/jobs/templates/:code/create` | — | Not Built |

No hooks exist. All listed above are planned.

---

## 7. Business Rules

1. **Job Types (scope):** Jobs are categorized by `jobType`: `SYSTEM` (platform-level, e.g., data sync, cleanup), `TENANT` (tenant-specific scheduled operations), `USER` (user-created ad-hoc jobs). The type determines visibility and who can manage the job.

2. **Schedule Types:** Four scheduling modes exist via `scheduleType`:
   - `CRON` — standard cron expression (e.g., `0 2 * * *` for daily at 2 AM). Requires `cronExpression` field.
   - `INTERVAL` — recurring at fixed intervals. Requires `intervalSeconds` (minimum 60).
   - `ONCE` — one-time execution at a specific datetime. Requires `runAt` ISO date.
   - `MANUAL` — no automatic scheduling; only triggered via `POST /jobs/:id/run`.

3. **Execution Tracking with Retry Logic:** Every job run creates a `JobExecution` record tracking status, attempt number, start/end times, duration, and output. On failure, the `RetryService` calculates exponential backoff with jitter (`baseDelay * 2^(attempt-1) + random jitter up to 30%`), capped at 1 hour maximum delay. The `maxRetries` field (0-10) controls how many retry attempts are allowed. Each retry creates a new `JobExecution` linked to the original via `retryOf`. The `willRetry` flag on the failed execution indicates a retry is scheduled.

4. **Distributed Locking (prevent duplicate runs):** The `LockService` uses a database-backed `JobLock` model to prevent concurrent execution of the same job across multiple server instances. Locks have a 5-minute TTL with heartbeat extension. Lock acquisition checks: if a lock exists, is not expired, and belongs to a different worker, acquisition fails. The `heartbeat()` method extends the lock during long-running jobs. Locks are released on completion or can expire naturally if a worker crashes. **WARNING:** Lock acquisition is non-atomic (TOCTOU race — see Known Issues BUG-1).

5. **Reminder System (configurable triggers):** Reminders are user-scoped and support:
   - Single or recurring reminders (`isRecurring` + `recurrenceRule` cron expression with optional `recurrenceEndDate`)
   - Multi-channel notifications: `in_app`, `email`, `sms` (configurable per reminder via `notificationChannels[]`)
   - Entity linking: `referenceType` + `referenceId` + `referenceUrl` to attach reminders to loads, orders, carriers, etc.
   - Snooze: configurable 5 to 10,080 minutes (7 days max)
   - Dismiss: permanently marks reminder as handled
   - Timezone-aware scheduling via `timezone` field

6. **Job Templates for Common Tasks:** The `JobTemplate` model stores pre-configured job definitions (code, name, handler, default parameters). The `TemplatesService.createFromTemplate()` method merges template defaults with user overrides, applying sensible defaults: `timeoutSeconds: 300`, `maxRetries: 3`, `retryDelaySeconds: 60`, `priority: 5`, `queue: 'default'`, `allowConcurrent: false`, `maxInstances: 1`. Common template use cases: data sync, report generation, cleanup tasks, invoice aging, carrier insurance expiry checks.

7. **Processor Pattern for Job Execution:** Jobs are executed through a two-layer pattern:
   - `HandlerRegistry` — a name-based registry where handlers are registered at startup. Jobs reference a `handler` string that maps to a registered function. If no handler is found, execution returns null (silent no-op — **BUG-2**).
   - `JobProcessor` — retrieves the job definition via `JobsService.get()` then delegates to `JobExecutorService.execute()` which manages the full lifecycle (lock acquire, handler dispatch, status tracking, error handling, lock release).
   - `TaskProcessor` — simpler processor for one-time scheduled tasks; marks task as `COMPLETED` with `processedAt` and `completedAt` timestamps. **Does not invoke handler** — **BUG-3**.

8. **Job Lifecycle States:** Jobs support `pause` and `resume` operations. Paused jobs retain their schedule configuration but skip execution until resumed. The `POST /jobs/:id/run` endpoint allows manual triggering regardless of schedule state.

9. **Concurrency Control:** Jobs can be configured with `allowConcurrent: false` (default) to prevent overlapping executions via the locking mechanism. The `maxInstances` field (1-10) limits how many concurrent instances can run when concurrent execution is allowed.

10. **Priority and Queuing:** Jobs have a `priority` field (1-10, where 1 is highest) and can be assigned to named `queue` groups (default: `'default'`). This enables prioritized processing when multiple jobs are scheduled simultaneously.

---

## 8. Data Model

### ScheduledJob
```
ScheduledJob {
  id                String (UUID, @id @default(uuid()))
  tenantId          String (FK -> Tenant)
  code              String (unique identifier)
  name              String
  description       String?
  jobType           JobType (enum: SYSTEM, TENANT, USER)
  scheduleType      ScheduleType (enum: CRON, INTERVAL, ONCE, MANUAL)
  cronExpression    String?
  intervalSeconds   Int?
  runAt             DateTime?
  timezone          String?
  handler           String (maps to HandlerRegistry entry)
  parameters        Json?
  timeoutSeconds    Int? (30-3600)
  maxRetries        Int? (0-10)
  retryAttempts     Int?
  retryDelaySeconds Int? (1-3600)
  status            String (ACTIVE, PAUSED, DISABLED)
  priority          Int? (1-10)
  queue             String? (named queue group)
  allowConcurrent   Boolean (default: false)
  maxInstances      Int? (1-10)
  nextRunAt         DateTime?
  lastRunAt         DateTime?
  createdById       String? (FK -> User)
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime? (soft delete)
}
```
**Note:** Prisma has ~35 fields vs 28 shown here (~60% field accuracy). Hub omits some fields for brevity.

### JobExecution
```
JobExecution {
  id              String (UUID, @id @default(uuid()))
  jobId           String (FK -> ScheduledJob)
  tenantId        String (FK -> Tenant)
  status          JobExecutionStatus (enum: PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, TIMEOUT)
  executionNumber Int
  attemptNumber   Int
  retryOf         String? (FK -> JobExecution, self-referencing)
  willRetry       Boolean (default: false)
  scheduledAt     DateTime?
  startedAt       DateTime?
  completedAt     DateTime?
  durationMs      Int? (milliseconds)
  result          Json?
  errorMessage    String?
  createdById     String? (FK -> User)
  customFields    Json?
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime? (soft delete)
}
```
**Enum corrections (hub vs Prisma):** `SUCCESS` -> `COMPLETED`, `TIMED_OUT` -> `TIMEOUT`. **Field name corrections:** `output` -> `result`, `error` -> `errorMessage`, `duration` -> `durationMs`.

### JobLock
```
JobLock {
  id            String (UUID, @id @default(uuid()))
  jobId         String (unique, FK -> ScheduledJob)
  workerId      String
  tenantId      String?
  lockedAt      DateTime
  expiresAt     DateTime
  lastHeartbeat DateTime
}
```

### JobTemplate
```
JobTemplate {
  id                    String (UUID, @id @default(uuid()))
  code                  String (unique)
  name                  String
  description           String?
  handler               String
  defaultParameters     Json?
  category              String?
  defaultSchedule       String?
  isSystemRequired      Boolean?
  isTenantConfigurable  Boolean?
  createdAt             DateTime
  updatedAt             DateTime
}
```
**Note:** 4 fields added from Prisma that were missing: `category`, `defaultSchedule`, `isSystemRequired`, `isTenantConfigurable`.

### ScheduledTask
```
ScheduledTask {
  id            String (UUID, @id @default(uuid()))
  tenantId      String (FK -> Tenant)
  taskType      String
  scheduledAt   DateTime
  timezone      String?
  referenceType String?
  referenceId   String?
  payload       Json
  handler       String
  priority      Int? (1-10)
  timeoutSeconds Int? (5-3600)
  status        TaskStatus (enum: PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED)
  processedAt   DateTime?
  completedAt   DateTime?
  createdById   String? (FK -> User)
  createdAt     DateTime
  updatedAt     DateTime
}
```
**Enum correction:** `PROCESSING` -> `IN_PROGRESS` (matches Prisma).

### Reminder
```
Reminder {
  id                   String (UUID, @id @default(uuid()))
  tenantId             String (FK -> Tenant)
  userId               String (FK -> User)
  title                String (max 200 chars)
  description          String?
  reminderType         String?
  remindAt             DateTime
  timezone             String?
  entityType           String?
  entityId             String?
  referenceType        String?
  referenceId          String?
  referenceUrl         String?
  isRecurring          Boolean (default: false)
  recurrenceRule       String? (cron expression)
  recurrenceEndDate    DateTime?
  notificationChannels String[] (in_app, email, sms)
  status               ReminderStatus (enum: PENDING, SENT, SNOOZED, DISMISSED, COMPLETED)
  snoozedUntil         DateTime?
  sentAt               DateTime?
  completedAt          DateTime?
  snoozeCount          Int?
  createdAt            DateTime
  updatedAt            DateTime
}
```
**Fields added from Prisma:** `reminderType`, `entityType`, `entityId`, `sentAt`, `completedAt`, `snoozeCount`. **Enum:** `COMPLETED` is the 5th status value (previously undocumented).

### JobAlert (NEW — missing from previous hub)
```
JobAlert {
  id            String (UUID, @id @default(uuid()))
  jobId         String (FK -> ScheduledJob)
  tenantId      String (FK -> Tenant)
  alertType     String
  threshold     Int?
  message       String?
  isActive      Boolean (default: true)
  lastTriggered DateTime?
  createdAt     DateTime
  updatedAt     DateTime
  deletedAt     DateTime?
}
```
Alerting on job thresholds (e.g., consecutive failures, execution duration exceeding threshold). 11 fields.

### JobDependency (NEW — missing from previous hub)
```
JobDependency {
  id              String (UUID, @id @default(uuid()))
  jobId           String (FK -> ScheduledJob)
  dependsOnJobId  String (FK -> ScheduledJob)
  createdAt       DateTime
  updatedAt       DateTime
}
```
Inter-job DAG dependency graph — enables ordered execution chains. 5 fields.

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| CreateJobDto `code` | `@IsString()` (required) | "code must be a string" |
| CreateJobDto `name` | `@IsString()` (required) | "name must be a string" |
| CreateJobDto `scheduleType` | `@IsIn(['CRON', 'INTERVAL', 'ONCE', 'MANUAL'])` | "scheduleType must be one of CRON, INTERVAL, ONCE, MANUAL" |
| CreateJobDto `jobType` | `@IsIn(['SYSTEM', 'TENANT', 'USER'])` (optional) | "jobType must be one of SYSTEM, TENANT, USER" |
| CreateJobDto `cronExpression` | `@IsString()`, required when `scheduleType === 'CRON'` | "cronExpression is required for CRON schedule type" |
| CreateJobDto `intervalSeconds` | `@IsInt()`, `@Min(60)`, required when `scheduleType === 'INTERVAL'` | "intervalSeconds must be at least 60" |
| CreateJobDto `runAt` | `@IsDateString()`, required when `scheduleType === 'ONCE'` | "runAt is required for ONCE schedule type" |
| CreateJobDto `handler` | `@IsString()` (required) | "handler must be a string" |
| CreateJobDto `timeoutSeconds` | `@IsInt()`, `@Min(30)`, `@Max(3600)` | "timeoutSeconds must be between 30 and 3600" |
| CreateJobDto `maxRetries` | `@IsInt()`, `@Min(0)`, `@Max(10)` | "maxRetries must be between 0 and 10" |
| CreateJobDto `retryDelaySeconds` | `@IsInt()`, `@Min(1)`, `@Max(3600)` | "retryDelaySeconds must be between 1 and 3600" |
| CreateJobDto `priority` | `@IsInt()`, `@Min(1)`, `@Max(10)` | "priority must be between 1 and 10" |
| CreateJobDto `maxInstances` | `@IsInt()`, `@Min(1)`, `@Max(10)` | "maxInstances must be between 1 and 10" |
| CreateReminderDto `title` | `@IsString()`, `@MaxLength(200)` | "title must not exceed 200 characters" |
| CreateReminderDto `remindAt` | `@IsDateString()` (required) | "remindAt must be a valid ISO date string" |
| CreateReminderDto `recurrenceRule` | `@IsString()`, required when `isRecurring === true` | "recurrenceRule is required for recurring reminders" |
| CreateReminderDto `notificationChannels` | `@IsArray()`, values `@IsIn(['in_app', 'email', 'sms'])` | "notificationChannels must be in_app, email, or sms" |
| SnoozeReminderDto `minutes` | `@IsInt()`, `@Min(5)`, `@Max(10080)` | "Snooze must be between 5 minutes and 7 days" |
| ScheduleTaskDto `taskType` | `@IsString()` (required) | "taskType must be a string" |
| ScheduleTaskDto `scheduledAt` | `@IsDateString()` (required) | "scheduledAt must be a valid ISO date string" |
| ScheduleTaskDto `payload` | `@IsObject()` (required) | "payload must be an object" |
| ScheduleTaskDto `handler` | `@IsString()` (required) | "handler must be a string" |
| ScheduleTaskDto `priority` | `@IsInt()`, `@Min(1)`, `@Max(10)` | "priority must be between 1 and 10" |
| ScheduleTaskDto `timeoutSeconds` | `@IsInt()`, `@Min(5)`, `@Max(3600)` | "timeoutSeconds must be between 5 and 3600" |

**Note:** `UpdateJobDto` and `UpdateReminderDto` extend their Create counterparts without `PartialType()` — all required fields remain required on update (BUG-5). No cron expression validation at DTO level (BUG-6).

---

## 10. Status States

### Job Status
```
ACTIVE    -> Job is scheduled and will execute per its schedule
PAUSED    -> Job schedule is suspended (POST /jobs/:id/pause)
DISABLED  -> Job is deactivated (no execution)
```

### Job Execution Status
```
PENDING    -> Execution created, waiting to start (or retry scheduled)
RUNNING    -> Execution in progress (lock acquired)
COMPLETED  -> Execution completed successfully
FAILED     -> Execution failed (may trigger retry via RetryService)
CANCELLED  -> Execution cancelled by user (POST /executions/:id/cancel)
TIMEOUT    -> Execution exceeded timeoutSeconds
```

### Task Status
```
PENDING       -> Task scheduled, waiting for scheduledAt
IN_PROGRESS   -> Task picked up by TaskProcessor
COMPLETED     -> Task finished (processedAt + completedAt set)
FAILED        -> Task execution failed
CANCELLED     -> Task cancelled (DELETE /tasks/:id)
```

### Reminder Status
```
PENDING    -> Reminder created, waiting for remindAt
SENT       -> Notification delivered via configured channels
SNOOZED    -> User snoozed (POST /reminders/:id/snooze), snoozedUntil set
DISMISSED  -> User dismissed (POST /reminders/:id/dismiss), terminal state
COMPLETED  -> Reminder action completed (5th status, previously undocumented)
```

### Retry Flow
```
Execution FAILED
  -> RetryService.scheduleRetry() checks attemptNumber < maxRetries
  -> If retryable: new JobExecution (PENDING) created with incremented attemptNumber
     - retryOf links to failed execution
     - willRetry = true on the failed execution
     - scheduledAt = now + exponential backoff (base * 2^attempt + jitter, cap 1h)
  -> If max retries exceeded: no retry, execution stays FAILED
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| **BUG-1:** LockService TOCTOU race — `findUnique` then `create/update` is non-atomic; unique constraint prevents double-lock but throws unhandled PrismaClientKnownRequestError | P2 BUG | `locking/lock.service.ts:12-27` | Open |
| **BUG-2:** HandlerRegistry silent no-op — missing handler returns null, treated as success; typo'd handler name "succeeds" | P2 BUG | `handlers/handler-registry.ts:15-17` | Open |
| **BUG-3:** TaskProcessor doesn't invoke handler — just marks task COMPLETED with timestamps, never calls HandlerRegistry | P2 BUG | `processors/task.processor.ts:9-14` | Open |
| **BUG-4:** No scheduling loop — `JobSchedulerService` only computes `nextRunAt`; no `@Cron`/`@Interval` polls for due jobs; jobs only run via manual `POST /jobs/:id/run` | P2 BUG | `jobs/job-scheduler.service.ts` | Open |
| **BUG-5:** UpdateJobDto/UpdateReminderDto missing `PartialType()` — all required fields required on update | P3 BUG | `dto/job.dto.ts:91`, `dto/reminder.dto.ts:50` | Open |
| **BUG-6:** No cron expression validation at DTO level — `@IsString()` only; invalid cron accepted, fails silently at nextRunAt computation | P3 BUG | `dto/job.dto.ts:23` | Open |
| **BUG-7:** ExecutionsService.list() missing `deletedAt: null` filter — JobExecution has `deletedAt` field but query doesn't filter it | P3 BUG | `executions/executions.service.ts:20` | Open |
| **BUG-8:** Dual duration fields — code writes both `timeoutSeconds` AND `timeoutMinutes`, both `intervalSeconds` AND `intervalMinutes`; migration artifacts, fragile | P3 | — | Open |
| No frontend exists — entire UI layer missing | P1 | — | Open |
| HandlerRegistry has no pre-registered handlers at module init | P2 | `handlers/handler-registry.ts` | Open |
| Lock TTL hardcoded to 5 minutes (not configurable) | P3 | `locking/lock.service.ts` | Open |
| No RolesGuard on any controller (0/5) — any authenticated user can create/delete/run SYSTEM jobs | P2 | All controllers | Open |
| No hooks — frontend has zero integration with 25 backend endpoints | P1 | — | Open |

**Hub Known Issues Accuracy: 9/10 (90%) — BEST of all audited services.** Only partial miss: "No cron expression validation" — DTO lacks it but scheduler uses `cron-parser` internally.

**Resolved Issues (closed during PST-24 tribunal):**
- ~~Hub claims "Scaffolded"~~ — FALSE: production-grade scheduler framework. Correct term: "Framework built, handler implementations pending."

---

## 12. Tasks

### Immediate (Critical Fixes)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SCHED-101 | Fix LockService TOCTOU race — use Prisma `upsert` or try/catch for unique constraint | S (2h) | P2 |
| SCHED-102 | Register default handlers in HandlerRegistry at module init (sync, cleanup, report) | M (3h) | P2 |
| SCHED-103 | Fix TaskProcessor to invoke handler via HandlerRegistry instead of just marking complete | S (1h) | P2 |
| SCHED-104 | Add cron expression validation to CreateJobDto (use `cron-parser` library) | S (1h) | P2 |
| SCHED-105 | Fix UpdateJobDto/UpdateReminderDto to use `PartialType(CreateJobDto)` from `@nestjs/swagger` | S (30min) | P3 |
| SCHED-106 | Add `@Cron` or `@Interval` scheduling loop to poll for due jobs | M (3h) | P2 |
| SCHED-107 | HandlerRegistry — throw/log when handler not found instead of silent null | S (1h) | P2 |
| SCHED-108 | Add RolesGuard to Jobs, Executions, Tasks controllers (ADMIN-only minimum) | S (1h) | P2 |
| SCHED-109 | Add `deletedAt: null` filter to ExecutionsService.list() | XS (15min) | P3 |

### Frontend Build
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SCHED-201 | Build Scheduler Dashboard page with jobs table, execution stats | L (6h) | P3 |
| SCHED-202 | Build Job Create/Edit form with schedule type selector, cron builder | L (6h) | P3 |
| SCHED-203 | Build Execution Detail page with retry chain visualization | M (4h) | P3 |
| SCHED-204 | Build Reminders page with snooze/dismiss actions | M (4h) | P3 |
| SCHED-205 | Build scheduler hooks (useJobs, useJobExecutions, useReminders, etc.) | M (3h) | P3 |
| SCHED-206 | Build CronExpressionBuilder shared component | M (3h) | P3 |

### Infrastructure Verification
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SCHED-301 | Verify retry flow end-to-end (fail -> backoff -> retry -> success) | M (3h) | P2 |
| SCHED-302 | Verify distributed locking works across multiple API instances | M (3h) | P2 |

### Testing
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SCHED-401 | Run existing 43 tests across 9 spec files, verify all pass | S (1h) | P2 |
| SCHED-402 | Write integration tests for job lifecycle (create, run, pause, resume, delete) | M (4h) | P2 |
| SCHED-403 | Write retry service integration tests (exponential backoff, max retries) | S (2h) | P2 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Full spec | `dev_docs/12-Rabih-design-Process/36-scheduler/00-service-overview.md` |
| Scheduler Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/36-scheduler/01-scheduler-dashboard.md` |
| Resource Calendar | Full 15-section | `dev_docs/12-Rabih-design-Process/36-scheduler/02-resource-calendar.md` |
| Appointment Manager | Full 15-section | `dev_docs/12-Rabib-design-Process/36-scheduler/03-appointment-manager.md` |
| Capacity Planning | Full 15-section | `dev_docs/12-Rabih-design-Process/36-scheduler/04-capacity-planning.md` |
| Auto Scheduler | Full 15-section | `dev_docs/12-Rabih-design-Process/36-scheduler/05-auto-scheduler.md` |
| Scheduler Reports | Full 15-section | `dev_docs/12-Rabih-design-Process/36-scheduler/06-scheduler-reports.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Basic job scheduling (CRUD) | 25 endpoints across 5 controllers | Exceeds plan |
| Single controller | 5 controllers (jobs, executions, reminders, tasks, templates) | Better modularity |
| No execution tracking | Full execution lifecycle with status, duration, output, retry chain | Ahead of plan |
| No retry logic | Exponential backoff with jitter, configurable max retries, retry linking | Ahead of plan |
| No distributed locking | Database-backed locking with TTL and heartbeat | Ahead of plan |
| No reminder system | Full reminder CRUD with snooze, dismiss, recurring, multi-channel | Ahead of plan |
| No templates | Job templates with create-from-template and override merging | Ahead of plan |
| Frontend expected alongside backend | Zero frontend built | Behind plan |
| Handler implementations expected | HandlerRegistry built but no handlers registered | Behind plan |
| 7 design screens planned | 7 design spec files delivered | On track |
| Hub claimed "Scaffolded" | Production-grade framework (2,007 LOC, 30 files) | Hub was misleading |

**Summary:** Backend architecture is significantly more mature than originally documented. The 7.5/10 health score reflects an excellent framework with production-grade patterns (distributed locking, exponential backoff retry, template system, multi-channel reminders) but four functional gaps: no scheduling loop (BUG-4), silent handler no-op (BUG-2), non-functional TaskProcessor (BUG-3), and TOCTOU lock race (BUG-1). Zero frontend exists. Best sub-module structure of any P3 service (10 sub-modules). Hub known issues were 9/10 accurate — best accuracy of all audited services.

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT guard, `@CurrentTenant()`, `@CurrentUser()` decorators on all endpoints)
- Prisma (ScheduledJob, JobExecution, JobLock, JobTemplate, ScheduledTask, Reminder, JobAlert, JobDependency — 8 models)
- Communication service (future — for reminder notification delivery via email/SMS channels)
- Notification service (future — for in-app reminder delivery)

**Depended on by:**
- Any service needing scheduled operations (accounting invoice aging, carrier insurance expiry, data sync)
- Workflow service (could trigger scheduled workflow steps via job templates)
- Analytics service (could schedule report generation jobs)
- Integration Hub (could schedule periodic data sync with external systems)
- Load Board (could schedule automatic load refresh/expiry checks)

**Sub-module structure:**
```
apps/api/src/modules/scheduler/
  dto/              — CreateJobDto, UpdateJobDto, CreateReminderDto, UpdateReminderDto, SnoozeReminderDto, ScheduleTaskDto
  executions/       — ExecutionsController, ExecutionsService, JobExecutorService (+ 2 spec files)
  handlers/         — HandlerRegistry (name-based handler registration and dispatch)
  jobs/             — JobsController, JobsService, JobSchedulerService (+ 3 spec files)
  locking/          — LockService (database-backed distributed locking, + 1 spec file)
  processors/       — JobProcessor, TaskProcessor (execution orchestrators)
  reminders/        — RemindersController, RemindersService (+ 1 spec file)
  retry/            — RetryService (exponential backoff with jitter, + 1 spec file)
  tasks/            — TasksController, TasksService (+ 1 spec file)
  templates/        — TemplatesController, TemplatesService (+ 1 spec file — total: 9 spec files, 43 tests)
  scheduler.module.ts — Root module registering all controllers, providers, exports
```
