import { PrismaClient } from '@prisma/client';
import { tenantExtension } from './prisma-tenant.extension';

/**
 * QS-016: Tenant Isolation Integration Tests
 *
 * Verifies that Tenant A cannot see Tenant B's data across 5 key entities:
 *   1. Loads
 *   2. Carriers
 *   3. Invoices
 *   4. Orders
 *   5. Customers (Company)
 *
 * Uses real Prisma client + the tenant extension (QS-014).
 * Requires a running PostgreSQL database via DATABASE_URL.
 */

const prisma = new PrismaClient();

/** Scoped client that auto-injects tenantId + deletedAt filters */
function forTenant(tenantId: string) {
  return prisma.$extends(tenantExtension(tenantId));
}

// ── Test data identifiers ──────────────────────────────────────────────
const TENANT_A_ID = 'ti-test-tenant-a-' + Date.now();
const TENANT_B_ID = 'ti-test-tenant-b-' + Date.now();

const SLUG_A = 'ti-test-a-' + Date.now();
const SLUG_B = 'ti-test-b-' + Date.now();

// Track created IDs for cleanup
const createdIds: {
  tenants: string[];
  companies: string[];
  carriers: string[];
  orders: string[];
  loads: string[];
  invoices: string[];
} = {
  tenants: [],
  companies: [],
  carriers: [],
  orders: [],
  loads: [],
  invoices: [],
};

// ── Setup & Teardown ───────────────────────────────────────────────────

beforeAll(async () => {
  // Create two test tenants
  await prisma.tenant.createMany({
    data: [
      { id: TENANT_A_ID, name: 'Tenant A (test)', slug: SLUG_A },
      { id: TENANT_B_ID, name: 'Tenant B (test)', slug: SLUG_B },
    ],
  });
  createdIds.tenants.push(TENANT_A_ID, TENANT_B_ID);
});

afterAll(async () => {
  // Cleanup in reverse-dependency order
  if (createdIds.invoices.length) {
    await prisma.invoice.deleteMany({ where: { id: { in: createdIds.invoices } } });
  }
  if (createdIds.loads.length) {
    await prisma.load.deleteMany({ where: { id: { in: createdIds.loads } } });
  }
  if (createdIds.orders.length) {
    await prisma.order.deleteMany({ where: { id: { in: createdIds.orders } } });
  }
  if (createdIds.carriers.length) {
    await prisma.carrier.deleteMany({ where: { id: { in: createdIds.carriers } } });
  }
  if (createdIds.companies.length) {
    await prisma.company.deleteMany({ where: { id: { in: createdIds.companies } } });
  }
  if (createdIds.tenants.length) {
    await prisma.tenant.deleteMany({ where: { id: { in: createdIds.tenants } } });
  }
  await prisma.$disconnect();
});

// ── 1. Loads ───────────────────────────────────────────────────────────

describe('Tenant Isolation: Loads', () => {
  let loadA: string;
  let loadB: string;

  beforeAll(async () => {
    const a = await prisma.load.create({
      data: {
        tenantId: TENANT_A_ID,
        loadNumber: `TI-LOAD-A-${Date.now()}`,
        status: 'PENDING',
      },
    });
    const b = await prisma.load.create({
      data: {
        tenantId: TENANT_B_ID,
        loadNumber: `TI-LOAD-B-${Date.now()}`,
        status: 'PENDING',
      },
    });
    loadA = a.id;
    loadB = b.id;
    createdIds.loads.push(loadA, loadB);
  });

  it('findMany: Tenant A sees only its own loads', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const loads = await dbA.load.findMany({
      where: { id: { in: [loadA, loadB] } },
    });

    expect(loads).toHaveLength(1);
    expect(loads[0].id).toBe(loadA);
    expect(loads[0].tenantId).toBe(TENANT_A_ID);
  });

  it('findFirst: Tenant A cannot access Tenant B load by ID', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const result = await dbA.load.findFirst({
      where: { id: loadB },
    });

    expect(result).toBeNull();
  });

  it('create: extension auto-injects tenantId', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const load = await dbA.load.create({
      data: {
        loadNumber: `TI-LOAD-AUTO-${Date.now()}`,
        status: 'PENDING',
      },
    });
    createdIds.loads.push(load.id);

    expect(load.tenantId).toBe(TENANT_A_ID);
  });
});

// ── 2. Carriers ────────────────────────────────────────────────────────

describe('Tenant Isolation: Carriers', () => {
  let carrierA: string;
  let carrierB: string;

  beforeAll(async () => {
    const a = await prisma.carrier.create({
      data: {
        tenantId: TENANT_A_ID,
        legalName: 'Carrier A (test)',
        status: 'ACTIVE',
      },
    });
    const b = await prisma.carrier.create({
      data: {
        tenantId: TENANT_B_ID,
        legalName: 'Carrier B (test)',
        status: 'ACTIVE',
      },
    });
    carrierA = a.id;
    carrierB = b.id;
    createdIds.carriers.push(carrierA, carrierB);
  });

  it('findMany: Tenant A sees only its own carriers', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const carriers = await dbA.carrier.findMany({
      where: { id: { in: [carrierA, carrierB] } },
    });

    expect(carriers).toHaveLength(1);
    expect(carriers[0].id).toBe(carrierA);
    expect(carriers[0].tenantId).toBe(TENANT_A_ID);
  });

  it('findFirst: Tenant A cannot access Tenant B carrier by ID', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const result = await dbA.carrier.findFirst({
      where: { id: carrierB },
    });

    expect(result).toBeNull();
  });

  it('create: extension auto-injects tenantId', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const carrier = await dbA.carrier.create({
      data: {
        legalName: 'Carrier Auto (test)',
        status: 'ACTIVE',
      },
    });
    createdIds.carriers.push(carrier.id);

    expect(carrier.tenantId).toBe(TENANT_A_ID);
  });
});

// ── 3. Invoices ────────────────────────────────────────────────────────

describe('Tenant Isolation: Invoices', () => {
  let invoiceA: string;
  let invoiceB: string;
  let companyA: string;
  let companyB: string;

  beforeAll(async () => {
    // Invoices require a Company (companyId is required)
    const cA = await prisma.company.create({
      data: {
        tenantId: TENANT_A_ID,
        name: 'Invoice Customer A (test)',
        companyType: 'SHIPPER',
      },
    });
    const cB = await prisma.company.create({
      data: {
        tenantId: TENANT_B_ID,
        name: 'Invoice Customer B (test)',
        companyType: 'SHIPPER',
      },
    });
    companyA = cA.id;
    companyB = cB.id;
    createdIds.companies.push(companyA, companyB);

    const now = new Date();
    const due = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const a = await prisma.invoice.create({
      data: {
        tenantId: TENANT_A_ID,
        invoiceNumber: `TI-INV-A-${Date.now()}`,
        companyId: companyA,
        invoiceDate: now,
        dueDate: due,
        subtotal: 1000,
        totalAmount: 1000,
        balanceDue: 1000,
      },
    });
    const b = await prisma.invoice.create({
      data: {
        tenantId: TENANT_B_ID,
        invoiceNumber: `TI-INV-B-${Date.now()}`,
        companyId: companyB,
        invoiceDate: now,
        dueDate: due,
        subtotal: 2000,
        totalAmount: 2000,
        balanceDue: 2000,
      },
    });
    invoiceA = a.id;
    invoiceB = b.id;
    createdIds.invoices.push(invoiceA, invoiceB);
  });

  it('findMany: Tenant A sees only its own invoices', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const invoices = await dbA.invoice.findMany({
      where: { id: { in: [invoiceA, invoiceB] } },
    });

    expect(invoices).toHaveLength(1);
    expect(invoices[0].id).toBe(invoiceA);
    expect(invoices[0].tenantId).toBe(TENANT_A_ID);
  });

  it('findFirst: Tenant A cannot access Tenant B invoice by ID', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const result = await dbA.invoice.findFirst({
      where: { id: invoiceB },
    });

    expect(result).toBeNull();
  });

  it('create: extension auto-injects tenantId', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const now = new Date();
    const due = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const invoice = await dbA.invoice.create({
      data: {
        invoiceNumber: `TI-INV-AUTO-${Date.now()}`,
        companyId: companyA,
        invoiceDate: now,
        dueDate: due,
        subtotal: 500,
        totalAmount: 500,
        balanceDue: 500,
      },
    });
    createdIds.invoices.push(invoice.id);

    expect(invoice.tenantId).toBe(TENANT_A_ID);
  });
});

// ── 4. Orders ──────────────────────────────────────────────────────────

describe('Tenant Isolation: Orders', () => {
  let orderA: string;
  let orderB: string;
  let companyA: string;
  let companyB: string;

  beforeAll(async () => {
    // Orders require a Company (customerId is required)
    const cA = await prisma.company.create({
      data: {
        tenantId: TENANT_A_ID,
        name: 'Order Customer A (test)',
        companyType: 'SHIPPER',
      },
    });
    const cB = await prisma.company.create({
      data: {
        tenantId: TENANT_B_ID,
        name: 'Order Customer B (test)',
        companyType: 'SHIPPER',
      },
    });
    companyA = cA.id;
    companyB = cB.id;
    createdIds.companies.push(companyA, companyB);

    const a = await prisma.order.create({
      data: {
        tenantId: TENANT_A_ID,
        orderNumber: `TI-ORD-A-${Date.now()}`,
        customerId: companyA,
        status: 'PENDING',
      },
    });
    const b = await prisma.order.create({
      data: {
        tenantId: TENANT_B_ID,
        orderNumber: `TI-ORD-B-${Date.now()}`,
        customerId: companyB,
        status: 'PENDING',
      },
    });
    orderA = a.id;
    orderB = b.id;
    createdIds.orders.push(orderA, orderB);
  });

  it('findMany: Tenant A sees only its own orders', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const orders = await dbA.order.findMany({
      where: { id: { in: [orderA, orderB] } },
    });

    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe(orderA);
    expect(orders[0].tenantId).toBe(TENANT_A_ID);
  });

  it('findFirst: Tenant A cannot access Tenant B order by ID', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const result = await dbA.order.findFirst({
      where: { id: orderB },
    });

    expect(result).toBeNull();
  });

  it('create: extension auto-injects tenantId', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const order = await dbA.order.create({
      data: {
        orderNumber: `TI-ORD-AUTO-${Date.now()}`,
        customerId: companyA,
        status: 'PENDING',
      },
    });
    createdIds.orders.push(order.id);

    expect(order.tenantId).toBe(TENANT_A_ID);
  });
});

// ── 5. Customers (Company) ─────────────────────────────────────────────

describe('Tenant Isolation: Customers (Company)', () => {
  let customerA: string;
  let customerB: string;

  beforeAll(async () => {
    const a = await prisma.company.create({
      data: {
        tenantId: TENANT_A_ID,
        name: 'Customer A (test)',
        companyType: 'SHIPPER',
      },
    });
    const b = await prisma.company.create({
      data: {
        tenantId: TENANT_B_ID,
        name: 'Customer B (test)',
        companyType: 'SHIPPER',
      },
    });
    customerA = a.id;
    customerB = b.id;
    createdIds.companies.push(customerA, customerB);
  });

  it('findMany: Tenant A sees only its own customers', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const companies = await dbA.company.findMany({
      where: { id: { in: [customerA, customerB] } },
    });

    expect(companies).toHaveLength(1);
    expect(companies[0].id).toBe(customerA);
    expect(companies[0].tenantId).toBe(TENANT_A_ID);
  });

  it('findFirst: Tenant A cannot access Tenant B customer by ID', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const result = await dbA.company.findFirst({
      where: { id: customerB },
    });

    expect(result).toBeNull();
  });

  it('create: extension auto-injects tenantId', async () => {
    const dbA = forTenant(TENANT_A_ID);
    const company = await dbA.company.create({
      data: {
        name: 'Customer Auto (test)',
        companyType: 'SHIPPER',
      },
    });
    createdIds.companies.push(company.id);

    expect(company.tenantId).toBe(TENANT_A_ID);
  });
});
