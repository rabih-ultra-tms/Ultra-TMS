# Prompt 12: Unit Test Implementation

**Priority:** P3 (Post-Frontend Readiness)  
**Estimated Time:** 10-12 hours  
**Dependencies:** All P0, P1, P2 prompts completed  
**Current Coverage:** 0% unit tests → Target: 80% critical paths

---

## Objective

Implement comprehensive unit tests for all Phase A services. Currently only E2E tests exist. Unit tests are essential for testing business logic in isolation, enabling faster development cycles and more reliable refactoring.

---

## Current State Analysis

### Test Coverage Overview

| Service | E2E Tests | Unit Tests | Target Unit |
|---------|-----------|------------|-------------|
| Auth | ✅ Yes | ❌ None | 90% |
| Users | ✅ Yes | ❌ None | 80% |
| Customers | ✅ Yes | ❌ None | 80% |
| Orders | ✅ Yes | ❌ None | 85% |
| Loads | ✅ Yes | ❌ None | 85% |
| Carriers | ✅ Yes | ❌ None | 80% |
| Accounting | ✅ Yes | ❌ None | 85% |
| Load Board | ✅ Yes | ❌ None | 80% |
| Audit | ✅ Yes | ❌ None | 90% |
| Config | ✅ Yes | ❌ None | 85% |

---

## Implementation Steps

### Step 1: Set Up Unit Test Infrastructure

**Update Jest Configuration:**

**File: `apps/api/jest.config.ts`** (update)

```typescript
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.service.ts',
    'src/**/*.guard.ts',
    'src/**/*.interceptor.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup-unit.ts'],
};

export default config;
```

**Create Unit Test Setup:**

**File: `apps/api/test/setup-unit.ts`**

```typescript
// Mock common dependencies
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

// Global test utilities
global.createMockTenantId = () => 'test-tenant-id';
global.createMockUserId = () => 'test-user-id';

// Silence console during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
// };
```

**Create Test Utilities:**

**File: `apps/api/test/utils/test-helpers.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma.service';

export const createMockPrismaService = () => ({
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  customer: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  order: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  load: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  carrier: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  invoice: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  auditLog: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(createMockPrismaService())),
  $queryRaw: jest.fn(),
});

export const mockTenantId = 'tenant-123';
export const mockUserId = 'user-456';

export function createTestingModule(
  providers: any[],
  imports: any[] = [],
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports,
    providers: [
      ...providers,
      {
        provide: PrismaService,
        useValue: createMockPrismaService(),
      },
    ],
  }).compile();
}

// Factory functions for test data
export const createMockCustomer = (overrides = {}) => ({
  id: 'customer-123',
  tenantId: mockTenantId,
  name: 'Test Customer',
  type: 'SHIPPER',
  status: 'ACTIVE',
  email: 'test@example.com',
  phone: '555-1234',
  address: '123 Test St',
  city: 'Chicago',
  state: 'IL',
  postalCode: '60601',
  creditLimit: 50000,
  paymentTerms: 30,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: 'order-123',
  tenantId: mockTenantId,
  orderNumber: 'ORD-001',
  customerId: 'customer-123',
  status: 'PENDING',
  totalRevenue: 1500,
  totalCost: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

export const createMockLoad = (overrides = {}) => ({
  id: 'load-123',
  tenantId: mockTenantId,
  loadNumber: 'LOAD-001',
  orderId: 'order-123',
  status: 'PENDING',
  carrierId: null,
  driverId: null,
  carrierRate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

export const createMockCarrier = (overrides = {}) => ({
  id: 'carrier-123',
  tenantId: mockTenantId,
  legalName: 'Test Carrier LLC',
  mcNumber: 'MC123456',
  dotNumber: 'DOT789012',
  status: 'ACTIVE',
  qualificationTier: 'APPROVED',
  equipmentTypes: ['VAN', 'REEFER'],
  serviceStates: ['IL', 'WI', 'IN'],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

export const createMockInvoice = (overrides = {}) => ({
  id: 'invoice-123',
  tenantId: mockTenantId,
  invoiceNumber: 'INV-001',
  customerId: 'customer-123',
  orderId: 'order-123',
  status: 'DRAFT',
  subtotal: 1500,
  tax: 0,
  total: 1500,
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});
```

---

### Step 2: Auth Service Unit Tests

**File: `apps/api/src/modules/auth/auth.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedPassword',
        tenantId: 'tenant-123',
        status: 'ACTIVE',
        role: 'USER',
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-123',
        status: 'ACTIVE',
        role: 'USER',
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.validateUser('notfound@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedPassword',
        status: 'ACTIVE',
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedPassword',
        status: 'INACTIVE',
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-123',
        role: 'USER',
      };

      mockJwtService.sign.mockReturnValueOnce('access-token');
      mockJwtService.sign.mockReturnValueOnce('refresh-token');
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'rt-123' });

      const result = await service.login(user);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result).toHaveProperty('user');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const mockRefreshToken = {
        id: 'rt-123',
        token: 'valid-refresh-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 86400000),
        user: {
          id: 'user-123',
          email: 'test@example.com',
          tenantId: 'tenant-123',
          role: 'USER',
          status: 'ACTIVE',
        },
      };

      mockPrisma.refreshToken.findFirst.mockResolvedValue(mockRefreshToken);
      mockPrisma.refreshToken.delete.mockResolvedValue(mockRefreshToken);
      mockJwtService.sign.mockReturnValueOnce('new-access-token');
      mockJwtService.sign.mockReturnValueOnce('new-refresh-token');
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'rt-456' });

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      const mockRefreshToken = {
        id: 'rt-123',
        token: 'expired-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() - 86400000), // expired
      };

      mockPrisma.refreshToken.findFirst.mockResolvedValue(mockRefreshToken);

      await expect(
        service.refreshTokens('expired-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when refresh token not found', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue(null);

      await expect(
        service.refreshTokens('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete refresh token on logout', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout('user-123');

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });
  });
});
```

---

### Step 3: Customers Service Unit Tests

**File: `apps/api/src/modules/crm/customers/customers.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { PrismaService } from '../../../prisma.service';
import { createMockCustomer, mockTenantId } from '../../../../test/utils/test-helpers';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    customer: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const createDto = {
        name: 'New Customer',
        type: 'SHIPPER',
        email: 'new@example.com',
      };
      const mockCreated = createMockCustomer(createDto);

      mockPrisma.customer.create.mockResolvedValue(mockCreated);

      const result = await service.create(mockTenantId, createDto);

      expect(result).toEqual(mockCreated);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: mockTenantId,
          name: 'New Customer',
          type: 'SHIPPER',
        }),
      });
    });

    it('should throw BadRequestException when required fields missing', async () => {
      const createDto = { type: 'SHIPPER' }; // missing name

      await expect(
        service.create(mockTenantId, createDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      const mockCustomers = [
        createMockCustomer({ id: '1', name: 'Customer 1' }),
        createMockCustomer({ id: '2', name: 'Customer 2' }),
      ];

      mockPrisma.customer.findMany.mockResolvedValue(mockCustomers);
      mockPrisma.customer.count.mockResolvedValue(2);

      const result = await service.findAll(mockTenantId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by status', async () => {
      const mockCustomers = [createMockCustomer({ status: 'ACTIVE' })];

      mockPrisma.customer.findMany.mockResolvedValue(mockCustomers);
      mockPrisma.customer.count.mockResolvedValue(1);

      await service.findAll(mockTenantId, { status: 'ACTIVE' });

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        }),
      );
    });

    it('should filter by search term', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);
      mockPrisma.customer.count.mockResolvedValue(0);

      await service.findAll(mockTenantId, { search: 'acme' });

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: { contains: 'acme', mode: 'insensitive' } }),
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return customer when found', async () => {
      const mockCustomer = createMockCustomer();
      mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer);

      const result = await service.findOne(mockTenantId, 'customer-123');

      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(mockTenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not return deleted customers', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(mockTenantId, 'deleted-customer'),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.customer.findFirst).toHaveBeenCalledWith({
        where: expect.objectContaining({
          deletedAt: null,
        }),
      });
    });
  });

  describe('update', () => {
    it('should update customer when found', async () => {
      const mockCustomer = createMockCustomer();
      const updateDto = { name: 'Updated Name' };
      const updated = { ...mockCustomer, ...updateDto };

      mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer);
      mockPrisma.customer.update.mockResolvedValue(updated);

      const result = await service.update(mockTenantId, 'customer-123', updateDto);

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(
        service.update(mockTenantId, 'nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete customer', async () => {
      const mockCustomer = createMockCustomer();
      mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer);
      mockPrisma.customer.update.mockResolvedValue({
        ...mockCustomer,
        deletedAt: new Date(),
      });

      await service.remove(mockTenantId, 'customer-123');

      expect(mockPrisma.customer.update).toHaveBeenCalledWith({
        where: { id: 'customer-123' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('convertToAccount', () => {
    it('should convert lead to active account', async () => {
      const lead = createMockCustomer({ status: 'LEAD' });
      const converted = { ...lead, status: 'ACTIVE' };

      mockPrisma.customer.findFirst.mockResolvedValue(lead);
      mockPrisma.customer.update.mockResolvedValue(converted);

      const result = await service.convertToAccount(mockTenantId, 'customer-123');

      expect(result.status).toBe('ACTIVE');
    });

    it('should throw BadRequestException when not a lead', async () => {
      const activeCustomer = createMockCustomer({ status: 'ACTIVE' });
      mockPrisma.customer.findFirst.mockResolvedValue(activeCustomer);

      await expect(
        service.convertToAccount(mockTenantId, 'customer-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
```

---

### Step 4: Orders Service Unit Tests

**File: `apps/api/src/modules/tms-core/orders/orders.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../../prisma.service';
import { createMockOrder, createMockCustomer, mockTenantId } from '../../../../test/utils/test-helpers';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    order: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    customer: {
      findFirst: jest.fn(),
    },
    orderStop: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create order with stops', async () => {
      const createDto = {
        customerId: 'customer-123',
        stops: [
          { stopType: 'PICKUP', city: 'Chicago', state: 'IL', stopSequence: 1 },
          { stopType: 'DELIVERY', city: 'Detroit', state: 'MI', stopSequence: 2 },
        ],
      };
      const mockCustomer = createMockCustomer();
      const mockOrder = createMockOrder();

      mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer);
      mockPrisma.order.create.mockResolvedValue(mockOrder);

      const result = await service.create(mockTenantId, createDto);

      expect(result).toEqual(mockOrder);
      expect(mockPrisma.order.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(
        service.create(mockTenantId, { customerId: 'invalid' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate minimum 2 stops', async () => {
      const createDto = {
        customerId: 'customer-123',
        stops: [{ stopType: 'PICKUP', city: 'Chicago', state: 'IL' }],
      };
      const mockCustomer = createMockCustomer();
      mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer);

      await expect(
        service.create(mockTenantId, createDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate unique order number', async () => {
      const mockCustomer = createMockCustomer();
      mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer);
      mockPrisma.order.create.mockImplementation(({ data }) => 
        Promise.resolve({ ...createMockOrder(), orderNumber: data.orderNumber })
      );

      const result = await service.create(mockTenantId, {
        customerId: 'customer-123',
        stops: [
          { stopType: 'PICKUP', city: 'Chicago', state: 'IL', stopSequence: 1 },
          { stopType: 'DELIVERY', city: 'Detroit', state: 'MI', stopSequence: 2 },
        ],
      });

      expect(result.orderNumber).toMatch(/^ORD-/);
    });
  });

  describe('updateStatus', () => {
    const validTransitions = {
      DRAFT: ['SUBMITTED', 'CANCELLED'],
      SUBMITTED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
      ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    it('should allow valid status transitions', async () => {
      const order = createMockOrder({ status: 'DRAFT' });
      mockPrisma.order.findFirst.mockResolvedValue(order);
      mockPrisma.order.update.mockResolvedValue({ ...order, status: 'SUBMITTED' });

      const result = await service.updateStatus(mockTenantId, 'order-123', 'SUBMITTED');

      expect(result.status).toBe('SUBMITTED');
    });

    it('should reject invalid status transitions', async () => {
      const order = createMockOrder({ status: 'COMPLETED' });
      mockPrisma.order.findFirst.mockResolvedValue(order);

      await expect(
        service.updateStatus(mockTenantId, 'order-123', 'DRAFT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should require reason for cancellation', async () => {
      const order = createMockOrder({ status: 'IN_PROGRESS' });
      mockPrisma.order.findFirst.mockResolvedValue(order);

      await expect(
        service.updateStatus(mockTenantId, 'order-123', 'CANCELLED'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('clone', () => {
    it('should clone order with new order number', async () => {
      const original = createMockOrder({
        stops: [
          { id: 's1', stopType: 'PICKUP', city: 'Chicago', stopSequence: 1 },
          { id: 's2', stopType: 'DELIVERY', city: 'Detroit', stopSequence: 2 },
        ],
      });
      mockPrisma.order.findFirst.mockResolvedValue(original);
      mockPrisma.order.create.mockImplementation(({ data }) =>
        Promise.resolve({ ...original, id: 'new-order', orderNumber: data.orderNumber, status: 'DRAFT' })
      );

      const result = await service.clone(mockTenantId, 'order-123');

      expect(result.id).not.toBe(original.id);
      expect(result.orderNumber).not.toBe(original.orderNumber);
      expect(result.status).toBe('DRAFT');
    });
  });

  describe('calculateTotals', () => {
    it('should calculate revenue and margin', async () => {
      const order = createMockOrder({
        totalRevenue: 2000,
        totalCost: 1500,
      });
      mockPrisma.order.findFirst.mockResolvedValue(order);

      const result = await service.calculateTotals(mockTenantId, 'order-123');

      expect(result.revenue).toBe(2000);
      expect(result.cost).toBe(1500);
      expect(result.margin).toBe(500);
      expect(result.marginPercent).toBe(25);
    });
  });
});
```

---

### Step 5: Loads Service Unit Tests

**File: `apps/api/src/modules/tms-core/loads/loads.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LoadsService } from './loads.service';
import { PrismaService } from '../../../prisma.service';
import { createMockLoad, createMockCarrier, mockTenantId } from '../../../../test/utils/test-helpers';

describe('LoadsService', () => {
  let service: LoadsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    load: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    carrier: {
      findFirst: jest.fn(),
    },
    driver: {
      findFirst: jest.fn(),
    },
    trackingUpdate: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LoadsService>(LoadsService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('assign', () => {
    it('should assign carrier and driver to load', async () => {
      const load = createMockLoad({ status: 'PENDING' });
      const carrier = createMockCarrier();
      const driver = { id: 'driver-123', name: 'John Driver' };

      mockPrisma.load.findFirst.mockResolvedValue(load);
      mockPrisma.carrier.findFirst.mockResolvedValue(carrier);
      mockPrisma.driver.findFirst.mockResolvedValue(driver);
      mockPrisma.load.update.mockResolvedValue({
        ...load,
        carrierId: carrier.id,
        driverId: driver.id,
        status: 'DISPATCHED',
      });

      const result = await service.assign(mockTenantId, 'load-123', {
        carrierId: carrier.id,
        driverId: driver.id,
        rate: 1500,
      });

      expect(result.carrierId).toBe(carrier.id);
      expect(result.status).toBe('DISPATCHED');
    });

    it('should throw NotFoundException when carrier not found', async () => {
      const load = createMockLoad();
      mockPrisma.load.findFirst.mockResolvedValue(load);
      mockPrisma.carrier.findFirst.mockResolvedValue(null);

      await expect(
        service.assign(mockTenantId, 'load-123', { carrierId: 'invalid' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate carrier is active', async () => {
      const load = createMockLoad();
      const inactiveCarrier = createMockCarrier({ status: 'INACTIVE' });

      mockPrisma.load.findFirst.mockResolvedValue(load);
      mockPrisma.carrier.findFirst.mockResolvedValue(inactiveCarrier);

      await expect(
        service.assign(mockTenantId, 'load-123', { carrierId: inactiveCarrier.id }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should update load status', async () => {
      const load = createMockLoad({ status: 'DISPATCHED' });
      mockPrisma.load.findFirst.mockResolvedValue(load);
      mockPrisma.load.update.mockResolvedValue({ ...load, status: 'PICKED_UP' });
      mockPrisma.trackingUpdate.create.mockResolvedValue({});

      const result = await service.updateStatus(mockTenantId, 'load-123', {
        status: 'PICKED_UP',
        notes: 'Picked up on time',
      });

      expect(result.status).toBe('PICKED_UP');
    });

    it('should create tracking entry on status change', async () => {
      const load = createMockLoad({ status: 'IN_TRANSIT' });
      mockPrisma.load.findFirst.mockResolvedValue(load);
      mockPrisma.load.update.mockResolvedValue({ ...load, status: 'DELIVERED' });
      mockPrisma.trackingUpdate.create.mockResolvedValue({});

      await service.updateStatus(mockTenantId, 'load-123', { status: 'DELIVERED' });

      expect(mockPrisma.trackingUpdate.create).toHaveBeenCalled();
    });
  });

  describe('addTracking', () => {
    it('should add tracking update with location', async () => {
      const load = createMockLoad();
      mockPrisma.load.findFirst.mockResolvedValue(load);
      mockPrisma.trackingUpdate.create.mockResolvedValue({
        id: 'tracking-123',
        loadId: load.id,
        latitude: 41.8781,
        longitude: -87.6298,
        city: 'Chicago',
        state: 'IL',
        eventType: 'LOCATION_UPDATE',
      });

      const result = await service.addTracking(mockTenantId, 'load-123', {
        latitude: 41.8781,
        longitude: -87.6298,
        city: 'Chicago',
        state: 'IL',
      });

      expect(result.latitude).toBe(41.8781);
      expect(result.city).toBe('Chicago');
    });
  });

  describe('getTracking', () => {
    it('should return tracking history in chronological order', async () => {
      const load = createMockLoad();
      const trackingHistory = [
        { id: '1', createdAt: new Date('2024-01-01'), city: 'Chicago' },
        { id: '2', createdAt: new Date('2024-01-02'), city: 'Detroit' },
      ];

      mockPrisma.load.findFirst.mockResolvedValue(load);
      mockPrisma.trackingUpdate.findMany.mockResolvedValue(trackingHistory);

      const result = await service.getTracking(mockTenantId, 'load-123');

      expect(result).toHaveLength(2);
      expect(result[0].city).toBe('Chicago');
    });
  });
});
```

---

### Step 6: Accounting Service Unit Tests

**File: `apps/api/src/modules/accounting/invoices/invoices.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../../../prisma.service';
import { createMockInvoice, createMockOrder, mockTenantId } from '../../../../test/utils/test-helpers';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    invoice: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
    },
    invoiceLine: {
      createMany: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create invoice with auto-generated number', async () => {
      const order = createMockOrder();
      mockPrisma.order.findFirst.mockResolvedValue(order);
      mockPrisma.invoice.create.mockImplementation(({ data }) =>
        Promise.resolve(createMockInvoice({ invoiceNumber: data.invoiceNumber }))
      );

      const result = await service.create(mockTenantId, { orderId: order.id });

      expect(result.invoiceNumber).toMatch(/^INV-/);
    });

    it('should calculate totals from line items', async () => {
      const order = createMockOrder({ totalRevenue: 2000 });
      mockPrisma.order.findFirst.mockResolvedValue(order);
      mockPrisma.invoice.create.mockResolvedValue(
        createMockInvoice({ subtotal: 2000, tax: 0, total: 2000 })
      );

      const result = await service.create(mockTenantId, {
        orderId: order.id,
        lines: [
          { description: 'Freight', amount: 2000 },
        ],
      });

      expect(result.total).toBe(2000);
    });
  });

  describe('send', () => {
    it('should update status to SENT', async () => {
      const invoice = createMockInvoice({ status: 'DRAFT' });
      mockPrisma.invoice.findFirst.mockResolvedValue(invoice);
      mockPrisma.invoice.update.mockResolvedValue({ ...invoice, status: 'SENT' });

      const result = await service.send(mockTenantId, invoice.id, {
        emails: ['customer@example.com'],
      });

      expect(result.status).toBe('SENT');
    });

    it('should throw BadRequestException if already voided', async () => {
      const invoice = createMockInvoice({ status: 'VOIDED' });
      mockPrisma.invoice.findFirst.mockResolvedValue(invoice);

      await expect(
        service.send(mockTenantId, invoice.id, { emails: ['test@example.com'] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('void', () => {
    it('should void unpaid invoice', async () => {
      const invoice = createMockInvoice({ status: 'SENT' });
      mockPrisma.invoice.findFirst.mockResolvedValue(invoice);
      mockPrisma.payment.findMany.mockResolvedValue([]); // no payments
      mockPrisma.invoice.update.mockResolvedValue({ ...invoice, status: 'VOIDED' });

      const result = await service.void(mockTenantId, invoice.id, { reason: 'Duplicate' });

      expect(result.status).toBe('VOIDED');
    });

    it('should throw BadRequestException if invoice has payments', async () => {
      const invoice = createMockInvoice({ status: 'SENT' });
      mockPrisma.invoice.findFirst.mockResolvedValue(invoice);
      mockPrisma.payment.findMany.mockResolvedValue([{ id: 'payment-1', amount: 500 }]);

      await expect(
        service.void(mockTenantId, invoice.id, { reason: 'Test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('calculateBalance', () => {
    it('should calculate remaining balance', async () => {
      const invoice = createMockInvoice({ total: 2000 });
      const payments = [
        { amount: 500 },
        { amount: 300 },
      ];

      mockPrisma.invoice.findFirst.mockResolvedValue(invoice);
      mockPrisma.payment.findMany.mockResolvedValue(payments);

      const result = await service.calculateBalance(mockTenantId, invoice.id);

      expect(result.total).toBe(2000);
      expect(result.paid).toBe(800);
      expect(result.balance).toBe(1200);
    });
  });

  describe('createBatch', () => {
    it('should create invoices for multiple orders', async () => {
      const orders = [
        createMockOrder({ id: 'o1', totalRevenue: 1000 }),
        createMockOrder({ id: 'o2', totalRevenue: 1500 }),
      ];

      mockPrisma.order.findMany = jest.fn().mockResolvedValue(orders);
      mockPrisma.invoice.create
        .mockResolvedValueOnce(createMockInvoice({ orderId: 'o1', total: 1000 }))
        .mockResolvedValueOnce(createMockInvoice({ orderId: 'o2', total: 1500 }));

      const result = await service.createBatch(mockTenantId, {
        orderIds: ['o1', 'o2'],
      });

      expect(result).toHaveLength(2);
      expect(mockPrisma.invoice.create).toHaveBeenCalledTimes(2);
    });
  });
});
```

---

### Step 7: Audit Service Unit Tests

**File: `apps/api/src/modules/audit/audit.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../prisma.service';
import * as crypto from 'crypto';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    auditLog: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create audit log with hash chain', async () => {
      const previousLog = {
        id: 'prev-123',
        hash: 'previoushash123',
      };
      mockPrisma.auditLog.findFirst.mockResolvedValue(previousLog);
      mockPrisma.auditLog.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'new-123', ...data })
      );

      await service.log({
        tenantId: 'tenant-123',
        userId: 'user-456',
        action: 'CREATE',
        entityType: 'Order',
        entityId: 'order-789',
        changes: { status: { old: 'DRAFT', new: 'SUBMITTED' } },
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          previousHash: 'previoushash123',
          hash: expect.any(String),
        }),
      });
    });

    it('should generate valid hash from log data', async () => {
      mockPrisma.auditLog.findFirst.mockResolvedValue(null);
      mockPrisma.auditLog.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'new-123', ...data })
      );

      await service.log({
        tenantId: 'tenant-123',
        userId: 'user-456',
        action: 'UPDATE',
        entityType: 'Load',
        entityId: 'load-123',
      });

      const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
      expect(createCall.data.hash).toHaveLength(64); // SHA-256 hex
    });
  });

  describe('verifyChain', () => {
    it('should return valid when chain is intact', async () => {
      const logs = [
        { id: '1', hash: 'hash1', previousHash: null },
        { id: '2', hash: 'hash2', previousHash: 'hash1' },
        { id: '3', hash: 'hash3', previousHash: 'hash2' },
      ];
      mockPrisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await service.verifyChain('tenant-123');

      expect(result.valid).toBe(true);
      expect(result.brokenAt).toBeNull();
    });

    it('should detect broken chain', async () => {
      const logs = [
        { id: '1', hash: 'hash1', previousHash: null },
        { id: '2', hash: 'hash2', previousHash: 'wronghash' }, // broken
        { id: '3', hash: 'hash3', previousHash: 'hash2' },
      ];
      mockPrisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await service.verifyChain('tenant-123');

      expect(result.valid).toBe(false);
      expect(result.brokenAt).toBe('2');
    });
  });

  describe('getEntityHistory', () => {
    it('should return all changes for an entity', async () => {
      const logs = [
        { id: '1', action: 'CREATE', changes: {}, createdAt: new Date('2024-01-01') },
        { id: '2', action: 'UPDATE', changes: { status: 'ACTIVE' }, createdAt: new Date('2024-01-02') },
      ];
      mockPrisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await service.getEntityHistory('tenant-123', 'Order', 'order-123');

      expect(result).toHaveLength(2);
      expect(result[0].action).toBe('CREATE');
    });
  });

  describe('getLoginHistory', () => {
    it('should return login attempts for user', async () => {
      const logs = [
        { id: '1', action: 'LOGIN_SUCCESS', createdAt: new Date() },
        { id: '2', action: 'LOGIN_FAILED', createdAt: new Date() },
      ];
      mockPrisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await service.getLoginHistory('tenant-123', 'user-123');

      expect(result).toHaveLength(2);
    });
  });
});
```

---

### Step 8: Config Service Unit Tests

**File: `apps/api/src/modules/config/config.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { PrismaService } from '../../prisma.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    systemConfig: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    featureFlag: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    businessHours: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    holiday: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return config value', async () => {
      mockPrisma.systemConfig.findFirst.mockResolvedValue({
        key: 'company.name',
        value: 'Acme Corp',
      });

      const result = await service.get('tenant-123', 'company.name');

      expect(result).toBe('Acme Corp');
    });

    it('should return default value when not found', async () => {
      mockPrisma.systemConfig.findFirst.mockResolvedValue(null);

      const result = await service.get('tenant-123', 'unknown.key', 'default');

      expect(result).toBe('default');
    });
  });

  describe('set', () => {
    it('should create or update config value', async () => {
      mockPrisma.systemConfig.upsert.mockResolvedValue({
        key: 'company.name',
        value: 'New Name',
      });

      await service.set('tenant-123', 'company.name', 'New Name');

      expect(mockPrisma.systemConfig.upsert).toHaveBeenCalledWith({
        where: expect.any(Object),
        create: expect.objectContaining({ value: 'New Name' }),
        update: expect.objectContaining({ value: 'New Name' }),
      });
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true when feature is enabled', async () => {
      mockPrisma.featureFlag.findFirst.mockResolvedValue({
        key: 'newDashboard',
        enabled: true,
        rolloutPercentage: 100,
      });

      const result = await service.isFeatureEnabled('tenant-123', 'newDashboard');

      expect(result).toBe(true);
    });

    it('should return false when feature is disabled', async () => {
      mockPrisma.featureFlag.findFirst.mockResolvedValue({
        key: 'betaFeature',
        enabled: false,
      });

      const result = await service.isFeatureEnabled('tenant-123', 'betaFeature');

      expect(result).toBe(false);
    });

    it('should check rollout percentage', async () => {
      mockPrisma.featureFlag.findFirst.mockResolvedValue({
        key: 'gradualRollout',
        enabled: true,
        rolloutPercentage: 50,
      });

      // Call multiple times - should respect percentage
      const results = await Promise.all(
        Array(100).fill(null).map(() => 
          service.isFeatureEnabled('tenant-123', 'gradualRollout', 'user-123')
        )
      );

      // With 50% rollout, should be consistent for same user
      const allSame = results.every(r => r === results[0]);
      expect(allSame).toBe(true);
    });
  });

  describe('getBusinessHours', () => {
    it('should return business hours for tenant', async () => {
      const hours = [
        { dayOfWeek: 1, openTime: '09:00', closeTime: '17:00' },
        { dayOfWeek: 2, openTime: '09:00', closeTime: '17:00' },
      ];
      mockPrisma.businessHours.findMany.mockResolvedValue(hours);

      const result = await service.getBusinessHours('tenant-123');

      expect(result).toHaveLength(2);
    });
  });

  describe('isBusinessDay', () => {
    it('should return true for business day', async () => {
      mockPrisma.businessHours.findFirst.mockResolvedValue({
        dayOfWeek: 1, // Monday
        openTime: '09:00',
        closeTime: '17:00',
      });
      mockPrisma.holiday.findMany.mockResolvedValue([]);

      const monday = new Date('2024-01-08'); // A Monday
      const result = await service.isBusinessDay('tenant-123', monday);

      expect(result).toBe(true);
    });

    it('should return false for holiday', async () => {
      mockPrisma.businessHours.findFirst.mockResolvedValue({
        dayOfWeek: 1,
        openTime: '09:00',
        closeTime: '17:00',
      });
      mockPrisma.holiday.findMany.mockResolvedValue([
        { date: new Date('2024-01-08'), name: 'Company Holiday' },
      ]);

      const result = await service.isBusinessDay('tenant-123', new Date('2024-01-08'));

      expect(result).toBe(false);
    });
  });
});
```

---

### Step 9: Run and Verify Tests

Add scripts to `package.json`:

```json
{
  "scripts": {
    "test:unit": "jest --testPathPattern=\\.spec\\.ts$ --coverage",
    "test:unit:watch": "jest --testPathPattern=\\.spec\\.ts$ --watch",
    "test:unit:debug": "node --inspect-brk node_modules/.bin/jest --testPathPattern=\\.spec\\.ts$ --runInBand"
  }
}
```

Run verification:

```bash
cd apps/api
pnpm test:unit
```

---

## Acceptance Criteria

- [ ] Jest configured for unit tests with coverage thresholds
- [ ] Test utilities and mock factories created
- [ ] Auth service has 90%+ unit test coverage
- [ ] Customer service has 80%+ unit test coverage
- [ ] Order service has 85%+ unit test coverage
- [ ] Load service has 85%+ unit test coverage
- [ ] Invoice service has 85%+ unit test coverage
- [ ] Audit service has 90%+ unit test coverage
- [ ] Config service has 85%+ unit test coverage
- [ ] All tests pass: `pnpm test:unit`
- [ ] Coverage report generated in `/coverage`
- [ ] No business logic untested

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

```markdown
| 12 | [Unit Tests](...) | P3 | 10-12h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics

```markdown
| Unit Test Coverage | 0% | 80%+ | 80% |
```

### 3. Add Changelog Entry

```markdown
### [Date] - Prompt 12: Unit Test Implementation
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Configured Jest for unit testing
- Created test utilities and mock factories
- Implemented Auth service unit tests (90%+ coverage)
- Implemented Customer service unit tests (80%+ coverage)
- Implemented Order service unit tests (85%+ coverage)
- Implemented Load service unit tests (85%+ coverage)
- Implemented Invoice service unit tests (85%+ coverage)
- Implemented Audit service unit tests (90%+ coverage)
- Implemented Config service unit tests (85%+ coverage)
- Overall unit test coverage: 80%+

#### Metrics Updated
- Unit Test Coverage: 0% → 80%+
```
