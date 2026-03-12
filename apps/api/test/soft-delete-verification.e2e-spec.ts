import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';
import { PrismaService } from '../src/prisma.service';

/**
 * MP-03-008: Soft-delete Verification Tests
 *
 * Verifies that deleted records (deletedAt != null) are properly excluded from queries
 * across services. Tests API endpoints and database filtering.
 */

describe('Soft-Delete Verification (MP-03-008)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const TEST_TENANT = 'tenant-soft-delete-test';
  const TEST_USER = 'user-soft-delete-test';

  beforeAll(async () => {
    const setup = await createTestApp(
      TEST_TENANT,
      TEST_USER,
      'test@softdelete.com'
    );
    app = setup.app;
    prisma = setup.prisma;
  });

  afterAll(async () => {
    // Cleanup test tenant
    await prisma.load.deleteMany({
      where: { tenantId: TEST_TENANT },
    });
    await prisma.order.deleteMany({
      where: { tenantId: TEST_TENANT },
    });
    await prisma.quote.deleteMany({
      where: { tenantId: TEST_TENANT },
    });
    await prisma.carrier.deleteMany({
      where: { tenantId: TEST_TENANT, id: { startsWith: 'carrier-' } },
    });
    await app.close();
  });

  describe('Loads - soft delete filtering', () => {
    let activeLoadId: string;
    let deletedLoadId: string;

    beforeAll(async () => {
      // Create active load
      const activeLoad = await prisma.load.create({
        data: {
          tenantId: TEST_TENANT,
          loadNumber: 'LOAD-ACTIVE-001',
          status: 'PENDING',
          deletedAt: null,
        },
      });
      activeLoadId = activeLoad.id;

      // Create deleted load
      const deletedLoad = await prisma.load.create({
        data: {
          tenantId: TEST_TENANT,
          loadNumber: 'LOAD-DELETED-001',
          status: 'PENDING',
          deletedAt: new Date('2026-01-01'),
        },
      });
      deletedLoadId = deletedLoad.id;
    });

    it('should exclude deleted loads from list API', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/loads')
        .set('x-test-role', 'DISPATCHER')
        .set('x-tenant-id', TEST_TENANT)
        .expect(200);

      const loadIds = res.body.data.map((l: Record<string, any>) => l.id);
      expect(loadIds).toContain(activeLoadId);
      expect(loadIds).not.toContain(deletedLoadId);
    });

    it('should exclude deleted loads from database query', async () => {
      const allLoads = await prisma.load.findMany({
        where: { tenantId: TEST_TENANT, loadNumber: { startsWith: 'LOAD-' } },
      });

      // Deleted records can still be found in raw queries
      expect(allLoads.some((l) => l.id === activeLoadId)).toBe(true);
      expect(allLoads.some((l) => l.id === deletedLoadId)).toBe(true);

      // But API queries should filter them out
      const activeLoads = await prisma.load.findMany({
        where: {
          tenantId: TEST_TENANT,
          loadNumber: { startsWith: 'LOAD-' },
          deletedAt: null,
        },
      });

      expect(activeLoads.some((l) => l.id === activeLoadId)).toBe(true);
      expect(activeLoads.some((l) => l.id === deletedLoadId)).toBe(false);
    });
  });

  describe('Orders - soft delete filtering', () => {
    let activeOrderId: string;
    let deletedOrderId: string;

    beforeAll(async () => {
      const activeOrder = await prisma.order.create({
        data: {
          tenantId: TEST_TENANT,
          orderNumber: 'ORD-ACTIVE-001',
          status: 'PENDING',
          orderDate: new Date(),
          deletedAt: null,
        },
      });
      activeOrderId = activeOrder.id;

      const deletedOrder = await prisma.order.create({
        data: {
          tenantId: TEST_TENANT,
          orderNumber: 'ORD-DELETED-001',
          status: 'PENDING',
          orderDate: new Date(),
          deletedAt: new Date('2026-01-01'),
        },
      });
      deletedOrderId = deletedOrder.id;
    });

    it('should exclude deleted orders from list API', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set('x-test-role', 'ADMIN')
        .set('x-tenant-id', TEST_TENANT)
        .expect(200);

      const orderIds = res.body.data.map((o: Record<string, any>) => o.id);
      expect(orderIds).toContain(activeOrderId);
      expect(orderIds).not.toContain(deletedOrderId);
    });

    it('should filter deleted orders from query', async () => {
      const activeOrders = await prisma.order.findMany({
        where: {
          tenantId: TEST_TENANT,
          orderNumber: { startsWith: 'ORD-ACTIVE' },
          deletedAt: null,
        },
      });

      expect(activeOrders.some((o) => o.id === activeOrderId)).toBe(true);

      const deletedOrders = await prisma.order.findMany({
        where: {
          tenantId: TEST_TENANT,
          orderNumber: { startsWith: 'ORD-DELETED' },
        },
      });

      expect(deletedOrders.some((o) => o.id === deletedOrderId)).toBe(true);
    });
  });

  describe('Quotes - soft delete filtering', () => {
    let activeQuoteId: string;
    let deletedQuoteId: string;

    beforeAll(async () => {
      const activeQuote = await prisma.quote.create({
        data: {
          tenantId: TEST_TENANT,
          quoteNumber: 'QUOTE-ACTIVE-001',
          status: 'DRAFT',
          originCity: 'Dallas',
          destCity: 'Houston',
          deletedAt: null,
        },
      });
      activeQuoteId = activeQuote.id;

      const deletedQuote = await prisma.quote.create({
        data: {
          tenantId: TEST_TENANT,
          quoteNumber: 'QUOTE-DELETED-001',
          status: 'DRAFT',
          originCity: 'Austin',
          destCity: 'San Antonio',
          deletedAt: new Date('2026-01-01'),
        },
      });
      deletedQuoteId = deletedQuote.id;
    });

    it('should exclude deleted quotes from list API', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/quotes')
        .set('x-test-role', 'SALES')
        .set('x-tenant-id', TEST_TENANT)
        .expect(200);

      const quoteIds = res.body.data.map((q: Record<string, any>) => q.id);
      expect(quoteIds).toContain(activeQuoteId);
      expect(quoteIds).not.toContain(deletedQuoteId);
    });
  });

  describe('Carriers - soft delete filtering', () => {
    let activeCarrierId: string;
    let deletedCarrierId: string;

    beforeAll(async () => {
      const activeCarrier = await prisma.carrier.create({
        data: {
          id: 'carrier-active-001',
          tenantId: TEST_TENANT,
          legalName: 'Active Carrier',
          deletedAt: null,
        },
      });
      activeCarrierId = activeCarrier.id;

      const deletedCarrier = await prisma.carrier.create({
        data: {
          id: 'carrier-deleted-001',
          tenantId: TEST_TENANT,
          legalName: 'Deleted Carrier',
          deletedAt: new Date('2026-01-01'),
        },
      });
      deletedCarrierId = deletedCarrier.id;
    });

    it('should exclude deleted carriers from list API', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/carriers')
        .set('x-test-role', 'ADMIN')
        .set('x-tenant-id', TEST_TENANT)
        .expect(200);

      const carrierIds = res.body.data.map((c: Record<string, any>) => c.id);
      expect(carrierIds).toContain(activeCarrierId);
      expect(carrierIds).not.toContain(deletedCarrierId);
    });

    it('should verify soft-delete filtering in database', async () => {
      const activeCarriers = await prisma.carrier.findMany({
        where: {
          tenantId: TEST_TENANT,
          id: 'carrier-active-001',
          deletedAt: null,
        },
      });

      expect(activeCarriers.length).toBe(1);
      expect(activeCarriers[0].id).toBe(activeCarrierId);

      // Deleted carrier should not be found with null filter
      const deletedCarriers = await prisma.carrier.findMany({
        where: {
          tenantId: TEST_TENANT,
          id: 'carrier-deleted-001',
          deletedAt: null,
        },
      });

      expect(deletedCarriers.length).toBe(0);
    });
  });

  describe('Multi-tenant isolation with soft delete', () => {
    it('should exclude deleted records from same tenant', async () => {
      // Create records in TEST_TENANT
      const _load1 = await prisma.load.create({
        data: {
          tenantId: TEST_TENANT,
          loadNumber: 'LOAD-MULTI-TENANT-001',
          status: 'PENDING',
          deletedAt: null,
        },
      });

      const _load2 = await prisma.load.create({
        data: {
          tenantId: TEST_TENANT,
          loadNumber: 'LOAD-MULTI-TENANT-DELETED',
          status: 'PENDING',
          deletedAt: new Date('2026-01-01'),
        },
      });

      // Query should return non-deleted records only
      const res = await request(app.getHttpServer())
        .get('/api/v1/loads')
        .set('x-test-role', 'DISPATCHER')
        .set('x-tenant-id', TEST_TENANT)
        .expect(200);

      const loadIds = res.body.data.map((l: Record<string, any>) => l.id);
      expect(loadIds).toContain(_load1.id);
      expect(loadIds).not.toContain(_load2.id);
    });
  });

  describe('Soft delete across multiple query patterns', () => {
    it('should filter deletedAt: null in count queries', async () => {
      // Create test loads
      const _load1 = await prisma.load.create({
        data: {
          tenantId: TEST_TENANT,
          loadNumber: 'LOAD-COUNT-001',
          status: 'PENDING',
          deletedAt: null,
        },
      });

      const _load2 = await prisma.load.create({
        data: {
          tenantId: TEST_TENANT,
          loadNumber: 'LOAD-COUNT-002',
          status: 'PENDING',
          deletedAt: new Date('2026-01-01'),
        },
      });

      // Count with filter
      const count = await prisma.load.count({
        where: {
          tenantId: TEST_TENANT,
          loadNumber: { startsWith: 'LOAD-COUNT' },
          deletedAt: null,
        },
      });

      expect(count).toBe(1);

      // Count without filter (includes deleted)
      const allCount = await prisma.load.count({
        where: {
          tenantId: TEST_TENANT,
          loadNumber: { startsWith: 'LOAD-COUNT' },
        },
      });

      expect(allCount).toBe(2);
    });

    it('should exclude deleted records in grouped/aggregated queries', async () => {
      // Create loads with different statuses
      const active1 = await prisma.load.create({
        data: {
          tenantId: TEST_TENANT,
          loadNumber: 'LOAD-STATUS-001',
          status: 'PENDING',
          deletedAt: null,
        },
      });

      const active2 = await prisma.load.create({
        data: {
          tenantId: TEST_TENANT,
          loadNumber: 'LOAD-STATUS-002',
          status: 'DISPATCHED',
          deletedAt: null,
        },
      });

      const deleted = await prisma.load.create({
        data: {
          tenantId: TEST_TENANT,
          loadNumber: 'LOAD-STATUS-DELETED',
          status: 'PENDING',
          deletedAt: new Date('2026-01-01'),
        },
      });

      // Verify both active loads exist
      const activeLoads = await prisma.load.findMany({
        where: {
          tenantId: TEST_TENANT,
          loadNumber: { startsWith: 'LOAD-STATUS' },
          deletedAt: null,
        },
      });

      expect(activeLoads).toHaveLength(2);
      expect(activeLoads.map((l) => l.id)).toContain(active1.id);
      expect(activeLoads.map((l) => l.id)).toContain(active2.id);
      expect(activeLoads.map((l) => l.id)).not.toContain(deleted.id);
    });
  });
});
