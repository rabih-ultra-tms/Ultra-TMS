# Prompt 09: E2E Test Expansion

**Priority:** P2 (Medium)  
**Estimated Time:** 6-8 hours  
**Dependencies:** P0 and P1 prompts completed  
**Current Coverage:** 12/31 test suites → Target: 31/31

---

## Objective

Expand the E2E test suite to cover all Phase A services with comprehensive integration tests, achieving 100% E2E coverage for critical user workflows and API contracts.

---

## Missing Test Suites

| Test Suite | Service | Priority | Description |
|------------|---------|----------|-------------|
| `accounting.e2e-spec.ts` | Accounting | High | Invoice, payments, reports |
| `carrier.e2e-spec.ts` | Carrier | High | Carrier CRUD, documents |
| `audit.e2e-spec.ts` | Audit | Medium | Audit logs, compliance |
| `config.e2e-spec.ts` | Config | Medium | Settings, sequences |
| `scheduler.e2e-spec.ts` | Scheduler | Medium | Job scheduling |
| `cache.e2e-spec.ts` | Cache | Low | Cache operations |
| `tracking.e2e-spec.ts` | TMS | High | Live tracking |
| `documents.e2e-spec.ts` | Documents | Medium | File upload/download |
| `search.e2e-spec.ts` | Search | Medium | Full-text search |
| + 10 more | Various | Various | Additional coverage |

---

## Test Directory Structure

```
apps/api/test/
├── jest-e2e.json
├── setup.ts
├── helpers/
│   ├── auth.helper.ts
│   ├── data.helper.ts
│   └── cleanup.helper.ts
├── auth.e2e-spec.ts          ✅ Exists
├── users.e2e-spec.ts         ✅ Exists
├── customers.e2e-spec.ts     ✅ Exists
├── orders.e2e-spec.ts        ✅ Exists
├── loads.e2e-spec.ts         ✅ Exists
├── accounting.e2e-spec.ts    📝 Create
├── carrier.e2e-spec.ts       📝 Create
├── audit.e2e-spec.ts         📝 Create
├── config.e2e-spec.ts        📝 Create
├── tracking.e2e-spec.ts      📝 Create
├── documents.e2e-spec.ts     📝 Create
├── search.e2e-spec.ts        📝 Create
└── ...
```

---

## Implementation Steps

### Step 1: Create Test Helpers

**File: `apps/api/test/helpers/auth.helper.ts`**

```typescript
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface TestUser {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

export class AuthHelper {
  constructor(private app: INestApplication) {}

  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await request(this.app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    return {
      accessToken: response.body.data.accessToken,
      refreshToken: response.body.data.refreshToken,
    };
  }

  async createTestUser(role: string = 'ADMIN'): Promise<{ user: TestUser; tokens: AuthTokens }> {
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    // Create user via API or direct DB insert
    const createResponse = await request(this.app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
        role,
      })
      .expect(201);

    const tokens = await this.login(email, password);

    return {
      user: createResponse.body.data,
      tokens,
    };
  }

  getAuthHeader(token: string): { Authorization: string } {
    return { Authorization: `Bearer ${token}` };
  }
}
```

**File: `apps/api/test/helpers/data.helper.ts`**

```typescript
import { PrismaService } from '../../src/prisma.service';

export class DataHelper {
  constructor(private prisma: PrismaService) {}

  async createCustomer(tenantId: string, overrides: Partial<any> = {}) {
    return this.prisma.customer.create({
      data: {
        tenantId,
        name: `Test Customer ${Date.now()}`,
        email: `customer-${Date.now()}@test.com`,
        status: 'ACTIVE',
        ...overrides,
      },
    });
  }

  async createCarrier(tenantId: string, overrides: Partial<any> = {}) {
    return this.prisma.carrier.create({
      data: {
        tenantId,
        name: `Test Carrier ${Date.now()}`,
        mcNumber: `MC${Date.now()}`,
        dotNumber: `DOT${Date.now()}`,
        status: 'ACTIVE',
        ...overrides,
      },
    });
  }

  async createOrder(tenantId: string, customerId: string, overrides: Partial<any> = {}) {
    return this.prisma.order.create({
      data: {
        tenantId,
        customerId,
        orderNumber: `ORD-${Date.now()}`,
        status: 'DRAFT',
        ...overrides,
      },
    });
  }

  async createLoad(tenantId: string, orderId: string, overrides: Partial<any> = {}) {
    return this.prisma.load.create({
      data: {
        tenantId,
        orderId,
        loadNumber: `LD-${Date.now()}`,
        status: 'DRAFT',
        ...overrides,
      },
    });
  }

  async createInvoice(tenantId: string, customerId: string, overrides: Partial<any> = {}) {
    return this.prisma.invoice.create({
      data: {
        tenantId,
        customerId,
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalAmount: 1000,
        status: 'DRAFT',
        ...overrides,
      },
    });
  }
}
```

**File: `apps/api/test/helpers/cleanup.helper.ts`**

```typescript
import { PrismaService } from '../../src/prisma.service';

export class CleanupHelper {
  constructor(private prisma: PrismaService) {}

  async cleanupTestData(tenantId: string) {
    // Delete in order respecting foreign keys
    await this.prisma.payment.deleteMany({ where: { tenantId } });
    await this.prisma.invoiceLineItem.deleteMany({ where: { invoice: { tenantId } } });
    await this.prisma.invoice.deleteMany({ where: { tenantId } });
    await this.prisma.checkCall.deleteMany({ where: { load: { tenantId } } });
    await this.prisma.stop.deleteMany({ where: { load: { tenantId } } });
    await this.prisma.load.deleteMany({ where: { tenantId } });
    await this.prisma.order.deleteMany({ where: { tenantId } });
    await this.prisma.carrier.deleteMany({ where: { tenantId } });
    await this.prisma.customer.deleteMany({ where: { tenantId } });
    await this.prisma.auditLog.deleteMany({ where: { tenantId } });
  }

  async cleanupUser(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
```

### Step 2: Create Accounting E2E Tests

**File: `apps/api/test/accounting.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { AuthHelper, DataHelper, CleanupHelper } from './helpers';

describe('Accounting (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authHelper: AuthHelper;
  let dataHelper: DataHelper;
  let cleanupHelper: CleanupHelper;
  let authToken: string;
  let tenantId: string;
  let customerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    authHelper = new AuthHelper(app);
    dataHelper = new DataHelper(prisma);
    cleanupHelper = new CleanupHelper(prisma);

    // Setup test user and customer
    const { user, tokens } = await authHelper.createTestUser('ADMIN');
    authToken = tokens.accessToken;
    tenantId = user.tenantId;

    const customer = await dataHelper.createCustomer(tenantId);
    customerId = customer.id;
  });

  afterAll(async () => {
    await cleanupHelper.cleanupTestData(tenantId);
    await app.close();
  });

  describe('/invoices', () => {
    let invoiceId: string;

    it('POST /invoices - should create invoice', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/invoices')
        .set(authHelper.getAuthHeader(authToken))
        .send({
          customerId,
          invoiceDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          lineItems: [
            { description: 'Freight charges', quantity: 1, rate: 1500 },
          ],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invoiceNumber).toBeDefined();
      invoiceId = response.body.data.id;
    });

    it('GET /invoices - should list invoices', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/invoices')
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('GET /invoices/:id - should get invoice details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/invoices/${invoiceId}`)
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(response.body.data.id).toBe(invoiceId);
      expect(response.body.data.customerId).toBe(customerId);
    });

    it('GET /invoices/:id/pdf - should generate PDF', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/invoices/${invoiceId}/pdf`)
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('POST /invoices/:id/send - should queue invoice email', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/invoices/${invoiceId}/send`)
        .set(authHelper.getAuthHeader(authToken))
        .send({
          to: ['customer@test.com'],
          subject: 'Your Invoice',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('/payments', () => {
    let paymentId: string;
    let invoiceId: string;

    beforeAll(async () => {
      const invoice = await dataHelper.createInvoice(tenantId, customerId);
      invoiceId = invoice.id;
    });

    it('POST /payments - should create payment', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set(authHelper.getAuthHeader(authToken))
        .send({
          customerId,
          amount: 500,
          paymentMethod: 'CHECK',
          checkNumber: '12345',
          allocations: [{ invoiceId, amount: 500 }],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      paymentId = response.body.data.id;
    });

    it('POST /payments/batch - should process batch payments', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/batch')
        .set(authHelper.getAuthHeader(authToken))
        .send({
          payments: [
            { customerId, amount: 100, checkNumber: '12346' },
            { customerId, amount: 200, checkNumber: '12347' },
          ],
        })
        .expect(200);

      expect(response.body.data.processed).toBe(2);
    });
  });

  describe('/reports', () => {
    it('GET /reports/revenue - should return revenue report', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/revenue')
        .set(authHelper.getAuthHeader(authToken))
        .query({ fromDate: '2024-01-01', toDate: '2024-12-31' })
        .expect(200);

      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.periods).toBeDefined();
    });

    it('GET /reports/aging - should return aging report', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/aging')
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(response.body.data.buckets).toBeDefined();
      expect(response.body.data.totalOutstanding).toBeDefined();
    });
  });
});
```

### Step 3: Create Carrier E2E Tests

**File: `apps/api/test/carrier.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { AuthHelper, CleanupHelper } from './helpers';

describe('Carrier (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authHelper: AuthHelper;
  let authToken: string;
  let tenantId: string;
  let carrierId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    authHelper = new AuthHelper(app);

    const { user, tokens } = await authHelper.createTestUser('ADMIN');
    authToken = tokens.accessToken;
    tenantId = user.tenantId;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/carriers', () => {
    it('POST /carriers - should create carrier', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/carriers')
        .set(authHelper.getAuthHeader(authToken))
        .send({
          name: 'Test Carrier LLC',
          mcNumber: 'MC123456',
          dotNumber: 'DOT789012',
          email: 'dispatch@testcarrier.com',
          phone: '555-123-4567',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mcNumber).toBe('MC123456');
      carrierId = response.body.data.id;
    });

    it('GET /carriers - should list carriers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/carriers')
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /carriers/:id - should get carrier details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/carriers/${carrierId}`)
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(response.body.data.id).toBe(carrierId);
    });

    it('PUT /carriers/:id - should update carrier', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/carriers/${carrierId}`)
        .set(authHelper.getAuthHeader(authToken))
        .send({ name: 'Updated Carrier Name' })
        .expect(200);

      expect(response.body.data.name).toBe('Updated Carrier Name');
    });

    it('GET /carriers/:id/safety - should get safety rating', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/carriers/${carrierId}/safety`)
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('GET /carriers/:id/documents - should list carrier documents', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/carriers/${carrierId}/documents`)
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
```

### Step 4: Create Audit E2E Tests

**File: `apps/api/test/audit.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthHelper } from './helpers';

describe('Audit (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    authHelper = new AuthHelper(app);
    const { tokens } = await authHelper.createTestUser('ADMIN');
    authToken = tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/audit', () => {
    it('GET /audit/entities/:entityType - should list entity changes', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit/entities/ORDER')
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /audit/logins - should list login history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit/logins')
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('GET /audit/api-calls - should list API calls', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit/api-calls')
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('POST /audit/search - should perform advanced search', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/audit/search')
        .set(authHelper.getAuthHeader(authToken))
        .send({
          entityTypes: ['ORDER', 'LOAD'],
          actions: ['CREATE', 'UPDATE'],
          fromDate: '2024-01-01',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('GET /audit/reports/compliance - should generate compliance report', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit/reports/compliance')
        .set(authHelper.getAuthHeader(authToken))
        .query({
          fromDate: '2024-01-01',
          toDate: '2024-12-31',
        })
        .expect(200);

      expect(response.body.data.summary).toBeDefined();
    });
  });
});
```

### Step 5: Create Config E2E Tests

**File: `apps/api/test/config.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthHelper } from './helpers';

describe('Config (e2e)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    authHelper = new AuthHelper(app);
    const { tokens } = await authHelper.createTestUser('ADMIN');
    authToken = tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/config/business-hours', () => {
    it('GET /config/business-hours - should get business hours', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/config/business-hours')
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(response.body.data.monday).toBeDefined();
      expect(response.body.data.timezone).toBeDefined();
    });

    it('PUT /config/business-hours - should update business hours', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/config/business-hours')
        .set(authHelper.getAuthHeader(authToken))
        .send({
          monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          saturday: { isOpen: false },
          sunday: { isOpen: false },
          timezone: 'America/Chicago',
        })
        .expect(200);

      expect(response.body.data.timezone).toBe('America/Chicago');
    });
  });

  describe('/config/holidays', () => {
    let holidayId: string;

    it('POST /config/holidays - should create holiday', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/config/holidays')
        .set(authHelper.getAuthHeader(authToken))
        .send({
          name: 'Test Holiday',
          date: '2025-07-04',
          recurring: true,
        })
        .expect(201);

      expect(response.body.data.name).toBe('Test Holiday');
      holidayId = response.body.data.id;
    });

    it('GET /config/holidays - should list holidays', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/config/holidays')
        .set(authHelper.getAuthHeader(authToken))
        .query({ year: 2025 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('DELETE /config/holidays/:id - should delete holiday', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/config/holidays/${holidayId}`)
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);
    });
  });

  describe('/config/sequences', () => {
    it('GET /config/sequences - should list sequences', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/config/sequences')
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.some(s => s.type === 'ORDER')).toBe(true);
    });

    it('PUT /config/sequences/:type - should update sequence', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/config/sequences/ORDER')
        .set(authHelper.getAuthHeader(authToken))
        .send({
          prefix: 'ORD-',
          paddingLength: 8,
          includeYear: true,
        })
        .expect(200);

      expect(response.body.data.prefix).toBe('ORD-');
    });
  });

  describe('/config/email-templates', () => {
    it('GET /config/email-templates - should list templates', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/config/email-templates')
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
```

### Step 6: Create Tracking E2E Tests

**File: `apps/api/test/tracking.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { AuthHelper, DataHelper } from './helpers';

describe('Tracking (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authHelper: AuthHelper;
  let dataHelper: DataHelper;
  let authToken: string;
  let tenantId: string;
  let loadId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    authHelper = new AuthHelper(app);
    dataHelper = new DataHelper(prisma);

    const { user, tokens } = await authHelper.createTestUser('ADMIN');
    authToken = tokens.accessToken;
    tenantId = user.tenantId;

    // Create test data
    const customer = await dataHelper.createCustomer(tenantId);
    const order = await dataHelper.createOrder(tenantId, customer.id);
    const load = await dataHelper.createLoad(tenantId, order.id, {
      status: 'IN_TRANSIT',
      currentLatitude: 40.7128,
      currentLongitude: -74.0060,
    });
    loadId = load.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/tracking', () => {
    it('GET /tracking/map - should return map data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tracking/map')
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /tracking/map - should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tracking/map')
        .set(authHelper.getAuthHeader(authToken))
        .query({ status: ['IN_TRANSIT'] })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('GET /tracking/loads/:id/history - should return location history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/tracking/loads/${loadId}/history`)
        .set(authHelper.getAuthHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
```

### Step 7: Update Test Configuration

**File: `apps/api/test/jest-e2e.json`**

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/../src/$1"
  },
  "setupFilesAfterEnv": ["<rootDir>/setup.ts"],
  "testTimeout": 30000,
  "maxWorkers": 1,
  "verbose": true,
  "collectCoverageFrom": [
    "../src/**/*.ts",
    "!../src/**/*.dto.ts",
    "!../src/**/*.module.ts"
  ]
}
```

---

## Running Tests

```bash
# Run all E2E tests
pnpm --filter api test:e2e

# Run specific test file
pnpm --filter api test:e2e -- accounting.e2e-spec.ts

# Run with coverage
pnpm --filter api test:e2e:cov

# Run in watch mode
pnpm --filter api test:e2e -- --watch
```

---

## Acceptance Criteria

- [ ] All 31 E2E test suites created and passing
- [ ] Test helpers properly manage auth and data
- [ ] Tests clean up after themselves
- [ ] Tests cover success and error scenarios
- [ ] Tests validate response format consistency
- [ ] Tests run successfully in CI environment
- [ ] 80%+ code coverage from E2E tests

---

## Test Suite Checklist

| Suite | Status | Tests |
|-------|--------|-------|
| auth.e2e-spec.ts | ✅ | 8 |
| users.e2e-spec.ts | ✅ | 6 |
| customers.e2e-spec.ts | ✅ | 10 |
| orders.e2e-spec.ts | ✅ | 12 |
| loads.e2e-spec.ts | ✅ | 14 |
| accounting.e2e-spec.ts | 📝 | 15 |
| carrier.e2e-spec.ts | 📝 | 10 |
| audit.e2e-spec.ts | 📝 | 8 |
| config.e2e-spec.ts | 📝 | 12 |
| tracking.e2e-spec.ts | 📝 | 6 |
| documents.e2e-spec.ts | 📝 | 8 |
| search.e2e-spec.ts | 📝 | 5 |

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

Change prompt 09 row in the status table:
```markdown
| 09 | [E2E Test Expansion](...) | P2 | 6-8h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics

```markdown
| E2E Test Coverage | 38.7% | 100% | 100% |
```

### 3. Add Changelog Entry

```markdown
### [Date] - Prompt 09: E2E Test Expansion
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Created 19 new E2E test suites
- Added test helpers for auth, data, cleanup
- All Phase A services have E2E coverage
- Test suite now at 31/31 (100%)
- Ready for CI/CD integration

#### Metrics Updated
- E2E Test Coverage: 38.7% → 100%
```
