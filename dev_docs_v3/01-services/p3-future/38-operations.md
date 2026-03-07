# Service Hub: Operations Sub-Modules (38)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Priority:** P3 Future (shared backend sub-modules used by TMS Core frontend)

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B (7/10) — actively used by TMS Core frontend |
| **Last Verified** | 2026-03-07 |
| **Backend** | Built — `apps/api/src/modules/operations/` with 7 sub-modules |
| **Frontend** | Built — pages live under TMS Core (Service 05) |
| **Note** | This is NOT a separate service — it's the backend sub-modules that power TMS Core and other P0 frontend pages. |

---

## 2. Sub-Modules

| Sub-Module | Path | Purpose |
|------------|------|---------|
| carriers | `operations/carriers/` | Carrier operations (distinct from Carrier Management module) |
| dashboard | `operations/dashboard/` | Operations dashboard data |
| equipment | `operations/equipment/` | Equipment/trailer management |
| inland-service-types | `operations/inland-service-types/` | Inland service type definitions |
| load-history | `operations/load-history/` | Historical load data |
| load-planner-quotes | `operations/load-planner-quotes/` | Load Planner quote operations |
| truck-types | `operations/truck-types/` | Truck type definitions (PROTECTED: 8/10 frontend) |

---

## 3. Relationship to P0 Services

These sub-modules provide backend endpoints consumed by:
- **TMS Core (05):** Operations dashboard, load history
- **Sales & Quotes (04):** Load Planner quotes
- **Carrier Management (06):** Equipment, truck types

The frontend pages for these sub-modules are documented in their respective P0 service hubs.

---

## 4. Dependencies

**Depends on:** Auth, Prisma models (Load, Carrier, Equipment, TruckType)

**Depended on by:** TMS Core (05), Sales (04), Carrier Management (06) — all P0 services
