# P2-1: Expand E2E Test Coverage for RBAC

## Priority: P2 - MEDIUM
## Estimated Time: 16-24 hours
## Dependencies: All P0/P1 RBAC implementations complete

---

## Context

Current E2E test coverage focuses on happy-path scenarios. After implementing RBAC guards, we need comprehensive tests to verify:

1. **Role-based access** - Each endpoint denies unauthorized roles
2. **Permission escalation** - Users cannot access higher-privilege operations
3. **Portal isolation** - Customer/Carrier portal data isolation
4. **Self-service boundaries** - Users can only access their own data

---

## Test Infrastructure Setup

### 1. Test User Factory

```typescript
// apps/api/test/factories/test-users.factory.ts

import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

export interface TestUser {
  id: string;
  email: string;
  role: string;
  companyId?: string;
  carrierId?: string;
  token: string;
}

export class TestUsersFactory {
  private jwtService: JwtService;
  
  constructor(private prisma: PrismaClient) {
    this.jwtService = new JwtService({ secret: process.env.JWT_SECRET });
  }
  
  async createTestUsers(): Promise<Record<string, TestUser>> {
    const users: Record<string, TestUser> = {};
    
    // Super Admin - full access
    users.superAdmin = await this.createUser({
      email: 'super@test.com',
      role: 'SUPER_ADMIN',
    });
    
    // Admin - tenant admin
    users.admin = await this.createUser({
      email: 'admin@test.com',
      role: 'ADMIN',
    });
    
    // Operations Manager
    users.opsManager = await this.createUser({
      email: 'ops@test.com',
      role: 'OPERATIONS_MANAGER',
    });
    
    // Dispatcher
    users.dispatcher = await this.createUser({
      email: 'dispatch@test.com',
      role: 'DISPATCHER',
    });
    
    // Sales Manager
    users.salesManager = await this.createUser({
      email: 'sales-mgr@test.com',
      role: 'SALES_MANAGER',
    });
    
    // Sales Rep
    users.salesRep = await this.createUser({
      email: 'sales@test.com',
      role: 'SALES_REP',
    });
    
    // Accounting
    users.accounting = await this.createUser({
      email: 'accounting@test.com',
      role: 'ACCOUNTING',
    });
    
    // Claims Manager
    users.claimsManager = await this.createUser({
      email: 'claims-mgr@test.com',
      role: 'CLAIMS_MANAGER',
    });
    
    // Claims Adjuster
    users.claimsAdjuster = await this.createUser({
      email: 'claims@test.com',
      role: 'CLAIMS_ADJUSTER',
    });
    
    // Carrier Manager
    users.carrierManager = await this.createUser({
      email: 'carrier-mgr@test.com',
      role: 'CARRIER_MANAGER',
    });
    
    // Customer Portal User
    const company = await this.prisma.company.create({
      data: { name: 'Test Customer', status: 'ACTIVE' },
    });
    users.customerPortal = await this.createUser({
      email: 'customer@portal.com',
      role: 'CUSTOMER',
      companyId: company.id,
    });
    
    // Carrier Portal User
    const carrier = await this.prisma.carrier.create({
      data: { name: 'Test Carrier', mcNumber: '123456', status: 'ACTIVE' },
    });
    users.carrierPortal = await this.createUser({
      email: 'carrier@portal.com',
      role: 'CARRIER',
      carrierId: carrier.id,
    });
    
    return users;
  }
  
  private async createUser(data: {
    email: string;
    role: string;
    companyId?: string;
    carrierId?: string;
  }): Promise<TestUser> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: 'hashed-password',
        role: data.role,
        companyId: data.companyId,
        carrierId: data.carrierId,
      },
    });
    
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: data.companyId,
      carrierId: data.carrierId,
    });
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: data.companyId,
      carrierId: data.carrierId,
      token,
    };
  }
  
  async cleanup() {
    await this.prisma.user.deleteMany({
      where: { email: { endsWith: '@test.com' } },
    });
    await this.prisma.user.deleteMany({
      where: { email: { endsWith: '@portal.com' } },
    });
    await this.prisma.company.deleteMany({
      where: { name: 'Test Customer' },
    });
    await this.prisma.carrier.deleteMany({
      where: { name: 'Test Carrier' },
    });
  }
}
```

### 2. RBAC Test Utility

```typescript
// apps/api/test/utils/rbac-test.util.ts

import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestUser } from '../factories/test-users.factory';

export interface RbacTestCase {
  description: string;
  method: 'get' | 'post' | 'patch' | 'put' | 'delete';
  endpoint: string;
  body?: any;
  allowedRoles: string[];
  deniedRoles: string[];
}

export class RbacTestUtil {
  constructor(
    private app: INestApplication,
    private users: Record<string, TestUser>,
  ) {}
  
  async testEndpoint(testCase: RbacTestCase) {
    describe(testCase.description, () => {
      // Test allowed roles
      for (const role of testCase.allowedRoles) {
        const user = this.findUserByRole(role);
        if (!user) continue;
        
        it(`should allow ${role} access`, async () => {
          const req = request(this.app.getHttpServer())
            [testCase.method](testCase.endpoint)
            .set('Authorization', `Bearer ${user.token}`);
          
          if (testCase.body) {
            req.send(testCase.body);
          }
          
          const response = await req;
          expect(response.status).not.toBe(403);
          expect(response.status).not.toBe(401);
        });
      }
      
      // Test denied roles
      for (const role of testCase.deniedRoles) {
        const user = this.findUserByRole(role);
        if (!user) continue;
        
        it(`should deny ${role} access`, async () => {
          const req = request(this.app.getHttpServer())
            [testCase.method](testCase.endpoint)
            .set('Authorization', `Bearer ${user.token}`);
          
          if (testCase.body) {
            req.send(testCase.body);
          }
          
          const response = await req;
          expect(response.status).toBe(403);
        });
      }
      
      // Test unauthenticated
      it('should deny unauthenticated access', async () => {
        const req = request(this.app.getHttpServer())
          [testCase.method](testCase.endpoint);
        
        if (testCase.body) {
          req.send(testCase.body);
        }
        
        const response = await req;
        expect(response.status).toBe(401);
      });
    });
  }
  
  private findUserByRole(role: string): TestUser | undefined {
    return Object.values(this.users).find(u => u.role === role);
  }
}
```

---

## Service RBAC Tests

### 3. CRM Service RBAC Tests

```typescript
// apps/api/test/e2e/crm-rbac.e2e-spec.ts

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestUsersFactory, TestUser } from '../factories/test-users.factory';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('CRM RBAC (e2e)', () => {
  let app: INestApplication;
  let users: Record<string, TestUser>;
  let testCompanyId: string;
  let testContactId: string;
  
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleRef.createNestApplication();
    await app.init();
    
    const prisma = app.get(PrismaService);
    const factory = new TestUsersFactory(prisma);
    users = await factory.createTestUsers();
    
    // Create test data
    const company = await prisma.company.create({
      data: { name: 'RBAC Test Company', status: 'ACTIVE' },
    });
    testCompanyId = company.id;
    
    const contact = await prisma.contact.create({
      data: { firstName: 'Test', lastName: 'Contact', companyId: company.id },
    });
    testContactId = contact.id;
  });
  
  afterAll(async () => {
    const prisma = app.get(PrismaService);
    await prisma.contact.deleteMany({ where: { companyId: testCompanyId } });
    await prisma.company.delete({ where: { id: testCompanyId } });
    await new TestUsersFactory(prisma).cleanup();
    await app.close();
  });
  
  describe('GET /api/v1/companies', () => {
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_REP', 'ACCOUNTING'];
    const deniedRoles = ['DISPATCHER', 'CLAIMS_ADJUSTER', 'CARRIER'];
    
    it.each(allowedRoles)('should allow %s access', async (role) => {
      const user = Object.values(users).find(u => u.role === role);
      if (!user) return;
      
      const response = await request(app.getHttpServer())
        .get('/api/v1/companies')
        .set('Authorization', `Bearer ${user.token}`);
      
      expect(response.status).toBe(200);
    });
    
    it.each(deniedRoles)('should deny %s access', async (role) => {
      const user = Object.values(users).find(u => u.role === role);
      if (!user) return;
      
      const response = await request(app.getHttpServer())
        .get('/api/v1/companies')
        .set('Authorization', `Bearer ${user.token}`);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('POST /api/v1/companies', () => {
    it('should allow SALES_MANAGER to create company', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/companies')
        .set('Authorization', `Bearer ${users.salesManager.token}`)
        .send({ name: 'New Test Company', status: 'PROSPECT' });
      
      expect(response.status).toBe(201);
    });
    
    it('should deny SALES_REP from creating company', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/companies')
        .set('Authorization', `Bearer ${users.salesRep.token}`)
        .send({ name: 'Unauthorized Company', status: 'PROSPECT' });
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('DELETE /api/v1/companies/:id', () => {
    it('should allow only ADMIN to delete', async () => {
      // Create a company to delete
      const prisma = app.get(PrismaService);
      const company = await prisma.company.create({
        data: { name: 'To Delete', status: 'INACTIVE' },
      });
      
      // Try with sales manager - should fail
      const salesResponse = await request(app.getHttpServer())
        .delete(`/api/v1/companies/${company.id}`)
        .set('Authorization', `Bearer ${users.salesManager.token}`);
      
      expect(salesResponse.status).toBe(403);
      
      // Try with admin - should succeed
      const adminResponse = await request(app.getHttpServer())
        .delete(`/api/v1/companies/${company.id}`)
        .set('Authorization', `Bearer ${users.admin.token}`);
      
      expect(adminResponse.status).toBe(200);
    });
  });
});
```

### 4. Carrier Service RBAC Tests

```typescript
// apps/api/test/e2e/carrier-rbac.e2e-spec.ts

describe('Carrier RBAC (e2e)', () => {
  let app: INestApplication;
  let users: Record<string, TestUser>;
  let testCarrierId: string;
  
  // Setup similar to CRM tests...
  
  describe('GET /api/v1/carriers/:id/banking', () => {
    it('should allow ACCOUNTING to view banking info', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/carriers/${testCarrierId}/banking`)
        .set('Authorization', `Bearer ${users.accounting.token}`);
      
      expect(response.status).toBe(200);
      // Verify data is masked
      expect(response.body.accountNumber).toMatch(/^••••\d{4}$/);
    });
    
    it('should deny DISPATCHER from viewing banking info', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/carriers/${testCarrierId}/banking`)
        .set('Authorization', `Bearer ${users.dispatcher.token}`);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('GET /api/v1/carriers/:id/drivers (SSN Protection)', () => {
    it('should never expose SSN in driver list', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/carriers/${testCarrierId}/drivers`)
        .set('Authorization', `Bearer ${users.admin.token}`);
      
      expect(response.status).toBe(200);
      
      // Verify no SSN exposed
      for (const driver of response.body) {
        expect(driver).not.toHaveProperty('ssn');
        // Masked version may be present
        if (driver.ssnMasked) {
          expect(driver.ssnMasked).toMatch(/^•••-••-\d{4}$/);
        }
      }
    });
  });
});
```

### 5. Portal Isolation Tests

```typescript
// apps/api/test/e2e/portal-isolation.e2e-spec.ts

describe('Customer Portal Isolation (e2e)', () => {
  let app: INestApplication;
  let customerA: TestUser;
  let customerB: TestUser;
  let companyA: { id: string };
  let companyB: { id: string };
  let loadForCompanyA: { id: string };
  
  beforeAll(async () => {
    // Create two customer portal users with different companies
    // Create loads for each company
  });
  
  describe('GET /api/v1/customer-portal/loads', () => {
    it('should only return loads for customer\'s company', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/customer-portal/loads')
        .set('Authorization', `Bearer ${customerA.token}`);
      
      expect(response.status).toBe(200);
      
      // All loads should belong to Company A
      for (const load of response.body.data) {
        expect(load.companyId).toBe(companyA.id);
      }
    });
    
    it('should not allow access to other company\'s loads', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/customer-portal/loads/${loadForCompanyA.id}`)
        .set('Authorization', `Bearer ${customerB.token}`);
      
      // Should either 403 or 404 (not leak existence)
      expect([403, 404]).toContain(response.status);
    });
  });
});

describe('Carrier Portal Isolation (e2e)', () => {
  let app: INestApplication;
  let carrierA: TestUser;
  let carrierB: TestUser;
  let loadForCarrierA: { id: string };
  
  describe('GET /api/v1/carrier-portal/loads', () => {
    it('should only return loads assigned to carrier', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/carrier-portal/loads')
        .set('Authorization', `Bearer ${carrierA.token}`);
      
      expect(response.status).toBe(200);
      
      // All loads should be assigned to Carrier A
      for (const load of response.body.data) {
        expect(load.carrierId).toBe(carrierA.carrierId);
      }
    });
    
    it('should not allow viewing other carrier\'s loads', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/carrier-portal/loads/${loadForCarrierA.id}`)
        .set('Authorization', `Bearer ${carrierB.token}`);
      
      expect([403, 404]).toContain(response.status);
    });
    
    it('should not allow modifying other carrier\'s loads', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/carrier-portal/loads/${loadForCarrierA.id}`)
        .set('Authorization', `Bearer ${carrierB.token}`)
        .send({ status: 'IN_TRANSIT' });
      
      expect([403, 404]).toContain(response.status);
    });
  });
});
```

### 6. Integration Hub Credential Tests

```typescript
// apps/api/test/e2e/integration-hub-security.e2e-spec.ts

describe('Integration Hub Security (e2e)', () => {
  let app: INestApplication;
  let users: Record<string, TestUser>;
  let testIntegrationId: string;
  
  describe('GET /api/v1/integrations/:id', () => {
    it('should mask all credentials in response', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/integrations/${testIntegrationId}`)
        .set('Authorization', `Bearer ${users.admin.token}`);
      
      expect(response.status).toBe(200);
      
      // Check all sensitive fields are masked
      const credentials = response.body.credentials;
      if (credentials.apiKey) {
        expect(credentials.apiKey).toMatch(/^••••••••.{0,4}$/);
      }
      if (credentials.apiSecret) {
        expect(credentials.apiSecret).toMatch(/^••••••••.{0,4}$/);
      }
    });
    
    it('should never return webhook secrets', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/integrations/${testIntegrationId}/webhooks`)
        .set('Authorization', `Bearer ${users.admin.token}`);
      
      expect(response.status).toBe(200);
      
      for (const webhook of response.body) {
        expect(webhook).not.toHaveProperty('secret');
        expect(webhook).toHaveProperty('hasSecret');
      }
    });
  });
  
  describe('POST /api/v1/integrations', () => {
    it('should only allow SUPER_ADMIN to create integrations', async () => {
      const adminResponse = await request(app.getHttpServer())
        .post('/api/v1/integrations')
        .set('Authorization', `Bearer ${users.admin.token}`)
        .send({
          name: 'Test',
          provider: 'quickbooks',
          credentials: { apiKey: 'test-key' },
        });
      
      expect(adminResponse.status).toBe(403);
      
      const superAdminResponse = await request(app.getHttpServer())
        .post('/api/v1/integrations')
        .set('Authorization', `Bearer ${users.superAdmin.token}`)
        .send({
          name: 'Test',
          provider: 'quickbooks',
          credentials: { apiKey: 'test-key' },
        });
      
      expect(superAdminResponse.status).toBe(201);
    });
  });
});
```

---

## Test Organization

Create a test runner script for RBAC tests:

```typescript
// apps/api/test/run-rbac-tests.ts

/**
 * Run all RBAC-related E2E tests
 * 
 * Usage: pnpm test:e2e:rbac
 */

// This file is just for documentation
// Tests are run via jest configuration
```

Update `package.json`:

```json
{
  "scripts": {
    "test:e2e:rbac": "jest --config ./jest.e2e.config.ts --testPathPattern=rbac"
  }
}
```

---

## Files to Create

- [ ] `apps/api/test/factories/test-users.factory.ts`
- [ ] `apps/api/test/utils/rbac-test.util.ts`
- [ ] `apps/api/test/e2e/crm-rbac.e2e-spec.ts`
- [ ] `apps/api/test/e2e/sales-rbac.e2e-spec.ts`
- [ ] `apps/api/test/e2e/carrier-rbac.e2e-spec.ts`
- [ ] `apps/api/test/e2e/load-board-rbac.e2e-spec.ts`
- [ ] `apps/api/test/e2e/commission-rbac.e2e-spec.ts`
- [ ] `apps/api/test/e2e/documents-rbac.e2e-spec.ts`
- [ ] `apps/api/test/e2e/communication-rbac.e2e-spec.ts`
- [ ] `apps/api/test/e2e/portal-isolation.e2e-spec.ts`
- [ ] `apps/api/test/e2e/analytics-rbac.e2e-spec.ts`
- [ ] `apps/api/test/e2e/integration-hub-security.e2e-spec.ts`

---

## Success Criteria

- [ ] Every P0/P1 service has RBAC E2E tests
- [ ] Tests verify both allowed and denied access
- [ ] Portal isolation is thoroughly tested
- [ ] Sensitive data masking is verified
- [ ] All tests pass in CI pipeline
- [ ] Test coverage report shows >90% for auth guards
