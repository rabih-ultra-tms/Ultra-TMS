# Communication Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| CommunicationLog | Email/SMS send history | CommunicationTemplate |
| CommunicationTemplate | Email/SMS templates (multi-language) | CommunicationLog |
| SmsConversation | SMS conversation threads | SmsMessage |
| SmsMessage | Individual SMS messages | SmsConversation |
| InAppNotification | In-app notification system | User |

## CommunicationLog

Tracks all outbound communications (email, SMS, push).

| Field | Type | Notes |
|-------|------|-------|
| channel | String | VarChar(50) — EMAIL, SMS, PUSH |
| templateId | String? | FK to CommunicationTemplate |
| templateCode | String? | VarChar(100) |
| recipientType | String? | VarChar(50) — CUSTOMER, CARRIER, DRIVER |
| recipientId | String? | Polymorphic FK |
| recipientEmail/Phone/Name | String? | |
| subject | String? | VarChar(500) |
| body | String | Plain text |
| bodyHtml | String? | HTML version |
| language | String | @default("en") |
| attachments | Json? | |
| entityType/entityId | String? | Related entity |
| status | String | @default("PENDING") — PENDING, SENT, DELIVERED, OPENED, FAILED |
| sentAt/deliveredAt/openedAt/clickedAt/failedAt | DateTime? | Tracking |
| provider | String? | SENDGRID, TWILIO |
| providerMessageId | String? | |
| errorMessage | String? | |
| retryCount | Int | @default(0) |

## CommunicationTemplate

Multi-language email/SMS templates.

| Field | Type | Notes |
|-------|------|-------|
| name | String | VarChar(255) |
| code | String | VarChar(100) — LOAD_DISPATCHED, INVOICE_SENT, etc. |
| category | String? | VarChar(50) |
| channel | String | VarChar(50) — EMAIL, SMS |
| subjectEn | String? | English subject |
| subjectEs | String? | Spanish subject |
| bodyEn | String | English body (supports Handlebars) |
| bodyEs | String? | Spanish body |
| fromName/fromEmail/replyTo | String? | |
| isSystem | Boolean | @default(false) — cannot be deleted |

**Unique:** `[tenantId, code, channel]`

## InAppNotification

In-app notifications for users.

| Field | Type | Notes |
|-------|------|-------|
| userId | String | FK to User |
| type | String | VarChar(50) — LOAD_UPDATE, PAYMENT, ALERT |
| title | String | VarChar(255) |
| message | String | |
| icon | String? | VarChar(50) |
| actionUrl | String? | VarChar(500) — link to navigate to |
| entityType/entityId | String? | Related entity |
| isRead | Boolean | @default(false) |
| readAt | DateTime? | |
| expiresAt | DateTime? | Auto-dismiss |

## SmsConversation / SmsMessage

SMS conversation threading for driver/carrier communication.

**SmsConversation:** tenantId, phoneNumber, contactName, contactType, relatedEntityType/Id, lastMessageAt, messageCount, isActive

**SmsMessage:** conversationId, direction (INBOUND/OUTBOUND), body, fromNumber, toNumber, status, provider, providerMessageId, sentAt/deliveredAt/failedAt
