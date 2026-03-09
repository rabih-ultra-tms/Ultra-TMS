# Service Hub: Communication — Email, SMS & Notifications (12)

> **Priority:** P1 Post-MVP | **Status:** Backend Substantial, Frontend Partial
> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-12 tribunal)
> **Original definition:** `dev_docs/02-services/` (communication service)
> **Design specs:** `dev_docs/12-Rabih-design-Process/11-communication/` (10 screen specs)
> **v2 hub (historical):** `dev_docs_v2/03-services/12-communication.md`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-12-communication.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B (7.5/10) |
| **Confidence** | High — code-verified via PST-12 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Substantial — 30 endpoints across 5 controllers in `communication/` + separate `email/` infra module |
| **Frontend** | Partial — no pages or components, but 3 hooks exist in `lib/hooks/communication/` + notification bell stub in header |
| **Tests** | 68 tests across 8 spec files (email, sms, notifications, preferences, templates, sendgrid, twilio + email infra) |
| **Integrations** | SendGrid (email via `email/` module), Twilio (SMS) — credentials in .env |
| **Priority** | P1 — fix SMS webhook auth bug, connect notification bell, add frontend pages |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | 10 design spec files in `dev_docs/12-Rabih-design-Process/11-communication/` |
| Backend Controllers | Substantial | 5 controllers, 30 endpoints in `apps/api/src/modules/communication/` |
| Email Infra Module | Done | `apps/api/src/modules/email/` — SendGrid integration |
| Backend Services | Substantial | Email send, SMS send/conversations, template CRUD, notification CRUD, preferences. Hidden helpers: `notify()`, `notifyByRole()`, `createBulk()`, `deleteExpired()`, `findByCode()` |
| Prisma Models | Done | 6 models: CommunicationTemplate, CommunicationLog, InAppNotification, NotificationPreference, SmsConversation, SmsMessage |
| Frontend Pages | Not Built | 0 pages — hub, inbox, compose, templates, log all missing |
| Hooks | Built | 3 hooks: `useSendEmail`, `useEmailLogs`, `useAutoEmail` in `lib/hooks/communication/` |
| Components | Stub | Notification bell stub in `app-header.tsx` (static, not connected to API). `notification-settings.tsx` in admin settings (static switches, non-functional Save) |
| Tests | Backend | 8 spec files, 68 test cases total; 0 FE test files |

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
| POST | `/communication/email/send` | Built | Send single email. `@Throttle(10/min)` |
| POST | `/communication/email/send-bulk` | Built | Send bulk emails. `@Throttle(1/hour)` |
| GET | `/communication/email/logs` | Built | Email send history |
| GET | `/communication/email/logs/:id` | Built | Single log detail |
| POST | `/communication/email/resend/:id` | Built | Resend a failed email |
| GET | `/communication/email/stats` | Built | Email sending statistics |

### SmsController — `@Controller('communication/sms')` — 8 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/communication/sms/send` | Built | Send single SMS. `@Throttle(10/min)` |
| GET | `/communication/sms/conversations` | Built | List SMS conversations |
| GET | `/communication/sms/conversations/:id` | Built | Single conversation thread |
| POST | `/communication/sms/conversations/:id/reply` | Built | Reply within thread |
| PATCH | `/communication/sms/conversations/:id/close` | Built | Close conversation |
| GET | `/communication/sms/logs` | Built | SMS send history |
| GET | `/communication/sms/stats` | Built | SMS sending statistics |
| POST | `/communication/sms/webhook` | **BUG** | Twilio inbound webhook — **non-functional** (see Known Issues) |

### NotificationsController — `@Controller('communication/notifications')` — 5 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/communication/notifications` | Built | List notifications for user (user-scoped) |
| GET | `/communication/notifications/unread-count` | Built | Unread badge count |
| POST | `/communication/notifications/:id/read` | Built | Mark single as read |
| POST | `/communication/notifications/read-all` | Built | Mark all as read |
| DELETE | `/communication/notifications/:id` | Built | Soft-delete notification |

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

**Total: 30 endpoints across 5 controllers** (100% endpoint accuracy — verified PST-12)

**Separate infra module:** `apps/api/src/modules/email/` — SendGrid transport layer used by EmailController.

**Hidden service-layer helpers (not exposed via controller):**

- `NotificationsService.createBulk()` — bulk notification creation (internal use)
- `NotificationsService.notify()` — helper for other services to send notifications
- `NotificationsService.notifyByRole()` — bulk notify by role
- `NotificationsService.deleteExpired()` — cleanup expired notifications (cron candidate)
- `TemplatesService.findByCode()` — used internally by email/SMS services for template-based sending

---

## 5. Components

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| NotificationBell (stub) | `app-header.tsx` | Stub | Bell icon with static "No new notifications" text and hardcoded red dot badge. Not connected to backend API |
| NotificationSettings (stub) | `notification-settings.tsx` (admin settings) | Stub | Static switches (Security alerts, Weekly summaries) with non-functional Save button |
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
| useSendEmail | `lib/hooks/communication/` | **Built** | 59 LOC — proper mutation with toast, invalidation, envelope unwrapping (`body.data ?? response`) |
| useEmailLogs | `lib/hooks/communication/` | **Built** | 53 LOC — query with entity filtering, proper envelope unwrapping (`body.data ?? []`) |
| useAutoEmail | `lib/hooks/communication/` | **Built** | 258 LOC — full auto-email trigger system for 5 workflow events (rate_confirmation, load_tendered, pickup_reminder, delivery_confirmation, invoice_sent). Template-based, stable refs, graceful missing-email handling |
| useNotifications | — | Not Built | Fetch notification list with pagination |
| useUnreadCount | — | Not Built | Poll/WS unread count for bell badge |
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

1. **5 Automated Email Triggers (COMM-001):** (1) Rate confirmation sent to carrier on dispatch, (2) Tender notification to carrier when load tendered, (3) Pickup reminder 2 hours before scheduled pickup, (4) Delivery confirmation to customer on delivery, (5) Invoice email to customer on invoice creation. Frontend hook `useAutoEmail` implements all 5 triggers; backend event wiring TBD.
2. **SendGrid Integration:** All emails route through SendGrid via `apps/api/src/modules/email/`. From address configurable per tenant. Templates use HTML with variable substitution. Bounce/unsubscribe webhooks must be handled.
3. **SMS via Twilio:** Check call reminders, urgent delivery alerts. TCPA opt-in compliance required. Default: SMS disabled until carrier/customer explicitly opts in. Inbound SMS handled via webhook endpoint (currently non-functional — see Known Issues).
4. **SMS Conversations:** Thread-based tracking via SmsConversation + SmsMessage models. Conversations can be opened, replied to, and closed. Each SMS is tied to a conversation thread for continuity.
5. **Notification Types:** LOAD_STATUS_CHANGE, CHECK_CALL_OVERDUE, INSURANCE_EXPIRING, CREDIT_HOLD, INVOICE_OVERDUE, SYSTEM_ALERT. Each type has configurable email/SMS/in-app toggle per user via preferences.
6. **Rate Limiting:** `@Throttle` decorators on email send (10/min), send-bulk (1/hour), SMS send (10/min). Verified via PST-12 tribunal.
7. **Template Variables:** Templates use `{{variableName}}` syntax. Required variables per template type are validated before sending. Missing variables cause a template render error, not silent failure.
8. **Multi-Language Support:** Templates support English and Spanish (`subjectEn`/`subjectEs`, `bodyEn`/`bodyEs`). Language selection based on recipient preference or tenant default.
9. **Template Cloning:** Templates can be cloned via `POST /communication/templates/:id/clone` for quick variant creation. System templates (`isSystem: true`) cannot be deleted, only cloned and modified.
10. **Communication Preferences:** Per-user flat event booleans (`loadAssigned`, `loadStatusChange`, `documentReceived`, `invoiceCreated`, `paymentReceived`, `claimFiled`, `carrierExpiring`) + channel toggles (`emailEnabled`, `smsEnabled`, `inAppEnabled`, `pushEnabled`) + quiet hours (`quietHoursEnabled`, `quietHoursStart`, `quietHoursEnd`, `quietHoursTimezone`). Can be reset to tenant defaults via `POST /communication/preferences/reset`.

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

### InAppNotification

```
InAppNotification {
  id          String    @id @default(uuid())
  tenantId    String    (FK -> Tenant)
  userId      String    (FK -> User)
  type        NotificationType
  title       String
  message     String
  icon        String?
  actionUrl   String?
  entityType  String?   (Load, Invoice, Carrier, etc.)
  entityId    String?
  isRead      Boolean   @default(false)
  readAt      DateTime?
  expiresAt   DateTime?
  deletedAt   DateTime? (soft delete)
  externalId  String?
  sourceSystem String?
  customFields Json?
  createdAt   DateTime
  updatedAt   DateTime
  createdById String?   (FK -> User)
  updatedById String?   (FK -> User)
}
```

### CommunicationLog

```
CommunicationLog {
  id                String    @id @default(uuid())
  tenantId          String    (FK -> Tenant)
  channel           String    (EMAIL | SMS)
  recipientEmail    String?   (was "to" in original docs)
  recipientPhone    String?
  recipientName     String?
  recipientType     String?
  recipientId       String?
  subject           String?
  bodyHtml          String?
  language          String?
  attachments       Json?
  templateId        String?   (FK -> CommunicationTemplate)
  entityType        String?
  entityId          String?
  status            String    (SENT, DELIVERED, BOUNCED, FAILED)
  provider          String?
  providerMessageId String?   (was "externalId" in original docs)
  errorMessage      String?
  sentAt            DateTime?
  deliveredAt       DateTime?
  openedAt          DateTime?
  clickedAt         DateTime?
  failedAt          DateTime?
  retryCount        Int?
  lastRetryAt       DateTime?
  metadata          Json?
  createdAt         DateTime
  createdById       String?   (FK -> User)
}
```

### NotificationPreference

```
NotificationPreference {
  id                    String    @id @default(uuid())
  tenantId              String    (FK -> Tenant)
  userId                String    (FK -> User)

  // Per-event booleans
  loadAssigned          Boolean   @default(true)
  loadStatusChange      Boolean   @default(true)
  documentReceived      Boolean   @default(true)
  invoiceCreated        Boolean   @default(true)
  paymentReceived       Boolean   @default(true)
  claimFiled            Boolean   @default(true)
  carrierExpiring       Boolean   @default(true)

  // Channel toggles
  emailEnabled          Boolean   @default(true)
  smsEnabled            Boolean   @default(false)
  inAppEnabled          Boolean   @default(true)
  pushEnabled           Boolean   @default(false)

  // Quiet hours
  quietHoursEnabled     Boolean   @default(false)
  quietHoursStart       String?   (e.g., "22:00")
  quietHoursEnd         String?   (e.g., "07:00")
  quietHoursTimezone    String?   (e.g., "America/Chicago")

  createdAt             DateTime
  updatedAt             DateTime
}
```

### SmsConversation

```
SmsConversation {
  id                  String    @id @default(uuid())
  tenantId            String    (FK -> Tenant)
  phoneNumber         String
  participantType     String?
  participantId       String?
  participantName     String?
  loadId              String?   (FK -> Load)
  status              String    (OPEN | CLOSED)
  unreadCount         Int       @default(0)
  lastMessageAt       DateTime?
  lastMessagePreview  String?
  externalId          String?
  sourceSystem        String?
  customFields        Json?
  createdAt           DateTime
  updatedAt           DateTime

  messages            SmsMessage[]
}
```

### SmsMessage

```
SmsMessage {
  id                  String    @id @default(uuid())
  tenantId            String    (FK -> Tenant)
  conversationId      String    (FK -> SmsConversation)
  direction           String    (INBOUND | OUTBOUND)
  body                String
  mediaUrls           Json?
  status              String    (SENT | DELIVERED | FAILED | RECEIVED)
  providerMessageId   String?
  sentAt              DateTime?
  deliveredAt         DateTime?
  receivedAt          DateTime?
  readAt              DateTime?
  externalId          String?
  sourceSystem        String?
  customFields        Json?
  createdAt           DateTime
  updatedAt           DateTime
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
| Bulk email recipients | Max batch size per rate limit | @Throttle(1/hour) on send-bulk |
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

### InAppNotification Lifecycle

```
Created ──> Read (isRead=true, readAt set) ──> Soft-deleted (deletedAt set)
                                              ──> Hard-deleted (via deleteExpired, if expired)
```

Note: `delete()` method does soft-delete. `deleteExpired()` uses hard delete (`deleteMany`) — inconsistency to address.

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| **BUG: SMS webhook non-functional** | P1 | **Open** | `POST /communication/sms/webhook` inherits class-level `@UseGuards(JwtAuthGuard, RolesGuard)` — Twilio cannot provide JWT tokens. Endpoint is unreachable. Fix: extract to separate controller or use `@Public()` bypass |
| No Twilio webhook signature validation | P1 | Open | Even if auth guard is fixed, no `validateRequest` call from Twilio SDK. Vulnerable to injection of fake inbound SMS |
| `deleteExpired()` uses hard delete | P2 | Open | Inconsistent with soft-delete pattern used by `delete()`. Wire to cron job |
| Frontend pages not built | P1 | Open | 0 pages — hub, inbox, compose, templates, log all missing |
| Notification bell not connected | P1 | Open | Bell icon exists as stub in `app-header.tsx` but not connected to `/communication/notifications/unread-count` API |
| `notification-settings.tsx` not connected | P2 | Open | Static switches in admin settings, Save button non-functional, not connected to preferences API |
| SMS opt-in flow not built | P2 | Open | TCPA compliance requires explicit opt-in UI |
| No WebSocket for real-time notifications | P1 | Open | Related to QS-001 (WS gateways task). TODO comment in notifications.service.ts confirms |
| Bounce/unsubscribe webhook handling missing | P2 | Open | No SendGrid webhook endpoint for bounce/unsubscribe/delivery events |

**Resolved Issues (closed during PST-12 tribunal):**

- ~~No tests for any communication code~~ — FALSE: 68 tests across 8 spec files exist
- ~~No notification bell in header UI~~ — FALSE: Bell icon stub exists in `app-header.tsx` (static, not connected)
- ~~5 automated email triggers not wired~~ — PARTIALLY FALSE: `useAutoEmail` hook (258 LOC) implements all 5 frontend triggers. Backend event wiring still TBD
- ~~Rate limiting implementation unverified~~ — FALSE: `@Throttle` decorators verified on email send (10/min), send-bulk (1/hour), SMS send (10/min)
- ~~Twilio webhook security not verified (P2)~~ — WORSE: Elevated to P1. Webhook is behind JwtAuthGuard, making it non-functional (not just unverified)
- ~~Entire frontend not built (0 hooks)~~ — FALSE: 3 hooks exist (`useSendEmail`, `useEmailLogs`, `useAutoEmail`) with proper envelope handling

---

## 12. Tasks

### Completed (verified by PST-12 tribunal)

| Task ID | Title | Status |
|---------|-------|--------|
| COMM-005 | Write Communication Backend Tests | **Done** — 68 tests across 8 spec files |

### Open (from tribunal findings)

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| COMM-001 | Wire 5 Automated Email Triggers (backend events) | L (8-12h) | P1 | Frontend hooks exist (`useAutoEmail`), backend event wiring needed |
| COMM-002 | Build Notification Bell + Center UI | M (4-6h) | P1 | Connect existing bell stub to API + build `/notifications` page |
| COMM-003 | Build Email Template Editor Page | M (4-6h) | P2 | `/communication/templates/email` — CRUD with preview |
| COMM-004 | Build SMS Opt-in Flow + Compose UI | M (4-6h) | P2 | TCPA opt-in + `/communication/sms/compose` |
| COMM-006 | Build Communication Hub Dashboard | M (4h) | P2 | `/communication` overview with stats |
| COMM-007 | Build Communication Log Page | S (2-3h) | P2 | `/communication/log` — filterable table |
| COMM-008 | Build SMS Conversation Thread UI | M (4h) | P2 | `/communication/sms/conversations` with thread view |
| COMM-009 | Build Bulk Messaging UI | M (4-6h) | P3 | `/communication/bulk` — multi-step wizard |
| COMM-010 | Build Auto-Message Rules UI | L (6-8h) | P3 | `/communication/auto-rules` — rule builder |
| COMM-011 | Implement Real-time Notification WS | M (3-4h) | P1 | Depends on QS-001 WebSocket gateway work |
| COMM-012 | Build Remaining Frontend Hooks | M (3-4h) | P1 | 11 hooks still needed (3 of 14 built) |
| COMM-013 | Fix SMS webhook auth (BUG) | S (1-2h) | P1 | Extract to separate controller or `@Public()` + add Twilio signature validation |
| COMM-014 | Add SendGrid webhook endpoint | M (3-4h) | P2 | Bounce/unsubscribe/delivery event handling |
| COMM-015 | Connect notification-settings.tsx to preferences API | S (1-2h) | P2 | Wire static switches to real backend |
| COMM-016 | Wire deleteExpired() to cron job | XS (30min) | P2 | Cleanup expired InAppNotifications |

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
| SMS conversations | Not in original | Thread-based conversations with close (SmsConversation + SmsMessage models) | New addition |
| Frontend pages | 3 pages planned | 0 built | Full gap |
| Components | Notification bell, inbox | Bell stub + settings stub (not connected) | Mostly gap |
| Hooks | Not specified | 3 built (useSendEmail, useEmailLogs, useAutoEmail) | Partial — 3/14 |
| Tests | Not specified | 68 tests across 8 spec files | Exceeds expectations |
| Real-time WS | Planned | Not built (QS-001 dependency) | Full gap |

**Key insight:** Backend is significantly more complete than previously documented (30 endpoints, 6 models, 68 tests). The previous D+ (3.0/10) score was driven by false "no tests" and "no hooks" claims. Revised to B (7.5/10) after tribunal verification. Main gaps: no frontend pages (correct), SMS webhook broken, no WebSocket integration.

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
| All services | In-app notification delivery via `notify()` / `notifyByRole()` |
