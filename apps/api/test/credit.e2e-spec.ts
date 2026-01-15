import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma.service';
import { createTestApp, createTestAppWithRole } from './helpers/test-app.helper';

const TEST_TENANT = 'tenant-credit';
const TEST_USER = 'user-credit';
const TEST_EMAIL = 'user@credit.test';

describe('Credit API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;

  beforeAll(async () => {
    const setup = await createTestApp(TEST_TENANT, TEST_USER, TEST_EMAIL);
    app = setup.app;
    prisma = setup.prisma;

    await prisma.creditHold.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.creditLimit.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.creditApplication.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.company.deleteMany({ where: { tenantId: TEST_TENANT } });

    const company = await prisma.company.create({
      data: {
        tenantId: TEST_TENANT,
        name: 'Credit Customer',
        companyType: 'CUSTOMER',
      },
    });
    companyId = company.id;
  });

  afterAll(async () => {
    await prisma.creditHold.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.creditLimit.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.creditApplication.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.company.deleteMany({ where: { tenantId: TEST_TENANT } });
    await app.close();
  });

  describe('Credit Applications', () => {
    it('should submit credit application', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/credit/applications')
        .send({
          companyId,
          businessName: 'Credit Customer',
          requestedLimit: 5000,
        })
        .expect(201);

      expect(res.body.data.id).toBeDefined();
    });

    it('should approve application', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/credit/applications')
        .send({
          companyId,
          businessName: 'Approve Customer',
          requestedLimit: 8000,
        })
        .expect(201);

      const applicationId = createRes.body.data.id;

      const adminSetup = await createTestAppWithRole('tenant-credit-admin', 'user-credit-admin', 'admin@credit.test', 'admin');
      const adminApp = adminSetup.app;
      const adminPrisma = adminSetup.prisma;

      const adminCompany = await adminPrisma.company.create({
        data: {
          tenantId: 'tenant-credit-admin',
          name: `Admin Credit Customer ${Date.now()}`,
          companyType: 'CUSTOMER',
        },
      });

      const adminCreateRes = await request(adminApp.getHttpServer())
        .post('/api/v1/credit/applications')
        .send({
          companyId: adminCompany.id,
          businessName: 'Admin Application',
          requestedLimit: 7000,
        })
        .expect(201);

      const adminApplicationId = adminCreateRes.body.data.id;

      await request(app.getHttpServer())
        .post(`/api/v1/credit/applications/${applicationId}/approve`)
        .send({ approvedLimit: 7000, paymentTerms: 'NET_30' })
        .expect(200);

      await request(adminApp.getHttpServer())
        .post(`/api/v1/credit/applications/${adminApplicationId}/approve`)
        .send({ approvedLimit: 7000, paymentTerms: 'NET_30' })
        .expect(200);

      await adminPrisma.creditApplication.deleteMany({ where: { tenantId: 'tenant-credit-admin' } });
      await adminPrisma.company.deleteMany({ where: { tenantId: 'tenant-credit-admin' } });
      await adminApp.close();
    });

    it('should reject with reason', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/credit/applications')
        .send({
          companyId,
          businessName: 'Reject Customer',
          requestedLimit: 6000,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/credit/applications/${createRes.body.data.id}/reject`)
        .send({ reason: 'Insufficient history' })
        .expect(200);
    });
  });

  describe('Credit Limits', () => {
    it('should get customer credit limit', async () => {
      const limitCompany = await prisma.company.create({
        data: {
          tenantId: TEST_TENANT,
          name: `Credit Limit Customer ${Date.now()}-${Math.random()}`,
          companyType: 'CUSTOMER',
        },
      });

      await request(app.getHttpServer())
        .post('/api/v1/credit/limits')
        .send({ companyId: limitCompany.id, creditLimit: 10000 })
        .expect(201);

      await request(app.getHttpServer())
        .get(`/api/v1/credit/limits/${limitCompany.id}`)
        .expect(200);
    });

    it('should update credit limit', async () => {
      const adminSetup = await createTestAppWithRole('tenant-credit-limits', 'user-credit-limits', 'admin2@credit.test', 'admin');
      const adminApp = adminSetup.app;
      const adminPrisma = adminSetup.prisma;

      const company = await adminPrisma.company.create({
        data: {
          tenantId: 'tenant-credit-limits',
          name: `Credit Limit Customer ${Date.now()}`,
          companyType: 'CUSTOMER',
        },
      });

      await request(adminApp.getHttpServer())
        .post('/api/v1/credit/limits')
        .send({ companyId: company.id, creditLimit: 10000 })
        .expect(201);

      await request(adminApp.getHttpServer())
        .put(`/api/v1/credit/limits/${company.id}`)
        .send({ creditLimit: 15000 })
        .expect(200);

      await adminPrisma.creditLimit.deleteMany({ where: { tenantId: 'tenant-credit-limits' } });
      await adminPrisma.company.deleteMany({ where: { tenantId: 'tenant-credit-limits' } });
      await adminApp.close();
    });
  });

  describe('Credit Holds', () => {
    it('should place credit hold', async () => {
      const adminSetup = await createTestAppWithRole('tenant-credit-holds', 'user-credit-holds', 'admin3@credit.test', 'admin');
      const adminApp = adminSetup.app;
      const adminPrisma = adminSetup.prisma;

      const holdCompanyName = `Hold Customer ${Date.now()}-${Math.random()}`;
      const company = await adminPrisma.company.create({
        data: {
          tenantId: 'tenant-credit-holds',
          name: holdCompanyName,
          companyType: 'CUSTOMER',
        },
      });

      const res = await request(adminApp.getHttpServer())
        .post('/api/v1/credit/holds')
        .send({ companyId: company.id, reason: 'PAYMENT_OVERDUE', description: 'Past due invoices' })
        .expect(201);
      expect(res.body.data.id).toBeDefined();

      await adminPrisma.creditHold.deleteMany({ where: { tenantId: 'tenant-credit-holds' } });
      await adminPrisma.company.deleteMany({ where: { tenantId: 'tenant-credit-holds' } });
      await adminApp.close();
    });

    it('should release credit hold', async () => {
      const adminSetup = await createTestAppWithRole('tenant-credit-holds2', 'user-credit-holds2', 'admin4@credit.test', 'admin');
      const adminApp = adminSetup.app;
      const adminPrisma = adminSetup.prisma;

      const holdCompanyName = `Hold Customer 2 ${Date.now()}-${Math.random()}`;
      const company = await adminPrisma.company.create({
        data: {
          tenantId: 'tenant-credit-holds2',
          name: holdCompanyName,
          companyType: 'CUSTOMER',
        },
      });

      const hold = await adminPrisma.creditHold.create({
        data: {
          tenantId: 'tenant-credit-holds2',
          companyId: company.id,
          reason: 'PAYMENT_OVERDUE',
          description: 'Late payment',
          createdById: 'user-credit-holds2',
        },
      });

      await request(adminApp.getHttpServer())
        .patch(`/api/v1/credit/holds/${hold.id}/release`)
        .send({ releasedById: 'user-credit-holds2', resolutionNotes: 'Paid in full' })
        .expect(200);

      await adminPrisma.creditHold.deleteMany({ where: { tenantId: 'tenant-credit-holds2' } });
      await adminPrisma.company.deleteMany({ where: { tenantId: 'tenant-credit-holds2' } });
      await adminApp.close();
    });
  });
});
