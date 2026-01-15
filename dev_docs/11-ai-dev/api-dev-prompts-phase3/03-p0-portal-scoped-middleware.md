# P0-3: Portal Security - Company/Carrier Scoped Middleware

## Priority: P0 - CRITICAL BLOCKER
## Estimated Time: 16-24 hours
## Dependencies: Auth module

---

## Context

Customer Portal and Carrier Portal have the **most critical security issue** - they currently have NO isolation between different customers or carriers. This means:

- **Customer A can see Customer B's orders, invoices, and documents**
- **Carrier X can see Carrier Y's loads, payments, and driver information**

This is a **data breach waiting to happen** and MUST be fixed before any frontend development.

---

## Problem Statement

Current implementation only checks if user is authenticated, not if they have access to the specific company/carrier data:

```typescript
// VULNERABLE - Current code
@Controller('api/v1/customer-portal/orders')
@UseGuards(JwtAuthGuard) // Only checks login, not company ownership!
export class CustomerPortalOrdersController {
  @Get()
  findAll() {
    // Returns ALL orders, not just this customer's orders!
    return this.ordersService.findAll();
  }
}
```

---

## Solution: Scoped Middleware

### 1. Create Company-Scoped Guard for Customer Portal

```typescript
// apps/api/src/modules/customer-portal/guards/company-scope.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CompanyScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Verify user has customer portal access
    if (!user.customerId) {
      throw new ForbiddenException('User is not associated with a customer account');
    }
    
    // Attach customerId to request for service layer filtering
    request.customerId = user.customerId;
    request.companyScope = {
      type: 'CUSTOMER',
      id: user.customerId,
      tenantId: user.tenantId,
    };
    
    return true;
  }
}
```

### 2. Create Carrier-Scoped Guard for Carrier Portal

```typescript
// apps/api/src/modules/carrier-portal/guards/carrier-scope.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CarrierScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Verify user has carrier portal access
    if (!user.carrierId) {
      throw new ForbiddenException('User is not associated with a carrier account');
    }
    
    // Attach carrierId to request for service layer filtering
    request.carrierId = user.carrierId;
    request.carrierScope = {
      type: 'CARRIER',
      id: user.carrierId,
      tenantId: user.tenantId,
    };
    
    return true;
  }
}
```

### 3. Create Scoped Service Base Class

```typescript
// apps/api/src/common/services/scoped-base.service.ts

export abstract class ScopedBaseService<T> {
  protected prisma: PrismaService;
  
  // All queries MUST include scope filter
  protected buildScopeFilter(scope: { type: string; id: string; tenantId: string }) {
    if (scope.type === 'CUSTOMER') {
      return {
        customerId: scope.id,
        tenantId: scope.tenantId,
      };
    }
    if (scope.type === 'CARRIER') {
      return {
        carrierId: scope.id,
        tenantId: scope.tenantId,
      };
    }
    throw new Error('Invalid scope type');
  }
  
  // Verify entity belongs to scope before returning
  protected async verifyScopeAccess(
    entityId: string,
    scope: { type: string; id: string },
    entityType: string
  ): Promise<boolean> {
    const entity = await this.findEntityById(entityId, entityType);
    
    if (scope.type === 'CUSTOMER' && entity.customerId !== scope.id) {
      return false;
    }
    if (scope.type === 'CARRIER' && entity.carrierId !== scope.id) {
      return false;
    }
    
    return true;
  }
}
```

---

## Implementation: Customer Portal

### customer-portal-orders.controller.ts
```typescript
import { CompanyScopeGuard } from './guards/company-scope.guard';
import { CompanyScope } from './decorators/company-scope.decorator';

@Controller('api/v1/customer-portal/orders')
@UseGuards(JwtAuthGuard, CompanyScopeGuard) // Add scope guard
export class CustomerPortalOrdersController {
  
  @Get()
  findAll(@CompanyScope() scope: CompanyScopeType) {
    // Service MUST filter by customerId
    return this.ordersService.findAllForCustomer(scope.id);
  }
  
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CompanyScope() scope: CompanyScopeType
  ) {
    const order = await this.ordersService.findOne(id);
    
    // CRITICAL: Verify order belongs to this customer
    if (order.customerId !== scope.id) {
      throw new ForbiddenException('Access denied to this order');
    }
    
    return order;
  }
  
  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @CompanyScope() scope: CompanyScopeType
  ) {
    // Force customerId from scope, ignore any customerId in DTO
    return this.ordersService.create({
      ...dto,
      customerId: scope.id, // Always use authenticated customer
    });
  }
}
```

### customer-portal-orders.service.ts
```typescript
@Injectable()
export class CustomerPortalOrdersService {
  
  // ALWAYS filter by customerId
  async findAllForCustomer(customerId: string) {
    return this.prisma.order.findMany({
      where: {
        customerId: customerId, // REQUIRED filter
        // Additional filters...
      },
    });
  }
  
  // Verify ownership before any operation
  async findOne(id: string, customerId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        customerId, // REQUIRED - ensures customer can only see their orders
      },
    });
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    return order;
  }
}
```

### Apply to ALL Customer Portal Controllers:

```typescript
// customer-portal-invoices.controller.ts
@Controller('api/v1/customer-portal/invoices')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class CustomerPortalInvoicesController {
  @Get()
  findAll(@CompanyScope() scope) {
    return this.invoicesService.findAllForCustomer(scope.id);
  }
}

// customer-portal-quotes.controller.ts
@Controller('api/v1/customer-portal/quotes')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class CustomerPortalQuotesController {
  @Get()
  findAll(@CompanyScope() scope) {
    return this.quotesService.findAllForCustomer(scope.id);
  }
}

// customer-portal-documents.controller.ts
@Controller('api/v1/customer-portal/documents')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class CustomerPortalDocumentsController {
  @Get()
  findAll(@CompanyScope() scope) {
    return this.documentsService.findAllForCustomer(scope.id);
  }
}
```

---

## Implementation: Carrier Portal

### carrier-portal-loads.controller.ts
```typescript
import { CarrierScopeGuard } from './guards/carrier-scope.guard';
import { CarrierScope } from './decorators/carrier-scope.decorator';

@Controller('api/v1/carrier-portal/loads')
@UseGuards(JwtAuthGuard, CarrierScopeGuard)
export class CarrierPortalLoadsController {
  
  @Get()
  findAll(@CarrierScope() scope: CarrierScopeType) {
    return this.loadsService.findAllForCarrier(scope.id);
  }
  
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CarrierScope() scope: CarrierScopeType
  ) {
    const load = await this.loadsService.findOne(id);
    
    // CRITICAL: Verify load is assigned to this carrier
    if (load.carrierId !== scope.id) {
      throw new ForbiddenException('Access denied to this load');
    }
    
    return load;
  }
  
  @Post(':id/accept')
  async acceptLoad(
    @Param('id') id: string,
    @CarrierScope() scope: CarrierScopeType
  ) {
    // Verify load is offered to this carrier before accepting
    const load = await this.loadsService.findOne(id);
    if (load.offeredCarrierId !== scope.id) {
      throw new ForbiddenException('This load was not offered to your company');
    }
    return this.loadsService.accept(id, scope.id);
  }
}
```

### Apply to ALL Carrier Portal Controllers:

```typescript
// carrier-portal-payments.controller.ts
@Controller('api/v1/carrier-portal/payments')
@UseGuards(JwtAuthGuard, CarrierScopeGuard)
export class CarrierPortalPaymentsController {
  @Get()
  findAll(@CarrierScope() scope) {
    return this.paymentsService.findAllForCarrier(scope.id);
  }
}

// carrier-portal-drivers.controller.ts
@Controller('api/v1/carrier-portal/drivers')
@UseGuards(JwtAuthGuard, CarrierScopeGuard)
export class CarrierPortalDriversController {
  @Get()
  findAll(@CarrierScope() scope) {
    // Carrier can only see their own drivers
    return this.driversService.findAllForCarrier(scope.id);
  }
  
  @Post()
  create(@Body() dto: CreateDriverDto, @CarrierScope() scope) {
    // Force carrierId from scope
    return this.driversService.create({
      ...dto,
      carrierId: scope.id,
    });
  }
}

// carrier-portal-documents.controller.ts
@Controller('api/v1/carrier-portal/documents')
@UseGuards(JwtAuthGuard, CarrierScopeGuard)
export class CarrierPortalDocumentsController {
  @Get()
  findAll(@CarrierScope() scope) {
    return this.documentsService.findAllForCarrier(scope.id);
  }
}
```

---

## Create Scope Decorators

```typescript
// apps/api/src/modules/customer-portal/decorators/company-scope.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CompanyScope = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.companyScope;
  },
);

// apps/api/src/modules/carrier-portal/decorators/carrier-scope.decorator.ts
export const CarrierScope = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.carrierScope;
  },
);
```

---

## User Model Updates

Ensure User model links to customer/carrier:

```typescript
// Update User entity/DTO to include:
interface User {
  id: string;
  email: string;
  roles: string[];
  tenantId: string;
  customerId?: string;  // Link to customer account (for customer portal users)
  carrierId?: string;   // Link to carrier account (for carrier portal users)
}
```

---

## Verification Steps

### Customer Portal Isolation
```bash
# Login as Customer A
export CUSTOMER_A_TOKEN="..."

# Try to access Customer A's orders - should work
curl -H "Authorization: Bearer $CUSTOMER_A_TOKEN" \
  http://localhost:3001/api/v1/customer-portal/orders
# Returns Customer A's orders only

# Try to access Customer B's order directly - should fail
curl -H "Authorization: Bearer $CUSTOMER_A_TOKEN" \
  http://localhost:3001/api/v1/customer-portal/orders/customer-b-order-id
# Should return 403 Forbidden

# Verify creation forces correct customerId
curl -X POST -H "Authorization: Bearer $CUSTOMER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId": "customer-b-id", "origin": "NYC"}' \
  http://localhost:3001/api/v1/customer-portal/orders
# Order should be created with Customer A's ID, not B's
```

### Carrier Portal Isolation
```bash
# Login as Carrier X
export CARRIER_X_TOKEN="..."

# Try to access Carrier X's loads - should work
curl -H "Authorization: Bearer $CARRIER_X_TOKEN" \
  http://localhost:3001/api/v1/carrier-portal/loads
# Returns only loads assigned to Carrier X

# Try to access Carrier Y's payment - should fail
curl -H "Authorization: Bearer $CARRIER_X_TOKEN" \
  http://localhost:3001/api/v1/carrier-portal/payments/carrier-y-payment-id
# Should return 403 Forbidden
```

---

## E2E Test Requirements

```typescript
// customer-portal-isolation.e2e-spec.ts
describe('Customer Portal Isolation', () => {
  let customerAToken: string;
  let customerBToken: string;
  let customerAOrderId: string;
  let customerBOrderId: string;
  
  beforeAll(async () => {
    // Setup test data
    customerAToken = await loginAsCustomer('customer-a');
    customerBToken = await loginAsCustomer('customer-b');
    customerAOrderId = await createOrderForCustomer('customer-a');
    customerBOrderId = await createOrderForCustomer('customer-b');
  });
  
  it('Customer A should only see their orders', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/customer-portal/orders')
      .set('Authorization', `Bearer ${customerAToken}`)
      .expect(200);
    
    // All orders should belong to Customer A
    response.body.forEach(order => {
      expect(order.customerId).toBe('customer-a-id');
    });
    
    // Should not contain Customer B's orders
    expect(response.body.find(o => o.id === customerBOrderId)).toBeUndefined();
  });
  
  it('Customer A cannot access Customer B order directly', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/customer-portal/orders/${customerBOrderId}`)
      .set('Authorization', `Bearer ${customerAToken}`)
      .expect(403);
  });
  
  it('Customer A cannot create order for Customer B', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/customer-portal/orders')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        customerId: 'customer-b-id', // Trying to impersonate
        origin: 'NYC',
        destination: 'LA',
      })
      .expect(201);
    
    // Order should be created for Customer A despite the DTO
    expect(response.body.customerId).toBe('customer-a-id');
  });
});
```

---

## Files to Create/Modify

### New Files
- [ ] `apps/api/src/modules/customer-portal/guards/company-scope.guard.ts`
- [ ] `apps/api/src/modules/customer-portal/decorators/company-scope.decorator.ts`
- [ ] `apps/api/src/modules/carrier-portal/guards/carrier-scope.guard.ts`
- [ ] `apps/api/src/modules/carrier-portal/decorators/carrier-scope.decorator.ts`

### Customer Portal Controllers (Add Guards)
- [ ] `apps/api/src/modules/customer-portal/customer-portal-orders.controller.ts`
- [ ] `apps/api/src/modules/customer-portal/customer-portal-invoices.controller.ts`
- [ ] `apps/api/src/modules/customer-portal/customer-portal-quotes.controller.ts`
- [ ] `apps/api/src/modules/customer-portal/customer-portal-shipments.controller.ts`
- [ ] `apps/api/src/modules/customer-portal/customer-portal-documents.controller.ts`

### Carrier Portal Controllers (Add Guards)
- [ ] `apps/api/src/modules/carrier-portal/carrier-portal-loads.controller.ts`
- [ ] `apps/api/src/modules/carrier-portal/carrier-portal-payments.controller.ts`
- [ ] `apps/api/src/modules/carrier-portal/carrier-portal-drivers.controller.ts`
- [ ] `apps/api/src/modules/carrier-portal/carrier-portal-equipment.controller.ts`
- [ ] `apps/api/src/modules/carrier-portal/carrier-portal-documents.controller.ts`

### Service Layer Updates
- [ ] All customer-portal services must accept and filter by customerId
- [ ] All carrier-portal services must accept and filter by carrierId

---

## Success Criteria

- [ ] CompanyScopeGuard applied to ALL customer portal endpoints
- [ ] CarrierScopeGuard applied to ALL carrier portal endpoints
- [ ] Services filter by customerId/carrierId from scope
- [ ] Cannot access other company/carrier data via direct ID
- [ ] Created entities automatically use authenticated user's company/carrier
- [ ] E2E tests verify complete isolation
- [ ] Manual penetration testing confirms no cross-tenant access
