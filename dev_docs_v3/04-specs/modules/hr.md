# HR Module API Spec

**Module:** `apps/api/src/modules/hr/`
**Base path:** `/api/v1/`
**Controllers:** EmployeesController, DepartmentsController, PositionsController, LocationsController, TimeOffController, TimeTrackingController
**Auth:** `JwtAuthGuard` + `RolesGuard`
**Scope:** P3 future — not in MVP. Backend scaffolded.

---

## EmployeesController

**Route prefix:** `hr/employees`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/hr/employees` | Create employee |
| GET | `/hr/employees` | List employees |
| GET | `/hr/employees/:id` | Get employee |
| PATCH | `/hr/employees/:id` | Update employee |
| DELETE | `/hr/employees/:id` | Terminate employee |
| PATCH | `/hr/employees/:id/status` | Activate/deactivate |

---

## DepartmentsController

**Route prefix:** `hr/departments`

Standard CRUD: POST, GET, GET/:id, PATCH/:id, DELETE/:id

---

## PositionsController

**Route prefix:** `hr/positions`

Standard CRUD: POST, GET, GET/:id, PATCH/:id, DELETE/:id

---

## TimeOffController

**Route prefix:** `hr/time-off`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/hr/time-off` | Request time off |
| GET | `/hr/time-off` | List requests |
| GET | `/hr/time-off/:id` | Get request |
| POST | `/hr/time-off/:id/approve` | Approve |
| POST | `/hr/time-off/:id/deny` | Deny |
| DELETE | `/hr/time-off/:id` | Cancel request |

---

## TimeTrackingController

**Route prefix:** `hr/time-tracking`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/hr/time-tracking/clock-in` | Clock in |
| POST | `/hr/time-tracking/clock-out` | Clock out |
| GET | `/hr/time-tracking` | List entries |
| GET | `/hr/time-tracking/summary` | Hours summary by period |

---

## Context

The `hr` module handles internal company staff (employees). Note distinction:
- `hr/employees` = internal staff records
- `agents` module = sales agents / independent contractors
- `users` (auth) = system login users

These three are separate entities. An employee may or may not have a system user account.
