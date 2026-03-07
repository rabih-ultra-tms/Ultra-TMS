# 30 - Audit Service

> **Priority:** P3 Future | **Health:** D+ (3/10) | **Last updated:** 2026-03-07

---

## 1. Purpose

The Audit service provides centralized, event-driven audit logging infrastructure for the entire Ultra TMS platform. Every service writes to the AuditLog table through interceptors and decorators, making Audit a cross-cutting concern used by all P0-P3 services. While the backend is functional and actively recording audit events, no dedicated frontend exists yet (the AuditLog screen lives under Auth & Admin). The P3 classification reflects the lack of a standalone UI, not the importance of the underlying infrastructure.

---

## 2. Scope

| Dimension | Coverage |
|-----------|----------|
| Backend module | `apps/api/src/modules/audit/` |
| Controllers | 8 (audit, alerts, api, events, compliance/checkpoints, history, logs, retention) |
| Endpoints | 31 |
| Frontend pages | None dedicated (AuditLog screen is in Auth & Admin service) |
| Design specs | 7 files in `dev_docs/12-Rabih-design-Process/22-audit/` |
| Prisma models | AuditLog + related tables |
| Infrastructure role | Used internally by ALL services |

---

## 3. Backend Structure

```
apps/api/src/modules/audit/
  audit.controller.ts          # Main controller (CRUD on audit records)
  audit.service.ts             # Core audit service
  audit.service.spec.ts        # Unit tests
  audit-events.listener.ts     # Event-driven listener for system-wide audit events
  audit.module.ts              # NestJS module definition
  activity/                    # User activity tracking sub-module
  alerts/                      # Suspicious activity alerting
  api/                         # API access logging
  compliance/                  # Compliance checkpoints
  decorators/                  # @Audited() and related decorators
  dto/                         # Request/response DTOs
  history/                     # Historical audit queries with filters
  interceptors/                # AuditInterceptor for automatic logging
  logs/                        # Structured log management
  retention/                   # Data retention policies (per-tenant configurable)
```

### Controllers (8)

| Controller | Prefix | Purpose |
|------------|--------|---------|
| `audit.controller.ts` | `/audit` | Main CRUD — list, get, delete audit records |
| `alerts/` | `/audit/alerts` | Manage and query suspicious activity alerts |
| `api/` | `/audit/api` | API access log queries |
| `events/` | `/audit` | Audit event ingestion and replay |
| `compliance/checkpoints/` | `/audit/compliance/checkpoints` | Compliance checkpoint management |
| `history/` | `/audit/history` | Historical queries with advanced filters |
| `logs/` | `/audit/logs` | Structured log retrieval and search |
| `retention/` | `/audit/retention` | Retention policy CRUD (per-tenant) |

### Endpoints (31)

Distributed across the 8 controllers covering: record CRUD, alert configuration and queries, API access log retrieval, compliance checkpoint verification, history search with date/user/action filters, log streaming, and retention policy management.

---

## 4. Frontend Structure

No dedicated frontend pages exist for the Audit service. The current AuditLog viewing capability is embedded in the Auth & Admin service.

### Planned (from design specs)

7 design specification files exist at `dev_docs/12-Rabih-design-Process/22-audit/` covering the intended standalone audit UI, including:
- Audit log dashboard with filtering and search
- Alert configuration screens
- Compliance checkpoint views
- Retention policy management
- API access log viewer

---

## 5. Database Schema

The Audit service writes to the `AuditLog` table (and related models) defined in the Prisma schema. All P0 services write audit records through the interceptor/decorator infrastructure, making this one of the most actively written-to tables in the system.

Key fields typically include: actor (user ID), action, entity type, entity ID, timestamp, metadata (JSON), IP address, and tenant ID.

---

## 6. Business Rules

### BR-01: Event-Driven Audit Logging
All audit log entries are created through an event-driven architecture. The `audit-events.listener.ts` listens for domain events emitted by any service module. The `interceptors/` directory provides an `AuditInterceptor` that automatically captures request/response metadata. The `decorators/` directory provides `@Audited()` and related decorators for declarative audit logging on controller methods. Services do not write to the AuditLog table directly — they emit events or use decorators.

### BR-02: Compliance Checkpoints
The `compliance/checkpoints/` sub-module defines verifiable compliance checkpoints. These are configurable rules that assert certain audit conditions are met (e.g., "driver document was reviewed before dispatch"). Checkpoints can be queried to verify compliance status for regulatory reporting.

### BR-03: Data Retention Policies (Per-Tenant Configurable)
The `retention/` sub-module manages how long audit data is kept. Retention periods are configurable per tenant, allowing different customers to set their own data lifecycle policies. Expired records are purged according to the configured schedule. Default retention period applies when no tenant-specific override exists.

### BR-04: Suspicious Activity Alerts
The `alerts/` sub-module monitors audit events for suspicious patterns (e.g., repeated failed logins, bulk data exports, after-hours access, privilege escalation attempts). When thresholds are exceeded, alerts are created and can trigger notifications. Alert rules are configurable per tenant.

### BR-05: API Access Logging
The `api/` sub-module specifically logs all API access — endpoint hit, HTTP method, caller identity, response status, and latency. This provides a complete access trail independent of the application-level audit log. Useful for security reviews and debugging.

### BR-06: History Queries with Filters
The `history/` sub-module provides advanced query capabilities over the audit log. Supported filters include: date range, user/actor, action type, entity type, entity ID, tenant, and free-text search over metadata. Results are paginated following the standard API envelope (`{ data: T[], pagination: {...} }`).

### BR-07: Infrastructure Usage by All Services
Although Audit is classified P3 for its own UI, the audit infrastructure (interceptors, decorators, event listener) is active in production and used by every P0-P2 service. Any changes to audit internals must be treated as platform-wide changes with appropriate regression testing.

---

## 7. API Envelope

All Audit endpoints follow the standard Ultra TMS API envelope:

```
Single:  { data: T }
List:    { data: T[], pagination: { page, pageSize, total, totalPages } }
```

Frontend consumers must access via `response.data.data` (not `response.data`).

---

## 8. Integration Points

| Service | Direction | Mechanism |
|---------|-----------|-----------|
| ALL services | Inbound | Event listener + interceptor capture audit events from every module |
| Auth & Admin | Outbound | AuditLog screen reads audit data (currently the only UI) |
| Notifications | Outbound | Suspicious activity alerts can trigger notification dispatch |
| Compliance | Bidirectional | Compliance checkpoints feed into regulatory reporting |
| Users | Inbound | User identity attached to every audit record |
| Tenants | Inbound | Tenant ID scoping for multi-tenant data isolation and retention |

---

## 9. Security Considerations

- Audit records are append-only in normal operation; deletion requires elevated permissions
- API access logs capture authentication context for forensic analysis
- Retention policy changes themselves are audited (meta-auditing)
- Tenant isolation must be enforced — tenants must never see each other's audit trails
- Suspicious activity alerts provide early warning for security incidents
- Audit data should be considered sensitive PII (contains user actions, IP addresses)

---

## 10. Testing

- `audit.service.spec.ts` exists with unit tests for the core service
- Current test coverage is minimal relative to the module's importance
- Integration tests needed for: interceptor behavior, event listener routing, retention purge jobs, alert threshold detection

---

## 11. Design Specs

7 design specification files located at:
```
dev_docs/12-Rabih-design-Process/22-audit/
```

These define the intended standalone audit UI that will be built when this service moves from P3 to active development.

---

## 12. Known Issues

| ID | Severity | Description |
|----|----------|-------------|
| — | Medium | No dedicated frontend — all audit viewing is through Auth & Admin |
| — | Low | Test coverage insufficient for a platform-wide infrastructure service |
| — | Low | Retention purge job scheduling mechanism not verified |
| — | Info | 31 endpoints exist but frontend consumption is limited to basic log viewing |

---

## 13. Dependencies

### Requires
- Database (PostgreSQL + Prisma) — AuditLog table and related models
- Auth module — user identity resolution for actor field
- Tenant module — multi-tenant scoping and retention policy association

### Required By
- Every service in the platform (via interceptors/decorators/event listener)
- Auth & Admin (for AuditLog UI screen)

---

## 14. Migration Path (P3 to Active)

1. **Phase 1:** Build standalone audit dashboard page using existing design specs
2. **Phase 2:** Implement alert configuration UI and real-time alert notifications
3. **Phase 3:** Add compliance checkpoint management screens
4. **Phase 4:** Build retention policy management UI with tenant admin controls
5. **Phase 5:** API access log viewer with search and export capabilities
6. **Prerequisite:** Verify all 31 endpoints return correct envelope format before building frontend

---

## 15. Health Score Rationale

**Score: D+ (3/10)**

| Factor | Score | Notes |
|--------|-------|-------|
| Backend completeness | 7/10 | 8 controllers, 31 endpoints, event listener, interceptors, decorators — solid infrastructure |
| Frontend completeness | 0/10 | No dedicated pages; AuditLog screen lives in Auth & Admin |
| Test coverage | 2/10 | Single spec file for a platform-critical module |
| Design spec coverage | 5/10 | 7 design files exist but not yet implemented |
| Integration health | 6/10 | Actively used by all services via interceptors/decorators |
| Documentation | 2/10 | This hub is the first comprehensive doc |

The low score reflects the absence of a dedicated frontend and insufficient testing, not the backend quality. The audit infrastructure is functional and actively used across the platform. Upgrading the health score requires building the standalone UI and expanding test coverage.
