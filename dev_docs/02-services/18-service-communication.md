# Communication Service

## Overview

| Attribute             | Value                          |
| --------------------- | ------------------------------ |
| **Service ID**        | 11                             |
| **Category**          | Platform Services              |
| **Phase**             | A (Internal MVP)               |
| **Development Weeks** | 53-56                          |
| **Priority**          | P1 - High                      |
| **Dependencies**      | Auth/Admin (01), TMS Core (04) |

## Purpose

The Communication Service handles all platform communications including email, SMS, push notifications, in-app messaging, and real-time updates. It supports multi-language templates (English/Spanish) and provides unified communication history across all channels.

## Features

### Email Communication

- Transactional emails
- Template-based sending
- Email tracking (open/click)
- Attachment support
- Bulk email campaigns
- Inbox integration

### SMS Communication

- Transactional SMS
- Two-way messaging
- Short code support
- Opt-in/out management
- Delivery status tracking

### Push Notifications

- Mobile app notifications
- Web push notifications
- Notification preferences
- Badge counts
- Deep linking

### In-App Messaging

- Real-time chat
- Internal messaging
- Notification center
- Read receipts
- @mentions

### Communication Templates

- Multi-language (EN/ES)
- Dynamic variables
- Category management
- Version control
- A/B testing support

## Database Schema

```sql
-- Communication Templates
CREATE TABLE communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Template details
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL, -- LOAD_ASSIGNED, POD_REQUEST, etc.
    description TEXT,
    category VARCHAR(50), -- LOAD, CARRIER, CUSTOMER, SYSTEM

    -- Channel
    channel VARCHAR(50) NOT NULL, -- EMAIL, SMS, PUSH, IN_APP

    -- Content (multiple languages)
    subject_en VARCHAR(500),
    subject_es VARCHAR(500),
    body_en TEXT NOT NULL,
    body_es TEXT,

    -- Email specific
    from_name VARCHAR(255),
    from_email VARCHAR(255),
    reply_to VARCHAR(255),

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    is_system BOOLEAN DEFAULT false,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, code, channel)
);

CREATE INDEX idx_comm_templates_tenant ON communication_templates(tenant_id);
CREATE INDEX idx_comm_templates_code ON communication_templates(tenant_id, code);
CREATE INDEX idx_comm_templates_channel ON communication_templates(tenant_id, channel);

-- Communication Log
CREATE TABLE communication_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Message details
    channel VARCHAR(50) NOT NULL, -- EMAIL, SMS, PUSH, IN_APP
    template_id UUID REFERENCES communication_templates(id),
    template_code VARCHAR(100),

    -- Recipients
    recipient_type VARCHAR(50), -- USER, CARRIER, CONTACT, DRIVER
    recipient_id UUID,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),
    recipient_name VARCHAR(255),

    -- Content
    subject VARCHAR(500),
    body TEXT NOT NULL,
    body_html TEXT,
    language VARCHAR(10) DEFAULT 'en',

    -- Attachments (for email)
    attachments JSONB, -- [{name, url, size}]

    -- Entity association
    entity_type VARCHAR(50), -- LOAD, ORDER, CARRIER, COMPANY
    entity_id UUID,

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, SENT, DELIVERED, FAILED, BOUNCED, OPENED, CLICKED

    -- Tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,

    -- Provider details
    provider VARCHAR(50), -- SENDGRID, TWILIO, FCM
    provider_message_id VARCHAR(255),

    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_comm_log_tenant ON communication_log(tenant_id);
CREATE INDEX idx_comm_log_recipient ON communication_log(recipient_type, recipient_id);
CREATE INDEX idx_comm_log_entity ON communication_log(entity_type, entity_id);
CREATE INDEX idx_comm_log_status ON communication_log(tenant_id, status);
CREATE INDEX idx_comm_log_channel ON communication_log(tenant_id, channel);
CREATE INDEX idx_comm_log_date ON communication_log(tenant_id, created_at);

-- SMS Conversations
CREATE TABLE sms_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Participants
    phone_number VARCHAR(50) NOT NULL,
    participant_type VARCHAR(50), -- CARRIER, DRIVER, CONTACT
    participant_id UUID,
    participant_name VARCHAR(255),

    -- Load association (optional)
    load_id UUID REFERENCES loads(id),

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, CLOSED

    -- Unread count
    unread_count INTEGER DEFAULT 0,

    -- Last message
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, phone_number, load_id)
);

CREATE INDEX idx_sms_conv_tenant ON sms_conversations(tenant_id);
CREATE INDEX idx_sms_conv_phone ON sms_conversations(phone_number);
CREATE INDEX idx_sms_conv_participant ON sms_conversations(participant_type, participant_id);
CREATE INDEX idx_sms_conv_load ON sms_conversations(load_id);

-- SMS Messages
CREATE TABLE sms_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES sms_conversations(id),

    -- Direction
    direction VARCHAR(20) NOT NULL, -- INBOUND, OUTBOUND

    -- Content
    body TEXT NOT NULL,
    media_urls TEXT[],

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, SENT, DELIVERED, FAILED, RECEIVED

    -- Provider
    provider_message_id VARCHAR(255),

    -- Timing
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,

    -- Sender (for outbound)
    sent_by UUID REFERENCES users(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sms_messages_conv ON sms_messages(conversation_id);
CREATE INDEX idx_sms_messages_date ON sms_messages(created_at);

-- Push Notification Tokens
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Token
    token VARCHAR(500) NOT NULL,

    -- Device info
    platform VARCHAR(50) NOT NULL, -- IOS, ANDROID, WEB
    device_id VARCHAR(255),
    device_name VARCHAR(255),

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INVALID, REVOKED

    -- Timing
    last_used_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(token)
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_tenant ON push_tokens(tenant_id);

-- Notification Preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Notification type
    notification_type VARCHAR(100) NOT NULL, -- LOAD_ASSIGNED, POD_RECEIVED, etc.

    -- Channel preferences
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,

    -- Timing preferences
    instant BOOLEAN DEFAULT true,
    daily_digest BOOLEAN DEFAULT false,
    weekly_digest BOOLEAN DEFAULT false,

    -- Quiet hours
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone VARCHAR(50),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id, notification_type)
);

CREATE INDEX idx_notif_prefs_user ON notification_preferences(user_id);
CREATE INDEX idx_notif_prefs_tenant ON notification_preferences(tenant_id);

-- In-App Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Content
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    notification_type VARCHAR(100) NOT NULL,

    -- Entity reference
    entity_type VARCHAR(50),
    entity_id UUID,

    -- Action
    action_url VARCHAR(500),
    action_data JSONB,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Priority
    priority VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT

    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(tenant_id, notification_type);

-- Email Opt-Out
CREATE TABLE email_optout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,

    optout_type VARCHAR(50), -- ALL, MARKETING, TRANSACTIONAL

    opted_out_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT,

    UNIQUE(email, optout_type)
);

CREATE INDEX idx_email_optout_email ON email_optout(email);

-- SMS Opt-Out
CREATE TABLE sms_optout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(50) NOT NULL,

    opted_out_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT,

    UNIQUE(phone_number)
);

CREATE INDEX idx_sms_optout_phone ON sms_optout(phone_number);
```

## API Endpoints

### Email

| Method | Endpoint                                    | Description        |
| ------ | ------------------------------------------- | ------------------ |
| POST   | `/api/v1/communication/email/send`          | Send email         |
| POST   | `/api/v1/communication/email/send-template` | Send from template |
| GET    | `/api/v1/communication/email/log`           | Email history      |
| GET    | `/api/v1/communication/email/log/:id`       | Get email details  |
| POST   | `/api/v1/communication/email/webhook`       | Provider webhook   |

### SMS

| Method | Endpoint                                               | Description          |
| ------ | ------------------------------------------------------ | -------------------- |
| POST   | `/api/v1/communication/sms/send`                       | Send SMS             |
| GET    | `/api/v1/communication/sms/conversations`              | List conversations   |
| GET    | `/api/v1/communication/sms/conversations/:id`          | Get conversation     |
| GET    | `/api/v1/communication/sms/conversations/:id/messages` | Get messages         |
| POST   | `/api/v1/communication/sms/conversations/:id/send`     | Send in conversation |
| POST   | `/api/v1/communication/sms/webhook`                    | Twilio webhook       |

### Push Notifications

| Method | Endpoint                                | Description      |
| ------ | --------------------------------------- | ---------------- |
| POST   | `/api/v1/communication/push/send`       | Send push        |
| POST   | `/api/v1/communication/push/tokens`     | Register token   |
| DELETE | `/api/v1/communication/push/tokens/:id` | Remove token     |
| GET    | `/api/v1/communication/push/tokens`     | List user tokens |

### In-App Notifications

| Method | Endpoint                             | Description         |
| ------ | ------------------------------------ | ------------------- |
| GET    | `/api/v1/notifications`              | List notifications  |
| GET    | `/api/v1/notifications/unread-count` | Get unread count    |
| PATCH  | `/api/v1/notifications/:id/read`     | Mark as read        |
| PATCH  | `/api/v1/notifications/read-all`     | Mark all read       |
| DELETE | `/api/v1/notifications/:id`          | Delete notification |

### Templates

| Method | Endpoint                                      | Description      |
| ------ | --------------------------------------------- | ---------------- |
| GET    | `/api/v1/communication/templates`             | List templates   |
| POST   | `/api/v1/communication/templates`             | Create template  |
| GET    | `/api/v1/communication/templates/:id`         | Get template     |
| PUT    | `/api/v1/communication/templates/:id`         | Update template  |
| DELETE | `/api/v1/communication/templates/:id`         | Delete template  |
| POST   | `/api/v1/communication/templates/:id/preview` | Preview template |

### Preferences

| Method | Endpoint                             | Description        |
| ------ | ------------------------------------ | ------------------ |
| GET    | `/api/v1/communication/preferences`  | Get preferences    |
| PUT    | `/api/v1/communication/preferences`  | Update preferences |
| POST   | `/api/v1/communication/optout/email` | Email opt-out      |
| POST   | `/api/v1/communication/optout/sms`   | SMS opt-out        |

## Events

### Published Events

| Event                  | Trigger            | Payload      |
| ---------------------- | ------------------ | ------------ |
| `email.sent`           | Email dispatched   | Log entry    |
| `email.delivered`      | Delivery confirmed | Log entry    |
| `email.opened`         | Email opened       | Log entry    |
| `email.bounced`        | Email bounced      | Log entry    |
| `sms.sent`             | SMS dispatched     | Message data |
| `sms.delivered`        | SMS delivered      | Message data |
| `sms.received`         | Inbound SMS        | Message data |
| `push.sent`            | Push sent          | Notification |
| `notification.created` | New notification   | Notification |

### Subscribed Events

| Event                | Source     | Action                    |
| -------------------- | ---------- | ------------------------- |
| `load.assigned`      | TMS Core   | Send carrier notification |
| `load.delivered`     | TMS Core   | Request POD               |
| `invoice.sent`       | Accounting | Send to customer          |
| `insurance.expiring` | Carrier    | Send reminder             |
| `quote.sent`         | Sales      | Email to customer         |

## Notification Types

### Load Notifications

- `LOAD_ASSIGNED` - Carrier assignment
- `LOAD_PICKUP_REMINDER` - Pickup reminder
- `LOAD_DELIVERED` - Delivery confirmation
- `POD_REQUEST` - POD request
- `POD_RECEIVED` - POD received
- `CHECK_CALL_DUE` - Check call reminder

### Carrier Notifications

- `CARRIER_APPROVED` - Onboarding complete
- `INSURANCE_EXPIRING` - Insurance warning
- `COMPLIANCE_ALERT` - Compliance issue
- `PAYMENT_SENT` - Payment confirmation

### Customer Notifications

- `QUOTE_SENT` - Quote delivery
- `ORDER_CONFIRMED` - Order confirmation
- `INVOICE_SENT` - Invoice delivery
- `TRACKING_UPDATE` - Shipment update

## Template Variables

### Common Variables

```handlebars
{{recipient.name}}
{{recipient.email}}
{{company.name}}
{{company.logo_url}}
{{current_date}}
```

### Load Variables

```handlebars
{{load.load_number}}
{{load.pickup_city}},
{{load.pickup_state}}
{{load.delivery_city}},
{{load.delivery_state}}
{{load.pickup_date}}
{{load.delivery_date}}
{{load.rate}}
{{load.status}}
```

### Carrier Variables

```handlebars
{{carrier.name}}
{{carrier.mc_number}}
{{driver.name}}
{{driver.phone}}
```

## Sample Templates

### Load Assigned (Bilingual)

```html
<!-- English -->
<h2>Load Assignment - {{load.load_number}}</h2>
<p>You have been assigned to the following load:</p>
<ul>
  <li>
    Pickup: {{load.pickup_city}}, {{load.pickup_state}} on {{load.pickup_date}}
  </li>
  <li>
    Delivery: {{load.delivery_city}}, {{load.delivery_state}} on
    {{load.delivery_date}}
  </li>
  <li>Rate: ${{load.rate}}</li>
</ul>

<!-- Spanish -->
<h2>AsignaciÃ³n de Carga - {{load.load_number}}</h2>
<p>Se le ha asignado la siguiente carga:</p>
<ul>
  <li>
    Recogida: {{load.pickup_city}}, {{load.pickup_state}} el
    {{load.pickup_date}}
  </li>
  <li>
    Entrega: {{load.delivery_city}}, {{load.delivery_state}} el
    {{load.delivery_date}}
  </li>
  <li>Tarifa: ${{load.rate}}</li>
</ul>
```

### POD Request SMS (Bilingual)

```
EN: Load {{load_number}} delivered. Please reply with POD photo. Thank you!

ES: Carga {{load_number}} entregada. Por favor responda con foto del POD. Â¡Gracias!
```

## Real-Time Updates

### WebSocket Events

```typescript
// Socket.io rooms
socket.join(`user:${userId}`);
socket.join(`load:${loadId}`);
socket.join(`dispatch:${tenantId}`);

// Event types
interface RealtimeEvents {
  'notification:new': Notification;
  'notification:read': { id: string };
  'load:updated': LoadUpdate;
  'sms:received': SMSMessage;
  'check-call:due': CheckCallReminder;
}
```

## Configuration

### Environment Variables

```bash
# Email (SendGrid)
SENDGRID_API_KEY=your_api_key
EMAIL_FROM_ADDRESS=dispatch@company.com
EMAIL_FROM_NAME=Company Dispatch

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Push (Firebase)
FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY=your_key
FIREBASE_CLIENT_EMAIL=your_email

# Settings
DEFAULT_LANGUAGE=en
RETRY_FAILED_MESSAGES=true
MAX_RETRY_ATTEMPTS=3
```

## Screens

| Screen                | Description        | Features             |
| --------------------- | ------------------ | -------------------- |
| Notification Center   | User notifications | Filter, mark read    |
| SMS Inbox             | SMS conversations  | Reply, load context  |
| Email Log             | Sent emails        | Search, status       |
| Template Manager      | Manage templates   | Editor, preview      |
| Template Editor       | Edit template      | Variables, bilingual |
| Preferences           | User settings      | Channel toggles      |
| Communication History | Entity comms       | Timeline view        |

## Testing Checklist

### Unit Tests

- [ ] Template rendering
- [ ] Variable substitution
- [ ] Language detection
- [ ] Opt-out checking
- [ ] Preference application

### Integration Tests

- [ ] SendGrid email sending
- [ ] Twilio SMS sending
- [ ] Firebase push
- [ ] WebSocket events
- [ ] Webhook processing

### E2E Tests

- [ ] Complete notification flow
- [ ] SMS conversation
- [ ] Template creation and use
- [ ] Preference management
- [ ] Opt-out handling

---

**Navigation:** [â† Documents](../10-documents/README.md) | [Services Index](../README.md) | [Customer Portal â†’](../12-customer-portal/README.md)
