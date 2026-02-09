# TMS-013: Tracking Map

> **Phase:** 5 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** L (8h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — Real-Time Requirements
3. `dev_docs/12-Rabih-design-Process/04-tms-core/10-tracking-map.md` — Design spec (note: file 10, was listed as 11 in hub)
4. `apps/web/lib/socket/socket-provider.tsx` — WebSocket (INFRA-001)

## Objective

Build the Tracking Map at `/operations/tracking`. Shows live GPS positions of all in-transit loads on a Google Maps instance. Sidebar lists active loads with status. WebSocket updates positions every 30 seconds. Click a pin to see load details.

**Existing reference:** Load Planner already uses `@react-google-maps/api` — reuse the same setup.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/operations/tracking/page.tsx` | Tracking map page |
| CREATE | `apps/web/components/tms/tracking/tracking-map.tsx` | Google Maps with load pins |
| CREATE | `apps/web/components/tms/tracking/tracking-sidebar.tsx` | Active loads sidebar list |
| CREATE | `apps/web/components/tms/tracking/tracking-pin-popup.tsx` | Click pin → load summary popup |
| CREATE | `apps/web/lib/hooks/tms/use-tracking.ts` | React Query + WebSocket for position data |

## Acceptance Criteria

- [ ] `/operations/tracking` renders map with GPS pins for in-transit loads
- [ ] Each pin shows load # on hover
- [ ] Click pin → popup with: load #, carrier, origin → destination, ETA, last update time
- [ ] Sidebar: list of active loads with status badges, click to center map on load
- [ ] Real-time: positions update every 30s via WebSocket `/tracking` namespace
- [ ] Fallback: poll `GET /api/v1/operations/tracking/positions` every 15s if WebSocket down
- [ ] Pin colors match load status (design tokens)
- [ ] Loading state (map skeleton)
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: INFRA-001 (WebSocket)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Dashboard & Tracking
- Design spec: `dev_docs/12-Rabih-design-Process/04-tms-core/10-tracking-map.md`
- Backend: `GET /api/v1/operations/tracking/positions`, `GET /api/v1/operations/tracking/positions/:loadId`
- WebSocket: `/tracking` namespace, event: `load:location:updated`
- Existing: `apps/web/components/load-planner/route-map.tsx` (Google Maps reference)
