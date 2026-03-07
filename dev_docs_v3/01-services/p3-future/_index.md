# P3: Future Services

> These 16 services are **not in scope** for the current 16-week MVP sprint or the P1/P2 phases.
> All have partial backend implementations. None have frontend screens.
> Do not build these without explicit user approval.

---

## Service List

| # | Service | Backend Status | Module Path | Notes |
|---|---------|---------------|------------|-------|
| 23 | HR | Partial (6 controllers) | `apps/api/src/modules/hr/` | Employee management, payroll data |
| 24 | Scheduler | Partial (5 controllers) | `apps/api/src/modules/scheduler/` | Job scheduling, cron tasks |
| 25 | Safety | Partial (9 controllers) | `apps/api/src/modules/safety/` | FMCSA safety compliance, violations |
| 26 | EDI | Partial (5 controllers) | `apps/api/src/modules/edi/` | EDI 210, 214, 990 transaction sets |
| 27 | Help Desk | Partial (5 controllers) | `apps/api/src/modules/help-desk/` | Internal support ticketing |
| 28 | Feedback | Partial (5 controllers) | `apps/api/src/modules/feedback/` | User feedback collection |
| 29 | Rate Intelligence | Partial (6 controllers) | `apps/api/src/modules/rate-intelligence/` | Market rate benchmarking |
| 30 | Audit | Partial (8 controllers) | `apps/api/src/modules/audit/` | System-wide audit trail |
| 31 | Config | Partial (9 controllers) | `apps/api/src/modules/config/` | Tenant configuration management |
| 32 | Cache | Partial (4 controllers) | `apps/api/src/modules/cache/` | Redis cache management |
| 33 | Super Admin | Partial (auth exists) | `apps/api/src/modules/auth/` | Cross-tenant admin access |
| 34 | Operations | In auth module | (part of auth) | Role-based operations view |
| 35 | Email | Partial | `apps/api/src/modules/email/` | SendGrid wrapper (used by Communication) |
| 36 | Storage | Partial | `apps/api/src/modules/storage/` | S3-compatible file storage |
| 37 | Redis | Partial (4 controllers) | `apps/api/src/modules/redis/` | Queue management, pub/sub |
| 38 | Health | Production | `apps/api/src/modules/health/` | `GET /health` health check endpoint |

---

## Notes

- **Audit (30):** System-wide audit trail used by all services internally. AuditLog table exists and is written to by all P0 services. The audit module provides the API to query it. Frontend (AuditLog screen) is built in Auth & Admin service.
- **Health (38):** The only FULLY PRODUCTION service in this list. `GET /api/v1/health` returns 200. Was public pre-Mar-6 security fix; now requires auth.
- **Config (31):** Tenant configuration (custom fields, preferences, feature flags) is used by all P0 services via `custom_fields` JSON columns. Full Config UI is P3.
- **Rate Intelligence (29):** Market rate benchmarking requires integration with DAT, Greenscreens.ai, or similar APIs. Significant commercial cost. Deferred to P3.
- **EDI (26):** EDI 210 (invoice), 214 (transportation) support needed for enterprise customers. Requires dedicated EDI middleware. Deferred.
- **Safety (25):** FMCSA safety compliance tracking (CSA scores, violation history). Basic FMCSA lookup is in Carrier Management. Full safety compliance dashboard is P3.

---

## When to Revisit

These services should be revisited when:
1. All P0 MVP services are complete with tests (estimated: Week 16)
2. All P1 Post-MVP services are complete (estimated: Month 5-6)
3. Business justification exists for the specific service
4. Engineering capacity is available (not blocking P0/P1 delivery)

To promote a service from P3 to a higher priority:
1. Get user approval
2. Create a service hub file in the appropriate priority folder
3. Update `_index.md` with the new priority
4. Create task files in `dev_docs_v3/03-tasks/`

---

## Original Service Definitions

All 38 original service definitions are in `dev_docs/02-services/` (read-only reference).
