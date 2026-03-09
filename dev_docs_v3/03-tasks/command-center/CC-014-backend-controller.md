# CC-014: Backend — CommandCenterController

**Priority:** P0
**Effort:** M (6 hours)
**Status:** planned
**Assigned:** Claude Code
**Dependencies:** QS-014 (Prisma tenant extension)

---

## Context Header (Read These First)

1. `dev_docs_v3/01-services/p0-mvp/39-command-center.md` — Section 4 (API Endpoints)
2. `apps/api/src/modules/tms/loads.controller.ts` — Load data source
3. `apps/api/src/modules/sales/quotes.controller.ts` — Quote data source
4. `apps/api/src/modules/carrier/carrier.controller.ts` — Carrier data source
5. `apps/api/src/modules/accounting/invoices.controller.ts` — Accounting data source
6. `dev_docs/12-Rabih-design-Process/39-command-center/01-command-center.md` — Section 12 (API Contracts)

---

## Objective

Create a NestJS module with a controller and service that aggregates data from multiple existing services into Command Center-specific endpoints: KPIs, alerts, activity feed, carrier auto-match, and bulk dispatch.

---

## Acceptance Criteria

- [ ] `GET /api/v1/command-center/kpis` returns multi-domain KPI aggregation
- [ ] `GET /api/v1/command-center/alerts` returns prioritized alerts (stale loads, expired insurance, etc.)
- [ ] `GET /api/v1/command-center/activity` returns recent activity feed
- [ ] `GET /api/v1/command-center/carrier-availability` returns available carriers with capacity
- [ ] `POST /api/v1/command-center/auto-match` returns ranked carrier suggestions
- [ ] `POST /api/v1/command-center/bulk-dispatch` assigns multiple loads + generates rate cons
- [ ] All endpoints: JwtAuthGuard + RolesGuard + tenantId scoped
- [ ] All queries include `deletedAt: null`
- [ ] DTOs with class-validator decorations
- [ ] Response format matches API envelope convention (`{ data: T }`)
- [ ] Swagger decorators on all endpoints
- [ ] Unit tests for service (at minimum: KPIs, alerts, auto-match)
- [ ] `pnpm build` passes, `pnpm check-types` passes

---

## File Plan

### New Files

| File | Purpose |
|------|---------|
| `apps/api/src/modules/command-center/command-center.module.ts` | NestJS module, imports TMS/Sales/Carrier/Accounting modules |
| `apps/api/src/modules/command-center/command-center.controller.ts` | REST endpoints |
| `apps/api/src/modules/command-center/command-center.service.ts` | Aggregation logic — queries across multiple Prisma models |
| `apps/api/src/modules/command-center/dto/kpis.dto.ts` | KPI response shape |
| `apps/api/src/modules/command-center/dto/alerts.dto.ts` | Alert request/response |
| `apps/api/src/modules/command-center/dto/activity.dto.ts` | Activity feed response |
| `apps/api/src/modules/command-center/dto/auto-match.dto.ts` | Carrier match request/response |
| `apps/api/src/modules/command-center/dto/bulk-dispatch.dto.ts` | Bulk dispatch request/response |

### Modified Files

| File | Change |
|------|--------|
| `apps/api/src/app.module.ts` | Import CommandCenterModule |

---

## Architecture Notes

The CommandCenterService uses **Prisma directly** — it doesn't call other NestJS services via HTTP. It queries the same database tables that TMS/Sales/Carrier services own, but only for read operations (KPIs, alerts, activity). Write operations (bulk-dispatch, auto-match-assign) delegate to existing services.

```
CommandCenterService
├── getKpis(tenantId) → queries Load, Quote, Carrier, Invoice tables
├── getAlerts(tenantId) → queries CheckCall (stale), CarrierInsurance (expired), Load (unassigned)
├── getActivity(tenantId) → queries AuditLog for recent actions
├── getCarrierAvailability(tenantId) → queries Carrier + active load count
├── autoMatch(tenantId, loadId) → queries Carrier history, rates, scores
└── bulkDispatch(tenantId, loadIds, carrierId) → delegates to LoadsService.assign()
```
