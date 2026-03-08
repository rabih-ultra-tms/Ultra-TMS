# Notification Architecture -- Ultra TMS

> **Status:** Specification (not yet implemented)
> **Dependencies:** QS-001 (WebSocket gateways), BACK-015 (email wiring)
> **Last updated:** 2026-03-07

---

## 1. Overview

Ultra TMS needs a unified notification system that routes events across multiple channels (in-app, email, SMS) based on event type, user preferences, and channel availability. This document defines the architecture, routing rules, data model, and implementation plan.

**Design principles:**

- Events are emitted once; the notification system fans out to channels
- Users control their preferences per event type and channel
- All channels degrade gracefully -- a failed SMS does not block an in-app notification
- Multi-tenant isolation is enforced at every layer
- Transactional messages (invoices, password resets) bypass preference opt-outs

---

## 2. Channels

| Channel | Provider | Module | Status | Use Cases |
|---------|----------|--------|--------|-----------|
| In-App (WebSocket) | Socket.io `/notifications` namespace | `apps/api/src/modules/communication/` | Not Built (QS-001) | Real-time alerts, status changes, system messages |
| Email | SendGrid | `apps/api/src/modules/email/` | Configured, not wired (BACK-015) | Invoices, quotes, onboarding, reminders, compliance |
| SMS | Twilio | `apps/api/src/modules/communication/` | Configured, not wired | Check call reminders, delivery confirmations, driver dispatch |
| Browser Push | Web Push API | N/A | Not Planned (P3) | Driver/carrier alerts when browser is open but tab is inactive |

**Environment variables required:**

```bash
# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@ultratms.com
SENDGRID_FROM_NAME="Ultra TMS"

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+15551234567

# WebSocket (already in use)
REDIS_URL=redis://...   # Required for Socket.io Redis adapter
```

---

## 3. Notification Routing Matrix

Each event maps to one or more channels. Priority indicates implementation order.

### P0 -- MVP (must ship)

| Event | In-App | Email | SMS | Recipients |
|-------|--------|-------|-----|------------|
| Load assigned to carrier | Yes | Yes | No | Dispatcher, carrier contact |
| Load status changed (pickup/delivery) | Yes | No | No | Dispatcher, sales rep |
| Invoice created | Yes | Yes | No | Customer billing contact |
| Payment received | Yes | Yes | No | Accounting, customer contact |
| Rate confirmation sent | Yes | Yes | No | Carrier contact |
| Settlement processed | Yes | Yes | No | Carrier contact, accounting |
| System alert (downtime, maintenance) | Yes | Yes | No | All users (tenant-wide) |

### P1 -- Post-MVP

| Event | In-App | Email | SMS | Recipients |
|-------|--------|-------|-----|------------|
| Insurance expiring (30d, 7d) | Yes | Yes | Yes | Carrier contact, carrier relations |
| Check call overdue (4h) | Yes | No | Yes | Dispatcher |
| Quote accepted by customer | Yes | Yes | No | Sales rep |
| New carrier application | Yes | Yes | No | Carrier relations |
| Commission calculated | Yes | No | No | Sales rep |
| Driver assignment changed | Yes | No | Yes | Driver, dispatcher |
| Payment reminder (1d, 7d, 30d overdue) | Yes | Yes | No | Customer billing contact |
| Credit hold applied | Yes | Yes | No | Customer contact, sales rep |

### P2 -- Extended

| Event | In-App | Email | SMS | Recipients |
|-------|--------|-------|-----|------------|
| Document uploaded | Yes | No | No | Related users |
| Quote expired | Yes | Yes | No | Sales rep |
| FMCSA authority change | Yes | Yes | No | Carrier relations |
| Insurance expired (suspension) | Yes | Yes | No | Carrier contact, carrier relations |
| Carrier rejected load | Yes | No | Yes | Dispatcher |

---

## 4. Architecture

### Event Flow

```
+-------------------+
| Event Source       |  LoadsService, AccountingService, CarrierService, etc.
| (any backend svc)  |
+--------+----------+
         |
         | NotificationService.dispatch(event, recipients, data)
         v
+--------+----------+
| Notification       |
| Service            |  Central orchestrator
| (NestJS injectable) |
+--------+----------+
         |
         +---> Channel Router
         |     (checks: event type, user prefs, channel availability)
         |
         +---> [In-App]   WebSocket Gateway (/notifications namespace)
         |                 -> emit to user:{userId} room
         |                 -> persist to Notification table
         |
         +---> [Email]    BullMQ Queue ("email")
         |                 -> Worker -> SendGrid API
         |                 -> persist send status to EmailLog table
         |
         +---> [SMS]      BullMQ Queue ("sms")
                           -> Worker -> Twilio API
                           -> persist send status to SmsLog table
```

### Queue Architecture (Email + SMS)

```
Producer (NotificationService)
    |
    v
BullMQ Queue (Redis)          <-- Persistent, survives restarts
    |
    v
Worker Process                 <-- Processes jobs with concurrency limits
    |
    +-- Success --> Update log status to DELIVERED
    +-- Failure --> Retry with exponential backoff (max 3 attempts)
    +-- Dead Letter --> Alert ops, manual review
```

**Why BullMQ:** Email and SMS are external API calls that can fail, be rate-limited, or time out. A queue ensures delivery, handles retries, and decouples the sending from the business logic. Redis is already in the stack (used by Socket.io adapter), so BullMQ adds no new infrastructure.

### WebSocket Integration

The `/notifications` namespace (defined in `websockets.md`) handles in-app delivery:

```typescript
// NotificationGateway emits to specific user rooms
this.server
  .to(`user:${userId}`)
  .emit('notification:new', {
    id: notification.id,
    type: 'load:assigned',
    title: 'Load Assigned',
    body: 'Load #TMS-4521 assigned to ABC Trucking',
    data: { loadId: 'uuid', carrierId: 'uuid' },
    createdAt: '2026-03-07T14:30:00Z',
  });
```

For tenant-wide broadcasts (system alerts):

```typescript
this.server
  .to(`tenant:${tenantId}`)
  .emit('notification:new', payload);
```

---

## 5. Notification Data Model

### Notification (persisted in-app notifications)

```prisma
model Notification {
  id          String    @id @default(uuid())
  tenantId    String
  userId      String    // recipient
  type        String    // event type key, e.g. "load:assigned"
  channel     NotificationChannel  // IN_APP, EMAIL, SMS
  title       String
  body        String
  data        Json?     // arbitrary payload (loadId, invoiceId, etc.)
  readAt      DateTime?
  archivedAt  DateTime?
  createdAt   DateTime  @default(now())

  tenant      Tenant    @relation(fields: [tenantId], references: [id])
  user        User      @relation(fields: [userId], references: [id])

  @@index([tenantId, userId, readAt])
  @@index([tenantId, userId, createdAt])
}

enum NotificationChannel {
  IN_APP
  EMAIL
  SMS
  PUSH
}
```

### NotificationPreference (user opt-in/opt-out per event)

```prisma
model NotificationPreference {
  id        String   @id @default(uuid())
  tenantId  String
  userId    String
  eventType String   // e.g. "load:assigned", "invoice:created"
  channel   NotificationChannel
  enabled   Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  user      User     @relation(fields: [userId], references: [id])

  @@unique([tenantId, userId, eventType, channel])
}
```

### Event Type Registry

Centralized enum/constant for all notification event types:

```typescript
export const NOTIFICATION_EVENTS = {
  // Loads
  'load:assigned':        { defaultChannels: ['IN_APP', 'EMAIL'], transactional: false },
  'load:statusChanged':   { defaultChannels: ['IN_APP'],          transactional: false },

  // Accounting
  'invoice:created':      { defaultChannels: ['IN_APP', 'EMAIL'], transactional: true },
  'payment:received':     { defaultChannels: ['IN_APP', 'EMAIL'], transactional: false },
  'settlement:processed': { defaultChannels: ['IN_APP', 'EMAIL'], transactional: true },

  // Carrier
  'insurance:expiring':   { defaultChannels: ['IN_APP', 'EMAIL', 'SMS'], transactional: false },
  'checkCall:overdue':    { defaultChannels: ['IN_APP', 'SMS'],   transactional: false },

  // System
  'system:alert':         { defaultChannels: ['IN_APP', 'EMAIL'], transactional: true },
  'system:maintenance':   { defaultChannels: ['IN_APP', 'EMAIL'], transactional: true },
} as const;
```

Events marked `transactional: true` bypass user preference opt-outs (invoices, settlements, system alerts always deliver).

---

## 6. NotificationService API

### Core Interface

```typescript
interface NotificationDispatchOptions {
  event: string;                    // Key from NOTIFICATION_EVENTS
  tenantId: string;
  recipients: {
    userIds?: string[];             // Specific users
    roles?: string[];               // All users with role (tenant-scoped)
    broadcast?: boolean;            // All users in tenant
  };
  data: {
    title: string;
    body: string;
    payload?: Record<string, any>; // Entity IDs, amounts, dates
  };
  overrideChannels?: NotificationChannel[]; // Force specific channels
}

@Injectable()
export class NotificationService {
  async dispatch(options: NotificationDispatchOptions): Promise<void>;
  async markRead(tenantId: string, userId: string, notificationId: string): Promise<void>;
  async markAllRead(tenantId: string, userId: string): Promise<void>;
  async getUnreadCount(tenantId: string, userId: string): Promise<number>;
  async getUserNotifications(tenantId: string, userId: string, pagination: PaginationDto): Promise<PaginatedResult<Notification>>;
  async updatePreference(tenantId: string, userId: string, eventType: string, channel: NotificationChannel, enabled: boolean): Promise<void>;
}
```

### Usage from Other Services

```typescript
// In LoadsService after assigning a carrier
await this.notificationService.dispatch({
  event: 'load:assigned',
  tenantId: load.tenantId,
  recipients: {
    userIds: [dispatcher.userId, carrierContact.userId],
  },
  data: {
    title: 'Load Assigned',
    body: `Load #${load.loadNumber} assigned to ${carrier.name}`,
    payload: { loadId: load.id, carrierId: carrier.id },
  },
});
```

---

## 7. Frontend Integration

### Notification Bell Component

```
Header Bar
  [Bell Icon] (badge: unread count)
     |
     v
  Dropdown Panel
    - List of recent notifications (paginated, infinite scroll)
    - "Mark all as read" button
    - Click notification -> navigate to relevant page
    - "View all" -> /notifications page
```

### Frontend Hooks

```
apps/web/lib/hooks/notifications/
  use-notifications.ts         -- GET /notifications (paginated list)
  use-unread-count.ts          -- GET /notifications/unread-count
  use-mark-read.ts             -- PATCH /notifications/:id/read
  use-mark-all-read.ts         -- PATCH /notifications/read-all
  use-notification-prefs.ts    -- GET/PUT /notifications/preferences
  use-realtime-notifications.ts -- Socket.io listener for notification:new
```

### Real-Time Hook Pattern

```typescript
export function useRealtimeNotifications() {
  const socket = useSocket('/notifications');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket.current) return;

    socket.current.on('notification:new', (notification) => {
      // Optimistically add to cache
      queryClient.setQueryData(['notifications'], (old) => ({
        ...old,
        data: [notification, ...(old?.data ?? [])],
      }));

      // Increment unread count
      queryClient.setQueryData(['notifications', 'unread-count'], (old) => ({
        data: (old?.data ?? 0) + 1,
      }));

      // Optional: show toast
      toast.info(notification.title, { description: notification.body });
    });
  }, [socket, queryClient]);
}
```

---

## 8. Rate Limiting

| Channel | Limit | Scope | Notes |
|---------|-------|-------|-------|
| In-App (WebSocket) | 10/min | Per user | Prevents notification flood in UI |
| Email (non-transactional) | 5/hour | Per user | Digest/batch if exceeded |
| Email (transactional) | No limit | -- | Invoices, password resets always send |
| SMS | 3/hour | Per phone number | Cost control + carrier spam filters |

### Deduplication

The notification service deduplicates by `(tenantId, userId, eventType, entityId)` within a 5-minute window. This prevents duplicate notifications when:

- A service retries after a transient failure
- Multiple status changes happen rapidly on the same entity
- Webhook events fire more than once

### Quiet Hours (Future -- P3)

- Users can set quiet hours (e.g., 10 PM - 7 AM in their timezone)
- During quiet hours: in-app notifications still persist (visible on next login), email queues for morning delivery, SMS suppressed entirely
- Transactional messages ignore quiet hours

---

## 9. REST API Endpoints

All endpoints are tenant-scoped and require `JwtAuthGuard`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/notifications` | List user's notifications (paginated) |
| GET | `/api/v1/notifications/unread-count` | Get unread count |
| PATCH | `/api/v1/notifications/:id/read` | Mark single notification as read |
| PATCH | `/api/v1/notifications/read-all` | Mark all as read |
| DELETE | `/api/v1/notifications/:id` | Archive/soft-delete a notification |
| GET | `/api/v1/notifications/preferences` | Get user's notification preferences |
| PUT | `/api/v1/notifications/preferences` | Update preferences (bulk) |

**Response format** (follows Ultra TMS API envelope):

```json
// GET /api/v1/notifications
{
  "data": [
    {
      "id": "uuid",
      "type": "load:assigned",
      "channel": "IN_APP",
      "title": "Load Assigned",
      "body": "Load #TMS-4521 assigned to ABC Trucking",
      "data": { "loadId": "uuid", "carrierId": "uuid" },
      "readAt": null,
      "createdAt": "2026-03-07T14:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}

// GET /api/v1/notifications/unread-count
{
  "data": 7
}
```

---

## 10. Error Handling & Resilience

| Failure | Behavior |
|---------|----------|
| WebSocket disconnected | Notification persisted to DB; user sees it on reconnect or page refresh (React Query polling) |
| SendGrid API down | Job stays in BullMQ queue; retries with exponential backoff (1s, 4s, 16s); max 3 attempts |
| Twilio API down | Same BullMQ retry strategy as email |
| Invalid email address | Skip send, log warning, flag in email log as `FAILED` |
| Invalid phone number | Skip send, log warning; no SMS fallback |
| Redis down | In-app notifications still persist to Postgres; email/SMS queues unavailable until Redis recovers |
| Rate limit exceeded | Non-transactional messages queued for later delivery; transactional messages always attempt |
| Dead letter (3 failed retries) | Job moved to dead letter queue; ops alert generated; manual review required |

---

## 11. Security Considerations

1. **Tenant isolation:** Every notification query filters by `tenantId`. WebSocket rooms enforce `tenant:{tenantId}` membership (see `websockets.md`).
2. **No sensitive data in WebSocket payloads:** Notifications contain IDs and display text only. Full details fetched via REST on click.
3. **Email content:** No passwords, tokens, or PII in email body beyond what is necessary (e.g., invoice number, not full bank details).
4. **SMS opt-in:** TCPA compliance requires opt-in consent. Opt-out via "STOP" reply. System respects opt-out status stored in user preferences.
5. **Preference enforcement:** Users cannot disable transactional notifications (invoices, password resets, system alerts).

---

## 12. Implementation Plan

### Phase 1: In-App Notifications (depends on QS-001)

1. Create Prisma models: `Notification`, `NotificationPreference`
2. Build `NotificationService` with `dispatch()`, `markRead()`, `getUnreadCount()`
3. Build `NotificationController` with REST endpoints
4. Build `NotificationGateway` (Socket.io `/notifications` namespace)
5. Wire first event: `load:assigned` in LoadsService
6. Build frontend: bell icon component, dropdown panel, `useRealtimeNotifications` hook

### Phase 2: Email Channel (depends on BACK-015)

1. Install BullMQ; configure email queue with Redis
2. Build email worker that processes queue jobs via SendGrid
3. Wire NotificationService channel router to enqueue emails
4. Implement email templates for P0 events (invoice, rate confirmation, settlement)
5. Build email log tracking (sent, delivered, opened via SendGrid webhooks)

### Phase 3: SMS Channel

1. Configure SMS queue in BullMQ (separate from email queue)
2. Build SMS worker that processes jobs via Twilio
3. Wire P1 SMS events (check call overdue, driver dispatch, insurance expiring)
4. Implement opt-in/opt-out tracking and TCPA compliance

### Phase 4: Preferences UI

1. Build `/settings/notifications` page
2. Matrix UI: rows = event types, columns = channels, cells = toggle switches
3. Wire to `GET/PUT /notifications/preferences` endpoints

---

## 13. Dependencies

| Dependency | Type | Blocks |
|------------|------|--------|
| **QS-001** -- WebSocket gateways | Task | Phase 1 (in-app channel) |
| **BACK-015** -- Email notification wiring | Task | Phase 2 (email channel) |
| **ADR-011** -- Socket.io decision | Architecture | WebSocket namespace design |
| **ADR-015** -- Redis/BullMQ for queues | Architecture | Email + SMS queue processing |
| **websockets.md** | Spec | `/notifications` namespace, room strategy, event naming |
| **email-service.md** | Guide | SendGrid integration patterns, template structure |
| **sms-service.md** | Guide | Twilio integration, E.164 format, opt-in/opt-out rules |
| **Prisma migration** | Database | New models: Notification, NotificationPreference |
| **BullMQ + @nestjs/bullmq** | Package | Queue infrastructure for email/SMS workers |

---

## 14. Open Questions

1. **Notification retention:** How long to keep read notifications? Suggest 90 days, then archive/purge.
2. **Digest emails:** Should we batch non-urgent notifications into a daily digest email? (P2+)
3. **Mobile push:** If a mobile app is built, push notifications would use Firebase Cloud Messaging. Architecture supports adding a PUSH channel later.
4. **Webhook channel:** Some customers may want webhook callbacks for events. This would be a fifth channel (P3).
5. **Notification center page:** Full `/notifications` page with filters (by type, read/unread, date range) -- build in Phase 1 or defer?
