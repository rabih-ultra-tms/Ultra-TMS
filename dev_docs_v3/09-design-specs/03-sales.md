# Sales Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/03-sales/` (11 files)
**MVP Tier:** P0
**Frontend routes:** `(dashboard)/quotes/*`, `(dashboard)/load-planner/*`
**Backend module:** `apps/api/src/modules/sales/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-sales-dashboard.md` | — | Not built | No dedicated sales dashboard route |
| 02 | `02-quotes-list.md` | `/quotes` | `(dashboard)/quotes/page.tsx` | Exists |
| 03 | `03-quote-detail.md` | `/quotes/[id]` | `(dashboard)/quotes/[id]/page.tsx` | Exists |
| 04 | `04-quote-builder.md` | `/quotes/new`, `/quotes/[id]/edit` | `(dashboard)/quotes/new/page.tsx` | Exists |
| 05 | `05-rate-tables.md` | — | Not built | P2 — rate table management |
| 06 | `06-rate-table-editor.md` | — | Not built | P2 |
| 07 | `07-lane-pricing.md` | — | Not built | P2 — handled by rate-intelligence module |
| 08 | `08-accessorial-charges.md` | — | Not built | P2 |
| 09 | `09-proposal-templates.md` | — | Not built | P2 |
| 10 | `10-sales-reports.md` | — | Not built | P2 |

---

## Load Planner (PROTECTED)

| Route | Page File | Status |
|-------|-----------|--------|
| `/load-planner/[id]/edit` | `(dashboard)/load-planner/[id]/edit/page.tsx` | PROTECTED (9/10, 1,825 LOC) |
| `/load-planner/history` | `(dashboard)/load-planner/history/page.tsx` | Exists |

**DO NOT MODIFY** the Load Planner page. It has AI cargo extraction, Google Maps integration, and full quote lifecycle.

---

## Backend Endpoints

| Screen | Endpoint(s) | Hook |
|--------|-------------|------|
| Quotes List | `GET /sales/quotes` | `use-quotes.ts` |
| Quote Detail | `GET /sales/quotes/:id` | `use-quotes.ts` |
| Quote Create | `POST /sales/quotes` | `use-quotes.ts` |
| Quote Edit | `PATCH /sales/quotes/:id` | `use-quotes.ts` |
| Load Planner | `POST /rate-intelligence/lookup` | `use-load-planner-quotes.ts` |

---

## Implementation Notes

- Load Planner calls rate-intelligence module for rate suggestions — existing working integration
- Quote history at `/quote-history` is a separate page from `/quotes` — different layouts
- Rate tables, lane pricing, accessorial charges are P2 and not in MVP scope
- Sales dashboard is not a separate route — sales metrics may appear on main dashboard
