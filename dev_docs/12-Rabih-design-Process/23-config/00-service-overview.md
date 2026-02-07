# Service 23: Config

## Service Overview
The Config service provides centralized system configuration management, including feature flags, email settings, notification rules, integration configuration, custom fields, lookup tables, and system health monitoring.

## Screens

| # | Screen | Type | Priority | Status |
|---|--------|------|----------|--------|
| 1 | System Config | dashboard | P1 | Not Started |
| 2 | Feature Flags | list | P1 | Not Started |
| 3 | Email Settings | form | P1 | Not Started |
| 4 | Notification Config | form | P1 | Not Started |
| 5 | Integration Settings | form | P2 | Not Started |
| 6 | Custom Fields | list | P2 | Not Started |
| 7 | Lookup Tables | list | P2 | Not Started |
| 8 | System Health | dashboard | P1 | Not Started |

## Wave Assignment
**Wave:** Future

## Dependencies
- Authentication & Authorization (Service 02) for admin access control
- Email infrastructure for email settings
- Notification infrastructure for notification rules
- Third-party APIs for integration settings

## Notes
- Configuration changes should be audited via the Audit service
- Feature flags enable gradual rollout and A/B testing
- Custom fields allow tenants to extend the data model without code changes
