# PST-12: Communication — Per-Service Tribunal Audit

> **Service:** Communication (#12) | **Priority:** P1 Post-MVP
> **Date:** 2026-03-08 | **Verdict:** MODIFY | **Health Score:** 7.5/10 (was 3.0/10, +4.5)

---

## Phase 1: Data Model Audit

### Hub Claims
- 4 models: CommunicationTemplate, Notification, CommunicationLog, NotificationPreference

### Reality (Prisma Schema)
- **6 models**: CommunicationTemplate, CommunicationLog, InAppNotification, NotificationPreference, SmsConversation, SmsMessage

| Model | Hub Status | Actual Status | Accuracy |
|-------|-----------|---------------|----------|
| CommunicationTemplate | Documented (~22 fields) | Exists (~23 fields) | ~90% — very accurate, only missing a few migration-first fields |
| CommunicationLog | Documented (~12 fields) | Exists (~27 fields) | ~45% — hub `to`, `externalId` renamed to `recipientEmail`, `providerMessageId`. Missing 15 fields: recipientType, recipientId, recipientPhone, recipientName, bodyHtml, language, attachments, entityType, entityId, sentAt, deliveredAt, openedAt, clickedAt, failedAt, provider, retryCount, lastRetryAt, createdById |
| **Notification** | Documented (~12 fields) | **WRONG MODEL NAME** — actual model is `InAppNotification` (~22 fields) | ~40% — hub field `body` is actually `message`, missing `icon`, `actionUrl`, `expiresAt`, `deletedAt`, and migration-first fields |
| NotificationPreference | Documented (~10 fields) | Exists (~20 fields) | ~50% — hub has generic `notificationType`/`emailEnabled`/`smsEnabled`/`inAppEnabled` design (per-type rows). Reality is flat model with per-event booleans: `loadAssigned`, `loadStatusChange`, `documentReceived`, `invoiceCreated`, `paymentReceived`, `claimFiled`, `carrierExpiring` + channel toggles + quiet hours (`quietHoursEnabled`, `quietHoursStart`, `quietHoursEnd`, `quietHoursTimezone`) + `pushEnabled` |
| SmsConversation | **NOT DOCUMENTED** | Exists — 17 fields | 0% — undocumented model with phoneNumber, participantType/Id/Name, loadId, status, unreadCount, lastMessageAt, lastMessagePreview |
| SmsMessage | **NOT DOCUMENTED** | Exists — 17 fields | 0% — undocumented model with conversationId, direction, body, mediaUrls, status, providerMessageId, sentAt, deliveredAt, receivedAt, readAt |

**Data model accuracy: ~40%** — 2 missing models, 1 wrong model name, field accuracy 40-90% on documented models.

---

## Phase 2: Endpoint Audit

### Hub Claims: 30 endpoints across 5 controllers
### Reality: 30 endpoints across 5 controllers — **COUNT MATCHES** (2nd service after Documents)

| Controller | Hub Count | Actual Count | Match | Notes |
|-----------|-----------|-------------|-------|-------|
| EmailController | 6 | 6 | EXACT | send, send-bulk, logs, logs/:id, resend/:id, stats |
| SmsController | 8 | 8 | EXACT | send, conversations, conversations/:id, reply, close, logs, stats, webhook |
| NotificationsController | 5 | 5 | EXACT | list, unread-count, :id/read, read-all, :id delete |
| TemplatesController | 8 | 8 | EXACT | create, list, codes, :id, update, delete, clone, preview |
| PreferencesController | 3 | 3 | EXACT | get, update, reset |

**Endpoint count accuracy: 100%** — Best endpoint accuracy of any service audited.

### Hidden Capabilities Not in Hub
- `NotificationsService.createBulk()` — bulk notification creation (not exposed via controller, internal use)
- `NotificationsService.notify()` — helper for other services to send notifications
- `NotificationsService.notifyByRole()` — bulk notify by role
- `NotificationsService.deleteExpired()` — cleanup expired notifications (cron candidate)
- `TemplatesService.findByCode()` — used internally by email/SMS services for template-based sending

---

## Phase 3: Security & Tenant Isolation Audit

### Guard Coverage

| Controller | JwtAuthGuard | RolesGuard | Tenant Isolation | Issues |
|-----------|-------------|-----------|-----------------|--------|
| EmailController | Class-level | Class-level + per-endpoint @Roles | tenantId via @CurrentTenant | Clean |
| SmsController | Class-level | Class-level + per-endpoint @Roles | tenantId via @CurrentTenant | **BUG: webhook endpoint inherits JwtAuth+RolesGuard from class** |
| NotificationsController | Class-level | Class-level + per-endpoint @Roles | tenantId + userId | Clean — user-scoped queries |
| TemplatesController | Class-level | Class-level + per-endpoint @Roles | tenantId via @CurrentTenant | Clean |
| PreferencesController | Class-level JwtAuth only | **NO RolesGuard** | tenantId + userId | LOW — any authenticated user can manage their own preferences (probably intentional) |

### Critical Findings

1. **BUG (HIGH): SMS webhook behind auth guards** — `POST /communication/sms/webhook` inherits `@UseGuards(JwtAuthGuard, RolesGuard)` from the class decorator. Twilio cannot provide JWT tokens. This endpoint is **non-functional** as implemented. The comment says "In production, validate Twilio signature here" but there's no Twilio signature validation either. The endpoint also uses `@Body() body: any` — no type safety.

2. **RISK (MEDIUM): No Twilio webhook signature validation** — Even if the auth guard issue is fixed (e.g., by making it a separate controller or using a bypass decorator), there's no `validateRequest` call from Twilio SDK. Anyone who discovers the endpoint URL can inject fake inbound SMS messages.

3. **PreferencesController missing RolesGuard** — Only has `JwtAuthGuard`, no `RolesGuard`. Since it reads/writes user's own preferences using `@CurrentUser('id')`, this is likely intentional. LOW risk.

4. **Tenant isolation: GOOD** — All services filter by `tenantId`. Notification queries also filter by `userId`, preventing cross-user reads. Templates use `@@unique([tenantId, code, channel])`. CommunicationLog queries always include `tenantId`.

5. **Rate limiting: EXISTS** — `@Throttle` on email send (10/min) and send-bulk (1/hour). SMS send also has `@Throttle` (10/min). Hub says "Rate limiting implementation unverified" — it IS verified, it's there.

---

## Phase 4: Frontend & Hooks Audit

### Hub Claims
- 0 pages, 0 components, 0 hooks — "Entire frontend not built"

### Reality
- **0 pages** — CONFIRMED, no routes under `/communication` or `/notifications`
- **1 notification UI stub** — Bell icon in `app-header.tsx` with static "No new notifications" text and hardcoded red dot badge. Not connected to backend API.
- **1 settings component** — `notification-settings.tsx` in admin settings. Static switches (Security alerts, Weekly summaries) with non-functional Save button.
- **3 hooks EXIST** — hub says 0, reality is 3:

| Hook | Hub Status | Actual Status | Quality |
|------|-----------|---------------|---------|
| useSendEmail | "Not Built" | **EXISTS** — 59 LOC | Good — proper mutation with toast, invalidation, envelope unwrapping |
| useEmailLogs | "Not Built" | **EXISTS** — 53 LOC | Good — query with entity filtering, proper envelope unwrapping |
| useAutoEmail | "Not Built" | **EXISTS** — 258 LOC | **Excellent** — full auto-email trigger system for 5 workflow events (rate_confirmation, load_tendered, pickup_reminder, delivery_confirmation, invoice_sent). Template-based, stable refs, graceful missing-email handling |

**Hub hooks claim: FALSE** — "3 hooks exist in lib/hooks/communication/" is actually in the hub Status Box (Section 1) but contradicted by Section 6 which lists all 12 hooks as "Not Built". The hub contradicts itself.

### Frontend Envelope Consistency
- `useSendEmail`: `(body.data ?? response) as SendEmailResult` — handles envelope correctly
- `useEmailLogs`: `body.data ?? []` — handles envelope correctly

---

## Phase 5: Test Coverage Audit

### Hub Claims
- "No tests for any communication code" (P0 severity)
- Section 2 says "Backend: 7 spec files"

### Reality
- **8 spec files, 68 test cases total** — hub contradicts itself again (Section 11 says 0 tests, Section 2 says 7 spec files)

| Spec File | Test Cases | Location |
|-----------|-----------|----------|
| email.service.spec.ts | 11 | communication/ |
| notifications.service.spec.ts | 12 | communication/ |
| preferences.service.spec.ts | 9 | communication/ |
| sms.service.spec.ts | 11 | communication/ |
| templates.service.spec.ts | 9 | communication/ |
| sendgrid.provider.spec.ts | 5 | communication/providers/ |
| twilio.provider.spec.ts | 3 | communication/providers/ |
| email.service.spec.ts | 8 | email/ (infra module) |

**Hub "No tests" claim: FALSE** — 68 tests across 8 files (7 in communication/ + 1 in email/). This is the known pattern: hub known-issues sections systemically claim "no tests" when tests exist.

---

## Tribunal Rounds

### Round 1: Data Model Accuracy

**Prosecution:** Hub documents 4 models. Reality has 6 — `SmsConversation` and `SmsMessage` are completely undocumented despite being essential to the SMS conversation feature (8 SMS endpoints depend on them). The hub's `Notification` model doesn't exist — the actual model is `InAppNotification` with a significantly different schema (flat event booleans vs per-type rows). `CommunicationLog` is 45% accurate with 15 missing fields including tracking timestamps (openedAt, clickedAt).

**Defense:** CommunicationTemplate is ~90% accurate (best of the 4 documented models). The naming convention difference (Notification vs InAppNotification) is a Prisma naming choice, not a conceptual error. The model exists and works correctly.

**Verdict:** Hub data model section needs substantial rewrite. 2 missing models, 1 wrong name, 1 wrong architecture (flat vs per-type). Average accuracy ~40%.

### Round 2: Endpoint Coverage & Accuracy

**Prosecution:** Hard to find fault here — 30/30 is exact. This is only the 2nd service (after Documents) where the hub endpoint count matches reality precisely.

**Defense:** Full agreement. Every endpoint listed in the hub exists exactly as described. Paths, methods, and controller assignments are all correct.

**Verdict:** Endpoint documentation is **excellent**. 100% accuracy on count and paths. The hidden internal methods (notify, notifyByRole, createBulk, deleteExpired) are service-layer helpers, not controller endpoints, so their omission is acceptable.

### Round 3: Security Assessment

**Prosecution:** The SMS webhook bug is a showstopper for Twilio integration. The webhook inherits class-level `@UseGuards(JwtAuthGuard, RolesGuard)`, making it unreachable by Twilio. There's also no Twilio signature validation, so even if fixed, it's vulnerable to injection. Hub lists "Twilio webhook security not verified" (P2) — this should be P0 for the SMS feature.

**Defense:** SMS is P2 scope — not in MVP. The webhook auth issue is real but the feature isn't live. Email is the critical path and email security is solid (proper auth, rate limiting, tenant isolation).

**Verdict:** SMS webhook is broken by design (P1 when SMS goes live). Email path is well-secured. PreferencesController RolesGuard omission is acceptable (user-scoped data).

### Round 4: Known Issues Accuracy

| Hub Issue | Status | Verdict |
|-----------|--------|---------|
| "Entire frontend not built" | **PARTIALLY FALSE** — 3 hooks exist, notification bell stub exists | ~70% true (pages/components missing, but hooks built) |
| "5 automated email triggers not wired" | **FALSE** — `useAutoEmail` hook has all 5 triggers configured | Frontend trigger wiring EXISTS, backend event wiring TBD |
| "No notification bell in header UI" | **FALSE** — Bell icon exists in app-header.tsx | It's static/disconnected, but the UI element exists |
| "SMS opt-in flow not built" | TRUE | No opt-in tracking |
| "No WebSocket for real-time notifications" | TRUE | TODO comment in notifications.service.ts confirms |
| "No tests for any communication code" | **FALSE** — 68 tests across 8 files | Systemically wrong claim (pattern seen in 6/12 services) |
| "Twilio webhook security not verified" | **WORSE THAN STATED** — webhook is behind JWT auth, making it non-functional | Should be elevated from P2 to P1 |
| "Bounce/unsubscribe webhook handling unknown" | TRUE — no SendGrid webhook endpoint found | Confirmed missing |
| "Rate limiting implementation unverified" | **FALSE** — @Throttle decorators exist on send endpoints | Rate limiting is implemented |

**Known issues accuracy: 4/9 accurate, 5/9 false or understated**

### Round 5: Overall Health Assessment

**Previous hub score: D+ (3/10)**

**Evidence-based reassessment:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Backend Architecture | 8.5/10 | Clean module structure, proper service/provider separation, SendGrid+Twilio abstracted |
| Backend Implementation | 8/10 | 30 endpoints, all functional, template rendering with multi-language support, conversation threading |
| Data Model | 7.5/10 | 6 well-designed models with proper indexes, unique constraints, migration-first fields |
| Security | 7/10 | Good auth on 4/5 controllers, rate limiting, tenant isolation. SMS webhook bug (-2), no Twilio validation (-1) |
| Frontend | 3/10 | 3 quality hooks + bell stub, but 0 pages, 0 components |
| Tests | 7/10 | 68 tests across 8 files, decent coverage of services and providers |
| Documentation vs Reality | 5/10 | Endpoint count perfect (100%), but data model ~40%, known issues 44% accurate, hooks section self-contradicting |

**Revised score: 7.5/10 (was 3.0/10, +4.5)**

The D+ score was driven by the "frontend not built + no tests" narrative. Backend is actually substantial (B+), tests exist (68), and 3 frontend hooks provide real value (especially `useAutoEmail` which implements all 5 automated email triggers on the frontend side). The main gaps are: no frontend pages (correct), SMS webhook broken, no WebSocket integration.

---

## Action Items

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Fix hub data model: rename Notification → InAppNotification, add SmsConversation + SmsMessage models, fix CommunicationLog (15 missing fields), fix NotificationPreference (flat booleans, quiet hours) | P1 | S |
| 2 | Fix hub known issues: remove "No tests" (68 exist), update "No notification bell" (exists as stub), update "5 triggers not wired" (frontend hooks exist), mark rate limiting as verified | P1 | S |
| 3 | Fix hub hooks section: Section 6 says all 12 "Not Built" but Section 1 says "3 hooks exist" — resolve self-contradiction, mark useSendEmail/useEmailLogs/useAutoEmail as Built | P1 | XS |
| 4 | **BUG FIX: Extract SMS webhook to separate controller** or use `@Public()` decorator to bypass class-level guards. Add Twilio request signature validation | P1 | M |
| 5 | Add SendGrid webhook endpoint for bounce/unsubscribe/delivery events | P2 | M |
| 6 | Connect notification bell in app-header.tsx to backend unread-count API | P1 | S |
| 7 | Elevate "Twilio webhook security" from P2 to P1 in known issues | P1 | XS |
| 8 | Add `InAppNotification` soft-delete gap: `delete()` method does soft-delete correctly, but `deleteExpired()` uses `deleteMany` (hard delete) — inconsistent | P2 | XS |
| 9 | Wire `deleteExpired()` to a cron job or scheduled task | P2 | S |
| 10 | Add missing frontend `notification-settings.tsx` connection to backend preferences API | P2 | S |

---

## Cross-Cutting Patterns Confirmed

1. **Hub "No tests" claim pattern** — 7th service (of 12 audited) where hub claims no/few tests but substantial test suites exist
2. **Hub self-contradiction pattern** — Section 1 correctly says "3 hooks exist" while Section 6 lists all 12 as "Not Built"
3. **Hub data model naming mismatch** — Prisma model name differs from hub name (InAppNotification vs Notification), same pattern as Commission (CommissionEntry vs Commission)
4. **Hub missing SMS infrastructure** — SmsConversation + SmsMessage models completely absent from hub, despite being the backbone of the conversation threading feature
5. **Endpoint accuracy improving** — 2nd service with 100% endpoint count match (after Documents). P1 services may have more accurate endpoint documentation than P0 services
