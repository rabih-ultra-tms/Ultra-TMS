import { createAllOperationsHandler } from './prisma-tenant.extension';

const TENANT_ID = 'tenant-test-abc';

// Model sets for testing
const tenantModels = new Set(['Order', 'Carrier', 'PaymentMade', 'Role']);
const softDeleteModels = new Set(['PaymentMade', 'Role', 'TruckType']);
// SystemConfig has neither tenantId nor deletedAt
// TruckType has deletedAt but NOT tenantId

let handler: ReturnType<typeof createAllOperationsHandler>;

beforeAll(() => {
  handler = createAllOperationsHandler(TENANT_ID, tenantModels, softDeleteModels);
});

/**
 * Helper: calls the handler and captures the args passed to query()
 */
async function callHandler(
  model: string | undefined,
  operation: string,
  args: any = {},
): Promise<any> {
  let capturedArgs: any = null;
  const mockQuery = (a: any) => {
    capturedArgs = JSON.parse(JSON.stringify(a));
    return Promise.resolve({ result: 'ok' });
  };

  await handler({ model, operation, args, query: mockQuery });
  return capturedArgs;
}

describe('createAllOperationsHandler', () => {
  // --- READ: tenantId injection ---

  it('should inject tenantId into findMany WHERE for tenant models', async () => {
    const result = await callHandler('Order', 'findMany', {});
    expect(result.where.tenantId).toBe(TENANT_ID);
  });

  it('should inject tenantId into findFirst WHERE', async () => {
    const result = await callHandler('Order', 'findFirst', {});
    expect(result.where.tenantId).toBe(TENANT_ID);
  });

  it('should inject tenantId into count WHERE', async () => {
    const result = await callHandler('Order', 'count', {});
    expect(result.where.tenantId).toBe(TENANT_ID);
  });

  it('should inject tenantId into aggregate WHERE', async () => {
    const result = await callHandler('Order', 'aggregate', {});
    expect(result.where.tenantId).toBe(TENANT_ID);
  });

  // --- READ: deletedAt injection ---

  it('should inject deletedAt: null for models with soft-delete', async () => {
    const result = await callHandler('PaymentMade', 'findMany', {});
    expect(result.where.tenantId).toBe(TENANT_ID);
    expect(result.where.deletedAt).toBeNull();
  });

  it('should inject deletedAt: null for soft-delete-only models (no tenantId)', async () => {
    const result = await callHandler('TruckType', 'findMany', {});
    expect(result.where.deletedAt).toBeNull();
    expect(result.where.tenantId).toBeUndefined();
  });

  // --- SKIP: no-tenant, no-softdelete models ---

  it('should NOT inject anything for models without tenantId or deletedAt', async () => {
    const result = await callHandler('SystemConfig', 'findMany', {});
    expect(result.where).toBeUndefined();
  });

  // --- No double-filter ---

  it('should NOT overwrite existing tenantId in WHERE', async () => {
    const existing = 'tenant-already-set';
    const result = await callHandler('Order', 'findMany', {
      where: { tenantId: existing },
    });
    expect(result.where.tenantId).toBe(existing);
  });

  it('should NOT overwrite existing deletedAt in WHERE', async () => {
    const result = await callHandler('PaymentMade', 'findMany', {
      where: { deletedAt: { not: null } },
    });
    expect(result.where.deletedAt).toEqual({ not: null });
  });

  // --- CREATE: tenantId injection ---

  it('should inject tenantId into create data', async () => {
    const result = await callHandler('Order', 'create', {
      data: { status: 'DRAFT' },
    });
    expect(result.data.tenantId).toBe(TENANT_ID);
    expect(result.data.status).toBe('DRAFT');
  });

  it('should NOT overwrite existing tenantId in create data', async () => {
    const result = await callHandler('Order', 'create', {
      data: { tenantId: 'tenant-explicit', status: 'DRAFT' },
    });
    expect(result.data.tenantId).toBe('tenant-explicit');
  });

  it('should inject tenantId into createMany data array', async () => {
    const result = await callHandler('Carrier', 'createMany', {
      data: [
        { name: 'A' },
        { name: 'B', tenantId: 'tenant-explicit' },
      ],
    });
    expect(result.data[0].tenantId).toBe(TENANT_ID);
    expect(result.data[1].tenantId).toBe('tenant-explicit');
  });

  it('should NOT inject tenantId into create for non-tenant models', async () => {
    const result = await callHandler('SystemConfig', 'create', {
      data: { key: 'test', value: '123' },
    });
    expect(result.data.tenantId).toBeUndefined();
  });

  // --- MUTATION: tenantId in WHERE ---

  it('should inject tenantId into update WHERE', async () => {
    const result = await callHandler('Order', 'update', {
      where: { id: 'order-1' },
      data: { status: 'COMPLETED' },
    });
    expect(result.where.tenantId).toBe(TENANT_ID);
    expect(result.where.id).toBe('order-1');
  });

  it('should inject tenantId into delete WHERE', async () => {
    const result = await callHandler('Order', 'delete', {
      where: { id: 'order-1' },
    });
    expect(result.where.tenantId).toBe(TENANT_ID);
  });

  it('should inject tenantId into upsert WHERE and create', async () => {
    const result = await callHandler('Order', 'upsert', {
      where: { id: 'order-1' },
      create: { status: 'DRAFT' },
      update: { status: 'UPDATED' },
    });
    expect(result.where.tenantId).toBe(TENANT_ID);
    expect(result.create.tenantId).toBe(TENANT_ID);
  });

  // --- Non-model operations ---

  it('should pass through operations without a model', async () => {
    const result = await callHandler(undefined, 'queryRaw', {
      sql: 'SELECT 1',
    });
    expect(result.sql).toBe('SELECT 1');
  });
});
