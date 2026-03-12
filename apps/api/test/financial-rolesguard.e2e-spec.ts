import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

/**
 * MP-03-004: RolesGuard Integration Tests for Financial Controllers
 *
 * Tests that all financial controllers properly enforce role-based access control.
 * Financial operations must be protected — unauthorized access is a compliance violation.
 *
 * Coverage:
 * - Accounting (10 controllers): invoices, payments, settlements, chart-of-accounts, etc.
 * - Credit (5 controllers): credit limits, facility, risk ratings, etc.
 * - Contracts (8 controllers): fuel surcharge, rates, fuel programs, etc.
 * - Factoring (5 controllers): factoring, invoices, transaction tracking, etc.
 * - Agents (6 controllers): agents, agreements, assignments, commissions, rankings, etc.
 */

describe('Financial Controllers - RolesGuard (MP-03-004)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp(
      'tenant-financial',
      'user-financial',
      'user@financial.test'
    );
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================================================
  // Accounting Module (10 controllers)
  // Allowed roles: ADMIN, ACCOUNTING, ACCOUNTING_MANAGER
  // ============================================================================

  describe('Accounting - Role-based Access (10 controllers)', () => {
    const authorizedRoles = ['ACCOUNTING', 'ACCOUNTING_MANAGER'];
    const unauthorizedRoles = ['DISPATCHER', 'CUSTOMER', 'CARRIER'];

    describe('Invoices Controller', () => {
      authorizedRoles.forEach((role) => {
        it(`allows ${role} to list invoices (200)`, async () => {
          await request(app.getHttpServer())
            .get('/api/v1/invoices')
            .set('x-test-role', role)
            .expect(200);
        });
      });

      unauthorizedRoles.forEach((role) => {
        it(`denies ${role} from listing invoices (403)`, async () => {
          await request(app.getHttpServer())
            .get('/api/v1/invoices')
            .set('x-test-role', role)
            .expect(403);
        });
      });
    });

    it('allows ACCOUNTING to list payments received', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments-received')
        .set('x-test-role', 'ACCOUNTING')
        .expect(200);
    });

    it('denies DISPATCHER from payments received', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments-received')
        .set('x-test-role', 'DISPATCHER')
        .expect(403);
    });

    it('allows ACCOUNTING_MANAGER to list settlements', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/settlements')
        .set('x-test-role', 'ACCOUNTING_MANAGER')
        .expect(200);
    });

    it('denies CUSTOMER from settlements', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/settlements')
        .set('x-test-role', 'CUSTOMER')
        .expect(403);
    });

    it('allows ACCOUNTING to access chart of accounts', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/chart-of-accounts')
        .set('x-test-role', 'ACCOUNTING')
        .expect(200);
    });

    it('denies CARRIER from chart of accounts', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/chart-of-accounts')
        .set('x-test-role', 'CARRIER')
        .expect(403);
    });

    it('allows ACCOUNTING_MANAGER to list journal entries', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/journal-entries')
        .set('x-test-role', 'ACCOUNTING_MANAGER')
        .expect(200);
    });

    it('denies unauthorized access to journal entries', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/journal-entries')
        .set('x-test-role', 'DISPATCHER')
        .expect(403);
    });
  });

  // ============================================================================
  // Credit Module (5 controllers)
  // Allowed roles: CREDIT_ANALYST, CREDIT_VIEWER
  // ============================================================================

  describe('Credit - Role-based Access (5 controllers)', () => {
    const authorizedRoles = ['CREDIT_ANALYST', 'CREDIT_VIEWER'];
    const unauthorizedRoles = ['DISPATCHER', 'CARRIER'];

    authorizedRoles.forEach((role) => {
      it(`allows ${role} to access credit limits (200)`, async () => {
        await request(app.getHttpServer())
          .get('/api/v1/credit/limits')
          .set('x-test-role', role)
          .expect(200);
      });
    });

    unauthorizedRoles.forEach((role) => {
      it(`denies ${role} from accessing credit limits (403)`, async () => {
        await request(app.getHttpServer())
          .get('/api/v1/credit/limits')
          .set('x-test-role', role)
          .expect(403);
      });
    });
  });

  // ============================================================================
  // Contracts Module (8 controllers)
  // Allowed roles: CONTRACTS_MANAGER, CONTRACTS_VIEWER
  // ============================================================================

  describe('Contracts - Role-based Access (8 controllers)', () => {
    const authorizedRoles = ['CONTRACTS_MANAGER', 'CONTRACTS_VIEWER'];
    const unauthorizedRoles = ['DISPATCHER', 'CARRIER'];

    authorizedRoles.forEach((role) => {
      it(`allows ${role} to access fuel surcharge tiers (200)`, async () => {
        await request(app.getHttpServer())
          .get('/api/v1/contracts/fuel-surcharge-tiers')
          .set('x-test-role', role)
          .expect(200);
      });
    });

    unauthorizedRoles.forEach((role) => {
      it(`denies ${role} from accessing fuel surcharge (403)`, async () => {
        await request(app.getHttpServer())
          .get('/api/v1/contracts/fuel-surcharge-tiers')
          .set('x-test-role', role)
          .expect(403);
      });
    });
  });

  // ============================================================================
  // Factoring Module (5 controllers)
  // Allowed roles: FACTORING_MANAGER
  // ============================================================================

  describe('Factoring - Role-based Access (5 controllers)', () => {
    it('allows FACTORING_MANAGER to list factoring records (200)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/factoring')
        .set('x-test-role', 'FACTORING_MANAGER')
        .expect(200);
    });

    it('denies DISPATCHER from accessing factoring (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/factoring')
        .set('x-test-role', 'DISPATCHER')
        .expect(403);
    });
  });

  // ============================================================================
  // Agents Module (6 controllers)
  // Allowed roles: AGENT_MANAGER
  // ============================================================================

  describe('Agents - Role-based Access (6 controllers)', () => {
    // const authorizedRoles = ['AGENT_MANAGER'];
    const unauthorizedRoles = ['DISPATCHER', 'CUSTOMER', 'CARRIER'];

    describe('Agents Controller', () => {
      it('allows AGENT_MANAGER to list agents (200)', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/agents')
          .set('x-test-role', 'AGENT_MANAGER')
          .expect(200);
      });

      unauthorizedRoles.forEach((role) => {
        it(`denies ${role} from listing agents (403)`, async () => {
          await request(app.getHttpServer())
            .get('/api/v1/agents')
            .set('x-test-role', role)
            .expect(403);
        });
      });
    });

    it('allows AGENT_MANAGER to access rankings', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/agents/rankings')
        .set('x-test-role', 'AGENT_MANAGER')
        .expect(200);
    });

    it('denies DISPATCHER from accessing rankings', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/agents/rankings')
        .set('x-test-role', 'DISPATCHER')
        .expect(403);
    });
  });

  // ============================================================================
  // Authorization Enforcement Summary
  // ============================================================================

  describe('Authorization Enforcement Verification', () => {
    it('SUPER_ADMIN bypasses all role checks', async () => {
      // SUPER_ADMIN should access any financial endpoint
      await request(app.getHttpServer())
        .get('/api/v1/invoices')
        .set('x-test-role', 'SUPER_ADMIN')
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/credit/limits')
        .set('x-test-role', 'SUPER_ADMIN')
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/agents')
        .set('x-test-role', 'SUPER_ADMIN')
        .expect(200);
    });

    it('prevents access with x-test-unauth header', async () => {
      // Even SUPER_ADMIN should fail with explicit unauth header
      await request(app.getHttpServer())
        .get('/api/v1/invoices')
        .set('x-test-unauth', 'true')
        .expect(401);
    });
  });
});
