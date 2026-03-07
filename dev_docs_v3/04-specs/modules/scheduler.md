# Scheduler Module API Spec

**Module:** `apps/api/src/modules/scheduler/`
**Base path:** `/api/v1/`
**Controllers:** JobsController, TasksController, ExecutionsController, TemplatesController, RemindersController
**Auth:** `JwtAuthGuard` + `RolesGuard`
**Scope:** Infrastructure module — partially active for recurring reports and check-call reminders.

---

## JobsController

**Route prefix:** `scheduler/jobs`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/scheduler/jobs` | Create scheduled job |
| GET | `/scheduler/jobs` | List jobs |
| GET | `/scheduler/jobs/:id` | Get job |
| PATCH | `/scheduler/jobs/:id` | Update job schedule |
| DELETE | `/scheduler/jobs/:id` | Delete job |
| POST | `/scheduler/jobs/:id/enable` | Enable job |
| POST | `/scheduler/jobs/:id/disable` | Disable job |
| POST | `/scheduler/jobs/:id/run-now` | Trigger immediate run |

Jobs use standard cron format: `"0 8 * * 1-5"` (weekdays at 8am).

---

## TasksController

**Route prefix:** `scheduler/tasks`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/scheduler/tasks` | List one-time scheduled tasks |
| GET | `/scheduler/tasks/:id` | Get task |
| DELETE | `/scheduler/tasks/:id` | Cancel task |

---

## ExecutionsController

**Route prefix:** `scheduler/executions`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/scheduler/executions` | List execution history |
| GET | `/scheduler/executions/:id` | Get execution result |
| POST | `/scheduler/executions/:id/retry` | Retry failed execution |

---

## TemplatesController (scheduler)

**Route prefix:** `scheduler/templates`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/scheduler/templates` | List job templates |
| POST | `/scheduler/templates/:key/activate` | Create job from template |

---

## RemindersController

**Route prefix:** `scheduler/reminders`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/scheduler/reminders` | Create reminder (linked to entity) |
| GET | `/scheduler/reminders` | List reminders |
| DELETE | `/scheduler/reminders/:id` | Delete reminder |

---

## Internal architecture

- `handlers/` — job handler implementations (one per job type)
- `processors/` — job queue processors (Bull/BullMQ pattern)
- `locking/` — distributed lock to prevent duplicate job runs across instances
- `retry/` — retry strategies for failed jobs

---

## Active scheduled jobs (estimated)

| Job | Schedule | Description |
|-----|----------|-------------|
| Invoice aging update | Daily 2am | Recalculate invoice aging buckets |
| Check-call reminder | Per-load | Alert dispatcher if no check-call for 4h |
| Carrier insurance check | Weekly Mon 6am | Flag expiring certificates |
| Load board expiration | Hourly | Remove expired load postings |
| Rate cache warm | Daily 3am | Pre-cache common lane rates |
