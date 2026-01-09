# 24 - Scheduler Service

| Field            | Value                |
| ---------------- | -------------------- |
| **Service ID**   | 24                   |
| **Service Name** | Scheduler            |
| **Category**     | Platform             |
| **Module Path**  | `@modules/scheduler` |
| **Phase**        | B (Enhancement)      |
| **Weeks**        | 49-50                |
| **Priority**     | P2                   |
| **Dependencies** | Auth, Config         |

---

## Purpose

Enterprise job scheduling service managing recurring tasks, one-time scheduled jobs, reminders, and automated workflows. Handles batch processing, report generation, data synchronization, and time-based triggers with distributed execution support.

---

## Features

- **Cron Scheduling** - Flexible cron-based recurring jobs
- **One-Time Jobs** - Schedule future execution
- **Reminders** - User and system reminders
- **Job Dependencies** - Chain jobs with dependencies
- **Distributed Execution** - Scale across multiple workers
- **Retry Logic** - Automatic retry with backoff
- **Job History** - Complete execution history
- **Priority Queue** - Prioritize critical jobs
- **Timezone Support** - Schedule in user's timezone
- **Monitoring** - Real-time job status monitoring
- **Alerting** - Notify on job failures
- **Pause/Resume** - Control job execution

---

## Database Schema

```sql
-- Job Definitions
CREATE TABLE scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),   -- NULL for system jobs

    -- Job Identity
    code VARCHAR(100) NOT NULL,              -- Unique identifier
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Job Type
    job_type VARCHAR(50) NOT NULL,           -- SYSTEM, TENANT, USER
    handler VARCHAR(200) NOT NULL,           -- Function/service to execute

    -- Schedule
    schedule_type VARCHAR(20) NOT NULL,      -- CRON, INTERVAL, ONCE, MANUAL
    cron_expression VARCHAR(100),            -- For CRON type
    interval_seconds INTEGER,                -- For INTERVAL type
    run_at TIMESTAMPTZ,                      -- For ONCE type
    timezone VARCHAR(50) DEFAULT 'UTC',

    -- Execution
    parameters JSONB DEFAULT '{}',           -- Job parameters
    timeout_seconds INTEGER DEFAULT 300,
    max_retries INTEGER DEFAULT 3,
    retry_delay_seconds INTEGER DEFAULT 60,

    -- Priority
    priority INTEGER DEFAULT 5,              -- 1=highest, 10=lowest
    queue VARCHAR(50) DEFAULT 'default',     -- Job queue name

    -- Concurrency
    allow_concurrent BOOLEAN DEFAULT false,
    max_instances INTEGER DEFAULT 1,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',     -- ACTIVE, PAUSED, DISABLED
    is_enabled BOOLEAN DEFAULT true,

    -- Tracking
    last_run_at TIMESTAMPTZ,
    last_run_status VARCHAR(20),
    last_run_duration_ms INTEGER,
    next_run_at TIMESTAMPTZ,
    run_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,

    -- Migration Support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_scheduled_jobs_tenant ON scheduled_jobs(tenant_id);
CREATE INDEX idx_scheduled_jobs_next_run ON scheduled_jobs(next_run_at) WHERE status = 'ACTIVE';
CREATE INDEX idx_scheduled_jobs_queue ON scheduled_jobs(queue, priority);

-- Job Executions
CREATE TABLE job_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES scheduled_jobs(id),
    tenant_id UUID REFERENCES tenants(id),

    -- Execution Details
    execution_number INTEGER NOT NULL,
    attempt_number INTEGER DEFAULT 1,

    -- Timing
    scheduled_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,

    -- Worker
    worker_id VARCHAR(100),
    worker_hostname VARCHAR(200),

    -- Parameters
    parameters JSONB,

    -- Result
    status VARCHAR(20) NOT NULL,             -- PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, TIMEOUT
    result JSONB,
    error_message TEXT,
    error_stack TEXT,

    -- Progress
    progress_percent INTEGER DEFAULT 0,
    progress_message TEXT,

    -- Retry
    retry_of UUID REFERENCES job_executions(id),
    will_retry BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_executions_job ON job_executions(job_id, created_at DESC);
CREATE INDEX idx_job_executions_status ON job_executions(status, scheduled_at);
CREATE INDEX idx_job_executions_tenant ON job_executions(tenant_id, created_at DESC);

-- One-Time Scheduled Tasks
CREATE TABLE scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Task Identity
    task_type VARCHAR(50) NOT NULL,          -- EMAIL, REMINDER, REPORT, WEBHOOK, etc.
    reference_type VARCHAR(50),              -- Entity type if applicable
    reference_id UUID,                       -- Entity ID if applicable

    -- Schedule
    scheduled_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',

    -- Payload
    payload JSONB NOT NULL,                  -- Task-specific data

    -- Execution
    handler VARCHAR(200) NOT NULL,
    priority INTEGER DEFAULT 5,
    timeout_seconds INTEGER DEFAULT 60,

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',    -- PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
    processed_at TIMESTAMPTZ,
    error_message TEXT,

    -- Actor
    created_by UUID REFERENCES users(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_tasks_tenant ON scheduled_tasks(tenant_id);
CREATE INDEX idx_scheduled_tasks_due ON scheduled_tasks(scheduled_at, status) WHERE status = 'PENDING';
CREATE INDEX idx_scheduled_tasks_reference ON scheduled_tasks(reference_type, reference_id);

-- Reminders
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Reminder Details
    title VARCHAR(200) NOT NULL,
    description TEXT,

    -- Reference
    reference_type VARCHAR(50),              -- Order, Load, Contact, etc.
    reference_id UUID,
    reference_url VARCHAR(500),              -- Deep link

    -- Schedule
    remind_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50),

    -- Recurrence
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule VARCHAR(200),            -- iCal RRULE format
    recurrence_end_date DATE,

    -- Notification
    notification_channels JSONB DEFAULT '["in_app"]', -- in_app, email, sms

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',    -- PENDING, SENT, SNOOZED, DISMISSED, COMPLETED
    snoozed_until TIMESTAMPTZ,
    snooze_count INTEGER DEFAULT 0,

    -- Tracking
    sent_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_user ON reminders(user_id, status);
CREATE INDEX idx_reminders_due ON reminders(remind_at, status) WHERE status IN ('PENDING', 'SNOOZED');
CREATE INDEX idx_reminders_reference ON reminders(reference_type, reference_id);

-- Job Dependencies
CREATE TABLE job_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES scheduled_jobs(id),
    depends_on_job_id UUID NOT NULL REFERENCES scheduled_jobs(id),

    -- Dependency Type
    dependency_type VARCHAR(20) DEFAULT 'SUCCESS', -- SUCCESS, COMPLETE, START

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(job_id, depends_on_job_id)
);

-- Job Locks (for distributed execution)
CREATE TABLE job_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES scheduled_jobs(id) UNIQUE,

    -- Lock Details
    worker_id VARCHAR(100) NOT NULL,
    locked_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,

    -- Heartbeat
    last_heartbeat TIMESTAMPTZ
);

CREATE INDEX idx_job_locks_expires ON job_locks(expires_at);

-- Cron Job Templates
CREATE TABLE job_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template Identity
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),

    -- Template
    handler VARCHAR(200) NOT NULL,
    default_schedule VARCHAR(100),
    default_parameters JSONB DEFAULT '{}',

    -- Configuration
    is_system_required BOOLEAN DEFAULT false, -- Cannot be disabled
    is_tenant_configurable BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Alerts
CREATE TABLE job_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES scheduled_jobs(id),

    -- Alert Condition
    alert_type VARCHAR(50) NOT NULL,         -- FAILURE, TIMEOUT, LONG_RUNNING, MISSED
    threshold_value INTEGER,                 -- e.g., consecutive failures

    -- Notification
    notification_channels JSONB NOT NULL,
    recipients JSONB NOT NULL,

    -- Status
    is_enabled BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## System Jobs

### Data Maintenance

| Job                        | Schedule       | Description                      |
| -------------------------- | -------------- | -------------------------------- |
| `cleanup_expired_sessions` | Daily 2am      | Remove expired user sessions     |
| `archive_old_audit_logs`   | Daily 3am      | Archive audit logs per retention |
| `cleanup_temp_files`       | Daily 4am      | Remove temporary files           |
| `optimize_search_indexes`  | Weekly Sun 3am | Optimize Elasticsearch           |
| `vacuum_database`          | Weekly Sun 4am | PostgreSQL maintenance           |

### Business Operations

| Job                        | Schedule  | Description                       |
| -------------------------- | --------- | --------------------------------- |
| `check_expiring_documents` | Daily 6am | Alert on expiring insurance, etc. |
| `send_invoice_reminders`   | Daily 8am | Remind overdue invoices           |
| `calculate_carrier_scores` | Daily 5am | Update carrier scorecards         |
| `sync_fmcsa_data`          | Daily 1am | Update carrier safety data        |
| `process_recurring_orders` | Daily 6am | Create orders from templates      |

### Integrations

| Job                    | Schedule    | Description                  |
| ---------------------- | ----------- | ---------------------------- |
| `sync_quickbooks`      | Every 15min | Sync with QuickBooks         |
| `fetch_fuel_prices`    | Daily 6am   | Update fuel surcharge tables |
| `refresh_dat_rates`    | Hourly      | Update market rate data      |
| `post_loads_to_boards` | Every 5min  | Sync load board postings     |

### Reports

| Job                      | Schedule     | Description               |
| ------------------------ | ------------ | ------------------------- |
| `generate_daily_summary` | Daily 6am    | Email daily metrics       |
| `generate_weekly_report` | Mon 7am      | Weekly performance report |
| `generate_monthly_close` | 1st of month | Monthly financial summary |

---

## API Endpoints

### Job Management

| Method | Endpoint                                | Description            |
| ------ | --------------------------------------- | ---------------------- |
| GET    | `/api/v1/scheduler/jobs`                | List all jobs          |
| POST   | `/api/v1/scheduler/jobs`                | Create job             |
| GET    | `/api/v1/scheduler/jobs/:id`            | Get job details        |
| PUT    | `/api/v1/scheduler/jobs/:id`            | Update job             |
| DELETE | `/api/v1/scheduler/jobs/:id`            | Delete job             |
| POST   | `/api/v1/scheduler/jobs/:id/run`        | Trigger immediate run  |
| POST   | `/api/v1/scheduler/jobs/:id/pause`      | Pause job              |
| POST   | `/api/v1/scheduler/jobs/:id/resume`     | Resume job             |
| GET    | `/api/v1/scheduler/jobs/:id/executions` | Get execution history  |
| GET    | `/api/v1/scheduler/jobs/:id/next-runs`  | Preview next run times |

### Scheduled Tasks

| Method | Endpoint                                 | Description          |
| ------ | ---------------------------------------- | -------------------- |
| GET    | `/api/v1/scheduler/tasks`                | List scheduled tasks |
| POST   | `/api/v1/scheduler/tasks`                | Create task          |
| GET    | `/api/v1/scheduler/tasks/:id`            | Get task details     |
| DELETE | `/api/v1/scheduler/tasks/:id`            | Cancel task          |
| PUT    | `/api/v1/scheduler/tasks/:id/reschedule` | Reschedule task      |

### Reminders

| Method | Endpoint                                   | Description            |
| ------ | ------------------------------------------ | ---------------------- |
| GET    | `/api/v1/scheduler/reminders`              | List my reminders      |
| POST   | `/api/v1/scheduler/reminders`              | Create reminder        |
| GET    | `/api/v1/scheduler/reminders/:id`          | Get reminder           |
| PUT    | `/api/v1/scheduler/reminders/:id`          | Update reminder        |
| DELETE | `/api/v1/scheduler/reminders/:id`          | Delete reminder        |
| POST   | `/api/v1/scheduler/reminders/:id/snooze`   | Snooze reminder        |
| POST   | `/api/v1/scheduler/reminders/:id/dismiss`  | Dismiss reminder       |
| POST   | `/api/v1/scheduler/reminders/:id/complete` | Mark complete          |
| GET    | `/api/v1/scheduler/reminders/upcoming`     | Get upcoming reminders |

### Monitoring

| Method | Endpoint                                  | Description          |
| ------ | ----------------------------------------- | -------------------- |
| GET    | `/api/v1/scheduler/status`                | Get scheduler status |
| GET    | `/api/v1/scheduler/queue`                 | View job queue       |
| GET    | `/api/v1/scheduler/workers`               | List active workers  |
| GET    | `/api/v1/scheduler/executions`            | Recent executions    |
| GET    | `/api/v1/scheduler/executions/:id`        | Execution details    |
| POST   | `/api/v1/scheduler/executions/:id/cancel` | Cancel running job   |
| POST   | `/api/v1/scheduler/executions/:id/retry`  | Retry failed job     |

### Templates

| Method | Endpoint                                       | Description              |
| ------ | ---------------------------------------------- | ------------------------ |
| GET    | `/api/v1/scheduler/templates`                  | List job templates       |
| POST   | `/api/v1/scheduler/templates/:code/create-job` | Create job from template |

---

## Events

### Published Events

| Event           | Trigger                    | Payload          |
| --------------- | -------------------------- | ---------------- |
| `job.scheduled` | Job created/updated        | Job details      |
| `job.started`   | Execution started          | Execution ID     |
| `job.completed` | Execution succeeded        | Result           |
| `job.failed`    | Execution failed           | Error details    |
| `job.timeout`   | Execution timed out        | Job ID           |
| `reminder.due`  | Reminder time reached      | Reminder details |
| `reminder.sent` | Reminder notification sent | Reminder ID      |
| `task.executed` | Scheduled task ran         | Task details     |

### Subscribed Events

| Event               | Action                        |
| ------------------- | ----------------------------- |
| `order.created`     | Schedule follow-up reminders  |
| `load.dispatched`   | Schedule check-call reminders |
| `invoice.generated` | Schedule payment reminder     |
| `document.expiring` | Create renewal reminder       |

---

## Business Rules

### Job Execution

1. **Lock Before Run**: Acquire lock before executing
2. **Heartbeat**: Workers send heartbeat every 30 seconds
3. **Timeout**: Kill job if exceeds timeout
4. **Retry**: Exponential backoff (60s, 120s, 240s)
5. **Max Retries**: Stop after configured attempts
6. **Concurrent Limit**: Respect max_instances per job

### Scheduling

1. **Cron Precision**: Minimum 1 minute resolution
2. **Timezone**: Execute in configured timezone
3. **Skip Missed**: Option to skip if prior run missed
4. **Jitter**: Add random delay to prevent thundering herd
5. **Dependencies**: Wait for dependent jobs to complete

### Reminders

1. **Snooze Options**: 15min, 1hr, 4hr, 1day, 1week
2. **Max Snoozes**: 5 times before auto-dismiss
3. **Notification Channels**: Based on user preferences
4. **Recurrence**: Follow iCal RRULE standard

### Distributed Execution

1. **Leader Election**: Single leader for scheduling
2. **Worker Pool**: Jobs distributed across workers
3. **Rebalancing**: Redistribute on worker failure
4. **Lock Expiry**: Release locks after 5 minutes no heartbeat

---

## Screens

| Screen               | Description                       |
| -------------------- | --------------------------------- |
| Job Dashboard        | Overview of all scheduled jobs    |
| Job Detail           | Individual job config and history |
| Execution Log        | View execution history            |
| Active Executions    | Monitor running jobs              |
| My Reminders         | User's reminders list             |
| Reminder Create/Edit | Create or edit reminder           |
| System Jobs          | Admin system job management       |

---

## Configuration

### Environment Variables

```bash
# Scheduler
SCHEDULER_ENABLED=true
SCHEDULER_POLL_INTERVAL_MS=1000
SCHEDULER_BATCH_SIZE=100

# Workers
SCHEDULER_WORKER_COUNT=4
SCHEDULER_WORKER_ID=worker-1

# Locks
SCHEDULER_LOCK_TTL_SECONDS=300
SCHEDULER_HEARTBEAT_INTERVAL_MS=30000

# Retries
SCHEDULER_DEFAULT_MAX_RETRIES=3
SCHEDULER_DEFAULT_RETRY_DELAY_SECONDS=60

# Queues
SCHEDULER_QUEUES=default,priority,batch
SCHEDULER_QUEUE_WEIGHTS=1,2,1

# Reminders
REMINDER_DEFAULT_SNOOZE_MINUTES=60
REMINDER_MAX_SNOOZE_COUNT=5
```

---

## Testing Checklist

### Unit Tests

- [ ] Cron expression parsing
- [ ] Next run time calculation
- [ ] Timezone conversion
- [ ] Retry delay calculation
- [ ] Dependency resolution
- [ ] Lock acquisition/release

### Integration Tests

- [ ] Job execution flow
- [ ] Distributed locking
- [ ] Worker coordination
- [ ] Reminder notifications
- [ ] Task processing

### E2E Tests

- [ ] Create and execute job
- [ ] Reminder creation and delivery
- [ ] Job failure and retry
- [ ] Manual job trigger
- [ ] Job pause/resume

---

## Navigation

- **Previous:** [23 - Config](../23-config/README.md)
- **Next:** [25 - Cache](../25-cache/README.md)
- **Index:** [All Services](../README.md)
