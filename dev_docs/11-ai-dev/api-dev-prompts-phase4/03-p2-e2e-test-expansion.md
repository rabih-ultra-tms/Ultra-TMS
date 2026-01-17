# P2: E2E Test Expansion

## Priority: P2 - MEDIUM (Parallel with frontend)
## Estimated Time: 3-4 days
## Dependencies: P1 complete

---

## Overview

8 core services have minimal or no E2E test coverage. This prompt provides templates and guidance for expanding test coverage to ensure API reliability during frontend development.

---

## Current State

| Service | Current Tests | Target | Status |
|---------|---------------|--------|--------|
| Auth | 0 | 15+ | 🔴 Critical |
| CRM | 1 (list) | 10+ | 🔴 Low |
| Sales | 1 (list) | 12+ | 🔴 Low |
| Accounting | 1 (list) | 15+ | 🔴 Low |
| Load Board | ~3 | 10+ | 🟡 Partial |
| Commission | ~3 | 8+ | 🟡 Partial |
| Documents | ~3 | 10+ | 🟡 Partial |
| Integration Hub | ~2 | 8+ | 🟡 Partial |

---

## Test Structure Template

All E2E tests should follow this structure:

```typescript
// apps/api/test/e2e/[module-name].e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('[ModuleName] (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let createdId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth tokens for different roles
    adminToken = await getAuthToken(app, 'admin@test.com', 'password');
    userToken = await getAuthToken(app, 'user@test.com', 'password');
  });

  afterAll(async () => {
    await app.close();
  });

  // Test suites...
});
```

---

## Task 1: CRM E2E Tests

**File:** `apps/api/test/e2e/crm.e2e-spec.ts`

### Required Test Cases

```typescript
describe('CRM (e2e)', () => {
  describe('Companies', () => {
    describe('GET /companies', () => {
      it('should return list for ADMIN', async () => {
        return request(app.getHttpServer())
          .get('/api/companies')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect(res => {
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.meta).toBeDefined();
          });
      });

      it('should return 403 for unauthorized role', async () => {
        return request(app.getHttpServer())
          .get('/api/companies')
          .set('Authorization', `Bearer ${dispatcherToken}`)
          .expect(403);
      });

      it('should filter by tenantId (multi-tenant isolation)', async () => {
        return request(app.getHttpServer())
          .get('/api/companies')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect(res => {
            res.body.data.forEach(company => {
              expect(company.tenantId).toBe(testTenantId);
            });
          });
      });
    });

    describe('POST /companies', () => {
      it('should create company for SALES_MANAGER', async () => {
        const createDto = {
          name: 'Test Company',
          type: 'SHIPPER',
          email: 'test@company.com',
        };

        return request(app.getHttpServer())
          .post('/api/companies')
          .set('Authorization', `Bearer ${salesManagerToken}`)
          .send(createDto)
          .expect(201)
          .expect(res => {
            expect(res.body.id).toBeDefined();
            createdId = res.body.id;
          });
      });

      it('should return 403 for SALES_REP (read-only)', async () => {
        return request(app.getHttpServer())
          .post('/api/companies')
          .send({ name: 'Test' })
          .set('Authorization', `Bearer ${salesRepToken}`)
          .expect(403);
      });
    });

    describe('GET /companies/:id', () => {
      it('should return company details', async () => {
        return request(app.getHttpServer())
          .get(`/api/companies/${createdId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect(res => {
            expect(res.body.id).toBe(createdId);
          });
      });

      it('should return 404 for non-existent ID', async () => {
        return request(app.getHttpServer())
          .get('/api/companies/non-existent-uuid')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });
    });

    describe('PATCH /companies/:id', () => {
      it('should update company', async () => {
        return request(app.getHttpServer())
          .patch(`/api/companies/${createdId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Updated Company' })
          .expect(200)
          .expect(res => {
            expect(res.body.name).toBe('Updated Company');
          });
      });
    });

    describe('DELETE /companies/:id', () => {
      it('should soft delete company (ADMIN only)', async () => {
        return request(app.getHttpServer())
          .delete(`/api/companies/${createdId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });

      it('should return 403 for non-ADMIN', async () => {
        return request(app.getHttpServer())
          .delete(`/api/companies/${createdId}`)
          .set('Authorization', `Bearer ${salesManagerToken}`)
          .expect(403);
      });
    });
  });

  describe('Contacts', () => {
    // Similar test structure for contacts...
  });

  describe('Locations', () => {
    // Similar test structure for locations...
  });
});
```

### Test Coverage Targets

| Endpoint | Tests Required |
|----------|----------------|
| GET /companies | 3 (success, unauthorized, tenant isolation) |
| POST /companies | 2 (success, unauthorized) |
| GET /companies/:id | 2 (success, not found) |
| PATCH /companies/:id | 2 (success, unauthorized) |
| DELETE /companies/:id | 2 (success, unauthorized) |
| GET /contacts | 2 |
| POST /contacts | 2 |
| GET /locations | 2 |

---

## Task 2: Sales E2E Tests

**File:** `apps/api/test/e2e/sales.e2e-spec.ts`

### Required Test Cases

```typescript
describe('Sales (e2e)', () => {
  describe('Quotes', () => {
    describe('POST /quotes', () => {
      it('should create quote with pricing calculation', async () => {
        const quoteDto = {
          customerId: testCustomerId,
          origin: { city: 'Chicago', state: 'IL', zip: '60601' },
          destination: { city: 'New York', state: 'NY', zip: '10001' },
          equipmentType: 'DRY_VAN',
          weight: 40000,
        };

        return request(app.getHttpServer())
          .post('/api/quotes')
          .set('Authorization', `Bearer ${salesRepToken}`)
          .send(quoteDto)
          .expect(201)
          .expect(res => {
            expect(res.body.amount).toBeGreaterThan(0);
            expect(res.body.status).toBe('DRAFT');
          });
      });
    });

    describe('PATCH /quotes/:id/status', () => {
      it('should require SALES_MANAGER for approval', async () => {
        return request(app.getHttpServer())
          .patch(`/api/quotes/${quoteId}/status`)
          .set('Authorization', `Bearer ${salesRepToken}`)
          .send({ status: 'APPROVED' })
          .expect(403);
      });

      it('should allow SALES_MANAGER to approve', async () => {
        return request(app.getHttpServer())
          .patch(`/api/quotes/${quoteId}/status`)
          .set('Authorization', `Bearer ${salesManagerToken}`)
          .send({ status: 'APPROVED' })
          .expect(200);
      });
    });
  });

  describe('Rate Contracts', () => {
    // After P1 complete - test RBAC
    it('should require PRICING_ANALYST or higher for create', async () => {
      // Test after 01-p1-final-rbac-gaps.md is applied
    });
  });
});
```

---

## Task 3: Accounting E2E Tests

**File:** `apps/api/test/e2e/accounting.e2e-spec.ts`

### Required Test Cases

```typescript
describe('Accounting (e2e)', () => {
  describe('Invoices', () => {
    describe('GET /invoices', () => {
      it('should return invoices for ACCOUNTING role', async () => {
        return request(app.getHttpServer())
          .get('/api/invoices')
          .set('Authorization', `Bearer ${accountingToken}`)
          .expect(200);
      });

      it('should return 403 for DISPATCHER', async () => {
        return request(app.getHttpServer())
          .get('/api/invoices')
          .set('Authorization', `Bearer ${dispatcherToken}`)
          .expect(403);
      });
    });

    describe('POST /invoices', () => {
      it('should create invoice from load', async () => {
        return request(app.getHttpServer())
          .post('/api/invoices')
          .set('Authorization', `Bearer ${accountingToken}`)
          .send({ loadId: testLoadId })
          .expect(201)
          .expect(res => {
            expect(res.body.invoiceNumber).toBeDefined();
            expect(res.body.status).toBe('DRAFT');
          });
      });
    });

    describe('POST /invoices/:id/send', () => {
      it('should send invoice and update status', async () => {
        return request(app.getHttpServer())
          .post(`/api/invoices/${invoiceId}/send`)
          .set('Authorization', `Bearer ${accountingToken}`)
          .expect(200)
          .expect(res => {
            expect(res.body.status).toBe('SENT');
            expect(res.body.sentAt).toBeDefined();
          });
      });
    });
  });

  describe('Payments', () => {
    describe('POST /payments', () => {
      it('should record payment and update invoice', async () => {
        return request(app.getHttpServer())
          .post('/api/payments')
          .set('Authorization', `Bearer ${accountingToken}`)
          .send({
            invoiceId,
            amount: 1500.00,
            method: 'CHECK',
            reference: 'CHK-12345',
          })
          .expect(201);
      });
    });
  });

  describe('Carrier Payables', () => {
    // Test carrier payment workflows...
  });
});
```

---

## Task 4: Load Board E2E Tests

**File:** `apps/api/test/e2e/load-board.e2e-spec.ts`

### Required Test Cases

```typescript
describe('Load Board (e2e)', () => {
  describe('Postings', () => {
    describe('POST /postings', () => {
      it('should create posting from load', async () => {
        return request(app.getHttpServer())
          .post('/api/postings')
          .set('Authorization', `Bearer ${dispatcherToken}`)
          .send({ loadId: testLoadId, targetRate: 2500.00 })
          .expect(201);
      });
    });

    describe('GET /postings/available', () => {
      it('should return available postings for carriers', async () => {
        return request(app.getHttpServer())
          .get('/api/postings/available')
          .set('Authorization', `Bearer ${carrierManagerToken}`)
          .expect(200)
          .expect(res => {
            expect(res.body.data).toBeInstanceOf(Array);
          });
      });
    });
  });

  describe('Bids', () => {
    describe('POST /postings/:id/bids', () => {
      it('should create bid on posting', async () => {
        return request(app.getHttpServer())
          .post(`/api/postings/${postingId}/bids`)
          .set('Authorization', `Bearer ${carrierManagerToken}`)
          .send({ amount: 2400.00, notes: 'Available immediately' })
          .expect(201);
      });
    });

    describe('POST /bids/:id/accept', () => {
      it('should accept bid and assign carrier', async () => {
        return request(app.getHttpServer())
          .post(`/api/bids/${bidId}/accept`)
          .set('Authorization', `Bearer ${dispatcherToken}`)
          .expect(200)
          .expect(res => {
            expect(res.body.status).toBe('ACCEPTED');
          });
      });
    });
  });

  describe('Load Tenders', () => {
    // Test after P1 RBAC is applied
    describe('POST /load-tenders', () => {
      it('should require DISPATCHER role', async () => {
        // Test RBAC
      });
    });
  });
});
```

---

## Task 5: Integration Hub E2E Tests

**File:** `apps/api/test/e2e/integration-hub.e2e-spec.ts`

### Required Test Cases

```typescript
describe('Integration Hub (e2e)', () => {
  describe('Integrations', () => {
    describe('GET /integrations', () => {
      it('should require ADMIN or SYSTEM_INTEGRATOR', async () => {
        return request(app.getHttpServer())
          .get('/api/integrations')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });

      it('should mask credentials in response', async () => {
        return request(app.getHttpServer())
          .get('/api/integrations')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect(res => {
            res.body.data.forEach(integration => {
              if (integration.credentials) {
                expect(integration.credentials.apiKey).toMatch(/^\*+$/);
              }
            });
          });
      });
    });

    describe('POST /integrations/:id/test', () => {
      it('should test connection and return status', async () => {
        return request(app.getHttpServer())
          .post(`/api/integrations/${integrationId}/test`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect(res => {
            expect(res.body.success).toBeDefined();
          });
      });
    });
  });

  describe('Webhooks', () => {
    describe('POST /webhooks', () => {
      it('should create webhook with secret masking', async () => {
        return request(app.getHttpServer())
          .post('/api/webhooks')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            url: 'https://example.com/webhook',
            events: ['load.created', 'load.delivered'],
          })
          .expect(201)
          .expect(res => {
            expect(res.body.secret).toMatch(/^\*+$/);
          });
      });
    });
  });
});
```

---

## Shared Test Utilities

**File:** `apps/api/test/utils/test-helpers.ts`

```typescript
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

export async function getAuthToken(
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password });
  
  return response.body.accessToken;
}

export async function createTestTenant(app: INestApplication): Promise<string> {
  // Create test tenant for isolation testing
}

export async function cleanupTestData(app: INestApplication): Promise<void> {
  // Clean up test data after tests
}

export const testUsers = {
  admin: { email: 'admin@test.com', password: 'TestPass123!' },
  salesManager: { email: 'sales.manager@test.com', password: 'TestPass123!' },
  salesRep: { email: 'sales.rep@test.com', password: 'TestPass123!' },
  dispatcher: { email: 'dispatcher@test.com', password: 'TestPass123!' },
  accounting: { email: 'accounting@test.com', password: 'TestPass123!' },
  carrierManager: { email: 'carrier.manager@test.com', password: 'TestPass123!' },
};
```

---

## Completion Checklist

- [ ] CRM E2E tests - 10+ test cases
- [ ] Sales E2E tests - 12+ test cases
- [ ] Accounting E2E tests - 15+ test cases
- [ ] Load Board E2E tests - 10+ test cases
- [ ] Commission E2E tests - 8+ test cases
- [ ] Documents E2E tests - 10+ test cases
- [ ] Integration Hub E2E tests - 8+ test cases
- [ ] Shared test utilities created
- [ ] All tests pass in CI pipeline
- [ ] Coverage report shows >80% on core endpoints

---

## Running Tests

```bash
# Run all E2E tests
pnpm run test:e2e

# Run specific module tests
pnpm run test:e2e -- --grep "CRM"

# Run with coverage
pnpm run test:e2e:cov

# Run in watch mode (development)
pnpm run test:e2e -- --watch
```
