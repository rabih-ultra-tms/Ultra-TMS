# Prompt 15: Unit Test Coverage

> **Priority:** P4 - Enhancement  
> **Estimated Time:** 10-14 hours  
> **Target:** Unit Test Coverage 0% → 80%  
> **Prerequisites:** Prompts 01-13 completed, Unit test infrastructure in place

---

## Objective

Implement comprehensive unit tests for all services, guards, interceptors, and utilities to achieve 80% code coverage with meaningful test cases.

---

## Current State Analysis

### What Exists
- Unit test configuration (`jest.unit.config.ts`)
- Test setup file (`test/setup.ts`)
- Shared test helpers (`test/helpers/`)
- RolesGuard unit tests (example)

### What's Missing
- Service layer unit tests
- Guard and interceptor tests
- Utility function tests
- DTO validation tests
- Business logic coverage

---

## Implementation Tasks

### Task 1: Service Unit Test Pattern

Create unit tests for each service following this pattern:

```typescript
// src/modules/tms/services/__tests__/loads.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LoadsService } from '../loads.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createMockPrisma, createMockEventEmitter } from '@test/helpers';

describe('LoadsService', () => {
  let service: LoadsService;
  let prisma: jest.Mocked<PrismaService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadsService,
        { provide: PrismaService, useValue: createMockPrisma() },
        { provide: EventEmitter2, useValue: createMockEventEmitter() },
      ],
    }).compile();

    service = module.get<LoadsService>(LoadsService);
    prisma = module.get(PrismaService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a load with valid data', async () => {
      const createDto = {
        customerId: 'cust_123',
        origin: { city: 'Chicago', state: 'IL' },
        destination: { city: 'Dallas', state: 'TX' },
        weight: 42000,
      };

      const expectedLoad = { id: 'load_123', ...createDto, status: 'PENDING' };
      prisma.load.create.mockResolvedValue(expectedLoad);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedLoad);
      expect(prisma.load.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          customerId: 'cust_123',
          status: 'PENDING',
        }),
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('load.created', expectedLoad);
    });

    it('should throw error for invalid customer', async () => {
      prisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.create({ customerId: 'invalid' }))
        .rejects.toThrow('Customer not found');
    });
  });

  describe('findById', () => {
    it('should return load when found', async () => {
      const load = { id: 'load_123', status: 'PENDING' };
      prisma.load.findUnique.mockResolvedValue(load);

      const result = await service.findById('load_123');

      expect(result).toEqual(load);
      expect(prisma.load.findUnique).toHaveBeenCalledWith({
        where: { id: 'load_123' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.load.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent'))
        .rejects.toThrow('Load not found');
    });
  });

  describe('updateStatus', () => {
    it('should update status and emit event', async () => {
      const load = { id: 'load_123', status: 'PENDING' };
      const updatedLoad = { ...load, status: 'IN_TRANSIT' };

      prisma.load.findUnique.mockResolvedValue(load);
      prisma.load.update.mockResolvedValue(updatedLoad);

      const result = await service.updateStatus('load_123', 'IN_TRANSIT');

      expect(result.status).toBe('IN_TRANSIT');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'load.status.changed',
        expect.objectContaining({ 
          loadId: 'load_123',
          oldStatus: 'PENDING',
          newStatus: 'IN_TRANSIT',
        }),
      );
    });

    it('should reject invalid status transitions', async () => {
      const load = { id: 'load_123', status: 'DELIVERED' };
      prisma.load.findUnique.mockResolvedValue(load);

      await expect(service.updateStatus('load_123', 'PENDING'))
        .rejects.toThrow('Invalid status transition');
    });
  });

  describe('calculateRate', () => {
    it('should calculate rate based on distance and weight', () => {
      const result = service.calculateRate({
        distance: 500,
        weight: 42000,
        equipmentType: 'DRY_VAN',
      });

      expect(result).toBeGreaterThan(0);
      expect(result).toBeCloseTo(1250, 0); // Expected rate
    });

    it('should apply surcharges for hazmat', () => {
      const baseRate = service.calculateRate({
        distance: 500,
        weight: 42000,
        equipmentType: 'DRY_VAN',
      });

      const hazmatRate = service.calculateRate({
        distance: 500,
        weight: 42000,
        equipmentType: 'DRY_VAN',
        isHazmat: true,
      });

      expect(hazmatRate).toBeGreaterThan(baseRate);
    });
  });
});
```

### Task 2: Guard Unit Tests

Test all guards for proper authorization:

```typescript
// src/common/guards/__tests__/roles.guard.spec.ts
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { createMockExecutionContext } from '@test/helpers';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockExecutionContext({ user: { role: 'user' } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin', 'manager']);
    const context = createMockExecutionContext({ user: { role: 'admin' } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const context = createMockExecutionContext({ user: { role: 'user' } });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should check permissions when specified', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(undefined) // roles
      .mockReturnValueOnce(['loads:write']); // permissions
    
    const context = createMockExecutionContext({
      user: { role: 'user', permissions: ['loads:read', 'loads:write'] },
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});
```

### Task 3: Interceptor Unit Tests

Test interceptors for proper transformation:

```typescript
// src/common/interceptors/__tests__/response-transform.interceptor.spec.ts
import { ResponseTransformInterceptor } from '../response-transform.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseTransformInterceptor', () => {
  let interceptor: ResponseTransformInterceptor;

  beforeEach(() => {
    interceptor = new ResponseTransformInterceptor();
  });

  it('should wrap response in standard format', (done) => {
    const mockData = { id: '123', name: 'Test' };
    const context = {} as ExecutionContext;
    const next: CallHandler = { handle: () => of(mockData) };

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        data: mockData,
      });
      done();
    });
  });

  it('should pass through already formatted responses', (done) => {
    const formattedResponse = { success: true, data: { id: '123' } };
    const context = {} as ExecutionContext;
    const next: CallHandler = { handle: () => of(formattedResponse) };

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual(formattedResponse);
      done();
    });
  });

  it('should handle null responses', (done) => {
    const context = {} as ExecutionContext;
    const next: CallHandler = { handle: () => of(null) };

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual({ success: true, data: null });
      done();
    });
  });
});
```

### Task 4: Utility Function Tests

Test all utility functions:

```typescript
// src/common/utils/__tests__/geo.utils.spec.ts
import { calculateDistance, isWithinRadius, parseCoordinates } from '../geo.utils';

describe('Geo Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const chicago = { lat: 41.8781, lng: -87.6298 };
      const dallas = { lat: 32.7767, lng: -96.7970 };

      const distance = calculateDistance(chicago, dallas);

      expect(distance).toBeCloseTo(920, -1); // ~920 miles
    });

    it('should return 0 for same point', () => {
      const point = { lat: 41.8781, lng: -87.6298 };
      expect(calculateDistance(point, point)).toBe(0);
    });
  });

  describe('isWithinRadius', () => {
    it('should return true for point within radius', () => {
      const center = { lat: 41.8781, lng: -87.6298 };
      const point = { lat: 41.9, lng: -87.65 };

      expect(isWithinRadius(center, point, 50)).toBe(true);
    });

    it('should return false for point outside radius', () => {
      const chicago = { lat: 41.8781, lng: -87.6298 };
      const dallas = { lat: 32.7767, lng: -96.7970 };

      expect(isWithinRadius(chicago, dallas, 100)).toBe(false);
    });
  });

  describe('parseCoordinates', () => {
    it('should parse valid coordinate string', () => {
      const result = parseCoordinates('41.8781,-87.6298');
      expect(result).toEqual({ lat: 41.8781, lng: -87.6298 });
    });

    it('should throw for invalid format', () => {
      expect(() => parseCoordinates('invalid')).toThrow('Invalid coordinate format');
    });
  });
});
```

### Task 5: Services to Test

Create unit tests for each module's services:

#### Core Services (High Priority)
| Module | Service | Test File |
|--------|---------|-----------|
| TMS | LoadsService | `loads.service.spec.ts` |
| TMS | OrdersService | `orders.service.spec.ts` |
| TMS | StopsService | `stops.service.spec.ts` |
| TMS | TrackingService | `tracking.service.spec.ts` |
| Accounting | InvoicesService | `invoices.service.spec.ts` |
| Accounting | PaymentsService | `payments.service.spec.ts` |
| Accounting | SettlementsService | `settlements.service.spec.ts` |
| CRM | CustomersService | `customers.service.spec.ts` |
| Carrier | CarriersService | `carriers.service.spec.ts` |

#### Supporting Services (Medium Priority)
| Module | Service | Test File |
|--------|---------|-----------|
| Auth | AuthService | `auth.service.spec.ts` |
| Auth | JwtStrategy | `jwt.strategy.spec.ts` |
| Load Board | PostingsService | `postings.service.spec.ts` |
| Load Board | GeoSearchService | `geo-search.service.spec.ts` |
| Documents | DocumentsService | `documents.service.spec.ts` |
| Communication | NotificationsService | `notifications.service.spec.ts` |

#### Utility Services (Lower Priority)
| Module | Service | Test File |
|--------|---------|-----------|
| Audit | AuditService | `audit.service.spec.ts` |
| Config | ConfigService | `config.service.spec.ts` |
| Search | SearchService | `search.service.spec.ts` |
| Cache | CacheService | `cache.service.spec.ts` |

### Task 6: Test Helper Factories

Create test data factories for consistent test data:

```typescript
// test/factories/load.factory.ts
import { faker } from '@faker-js/faker';

export const createLoadFactory = (overrides = {}) => ({
  id: faker.string.uuid(),
  customerId: faker.string.uuid(),
  status: 'PENDING',
  origin: {
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    lat: faker.location.latitude(),
    lng: faker.location.longitude(),
  },
  destination: {
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    lat: faker.location.latitude(),
    lng: faker.location.longitude(),
  },
  weight: faker.number.int({ min: 10000, max: 45000 }),
  rate: faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createLoadsArray = (count: number, overrides = {}) =>
  Array.from({ length: count }, () => createLoadFactory(overrides));
```

```typescript
// test/factories/index.ts
export * from './load.factory';
export * from './customer.factory';
export * from './carrier.factory';
export * from './invoice.factory';
export * from './user.factory';
```

### Task 7: Mock Helpers

Create comprehensive mock helpers:

```typescript
// test/helpers/mock-prisma.ts
export const createMockPrisma = () => ({
  load: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  customer: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  carrier: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  invoice: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(createMockPrisma())),
});

// test/helpers/mock-context.ts
export const createMockExecutionContext = (request: Partial<Request> = {}) => ({
  switchToHttp: () => ({
    getRequest: () => ({
      user: null,
      headers: {},
      params: {},
      query: {},
      body: {},
      ...request,
    }),
    getResponse: () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }),
  }),
  getHandler: () => jest.fn(),
  getClass: () => jest.fn(),
});

// test/helpers/mock-event-emitter.ts
export const createMockEventEmitter = () => ({
  emit: jest.fn(),
  emitAsync: jest.fn().mockResolvedValue([]),
  on: jest.fn(),
  once: jest.fn(),
});
```

---

## Running Tests

```bash
# Run all unit tests
pnpm --filter api test

# Run with coverage
pnpm --filter api test:cov

# Run specific service tests
pnpm --filter api test -- --testPathPattern=loads.service

# Watch mode
pnpm --filter api test:watch
```

---

## Verification Checklist

### Coverage Targets
- [ ] Overall line coverage ≥ 80%
- [ ] Branch coverage ≥ 75%
- [ ] Function coverage ≥ 85%
- [ ] Statement coverage ≥ 80%

### Test Quality
- [ ] All services have unit tests
- [ ] All guards have unit tests
- [ ] All interceptors have unit tests
- [ ] All utility functions have unit tests
- [ ] Edge cases are covered
- [ ] Error paths are tested

### Test Organization
- [ ] Tests are co-located with source files
- [ ] Factories are DRY and reusable
- [ ] Mocks are consistent across tests
- [ ] Test names are descriptive

---

## Acceptance Criteria

1. **80% Code Coverage**
   - Minimum 80% line coverage
   - All critical paths tested
   - Error handling tested

2. **All Services Tested**
   - Every service has a test file
   - Happy path and error cases covered
   - Mocks properly configured

3. **Test Quality**
   - No flaky tests
   - Fast execution (< 30 seconds)
   - Clear failure messages

4. **CI Integration**
   - Tests run in CI pipeline
   - Coverage reports generated
   - Failure blocks deployment

---

## Progress Tracker Update

After completing this prompt, update the README.md:

```markdown
| Metric | Before | Current | Target |
|--------|--------|---------|--------|
| Unit Test Coverage | 0% | 80% | 80% |
```

Add changelog entry:
```markdown
### YYYY-MM-DD - Prompt 15: Unit Test Coverage
**Completed by:** [Name]
**Time spent:** [X hours]

#### Changes
- Added unit tests for all services
- Added guard and interceptor tests
- Added utility function tests
- Created test factories and helpers

#### Metrics Updated
- Unit Test Coverage: 0% → 80%
```
