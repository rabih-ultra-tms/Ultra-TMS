# 20 - Scheduler Service API Implementation

> **Service:** Scheduler  
> **Priority:** P2 - Medium  
> **Endpoints:** 25  
> **Dependencies:** Auth ✅, Config ✅  
> **Doc Reference:** [31-service-scheduler.md](../../02-services/31-service-scheduler.md)

---

## 📋 Overview

Enterprise job scheduling service managing recurring tasks, one-time scheduled jobs, reminders, and automated workflows. Handles batch processing, report generation, data synchronization, and time-based triggers with distributed execution support.

### Key Capabilities
- Cron-based recurring jobs
- One-time scheduled tasks
- User reminders
- Job dependencies and chaining
- Distributed execution with locking
- Retry logic with backoff

---

## ✅ Pre-Implementation Checklist

- [ ] Auth and Config services operational
- [ ] Database models exist in `schema.prisma`
- [ ] Redis for distributed locking
- [ ] Bull queue for job processing

---

## 🗄️ Database Models Reference

### ScheduledJob Model
```prisma
model ScheduledJob {
  id                String            @id @default(cuid())
  tenantId          String?           // NULL for system jobs
  
  code              String
  name              String
  description       String?           @db.Text
  
  jobType           String            // SYSTEM, TENANT, USER
  handler           String
  
  scheduleType      String            // CRON, INTERVAL, ONCE, MANUAL
  cronExpression    String?
  intervalSeconds   Int?
  runAt             DateTime?
  timezone          String            @default("UTC")
  
  parameters        Json              @default("{}")
  timeoutSeconds    Int               @default(300)
  maxRetries        Int               @default(3)
  retryDelaySeconds Int               @default(60)
  
  priority          Int               @default(5)
  queue             String            @default("default")
  
  allowConcurrent   Boolean           @default(false)
  maxInstances      Int               @default(1)
  
  status            String            @default("ACTIVE")  // ACTIVE, PAUSED, DISABLED
  isEnabled         Boolean           @default(true)
  
  lastRunAt         DateTime?
  lastRunStatus     String?
  lastRunDurationMs Int?
  nextRunAt         DateTime?
  runCount          Int               @default(0)
  failureCount      Int               @default(0)
  
  externalId        String?
  sourceSystem      String?
  
  createdBy         String?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  executions        JobExecution[]
  dependencies      JobDependency[]   @relation("JobDependencies")
  dependents        JobDependency[]   @relation("DependentJobs")
  alerts            JobAlert[]
  
  @@unique([tenantId, code])
  @@index([tenantId])
  @@index([nextRunAt])
  @@index([queue, priority])
}
```

### JobExecution Model
```prisma
model JobExecution {
  id                String            @id @default(cuid())
  jobId             String
  tenantId          String?
  
  executionNumber   Int
  attemptNumber     Int               @default(1)
  
  scheduledAt       DateTime
  startedAt         DateTime?
  completedAt       DateTime?
  durationMs        Int?
  
  workerId          String?
  workerHostname    String?
  
  parameters        Json?
  
  status            String            // PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, TIMEOUT
  result            Json?
  errorMessage      String?           @db.Text
  errorStack        String?           @db.Text
  
  progressPercent   Int               @default(0)
  progressMessage   String?
  
  retryOf           String?
  willRetry         Boolean           @default(false)
  
  createdAt         DateTime          @default(now())
  
  job               ScheduledJob      @relation(fields: [jobId], references: [id])
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  
  @@index([jobId, createdAt])
  @@index([status, scheduledAt])
  @@index([tenantId, createdAt])
}
```

### ScheduledTask Model
```prisma
model ScheduledTask {
  id                String            @id @default(cuid())
  tenantId          String
  
  taskType          String            // EMAIL, REMINDER, REPORT, WEBHOOK
  referenceType     String?
  referenceId       String?
  
  scheduledAt       DateTime
  timezone          String            @default("UTC")
  
  payload           Json
  
  handler           String
  priority          Int               @default(5)
  timeoutSeconds    Int               @default(60)
  
  status            String            @default("PENDING")  // PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
  processedAt       DateTime?
  errorMessage      String?           @db.Text
  
  createdBy         String?
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
  @@index([scheduledAt, status])
  @@index([referenceType, referenceId])
}
```

### Reminder Model
```prisma
model Reminder {
  id                String            @id @default(cuid())
  tenantId          String
  userId            String
  
  title             String
  description       String?           @db.Text
  
  referenceType     String?
  referenceId       String?
  referenceUrl      String?
  
  remindAt          DateTime
  timezone          String?
  
  isRecurring       Boolean           @default(false)
  recurrenceRule    String?           // iCal RRULE format
  recurrenceEndDate DateTime?
  
  notificationChannels Json           @default("[\"in_app\"]")
  
  status            String            @default("PENDING")  // PENDING, SENT, SNOOZED, DISMISSED, COMPLETED
  snoozedUntil      DateTime?
  snoozeCount       Int               @default(0)
  
  sentAt            DateTime?
  dismissedAt       DateTime?
  completedAt       DateTime?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  user              User              @relation(fields: [userId], references: [id])
  
  @@index([userId, status])
  @@index([remindAt, status])
  @@index([referenceType, referenceId])
}
```

### JobDependency Model
```prisma
model JobDependency {
  id                String            @id @default(cuid())
  jobId             String
  dependsOnJobId    String
  
  dependencyType    String            @default("SUCCESS")  // SUCCESS, COMPLETE, START
  
  createdAt         DateTime          @default(now())
  
  job               ScheduledJob      @relation("JobDependencies", fields: [jobId], references: [id])
  dependsOnJob      ScheduledJob      @relation("DependentJobs", fields: [dependsOnJobId], references: [id])
  
  @@unique([jobId, dependsOnJobId])
}
```

### JobLock Model
```prisma
model JobLock {
  id                String            @id @default(cuid())
  jobId             String            @unique
  
  workerId          String
  lockedAt          DateTime
  expiresAt         DateTime
  
  lastHeartbeat     DateTime?
  
  job               ScheduledJob      @relation(fields: [jobId], references: [id])
  
  @@index([expiresAt])
}
```

### JobTemplate Model
```prisma
model JobTemplate {
  id                String            @id @default(cuid())
  
  code              String            @unique
  name              String
  description       String?           @db.Text
  category          String?
  
  handler           String
  defaultSchedule   String?
  defaultParameters Json              @default("{}")
  
  isSystemRequired  Boolean           @default(false)
  isTenantConfigurable Boolean        @default(true)
  
  createdAt         DateTime          @default(now())
}
```

### JobAlert Model
```prisma
model JobAlert {
  id                String            @id @default(cuid())
  jobId             String
  
  alertType         String            // FAILURE, TIMEOUT, LONG_RUNNING, MISSED
  thresholdValue    Int?
  
  notificationChannels Json
  recipients        Json
  
  isEnabled         Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  
  job               ScheduledJob      @relation(fields: [jobId], references: [id])
}
```

---

## 🛠️ API Endpoints

### Job Management (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/jobs` | List jobs |
| GET | `/api/v1/jobs/:id` | Get job |
| POST | `/api/v1/jobs` | Create job |
| PUT | `/api/v1/jobs/:id` | Update job |
| DELETE | `/api/v1/jobs/:id` | Delete job |
| POST | `/api/v1/jobs/:id/run` | Run now |
| POST | `/api/v1/jobs/:id/pause` | Pause job |
| POST | `/api/v1/jobs/:id/resume` | Resume job |

### Job Executions (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/jobs/:id/executions` | List executions |
| GET | `/api/v1/jobs/:id/executions/:executionId` | Get execution |
| POST | `/api/v1/jobs/:id/executions/:executionId/cancel` | Cancel |
| POST | `/api/v1/jobs/:id/executions/:executionId/retry` | Retry |

### Scheduled Tasks (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | List tasks |
| POST | `/api/v1/tasks` | Schedule task |
| DELETE | `/api/v1/tasks/:id` | Cancel task |
| GET | `/api/v1/tasks/:id` | Get task |

### Reminders (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reminders` | List my reminders |
| POST | `/api/v1/reminders` | Create reminder |
| PUT | `/api/v1/reminders/:id` | Update reminder |
| DELETE | `/api/v1/reminders/:id` | Delete reminder |
| POST | `/api/v1/reminders/:id/snooze` | Snooze |
| POST | `/api/v1/reminders/:id/dismiss` | Dismiss |

### Templates (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/jobs/templates` | List templates |
| GET | `/api/v1/jobs/templates/:code` | Get template |
| POST | `/api/v1/jobs/templates/:code/create` | Create from template |

---

## 📝 DTO Specifications

### CreateJobDto
```typescript
export class CreateJobDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['CRON', 'INTERVAL', 'ONCE', 'MANUAL'])
  scheduleType: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.scheduleType === 'CRON')
  cronExpression?: string;

  @IsOptional()
  @IsInt()
  @Min(60)
  @ValidateIf((o) => o.scheduleType === 'INTERVAL')
  intervalSeconds?: number;

  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.scheduleType === 'ONCE')
  runAt?: string;

  @IsString()
  handler: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(3600)
  timeoutSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  maxRetries?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number;

  @IsOptional()
  @IsString()
  queue?: string;

  @IsOptional()
  @IsBoolean()
  allowConcurrent?: boolean;
}
```

### ScheduleTaskDto
```typescript
export class ScheduleTaskDto {
  @IsString()
  taskType: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsObject()
  payload: Record<string, any>;

  @IsString()
  handler: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number;
}
```

### CreateReminderDto
```typescript
export class CreateReminderDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  remindAt: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  referenceUrl?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.isRecurring)
  recurrenceRule?: string;

  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string;

  @IsOptional()
  @IsArray()
  @IsIn(['in_app', 'email', 'sms'], { each: true })
  notificationChannels?: string[];
}
```

### SnoozeReminderDto
```typescript
export class SnoozeReminderDto {
  @IsInt()
  @Min(5)
  @Max(10080)  // Max 1 week in minutes
  minutes: number;
}
```

---

## 📋 Business Rules

### Cron Parsing and Scheduling
```typescript
import * as cronParser from 'cron-parser';

class JobScheduler {
  calculateNextRun(job: ScheduledJob): Date | null {
    if (job.scheduleType === 'CRON') {
      const interval = cronParser.parseExpression(job.cronExpression, {
        tz: job.timezone
      });
      return interval.next().toDate();
    }
    
    if (job.scheduleType === 'INTERVAL') {
      return new Date(Date.now() + job.intervalSeconds * 1000);
    }
    
    if (job.scheduleType === 'ONCE') {
      return job.runAt > new Date() ? job.runAt : null;
    }
    
    return null;  // MANUAL
  }
}
```

### Distributed Locking
```typescript
class JobLockService {
  async acquireLock(jobId: string, workerId: string): Promise<boolean> {
    const lockDuration = 5 * 60 * 1000; // 5 minutes
    
    try {
      await this.prisma.jobLock.create({
        data: {
          jobId,
          workerId,
          lockedAt: new Date(),
          expiresAt: new Date(Date.now() + lockDuration),
          lastHeartbeat: new Date()
        }
      });
      return true;
    } catch (e) {
      // Lock exists, check if expired
      const existing = await this.prisma.jobLock.findUnique({ 
        where: { jobId } 
      });
      
      if (existing && existing.expiresAt < new Date()) {
        // Expired, take over
        await this.prisma.jobLock.update({
          where: { jobId },
          data: {
            workerId,
            lockedAt: new Date(),
            expiresAt: new Date(Date.now() + lockDuration)
          }
        });
        return true;
      }
      return false;
    }
  }
  
  async releaseLock(jobId: string, workerId: string): Promise<void> {
    await this.prisma.jobLock.deleteMany({
      where: { jobId, workerId }
    });
  }
  
  async heartbeat(jobId: string, workerId: string): Promise<void> {
    await this.prisma.jobLock.updateMany({
      where: { jobId, workerId },
      data: { 
        lastHeartbeat: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      }
    });
  }
}
```

### Retry with Backoff
```typescript
class RetryStrategy {
  calculateDelay(attempt: number, baseDelay: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.3 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, 3600000); // Max 1 hour
  }
  
  async scheduleRetry(
    execution: JobExecution, 
    job: ScheduledJob
  ): Promise<void> {
    if (execution.attemptNumber >= job.maxRetries) {
      return; // Max retries reached
    }
    
    const delay = this.calculateDelay(
      execution.attemptNumber, 
      job.retryDelaySeconds * 1000
    );
    
    await this.prisma.jobExecution.create({
      data: {
        jobId: job.id,
        tenantId: job.tenantId,
        executionNumber: execution.executionNumber,
        attemptNumber: execution.attemptNumber + 1,
        scheduledAt: new Date(Date.now() + delay),
        status: 'PENDING',
        retryOf: execution.id
      }
    });
    
    await this.prisma.jobExecution.update({
      where: { id: execution.id },
      data: { willRetry: true }
    });
  }
}
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `job.created` | Job created | `{ jobId }` |
| `job.started` | Execution started | `{ jobId, executionId }` |
| `job.completed` | Execution done | `{ jobId, executionId, result }` |
| `job.failed` | Execution failed | `{ jobId, executionId, error }` |
| `job.paused` | Job paused | `{ jobId }` |
| `reminder.due` | Reminder time | `{ reminderId, userId }` |
| `reminder.sent` | Reminder sent | `{ reminderId }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `*.export.requested` | Various | Schedule export task |
| `report.schedule.created` | Analytics | Create scheduled job |

---

## 🧪 Integration Test Requirements

```typescript
describe('Scheduler Service API', () => {
  describe('Job Management', () => {
    it('should create cron job');
    it('should create interval job');
    it('should run job manually');
    it('should pause and resume job');
  });

  describe('Job Execution', () => {
    it('should execute job at scheduled time');
    it('should retry on failure');
    it('should respect max retries');
    it('should track execution history');
  });

  describe('Distributed Locking', () => {
    it('should prevent concurrent execution');
    it('should release lock on completion');
    it('should take over expired lock');
  });

  describe('Scheduled Tasks', () => {
    it('should execute one-time task');
    it('should cancel pending task');
  });

  describe('Reminders', () => {
    it('should send reminder at time');
    it('should snooze reminder');
    it('should handle recurring reminder');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/scheduler/
├── scheduler.module.ts
├── jobs/
│   ├── jobs.controller.ts
│   ├── jobs.service.ts
│   └── job-scheduler.service.ts
├── executions/
│   ├── executions.controller.ts
│   ├── executions.service.ts
│   └── job-executor.service.ts
├── tasks/
│   ├── tasks.controller.ts
│   └── tasks.service.ts
├── reminders/
│   ├── reminders.controller.ts
│   └── reminders.service.ts
├── templates/
│   ├── templates.controller.ts
│   └── templates.service.ts
├── locking/
│   └── lock.service.ts
├── retry/
│   └── retry.service.ts
├── handlers/
│   └── handler-registry.ts
└── processors/
    ├── job.processor.ts
    └── task.processor.ts
```

---

## ✅ Completion Checklist

- [ ] All 25 endpoints implemented
- [ ] Cron scheduling working
- [ ] Interval scheduling working
- [ ] One-time tasks working
- [ ] Distributed locking
- [ ] Retry with backoff
- [ ] Job dependencies
- [ ] Reminder CRUD and notifications
- [ ] Job templates
- [ ] All integration tests passing
- [ ] Worker process configured

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>33</td>
    <td>Scheduler</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>25/25</td>
    <td>4/4</td>
    <td>100%</td>
    <td>Jobs, Executions, Tasks, Reminders</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[21-cache-api.md](./21-cache-api.md)** - Implement Cache Service API
