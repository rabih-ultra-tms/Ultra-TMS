# User Directory

> Service: Super Admin (Service 38) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Super Admin

---

## Design Status

This screen will be designed as part of a future wave.

## Screen Type
List

## Description
Platform-wide user directory listing all users across all tenants, with search, filtering by tenant/role/status, and administrative actions for account management.

## Key Design Considerations
- Cross-tenant user search with ability to find users by email, name, or phone number across the entire platform
- Bulk administrative actions for disabling accounts, resetting passwords, and forcing logout across tenants

## Dependencies
- Authentication service for user account data
- Tenants List (Service 38, Screen 2) for tenant context
- User Override (Service 38, Screen 7) for user-specific modifications
- Impersonate User (Service 38, Screen 8) for support access
