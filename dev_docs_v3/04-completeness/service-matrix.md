# Service Completeness Matrix

> Maps every feature to a service, verifies no orphan features.
> Last updated: 2026-03-07
> Sources: 38 service definitions + 381 design specs + actual codebase + audit reports

---

## P0 MVP Feature Coverage

### Auth & Admin

| Feature | Service | Backend | Frontend | Tests | Priority |
|---------|---------|---------|----------|-------|----------|
| Email/password login | Auth | Production | Built | Partial | P0 |
| JWT access + refresh tokens | Auth | Production | Built | Partial | P0 |
| Logout (session invalidation) | Auth | Production | Built | Partial | P0 |
| Forgot password (email) | Auth | Production | Stub | None | P1 |
| Reset password (token) | Auth | Production | Stub | None | P1 |
| Email verification | Auth | Production | Built | None | P1 |
| MFA (TOTP) enable/disable/verify | Auth | Production | Built | None | P1 |
| Active sessions management | Auth | Production | Stub | None | P2 |
| Change password | Auth | Production | Stub | None | P1 |
| User CRUD (Admin) | Admin | Production | Built | None | P0 |
| Role CRUD (Admin) | Admin | Production | Built | None | P0 |
| Permissions matrix | Admin | Production | Built | None | P0 |
| Tenant CRUD | Admin | Production | Built | None | P0 |
| Audit log viewer | Admin | Production | Built | None | P1 |
| Profile edit | Auth | Production | Stub | None | P1 |
| General settings | Auth | Production | Stub | None | P2 |
| Security settings | Auth | Production | Stub | None | P2 |
| Notification settings | Auth | Production | Stub | None | P2 |

### CRM

| Feature | Service | Backend | Frontend | Tests | Priority |
|---------|---------|---------|----------|-------|----------|
| Customer CRUD | CRM | Production | Built | None | P0 |
| Contact CRUD | CRM | Production | Built (no delete) | None | P0 |
| Lead CRUD + Pipeline | CRM | Production | Built (no delete/convert) | None | P0 |
| Lead → Customer conversion | CRM | Production | Stub (button missing) | None | P0 |
| Credit status management | CRM | Production | Built | None | P0 |
| Activity logging | CRM | Production | Built | None | P1 |
| Opportunities pipeline (Kanban) | CRM | Production | Not Built | None | P2 |
| Activity calendar | CRM | Production | Not Built | None | P2 |
| Territory management | CRM | Production | Not Built | None | P2 |
| Lead import (CSV) | CRM | Partial | Not Built | None | P2 |
| Company hierarchy | CRM | Partial | Not Built | None | P3 |

### Sales & Quotes

| Feature | Service | Backend | Frontend | Tests | Priority |
|---------|---------|---------|----------|-------|----------|
| Quote CRUD | Sales | Production | Partial (basic) | None | P0 |
| Quote send to customer | Sales | Production | Not Built | None | P0 |
| Quote accept → create order | Sales | Production | Not Built | None | P0 |
| Quote PDF generation | Sales | Production | Not Built | None | P0 |
| Quote expiry management | Sales | Production | Not Built | None | P1 |
| AI cargo extraction (Load Planner) | Sales | Production | PROTECTED | Partial | P0 |
| Google Maps integration (Load Planner) | Sales | Production | PROTECTED | Partial | P0 |
| Rate table management | Sales | Production | Not Built | None | P1 |
| Margin enforcement (15% min) | Sales | Production | Partial (warning) | None | P0 |
| Quote history | Sales | Production | Partial (basic) | None | P1 |
| Quote clone | Sales | Production | Not Built | None | P1 |
| Sales reports / win rate | Sales | Partial | Not Built | None | P2 |

### TMS Core — Orders

| Feature | Service | Backend | Frontend | Tests | Priority |
|---------|---------|---------|----------|-------|----------|
| Order CRUD | TMS | Production | Unverified | None | P0 |
| Order status machine | TMS | Production | Unverified | None | P0 |
| Order from quote (convert) | TMS | Production | Unverified | None | P0 |
| Order clone | TMS | Production | Unverified | None | P1 |
| Order notes/timeline | TMS | Production | Unverified | None | P1 |
| Order export (CSV/Excel) | TMS | Production | Not Built | None | P2 |
| Order bulk status update | TMS | Production | Not Built | None | P2 |
| Order audit trail | TMS | Production | Unverified | None | P1 |
| Credit check on order creation | TMS | Production | Unverified | None | P0 |

### TMS Core — Loads

| Feature | Service | Backend | Frontend | Tests | Priority |
|---------|---------|---------|----------|-------|----------|
| Load CRUD | TMS | Production | Unverified | None | P0 |
| Load status machine | TMS | Production | Unverified | None | P0 |
| Carrier assignment + validation | TMS | Production | Unverified | None | P0 |
| Load tender/accept/reject | TMS | Production | Unverified | None | P0 |
| Load dispatch | TMS | Production | Unverified | None | P0 |
| Rate confirmation PDF | TMS | Production | Unverified | None | P1 |
| Load notes/timeline | TMS | Production | Unverified | None | P1 |
| Load export | TMS | Production | Not Built | None | P2 |

### TMS Core — Stops & Check Calls

| Feature | Service | Backend | Frontend | Tests | Priority |
|---------|---------|---------|----------|-------|----------|
| Stop management (arrive/depart) | TMS | Production | Unverified | None | P0 |
| Stop detention calculation | TMS | Production | Unverified | None | P1 |
| Check call log | TMS | Production | Unverified | None | P0 |
| Check call overdue alerts | TMS | Production | Unverified | None | P0 |
| Stop reordering | TMS | Production | Not Built | None | P2 |

### TMS Core — Real-Time

| Feature | Service | Backend | Frontend | Tests | Priority |
|---------|---------|---------|----------|-------|----------|
| Dispatch Board (WebSocket) | TMS | Missing WS | Unverified | None | P0 |
| Tracking Map (WebSocket) | TMS | Missing WS | Unverified | None | P1 |
| Operations Dashboard (real-time) | TMS | Missing WS | Unverified | None | P1 |
| GPS position tracking | TMS | Production | Unverified | None | P1 |
| Public load tracking | TMS | Production | Built | None | P1 |

### Carrier Management

| Feature | Service | Backend | Frontend | Tests | Priority |
|---------|---------|---------|----------|-------|----------|
| Carrier CRUD | Carrier | Production | Partial (list works) | 45 backend | P0 |
| Carrier detail view | Carrier | Production | **BUG-001 (404)** | 45 backend | P0 |
| Carrier contacts | Carrier | Production | Not Built | None | P1 |
| Carrier drivers | Carrier | Production | Not Built | None | P1 |
| Carrier insurance tracking | Carrier | Production | Not Built | None | P0 |
| Insurance expiry alerts | Carrier | Production | Not Built | None | P0 |
| FMCSA lookup | Carrier | Production | Not Built | None | P0 |
| Carrier performance scorecard | Carrier | Production | Partial (unverified) | None | P1 |
| Preferred carriers | Carrier | Production | Partial | None | P1 |
| Compliance center | Carrier | Production | Not Built | None | P2 |
| Truck types CRUD | Carrier | Production | PROTECTED | Some | P0 |
| Load history per carrier | Carrier | Production | Partial (detail 404) | None | P0 |
| Carrier onboarding wizard | Carrier | Partial | Not Built | None | P2 |

### Accounting

| Feature | Service | Backend | Frontend | Tests | Priority |
|---------|---------|---------|----------|-------|----------|
| Invoice auto-creation from delivery | Accounting | Partial | Not Built | None | P0 |
| Invoice CRUD | Accounting | Partial | Unverified | None | P0 |
| Invoice send to customer | Accounting | Partial | Unverified | None | P0 |
| Invoice PDF | Accounting | Partial | Unverified | None | P0 |
| Payment recording | Accounting | Partial | Unverified | None | P0 |
| Invoice overdue management | Accounting | Partial | Not Built | None | P1 |
| Settlement auto-creation | Accounting | Partial | Unverified | None | P0 |
| Settlement approval + payment | Accounting | Partial | Unverified | None | P0 |
| Accounting dashboard (KPIs) | Accounting | **Missing** | Unverified | None | P0 |
| Aging report | Accounting | **Missing** | Unverified | None | P1 |
| Credit hold integration | Accounting | Partial | Not Built | None | P1 |
| QuickBooks sync | Accounting | Not Built | Not Built | None | P2 |

### Commission

| Feature | Service | Backend | Frontend | Tests | Priority |
|---------|---------|---------|----------|-------|----------|
| Commission auto-calculation | Commission | Partial | Unverified | None | P0 |
| Commission plan CRUD | Commission | Partial | Unverified | None | P0 |
| Tiered commission rates | Commission | Partial | Unverified | None | P1 |
| Commission payment recording | Commission | Partial | Unverified | None | P1 |
| Commission reports | Commission | Partial | Unverified | None | P1 |
| Sales rep commission view | Commission | Partial | Unverified | None | P1 |
| Manager overrides | Commission | Partial | Not Built | None | P2 |

### Load Board

| Feature | Service | Backend | Frontend | Tests | Priority |
|---------|---------|---------|----------|-------|----------|
| Internal load board | Load Board | Stub | Unverified | None | P0 |
| Post to DAT | Load Board | Stub | Unverified | None | P1 |
| Post to Truckstop.com | Load Board | Stub | Unverified | None | P1 |
| Carrier offer management | Load Board | Stub | Unverified | None | P0 |
| Offer acceptance → TMS assignment | Load Board | Stub | Unverified | None | P0 |
| Posting expiry | Load Board | Stub | Not Built | None | P1 |

---

## Feature Coverage Summary

| Phase | Total Features | Built | Partial/Unverified | Not Built | Coverage |
|-------|---------------|-------|---------------------|-----------|----------|
| P0 MVP | ~85 | ~25 | ~40 | ~20 | ~30% |
| P1 Post-MVP | ~40 | 0 | ~5 | ~35 | ~5% |
| P2 Extended | ~50 | 0 | ~10 | ~40 | ~0% |
| P3 Future | ~80+ | 0 | ~20 | ~60+ | ~0% |

**Key insight:** Many "unverified" features have page.tsx files that were discovered to exist. The true Built% is unknown until QS-008 runtime verification completes. The count above is conservative — actual built % may be higher.

---

## UNMAPPED Features Check

Running the mapping above against all source documents:

- **0 UNMAPPED features** — all features from service definitions trace to a specific service
- **0 phantom services** — all 9 P0 services have clear feature ownership
- **Personas covered:** Dispatcher (TMS Core), Sales Rep (Sales/CRM), Accounting (Accounting/Commission), Admin (Auth/Admin), Carrier (Carrier/Portal), Customer (CRM/Portal) — all 6 primary personas have screen coverage in plan

---

## Notes on "Unverified" Status

"Unverified" means a `page.tsx` file exists but the quality/functionality is unknown. After QS-008, each "Unverified" will become either:
- **Built** (renders real data, API calls succeed)
- **Stub** (renders placeholder, no real API integration)
- **Broken** (renders error or incorrect data)
