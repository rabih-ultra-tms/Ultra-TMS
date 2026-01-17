# P4: Unit Test Coverage Enhancement

## Priority: P4 - VERY LOW (Long-term)
## Estimated Time: 2-3 weeks
## Dependencies: None

---

## Overview

Increase unit test coverage from current ~40% to target 80% across all services. Unit tests provide fast feedback during development and catch regressions early.

---

## Current Coverage Analysis

| Module | Current | Target | Gap |
|--------|---------|--------|-----|
| Auth | ~30% | 80% | 50% |
| CRM | ~45% | 80% | 35% |
| Sales | ~35% | 80% | 45% |
| TMS Core | ~50% | 80% | 30% |
| Carrier | ~45% | 80% | 35% |
| Accounting | ~40% | 80% | 40% |
| Load Board | ~35% | 80% | 45% |
| Commission | ~40% | 80% | 40% |
| Documents | ~35% | 80% | 45% |
| Integration Hub | ~30% | 80% | 50% |

---

## Unit Test Structure Template

```typescript
// apps/api/src/[module]/[feature]/[feature].service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { FeatureService } from './feature.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('FeatureService', () => {
  let service: FeatureService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a record', async () => {
      // Arrange
      const createDto = { name: 'Test' };
      const expected = { id: 'uuid', ...createDto };
      prisma.model.create.mockResolvedValue(expected);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(expected);
      expect(prisma.model.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });
});
```

---

## Task 1: CRM Service Tests

### Companies Service

**File:** `apps/api/src/crm/companies/companies.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prisma: DeepMockProxy<PrismaService>;

  const mockCompany = {
    id: 'company-uuid',
    tenantId: 'tenant-uuid',
    name: 'Test Company',
    type: 'SHIPPER',
    email: 'test@company.com',
    status: 'ACTIVE',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return paginated companies for tenant', async () => {
      const companies = [mockCompany];
      prisma.company.findMany.mockResolvedValue(companies);
      prisma.company.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-uuid', { page: 1, limit: 10 });

      expect(result.data).toEqual(companies);
      expect(result.meta.total).toBe(1);
      expect(prisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-uuid', deletedAt: null },
        })
      );
    });

    it('should filter by type when provided', async () => {
      prisma.company.findMany.mockResolvedValue([]);
      prisma.company.count.mockResolvedValue(0);

      await service.findAll('tenant-uuid', { page: 1, limit: 10, type: 'SHIPPER' });

      expect(prisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-uuid', type: 'SHIPPER', deletedAt: null },
        })
      );
    });

    it('should apply search filter', async () => {
      prisma.company.findMany.mockResolvedValue([]);
      prisma.company.count.mockResolvedValue(0);

      await service.findAll('tenant-uuid', { page: 1, limit: 10, search: 'test' });

      expect(prisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return company by id', async () => {
      prisma.company.findFirst.mockResolvedValue(mockCompany);

      const result = await service.findOne('tenant-uuid', 'company-uuid');

      expect(result).toEqual(mockCompany);
    });

    it('should throw NotFoundException when company not found', async () => {
      prisma.company.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('tenant-uuid', 'non-existent')
      ).rejects.toThrow(NotFoundException);
    });

    it('should not return deleted companies', async () => {
      prisma.company.findFirst.mockResolvedValue(null);

      await service.findOne('tenant-uuid', 'deleted-company').catch(() => {});

      expect(prisma.company.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'deleted-company', tenantId: 'tenant-uuid', deletedAt: null },
        })
      );
    });
  });

  describe('create', () => {
    it('should create company with tenant id', async () => {
      const createDto = { name: 'New Company', type: 'SHIPPER', email: 'new@company.com' };
      prisma.company.create.mockResolvedValue({ ...mockCompany, ...createDto });

      const result = await service.create('tenant-uuid', createDto);

      expect(result.name).toBe('New Company');
      expect(prisma.company.create).toHaveBeenCalledWith({
        data: { ...createDto, tenantId: 'tenant-uuid' },
      });
    });

    it('should throw ConflictException for duplicate email', async () => {
      const createDto = { name: 'New Company', email: 'existing@company.com' };
      prisma.company.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create('tenant-uuid', createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update company', async () => {
      const updateDto = { name: 'Updated Company' };
      prisma.company.findFirst.mockResolvedValue(mockCompany);
      prisma.company.update.mockResolvedValue({ ...mockCompany, ...updateDto });

      const result = await service.update('tenant-uuid', 'company-uuid', updateDto);

      expect(result.name).toBe('Updated Company');
    });

    it('should throw NotFoundException when updating non-existent company', async () => {
      prisma.company.findFirst.mockResolvedValue(null);

      await expect(
        service.update('tenant-uuid', 'non-existent', { name: 'Test' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete company', async () => {
      prisma.company.findFirst.mockResolvedValue(mockCompany);
      prisma.company.update.mockResolvedValue({ ...mockCompany, deletedAt: new Date() });

      await service.remove('tenant-uuid', 'company-uuid');

      expect(prisma.company.update).toHaveBeenCalledWith({
        where: { id: 'company-uuid' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException when deleting non-existent company', async () => {
      prisma.company.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('tenant-uuid', 'non-existent')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## Task 2: TMS Core Service Tests

### Loads Service

**File:** `apps/api/src/tms-core/loads/loads.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { LoadsService } from './loads.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LoadsService', () => {
  let service: LoadsService;
  let prisma: DeepMockProxy<PrismaService>;

  const mockLoad = {
    id: 'load-uuid',
    tenantId: 'tenant-uuid',
    loadNumber: 'L-2024-001234',
    status: 'PENDING',
    customerId: 'customer-uuid',
    carrierId: null,
    originId: 'origin-uuid',
    destinationId: 'dest-uuid',
    pickupDate: new Date('2024-01-20'),
    deliveryDate: null,
    totalRate: 2500.00,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<LoadsService>(LoadsService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create load with auto-generated load number', async () => {
      const createDto = {
        customerId: 'customer-uuid',
        originId: 'origin-uuid',
        destinationId: 'dest-uuid',
        pickupDate: new Date('2024-01-20'),
      };
      prisma.load.count.mockResolvedValue(0);
      prisma.load.create.mockResolvedValue({ ...mockLoad, ...createDto });

      const result = await service.create('tenant-uuid', createDto);

      expect(result.loadNumber).toMatch(/^L-\d{4}-\d+$/);
    });
  });

  describe('updateStatus', () => {
    it('should update status following valid state transitions', async () => {
      prisma.load.findFirst.mockResolvedValue(mockLoad);
      prisma.load.update.mockResolvedValue({ ...mockLoad, status: 'DISPATCHED' });

      const result = await service.updateStatus('tenant-uuid', 'load-uuid', 'DISPATCHED');

      expect(result.status).toBe('DISPATCHED');
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      prisma.load.findFirst.mockResolvedValue(mockLoad); // status: PENDING

      // Cannot go from PENDING directly to DELIVERED
      await expect(
        service.updateStatus('tenant-uuid', 'load-uuid', 'DELIVERED')
      ).rejects.toThrow(BadRequestException);
    });

    it('should set deliveryDate when status changes to DELIVERED', async () => {
      const inTransitLoad = { ...mockLoad, status: 'IN_TRANSIT' };
      prisma.load.findFirst.mockResolvedValue(inTransitLoad);
      prisma.load.update.mockResolvedValue({ 
        ...inTransitLoad, 
        status: 'DELIVERED',
        deliveryDate: expect.any(Date),
      });

      await service.updateStatus('tenant-uuid', 'load-uuid', 'DELIVERED');

      expect(prisma.load.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'DELIVERED',
            deliveryDate: expect.any(Date),
          }),
        })
      );
    });
  });

  describe('assignCarrier', () => {
    it('should assign carrier to load', async () => {
      prisma.load.findFirst.mockResolvedValue(mockLoad);
      prisma.carrier.findFirst.mockResolvedValue({ id: 'carrier-uuid', status: 'ACTIVE' });
      prisma.load.update.mockResolvedValue({ ...mockLoad, carrierId: 'carrier-uuid' });

      const result = await service.assignCarrier('tenant-uuid', 'load-uuid', 'carrier-uuid');

      expect(result.carrierId).toBe('carrier-uuid');
    });

    it('should throw BadRequestException for inactive carrier', async () => {
      prisma.load.findFirst.mockResolvedValue(mockLoad);
      prisma.carrier.findFirst.mockResolvedValue({ id: 'carrier-uuid', status: 'SUSPENDED' });

      await expect(
        service.assignCarrier('tenant-uuid', 'load-uuid', 'carrier-uuid')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent carrier', async () => {
      prisma.load.findFirst.mockResolvedValue(mockLoad);
      prisma.carrier.findFirst.mockResolvedValue(null);

      await expect(
        service.assignCarrier('tenant-uuid', 'load-uuid', 'non-existent')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## Task 3: Accounting Service Tests

### Invoices Service

**File:** `apps/api/src/accounting/invoices/invoices.service.spec.ts`

```typescript
describe('InvoicesService', () => {
  // ... setup

  describe('createFromLoad', () => {
    it('should create invoice from delivered load', async () => {
      const deliveredLoad = { id: 'load-uuid', status: 'DELIVERED', totalRate: 2500 };
      prisma.load.findFirst.mockResolvedValue(deliveredLoad);
      prisma.invoice.create.mockResolvedValue({
        id: 'invoice-uuid',
        invoiceNumber: 'INV-2024-001234',
        amount: 2500,
        status: 'DRAFT',
      });

      const result = await service.createFromLoad('tenant-uuid', 'load-uuid');

      expect(result.amount).toBe(2500);
      expect(result.invoiceNumber).toMatch(/^INV-\d{4}-\d+$/);
    });

    it('should throw BadRequestException for non-delivered load', async () => {
      const inTransitLoad = { id: 'load-uuid', status: 'IN_TRANSIT' };
      prisma.load.findFirst.mockResolvedValue(inTransitLoad);

      await expect(
        service.createFromLoad('tenant-uuid', 'load-uuid')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('recordPayment', () => {
    it('should record payment and update invoice status', async () => {
      const invoice = { id: 'invoice-uuid', amount: 2500, status: 'SENT' };
      prisma.invoice.findFirst.mockResolvedValue(invoice);
      
      const paymentDto = { invoiceId: 'invoice-uuid', amount: 2500, method: 'CHECK' };
      prisma.payment.create.mockResolvedValue({ ...paymentDto, id: 'payment-uuid' });
      prisma.invoice.update.mockResolvedValue({ ...invoice, status: 'PAID', paidAt: new Date() });

      const result = await service.recordPayment('tenant-uuid', paymentDto);

      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PAID' }),
        })
      );
    });

    it('should handle partial payments', async () => {
      const invoice = { id: 'invoice-uuid', amount: 2500, status: 'SENT' };
      prisma.invoice.findFirst.mockResolvedValue(invoice);
      
      const partialPayment = { invoiceId: 'invoice-uuid', amount: 1000, method: 'CHECK' };
      prisma.payment.create.mockResolvedValue({ ...partialPayment, id: 'payment-uuid' });
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 1000 } });
      
      // Invoice should remain SENT, not PAID
      prisma.invoice.update.mockResolvedValue({ ...invoice, status: 'SENT' });

      await service.recordPayment('tenant-uuid', partialPayment);

      expect(prisma.invoice.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PAID' }),
        })
      );
    });
  });
});
```

---

## Task 4: Guard and Decorator Tests

### Roles Guard

**File:** `apps/api/src/auth/guards/roles.guard.spec.ts`

```typescript
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    
    const context = createMockContext({ roles: ['USER'] });
    
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    
    const context = createMockContext({ roles: ['ADMIN'] });
    
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    
    const context = createMockContext({ roles: ['USER'] });
    
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow access when user has one of multiple allowed roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'MANAGER']);
    
    const context = createMockContext({ roles: ['MANAGER'] });
    
    expect(guard.canActivate(context)).toBe(true);
  });

  function createMockContext(user: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
  }
});
```

---

## Task 5: Controller Tests

### Companies Controller

**File:** `apps/api/src/crm/companies/companies.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: jest.Mocked<CompaniesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    service = module.get(CompaniesService);
  });

  describe('findAll', () => {
    it('should call service with tenant from user', async () => {
      const req = { user: { tenantId: 'tenant-uuid' } };
      const query = { page: 1, limit: 10 };
      
      service.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });

      await controller.findAll(req, query);

      expect(service.findAll).toHaveBeenCalledWith('tenant-uuid', query);
    });
  });

  describe('create', () => {
    it('should call service with tenant and dto', async () => {
      const req = { user: { tenantId: 'tenant-uuid' } };
      const createDto = { name: 'Test Company' };
      
      service.create.mockResolvedValue({ id: 'uuid', ...createDto });

      await controller.create(req, createDto);

      expect(service.create).toHaveBeenCalledWith('tenant-uuid', createDto);
    });
  });
});
```

---

## Running Unit Tests

```bash
# Run all unit tests
pnpm run test

# Run tests for specific module
pnpm run test -- --grep "CompaniesService"

# Run with coverage
pnpm run test:cov

# Run in watch mode
pnpm run test:watch

# Run tests matching pattern
pnpm run test -- companies.service
```

---

## Coverage Targets by Module

| Module | Files | Target Coverage |
|--------|-------|-----------------|
| Auth | services, guards | 80% |
| CRM | services, controllers | 80% |
| Sales | services, controllers | 80% |
| TMS Core | services, controllers | 80% |
| Carrier | services, controllers | 80% |
| Accounting | services, controllers | 80% |
| Load Board | services, controllers | 80% |
| Commission | services, controllers | 80% |
| Documents | services, controllers | 80% |
| Integration Hub | services, controllers | 80% |

---

## Completion Checklist

### Service Tests
- [ ] Auth services (5 services)
- [ ] CRM services (3 services)
- [ ] Sales services (3 services)
- [ ] TMS Core services (2 services)
- [ ] Carrier services (3 services)
- [ ] Accounting services (4 services)
- [ ] Load Board services (3 services)
- [ ] Commission services (2 services)
- [ ] Documents services (2 services)
- [ ] Integration Hub services (2 services)

### Guard Tests
- [ ] JwtAuthGuard
- [ ] RolesGuard
- [ ] CompanyScopeGuard
- [ ] CarrierScopeGuard

### Controller Tests
- [ ] All controllers with RBAC decorators

### Coverage Report
- [ ] Overall coverage >= 80%
- [ ] No uncovered critical paths
