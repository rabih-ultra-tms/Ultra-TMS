# Screen Completeness Matrix

> Maps every screen to its required API endpoints and verifies all endpoints exist.
> Last updated: 2026-03-07

---

## P0 Critical Path Screens

### Auth & Admin — All endpoints exist (22/22 Production)

| Screen | Required Endpoints | All Exist? | Notes |
|--------|-------------------|-----------|-------|
| Login | POST /auth/login | YES | Production |
| Register | POST /auth/register | YES | Production — frontend stub |
| Forgot Password | POST /auth/forgot-password | YES | Production — frontend stub |
| Reset Password | POST /auth/reset-password | YES | Production — frontend stub |
| MFA | POST /auth/mfa/enable, /verify, /disable | YES | Production |
| Users List | GET /admin/users | YES | Production |
| User Detail | GET /admin/users/:id | YES | Production |
| User Create | POST /admin/users | YES | Production |
| User Edit | PATCH /admin/users/:id | YES | Production |
| Roles List | GET /admin/roles | YES | Production |
| Role Detail | GET /admin/roles/:id | YES | Production |
| Permissions Matrix | GET /admin/permissions | YES | Production |
| Tenants List | GET /admin/tenants | YES | Production |
| Audit Logs | GET /admin/audit-logs | YES | Production |
| Profile | GET /auth/me | YES | Production — edit not wired |

---

### CRM — All endpoints exist (20/20 Production)

| Screen | Required Endpoints | All Exist? | Notes |
|--------|-------------------|-----------|-------|
| Companies List | GET /crm/customers | YES | Production |
| Company Detail | GET /crm/customers/:id | YES | Production |
| Company Create | POST /crm/customers | YES | Production |
| Contacts List | GET /crm/contacts | YES | Production — no delete button |
| Contact Detail | GET /crm/contacts/:id | YES | Production — no delete button |
| Leads List | GET /crm/opportunities | YES | Production — no delete button |
| Lead Detail | GET /crm/opportunities/:id | YES | Production — no convert button |
| Lead Pipeline | GET /crm/opportunities/pipeline | YES | Production — stage confirm missing |

---

### Sales & Quotes — All endpoints exist

| Screen | Required Endpoints | All Exist? | Notes |
|--------|-------------------|-----------|-------|
| Quotes List | GET /sales/quotes | YES | Production |
| Quote Detail | GET /sales/quotes/:id | YES | Production |
| Quote Create | POST /sales/quotes | YES | Production |
| Load Planner | POST /sales/ai/extract-cargo, GET /maps | YES | Production — PROTECTED |

---

### TMS Core — All endpoints exist; WebSocket missing

| Screen | Required Endpoints | All Exist? | Notes |
|--------|-------------------|-----------|-------|
| Operations Dashboard | GET /operations/dashboard + /charts + /alerts + /activity | YES | Production |
| Orders List | GET /orders | YES | Production |
| Order Detail | GET /orders/:id + /timeline + /notes | YES | Production |
| Order Create | POST /orders | YES | Production |
| Loads List | GET /loads | YES | Production |
| Load Detail | GET /loads/:id + /stops + /checkcalls | YES | Production |
| Load Create | POST /loads | YES | Production |
| Dispatch Board | GET /loads + WS /dispatch | **PARTIAL** | REST: YES; WebSocket: MISSING (QS-001) |
| Tracking Map | GET /tracking/positions + WS /tracking | **PARTIAL** | REST: YES; WebSocket: MISSING (QS-001) |
| Stop Management | GET /stops + PATCH /stops/:id/arrive + /depart | YES | Production |
| Check Call Log | GET /checkcalls + POST /checkcalls | YES | Production |
| Rate Confirmation | GET /loads/:id/rate-confirmation | YES | Production |

---

### Carrier Management — All endpoints exist

| Screen | Required Endpoints | All Exist? | Notes |
|--------|-------------------|-----------|-------|
| Carriers List | GET /carriers | YES | Production |
| Carrier Detail | GET /carriers/:id | YES | Production — **page.tsx missing** |
| Carrier Create | POST /carriers | YES | Production |
| Carrier Edit | PATCH /carriers/:id | YES | Production |
| Load History | GET /carriers/:id/loads | YES | Production — **detail page.tsx missing** |
| Carrier Scorecard | GET /carriers/:id/performance | YES | Production |
| Truck Types | GET /truck-types (separate) | YES | Production — PROTECTED |

---

### Accounting — Dashboard endpoint MISSING

| Screen | Required Endpoints | All Exist? | Notes |
|--------|-------------------|-----------|-------|
| Accounting Dashboard | GET /accounting/dashboard | **MISSING** | QS-003 task |
| Invoices List | GET /accounting/invoices | Partial | |
| Invoice Detail | GET /accounting/invoices/:id | Partial | |
| Invoice Create | POST /accounting/invoices | Partial | |
| Settlements List | GET /accounting/settlements | Partial | |
| Settlement Detail | GET /accounting/settlements/:id | Partial | |
| Payments List | GET /accounting/payments | Partial | |
| Aging Report | GET /accounting/reports/aging | **MISSING** | |

---

### Commission — Endpoints partial

| Screen | Required Endpoints | All Exist? | Notes |
|--------|-------------------|-----------|-------|
| Commission Dashboard | GET /commission/stats | Partial | |
| Plans List | GET /commission/plans | Partial | |
| Plan Create | POST /commission/plans | Partial | |
| Payments | GET /commission/payments | Partial | |

---

### Load Board — All stubs

| Screen | Required Endpoints | All Exist? | Notes |
|--------|-------------------|-----------|-------|
| Load Board | GET /load-board | Stub | |
| Post Load | POST /load-board/post | Stub | |
| Offers | GET /load-board/offers | Stub | |

---

## Missing Endpoints Summary

| Endpoint | Screen | Priority | Task |
|----------|--------|----------|------|
| GET /accounting/dashboard | Accounting Dashboard | P0 | QS-003 |
| GET /accounting/reports/aging | Aging Report | P1 | Backlog |
| GET /carriers/csa/:carrierId | Carrier Scorecard | P1 | QS-004 |
| WS /dispatch namespace | Dispatch Board, Dashboard | P0 | QS-001 |
| WS /tracking namespace | Tracking Map | P1 | QS-001 |
| WS /notifications namespace | All screens (bell) | P1 | QS-001 |
| POST /load-board/post (real) | Load Board Post | P1 | LB-106 |
| GET /load-board/offers | Offers Queue | P1 | LB-106 |

---

## Unused Endpoints

Endpoints that appear to have no screen consuming them:

| Endpoint | Notes |
|----------|-------|
| POST /orders/bulk-status | No bulk action UI in orders list |
| POST /orders/export | No export button in orders list |
| POST /loads/export | No export button in loads list |
| GET /checkcalls/overdue | No dedicated "overdue" screen — used in dashboard only |
| POST /checkcalls/bulk | No bulk check call creation UI |
| POST /stops/reorder | No drag-to-reorder UI in stops |

These are useful backend capabilities that frontend doesn't expose yet. Not bugs — future features.

---

## Screen Coverage by Service

| Service | Screens | APIs Exist | APIs Missing | Coverage |
|---------|---------|-----------|-------------|----------|
| Auth & Admin | 21 | 22/22 | 0 | 100% |
| CRM | 22 | 20/20 | 0 | 100% |
| Sales & Quotes | 7 | All | 0 | 100% |
| TMS Core | 12 | 63/65 | 2 (WS) | 97% |
| Carriers | 7 | 34/34 | 0 | 100% |
| Accounting | 10 | 15/17 | 2 | 88% |
| Commission | 11 | ~7/9 | ~2 | 78% |
| Load Board | 4 | 0/7 real (stubs) | 7 real | 0% real |
| **Overall** | **94** | **~161/174** | **~13** | **~93%** |

**Conclusion:** For every screen that exists, the backend API to power it almost entirely exists. The primary gaps are:
1. WebSocket gateways (QS-001) — affects Dispatch Board + Tracking
2. Accounting dashboard endpoint (QS-003) — 1 missing endpoint
3. CSA scores endpoint (QS-004) — 1 missing endpoint
4. Load Board real implementations (QS backlog) — all stubs
