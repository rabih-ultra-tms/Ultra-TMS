# Service Hub: Communication — Email & SMS (12)

> **Priority:** P1 Post-MVP | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 5 controllers in communication module + email module |
| **Frontend** | Not Built — no dedicated UI; notifications embedded in other screens |
| **Tests** | None |
| **Integrations** | SendGrid (email), Twilio (SMS) — credentials in .env |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Communication definition in dev_docs |
| Backend Controller | Partial | `apps/api/src/modules/communication/` (5 controllers) |
| Email Module | Partial | `apps/api/src/modules/email/` — SendGrid integration |
| Backend Service | Partial | Email and SMS sending logic |
| Prisma Models | Partial | Notification, EmailLog models |
| Frontend Pages | Not Built | No dedicated communication screens |
| Hooks | Not Built | |
| Components | Not Built | Notification bell, inbox widget |
| Tests | None | |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Notifications Inbox | `/notifications` | Not Built | In-app notification center |
| Email Templates | `/settings/email-templates` | Not Built | Customizable templates |
| Communication Log | `/settings/communication-log` | Not Built | Sent emails/SMS history |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/notifications` | Partial | In-app notifications list |
| PATCH | `/api/v1/notifications/:id/read` | Partial | Mark as read |
| POST | `/api/v1/notifications/mark-all-read` | Partial | Mark all read |
| GET | `/api/v1/communication/email-templates` | Partial | Template list |
| PUT | `/api/v1/communication/email-templates/:id` | Partial | Update template |
| GET | `/api/v1/communication/log` | Partial | Email/SMS send history |
| POST | `/api/v1/communication/test-email` | Partial | Send test email |

---

## 5. Business Rules

1. **5 Automated Email Triggers (COMM-001 task):** (1) Rate confirmation sent to carrier on dispatch, (2) Tender notification to carrier when load tendered, (3) Pickup reminder 2 hours before scheduled pickup, (4) Delivery confirmation to customer on delivery, (5) Invoice email to customer on invoice creation.
2. **SendGrid Integration:** All emails route through SendGrid. From address: configurable per tenant. Templates: HTML with variable substitution. Bounce/unsubscribe webhooks must be handled.
3. **SMS via Twilio:** Check call reminders, urgent delivery alerts. Opt-in required (TCPA compliance). Default: SMS disabled until carrier/customer opts in.
4. **Notification Types:** LOAD_STATUS_CHANGE, CHECK_CALL_OVERDUE, INSURANCE_EXPIRING, CREDIT_HOLD, INVOICE_OVERDUE, SYSTEM_ALERT. Each type has configurable email/SMS/in-app toggle per user.
5. **Rate Limiting:** Email sending is rate-limited at 100/hour per tenant. SMS at 10/hour per tenant. Exceeding limits queues messages for next window.
6. **Template Variables:** Email templates use `{{variableName}}` syntax. Required variables per template type are validated before sending. Missing variables cause a template render error, not a silent failure.

---

## 6. Data Model

```
Notification {
  id         String (UUID)
  userId     String (FK → User)
  type       NotificationType
  title      String
  body       String
  entityType String? (Load, Invoice, etc.)
  entityId   String?
  isRead     Boolean (default: false)
  readAt     DateTime?
  tenantId   String
  createdAt  DateTime
}

EmailLog {
  id         String (UUID)
  to         String
  subject    String
  template   String
  status     EmailStatus (SENT, DELIVERED, BOUNCED, FAILED)
  sendgridId String?
  tenantId   String
  createdAt  DateTime
}
```

---

## 7. Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| 5 automated email triggers not implemented | P1 | COMM-001 task |
| No notification bell in UI | P1 | Not Built |
| SMS opt-in flow not built | P2 | Open |
| No tests | P0 | Open |

---

## 8. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| COMM-001 | 5 Automated Email Triggers | L (8-12h) | P1 |
| COMM-002 | Notification Bell + Inbox UI | M (4h) | P1 |
| COMM-003 | Email Template Editor | M (4h) | P2 |
| COMM-004 | SMS opt-in flow | M (4h) | P2 |
| COMM-005 | Write communication tests | M (3h) | P1 |

---

## 9. Dependencies

**Depends on:** Auth, SendGrid API, Twilio API, TMS Core (event triggers), Accounting (invoice triggers)
**Depended on by:** All services that send notifications (TMS Core, Carrier, Accounting, Claims)
