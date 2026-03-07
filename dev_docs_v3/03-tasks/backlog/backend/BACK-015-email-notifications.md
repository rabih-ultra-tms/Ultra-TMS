# BACK-015: Email Notification Triggers

**Priority:** P1
**Module:** `apps/api/src/modules/communication/`
**Endpoint(s):** Internal service calls (no direct API endpoints -- triggered by events)

## Current State
Communication module has full structure: email service/controller, notifications service/controller, preferences service/controller, SMS service/controller, templates service/controller, and providers directory. All have spec files. Need to verify email sending is functional and triggers are wired.

## Requirements
- Trigger email on: load assigned, load status change, invoice sent, settlement processed, insurance expiring
- Template system for email content (from templates service)
- User notification preferences (opt-in/opt-out per event type)
- SendGrid integration (SENDGRID_API_KEY optional env var)
- Email tracking (sent, delivered, opened)
- Fallback behavior when email service unavailable

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Emails send correctly via SendGrid
- [ ] Templates render with dynamic data
- [ ] User preferences respected

## Dependencies
- Prisma model: Notification, NotificationPreference, EmailTemplate
- Related modules: tms, accounting, carrier

## Estimated Effort
L
