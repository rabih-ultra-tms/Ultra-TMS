# UX-020: Notification Bell with Unread Count

**Priority:** P1
**Service:** Frontend UX / Notifications
**Scope:** Add notification bell icon in header with unread count badge

## Current State
No notification system in the frontend. The WebSocket namespace for notifications is planned (QS-001) but not yet implemented.

## Requirements
- Bell icon in top navigation bar
- Unread count badge (red dot with number)
- Dropdown panel showing recent notifications
- Mark as read functionality
- "View all" link to full notifications page
- Real-time updates via WebSocket

## Acceptance Criteria
- [ ] Bell icon visible in header
- [ ] Unread count badge shows correct number
- [ ] Dropdown shows recent notifications
- [ ] Click notification navigates to relevant page
- [ ] Mark as read works
- [ ] Real-time updates via WebSocket
- [ ] Empty state when no notifications

## Dependencies
- QS-001 (WebSocket gateways) for real-time updates
- Notifications backend service

## Estimated Effort
L
