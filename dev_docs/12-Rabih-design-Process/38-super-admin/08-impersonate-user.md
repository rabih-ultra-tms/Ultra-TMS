# Impersonate User

> Service: Super Admin (Service 38) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Super Admin

---

## Design Status

This screen will be designed as part of a future wave.

## Screen Type
Tool

## Description
User impersonation tool that allows super admins to view the platform as a specific user for troubleshooting and support purposes, with a persistent banner indicating impersonation mode and full session logging.

## Key Design Considerations
- Prominent impersonation banner that cannot be dismissed, clearly showing the impersonated user and a quick exit button
- Complete audit logging of all actions taken during impersonation sessions with time-limited session expiration

## Dependencies
- User Directory (Service 38, Screen 6) for user selection
- Authentication service for impersonation session management
- Audit service for comprehensive session logging
