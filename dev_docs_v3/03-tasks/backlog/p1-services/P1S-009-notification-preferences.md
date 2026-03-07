# P1S-009: Notification Preferences

**Priority:** P1
**Service:** Communication
**Scope:** User-configurable notification preferences

## Current State
No notification preferences exist. No way for users to opt in/out of specific notification types.

## Requirements
- Settings page for notification preferences
- Per-notification-type toggle (email, SMS, in-app)
- Categories: Load updates, Invoice reminders, Carrier alerts, System notifications
- Frequency settings (immediate, daily digest, weekly digest)
- "Do not disturb" schedule

## Acceptance Criteria
- [ ] Notification preferences page accessible from settings
- [ ] Toggle per notification type and channel
- [ ] Frequency settings work
- [ ] Preferences saved and applied to notification delivery
- [ ] Default preferences for new users

## Dependencies
- P1S-007 (Communication center)
- UX-020 (Notification bell)

## Estimated Effort
M
