# P2S-004: Carrier Portal Login

**Priority:** P2
**Service:** Carrier Portal
**Scope:** Separate login page for carrier portal

## Current State
No carrier portal exists. Environment variables `CARRIER_PORTAL_JWT_SECRET` are defined.

## Requirements
- Branded login page for carriers
- Separate from internal TMS login
- Carrier-specific JWT token
- Self-registration for new carriers
- Password reset flow

## Acceptance Criteria
- [ ] Carrier login page at dedicated route
- [ ] Authentication with carrier credentials
- [ ] Carrier JWT issued (separate from internal)
- [ ] Self-registration flow
- [ ] Password reset flow works
- [ ] Redirect to carrier dashboard on success

## Dependencies
- Carrier auth backend module

## Estimated Effort
M
