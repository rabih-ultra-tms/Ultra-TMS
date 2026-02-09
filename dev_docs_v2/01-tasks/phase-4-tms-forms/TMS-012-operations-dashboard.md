# TMS-012: Operations Dashboard

> **Phase:** 4 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** L (7h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub (dashboard endpoints)
3. `dev_docs/12-Rabih-design-Process/04-tms-core/01-operations-dashboard.md` — Design spec
4. `apps/web/lib/socket/socket-provider.tsx` — WebSocket (INFRA-001)

## Objective

Build the Operations Dashboard at `/operations`. The central command screen for operations managers showing KPIs, charts, alerts, and activity feed. Refreshes in real-time via WebSocket.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/operations/page.tsx` | Operations dashboard page |
| CREATE | `apps/web/components/tms/dashboard/ops-kpi-cards.tsx` | KPI cards: active loads, on-time %, revenue MTD, loads by status |
| CREATE | `apps/web/components/tms/dashboard/ops-charts.tsx` | Charts: weekly volume, carrier performance, revenue trend |
| CREATE | `apps/web/components/tms/dashboard/ops-alerts-panel.tsx` | Active alerts/exceptions panel |
| CREATE | `apps/web/components/tms/dashboard/ops-activity-feed.tsx` | Recent activity timeline |
| CREATE | `apps/web/components/tms/dashboard/ops-needs-attention.tsx` | Loads needing immediate action |
| CREATE | `apps/web/lib/hooks/tms/use-ops-dashboard.ts` | React Query hooks for all 5 dashboard endpoints |

## Acceptance Criteria

- [ ] `/operations` renders operations dashboard
- [ ] KPI cards: total active loads, on-time delivery %, revenue this month, loads by status breakdown
- [ ] Charts section: weekly load volume trend, carrier performance comparison, revenue trend
- [ ] Alerts panel: overdue check calls, expiring insurance, loads stuck in status
- [ ] Activity feed: recent status changes, new orders, completed deliveries
- [ ] "Needs Attention" section: loads overdue, loads without carrier, loads missing check calls
- [ ] Click any item → navigates to relevant detail page
- [ ] Real-time refresh via WebSocket events
- [ ] Loading skeletons for each section
- [ ] Uses KPICard component (COMP-003)
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: COMP-003 (KPICard), INFRA-001 (WebSocket)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Dashboard & Tracking section
- Design spec: `dev_docs/12-Rabih-design-Process/04-tms-core/01-operations-dashboard.md`
- Backend: 5 endpoints — `/dashboard`, `/dashboard/charts`, `/dashboard/alerts`, `/dashboard/activity`, `/dashboard/needs-attention`
- Persona: Sarah (Operations Manager) — real-time visibility, profitability tracking
