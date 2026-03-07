# Authentication & Authorization Standards

> Source: `dev_docs/08-standards/71-auth-authorization-standards.md`
> Stack: JWT (access + refresh tokens), RBAC, multi-tenant

## Core Rules

1. **EVERY API endpoint MUST have auth guards** (except `/health`, `/auth/login`)
2. **EVERY query MUST filter by `tenantId`**
3. **NEVER return data without checking ownership**
4. **Role checks AFTER authentication**

## JWT Token Flow

```
Login → Access Token (15min) + Refresh Token (7d, HttpOnly cookie)
         ↓
    API Request with Bearer token
         ↓
    JwtAuthGuard validates → extracts user { id, email, tenantId, roles }
         ↓
    RolesGuard checks required roles
         ↓
    Service layer filters by tenantId
```

## Guards (MANDATORY)

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.DISPATCHER)
@Get()
async findAll(@Req() req: AuthenticatedRequest) {
  return this.service.findAll(req.user.tenantId);
}
```

## Role Hierarchy

| Role | Access Level |
|------|-------------|
| SUPER_ADMIN | All tenants, all resources |
| ADMIN | Own tenant, all resources |
| OPERATIONS_MANAGER | Operations oversight |
| DISPATCHER | Loads, carriers, dispatch |
| SALES | CRM, quotes, customers |
| ACCOUNTING | Invoices, payments, settlements |
| CARRIER (portal) | Own carrier data only |
| CUSTOMER (portal) | Own company data only |

## Multi-Tenant Query Pattern

```typescript
// ALWAYS get tenantId from JWT, NEVER from request body
const tenantId = req.user.tenantId;

// ALWAYS include in query
await prisma.carrier.findMany({
  where: { tenantId, deletedAt: null }
});

// ALWAYS verify ownership on single-item access
const carrier = await prisma.carrier.findFirst({
  where: { id, tenantId, deletedAt: null }
});
if (!carrier) throw new NotFoundException();
```

## Portal Authentication

Separate JWT secrets for portal users:
- `CUSTOMER_PORTAL_JWT_SECRET` — customer portal
- `CARRIER_PORTAL_JWT_SECRET` — carrier portal

Portal users have restricted access — can only see their own company/carrier data.

## Security Checklist

- [ ] No tokens in localStorage (use HttpOnly cookies)
- [ ] No JWT logged to console
- [ ] Access tokens expire in 15 minutes
- [ ] Refresh tokens: HttpOnly, Secure, SameSite=Strict
- [ ] Rate limiting on auth endpoints (5 attempts / 15 min)
- [ ] Password: min 8 chars, uppercase, number, special char
- [ ] Account lockout after consecutive failures
