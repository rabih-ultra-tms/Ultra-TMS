# P1S-020: System Settings Page

**Priority:** P1
**Service:** Config
**Scope:** System-wide settings management page

## Current State
No system settings page exists. Settings sidebar link leads to 404.

## Requirements
- General settings (timezone, date format, currency)
- Email settings (SMTP configuration, sender address)
- Notification settings (global defaults)
- Integration settings (API keys for external services)
- Data retention settings
- Grouped into logical sections with tabs

## Acceptance Criteria
- [ ] Settings page accessible from sidebar
- [ ] Tabbed sections for different setting groups
- [ ] Settings save and apply correctly
- [ ] Validation on settings values
- [ ] Only ADMIN role can access
- [ ] Sidebar 404 resolved

## Dependencies
- Navigation config update to fix sidebar link

## Estimated Effort
M
