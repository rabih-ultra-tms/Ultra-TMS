# Communication Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/11-communication/` (11 files)
**MVP Tier:** P1
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/communication/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-communication-hub.md` | — | Not built | P1 |
| 02 | `02-inbox.md` | — | Not built | P1 |
| 03 | `03-compose-email.md` | — | Not built | P1 |
| 04 | `04-sms-compose.md` | — | Not built | P2 |
| 05 | `05-email-templates.md` | — | Not built | P1 |
| 06 | `06-sms-templates.md` | — | Not built | P2 |
| 07 | `07-notification-center.md` | — | Not built | P1 (design spec for dashboard shell) |
| 08 | `08-communication-log.md` | — | Not built | P1 |
| 09 | `09-auto-message-rules.md` | — | Not built | P2 |
| 10 | `10-bulk-messaging.md` | — | Not built | P2 |

---

## Backend Endpoints (exist)

- `communication/notifications` — NotificationsController (list, mark-read, unread-count)
- `communication/email` — EmailController (send, bulk-send, logs) with `@Throttle()` rate limiting (10/min, 1/hr bulk)

**Envelope divergence:** `GET /communication/notifications/unread-count` returns `{ count: number }` NOT wrapped in standard `{ data }` envelope.

---

## Hooks

- `lib/hooks/communication/use-email-logs.ts`
- `lib/hooks/communication/use-send-email.ts`
- `lib/hooks/communication/use-auto-email.ts`

---

## Implementation Notes

- Backend has notification and email controllers — frontend pages not built
- Email sending has rate limiting: 10 sends/min, 1 bulk send/hr
- Notification center (07) overlaps with dashboard shell design spec (01.1-dashboard-shell/04)
- SMS requires Twilio integration (optional env var: `TWILIO_ACCOUNT_SID`)
- Auto-message rules and bulk messaging are P2
