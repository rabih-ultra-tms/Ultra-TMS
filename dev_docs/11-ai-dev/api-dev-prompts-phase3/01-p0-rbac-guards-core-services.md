# P0-1: Add RBAC Guards to Core Services (CRM, Sales, Carrier, Load Board)

## Priority: P0 - CRITICAL BLOCKER
## Estimated Time: 16-20 hours
## Dependencies: None

---

## Context

The following core services have **0% RBAC coverage** and expose sensitive data to any authenticated user:
- **CRM**: Customer PII, contact information, credit terms
- **Sales**: Quote pricing, profit margins, customer rates
- **Carrier**: Banking details, SSN, insurance information
- **Load Board**: Pricing strategies, carrier rates, posting visibility

These services MUST be secured before any frontend development.

---

## Current State

All controllers in these modules use only `@UseGuards(JwtAuthGuard)` which allows ANY authenticated user to access ALL data.

Example of current vulnerable pattern:
```typescript
@Controller('api/v1/customers')
@UseGuards(JwtAuthGuard) // Only checks if logged in, not permissions
export class CustomersController {
  @Get()
  findAll() { ... } // Any user can see all customers!
}
```

---

## Required Changes

### 1. CRM Module (`apps/api/src/modules/crm/`)

#### customers.controller.ts
```typescript
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/v1/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  
  @Get()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  findAll() { ... }
  
  @Get(':id')
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  findOne() { ... }
  
  @Post()
  @Roles('ADMIN', 'SALES_MANAGER')
  create() { ... }
  
  @Put(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  update() { ... }
  
  @Delete(':id')
  @Roles('ADMIN')
  remove() { ... }
}
```

#### contacts.controller.ts
```typescript
@Controller('api/v1/contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactsController {
  
  @Get()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  findAll() { ... }
  
  @Post()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  create() { ... }
  
  @Put(':id')
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  update() { ... }
  
  @Delete(':id')
  @Roles('ADMIN', 'SALES_MANAGER')
  remove() { ... }
}
```

### 2. Sales Module (`apps/api/src/modules/sales/`)

#### quotes.controller.ts
```typescript
@Controller('api/v1/quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotesController {
  
  @Get()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'PRICING_ANALYST')
  findAll() { ... }
  
  @Get(':id')
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'PRICING_ANALYST')
  findOne() { ... }
  
  @Post()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  create() { ... }
  
  @Put(':id')
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  update() { ... }
  
  // CRITICAL: Margin data should be restricted
  @Get(':id/margins')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  getMargins() { ... }
  
  @Post(':id/approve')
  @Roles('ADMIN', 'SALES_MANAGER')
  approve() { ... }
}
```

#### opportunities.controller.ts
```typescript
@Controller('api/v1/opportunities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OpportunitiesController {
  
  @Get()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  findAll() { ... }
  
  @Post()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  create() { ... }
  
  @Put(':id/stage')
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  updateStage() { ... }
}
```

### 3. Carrier Module (`apps/api/src/modules/carrier/`)

#### carriers.controller.ts
```typescript
@Controller('api/v1/carriers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CarriersController {
  
  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'OPERATIONS')
  findAll() { ... }
  
  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'OPERATIONS')
  findOne() { ... }
  
  @Post()
  @Roles('ADMIN', 'CARRIER_MANAGER')
  create() { ... }
  
  @Put(':id')
  @Roles('ADMIN', 'CARRIER_MANAGER')
  update() { ... }
  
  // CRITICAL: Banking info must be highly restricted
  @Get(':id/banking')
  @Roles('ADMIN', 'ACCOUNTING')
  getBanking() { ... }
  
  @Put(':id/banking')
  @Roles('ADMIN', 'ACCOUNTING')
  updateBanking() { ... }
  
  @Delete(':id')
  @Roles('ADMIN')
  remove() { ... }
}
```

#### drivers.controller.ts
```typescript
@Controller('api/v1/drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
  
  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  findAll() { ... }
  
  // CRITICAL: SSN should never be returned in list views
  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  findOne() { ... }
  
  @Post()
  @Roles('ADMIN', 'CARRIER_MANAGER')
  create() { ... }
}
```

### 4. Load Board Module (`apps/api/src/modules/load-board/`)

#### load-postings.controller.ts
```typescript
@Controller('api/v1/load-postings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoadPostingsController {
  
  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  findAll() { ... }
  
  @Post()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  create() { ... }
  
  @Put(':id')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  update() { ... }
  
  // Carrier-specific view (limited data)
  @Get('available')
  @Roles('CARRIER', 'DISPATCHER')
  findAvailable() { ... }
  
  @Post(':id/bid')
  @Roles('CARRIER')
  submitBid() { ... }
}
```

---

## Role Reference

Use these standardized role names (UPPERCASE):

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | System administrator |
| `ADMIN` | Tenant administrator |
| `SALES_REP` | Sales representative |
| `SALES_MANAGER` | Sales team manager |
| `DISPATCHER` | Load dispatcher |
| `CARRIER_MANAGER` | Carrier relations manager |
| `OPERATIONS` | Operations team |
| `ACCOUNTING` | Accounting/Finance team |
| `PRICING_ANALYST` | Pricing/Rate analyst |
| `ACCOUNT_MANAGER` | Customer account manager |
| `SAFETY_MANAGER` | Safety department |
| `CARRIER` | External carrier user |

---

## Verification Steps

After implementing, verify:

1. **Unauthenticated Access Blocked**
   ```bash
   curl http://localhost:3001/api/v1/customers
   # Should return 401 Unauthorized
   ```

2. **Wrong Role Blocked**
   ```bash
   # Login as CARRIER role
   curl -H "Authorization: Bearer $CARRIER_TOKEN" http://localhost:3001/api/v1/customers
   # Should return 403 Forbidden
   ```

3. **Correct Role Allowed**
   ```bash
   # Login as SALES_REP role
   curl -H "Authorization: Bearer $SALES_REP_TOKEN" http://localhost:3001/api/v1/customers
   # Should return 200 OK with data
   ```

---

## E2E Test Requirements

Create tests in `apps/api/test/`:

```typescript
// crm-rbac.e2e-spec.ts
describe('CRM RBAC', () => {
  it('should deny CARRIER access to customers', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/customers')
      .set('Authorization', `Bearer ${carrierToken}`)
      .expect(403);
  });
  
  it('should allow SALES_REP access to customers', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/customers')
      .set('Authorization', `Bearer ${salesRepToken}`)
      .expect(200);
  });
});
```

---

## Files to Modify

- [ ] `apps/api/src/modules/crm/customers.controller.ts`
- [ ] `apps/api/src/modules/crm/contacts.controller.ts`
- [ ] `apps/api/src/modules/crm/activities.controller.ts`
- [ ] `apps/api/src/modules/sales/quotes.controller.ts`
- [ ] `apps/api/src/modules/sales/opportunities.controller.ts`
- [ ] `apps/api/src/modules/carrier/carriers.controller.ts`
- [ ] `apps/api/src/modules/carrier/drivers.controller.ts`
- [ ] `apps/api/src/modules/carrier/equipment.controller.ts`
- [ ] `apps/api/src/modules/load-board/load-postings.controller.ts`
- [ ] `apps/api/src/modules/load-board/bids.controller.ts`

---

## Success Criteria

- [ ] All 4 modules have RolesGuard on all controllers
- [ ] All endpoints have appropriate @Roles decorators
- [ ] Banking/financial endpoints restricted to ADMIN/ACCOUNTING
- [ ] E2E tests pass for RBAC rules
- [ ] No 403 errors for legitimate users in manual testing
