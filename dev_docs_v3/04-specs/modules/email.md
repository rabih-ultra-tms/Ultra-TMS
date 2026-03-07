# Email Module API Spec

**Module:** `apps/api/src/modules/email/`
**Base path:** N/A — no HTTP controllers
**Type:** Infrastructure module only (service layer, no REST API)
**Note:** This module (`apps/api/src/modules/email/`) is the LOW-LEVEL email transport layer. The HTTP email API is in `communication/email.controller.ts` (see `communication.md`).

---

## Purpose

`EmailModule` provides `EmailService` which wraps SendGrid (or other providers). Other modules inject `EmailService` to send transactional emails.

```typescript
// Usage in other services
constructor(private readonly emailService: EmailService) {}

await this.emailService.send({
  to: ['user@example.com'],
  subject: 'Your invoice is ready',
  templateId: 'invoice-ready',
  data: { invoiceNumber: 'INV-2026-00042' }
});
```

---

## Environment Config

```
SENDGRID_API_KEY=SG.xxx        # Required for production
EMAIL_FROM=noreply@ultratms.com
EMAIL_FROM_NAME=Ultra TMS
```

If `SENDGRID_API_KEY` not set, emails are logged to console (development mode).

---

## No HTTP endpoints

This module does NOT expose any REST endpoints. For email sending/logs via HTTP, see `communication.md` (EmailController at `communication/email`).

---

## Module structure

```
email/
  email.module.ts       — exports EmailService
  email.service.ts      — wraps SendGrid SDK
  email.service.spec.ts — unit tests
```
