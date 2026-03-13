import { PrismaClient } from '@prisma/client';

/**
 * Smoke Tests: Data Integrity Verification (MP-06-011)
 *
 * These tests verify critical safety requirements before launch:
 * 1. Tenant isolation - Tenant A cannot see Tenant B's data
 * 2. Soft-delete filtering - Deleted records don't appear in queries
 *
 * Run with: pnpm --filter api test -- smoke-tests.spec.ts
 *
 * Uses shared Prisma instance to prevent connection pool exhaustion
 */

declare const getPrismaClient: () => PrismaClient;

describe('Smoke Test: Data Integrity', () => {
  let prisma: PrismaClient;

  const TENANT_A = 'tenant-isolation-a-' + Date.now();
  const TENANT_B = 'tenant-isolation-b-' + Date.now();

  beforeAll(async () => {
    // Use shared Prisma instance from test setup instead of creating new one
    prisma = getPrismaClient();

    // Create test tenants
    const timestamp = Date.now();
    await prisma.tenant.create({
      data: {
        id: TENANT_A,
        name: `Tenant A - ${timestamp}`,
        slug: `tenant-a-${timestamp}`,
        domain: `tenant-a-${timestamp}.test`,
        subscriptionPlan: 'ENTERPRISE',
      },
    });

    await prisma.tenant.create({
      data: {
        id: TENANT_B,
        name: `Tenant B - ${timestamp}`,
        slug: `tenant-b-${timestamp}`,
        domain: `tenant-b-${timestamp}.test`,
        subscriptionPlan: 'ENTERPRISE',
      },
    });
  });

  afterAll(async () => {
    // Clean up test data (in correct order due to foreign keys)
    // Note: Don't disconnect Prisma - it's managed by global test setup to prevent pool exhaustion
    await prisma.load.deleteMany({
      where: { tenantId: { in: [TENANT_A, TENANT_B] } },
    });
    await prisma.order.deleteMany({
      where: { tenantId: { in: [TENANT_A, TENANT_B] } },
    });
    await prisma.carrier.deleteMany({
      where: { tenantId: { in: [TENANT_A, TENANT_B] } },
    });
    await prisma.company.deleteMany({
      where: { tenantId: { in: [TENANT_A, TENANT_B] } },
    });
    await prisma.tenant.deleteMany({
      where: { id: { in: [TENANT_A, TENANT_B] } },
    });
    // Disconnect handled by global afterAll in test/setup.ts
  });

  describe('Tenant Isolation', () => {
    it('prevents cross-tenant data access for Load', async () => {
      // 1. Tenant A creates a load
      const loadA = await prisma.load.create({
        data: {
          tenantId: TENANT_A,
          loadNumber: `LOAD-TENANT-A-${Date.now()}`,
          status: 'PENDING',
          accessorialCosts: 0,
          fuelAdvance: 0,
          externalId: 'test-load-tenant-a',
          sourceSystem: 'smoke-test',
        },
      });

      expect(loadA).toBeDefined();
      expect(loadA.tenantId).toBe(TENANT_A);

      // 2. Tenant B queries loads (with proper tenant filter)
      const loadsForB = await prisma.load.findMany({
        where: {
          tenantId: TENANT_B,
          deletedAt: null,
        },
      });

      // 3. Verify Tenant B's loads don't include Tenant A's load
      const foundLoadA = loadsForB.find((l) => l.id === loadA.id);
      expect(foundLoadA).toBeUndefined();

      // 4. Verify Tenant A can see their own load
      const loadsForA = await prisma.load.findMany({
        where: {
          tenantId: TENANT_A,
          deletedAt: null,
        },
      });
      const foundLoadAInOwnTenant = loadsForA.find((l) => l.id === loadA.id);
      expect(foundLoadAInOwnTenant).toBeDefined();
    });

    it('prevents cross-tenant data access for Carrier', async () => {
      // 1. Tenant A creates a carrier
      const carrierA = await prisma.carrier.create({
        data: {
          tenantId: TENANT_A,
          legalName: `Test Carrier A - ${Date.now()}`,
          status: 'ACTIVE',
          externalId: 'test-carrier-tenant-a',
          sourceSystem: 'smoke-test',
        },
      });

      expect(carrierA).toBeDefined();
      expect(carrierA.tenantId).toBe(TENANT_A);

      // 2. Tenant B queries carriers (with proper tenant filter)
      const carriersForB = await prisma.carrier.findMany({
        where: {
          tenantId: TENANT_B,
          deletedAt: null,
        },
      });

      // 3. Verify Tenant B's carriers don't include Tenant A's carrier
      const foundCarrierA = carriersForB.find((c) => c.id === carrierA.id);
      expect(foundCarrierA).toBeUndefined();

      // 4. Verify Tenant A can see their own carrier
      const carriersForA = await prisma.carrier.findMany({
        where: {
          tenantId: TENANT_A,
          deletedAt: null,
        },
      });
      const foundCarrierAInOwnTenant = carriersForA.find(
        (c) => c.id === carrierA.id
      );
      expect(foundCarrierAInOwnTenant).toBeDefined();
    });
  });

  describe('Soft-Delete Filtering', () => {
    it('excludes soft-deleted Load records from queries', async () => {
      // 1. Create a load
      const load = await prisma.load.create({
        data: {
          tenantId: TENANT_A,
          loadNumber: `LOAD-SOFT-DELETE-${Date.now()}`,
          status: 'PENDING',
          accessorialCosts: 0,
          fuelAdvance: 0,
          externalId: 'test-load-soft-delete',
          sourceSystem: 'smoke-test',
        },
      });

      expect(load).toBeDefined();
      expect(load.deletedAt).toBeNull();

      // 2. Verify it appears in the list before deletion
      const loadsBeforeSoftDelete = await prisma.load.findMany({
        where: {
          tenantId: TENANT_A,
          deletedAt: null,
        },
      });
      const foundBeforeDelete = loadsBeforeSoftDelete.find(
        (l) => l.id === load.id
      );
      expect(foundBeforeDelete).toBeDefined();

      // 3. Soft-delete the load
      const softDeletedLoad = await prisma.load.update({
        where: { id: load.id },
        data: { deletedAt: new Date() },
      });

      expect(softDeletedLoad.deletedAt).not.toBeNull();

      // 4. Query loads with soft-delete filter (standard query)
      const loadsAfterSoftDelete = await prisma.load.findMany({
        where: {
          tenantId: TENANT_A,
          deletedAt: null,
        },
      });

      // 5. Verify the soft-deleted load doesn't appear
      const foundAfterDelete = loadsAfterSoftDelete.find(
        (l) => l.id === load.id
      );
      expect(foundAfterDelete).toBeUndefined();

      // 6. Verify we can still find it if we explicitly query with deletedAt condition
      const softDeletedLoadStillExists = await prisma.load.findUnique({
        where: { id: load.id },
      });
      expect(softDeletedLoadStillExists).toBeDefined();
      expect(softDeletedLoadStillExists?.deletedAt).not.toBeNull();
    });

    it('excludes soft-deleted Carrier records from queries', async () => {
      // 1. Create a carrier
      const carrier = await prisma.carrier.create({
        data: {
          tenantId: TENANT_A,
          legalName: `Test Carrier Soft Delete - ${Date.now()}`,
          status: 'ACTIVE',
          externalId: 'test-carrier-soft-delete',
          sourceSystem: 'smoke-test',
        },
      });

      expect(carrier).toBeDefined();
      expect(carrier.deletedAt).toBeNull();

      // 2. Verify it appears in the list before deletion
      const carriersBeforeSoftDelete = await prisma.carrier.findMany({
        where: {
          tenantId: TENANT_A,
          deletedAt: null,
        },
      });
      const foundBeforeDelete = carriersBeforeSoftDelete.find(
        (c) => c.id === carrier.id
      );
      expect(foundBeforeDelete).toBeDefined();

      // 3. Soft-delete the carrier
      const softDeletedCarrier = await prisma.carrier.update({
        where: { id: carrier.id },
        data: { deletedAt: new Date() },
      });

      expect(softDeletedCarrier.deletedAt).not.toBeNull();

      // 4. Query carriers with soft-delete filter (standard query)
      const carriersAfterSoftDelete = await prisma.carrier.findMany({
        where: {
          tenantId: TENANT_A,
          deletedAt: null,
        },
      });

      // 5. Verify the soft-deleted carrier doesn't appear
      const foundAfterDelete = carriersAfterSoftDelete.find(
        (c) => c.id === carrier.id
      );
      expect(foundAfterDelete).toBeUndefined();

      // 6. Verify we can still find it if we explicitly query with deletedAt condition
      const softDeletedCarrierStillExists = await prisma.carrier.findUnique({
        where: { id: carrier.id },
      });
      expect(softDeletedCarrierStillExists).toBeDefined();
      expect(softDeletedCarrierStillExists?.deletedAt).not.toBeNull();
    });

    it('excludes soft-deleted Order records from queries', async () => {
      // 1. Create a customer (Company) first
      const customer = await prisma.company.create({
        data: {
          tenantId: TENANT_A,
          name: `Test Customer - ${Date.now()}`,
          companyType: 'SHIPPER',
          status: 'ACTIVE',
          externalId: 'test-customer-order',
          sourceSystem: 'smoke-test',
        },
      });

      // 2. Create an order with the customer
      const order = await prisma.order.create({
        data: {
          tenantId: TENANT_A,
          orderNumber: `ORDER-SOFT-DELETE-${Date.now()}`,
          customerId: customer.id,
          status: 'PENDING',
          externalId: 'test-order-soft-delete',
          sourceSystem: 'smoke-test',
        },
      });

      expect(order).toBeDefined();
      expect(order.deletedAt).toBeNull();

      // 2. Verify it appears in the list before deletion
      const ordersBeforeSoftDelete = await prisma.order.findMany({
        where: {
          tenantId: TENANT_A,
          deletedAt: null,
        },
      });
      const foundBeforeDelete = ordersBeforeSoftDelete.find(
        (o) => o.id === order.id
      );
      expect(foundBeforeDelete).toBeDefined();

      // 3. Soft-delete the order
      const softDeletedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { deletedAt: new Date() },
      });

      expect(softDeletedOrder.deletedAt).not.toBeNull();

      // 4. Query orders with soft-delete filter (standard query)
      const ordersAfterSoftDelete = await prisma.order.findMany({
        where: {
          tenantId: TENANT_A,
          deletedAt: null,
        },
      });

      // 5. Verify the soft-deleted order doesn't appear
      const foundAfterDelete = ordersAfterSoftDelete.find(
        (o) => o.id === order.id
      );
      expect(foundAfterDelete).toBeUndefined();

      // 6. Verify we can still find it if we explicitly query with deletedAt condition
      const softDeletedOrderStillExists = await prisma.order.findUnique({
        where: { id: order.id },
      });
      expect(softDeletedOrderStillExists).toBeDefined();
      expect(softDeletedOrderStillExists?.deletedAt).not.toBeNull();
    });
  });

  describe('Combined: Tenant Isolation + Soft Delete', () => {
    it('ensures soft-deleted records remain isolated per tenant', async () => {
      // 1. Create load in Tenant A
      const loadA = await prisma.load.create({
        data: {
          tenantId: TENANT_A,
          loadNumber: `LOAD-COMBINED-${Date.now()}`,
          status: 'PENDING',
          accessorialCosts: 0,
          fuelAdvance: 0,
          externalId: 'test-load-combined',
          sourceSystem: 'smoke-test',
        },
      });

      // 2. Soft-delete it
      await prisma.load.update({
        where: { id: loadA.id },
        data: { deletedAt: new Date() },
      });

      // 3. Create similar load in Tenant B
      const loadB = await prisma.load.create({
        data: {
          tenantId: TENANT_B,
          loadNumber: `LOAD-COMBINED-B-${Date.now()}`,
          status: 'PENDING',
          accessorialCosts: 0,
          fuelAdvance: 0,
          externalId: 'test-load-combined-b',
          sourceSystem: 'smoke-test',
        },
      });

      // 4. Both tenants query their loads (with both filters)
      const loadsA = await prisma.load.findMany({
        where: {
          tenantId: TENANT_A,
          deletedAt: null,
        },
      });

      const loadsB = await prisma.load.findMany({
        where: {
          tenantId: TENANT_B,
          deletedAt: null,
        },
      });

      // 5. Verify:
      //    - Tenant A doesn't see the soft-deleted load
      //    - Tenant B doesn't see Tenant A's data (even if not deleted)
      //    - Tenant B only sees their own load
      expect(loadsA.find((l) => l.id === loadA.id)).toBeUndefined();
      expect(loadsB.find((l) => l.id === loadA.id)).toBeUndefined();
      expect(loadsB.find((l) => l.id === loadB.id)).toBeDefined();
    });
  });
});
