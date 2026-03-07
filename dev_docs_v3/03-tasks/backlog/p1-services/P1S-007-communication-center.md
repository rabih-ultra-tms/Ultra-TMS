# P1S-007: Communication Center (Email/SMS Hub)

**Priority:** P1
**Service:** Communication
**Scope:** Centralized communication hub for emails and SMS messages

## Current State
No communication center exists. SendGrid and Twilio environment variables are defined but not integrated.

## Requirements
- Inbox view for all communications (sent and received)
- Filter by type (email, SMS), entity (carrier, customer, load)
- Compose email/SMS with templates
- Communication thread view per entity
- Attachment support for emails
- Read/unread tracking

## Acceptance Criteria
- [ ] Inbox shows all communications
- [ ] Filter by type and related entity
- [ ] Compose new email/SMS
- [ ] Thread view groups related messages
- [ ] Attachments supported
- [ ] Read/unread tracking works

## Dependencies
- SendGrid integration for email
- Twilio integration for SMS
- Backend communication module

## Estimated Effort
XL
