# Global Design Tokens & Standards

**Source:** `dev_docs/12-Rabih-design-Process/00-global/` (files 00-09)
**Scope:** Foundation layer — applies to ALL services and screens

---

## File Index

| # | File | Purpose | Integration Point |
|---|------|---------|-------------------|
| 00 | `00-master-screen-catalog.md` | Complete catalog of all 89 screens across 38 services | Reference: screen priority matrix, MVP scope |
| 01 | `01-design-system-audit.md` | Audit of current design implementation gaps | Maps to: `apps/web/components/tms/` (31 approved components) |
| 02 | `02-design-principles.md` | Core UX principles (consistency, efficiency, clarity) | Maps to: all component development |
| 03 | `03-status-color-system.md` | Standardized status colors for loads, orders, carriers, invoices | Maps to: `apps/web/components/tms/LoadStatusBadge.tsx`, `globals.css` semantic tokens |
| 04 | `04-screen-template.md` | Master template for screen layout (header, filters, table, actions) | Maps to: every `page.tsx` in `(dashboard)/` |
| 05 | `05-user-journeys.md` | End-to-end user flows (dispatcher, accountant, sales rep, admin) | Maps to: navigation config `lib/config/navigation.ts` |
| 06 | `06-role-based-views.md` | What each role sees — field visibility, action permissions | Maps to: `@Roles()` guards on backend, conditional rendering on frontend |
| 07 | `07-real-time-feature-map.md` | Which screens need WebSocket updates | Maps to: QS-001 (WebSocket gateways), `lib/hooks/tms/use-dispatch-ws.ts` |
| 08 | `08-print-export-layouts.md` | Print/PDF layouts for invoices, rate confirmations, BOLs | Maps to: `operations/loads/[id]/rate-con/page.tsx` |
| 09 | `09-data-visualization-strategy.md` | Chart types, dashboard widget patterns, KPI cards | Maps to: dashboard pages, `components/tms/StatCard.tsx` |

---

## Implementation Status

| Token Category | Design Spec | Implemented | Notes |
|---------------|-------------|-------------|-------|
| Color system | 3-layer (brand→semantic→Tailwind) | Yes | `globals.css` has CSS custom properties |
| Status colors | Per-entity status badges | Partial | LoadStatusBadge exists, others use hardcoded colors |
| Typography | Inter font, size scale | Yes | Tailwind defaults + Inter |
| Spacing | 4px grid system | Yes | Tailwind spacing scale |
| Screen template | Header + filters + table layout | Partial | No shared PageHeader, each page rolls its own |
| Role-based views | Conditional rendering by role | Minimal | Guards on backend, minimal frontend gating |
| Real-time | WebSocket for dispatch/tracking | Not built | QS-001 task — gateways not implemented |
| Print layouts | Rate confirmation PDF | Exists | `/operations/loads/[id]/rate-con` page |

---

## Key Design Decisions

1. **Status colors are entity-specific** — a "Pending" load is different from a "Pending" invoice. See `03-status-color-system.md` for the full matrix.
2. **Screen template** defines standard layout: PageHeader → FilterBar → DataTable → Pagination. All new screens should follow this pattern.
3. **Role-based visibility** is enforced at both API level (`@Roles()` decorator) and UI level (conditional rendering based on user role from `useAuth()`).
