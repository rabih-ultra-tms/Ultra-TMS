import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma.service';
import { createTestAppWithRole } from './helpers/test-app.helper';

const TEST_TENANT = 'tenant-carrier';
const OTHER_TENANT = 'tenant-other';
const TEST_USER = {
  id: 'user-carrier',
  email: 'user@carrier.test',
  tenantId: TEST_TENANT,
  roles: ['ADMIN'],
  role: 'ADMIN',
  roleName: 'ADMIN',
};

describe('Carrier API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createTestAppWithRole(
      TEST_TENANT,
      TEST_USER.id,
      TEST_USER.email,
      'ADMIN',
    );
    app = setup.app;
    prisma = setup.prisma;

    await prisma.tenant.upsert({
      where: { slug: TEST_TENANT },
      update: { name: 'Carrier Tenant' },
      create: { id: TEST_TENANT, slug: TEST_TENANT, name: 'Carrier Tenant' },
    });
    await prisma.tenant.upsert({
      where: { slug: OTHER_TENANT },
      update: { name: 'Other Tenant' },
      create: { id: OTHER_TENANT, slug: OTHER_TENANT, name: 'Other Tenant' },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.driver.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrierDocument.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.insuranceCertificate.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrier.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrier.deleteMany({ where: { tenantId: OTHER_TENANT } });
  });

  it('creates carrier with contact/insurance and approves after documents', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/carriers')
      .send({
        dotNumber: 'DOT123456',
        mcNumber: 'MC123456',
        name: 'Acme Logistics',
        address1: '123 Main',
        city: 'Austin',
        state: 'TX',
        postalCode: '73301',
        phone: '555-111-2222',
        email: 'dispatch@acme.com',
        contacts: [
          {
            firstName: 'Alice',
            lastName: 'Smith',
            role: 'DISPATCH',
            email: 'alice@acme.com',
            isPrimary: true,
          },
        ],
        insurance: [
          {
            type: 'AUTO_LIABILITY',
            insuranceCompany: 'Carrier Ins',
            policyNumber: 'POL123',
            coverageAmount: 1000000,
            effectiveDate: new Date().toISOString(),
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            type: 'CARGO',
            insuranceCompany: 'Cargo Ins',
            policyNumber: 'POL124',
            coverageAmount: 100000,
            effectiveDate: new Date().toISOString(),
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      })
      .expect(201);

    const carrierId = createRes.body.data.id;

    const w9Doc = await request(app.getHttpServer())
      .post(`/api/v1/carriers/${carrierId}/documents`)
      .send({ documentType: 'W9', name: 'W9.pdf' })
      .expect(201);

    const agreementDoc = await request(app.getHttpServer())
      .post(`/api/v1/carriers/${carrierId}/documents`)
      .send({ documentType: 'CARRIER_AGREEMENT', name: 'agreement.pdf' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/carriers/${carrierId}/documents/${w9Doc.body.data.id}/approve`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/carriers/${carrierId}/documents/${agreementDoc.body.data.id}/approve`)
      .expect(201);

    const approveRes = await request(app.getHttpServer())
      .post(`/api/v1/carriers/${carrierId}/approve`)
      .send()
      .expect(200);

    expect(approveRes.body.data.status).toBe('ACTIVE');
  });

  it('provides FMCSA lookup and onboarding flow', async () => {
    const lookupRes = await request(app.getHttpServer())
      .get('/api/v1/carriers/fmcsa/lookup/dot/5551234')
      .expect(200);

    expect(lookupRes.body.data.dotNumber).toBe('5551234');
    expect(lookupRes.body.data.operatingStatus).toBeDefined();

    const onboardRes = await request(app.getHttpServer())
      .post('/api/v1/carriers/onboard')
      .send({
        dotNumber: 'DOTOB12345',
        email: 'onboard@carrier.test',
        phone: '555-999-0000',
        state: 'TX',
      })
      .expect(201);

    expect(onboardRes.body.data.carrier).toBeDefined();
    expect(onboardRes.body.data.fmcsa.dotNumber).toBe('DOTOB12345');
    expect(onboardRes.body.data.existing).toBe(false);
  });

  it('lists only tenant carriers and supports search', async () => {
    const carrier = await prisma.carrier.create({
      data: {
        tenantId: TEST_TENANT,
        legalName: 'Tenant Carrier',
        dotNumber: 'DOT-TENANT',
        status: 'PENDING',
        equipmentTypes: ['VAN'],
      },
    });
    await prisma.carrier.create({
      data: {
        tenantId: OTHER_TENANT,
        legalName: 'Other Carrier',
        dotNumber: 'DOT-OTHER',
        status: 'PENDING',
        equipmentTypes: ['VAN'],
      },
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/carriers')
      .query({ search: 'Tenant' })
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(carrier.id);
  });

  it('returns carrier scorecard metrics', async () => {
    const carrierRes = await request(app.getHttpServer())
      .post('/api/v1/carriers')
      .send({
        dotNumber: 'DOT-SCORE-1',
        mcNumber: 'MC-SCORE-1',
        name: 'Scorecard Carrier',
        address1: '500 Metric Way',
        city: 'Dallas',
        state: 'TX',
        postalCode: '75001',
        phone: '555-444-3333',
        email: 'score@carrier.test',
      })
      .expect(201);

    const scoreRes = await request(app.getHttpServer())
      .get(`/api/v1/carriers/${carrierRes.body.data.id}/scorecard`)
      .expect(200);

    expect(scoreRes.body.data.metrics.totalLoads).toBe(0);
    expect(scoreRes.body.data.carrier.recommendedTier).toBeDefined();
  });

  it('creates driver for carrier and updates status', async () => {
    const carrier = await prisma.carrier.create({
      data: {
        tenantId: TEST_TENANT,
        legalName: 'Driver Carrier',
        dotNumber: 'DOT-DRIVER',
        status: 'ACTIVE',
        equipmentTypes: ['VAN'],
      },
    });

    const driverRes = await request(app.getHttpServer())
      .post(`/api/v1/carriers/${carrier.id}/drivers`)
      .send({
        firstName: 'Bob',
        lastName: 'Driver',
        licenseNumber: 'CDL123',
        licenseState: 'TX',
        cdlClass: 'A',
      })
      .expect(201);

    const driverId = driverRes.body.data.id;

    await request(app.getHttpServer())
      .patch(`/api/v1/drivers/${driverId}/status`)
      .send({ status: 'SUSPENDED' })
      .expect(200);

    const getRes = await request(app.getHttpServer())
      .get('/api/v1/drivers')
      .expect(200);

    expect(getRes.body.data.find((d: any) => d.id === driverId)?.status).toBe('SUSPENDED');
  });
});

describe('Carrier RBAC E2E', () => {
  let dispatcherApp: INestApplication;
  let carrierApp: INestApplication;

  beforeAll(async () => {
    const dispatcherSetup = await createTestAppWithRole(
      'tenant-carrier-rbac',
      'user-carrier-dispatcher',
      'dispatcher@carrier.test',
      'DISPATCHER',
    );
    dispatcherApp = dispatcherSetup.app;

    const carrierSetup = await createTestAppWithRole(
      'tenant-carrier-rbac',
      'user-carrier-external',
      'carrier@carrier.test',
      'CARRIER',
    );
    carrierApp = carrierSetup.app;
  });

  afterAll(async () => {
    await dispatcherApp.close();
    await carrierApp.close();
  });

  it('denies carrier access to carriers list', async () => {
    await request(carrierApp.getHttpServer())
      .get('/api/v1/carriers')
      .expect(403);
  });

  it('allows dispatcher access to carriers list', async () => {
    await request(dispatcherApp.getHttpServer())
      .get('/api/v1/carriers')
      .expect(200);
  });
});
