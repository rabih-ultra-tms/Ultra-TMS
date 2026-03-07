# TMS Core Workflows Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/04-tms-core/` (files 10-14)
**MVP Tier:** P0
**Frontend routes:** `(dashboard)/operations/*`
**Backend module:** `apps/api/src/modules/tms/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 10 | `10-tracking-map.md` | `/operations/tracking` | `(dashboard)/operations/tracking/page.tsx` | Exists |
| 11 | `11-status-updates.md` | Part of load detail | Inline — status change actions on load | Partial |
| 12 | `12-load-timeline.md` | Part of load detail | Timeline component within load detail | Partial |
| 13 | `13-check-calls.md` | Part of load detail | Check call tab/section | Partial |
| 14 | `14-appointment-scheduler.md` | — | Not built | P2 feature |

---

## Backend Endpoints

| Screen | Endpoint(s) | Hook |
|--------|-------------|------|
| Tracking Map | `GET /tms/tracking` | `use-tracking.ts` |
| Status Updates | `PATCH /tms/loads/:id/status` | `use-loads.ts` |
| Load Timeline | Part of load detail response | `use-loads.ts` |
| Check Calls | `GET/POST /tms/checkcalls` | `use-checkcalls.ts` |
| Rate Confirmation | `GET /tms/rate-confirmation/:loadId` | `use-rate-confirmation.ts` |

---

## Workflow: Order → Load → Dispatch → Delivery

```
Order Created → Order Confirmed → Load Created → Carrier Assigned →
Rate Con Sent → Rate Con Accepted → Dispatched → In Transit →
Check Calls (periodic) → At Pickup → Loaded → In Transit →
At Delivery → Delivered → POD Received → Invoice Generated
```

---

## Implementation Notes

- Tracking map requires Google Maps API + WebSocket for real-time position updates (QS-001)
- Status updates trigger notifications and timeline entries
- Check calls are periodic driver status reports — form needs React Hook Form migration (QS-006)
- Rate confirmation page exists at `/operations/loads/[id]/rate-con`
- Appointment scheduler is P2 — no route or backend exists
- Load timeline and status updates are inline within load detail, not separate routes
