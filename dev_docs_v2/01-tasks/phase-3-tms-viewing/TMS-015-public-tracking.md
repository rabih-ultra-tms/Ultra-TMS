# TMS-015: Public Tracking Page

> **Phase:** 3 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** L (8-12h)
> **Assigned:** Unassigned
> **Added:** v2 — Logistics expert review ("single highest-ROI feature, eliminates 50% of status calls")

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub (tracking endpoints)
3. `dev_docs/12-Rabih-design-Process/04-tms-core/` — Related design specs
4. `apps/api/src/modules/tms/tracking.controller.ts` — Backend tracking endpoints

## Objective

Build a **public-facing** tracking page at `/track/[trackingCode]` that requires NO authentication. Customers receive a tracking link (e.g., `https://app.ultratms.com/track/UTL-2026-00145`) and can see their shipment status, current location on a map, and ETA — similar to FedEx/UPS tracking.

This is the single highest-ROI feature identified by the logistics expert: one page that eliminates ~50% of "where's my truck?" support calls.

**Critical:** This page is PUBLIC — no auth required. It must NOT expose sensitive data (rates, carrier contact info, internal notes, customer PII).

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/track/[trackingCode]/page.tsx` | Public tracking page (outside (dashboard) layout, no auth) |
| CREATE | `apps/web/components/tracking/public-tracking-view.tsx` | Tracking display: status timeline, map, ETA |
| CREATE | `apps/web/components/tracking/tracking-status-timeline.tsx` | Vertical timeline: each stop with status + timestamp |
| CREATE | `apps/web/components/tracking/tracking-map-mini.tsx` | Simplified Google Maps showing route + current position |
| CREATE | `apps/web/lib/hooks/tracking/use-public-tracking.ts` | Public API hook (no auth headers) |

## Acceptance Criteria

- [ ] `/track/[trackingCode]` renders without login (public route)
- [ ] Shows: shipment status, origin, destination, current location, ETA
- [ ] Status timeline: each stop shows name, city/state, status (Pending/Arrived/Departed/Completed), timestamp
- [ ] Mini map shows route line + current truck position (if GPS data available)
- [ ] "Shipment not found" state for invalid tracking codes
- [ ] NO sensitive data exposed: no rates, no carrier phone, no internal notes, no customer email
- [ ] Mobile-responsive (customers check tracking on phones)
- [ ] Page has Ultra TMS branding (logo, colors) — professional customer-facing
- [ ] Meta tags for social sharing (og:title, og:description with shipment status)
- [ ] Auto-refresh every 5 minutes (or manual refresh button)
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: COMP-001 (design tokens)
- Blocks: None (standalone public page)
- Related: TMS-013 (Tracking Map — shares map components but different auth context)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Tracking section
- Backend: `GET /api/v1/tracking/loads/:id/history` (may need a new public endpoint like `GET /api/v1/tracking/public/:trackingCode`)
- Competitive benchmark: Every TMS competitor (9/9) has this feature
- Expert recommendation: Section 11.3 item 1, Section 12.5 rank 1
