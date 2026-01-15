import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma.service';
import { createTestApp, createTestAppWithRole } from './helpers/test-app.helper';

const TEST_TENANT = 'tenant-contracts';
const TEST_USER = 'user-contracts';
const TEST_EMAIL = 'user@contracts.test';

describe('Contracts API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let customerId: string;

  beforeAll(async () => {
    const setup = await createTestApp(TEST_TENANT, TEST_USER, TEST_EMAIL);
    app = setup.app;
    prisma = setup.prisma;

    await prisma.contractRateTable.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.contractTemplate.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.contractAmendment.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.contract.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.company.deleteMany({ where: { tenantId: TEST_TENANT } });

    const customer = await prisma.company.create({
      data: {
        tenantId: TEST_TENANT,
        name: 'Contracts Customer',
        companyType: 'CUSTOMER',
      },
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    await prisma.contractRateTable.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.contractTemplate.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.contractAmendment.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.contract.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.company.deleteMany({ where: { tenantId: TEST_TENANT } });
    await app.close();
  });

  describe('GET /contracts', () => {
    it('should return contracts list', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/contracts')
        .expect(200);
    });
  });

  describe('POST /contracts', () => {
    it('should create a contract', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/contracts')
        .send({
          name: 'Test Contract',
          contractType: 'CUSTOMER_RATE',
          customerId,
          effectiveDate: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        })
        .expect(201);

      expect(res.body.data.id).toBeDefined();
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/contracts')
        .send({})
        .expect(400);
    });

    it('should require user role', async () => {
      const setup = await createTestAppWithRole('tenant-contracts-rbac', 'user-contracts-viewer', 'viewer@contracts.test', 'viewer');
      const rbacApp = setup.app;
      const rbacPrisma = setup.prisma;

      const customer = await rbacPrisma.company.create({
        data: {
          tenantId: 'tenant-contracts-rbac',
          name: 'RBAC Customer',
          companyType: 'CUSTOMER',
        },
      });

      await request(rbacApp.getHttpServer())
        .post('/api/v1/contracts')
        .send({
          name: 'RBAC Contract',
          contractType: 'CUSTOMER_RATE',
          customerId: customer.id,
          effectiveDate: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        })
        .expect(403);

      await rbacPrisma.contract.deleteMany({ where: { tenantId: 'tenant-contracts-rbac' } });
      await rbacPrisma.company.deleteMany({ where: { tenantId: 'tenant-contracts-rbac' } });
      await rbacApp.close();
    });
  });

  describe('GET /contracts/:id', () => {
    it('should return contract details', async () => {
      const contract = await prisma.contract.create({
        data: {
          tenantId: TEST_TENANT,
          contractNumber: 'C-TEST-1',
          name: 'Detail Contract',
          contractType: 'CUSTOMER_RATE',
          customerId,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          status: 'DRAFT',
        },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/contracts/${contract.id}`)
        .expect(200);
    });

    it('should return 404 for non-existent', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/contracts/non-existent')
        .expect(404);
    });
  });

  describe('PUT /contracts/:id', () => {
    it('should update contract', async () => {
      const contract = await prisma.contract.create({
        data: {
          tenantId: TEST_TENANT,
          contractNumber: 'C-TEST-2',
          name: 'Update Contract',
          contractType: 'CUSTOMER_RATE',
          customerId,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          status: 'DRAFT',
        },
      });

      const res = await request(app.getHttpServer())
        .put(`/api/v1/contracts/${contract.id}`)
        .send({ name: 'Updated Contract Name' })
        .expect(200);

      expect(res.body.data.name).toBe('Updated Contract Name');
    });
  });

  describe('DELETE /contracts/:id', () => {
    it('should soft delete contract', async () => {
      const contract = await prisma.contract.create({
        data: {
          tenantId: TEST_TENANT,
          contractNumber: 'C-TEST-3',
          name: 'Delete Contract',
          contractType: 'CUSTOMER_RATE',
          customerId,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          status: 'DRAFT',
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/contracts/${contract.id}`)
        .expect(200);
    });

    it('should require manager role', async () => {
      const viewerSetup = await createTestAppWithRole('tenant-contracts-rbac2', 'user-contracts-viewer2', 'viewer2@contracts.test', 'viewer');
      const viewerApp = viewerSetup.app;
      const viewerPrisma = viewerSetup.prisma;

      const customer = await viewerPrisma.company.create({
        data: {
          tenantId: 'tenant-contracts-rbac2',
          name: 'RBAC Customer 2',
          companyType: 'CUSTOMER',
        },
      });

      const contract = await viewerPrisma.contract.create({
        data: {
          tenantId: 'tenant-contracts-rbac2',
          contractNumber: 'C-TEST-5',
          name: 'RBAC Contract 2',
          contractType: 'CUSTOMER_RATE',
          customerId: customer.id,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          status: 'DRAFT',
        },
      });

      await request(viewerApp.getHttpServer())
        .delete(`/api/v1/contracts/${contract.id}`)
        .expect(403);

      await viewerPrisma.contract.deleteMany({ where: { tenantId: 'tenant-contracts-rbac2' } });
      await viewerPrisma.company.deleteMany({ where: { tenantId: 'tenant-contracts-rbac2' } });
      await viewerApp.close();
    });
  });

  describe('Workflow operations', () => {
    it('should submit for approval', async () => {
      const contract = await prisma.contract.create({
        data: {
          tenantId: TEST_TENANT,
          contractNumber: 'C-TEST-6',
          name: 'Submit Contract',
          contractType: 'CUSTOMER_RATE',
          customerId,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          status: 'DRAFT',
        },
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/contracts/${contract.id}/submit`)
        .expect(201);
      expect(res.body.data.status).toBe('PENDING_APPROVAL');
    });

    it('should approve contract', async () => {
      const contract = await prisma.contract.create({
        data: {
          tenantId: TEST_TENANT,
          contractNumber: 'C-TEST-7',
          name: 'Approve Contract',
          contractType: 'CUSTOMER_RATE',
          customerId,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          status: 'PENDING_APPROVAL',
        },
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/contracts/${contract.id}/approve`)
        .expect(201);
      expect(res.body.data.status).toBe('APPROVED');
    });

    it('should require manager role for approve', async () => {
      const viewerSetup = await createTestAppWithRole('tenant-contracts-approve2', 'user-contracts-viewer3', 'viewer3@contracts.test', 'viewer');
      const viewerApp = viewerSetup.app;
      const viewerPrisma = viewerSetup.prisma;

      const customer = await viewerPrisma.company.create({
        data: {
          tenantId: 'tenant-contracts-approve2',
          name: 'RBAC Customer 3',
          companyType: 'CUSTOMER',
        },
      });

      const contract = await viewerPrisma.contract.create({
        data: {
          tenantId: 'tenant-contracts-approve2',
          contractNumber: 'C-TEST-9',
          name: 'Approve Contract RBAC 2',
          contractType: 'CUSTOMER_RATE',
          customerId: customer.id,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          status: 'PENDING_APPROVAL',
        },
      });

      await request(viewerApp.getHttpServer())
        .post(`/api/v1/contracts/${contract.id}/approve`)
        .expect(403);

      await viewerPrisma.contract.deleteMany({ where: { tenantId: 'tenant-contracts-approve2' } });
      await viewerPrisma.company.deleteMany({ where: { tenantId: 'tenant-contracts-approve2' } });
      await viewerApp.close();
    });

    it('should reject with reason', async () => {
      const contract = await prisma.contract.create({
        data: {
          tenantId: TEST_TENANT,
          contractNumber: 'C-TEST-10',
          name: 'Reject Contract',
          contractType: 'CUSTOMER_RATE',
          customerId,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          status: 'PENDING_APPROVAL',
        },
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/contracts/${contract.id}/reject`)
        .send({ reason: 'Needs changes' })
        .expect(201);
      expect(res.body.data.status).toBe('DRAFT');
    });
  });

  describe('Contract Templates', () => {
    it('should list templates', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/contract-templates')
        .expect(200);
    });

    it('should create from template', async () => {
      const adminSetup = await createTestAppWithRole('tenant-contracts-template', 'user-contracts-admin', 'admin@contracts.test', 'admin');
      const adminApp = adminSetup.app;
      const adminPrisma = adminSetup.prisma;

      const res = await request(adminApp.getHttpServer())
        .post('/api/v1/contract-templates')
        .send({
          templateName: 'Standard Template',
          contractType: 'CUSTOMER_RATE',
          templateContent: '<p>Standard terms</p>',
          isActive: true,
        })
        .expect(201);

      await request(adminApp.getHttpServer())
        .post(`/api/v1/contract-templates/${res.body.data.id}/clone`)
        .expect(201);

      await adminPrisma.contractTemplate.deleteMany({ where: { tenantId: 'tenant-contracts-template' } });
      await adminPrisma.company.deleteMany({ where: { tenantId: 'tenant-contracts-template' } });
      await adminApp.close();
    });
  });

  describe('Contract Rates', () => {
    it('should list rates for contract', async () => {
      const contract = await prisma.contract.create({
        data: {
          tenantId: TEST_TENANT,
          contractNumber: 'C-TEST-11',
          name: 'Rate Contract',
          contractType: 'CUSTOMER_RATE',
          customerId,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          status: 'DRAFT',
        },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/contracts/${contract.id}/rate-tables`)
        .expect(200);
    });

    it('should add rate to contract', async () => {
      const contract = await prisma.contract.create({
        data: {
          tenantId: TEST_TENANT,
          contractNumber: 'C-TEST-12',
          name: 'Rate Table Contract',
          contractType: 'CUSTOMER_RATE',
          customerId,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          status: 'DRAFT',
        },
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/contracts/${contract.id}/rate-tables`)
        .send({
          tableName: 'Base Rates',
          effectiveDate: new Date().toISOString(),
          isActive: true,
        })
        .expect(201);

      await request(app.getHttpServer())
        .get(`/api/v1/rate-tables/${res.body.data.id}`)
        .expect(200);
    });

    it('should restrict rate table creation to sales managers', async () => {
      const setup = await createTestAppWithRole('tenant-contracts-rbac3', 'user-sales-rep', 'sales.rep@contracts.test', 'SALES_REP');
      const rbacApp = setup.app;
      const rbacPrisma = setup.prisma;

      const customer = await rbacPrisma.company.create({
        data: {
          tenantId: 'tenant-contracts-rbac3',
          name: 'RBAC Customer 3',
          companyType: 'CUSTOMER',
        },
      });

      const contract = await rbacPrisma.contract.create({
        data: {
          tenantId: 'tenant-contracts-rbac3',
          contractNumber: 'C-TEST-RBAC-1',
          name: 'RBAC Contract 3',
          contractType: 'CUSTOMER_RATE',
          customerId: customer.id,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          status: 'DRAFT',
        },
      });

      await request(rbacApp.getHttpServer())
        .post(`/api/v1/contracts/${contract.id}/rate-tables`)
        .send({
          tableName: 'RBAC Rates',
          effectiveDate: new Date().toISOString(),
          isActive: true,
        })
        .expect(403);

      await rbacPrisma.contractRateTable.deleteMany({ where: { tenantId: 'tenant-contracts-rbac3' } });
      await rbacPrisma.contract.deleteMany({ where: { tenantId: 'tenant-contracts-rbac3' } });
      await rbacPrisma.company.deleteMany({ where: { tenantId: 'tenant-contracts-rbac3' } });
      await rbacApp.close();
    });
  });
});
