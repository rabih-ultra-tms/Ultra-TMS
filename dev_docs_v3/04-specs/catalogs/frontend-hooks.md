# Hook Catalog — Ultra TMS

> Last updated: 2026-03-07
> Source: `apps/web/lib/hooks/` — actual file scan (51 hook files, 1 test file)
> Format: Hook | Endpoint(s) | Status | Notes

---

## Summary

| Metric | Count |
|--------|-------|
| Total hook files | 51 |
| By service: accounting | 6 |
| By service: admin | 4 |
| By service: carriers | 2 |
| By service: commissions | 5 |
| By service: communication | 3 |
| By service: crm | 5 |
| By service: documents | 1 |
| By service: load-board | 2 |
| By service: operations | 7 |
| By service: sales | 1 |
| By service: tms | 10 |
| By service: tracking | 1 |
| Root-level utilities | 4 |

---

## Accounting Hooks (`lib/hooks/accounting/`)

| Hook | Endpoint(s) | Unwraps Envelope? | Status | Notes |
|------|------------|-------------------|--------|-------|
| `use-accounting-dashboard.ts` | `GET /accounting/dashboard` | — | Broken | Endpoint missing (QS-003) |
| `use-aging.ts` | `GET /accounting/reports/aging` | — | Broken | Endpoint missing |
| `use-invoices.ts` | `GET /accounting/invoices` | Needs verification | Partial | FE not built — hook exists |
| `use-payables.ts` | `GET /accounting/payables` | Needs verification | Partial | FE not built |
| `use-payments.ts` | `GET /accounting/payments` | Needs verification | Partial | FE not built |
| `use-settlements.ts` | `GET /accounting/settlements` | Needs verification | Partial | FE not built |

---

## Admin Hooks (`lib/hooks/admin/`)

| Hook | Endpoint(s) | Unwraps Envelope? | Status | Notes |
|------|------------|-------------------|--------|-------|
| `use-roles.ts` | `GET /admin/roles`, `POST /admin/roles`, `PATCH /admin/roles/:id` | Yes | Production | Fixed in Sonnet audit |
| `use-security-log.ts` | `GET /admin/audit-logs` | Yes | Production | |
| `use-tenant.ts` | `GET /admin/tenants`, `PATCH /admin/tenants/:id` | Yes | Production | |
| `use-users.ts` | `GET /admin/users`, `POST /admin/users`, `PATCH /admin/users/:id` | Yes | Production | Fixed in Sonnet audit |

---

## Carrier Hooks (`lib/hooks/carriers/`)

| Hook | Endpoint(s) | Unwraps Envelope? | Status | Notes |
|------|------------|-------------------|--------|-------|
| `use-carrier-scorecard.ts` | `GET /carriers/:id/performance` | Yes | Partial | Data returns zeros — QS-004 |
| `use-fmcsa.ts` | `GET /carriers/fmcsa/:dot` | Yes | Production | FMCSA DOT lookup |

**Note:** Most carrier hooks are in `lib/hooks/operations/` (use-carriers.ts, use-load-history.ts) rather than this directory.

---

## Commission Hooks (`lib/hooks/commissions/`)

| Hook | Endpoint(s) | Unwraps Envelope? | Status | Notes |
|------|------------|-------------------|--------|-------|
| `use-commission-dashboard.ts` | `GET /commission/stats` | Needs verification | Partial | FE not built |
| `use-payouts.ts` | `GET /commission/payments` | Needs verification | Partial | FE not built |
| `use-plans.ts` | `GET /commission/plans`, `POST /commission/plans` | Needs verification | Partial | FE not built |
| `use-reps.ts` | `GET /commission/reps` | Needs verification | Partial | FE not built |
| `use-transactions.ts` | `GET /commission/transactions` | Needs verification | Partial | FE not built |

---

## Communication Hooks (`lib/hooks/communication/`)

| Hook | Endpoint(s) | Unwraps Envelope? | Status | Notes |
|------|------------|-------------------|--------|-------|
| `use-auto-email.ts` | `GET /communication/auto-email` | Needs verification | Partial | P1 service — FE not built |
| `use-email-logs.ts` | `GET /communication/logs` | Needs verification | Partial | P1 service — FE not built |
| `use-send-email.ts` | `POST /communication/send` | Needs verification | Partial | P1 service — FE not built |

---

## CRM Hooks (`lib/hooks/crm/`)

| Hook | Endpoint(s) | Unwraps Envelope? | Status | Notes |
|------|------------|-------------------|--------|-------|
| `use-activities.ts` | `GET /crm/activities` | Yes | Production | Fixed in Sonnet audit |
| `use-companies.ts` | `GET /crm/customers`, `POST /crm/customers` | Yes | Production | |
| `use-contacts.ts` | `GET /crm/contacts`, `POST /crm/contacts` | Yes | Production | Missing delete button in UI |
| `use-customers.ts` | `GET /crm/customers/:id`, `PATCH /crm/customers/:id` | Yes | Production | |
| `use-leads.ts` | `GET /crm/opportunities`, `PATCH /crm/opportunities/:id` | Yes | Production | Missing convert button in UI |

---

## Documents Hooks (`lib/hooks/documents/`)

| Hook | Endpoint(s) | Unwraps Envelope? | Status | Notes |
|------|------------|-------------------|--------|-------|
| `use-documents.ts` | `GET /documents`, `POST /documents` | Needs verification | Partial | P1 service |

---

## Load Board Hooks (`lib/hooks/load-board/`)

| Hook | Endpoint(s) | Unwraps Envelope? | Status | Notes |
|------|------------|-------------------|--------|-------|
| `use-loadboard-dashboard.ts` | `GET /load-board` | Needs verification | Stub | Backend is stub |
| `use-postings.ts` | `GET /load-board/postings`, `POST /load-board/post` | Needs verification | Stub | Backend is stub |

---

## Operations Hooks (`lib/hooks/operations/`)

These are for carrier-related operations data (confusingly in the operations dir):

| Hook | Endpoint(s) | Unwraps Envelope? | Status | Notes |
|------|------------|-------------------|--------|-------|
| `use-carriers.ts` | `GET /carriers`, `POST /carriers` | Yes | Production | Main carrier list hook |
| `use-equipment.ts` | `GET /carriers/equipment` | Yes | Production | Equipment types lookup |
| `use-inland-service-types.ts` | `GET /carriers/service-types` | Yes | Production | Service types lookup |
| `use-load-history.ts` | `GET /carriers/:id/loads` | Yes | Production | Load history per carrier |
| `use-load-planner-quotes.ts` | `GET /sales/quotes` (filtered) | Yes | Production | Quotes for load planner context |
| `use-tenant-services.ts` | `GET /admin/tenants/services` | Yes | Production | Tenant configuration |
| `use-truck-types.ts` | `GET /truck-types` | Yes | Production | Truck types for dropdowns — PROTECTED |

---

## Sales Hooks (`lib/hooks/sales/`)

| Hook | Endpoint(s) | Unwraps Envelope? | Status | Notes |
|------|------------|-------------------|--------|-------|
| `use-quotes.ts` | `GET /sales/quotes`, `POST /sales/quotes`, `GET /sales/quotes/:id` | Yes | Production | Sonnet-fixed |

---

## TMS Hooks (`lib/hooks/tms/`)

| Hook | Endpoint(s) | Unwraps Envelope? | Status | Notes |
|------|------------|-------------------|--------|-------|
| `use-checkcalls.ts` | `GET /checkcalls`, `POST /checkcalls` | Yes | Production | Fixed in Sonnet audit |
| `use-dispatch-ws.ts` | `WS /dispatch` namespace | — | Broken | WebSocket not implemented (QS-001) |
| `use-dispatch.ts` | `GET /loads` (dispatch view) + `POST /loads/:id/assign-carrier` | Yes | Production | REST works, WS missing |
| `use-load-board.ts` | `GET /load-board` | Stub | Stub | References load board stubs |
| `use-loads.ts` | `GET /loads`, `POST /loads`, `GET /loads/:id` | Yes | Production | Fixed in Sonnet audit |
| `use-ops-dashboard.ts` | `GET /operations/dashboard` + `/charts` + `/alerts` + `/activity` | Yes | Partial | Dashboard fixed, some charts may still be broken |
| `use-orders.ts` | `GET /orders`, `POST /orders`, `GET /orders/:id` | Yes | Production | Fixed in Sonnet audit |
| `use-rate-confirmation.ts` | `GET /loads/:id/rate-confirmation` | Yes | Production | Blob download response |
| `use-stops.ts` | `GET /stops`, `PATCH /stops/:id/arrive`, `PATCH /stops/:id/depart` | Yes | Production | Fixed in Sonnet audit |
| `use-tracking.ts` | `GET /tracking/positions` + `WS /tracking` | Partial | Broken | REST fixed, WS not implemented (QS-001) |

---

## Tracking Hooks (`lib/hooks/tracking/`)

| Hook | Endpoint(s) | Unwraps Envelope? | Status | Notes |
|------|------------|-------------------|--------|-------|
| `use-public-tracking.ts` | `GET /tracking/public/:trackingNumber` | Yes | Production | Public-facing (no auth required) |

---

## Root-Level Utility Hooks (`lib/hooks/`)

| Hook | Purpose | Status | Notes |
|------|---------|--------|-------|
| `use-auth.ts` | Auth state, login/logout, `GET /auth/me` | Production | Core auth hook |
| `use-confirm.ts` | ConfirmDialog state management | Production | Replaces window.confirm() |
| `use-debounce.ts` | Debounce input values | Production | 300ms default — use for search inputs |
| `use-pagination.ts` | Pagination state (page, limit, totalPages) | Production | Use on all list pages |

---

## Hook Quality Summary

| Quality Level | Count | Description |
|---------------|-------|-------------|
| Production (verified working) | 24 | Envelope unwrapped, error handling, used in built screens |
| Partial (hook exists, FE not built) | 18 | Hook correct but no page uses it yet |
| Broken (endpoint missing) | 4 | use-accounting-dashboard, use-aging, use-dispatch-ws, use-tracking (WS part) |
| Stub (backend stub) | 3 | load-board hooks |
| Utility (no API) | 4 | use-auth, use-confirm, use-debounce, use-pagination |

---

## Envelope Unwrapping Reference

All API responses use this envelope:
```typescript
// Single item
{ data: T }

// List
{ data: T[], pagination: { page, limit, total, totalPages } }
```

All hooks MUST unwrap:
```typescript
const response = await api.get('/crm/customers');
return response.data.data; // response.data = {data: T[], pagination: {...}}
                            // response.data.data = T[]
```
