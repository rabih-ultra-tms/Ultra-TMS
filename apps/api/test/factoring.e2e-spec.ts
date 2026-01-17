import request from 'supertest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { FactoringStatus, NoaStatus, VerificationStatusEnum } from '../src/modules/factoring/dto/enums';
import { createTestAppWithRole, getTestPrisma } from './helpers/test-app.helper';

const TEST_TENANT = 'tenant-factoring';
const TEST_USER = {
  id: 'user-factoring',
  email: 'user@factoring.test',
  tenantId: TEST_TENANT,
  roleName: 'SUPER_ADMIN',
  role: { name: 'SUPER_ADMIN', permissions: [] },
  roles: ['SUPER_ADMIN'],
};

describe('Factoring API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const sharedPrisma = await getTestPrisma();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = TEST_USER;
          req.headers['x-tenant-id'] = TEST_TENANT;
          return true;
        },
      })
      .overrideProvider(PrismaService)
      .useValue(sharedPrisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.use((req, _res, next) => {
      req.user = TEST_USER;
      req.headers['x-tenant-id'] = TEST_TENANT;
      req.tenantId = TEST_TENANT;
      next();
    });
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.tenant.upsert({
      where: { slug: TEST_TENANT },
      update: { name: 'Factoring Tenant' },
      create: { id: TEST_TENANT, slug: TEST_TENANT, name: 'Factoring Tenant' },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.factoredPayment.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.factoringVerification.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.nOARecord.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrierFactoringStatus.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.settlement.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.factoringCompany.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrier.deleteMany({ where: { tenantId: TEST_TENANT } });
  });

  const createCarrier = async () => {
    return prisma.carrier.create({
      data: {
        tenantId: TEST_TENANT,
        legalName: 'Test Carrier',
        status: 'ACTIVE',
        equipmentTypes: ['VAN'],
        serviceStates: [],
      },
    });
  };

  const createFactoringCompany = async () => {
    return prisma.factoringCompany.create({
      data: {
        tenantId: TEST_TENANT,
        companyCode: 'FC-001',
        name: 'Prime Factors',
        verificationMethod: 'EMAIL',
        verificationSLAHours: 12,
        status: 'ACTIVE',
      },
    });
  };

  const createNoa = async (carrierId: string, factoringCompanyId: string) => {
    return prisma.nOARecord.create({
      data: {
        tenantId: TEST_TENANT,
        carrierId,
        factoringCompanyId,
        noaNumber: `NOA-${Date.now()}`,
        receivedDate: new Date(),
        effectiveDate: new Date(),
        status: NoaStatus.PENDING,
      },
    });
  };

  it('manages factoring companies and status toggles', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/factoring-companies')
      .send({ companyCode: 'FC-ABC', name: 'Acme Factors', verificationMethod: 'EMAIL' })
      .expect(201);

    const companyId = createRes.body.data.id;
    expect(createRes.body.data.status).toBe('ACTIVE');

    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/factoring-companies/${companyId}`)
      .send({ address: '123 Money St', verificationSLAHours: 8 })
      .expect(200);

    expect(updateRes.body.data.address).toBe('123 Money St');

    const toggleRes = await request(app.getHttpServer())
      .patch(`/api/v1/factoring-companies/${companyId}/status`)
      .send({ status: 'INACTIVE' })
      .expect(200);

    expect(toggleRes.body.data.status).toBe('INACTIVE');
  });

  it('restricts factoring company creation to managers', async () => {
    const accountingSetup = await createTestAppWithRole('tenant-factoring-rbac', 'user-accounting', 'accounting@factoring.test', 'ACCOUNTING');
    const accountingApp = accountingSetup.app;

    await request(accountingApp.getHttpServer())
      .post('/api/v1/factoring-companies')
      .send({ companyCode: 'FC-RBAC', name: 'RBAC Factors', verificationMethod: 'EMAIL' })
      .expect(403);

    await accountingApp.close();

    const managerSetup = await createTestAppWithRole('tenant-factoring-rbac', 'user-factoring-manager', 'manager@factoring.test', 'FACTORING_MANAGER');
    const managerApp = managerSetup.app;

    await request(managerApp.getHttpServer())
      .post('/api/v1/factoring-companies')
      .send({ companyCode: 'FC-RBAC-2', name: 'RBAC Factors 2', verificationMethod: 'EMAIL' })
      .expect(201);

    await managerSetup.prisma.factoringCompany.deleteMany({ where: { tenantId: 'tenant-factoring-rbac' } });
    await managerApp.close();
  });

  it('runs NOA lifecycle: create, verify, release, auto-expire', async () => {
    const carrier = await createCarrier();
    const company = await createFactoringCompany();

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/noa-records')
      .send({
        carrierId: carrier.id,
        factoringCompanyId: company.id,
        receivedDate: new Date().toISOString(),
        effectiveDate: new Date().toISOString(),
      })
      .expect(201);

    const noaId = createRes.body.data.id;

    const verifyRes = await request(app.getHttpServer())
      .post(`/api/v1/noa-records/${noaId}/verify`)
      .send({ verificationMethod: 'EMAIL', verificationNotes: 'Confirmed by email' })
      .expect(201);

    expect(verifyRes.body.data.status).toBe(NoaStatus.VERIFIED);

    const releaseRes = await request(app.getHttpServer())
      .post(`/api/v1/noa-records/${noaId}/release`)
      .send({ releaseReason: 'Completed engagement' })
      .expect(201);

    expect(releaseRes.body.data.status).toBe(NoaStatus.RELEASED);

    const expiredRes = await request(app.getHttpServer())
      .post('/api/v1/noa-records')
      .send({
        carrierId: carrier.id,
        factoringCompanyId: company.id,
        receivedDate: new Date().toISOString(),
        effectiveDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      })
      .expect(201);

    const getExpired = await request(app.getHttpServer())
      .get(`/api/v1/noa-records/${expiredRes.body.data.id}`)
      .expect(200);

    expect(getExpired.body.data.status).toBe(NoaStatus.EXPIRED);
  });

  it('updates carrier factoring status, quick pay, and overrides', async () => {
    const carrier = await createCarrier();
    const company = await createFactoringCompany();

    const initialStatus = await request(app.getHttpServer())
      .get(`/api/v1/carriers/${carrier.id}/factoring-status`)
      .expect(200);

    expect(initialStatus.body.data.factoringStatus).toBe(FactoringStatus.NONE);

    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/carriers/${carrier.id}/factoring-status`)
      .send({ factoringStatus: FactoringStatus.FACTORED, factoringCompanyId: company.id })
      .expect(200);

    expect(updateRes.body.data.factoringCompanyId).toBe(company.id);

    const quickPayRes = await request(app.getHttpServer())
      .post(`/api/v1/carriers/${carrier.id}/quick-pay/enroll`)
      .send({ quickPayFeePercent: 0.03 })
      .expect(201);

    expect(quickPayRes.body.data.quickPayEnabled).toBe(true);

    const overrideRes = await request(app.getHttpServer())
      .post(`/api/v1/carriers/${carrier.id}/factoring/override`)
      .send({ factoringCompanyId: company.id, overrideReason: 'Manual override' })
      .expect(201);

    expect(overrideRes.body.data.customFields.overrideReason).toBeDefined();
  });

  it('handles verification workflow with load lookup', async () => {
    const carrier = await createCarrier();
    const company = await createFactoringCompany();
    const noa = await createNoa(carrier.id, company.id);

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/factoring-verifications')
      .send({
        noaRecordId: noa.id,
        verificationDate: new Date().toISOString(),
        verificationMethod: 'EMAIL',
        loadId: 'LOAD-123',
      })
      .expect(201);

    const verificationId = createRes.body.data.id;

    await request(app.getHttpServer())
      .post(`/api/v1/factoring-verifications/${verificationId}/respond`)
      .send({ verificationStatus: VerificationStatusEnum.VERIFIED, notes: 'All good' })
      .expect(201);

    const pending = await request(app.getHttpServer())
      .get('/api/v1/factoring-verifications/pending')
      .expect(200);

    expect(pending.body.data.length).toBe(0);

    const byLoad = await request(app.getHttpServer())
      .get('/api/v1/factoring-verifications/loads/LOAD-123/verification')
      .expect(200);

    expect(byLoad.body.data.id).toBe(verificationId);
  });

  it('processes factored payments and routes to factoring company', async () => {
    const carrier = await createCarrier();
    const company = await createFactoringCompany();

    const settlement = await prisma.settlement.create({
      data: {
        tenantId: TEST_TENANT,
        settlementNumber: 'SET-001',
        carrierId: carrier.id,
        settlementDate: new Date(),
        dueDate: new Date(),
        grossAmount: 1000,
        deductionsTotal: 0,
        quickPayFee: 0,
        netAmount: 1000,
        amountPaid: 0,
        balanceDue: 1000,
      },
    });

    const payment = await prisma.factoredPayment.create({
      data: {
        tenantId: TEST_TENANT,
        settlementId: settlement.id,
        factoringCompanyId: company.id,
        paymentAmount: 950,
        paymentDate: new Date(),
        paymentMethod: 'ACH',
      },
    });

    const processRes = await request(app.getHttpServer())
      .post(`/api/v1/factored-payments/${payment.id}/process`)
      .send({ notes: 'Paid', status: 'PAID' })
      .expect(201);

    expect(processRes.body.data.customFields.status).toBe('PAID');

    const carrierPayments = await request(app.getHttpServer())
      .get(`/api/v1/carriers/${carrier.id}/factored-payments`)
      .expect(200);

    expect(carrierPayments.body.data.length).toBe(1);

    const companyPayments = await request(app.getHttpServer())
      .get(`/api/v1/factoring-companies/${company.id}/payments`)
      .expect(200);

    expect(companyPayments.body.data.length).toBe(1);
  });
});
