# Communication Service Implementation Prompt

## Context

You are implementing the **Communication Service** for Ultra-TMS, a comprehensive Transportation Management System. This is a monorepo with:
- **Backend**: NestJS + Prisma + PostgreSQL at `apps/api/`
- **Frontend**: Next.js 15 + TailwindCSS at `apps/web/`

## Current State
- Auth & Admin: Complete (30 endpoints, 12 UI screens)
- Documents, Accounting, Load Board, Commission: API Complete
- CRM, Sales, TMS Core, Carrier: Schema complete, basic CRUD endpoints exist
- Communication: **Not started** - your task

## Service Specification

### Overview
| Attribute | Value |
|-----------|-------|
| **Service ID** | 11 |
| **Category** | Operations Services |
| **Phase** | A (Internal MVP) |
| **Weeks** | 53-56 |
| **Priority** | P1 - High |
| **Dependencies** | Auth/Admin (01), TMS Core (04) |

### Purpose
Handle all platform communications: email, SMS, push notifications, in-app messaging. Support multi-language templates (EN/ES) with unified communication history.

## Implementation Tasks

### Phase 1: Database Schema (Prisma)

Add these models to `apps/api/prisma/schema.prisma`:

```prisma
// ============================================================================
// COMMUNICATION SERVICE (Service 11)
// ============================================================================

model CommunicationTemplate {
  id          String  @id @default(cuid())
  tenantId    String
  name        String  @db.VarChar(255)
  code        String  @db.VarChar(100) // LOAD_ASSIGNED, POD_REQUEST, etc.
  description String? @db.Text
  category    String? @db.VarChar(50) // LOAD, CARRIER, CUSTOMER, SYSTEM
  channel     String  @db.VarChar(50) // EMAIL, SMS, PUSH, IN_APP
  
  // Content (bilingual)
  subjectEn   String? @db.VarChar(500)
  subjectEs   String? @db.VarChar(500)
  bodyEn      String  @db.Text
  bodyEs      String? @db.Text
  
  // Email specific
  fromName    String? @db.VarChar(255)
  fromEmail   String? @db.VarChar(255)
  replyTo     String? @db.VarChar(255)
  
  status      String  @default("ACTIVE") @db.VarChar(50)
  isSystem    Boolean @default(false)
  
  // Audit
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  createdById String?
  
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  logs        CommunicationLog[]
  
  @@unique([tenantId, code, channel])
  @@index([tenantId])
  @@index([code])
  @@index([channel])
}

model CommunicationLog {
  id             String    @id @default(cuid())
  tenantId       String
  channel        String    @db.VarChar(50) // EMAIL, SMS, PUSH, IN_APP
  templateId     String?
  templateCode   String?   @db.VarChar(100)
  
  // Recipient
  recipientType  String?   @db.VarChar(50) // USER, CARRIER, CONTACT, DRIVER
  recipientId    String?
  recipientEmail String?   @db.VarChar(255)
  recipientPhone String?   @db.VarChar(50)
  recipientName  String?   @db.VarChar(255)
  
  // Content
  subject        String?   @db.VarChar(500)
  body           String    @db.Text
  bodyHtml       String?   @db.Text
  language       String    @default("en") @db.VarChar(10)
  attachments    Json?     // [{name, url, size}]
  
  // Entity association
  entityType     String?   @db.VarChar(50) // LOAD, ORDER, CARRIER, COMPANY
  entityId       String?
  
  // Status
  status         String    @default("PENDING") @db.VarChar(50)
  // PENDING, SENT, DELIVERED, FAILED, BOUNCED, OPENED, CLICKED
  
  // Tracking
  sentAt         DateTime?
  deliveredAt    DateTime?
  openedAt       DateTime?
  clickedAt      DateTime?
  failedAt       DateTime?
  
  // Provider
  provider           String?   @db.VarChar(50) // SENDGRID, TWILIO, FCM
  providerMessageId  String?   @db.VarChar(255)
  
  // Error handling
  errorMessage   String?   @db.Text
  retryCount     Int       @default(0)
  lastRetryAt    DateTime?
  
  metadata       Json      @default("{}")
  
  // Audit
  createdAt      DateTime  @default(now())
  createdById    String?
  
  tenant         Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  template       CommunicationTemplate? @relation(fields: [templateId], references: [id])
  
  @@index([tenantId])
  @@index([recipientType, recipientId])
  @@index([entityType, entityId])
  @@index([status])
  @@index([channel])
  @@index([createdAt])
}

model SmsConversation {
  id              String    @id @default(cuid())
  tenantId        String
  phoneNumber     String    @db.VarChar(50)
  participantType String?   @db.VarChar(50) // CARRIER, DRIVER, CONTACT
  participantId   String?
  participantName String?   @db.VarChar(255)
  loadId          String?
  
  status          String    @default("ACTIVE") @db.VarChar(50) // ACTIVE, CLOSED
  unreadCount     Int       @default(0)
  lastMessageAt   DateTime?
  lastMessagePreview String? @db.VarChar(255)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  tenant          Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  messages        SmsMessage[]
  
  @@unique([tenantId, phoneNumber, loadId])
  @@index([tenantId])
  @@index([phoneNumber])
}

model SmsMessage {
  id             String    @id @default(cuid())
  conversationId String
  direction      String    @db.VarChar(20) // INBOUND, OUTBOUND
  body           String    @db.Text
  mediaUrls      Json?     // Array of media URLs
  
  status         String    @default("PENDING") @db.VarChar(50)
  // PENDING, SENT, DELIVERED, FAILED, RECEIVED
  
  providerMessageId String? @db.VarChar(255)
  errorMessage   String?   @db.Text
  
  sentAt         DateTime?
  deliveredAt    DateTime?
  receivedAt     DateTime?
  readAt         DateTime?
  
  createdAt      DateTime  @default(now())
  createdById    String?
  
  conversation   SmsConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  @@index([conversationId])
  @@index([direction])
  @@index([createdAt])
}

model NotificationPreference {
  id          String  @id @default(cuid())
  tenantId    String
  userId      String
  
  // Notification types (which events to notify)
  loadAssigned        Boolean @default(true)
  loadStatusChange    Boolean @default(true)
  documentReceived    Boolean @default(true)
  invoiceCreated      Boolean @default(true)
  paymentReceived     Boolean @default(true)
  claimFiled          Boolean @default(true)
  carrierExpiring     Boolean @default(true)
  
  // Channels (how to notify)
  emailEnabled        Boolean @default(true)
  smsEnabled          Boolean @default(false)
  pushEnabled         Boolean @default(true)
  inAppEnabled        Boolean @default(true)
  
  // Quiet hours
  quietHoursEnabled   Boolean @default(false)
  quietHoursStart     String? @db.VarChar(5) // HH:MM
  quietHoursEnd       String? @db.VarChar(5)
  quietHoursTimezone  String? @db.VarChar(50)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([tenantId, userId])
  @@index([tenantId])
  @@index([userId])
}

model InAppNotification {
  id          String    @id @default(cuid())
  tenantId    String
  userId      String
  
  type        String    @db.VarChar(50) // LOAD, CARRIER, INVOICE, SYSTEM, etc.
  title       String    @db.VarChar(255)
  message     String    @db.Text
  icon        String?   @db.VarChar(50)
  actionUrl   String?   @db.VarChar(500)
  
  entityType  String?   @db.VarChar(50)
  entityId    String?
  
  isRead      Boolean   @default(false)
  readAt      DateTime?
  
  expiresAt   DateTime?
  
  createdAt   DateTime  @default(now())
  
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}
```

### Phase 2: NestJS Module Structure

Create at `apps/api/src/modules/communication/`:

```
communication/
├── communication.module.ts
├── dto/
│   ├── index.ts
│   ├── create-template.dto.ts
│   ├── update-template.dto.ts
│   ├── send-email.dto.ts
│   ├── send-sms.dto.ts
│   ├── create-notification.dto.ts
│   └── update-preferences.dto.ts
├── templates.controller.ts
├── templates.service.ts
├── email.controller.ts
├── email.service.ts
├── sms.controller.ts
├── sms.service.ts
├── notifications.controller.ts
├── notifications.service.ts
├── preferences.controller.ts
├── preferences.service.ts
└── providers/
    ├── sendgrid.provider.ts
    └── twilio.provider.ts
```

### Phase 3: API Endpoints (30 total)

#### Templates (8 endpoints)
```
POST   /communication/templates           - Create template
GET    /communication/templates           - List templates (paginated, filterable)
GET    /communication/templates/:id       - Get template details
PUT    /communication/templates/:id       - Update template
DELETE /communication/templates/:id       - Delete template
POST   /communication/templates/:id/clone - Clone template
GET    /communication/templates/codes     - List available template codes
POST   /communication/templates/preview   - Preview template with variables
```

#### Email (6 endpoints)
```
POST   /communication/email/send          - Send email (template-based or custom)
POST   /communication/email/send-bulk     - Send bulk email
GET    /communication/email/logs          - Get email logs (paginated)
GET    /communication/email/logs/:id      - Get specific email log
POST   /communication/email/resend/:id    - Resend failed email
GET    /communication/email/stats         - Email statistics (sent, opened, clicked)
```

#### SMS (8 endpoints)
```
POST   /communication/sms/send            - Send SMS
GET    /communication/sms/conversations   - List SMS conversations
GET    /communication/sms/conversations/:id - Get conversation with messages
POST   /communication/sms/conversations/:id/reply - Reply to conversation
POST   /communication/sms/webhook         - Twilio webhook for inbound SMS
GET    /communication/sms/logs            - SMS logs
GET    /communication/sms/stats           - SMS statistics
PATCH  /communication/sms/conversations/:id/close - Close conversation
```

#### Notifications (5 endpoints)
```
GET    /communication/notifications       - Get user notifications (paginated)
POST   /communication/notifications/:id/read - Mark notification as read
POST   /communication/notifications/read-all - Mark all as read
DELETE /communication/notifications/:id   - Delete notification
GET    /communication/notifications/unread-count - Get unread count
```

#### Preferences (3 endpoints)
```
GET    /communication/preferences         - Get current user preferences
PUT    /communication/preferences         - Update preferences
POST   /communication/preferences/reset   - Reset to defaults
```

### Phase 4: Template Variables

Standard variables available in all templates:
```
{{tenant.name}}
{{user.firstName}}
{{user.lastName}}
{{user.email}}
{{load.loadNumber}}
{{load.status}}
{{order.orderNumber}}
{{carrier.name}}
{{carrier.mcNumber}}
{{customer.name}}
{{appUrl}}
{{currentDate}}
{{currentYear}}
```

### Phase 5: Integration Events

Publish these events for other services to trigger communications:
```typescript
// Events to subscribe to (from other services)
'load.created'
'load.assigned'
'load.status.changed'
'order.created'
'order.status.changed'
'carrier.compliance.expiring'
'invoice.created'
'invoice.overdue'
'document.received'
'claim.filed'
'claim.resolved'

// Events to publish
'communication.email.sent'
'communication.email.delivered'
'communication.email.failed'
'communication.sms.sent'
'communication.sms.received'
'notification.created'
```

### Phase 6: Default Templates to Seed

Create seed data for these essential templates:
1. LOAD_ASSIGNED - When carrier is assigned to load
2. POD_REQUIRED - Request for POD from carrier
3. RATE_CONFIRMATION - Rate con sent to carrier
4. INVOICE_CREATED - Invoice sent to customer
5. PAYMENT_RECEIVED - Payment confirmation
6. TRACKING_UPDATE - Status update to customer
7. DOCUMENT_RECEIVED - Document received notification
8. WELCOME_USER - New user welcome
9. PASSWORD_RESET - Password reset link
10. CARRIER_COMPLIANCE_EXPIRING - Insurance/authority expiring

### Phase 7: Testing Requirements

1. **Unit Tests**: All services with mocked providers
2. **Integration Tests**: Full API flow with test database
3. **Template rendering tests**: Verify variable substitution
4. **Provider mock tests**: SendGrid/Twilio API mocking

## Environment Variables Required

```env
# Email (SendGrid)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@ultratms.com
SENDGRID_FROM_NAME=Ultra-TMS

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Push Notifications (Firebase)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

## Success Criteria

- [ ] All 30 API endpoints implemented and documented
- [ ] Prisma schema migrated successfully
- [ ] Email sending works with SendGrid (or mock in dev)
- [ ] SMS sending works with Twilio (or mock in dev)
- [ ] Template variable substitution works correctly
- [ ] Bilingual templates (EN/ES) supported
- [ ] Communication logs queryable by entity
- [ ] In-app notifications with real-time delivery (WebSocket optional)
- [ ] User preferences respected for notification routing
- [ ] All unit tests passing

## Files to Create/Modify

### New Files:
```
apps/api/src/modules/communication/communication.module.ts
apps/api/src/modules/communication/templates.controller.ts
apps/api/src/modules/communication/templates.service.ts
apps/api/src/modules/communication/email.controller.ts
apps/api/src/modules/communication/email.service.ts
apps/api/src/modules/communication/sms.controller.ts
apps/api/src/modules/communication/sms.service.ts
apps/api/src/modules/communication/notifications.controller.ts
apps/api/src/modules/communication/notifications.service.ts
apps/api/src/modules/communication/preferences.controller.ts
apps/api/src/modules/communication/preferences.service.ts
apps/api/src/modules/communication/providers/sendgrid.provider.ts
apps/api/src/modules/communication/providers/twilio.provider.ts
apps/api/src/modules/communication/dto/*.ts
apps/api/prisma/seed/communication-templates.ts
```

### Files to Modify:
```
apps/api/prisma/schema.prisma (add Communication models)
apps/api/src/app.module.ts (import CommunicationModule)
apps/api/prisma/seed.ts (add template seeding)
```

## Reference Documents

- Service Specification: `dev_docs/02-services/18-service-communication.md`
- API Standards: `dev_docs/08-standards/66-api-design-standards.md`
- Database Standards: `dev_docs/08-standards/67-database-design-standards.md`

---

## After Communication: Next Services

After completing Communication, proceed with:

1. **Claims Service** (Weeks 57-60)
   - Doc: `dev_docs/02-services/16-service-claims.md`
   - Dependencies now met: Auth ✅, TMS ✅, Carrier ✅, Accounting ✅, Documents ✅, Communication ✅

2. **Customer Portal** (Weeks 57-60)
   - Doc: `dev_docs/02-services/19-service-customer-portal.md`
   - Separate Next.js app or route group

3. **Carrier Portal** (Weeks 61-64)
   - Doc: `dev_docs/02-services/20-service-carrier-portal.md`
   - Carrier self-service features
