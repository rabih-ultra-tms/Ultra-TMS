# Service Hub: Communication — Email, SMS & Notifications (12)

> **Priority:** P1 Post-MVP | **Status:** Backend Substantial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D+ (3/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Substantial — 30 endpoints across 5 controllers in `communication/` + separate `email/` infra module |
| **Frontend** | Partial — no pages or components, but 3 hooks exist in `lib/hooks/communication/` |
| **Tests** | Backend: 7 spec files (email, sms, notifications, preferences, templates, sendgrid, twilio) |
| **Integrations** | SendGrid (email via `email/` module), Twilio (SMS) — credentials in .env |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | 10 design spec files in `dev_docs/12-Rabih-design-Process/11-communication/` |
| Backend Controllers | Substantial | 5 controllers, 30 endpoints in `apps/api/src/modules/communication/` |
| Email Infra Module | Done | `apps/api/src/modules/email/` — SendGrid integration |
| Backend Services | Partial | Email send, SMS send, template CRUD, notification CRUD, preferences |
| Prisma Models | Done | CommunicationTemplate, CommunicationLog, Notification, NotificationPreference |
| Frontend Pages | Not Built | 0 pages — hub, inbox, compose, templates, log all missing |
| Hooks | Built | 3 hooks: `useSendEmail`, `useEmailLogs`, `useAutoEmail` in `lib/hooks/communication/` |
| Components | Not Built | No notification bell, inbox widget, template editor, etc. |
| Tests | Backend only | 7 BE spec files; 0 FE test files |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Communication Hub | `/communication` | Not Built | Overview dashboard (design: 01-communication-hub.md) |
| Inbox | `/communication/inbox` | Not Built | Unified email/SMS inbox (design: 02-inbox.md) |
| Compose Email | `/communication/email/compose` | Not Built | Rich email composer (design: 03-compose-email.md) |
| Compose SMS | `/communication/sms/compose` | Not Built | SMS composer with conversation view (design: 04-sms-compose.md) |
| Email Templates | `/communication/templates/email` | Not Built | Email template management (design: 05-email-templates.md) |
| SMS Templates | `/communication/templates/sms` | Not Built | SMS template management (design: 06-sms-templates.md) |
| Notification Center | `/notifications` | Not Built | In-app notification center (design: 07-notification-center.md) |
| Communication Log | `/communication/log` | Not Built | Full email/SMS history (design: 08-communication-log.md) |
| Auto-Message Rules | `/communication/auto-rules` | Not Built | Automated messaging config (design: 09-auto-message-rules.md) |
| Bulk Messaging | `/communication/bulk` | Not Built | Bulk email/SMS campaigns (design: 10-bulk-messaging.md) |

---

## 4. API Endpoints

### EmailController — `@Controller('communication/email')` — 6 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/communication/email/send` | Built | Send single email |
| POST | `/communication/email/send-bulk` | Built | Send bulk emails |
| GET | `/communication/email/logs` | Built | Email send history |
| GET | `/communication/email/logs/:id` | Built | Single log detail |
| POST | `/communication/email/resend/:id` | Built | Resend a failed email |
| GET | `/communication/email/stats` | Built | Email sending statistics |

### SmsController — `@Controller('communication/sms')` — 8 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/communication/sms/send` | Built | Send single SMS |
| GET | `/communication/sms/conversations` | Built | List SMS conversations |
| GET | `/communication/sms/conversations/:id` | Built | Single conversation thread |
| POST | `/communication/sms/conversations/:id/reply` | Built | Reply within thread |
| PATCH | `/communication/sms/conversations/:id/close` | Built | Close conversation |
| GET | `/communication/sms/logs` | Built | SMS send history |
| GET | `/communication/sms/stats` | Built | SMS sending statistics |
| POST | `/communication/sms/webhook` | Built | Twilio inbound webhook |

### NotificationsController — `@Controller('communication/notifications')` — 5 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/communication/notifications` | Built | List notifications for user |
| GET | `/communication/notifications/unread-count` | Built | Unread badge count |
| POST | `/communication/notifications/:id/read` | Built | Mark single as read |
| POST | `/communication/notifications/read-all` | Built | Mark all as read |
| DELETE | `/communication/notifications/:id` | Built | Delete notification |

### TemplatesController — `@Controller('communication/templates')` — 8 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/communication/templates` | Built | Create template |
| GET | `/communication/templates` | Built | List templates |
| GET | `/communication/templates/codes` | Built | List template codes (for dropdowns) |
| GET | `/communication/templates/:id` | Built | Get template detail |
| PUT | `/communication/templates/:id` | Built | Update template |
| DELETE | `/communication/templates/:id` | Built | Soft-delete template |
| POST | `/communication/templates/:id/clone` | Built | Clone existing template |
| POST | `/communication/templates/preview` | Built | Preview rendered template |

### PreferencesController — `@Controller('communication/preferences')` — 3 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/communication/preferences` | Built | Get user notification preferences |
| PUT | `/communication/preferences` | Built | Update preferences |
| POST | `/communication/preferences/reset` | Built | Reset to defaults |

**Total: 30 endpoints across 5 controllers**

**Separate infra module:** `apps/api/src/modules/email/` — SendGrid transport layer used by EmailController.

---

## 5. Components

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| NotificationBell | — | Not Built | Header bell icon with unread badge |
| NotificationDropdown | — | Not Built | Quick-view dropdown from bell |
| NotificationCenter | — | Not Built | Full notification list with filters |
| EmailComposer | — | Not Built | Rich text email composer |
| SmsComposer | — | Not Built | SMS compose with character count |
| ConversationThread | — | Not Built | SMS conversation thread view |
| TemplateEditor | — | Not Built | Template editor with variable insertion |
| TemplatePreview | — | Not Built | Live template preview panel |
| CommunicationLogTable | — | Not Built | Filterable log data table |
| BulkMessageWizard | — | Not Built | Multi-step bulk send flow |
| AutoRuleBuilder | — | Not Built | Automated trigger rule configuration |

---

## 6. Hooks

| Hook | Path | Status | Notes |
|------|------|--------|-------|
| useNotifications | — | Not Built | Fetch notification list with pagination |
| useUnreadCount | — | Not Built | Poll/WS unread count for bell badge |
| useSendEmail | — | Not Built | Mutation: send single email |
| useSendBulkEmail | — | Not Built | Mutation: send bulk emails |
| useSendSms | — | Not Built | Mutation: send single SMS |
| useSmsConversations | — | Not Built | Fetch SMS conversation list |
| useSmsThread | — | Not Built | Fetch single conversation thread |
| useTemplates | — | Not Built | CRUD operations for templates |
| useTemplatePreview | — | Not Built | Preview rendered template |
| useCommunicationLog | — | Not Built | Fetch email/SMS logs with filters |
| useCommunicationPreferences | — | Not Built | Get/update notification preferences |
| useCommunicationStats | — | Not Built | Email + SMS stats for dashboard |

---

## 7. Business Rules

1. **5 Automated Email Triggers (COMM-001):** (1) Rate confirmation sent to carrier on dispatch, (2) Tender notification to carrier when load tendered, (3) Pickup reminder 2 hours before scheduled pickup, (4) Delivery confirmation to customer on delivery, (5) Invoice email to customer on invoice creation.
2. **SendGrid Integration:** All emails route through SendGrid via `apps/api/src/modules/email/`. From address configurable per tenant. Templates use HTML with variable substitution. Bounce/unsubscribe webhooks must be handled.
3. **SMS via Twilio:** Check call reminders, urgent delivery alerts. TCPA opt-in compliance required. Default: SMS disabled until carrier/customer explicitly opts in. Inbound SMS handled via webhook endpoint.
4. **SMS Conversations:** Thread-based tracking. Conversations can be opened, replied to, and closed. Each SMS is tied to a conversation thread for continuity.
5. **Notification Types:** LOAD_STATUS_CHANGE, CHECK_CALL_OVERDUE, INSURANCE_EXPIRING, CREDIT_HOLD, INVOICE_OVERDUE, SYSTEM_ALERT. Each type has configurable email/SMS/in-app toggle per user via preferences.
6. **Rate Limiting:** Email sending rate-limited at 100/hour per tenant. SMS at 10/hour per tenant. Exceeding limits queues messages for next window.
7. **Template Variables:** Templates use `{{variableName}}` syntax. Required variables per template type are validated before sending. Missing variables cause a template render error, not silent failure.
8. **Multi-Language Support:** Templates support English and Spanish (`subjectEn`/`subjectEs`, `bodyEn`/`bodyEs`). Language selection based on recipient preference or tenant default.
9. **Template Cloning:** Templates can be cloned via `POST /communication/templates/:id/clone` for quick variant creation. System templates (`isSystem: true`) cannot be deleted, only cloned and modified.
10. **Communication Preferences:** Per-user channel toggles (email, SMS, in-app) per notification type. Can be reset to tenant defaults via `POST /communication/preferences/reset`.

---

## 8. Data Model

### CommunicationTemplate

```
CommunicationTemplate {
  id              String    @id @default(uuid())
  tenantId        String    (FK -> Tenant)
  name            String
  code            String
  description     String?
  category        String?
  channel         String    (EMAIL | SMS)
  subjectEn       String?
  subjectEs       String?
  bodyEn          String
  bodyEs          String?
  fromName        String?
  fromEmail       String?
  replyTo         String?
  status          String    @default("ACTIVE")
  isSystem        Boolean   @default(false)
  customFields    Json?
  externalId      String?
  sourceSystem    String?
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime? (soft delete)
  createdById     String?   (FK -> User)
  updatedById     String?   (FK -> User)

  logs            CommunicationLog[]

  @@unique([tenantId, code, channel])
}
```

### Notification

```
Notification {
  id          String    @id @default(uuid())
  tenantId    String    (FK -> Tenant)
  userId      String    (FK -> User)
  type        NotificationType
  title       String
  body        String
  entityType  String?   (Load, Invoice, Carrier, etc.)
  entityId    String?
  isRead      Boolean   @default(false)
  readAt      DateTime?
  createdAt   DateTime
}
```

### CommunicationLog

```
CommunicationLog {
  id            String    @id @default(uuid())
  tenantId      String    (FK -> Tenant)
  channel       String    (EMAIL | SMS)
  to            String
  subject       String?
  templateId    String?   (FK -> CommunicationTemplate)
  status        String    (SENT, DELIVERED, BOUNCED, FAILED)
  externalId    String?   (SendGrid/Twilio message ID)
  errorMessage  String?
  metadata      Json?
  createdAt     DateTime
}
```

### NotificationPreference

```
NotificationPreference {
  id              String    @id @default(uuid())
  tenantId        String    (FK -> Tenant)
  userId          String    (FK -> User)
  notificationType String
  emailEnabled    Boolean   @default(true)
  smsEnabled      Boolean   @default(false)
  inAppEnabled    Boolean   @default(true)
  createdAt       DateTime
  updatedAt       DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Notes |
|-------|------|-------|
| Template `code` | Required, unique per (tenantId, channel) | Composite unique constraint |
| Template `channel` | Must be EMAIL or SMS | Enum validation |
| Template `bodyEn` | Required, non-empty | English body always required |
| Template `subjectEn` | Required for EMAIL channel | SMS templates have no subject |
| Template `fromEmail` | Valid email format when provided | Validated on send |
| Email `to` | Valid email address(es) | Validated before send |
| SMS `to` | Valid phone number (E.164 format) | Twilio requires E.164 |
| Template variables | `{{variableName}}` must all resolve | Missing variable = render error |
| Bulk email recipients | Max batch size per rate limit | 100/hour per tenant |
| SMS opt-in | Recipient must have TCPA opt-in | Blocked if no opt-in record |
| Notification `type` | Must be valid NotificationType enum | Validated on creation |

---

## 10. Status States

### CommunicationTemplate.status

```
ACTIVE ──> INACTIVE ──> ACTIVE (toggle)
  │
  └──> ARCHIVED (soft delete via deletedAt)
```

- **ACTIVE** — Template available for use in sending
- **INACTIVE** — Template disabled, cannot be used for sending
- **ARCHIVED** — Soft-deleted (deletedAt set), hidden from lists

### CommunicationLog.status

```
QUEUED ──> SENT ──> DELIVERED
              │
              └──> BOUNCED
              └──> FAILED
```

- **QUEUED** — Message accepted, pending send (rate limit queue)
- **SENT** — Handed off to SendGrid/Twilio
- **DELIVERED** — Delivery confirmed by provider
- **BOUNCED** — Email bounced (hard/soft)
- **FAILED** — Send failed (invalid address, provider error, etc.)

### SMS Conversation States

```
OPEN ──> CLOSED (via PATCH conversations/:id/close)
```

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Entire frontend not built | P1 | Open | 0 pages, 0 components, 0 hooks |
| 5 automated email triggers not wired | P1 | Open | Controllers exist but event triggers not connected |
| No notification bell in header UI | P1 | Open | Backend endpoint exists, no frontend consumer |
| SMS opt-in flow not built | P2 | Open | TCPA compliance requires explicit opt-in UI |
| No WebSocket for real-time notifications | P1 | Open | Related to QS-001 (WS gateways task) |
| No tests for any communication code | P0 | Open | 30 endpoints, 0 test coverage |
| Twilio webhook security not verified | P2 | Open | Webhook signature validation TBD |
| Bounce/unsubscribe webhook handling unknown | P2 | Open | SendGrid webhooks may not be fully wired |
| Rate limiting implementation unverified | P2 | Open | Rules documented but enforcement not confirmed |

---

## 12. Tasks

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| COMM-001 | Wire 5 Automated Email Triggers | L (8-12h) | P1 | Connect dispatch/tender/pickup/delivery/invoice events to email send |
| COMM-002 | Build Notification Bell + Center UI | M (4-6h) | P1 | Bell component in header + `/notifications` page |
| COMM-003 | Build Email Template Editor Page | M (4-6h) | P2 | `/communication/templates/email` — CRUD with preview |
| COMM-004 | Build SMS Opt-in Flow + Compose UI | M (4-6h) | P2 | TCPA opt-in + `/communication/sms/compose` |
| COMM-005 | Write Communication Backend Tests | M (4h) | P1 | Cover all 30 endpoints, especially send + webhook |
| COMM-006 | Build Communication Hub Dashboard | M (4h) | P2 | `/communication` overview with stats |
| COMM-007 | Build Communication Log Page | S (2-3h) | P2 | `/communication/log` — filterable table |
| COMM-008 | Build SMS Conversation Thread UI | M (4h) | P2 | `/communication/sms/conversations` with thread view |
| COMM-009 | Build Bulk Messaging UI | M (4-6h) | P3 | `/communication/bulk` — multi-step wizard |
| COMM-010 | Build Auto-Message Rules UI | L (6-8h) | P3 | `/communication/auto-rules` — rule builder |
| COMM-011 | Implement Real-time Notification WS | M (3-4h) | P1 | Depends on QS-001 WebSocket gateway work |
| COMM-012 | Build Frontend Hooks Layer | M (3-4h) | P1 | All 12 hooks for API consumption |

---

## 13. Design Links

| File | Content |
|------|---------|
| `dev_docs/12-Rabih-design-Process/11-communication/01-communication-hub.md` | Hub dashboard layout |
| `dev_docs/12-Rabih-design-Process/11-communication/02-inbox.md` | Unified inbox design |
| `dev_docs/12-Rabih-design-Process/11-communication/03-compose-email.md` | Email composer UX |
| `dev_docs/12-Rabih-design-Process/11-communication/04-sms-compose.md` | SMS composer UX |
| `dev_docs/12-Rabih-design-Process/11-communication/05-email-templates.md` | Email template editor |
| `dev_docs/12-Rabih-design-Process/11-communication/06-sms-templates.md` | SMS template editor |
| `dev_docs/12-Rabih-design-Process/11-communication/07-notification-center.md` | Notification center layout |
| `dev_docs/12-Rabih-design-Process/11-communication/08-communication-log.md` | Communication log table |
| `dev_docs/12-Rabih-design-Process/11-communication/09-auto-message-rules.md` | Automated rule builder |
| `dev_docs/12-Rabih-design-Process/11-communication/10-bulk-messaging.md` | Bulk messaging wizard |

---

## 14. Delta vs Original Plan

| Area | Original Plan (dev_docs) | Actual Implementation | Gap |
|------|--------------------------|----------------------|-----|
| Backend endpoints | ~7 endpoints implied | 30 endpoints across 5 controllers | Backend exceeds plan |
| Email controller | Basic send + logs | Full send, send-bulk, logs, resend, stats (6) | Exceeds |
| SMS controller | Basic send | Full send, conversations, reply, close, logs, stats, webhook (8) | Exceeds |
| Templates | Basic CRUD | Full CRUD + codes, clone, preview (8) | Exceeds |
| Notifications | List + mark-read | List, unread-count, read, read-all, delete (5) | Exceeds |
| Preferences | Not planned | Full get/put/reset (3) | New addition |
| Multi-language | Not in original | subjectEn/Es, bodyEn/Es on templates | New addition |
| SMS conversations | Not in original | Thread-based conversations with close | New addition |
| Frontend pages | 3 pages planned | 0 built | Full gap |
| Components | Notification bell, inbox | 0 built | Full gap |
| Hooks | Not specified | 0 built | Full gap |
| Tests | Not specified | 0 tests | Full gap |
| Real-time WS | Planned | Not built (QS-001 dependency) | Full gap |

**Key insight:** Backend is significantly more complete than previously documented (30 endpoints vs 7 listed). The D+ score reflects that backend work is substantial but the entire frontend layer is missing, and there are no tests.

---

## 15. Dependencies

### Depends On

| Service | Why |
|---------|-----|
| Auth | User identity for notifications, tenant scoping |
| SendGrid API | Email transport (via `email/` module) |
| Twilio API | SMS transport + inbound webhook |
| TMS Core | Event triggers (load status changes, check calls) |
| Accounting | Invoice creation triggers invoice email |
| Carrier Management | Carrier contact info for sending |
| Customer Management | Customer contact info for sending |

### Depended On By

| Service | Why |
|---------|-----|
| TMS Core | Sends load status notifications |
| Carrier Management | Insurance expiry alerts, tender notifications |
| Accounting | Invoice emails, payment notifications |
| Claims | Claim status update notifications |
| Dispatch | Rate confirmation emails, check call reminders |
| All services | In-app notification delivery |
