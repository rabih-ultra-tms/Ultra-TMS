# P2S-001: Customer Portal Login

**Priority:** P2
**Service:** Customer Portal
**Scope:** Separate login page for customer portal

## Current State
No customer portal exists. Environment variables `CUSTOMER_PORTAL_JWT_SECRET` are defined. The auth system has separate portal JWT support.

## Requirements
- Branded login page for customers
- Separate from internal TMS login
- Customer-specific JWT token
- Password reset flow
- Remember me functionality
- Company branding customization

## Acceptance Criteria
- [ ] Customer login page at dedicated route
- [ ] Authentication with customer credentials
- [ ] Customer JWT issued (separate from internal)
- [ ] Password reset flow works
- [ ] Redirect to customer dashboard on success
- [ ] Company branding shown

## Dependencies
- Customer auth backend module

## Estimated Effort
M
