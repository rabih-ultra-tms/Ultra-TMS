# P3: Future Services

> These 16 services are **not in scope** for the current 16-week MVP sprint or the P1/P2 phases.
> All have partial backend implementations. None have frontend screens.
> Each service now has a full 15-section hub file in this directory.
> Do not build these without explicit user approval.

---

## Service List

| # | Service | Hub File | Backend Status | Module Path |
|---|---------|----------|---------------|------------|
| 23 | HR | [23-hr.md](23-hr.md) | Partial (6 controllers, ~35 endpoints, 6 models) | `apps/api/src/modules/hr/` |
| 24 | Scheduler | [24-scheduler.md](24-scheduler.md) | Substantial (5 controllers, 25 endpoints, 6 models) | `apps/api/src/modules/scheduler/` |
| 25 | Safety | [25-safety.md](25-safety.md) | Substantial (9 controllers, 43 endpoints, 7 models, 4 enums) | `apps/api/src/modules/safety/` |
| 26 | EDI | [26-edi.md](26-edi.md) | Partial (8 controllers, 35 endpoints) | `apps/api/src/modules/edi/` |
| 27 | Help Desk | [27-help-desk.md](27-help-desk.md) | Substantial (5 controllers, 31 endpoints, 8 models) | `apps/api/src/modules/help-desk/` |
| 28 | Feedback | [28-feedback.md](28-feedback.md) | Partial (5 controllers, 25 endpoints, 7 models) | `apps/api/src/modules/feedback/` |
| 29 | Rate Intelligence | [29-rate-intelligence.md](29-rate-intelligence.md) | Partial (6 sub-modules, 21 endpoints) | `apps/api/src/modules/rate-intelligence/` |
| 30 | Audit | [30-audit.md](30-audit.md) | Partial (8 controllers, 31 endpoints) | `apps/api/src/modules/audit/` |
| 31 | Config | [31-config.md](31-config.md) | Substantial (9 controllers, 39 endpoints) | `apps/api/src/modules/config/` |
| 32 | Cache | [32-cache.md](32-cache.md) | Partial (4 controllers, 20 endpoints) | `apps/api/src/modules/cache/` |
| 33 | Super Admin | [33-super-admin.md](33-super-admin.md) | Partial (role in auth) | `apps/api/src/modules/auth/` |
| 34 | Email | [34-email.md](34-email.md) | Infrastructure (0 controllers, 1 service) | `apps/api/src/modules/email/` |
| 35 | Storage | [35-storage.md](35-storage.md) | Infrastructure (0 controllers, 1 service) | `apps/api/src/modules/storage/` |
| 36 | Redis | [36-redis.md](36-redis.md) | Infrastructure (0 controllers, 1 service) | `apps/api/src/modules/redis/` |
| 37 | Health | [37-health.md](37-health.md) | Production (1 controller) | `apps/api/src/modules/health/` |
| 38 | Operations Sub-Modules | [38-operations.md](38-operations.md) | Built (7 sub-modules) | `apps/api/src/modules/operations/` |

---

## Notes

- **Audit (30):** System-wide audit trail used by all services internally. AuditLog table exists and is written to by all P0 services. The audit module provides the API to query it. Frontend (AuditLog screen) is built in Auth & Admin service.
- **Health (37):** The only FULLY PRODUCTION service in this list. `GET /api/v1/health` returns 200.
- **Config (31):** Tenant configuration (custom fields, preferences, feature flags) is used by all P0 services via `custom_fields` JSON columns. Full Config UI is P3.
- **Operations (38):** NOT a separate service — backend sub-modules that power TMS Core and other P0 frontend pages.
- **Infrastructure (34-36):** Email, Storage, Redis are service-only helpers with no controllers. Used internally by other modules.
- **Rate Intelligence (29):** Requires DAT, Greenscreens.ai integration. Significant commercial cost. Deferred.
- **EDI (26):** EDI 210/214/990 support for enterprise customers. Requires dedicated EDI middleware.
- **Safety (25):** FMCSA safety compliance tracking. Basic FMCSA lookup is in Carrier Management. Full dashboard is P3.

---

## When to Revisit

These services should be revisited when:
1. All P0 MVP services are complete with tests (estimated: Week 16)
2. All P1 Post-MVP services are complete (estimated: Month 5-6)
3. Business justification exists for the specific service
4. Engineering capacity is available (not blocking P0/P1 delivery)

---

## Original Service Definitions

All 38 original service definitions are in `dev_docs/02-services/` (read-only reference).
