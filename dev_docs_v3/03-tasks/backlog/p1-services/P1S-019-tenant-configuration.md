# P1S-019: Tenant Configuration Panel

**Priority:** P1
**Service:** Config
**Scope:** Admin panel for tenant-specific configuration

## Current State
Multi-tenant architecture exists (tenantId on all entities) but no tenant configuration UI.

## Requirements
- Company profile settings (name, logo, address, contact info)
- Branding configuration (colors, logo placement)
- Business rules configuration (default payment terms, margins, etc.)
- User limits and plan information
- API key management

## Acceptance Criteria
- [ ] Company profile editable
- [ ] Logo upload and preview
- [ ] Business rules configurable
- [ ] Settings saved and applied across the tenant
- [ ] Only ADMIN role can access

## Dependencies
- Auth RBAC (ADMIN role required)

## Estimated Effort
M
