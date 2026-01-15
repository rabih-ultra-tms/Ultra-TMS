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
