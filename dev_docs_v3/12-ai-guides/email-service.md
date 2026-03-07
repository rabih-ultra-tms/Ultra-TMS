# Email Service Integration Guide

> AI Dev Guide | SendGrid integration, email templates, transactional vs marketing

---

## Overview

Ultra TMS uses **SendGrid** for all transactional email. The integration is in the backend communication module.

## Environment Variables

```bash
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@ultratms.com
SENDGRID_FROM_NAME="Ultra TMS"
```

## Email Triggers

### Auth Emails

| Trigger | Template | Recipients |
|---------|----------|------------|
| User registration | Welcome + verify email link | New user |
| Forgot password | Reset password link (expires 1h) | User |
| Password changed | Confirmation notification | User |
| MFA enabled/disabled | Security notification | User |
| Account locked (5 failed logins) | Lockout notification | User |

### Operations Emails

| Trigger | Template | Recipients |
|---------|----------|------------|
| Load dispatched | Dispatch confirmation with details | Carrier contact, driver |
| Quote sent | Quote PDF attachment | Customer contact |
| Quote accepted | Confirmation | Sales rep |
| Quote expired | Expiry notification | Sales rep |
| Rate confirmation | Rate con PDF | Carrier contact |

### Accounting Emails

| Trigger | Template | Recipients |
|---------|----------|------------|
| Invoice created | Invoice PDF attachment | Customer billing contact |
| Payment reminder (1 day overdue) | Friendly reminder | Customer billing contact |
| Payment reminder (7 days) | Second notice | Customer billing contact |
| Payment reminder (30 days) | Final notice | Customer billing contact + accounting |
| Credit hold applied | Notification | Customer contact + sales rep |
| Settlement paid | Payment confirmation | Carrier contact |

### Compliance Emails

| Trigger | Template | Recipients |
|---------|----------|------------|
| Insurance expiring (30 days) | Warning | Carrier contact + carrier relations |
| Insurance expired | Suspension notification | Carrier contact + carrier relations |
| FMCSA authority change | Alert | Carrier relations |

## Email Template Structure

All emails use a consistent HTML template:

```
[Ultra TMS Logo]
[Header Bar]
[Body Content]
[Action Button (if applicable)]
[Footer with company info]
[Unsubscribe link (marketing only)]
```

## Transactional vs Marketing

| Type | SendGrid Category | Unsubscribe? | Examples |
|------|-------------------|-------------|----------|
| Transactional | Required for operation | No opt-out | Password reset, invoice, dispatch confirmation |
| Operational | Helpful but not required | Optional opt-out | Payment reminders, compliance warnings |
| Marketing | Promotional | Required opt-out | Product updates, feature announcements |

Ultra TMS currently only sends transactional and operational emails. Marketing emails are P3.

## Backend Implementation

```typescript
// apps/api/src/modules/communication/
// Key files:
//   email.service.ts -- SendGrid client wrapper
//   email-templates.ts -- Template definitions
//   email.module.ts -- NestJS module

// Usage pattern:
await this.emailService.send({
  to: customer.billingContact.email,
  template: 'invoice-created',
  data: {
    invoiceNumber: invoice.invoiceNumber,
    total: invoice.total,
    dueDate: invoice.dueDate,
    pdfUrl: invoice.pdfUrl,
  },
});
```

## Frontend Hooks

```
apps/web/lib/hooks/communication/
  use-send-email.ts    -- Manual email sending
  use-email-logs.ts    -- Email history/status
  use-auto-email.ts    -- Auto-email configuration
```

## Error Handling

| Error | Action |
|-------|--------|
| SendGrid API down | Queue email in Redis, retry with exponential backoff |
| Invalid email address | Log warning, skip send, flag in UI |
| Rate limited | Queue and retry after backoff period |
| Template not found | Log error, send plain text fallback |

## Email Tracking

- SendGrid provides open/click tracking
- Invoice emails track "viewed" status (SENT -> VIEWED)
- Tracking data stored in email log table
- Webhook endpoint receives SendGrid event notifications
