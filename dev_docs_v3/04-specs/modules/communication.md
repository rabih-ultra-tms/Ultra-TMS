# Communication Module API Spec

**Module:** `apps/api/src/modules/communication/`
**Base path:** `/api/v1/`
**Controllers:** EmailController, NotificationsController, PreferencesController, SmsController, TemplatesController

## Auth

All controllers use `@UseGuards(JwtAuthGuard)` with `@CurrentTenant()` and `@CurrentUser('id')`.

---

## EmailController

**Path prefix:** `email`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/email/send` | JWT only, @Throttle | Send email |
| POST | `/email/send-bulk` | JWT only, @Throttle | Send bulk emails |
| GET | `/email/logs` | JWT only | List email logs |
| POST | `/email/resend/:id` | JWT only | Resend email |
| GET | `/email/stats` | JWT only | Get email statistics |

**Rate limiting:** Send endpoints use `@Throttle()`.

---

## NotificationsController

**Path prefix:** `notifications`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/notifications` | JWT only | List notifications |
| GET | `/notifications/unread-count` | JWT only | Get unread count |
| POST | `/notifications/:id/mark-read` | JWT only | Mark notification as read |
| POST | `/notifications/mark-all-read` | JWT only | Mark all as read |
| DELETE | `/notifications/:id` | JWT only | Delete notification |

---

## PreferencesController

**Path prefix:** `communication/preferences`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/communication/preferences` | JWT only | Get communication preferences |
| PUT | `/communication/preferences` | JWT only | Update preferences |
| POST | `/communication/preferences/reset` | JWT only | Reset to defaults |

---

## SmsController

**Path prefix:** `sms`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/sms/send` | JWT only, @Throttle | Send SMS |
| GET | `/sms/conversations` | JWT only | List SMS conversations |
| POST | `/sms/reply` | JWT only | Reply to SMS |
| POST | `/sms/close/:conversationId` | JWT only | Close conversation |
| GET | `/sms/logs` | JWT only | List SMS logs |
| GET | `/sms/stats` | JWT only | Get SMS statistics |
| POST | `/sms/webhook` | JWT only | SMS webhook handler |

**Rate limiting:** Send endpoint uses `@Throttle()`.

---

## TemplatesController

**Path prefix:** `communication/templates`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/communication/templates` | JWT only | List templates |
| POST | `/communication/templates` | JWT only | Create template |
| GET | `/communication/templates/:id` | JWT only | Get template by ID |
| PUT | `/communication/templates/:id` | JWT only | Update template |
| DELETE | `/communication/templates/:id` | JWT only | Delete template |
| POST | `/communication/templates/:id/clone` | JWT only | Clone template |
| POST | `/communication/templates/:id/preview` | JWT only | Preview template |

---

## Known Issues

- No RolesGuard -- all communication endpoints accessible to any authenticated user
- SMS webhook endpoint should likely be @Public() instead of JWT-protected
