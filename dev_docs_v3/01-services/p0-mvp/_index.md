# P0: MVP Services

> These 11 services form the core 16-week MVP sprint.
> All have backend implementations. Most have frontend screens built.
> Each service has a full 15-section hub file in this directory.
> Command Center (#39) added per Tribunal verdict (2026-03-08).

---

## Service List

| # | Service | Hub File | Backend | Frontend | Priority |
|---|---------|----------|---------|----------|----------|
| 01 | Auth & Admin | [01-auth-admin.md](01-auth-admin.md) | Production (17/20 screens) | Partial (3 stubs) | P0-Critical |
| 02 | Dashboard Shell | [02-dashboard.md](02-dashboard.md) | Production | Partial (hardcoded) | P0-High |
| 03 | CRM | [03-crm.md](03-crm.md) | Production (48 endpoints, 5 controllers) | Substantial (18+ routes) | P0-High |
| 04 | Sales & Quotes | [04-sales-quotes.md](04-sales-quotes.md) | Production | Partial (Load Planner PROTECTED) | P0-High |
| 05 | TMS Core | [05-tms-core.md](05-tms-core.md) | Production (65 endpoints) | 12 pages built | P0-Critical |
| 06 | Carrier Management | [06-carriers.md](06-carriers.md) | Production (40 endpoints) | 6 pages + 17 components | P0-High |
| 07 | Accounting | [07-accounting.md](07-accounting.md) | Production | 10 pages built | P0-High |
| 08 | Commission | [08-commission.md](08-commission.md) | Production | 11 pages built (model quality) | P0-Medium |
| 09 | Load Board | [09-load-board.md](09-load-board.md) | Partial (backend stub) | 4 pages + 10 components | P0-Medium |
| 13 | Customer Portal | [13-customer-portal.md](13-customer-portal.md) | Partial (7 controllers) | Not Built | P0-High |
| 39 | Command Center | [39-command-center.md](39-command-center.md) | Not Built | Not Built | P0-High |

---

## Notes

- All P0 services are in scope for the 16-week MVP sprint
- **Load Planner** (`/load-planner/[id]/edit`) is PROTECTED — 9/10 quality, do not rebuild
- **Truck Types** (`/truck-types`) is PROTECTED — 8/10 quality, gold standard CRUD
- Frontend screens are being rebuilt from design specs in `dev_docs/12-Rabih-design-Process/`
- Quality Sprint tasks (QS-001 through QS-010) target P0 services — see `dev_docs_v3/03-tasks/sprint-quality/`
- Command Center builds on the existing dispatch board (5,801 LOC foundation)
