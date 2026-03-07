# Service Hub: Scheduler (24)

> **Priority:** P3 Future | **Status:** Backend Built, Frontend Not Built
> **Source of Truth** -- dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Scheduler service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/36-scheduler/` (7 files)
> **v2 hub (historical):** N/A

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Confidence** | High -- controllers, DTOs, services, and spec files verified 2026-03-07 |
| **Last Verified** | 2026-03-07 |
| **Backend** | Built -- 5 controllers, 25 endpoints in `apps/api/src/modules/scheduler/` |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Tests** | Partial -- 6 spec files exist (executions.service, job-executor.service, job-scheduler.service, jobs.service, lock.service, reminders.service, retry.service, tasks.service, templates.service) |
| **Infrastructure** | PostgreSQL-backed locking via `JobLock` Prisma model. No external queue (BullMQ) dependency. |
| **Active Blockers** | Entire frontend layer missing; no admin UI for job management; handler registry has no pre-registered handlers |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Scheduler service definition in dev_docs |
| Design Specs | Done | 7 files in `dev_docs/12-Rabih-design-Process/36-scheduler/` |
| Backend -- Jobs | Built | `jobs/jobs.controller.ts` -- 8 endpoints (CRUD + run/pause/resume) |
| Backend -- Executions | Built | `executions/executions.controller.ts` -- 4 endpoints (list, get, cancel, retry) |
| Backend -- Reminders | Built | `reminders/reminders.controller.ts` -- 6 endpoints (CRUD + snooze/dismiss) |
| Backend -- Tasks | Built | `tasks/tasks.controller.ts` -- 4 endpoints (list, get, schedule, cancel) |
| Backend -- Templates | Built | `templates/templates.controller.ts` -- 3 endpoints (list, get, create from template) |
| Backend -- Locking | Built | `locking/lock.service.ts` -- distributed locking via Prisma `JobLock` model |
| Backend -- Retry | Built | `retry/retry.service.ts` -- exponential backoff with jitter, 1h cap |
| Backend -- Handlers | Built | `handlers/handler-registry.ts` -- name-based handler registration and dispatch |
| Backend -- Processors | Built | `processors/job.processor.ts`, `processors/task.processor.ts` |
| Backend -- Job Scheduler | Built | `jobs/job-scheduler.service.ts` -- cron/interval scheduling orchestration |
| Backend -- Job Executor | Built | `executions/job-executor.service.ts` -- execution lifecycle management |
| Prisma Models | Done | `ScheduledJob`, `JobExecution`, `JobLock`, `JobTemplate`, `ScheduledTask`, `Reminder` |
| Frontend Pages | Not Built | No routes exist |
| Frontend Components | Not Built | No scheduler UI components |
| React Hooks | Not Built | No hooks in `lib/hooks/` |
| Tests | Partial | 6+ backend spec files; 0 frontend tests |
| Security | Good | All endpoints: JwtAuthGuard + tenantId filtering via `@CurrentTenant()` |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Scheduler Dashboard | `/scheduler` | Not Built | -- | Job list, execution stats, system health |
| Job Detail | `/scheduler/jobs/:id` | Not Built | -- | Job config, execution history, logs |
| Job Create/Edit | `/scheduler/jobs/new` | Not Built | -- | Form with schedule type, handler, parameters |
| Execution Detail | `/scheduler/jobs/:jobId/executions/:id` | Not Built | -- | Execution result, duration, retry chain |
| Reminders | `/reminders` | Not Built | -- | User reminder list with snooze/dismiss |
| Task Queue | `/scheduler/tasks` | Not Built | -- | One-time scheduled tasks list |
| Templates | `/scheduler/templates` | Not Built | -- | Browse and create jobs from templates |

---

## 4. API Endpoints

### JobsController -- `@Controller('jobs')`

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

### ExecutionsController -- `@Controller('jobs/:jobId/executions')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/jobs/:jobId/executions` | Built | List executions for a job |
| GET | `/api/v1/jobs/:jobId/executions/:executionId` | Built | Get execution detail |
| POST | `/api/v1/jobs/:jobId/executions/:executionId/cancel` | Built | Cancel running execution |
| POST | `/api/v1/jobs/:jobId/executions/:executionId/retry` | Built | Retry failed execution |

### RemindersController -- `@Controller('reminders')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/reminders` | Built | List reminders for current user |
| POST | `/api/v1/reminders` | Built | Create reminder (CreateReminderDto) |
| PUT | `/api/v1/reminders/:id` | Built | Update reminder (UpdateReminderDto) |
| DELETE | `/api/v1/reminders/:id` | Built | Delete reminder |
| POST | `/api/v1/reminders/:id/snooze` | Built | Snooze reminder (SnoozeReminderDto: minutes) |
| POST | `/api/v1/reminders/:id/dismiss` | Built | Dismiss reminder |

### TasksController -- `@Controller('tasks')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/tasks` | Built | List scheduled tasks for tenant |
| GET | `/api/v1/tasks/:id` | Built | Get task by ID |
| POST | `/api/v1/tasks` | Built | Schedule a task (ScheduleTaskDto) |
| DELETE | `/api/v1/tasks/:id` | Built | Cancel/delete scheduled task |

### TemplatesController -- `@Controller('jobs/templates')`

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
| JobsTable | -- | Not Built | No |
| JobForm (create/edit) | -- | Not Built | No |
| ExecutionTimeline | -- | Not Built | No |
| ExecutionDetailCard | -- | Not Built | No |
| ReminderList | -- | Not Built | No |
| ReminderForm | -- | Not Built | No |
| SnoozeDialog | -- | Not Built | No |
| TaskQueue | -- | Not Built | No |
| TemplateCard | -- | Not Built | No |
| CronExpressionBuilder | -- | Not Built | Yes |
| SchedulerHealthIndicator | -- | Not Built | Yes |

No frontend components exist. All are planned based on design specs.

---

## 6. Hooks

| Hook | Endpoints Used | Envelope Unwrapped? | Notes |
|------|---------------|---------------------|-------|
| `useJobs` | GET `/jobs` | -- | Not Built |
| `useJob` | GET `/jobs/:id` | -- | Not Built |
| `useCreateJob` | POST `/jobs` | -- | Not Built |
| `useUpdateJob` | PUT `/jobs/:id` | -- | Not Built |
| `useDeleteJob` | DELETE `/jobs/:id` | -- | Not Built |
| `useRunJob` | POST `/jobs/:id/run` | -- | Not Built |
| `usePauseJob` | POST `/jobs/:id/pause` | -- | Not Built |
| `useResumeJob` | POST `/jobs/:id/resume` | -- | Not Built |
| `useJobExecutions` | GET `/jobs/:jobId/executions` | -- | Not Built |
| `useCancelExecution` | POST `/jobs/:jobId/executions/:id/cancel` | -- | Not Built |
| `useRetryExecution` | POST `/jobs/:jobId/executions/:id/retry` | -- | Not Built |
| `useReminders` | GET `/reminders` | -- | Not Built |
| `useCreateReminder` | POST `/reminders` | -- | Not Built |
| `useSnoozeReminder` | POST `/reminders/:id/snooze` | -- | Not Built |
| `useDismissReminder` | POST `/reminders/:id/dismiss` | -- | Not Built |
| `useScheduledTasks` | GET `/tasks` | -- | Not Built |
| `useScheduleTask` | POST `/tasks` | -- | Not Built |
| `useJobTemplates` | GET `/jobs/templates` | -- | Not Built |
| `useCreateFromTemplate` | POST `/jobs/templates/:code/create` | -- | Not Built |

No hooks exist. All listed above are planned.

---

## 7. Business Rules

1. **Job Types (scope):** Jobs are categorized by `jobType`: `SYSTEM` (platform-level, e.g., data sync, cleanup), `TENANT` (tenant-specific scheduled operations), `USER` (user-created ad-hoc jobs). The type determines visibility and who can manage the job.

2. **Schedule Types:** Four scheduling modes exist via `scheduleType`:
   - `CRON` -- standard cron expression (e.g., `0 2 * * *` for daily at 2 AM). Requires `cronExpression` field.
   - `INTERVAL` -- recurring at fixed intervals. Requires `intervalSeconds` (minimum 60).
   - `ONCE` -- one-time execution at a specific datetime. Requires `runAt` ISO date.
   - `MANUAL` -- no automatic scheduling; only triggered via `POST /jobs/:id/run`.

3. **Execution Tracking with Retry Logic:** Every job run creates a `JobExecution` record tracking status, attempt number, start/end times, duration, and output. On failure, the `RetryService` calculates exponential backoff with jitter (`baseDelay * 2^(attempt-1) + random jitter up to 30%`), capped at 1 hour maximum delay. The `maxRetries` field (0-10) controls how many retry attempts are allowed. Each retry creates a new `JobExecution` linked to the original via `retryOf`. The `willRetry` flag on the failed execution indicates a retry is scheduled.

4. **Distributed Locking (prevent duplicate runs):** The `LockService` uses a database-backed `JobLock` model to prevent concurrent execution of the same job across multiple server instances. Locks have a 5-minute TTL with heartbeat extension. Lock acquisition checks: if a lock exists, is not expired, and belongs to a different worker, acquisition fails. The `heartbeat()` method extends the lock during long-running jobs. Locks are released on completion or can expire naturally if a worker crashes.

5. **Reminder System (configurable triggers):** Reminders are user-scoped and support:
   - Single or recurring reminders (`isRecurring` + `recurrenceRule` cron expression with optional `recurrenceEndDate`)
   - Multi-channel notifications: `in_app`, `email`, `sms` (configurable per reminder via `notificationChannels[]`)
   - Entity linking: `referenceType` + `referenceId` + `referenceUrl` to attach reminders to loads, orders, carriers, etc.
   - Snooze: configurable 5 to 10,080 minutes (7 days max)
   - Dismiss: permanently marks reminder as handled
   - Timezone-aware scheduling via `timezone` field

6. **Job Templates for Common Tasks:** The `JobTemplate` model stores pre-configured job definitions (code, name, handler, default parameters). The `TemplatesService.createFromTemplate()` method merges template defaults with user overrides, applying sensible defaults: `timeoutSeconds: 300`, `maxRetries: 3`, `retryDelaySeconds: 60`, `priority: 5`, `queue: 'default'`, `allowConcurrent: false`, `maxInstances: 1`. Common template use cases: data sync, report generation, cleanup tasks, invoice aging, carrier insurance expiry checks.

7. **Processor Pattern for Job Execution:** Jobs are executed through a two-layer pattern:
   - `HandlerRegistry` -- a name-based registry where handlers are registered at startup. Jobs reference a `handler` string that maps to a registered function. If no handler is found, execution returns null (silent no-op).
   - `JobProcessor` -- retrieves the job definition via `JobsService.get()` then delegates to `JobExecutorService.execute()` which manages the full lifecycle (lock acquire, handler dispatch, status tracking, error handling, lock release).
   - `TaskProcessor` -- simpler processor for one-time scheduled tasks; marks task as `COMPLETED` with `processedAt` and `completedAt` timestamps.

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

### JobExecution
```
JobExecution {
  id              String (UUID, @id @default(uuid()))
  jobId           String (FK -> ScheduledJob)
  tenantId        String (FK -> Tenant)
  status          JobExecutionStatus (enum: PENDING, RUNNING, SUCCESS, FAILED, CANCELLED, TIMED_OUT)
  executionNumber Int
  attemptNumber   Int
  retryOf         String? (FK -> JobExecution, self-referencing)
  willRetry       Boolean (default: false)
  scheduledAt     DateTime?
  startedAt       DateTime?
  completedAt     DateTime?
  duration        Int? (ms)
  output          Json?
  error           String?
  createdById     String? (FK -> User)
  customFields    Json?
  createdAt       DateTime
  updatedAt       DateTime
}
```

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
  id                String (UUID, @id @default(uuid()))
  code              String (unique)
  name              String
  description       String?
  handler           String
  defaultParameters Json?
  createdAt         DateTime
  updatedAt         DateTime
}
```

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
  status        TaskStatus (enum: PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)
  processedAt   DateTime?
  completedAt   DateTime?
  createdById   String? (FK -> User)
  createdAt     DateTime
  updatedAt     DateTime
}
```

### Reminder
```
Reminder {
  id                   String (UUID, @id @default(uuid()))
  tenantId             String (FK -> Tenant)
  userId               String (FK -> User)
  title                String (max 200 chars)
  description          String?
  remindAt             DateTime
  timezone             String?
  referenceType        String?
  referenceId          String?
  referenceUrl         String?
  isRecurring          Boolean (default: false)
  recurrenceRule       String? (cron expression)
  recurrenceEndDate    DateTime?
  notificationChannels String[] (in_app, email, sms)
  status               ReminderStatus (enum: PENDING, SENT, SNOOZED, DISMISSED)
  snoozedUntil         DateTime?
  createdAt            DateTime
  updatedAt            DateTime
}
```

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
SUCCESS    -> Execution completed successfully
FAILED     -> Execution failed (may trigger retry via RetryService)
CANCELLED  -> Execution cancelled by user (POST /executions/:id/cancel)
TIMED_OUT  -> Execution exceeded timeoutSeconds
```

### Task Status
```
PENDING    -> Task scheduled, waiting for scheduledAt
PROCESSING -> Task picked up by TaskProcessor
COMPLETED  -> Task finished (processedAt + completedAt set)
FAILED     -> Task execution failed
CANCELLED  -> Task cancelled (DELETE /tasks/:id)
```

### Reminder Status
```
PENDING    -> Reminder created, waiting for remindAt
SENT       -> Notification delivered via configured channels
SNOOZED    -> User snoozed (POST /reminders/:id/snooze), snoozedUntil set
DISMISSED  -> User dismissed (POST /reminders/:id/dismiss), terminal state
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
| No frontend exists -- entire UI layer missing | P1 | -- | Open |
| HandlerRegistry has no pre-registered handlers at module init | P2 | `handlers/handler-registry.ts` | Open |
| Silent no-op if handler not found (returns null, no error) | P2 | `handlers/handler-registry.ts` line 15 | Open |
| TaskProcessor only marks complete, does not invoke handler | P2 | `processors/task.processor.ts` | Open |
| Lock TTL hardcoded to 5 minutes (not configurable) | P3 | `locking/lock.service.ts` line 8 | Open |
| LockService.acquire() is not atomic (race condition between findUnique and create/update) | P2 | `locking/lock.service.ts` lines 11-28 | Open |
| No hooks -- frontend has zero integration with 25 backend endpoints | P1 | -- | Open |
| UpdateJobDto extends CreateJobDto with all fields required (should be PartialType) | P3 | `dto/job.dto.ts` line 91 | Open |
| No cron expression validation (arbitrary strings accepted) | P2 | `dto/job.dto.ts` line 24 | Open |
| Job scheduling loop (JobSchedulerService) runtime behavior unverified | P2 | `jobs/job-scheduler.service.ts` | Needs verification |

---

## 12. Tasks

### Immediate (Critical Fixes)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SCHED-101 | Fix LockService race condition -- use Prisma upsert or database-level advisory locks | S (2h) | P1 |
| SCHED-102 | Register default handlers in HandlerRegistry at module init (sync, cleanup, report) | M (3h) | P1 |
| SCHED-103 | Fix TaskProcessor to invoke handler via HandlerRegistry instead of just marking complete | S (1h) | P1 |
| SCHED-104 | Add cron expression validation to CreateJobDto (use `cron-parser` library) | S (1h) | P2 |
| SCHED-105 | Fix UpdateJobDto to use `PartialType(CreateJobDto)` from `@nestjs/swagger` | S (30min) | P3 |

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
| SCHED-301 | Verify JobSchedulerService cron/interval loop at runtime | M (3h) | P2 |
| SCHED-302 | Verify retry flow end-to-end (fail -> backoff -> retry -> success) | M (3h) | P2 |
| SCHED-303 | Verify distributed locking works across multiple API instances | M (3h) | P2 |

### Testing
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SCHED-401 | Run existing spec files, verify all pass | S (1h) | P2 |
| SCHED-402 | Write integration tests for job lifecycle (create, run, pause, resume, delete) | M (4h) | P2 |
| SCHED-403 | Write retry service integration tests (exponential backoff, max retries) | S (2h) | P2 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Full spec | `dev_docs/12-Rabih-design-Process/36-scheduler/00-service-overview.md` |
| Scheduler Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/36-scheduler/01-scheduler-dashboard.md` |
| Resource Calendar | Full 15-section | `dev_docs/12-Rabih-design-Process/36-scheduler/02-resource-calendar.md` |
| Appointment Manager | Full 15-section | `dev_docs/12-Rabih-design-Process/36-scheduler/03-appointment-manager.md` |
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

**Summary:** Backend architecture is significantly more mature than originally scoped, with a well-structured sub-module design covering jobs, executions, reminders, tasks, templates, locking, retry, handlers, and processors. However, the D (2/10) health score reflects that zero frontend exists, the handler registry has no registered handlers (meaning jobs cannot actually do anything), and the task processor does not invoke handlers. The service is structurally complete but functionally inert without handler implementations and frontend integration.

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT guard, `@CurrentTenant()`, `@CurrentUser()` decorators on all endpoints)
- Prisma (ScheduledJob, JobExecution, JobLock, JobTemplate, ScheduledTask, Reminder models)
- Communication service (future -- for reminder notification delivery via email/SMS channels)
- Notification service (future -- for in-app reminder delivery)

**Depended on by:**
- Any service needing scheduled operations (accounting invoice aging, carrier insurance expiry, data sync)
- Workflow service (could trigger scheduled workflow steps via job templates)
- Analytics service (could schedule report generation jobs)
- Integration Hub (could schedule periodic data sync with external systems)
- Load Board (could schedule automatic load refresh/expiry checks)

**Sub-module structure:**
```
apps/api/src/modules/scheduler/
  dto/              -- CreateJobDto, UpdateJobDto, CreateReminderDto, UpdateReminderDto, SnoozeReminderDto, ScheduleTaskDto
  executions/       -- ExecutionsController, ExecutionsService, JobExecutorService (+ 2 spec files)
  handlers/         -- HandlerRegistry (name-based handler registration and dispatch)
  jobs/             -- JobsController, JobsService, JobSchedulerService (+ 2 spec files)
  locking/          -- LockService (database-backed distributed locking, + 1 spec file)
  processors/       -- JobProcessor, TaskProcessor (execution orchestrators)
  reminders/        -- RemindersController, RemindersService (+ 1 spec file)
  retry/            -- RetryService (exponential backoff with jitter, + 1 spec file)
  tasks/            -- TasksController, TasksService (+ 1 spec file)
  templates/        -- TemplatesController, TemplatesService (+ 1 spec file)
  scheduler.module.ts -- Root module registering all controllers, providers, exports
```
