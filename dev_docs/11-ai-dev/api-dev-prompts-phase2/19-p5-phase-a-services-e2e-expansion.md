# Prompt 19: Phase A Services - E2E Test Expansion

> **Priority:** P5 (Phase A Services Completion)  
> **Estimated Time:** 8-10 hours  
> **Prerequisites:** Prompts 01-13, 17-18 completed  
> **Services:** 14 modules (496 endpoints)

---

## ⚠️ Important: Follow Established Test Patterns

Before implementing, note these established patterns in the codebase:

### 1. RBAC Testing: ✅ USE ROLE INJECTION (not real login)

**Decision:** Use configurable role injection via `createTestApp` helper for main API tests.

**Confirmed role names:** `'viewer'`, `'user'`, `'manager'`, `'admin'` (lowercase)
- These are the RBAC decorator values used throughout the codebase
- `SUPER_ADMIN` is only used in the test helper default (bypasses all checks)

The existing `apps/api/test/helpers/test-app.helper.ts` overrides `JwtAuthGuard` to inject user context:

```typescript
// Current pattern - injects SUPER_ADMIN by default (bypasses RBAC)
const setup = await createTestApp('tenant-contracts', 'user-contracts', 'user@contracts.test');
// User is auto-injected as SUPER_ADMIN with full access
```

**To test RBAC restrictions, extend the helper with role parameter:**

```typescript
// Add to test-app.helper.ts
export async function createTestAppWithRole(
  tenantId: string,
  userId: string,
  email: string,
  role: 'viewer' | 'user' | 'manager' | 'admin' = 'user',  // Use lowercase role names
): Promise<{ app: INestApplication; prisma: PrismaService }> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        req.user = {
          id: userId,
          userId,
          email,
          tenantId,
          role: role,           // lowercase: 'viewer', 'user', 'manager', 'admin'
          roleName: role,
          roles: [role],
          permissions: [],
        };
        req.headers['x-tenant-id'] = tenantId;
        req.tenantId = tenantId;
        return true;
      },
    })
    // ... rest of setup
```

**Usage for RBAC tests:**
```typescript
describe('RBAC enforcement', () => {
  it('should deny viewer role from creating', async () => {
    const { app } = await createTestAppWithRole('tenant', 'user', 'user@test.com', 'viewer');
    const res = await request(app.getHttpServer())
      .post('/api/v1/contracts')
      .send({ /* data */ });
    expect(res.status).toBe(403);
  });
});
```

### 2. Portal Auth: ✅ DIFFERENT SECRETS FOR EACH PORTAL

**Customer Portal requires TWO secrets:**

| Secret | Used By | Purpose |
|--------|---------|---------|
| `PORTAL_JWT_SECRET` | `portal-auth.service.ts` | Token generation (signing) |
| `CUSTOMER_PORTAL_JWT_SECRET` | `portal-auth.guard.ts` | Token verification |

⚠️ **Both must match** for login→protected endpoint flow to work!

```typescript
// In customer-portal.e2e-spec.ts - set BEFORE app init
beforeAll(async () => {
  const SECRET = 'test-customer-portal-secret';
  process.env.PORTAL_JWT_SECRET = SECRET;           // Used to SIGN tokens
  process.env.CUSTOMER_PORTAL_JWT_SECRET = SECRET;  // Used to VERIFY tokens
  
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  // ...
});
```

**Carrier Portal uses ONE secret:**

| Secret | Used By | Purpose |
|--------|---------|---------|
| `CARRIER_PORTAL_JWT_SECRET` | `carrier-portal-auth.service.ts`, `carrier-portal-auth.guard.ts` | Both signing & verification |

```typescript
// In carrier-portal.e2e-spec.ts
beforeAll(async () => {
  process.env.CARRIER_PORTAL_JWT_SECRET = 'test-carrier-portal-secret';
  
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  // ...
});
```

### 3. Carrier Portal: ✅ USE REAL LOGIN FLOW (needs fix!)

**Current state is WRONG:** The existing `carrier-portal.e2e-spec.ts` uses `createTestApp` (guard injection), but this **does not work** for portal endpoints because:
- Portal endpoints use `PortalAuthGuard` / `CarrierPortalAuthGuard`, not `JwtAuthGuard`
- Guard injection only overrides `JwtAuthGuard`

**Correct pattern (like customer-portal.e2e-spec.ts):**

```typescript
// carrier-portal.e2e-spec.ts - USE REAL LOGIN
describe('Carrier Portal API', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  const TEST_TENANT = 'tenant-carrier-portal';
  const CARRIER_ID = 'carrier-portal-test';
  const PORTAL_USER_EMAIL = 'carrier@test.com';
  const PORTAL_USER_PASSWORD = 'password123';

  beforeAll(async () => {
    // Set secret BEFORE app init
    process.env.CARRIER_PORTAL_JWT_SECRET = 'test-carrier-secret';
    
    // Create app WITHOUT guard override
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    
    prisma = app.get(PrismaService);
    
    // Seed test data
    await prisma.tenant.upsert({ ... });
    await prisma.company.upsert({ 
      where: { id: CARRIER_ID },
      create: { id: CARRIER_ID, tenantId: TEST_TENANT, name: 'Test Carrier', companyType: 'CARRIER' },
      update: {},
    });
    await prisma.carrierPortalUser.upsert({
      where: { id: 'carrier-portal-user-1' },
      create: {
        id: 'carrier-portal-user-1',
        tenantId: TEST_TENANT,
        carrierId: CARRIER_ID,
        email: PORTAL_USER_EMAIL,
        password: PORTAL_USER_PASSWORD,  // Note: may need hashing depending on service
        firstName: 'Carrier',
        lastName: 'User',
        status: 'ACTIVE',
      },
      update: { password: PORTAL_USER_PASSWORD },
    });
  });

  describe('Auth', () => {
    it('should login and get token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/carrier-portal/auth/login')
        .send({ email: PORTAL_USER_EMAIL, password: PORTAL_USER_PASSWORD });
      
      expect(res.status).toBe(201);
      accessToken = res.body.data.accessToken;
    });
  });

  describe('Protected endpoints', () => {
    it('should access loads with token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/carrier-portal/loads')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
    });
  });
});
```

### 4. Data Seeding: ✅ PER-SPEC FIXTURES with cleanup

**Decision:** Use per-spec minimal fixtures with explicit cleanup (not shared fixture builder).

#### 4a. Portal User Password: ✅ PLAIN TEXT (no hashing!)

**Both portal auth services compare passwords directly without hashing:**

```typescript
// portal-auth.service.ts line 56
if (!user || user.password !== dto.password) {
  throw new UnauthorizedException('Invalid credentials');
}

// carrier-portal-auth.service.ts line 49
if (!user || user.password !== dto.password) {
  throw new UnauthorizedException('Invalid credentials');
}
```

**Seed plain text passwords in tests:**
```typescript
const PORTAL_USER_PASSWORD = 'password123';

await prisma.portalUser.upsert({
  where: { id: 'portal-user-1' },
  create: {
    // ...
    password: PORTAL_USER_PASSWORD,  // ✅ Plain text - no hashing needed
  },
  update: { password: PORTAL_USER_PASSWORD },
});
```

#### 4b. Portal Routes Reference

**Customer Portal Routes (prefix: `/api/v1/portal`):**

| Controller | Route | Methods |
|------------|-------|---------|
| `portal-auth.controller.ts` | `/portal/auth/login` | POST |
| | `/portal/auth/refresh` | POST |
| | `/portal/auth/logout` | POST |
| | `/portal/auth/forgot-password` | POST |
| | `/portal/auth/reset-password` | POST |
| | `/portal/auth/register` | POST |
| | `/portal/auth/verify-email/:token` | GET |
| | `/portal/auth/change-password` | POST |
| `portal-users.controller.ts` | `/portal/profile` | GET |
| | `/portal/users` | GET, POST |
| | `/portal/users/:id` | DELETE |
| `portal-shipments.controller.ts` | `/portal/shipments` | GET |
| | `/portal/shipments/:id` | GET |
| | `/portal/shipments/:id/tracking` | GET |
| | `/portal/shipments/:id/events` | GET |
| | `/portal/shipments/:id/documents` | GET |
| | `/portal/shipments/:id/contact` | POST |
| `portal-invoices.controller.ts` | `/portal/invoices` | GET |
| | `/portal/invoices/:id` | GET |
| | `/portal/invoices/:id/pdf` | GET |
| | `/portal/invoices/aging/summary` | GET |
| `portal-payments.controller.ts` | `/portal/payments` | GET, POST |
| | `/portal/payments/:id` | GET |

**Carrier Portal Routes (prefix: `/api/v1/carrier-portal`):**

| Controller | Route | Methods |
|------------|-------|---------|
| `carrier-portal-auth.controller.ts` | `/carrier-portal/auth/login` | POST |
| | `/carrier-portal/auth/refresh` | POST |
| | `/carrier-portal/auth/logout` | POST |
| | `/carrier-portal/auth/forgot-password` | POST |
| | `/carrier-portal/auth/reset-password` | POST |
| | `/carrier-portal/auth/register` | POST |
| | `/carrier-portal/auth/verify-email/:token` | GET |
| `carrier-portal-users.controller.ts` | `/carrier-portal/profile` | GET |
| | `/carrier-portal/carrier` | GET |
| | `/carrier-portal/users` | GET, POST |
| | `/carrier-portal/users/:userId` | DELETE |
| `carrier-portal-loads.controller.ts` | `/carrier-portal/loads` | GET |
| | `/carrier-portal/loads/available` | GET |
| | `/carrier-portal/loads/available/:id` | GET |
| | `/carrier-portal/loads/available/:id/save` | POST |
| | `/carrier-portal/loads/saved` | GET |
| | `/carrier-portal/loads/saved/:id` | DELETE |
| | `/carrier-portal/loads/:id/bid` | POST |
| | `/carrier-portal/loads/matching` | GET |
| `carrier-portal-compliance.controller.ts` | `/carrier-portal/compliance` | GET |
| | `/carrier-portal/compliance/documents` | GET, POST |
| | `/carrier-portal/compliance/documents/:id` | GET |
| | `/carrier-portal/compliance/expiring` | GET |

#### 4c. Per-Spec Cleanup Pattern

**Pattern from existing tests:**
```typescript
const TEST_TENANT = 'tenant-contracts';  // Unique per spec file
const TEST_USER = 'user-contracts';

beforeAll(async () => {
  // 1. Create app
  const setup = await createTestApp(TEST_TENANT, TEST_USER, 'user@contracts.test');
  app = setup.app;
  prisma = setup.prisma;
  
  // 2. Clean previous test data (idempotent reruns)
  await prisma.contractRate.deleteMany({ where: { tenantId: TEST_TENANT } });
  await prisma.contract.deleteMany({ where: { tenantId: TEST_TENANT } });
  
  // 3. Seed minimal fixtures for this spec
  testCustomer = await prisma.company.create({
    data: {
      tenantId: TEST_TENANT,
      name: 'Test Customer',
      companyType: 'CUSTOMER',
    },
  });
  
  testContract = await prisma.contract.create({
    data: {
      tenantId: TEST_TENANT,
      customerId: testCustomer.id,
      contractNumber: 'TEST-001',
      status: 'DRAFT',
    },
  });
});

afterAll(async () => {
  // Clean up all test data
  await prisma.contractRate.deleteMany({ where: { tenantId: TEST_TENANT } });
  await prisma.contract.deleteMany({ where: { tenantId: TEST_TENANT } });
  await prisma.company.deleteMany({ where: { tenantId: TEST_TENANT } });
  await app.close();
});
```

**Why per-spec fixtures:**
- Unique tenant IDs prevent cross-test interference
- Explicit cleanup enables idempotent test reruns
- Minimal fixtures keep tests fast (~5 min target)
- Each spec is self-contained and debuggable

---

## Objective

Expand E2E test coverage for Phase A services. While all 14 modules have E2E test files, they need comprehensive endpoint coverage to ensure frontend reliability.

---

## Current State

All 14 modules have basic E2E test files, but coverage varies:

| Module | Test File | Current Coverage | Target |
|--------|-----------|------------------|--------|
| Customer Portal | `customer-portal.e2e-spec.ts` | ~30% | 80% |
| Carrier Portal | `carrier-portal.e2e-spec.ts` | ~30% | 80% |
| Contracts | `contracts.e2e-spec.ts` | ~25% | 80% |
| Credit | `credit.e2e-spec.ts` | ~25% | 80% |
| Agents | `agent.e2e-spec.ts` | ~25% | 80% |
| HR | `hr.e2e-spec.ts` | ~30% | 80% |
| Workflow | `workflow.e2e-spec.ts` | ~25% | 80% |
| Search | `search.e2e-spec.ts` | ~30% | 80% |
| Help Desk | `help-desk.e2e-spec.ts` | ~25% | 80% |
| EDI | `edi.e2e-spec.ts` | ~20% | 80% |
| Rate Intelligence | `rate-intelligence.e2e-spec.ts` | ~30% | 80% |
| Claims | `claims.e2e-spec.ts` | ~25% | 80% |
| Factoring | `factoring.e2e-spec.ts` | ~25% | 80% |
| Safety | `safety.e2e-spec.ts` | ~30% | 80% |

---

## Target State

Each module should have comprehensive E2E tests covering:
- CRUD operations for all entities
- Business workflow operations (approve, reject, etc.)
- Error cases (404, 400, 403)
- Pagination and filtering
- RBAC enforcement

---

## Implementation Tasks

### Task 1: Contracts Module Tests

**File:** `apps/api/test/contracts.e2e-spec.ts`

```typescript
describe('Contracts Module (e2e)', () => {
  // Contract CRUD
  describe('GET /contracts', () => {
    it('should return paginated contracts list', async () => {});
    it('should filter by status', async () => {});
    it('should filter by customer', async () => {});
    it('should require authentication', async () => {});
  });

  describe('POST /contracts', () => {
    it('should create a contract', async () => {});
    it('should validate required fields', async () => {});
    it('should require user role', async () => {});
  });

  describe('GET /contracts/:id', () => {
    it('should return contract details', async () => {});
    it('should return 404 for non-existent', async () => {});
  });

  describe('PATCH /contracts/:id', () => {
    it('should update contract', async () => {});
    it('should not update finalized contract', async () => {});
  });

  describe('DELETE /contracts/:id', () => {
    it('should soft delete contract', async () => {});
    it('should require manager role', async () => {});
  });

  // Workflow operations
  describe('POST /contracts/:id/submit', () => {
    it('should submit for approval', async () => {});
  });

  describe('POST /contracts/:id/approve', () => {
    it('should approve contract', async () => {});
    it('should require manager role', async () => {});
  });

  describe('POST /contracts/:id/reject', () => {
    it('should reject with reason', async () => {});
  });

  // Contract Templates
  describe('Contract Templates', () => {
    it('should list templates', async () => {});
    it('should create from template', async () => {});
  });

  // Contract Rates
  describe('Contract Rates', () => {
    it('should list rates for contract', async () => {});
    it('should add rate to contract', async () => {});
  });
});
```

### Task 2: Portal Module Tests

**Files:** 
- `apps/api/test/customer-portal.e2e-spec.ts`
- `apps/api/test/carrier-portal.e2e-spec.ts`

Test portal-specific authentication flows:

```typescript
describe('Customer Portal (e2e)', () => {
  let portalToken: string;

  beforeAll(async () => {
    // Login as portal user
    const response = await request(app.getHttpServer())
      .post('/customer-portal/auth/login')
      .send({ email: 'customer@test.com', password: 'password' });
    portalToken = response.body.accessToken;
  });

  describe('Portal Auth', () => {
    it('should login with customer credentials', async () => {});
    it('should refresh token', async () => {});
    it('should logout', async () => {});
  });

  describe('Portal Dashboard', () => {
    it('should return dashboard data', async () => {});
    it('should show active shipments', async () => {});
  });

  describe('Portal Shipments', () => {
    it('should list customer shipments only', async () => {});
    it('should not access other customer shipments', async () => {});
  });

  describe('Portal Invoices', () => {
    it('should list customer invoices', async () => {});
    it('should download invoice PDF', async () => {});
  });
});
```

### Task 3: Financial Module Tests

**Files:**
- `apps/api/test/credit.e2e-spec.ts`
- `apps/api/test/factoring.e2e-spec.ts`
- `apps/api/test/claims.e2e-spec.ts`

```typescript
describe('Credit Module (e2e)', () => {
  describe('Credit Applications', () => {
    it('should submit credit application', async () => {});
    it('should approve application', async () => {});
    it('should reject with reason', async () => {});
  });

  describe('Credit Limits', () => {
    it('should get customer credit limit', async () => {});
    it('should update credit limit', async () => {});
  });

  describe('Credit Holds', () => {
    it('should place credit hold', async () => {});
    it('should release credit hold', async () => {});
  });
});
```

### Task 4: Operations Module Tests

**Files:**
- `apps/api/test/agents.e2e-spec.ts`
- `apps/api/test/hr.e2e-spec.ts`
- `apps/api/test/workflow.e2e-spec.ts`

### Task 5: Integration Module Tests

**Files:**
- `apps/api/test/edi.e2e-spec.ts`
- `apps/api/test/safety.e2e-spec.ts`
- `apps/api/test/rate-intelligence.e2e-spec.ts`

---

## Test Utilities

Use shared test helpers from `apps/api/test/helpers/`:

```typescript
import { createTestApp, getAuthToken, createTestData } from './helpers/test-app.helper';

describe('Module (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = await getAuthToken(app, 'admin');
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## Acceptance Criteria

**Test Helper Enhancement:**
- [ ] Extended `createTestAppWithRole()` helper in `test-app.helper.ts`
- [ ] Uses lowercase role names: `'viewer'`, `'user'`, `'manager'`, `'admin'`

**Portal Test Fixes:**
- [ ] `carrier-portal.e2e-spec.ts` refactored to use real login flow (not `createTestApp`)
- [ ] Customer portal sets both `PORTAL_JWT_SECRET` and `CUSTOMER_PORTAL_JWT_SECRET` to same value
- [ ] Carrier portal sets `CARRIER_PORTAL_JWT_SECRET` before app init
- [ ] Portal users seeded with plain text passwords (no hashing - services compare directly)
- [ ] Test routes match actual controller routes (see route reference above)

**Data Management:**
- [ ] Each spec uses unique `TEST_TENANT` ID
- [ ] `beforeAll` cleans previous test data before seeding
- [ ] `afterAll` cleans up all test data and closes app
- [ ] No shared state between spec files

**Coverage:**
- [ ] All 14 modules have 80%+ endpoint coverage
- [ ] RBAC tests verify role restrictions (using role injection)
- [ ] Portal tests use real login flows with env secrets set
- [ ] Error cases tested (400, 401, 403, 404)
- [ ] All tests pass: `pnpm --filter api test:e2e`
- [ ] Test execution time < 5 minutes

---

## Verification

```bash
# Run all E2E tests
pnpm --filter api test:e2e

# Run specific module tests
pnpm --filter api test:e2e -- --grep "Contracts"
pnpm --filter api test:e2e -- --grep "Customer Portal"

# Check coverage
pnpm --filter api test:e2e:cov
```

---

## Files to Modify

```
apps/api/test/
├── contracts.e2e-spec.ts      # Expand from ~25% to 80%
├── credit.e2e-spec.ts         # Expand from ~25% to 80%
├── agents.e2e-spec.ts         # Expand from ~25% to 80%
├── hr.e2e-spec.ts             # Expand from ~30% to 80%
├── workflow.e2e-spec.ts       # Expand from ~25% to 80%
├── search.e2e-spec.ts         # Expand from ~30% to 80%
├── help-desk.e2e-spec.ts      # Expand from ~25% to 80%
├── edi.e2e-spec.ts            # Expand from ~20% to 80%
├── rate-intelligence.e2e-spec.ts  # Expand from ~30% to 80%
├── claims.e2e-spec.ts         # Expand from ~25% to 80%
├── factoring.e2e-spec.ts      # Expand from ~25% to 80%
├── safety.e2e-spec.ts         # Expand from ~30% to 80%
├── customer-portal.e2e-spec.ts    # Expand from ~30% to 80%
└── carrier-portal.e2e-spec.ts     # Expand from ~30% to 80%
```

---

## ✅ After Completion - Update Progress

**IMPORTANT:** After completing this prompt, update the following files:

### 1. Update README.md Progress Tracker

In `dev_docs/11-ai-dev/api-dev-prompts-phase2/README.md`, update:

```markdown
| 19 | [Phase A E2E Tests](19-p5-phase-a-services-e2e-expansion.md) | P5 | 8-10h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics Table

In the same README.md, update the Current Status table:

```markdown
| Phase A Services E2E | ~30% | 80% | 80% |
```

### 3. Add Changelog Entry

Add to the Changelog section:

```markdown
### [Date] - Prompt 19: Phase A Services E2E Expansion
**Completed by:** [Your Name]
**Time spent:** [X] hours

#### Changes
- Expanded E2E tests for 14 modules from ~30% to 80% coverage
- Added CRUD, workflow, error case, pagination, and RBAC tests
- Customer Portal, Carrier Portal, Contracts, Credit, HR, Workflow, Agents, Claims, Factoring, Safety, Search, Help Desk, EDI, Rate Intelligence modules tested

#### Metrics Updated
- Phase A Services E2E: ~30% → 80%
```

### 4. P5 Complete! 🎉

**Congratulations!** Phase A Services (13-27) are now fully:
- ✅ Secured with RBAC
- ✅ Documented with Swagger
- ✅ Tested with 80% E2E coverage

These 14 modules are now at the same quality level as services 00-12 and ready for frontend development.

### 5. Update Review Documents

Update the review HTML files in `dev_docs/api-review-docs/` to reflect completion:
- Change status from "NEEDS P5" to "FRONTEND READY"
- Update scores from 5/10 to 8-9/10
- Update the [28-phase-a-services-summary.html](../../api-review-docs/28-phase-a-services-summary.html)
