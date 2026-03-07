# Audit Module API Spec

**Module:** `apps/api/src/modules/audit/`
**Base path:** `/api/v1/`
**Controllers:** AuditController, UserActivityController, AlertsController, ApiAuditController, ComplianceController, ChangeHistoryController, AuditLogsController, RetentionController

## Auth

All controllers use `@UseGuards(JwtAuthGuard)` with `@CurrentTenant()`. Most do not use RolesGuard -- accessible to any authenticated user.

---

## AuditController

**Path prefix:** `audit`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/audit/entity/:entityType/:entityId` | JWT only | Get entity audit history |
| GET | `/audit/api-calls` | JWT only | List API call audit records |
| GET | `/audit/compliance-report` | JWT only | Get compliance report |
| GET | `/audit/user-activity/:userId` | JWT only | Get user activity report |
| POST | `/audit/search` | JWT only | Advanced audit search |

---

## UserActivityController

**Path prefix:** `audit/activity`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/audit/activity` | JWT only | List user activity |
| GET | `/audit/activity/login-audits` | JWT only | List login audits |
| GET | `/audit/activity/access-log` | JWT only | List access logs |
| GET | `/audit/activity/:userId` | JWT only | Get user activity detail |

---

## AlertsController (Audit)

**Path prefix:** `audit/alerts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/audit/alerts` | JWT only | List audit alerts |
| POST | `/audit/alerts` | JWT only | Create audit alert |
| GET | `/audit/alerts/:id` | JWT only | Get alert by ID |
| PUT | `/audit/alerts/:id` | JWT only | Update alert |
| DELETE | `/audit/alerts/:id` | JWT only | Delete alert |
| GET | `/audit/alerts/incidents` | JWT only | List audit incidents |
| POST | `/audit/alerts/incidents` | JWT only | Create incident |

---

## ApiAuditController

**Path prefix:** `audit/api`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/audit/api` | JWT only | List API audit records |
| GET | `/audit/api/errors` | JWT only | List API errors |
| GET | `/audit/api/:id` | JWT only | Get API audit detail |

---

## ComplianceController

**Path prefix:** `audit/compliance`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/audit/compliance` | JWT only | List compliance checkpoints |
| POST | `/audit/compliance` | JWT only | Create compliance checkpoint |
| POST | `/audit/compliance/verify` | JWT only | Verify compliance checkpoint |

---

## ChangeHistoryController

**Path prefix:** `audit/history`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/audit/history/:entityType/:entityId` | JWT only | Get entity change history |
| GET | `/audit/history/:entityType/:entityId/versions` | JWT only | Get entity versions |
| GET | `/audit/history/:entityType/:entityId/versions/:version` | JWT only | Get specific version |

---

## AuditLogsController

**Path prefix:** `audit/logs`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/audit/logs` | JWT only | List audit logs |
| POST | `/audit/logs` | JWT only | Create audit log entry |
| GET | `/audit/logs/summary` | JWT only | Get audit log summary |
| GET | `/audit/logs/export` | JWT only | Export audit logs |
| GET | `/audit/logs/:id` | JWT only | Get audit log by ID |
| POST | `/audit/logs/verify-chain` | JWT only | Verify audit chain integrity |

---

## RetentionController

**Path prefix:** `audit/retention`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/audit/retention` | JWT only | List retention policies |
| POST | `/audit/retention` | JWT only | Create retention policy |
| GET | `/audit/retention/:id` | JWT only | Get retention policy by ID |
| PUT | `/audit/retention/:id` | JWT only | Update retention policy |
| DELETE | `/audit/retention/:id` | JWT only | Delete retention policy |

---

## Known Issues

- No RolesGuard on any controller -- sensitive audit data accessible to all authenticated users
- 8 controllers in one module is unusually large
