# TEST-014: Role-Based Access Control Tests

**Priority:** P0
**Service:** Auth
**Scope:** Verify RBAC enforcement across all endpoints

## Current State
Backend uses `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(RoleEnum.ADMIN, ...)` decorators. Frontend has `useHasRole` and `useHasPermission` hooks. No tests verify that role restrictions are actually enforced.

## Requirements
- Test each role (ADMIN, DISPATCHER, ACCOUNTANT, SALES, VIEWER) against all MVP endpoints
- Verify admin can access all endpoints
- Verify dispatcher can only access dispatch-related endpoints
- Verify accountant can only access accounting endpoints
- Verify unauthorized roles receive 403 Forbidden
- Test frontend `useHasRole` conditionally renders UI elements

## Acceptance Criteria
- [ ] All MVP endpoints tested with each role
- [ ] Unauthorized access returns 403
- [ ] Admin role has full access
- [ ] Role-specific restrictions verified
- [ ] Frontend conditional rendering tested for role-gated UI
- [ ] Tests pass in CI

## Dependencies
- Auth system must support multiple roles in test environment
- Database seeded with users of different roles

## Estimated Effort
L
