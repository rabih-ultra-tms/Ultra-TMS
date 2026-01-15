import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

const TEST_TENANT = 'tenant-portal';
const COMPANY_ID = 'company-portal';
const PORTAL_USER_EMAIL = 'portal@test.com';
const PORTAL_USER_PASSWORD = 'password123';

describe('Customer Portal API', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;
  let loadId: string;
  let invoiceId: string;

  beforeAll(async () => {
    process.env.CUSTOMER_PORTAL_JWT_SECRET = process.env.CUSTOMER_PORTAL_JWT_SECRET || 'portal-secret';
    process.env.PORTAL_JWT_SECRET = process.env.PORTAL_JWT_SECRET || 'portal-secret';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.tenant.upsert({
      where: { slug: TEST_TENANT },
      update: { name: 'Portal Tenant' },
      create: { id: TEST_TENANT, slug: TEST_TENANT, name: 'Portal Tenant' },
    });

    await prisma.company.upsert({
      where: { id: COMPANY_ID },
      update: { name: 'Portal Customer' },
      create: {
        id: COMPANY_ID,
        tenantId: TEST_TENANT,
        name: 'Portal Customer',
        companyType: 'CUSTOMER',
      },
    });

    const portalUser = await prisma.portalUser.upsert({
      where: { id: 'portal-user-1' },
      update: { password: PORTAL_USER_PASSWORD },
      create: {
        id: 'portal-user-1',
        tenantId: TEST_TENANT,
        companyId: COMPANY_ID,
        email: PORTAL_USER_EMAIL,
        password: PORTAL_USER_PASSWORD,
        firstName: 'Portal',
        lastName: 'User',
        status: 'ACTIVE',
      },
    });

    await prisma.portalUser.deleteMany({ where: { tenantId: TEST_TENANT, email: 'newuser@test.com' } });

    // Clean test fixtures to keep reruns idempotent
    await prisma.statusHistory.deleteMany({ where: { tenantId: TEST_TENANT, loadId: { in: (await prisma.load.findMany({ where: { tenantId: TEST_TENANT, loadNumber: 'LOAD-PORTAL-1' }, select: { id: true } })).map((l) => l.id) } } });
    await prisma.load.deleteMany({ where: { tenantId: TEST_TENANT, loadNumber: 'LOAD-PORTAL-1' } });
    await prisma.order.deleteMany({ where: { tenantId: TEST_TENANT, orderNumber: 'ORD-PORTAL-1' } });
    await prisma.invoice.deleteMany({ where: { tenantId: TEST_TENANT, invoiceNumber: 'INV-PORTAL-1' } });

    const order = await prisma.order.create({
      data: {
        tenantId: TEST_TENANT,
        orderNumber: 'ORD-PORTAL-1',
        customerId: COMPANY_ID,
        status: 'DISPATCHED',
        orderDate: new Date(),
      },
    });

    const load = await prisma.load.create({
      data: {
        tenantId: TEST_TENANT,
        loadNumber: 'LOAD-PORTAL-1',
        orderId: order.id,
        status: 'IN_TRANSIT',
        currentCity: 'Dallas',
        currentState: 'TX',
        currentLocationLat: 32.7767,
        currentLocationLng: -96.797,
        eta: new Date(Date.now() + 1000 * 60 * 60 * 12),
      },
    });

    loadId = load.id;

    await prisma.statusHistory.create({
      data: {
        tenantId: TEST_TENANT,
        entityType: 'LOAD',
        entityId: load.id,
        newStatus: 'IN_TRANSIT',
        createdAt: new Date(),
        loadId: load.id,
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: TEST_TENANT,
        companyId: COMPANY_ID,
        invoiceNumber: 'INV-PORTAL-1',
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        subtotal: 500,
        taxAmount: 0,
        totalAmount: 500,
        amountPaid: 0,
        balanceDue: 500,
        status: 'SENT',
      },
    });

    invoiceId = invoice.id;

    // Authenticate once to obtain tokens for subsequent tests
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/portal/auth/login')
      .send({ email: PORTAL_USER_EMAIL, password: PORTAL_USER_PASSWORD })
      .expect(201);

    accessToken = loginRes.body.data.accessToken;
    refreshToken = loginRes.body.data.refreshToken;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    // Mark user on request object for convenience in tests that bypass guard
    await prisma.portalActivityLog.create({
      data: {
        tenantId: TEST_TENANT,
        userId: portalUser.id,
        companyId: COMPANY_ID,
        action: 'LOGIN',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('handles authentication flows', async () => {
    const refreshRes = await request(app.getHttpServer())
      .post('/api/v1/portal/auth/refresh')
      .send({ refreshToken })
      .expect(201);
    expect(refreshRes.body.data.accessToken).toBeDefined();

    const forgot = await request(app.getHttpServer())
      .post('/api/v1/portal/auth/forgot-password')
      .send({ email: PORTAL_USER_EMAIL })
      .expect(201);

    const token = forgot.body.data.token;
    expect(token).toBeDefined();

    await request(app.getHttpServer())
      .post('/api/v1/portal/auth/reset-password')
      .send({ token, newPassword: 'newpassword123' })
      .expect(201);

    const relogin = await request(app.getHttpServer())
      .post('/api/v1/portal/auth/login')
      .send({ email: PORTAL_USER_EMAIL, password: 'newpassword123' })
      .expect(201);
    expect(relogin.body.data.accessToken).toBeDefined();

    await request(app.getHttpServer())
      .post('/api/v1/portal/auth/logout')
      .set('Authorization', `Bearer ${relogin.body.data.accessToken}`)
      .send({ refreshToken: relogin.body.data.refreshToken })
      .expect(201);

    accessToken = relogin.body.data.accessToken;
    refreshToken = relogin.body.data.refreshToken;
  });

  it('supports quote requests and workflows', async () => {
    // Submit quote
    const submitRes = await request(app.getHttpServer())
      .post('/api/v1/portal/quotes/request')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        originCity: 'Austin',
        originState: 'TX',
        destCity: 'Houston',
        destState: 'TX',
        pickupDate: new Date().toISOString(),
        equipmentType: 'VAN',
      })
      .expect(201);

    const quoteId = submitRes.body.data.id;
    expect(submitRes.body.data.status).toBe('SUBMITTED');

    // Estimate
    const estimate = await request(app.getHttpServer())
      .post('/api/v1/portal/quotes/estimate')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ originCity: 'Austin', destCity: 'Houston', miles: 150 })
      .expect(201);
    expect(estimate.body.data.estimatedRate).toBeGreaterThan(0);

    // Accept
    const acceptRes = await request(app.getHttpServer())
      .post(`/api/v1/portal/quotes/${quoteId}/accept`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(201);
    expect(acceptRes.body.data.status).toBe('ACCEPTED');

    // Second quote for revision/decline
    const submitRes2 = await request(app.getHttpServer())
      .post('/api/v1/portal/quotes/request')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        originCity: 'Dallas',
        originState: 'TX',
        destCity: 'San Antonio',
        destState: 'TX',
        pickupDate: new Date().toISOString(),
        equipmentType: 'REEFER',
      })
      .expect(201);

    const quoteId2 = submitRes2.body.data.id;

    const revision = await request(app.getHttpServer())
      .post(`/api/v1/portal/quotes/${quoteId2}/revision`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ request: 'Need weekend pickup' })
      .expect(201);
    expect(revision.body.data.status).toBe('REVIEWING');

    const decline = await request(app.getHttpServer())
      .post(`/api/v1/portal/quotes/${quoteId2}/decline`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: 'Decided to wait' })
      .expect(201);
    expect(decline.body.data.status).toBe('DECLINED');
  });

  it('returns shipment tracking and events', async () => {
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/portal/shipments')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    const tracking = await request(app.getHttpServer())
      .get(`/api/v1/portal/shipments/${loadId}/tracking`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(tracking.body.data.status).toBeDefined();

    const events = await request(app.getHttpServer())
      .get(`/api/v1/portal/shipments/${loadId}/events`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(events.body.data.length).toBeGreaterThanOrEqual(1);

    const docs = await request(app.getHttpServer())
      .get(`/api/v1/portal/shipments/${loadId}/documents`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(docs.body.data)).toBe(true);

    await request(app.getHttpServer())
      .post(`/api/v1/portal/shipments/${loadId}/contact`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ message: 'Please confirm delivery ETA' })
      .expect(201);
  });

  it('handles invoices and payments', async () => {
    const invoices = await request(app.getHttpServer())
      .get('/api/v1/portal/invoices')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(invoices.body.data.some((i: any) => i.id === invoiceId)).toBe(true);

    const paymentRes = await request(app.getHttpServer())
      .post('/api/v1/portal/payments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: 100,
        paymentMethod: 'CARD',
        invoices: [{ invoiceId, amount: 100 }],
        paymentToken: 'tok_visa_1234',
        savePaymentMethod: true,
      })
      .expect(201);

    expect(paymentRes.body.data.paymentNumber).toBeDefined();

    const updatedInvoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    expect(Number(updatedInvoice?.amountPaid)).toBe(100);

    const history = await request(app.getHttpServer())
      .get('/api/v1/portal/payments')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(history.body.data.length).toBeGreaterThan(0);
  });

  it('supports account management', async () => {
    const profile = await request(app.getHttpServer())
      .put('/api/v1/portal/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Updated', phone: '1234567890' })
      .expect(200);
    expect(profile.body.data.firstName).toBe('Updated');

    const invite = await request(app.getHttpServer())
      .post('/api/v1/portal/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        role: 'USER',
        permissions: ['VIEW_SHIPMENTS'],
      })
      .expect(201);
    const invitedId = invite.body.data.id;
    expect(invite.body.data.invitationToken).toBeDefined();

    await request(app.getHttpServer())
      .put(`/api/v1/portal/users/${invitedId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ role: 'ADMIN' })
      .expect(200);

    const deactivate = await request(app.getHttpServer())
      .delete(`/api/v1/portal/users/${invitedId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(deactivate.body.data.status).toBe('DEACTIVATED');
  });
});