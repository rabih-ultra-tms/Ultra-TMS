# Communication Service -- Overview

> Service: 11 - Communication | Wave: Future | Priority: P1
> Total Screens: 10 | Built: 0 | Remaining: 10
> Primary Personas: All Users, Dispatch, Admin
> Roles with Access: all_users, dispatcher, admin, super_admin
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Communication service provides a unified messaging platform for all internal and external communications within Ultra TMS. It encompasses email sending/receiving, SMS messaging, in-app notifications, email/SMS templates, automated message rules, and bulk messaging capabilities. This service is consumed by virtually every other service for notifications, alerts, and correspondence.

---

## 2. Screen Catalog (10 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Communication Hub | TBD | Dashboard | Not Started | `11-communication/01-communication-hub.md` | All Users |
| 02 | Inbox | TBD | List | Not Started | `11-communication/02-inbox.md` | All Users |
| 03 | Compose Email | TBD | Form | Not Started | `11-communication/03-compose-email.md` | All Users |
| 04 | SMS Compose | TBD | Form | Not Started | `11-communication/04-sms-compose.md` | Dispatch |
| 05 | Email Templates | TBD | List | Not Started | `11-communication/05-email-templates.md` | Admin |
| 06 | SMS Templates | TBD | List | Not Started | `11-communication/06-sms-templates.md` | Admin |
| 07 | Notification Center | TBD | List | Not Started | `11-communication/07-notification-center.md` | All Users |
| 08 | Communication Log | TBD | List | Not Started | `11-communication/08-communication-log.md` | Admin |
| 09 | Auto-Message Rules | TBD | List | Not Started | `11-communication/09-auto-message-rules.md` | Admin |
| 10 | Bulk Messaging | TBD | Tool | Not Started | `11-communication/10-bulk-messaging.md` | Admin |

---

## 3. Key Workflows

To be defined in a future wave.

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking | Yes |
| Service 02 - CRM | Customer contact info for email/SMS | Yes |
| Service 05 - Carrier | Carrier contact info for email/SMS | Yes |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 04 - TMS Core | Load status notifications, check call reminders | Yes |
| Service 05 - Carrier | Onboarding notifications, compliance reminders | Yes |
| Service 06 - Accounting | Invoice delivery, payment notifications | Yes |
| Service 09 - Claims | Claim status notifications | Yes |
| Service 10 - Documents | E-signature request notifications | Yes |
| Service 12 - Customer Portal | Customer notifications | Yes |
| Service 13 - Carrier Portal | Carrier notifications | Yes |
| Service 19 - Workflow | Workflow step notifications and approvals | Yes |

---

## 5. Wave Assignment

This service is assigned to a future wave. All 10 screens are pending design.

---

_Last Updated: 2026-02-06_
