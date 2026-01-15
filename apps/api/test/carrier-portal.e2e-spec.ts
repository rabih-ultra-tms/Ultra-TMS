import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

const TEST_TENANT = 'tenant-carrier-portal';
const CARRIER_ID = 'carrier-portal-test';
const PORTAL_USER_EMAIL = 'carrier@test.com';
const PORTAL_USER_PASSWORD = 'password123';

describe('Carrier Portal API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    process.env.CARRIER_PORTAL_JWT_SECRET = process.env.CARRIER_PORTAL_JWT_SECRET || 'carrier-portal-secret';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.carrierPortalSession.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrierPortalUser.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrier.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.company.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.tenant.deleteMany({ where: { id: TEST_TENANT } });

    await prisma.tenant.create({
      data: { id: TEST_TENANT, slug: TEST_TENANT, name: 'Carrier Portal Tenant' },
    });

    await prisma.company.create({
      data: {
        id: CARRIER_ID,
        tenantId: TEST_TENANT,
        name: 'Carrier Portal Company',
        companyType: 'CARRIER',
      },
    });

    await prisma.carrier.create({
      data: {
        id: CARRIER_ID,
        tenantId: TEST_TENANT,
        legalName: 'Carrier Portal Carrier',
        equipmentTypes: ['VAN'],
        serviceStates: ['TX'],
        status: 'ACTIVE',
      },
    });

    await prisma.carrierPortalUser.create({
      data: {
        id: 'carrier-portal-user-1',
        tenantId: TEST_TENANT,
        carrierId: CARRIER_ID,
        email: PORTAL_USER_EMAIL,
        password: PORTAL_USER_PASSWORD,
        firstName: 'Carrier',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/carrier-portal/auth/login')
      .send({ email: PORTAL_USER_EMAIL, password: PORTAL_USER_PASSWORD })
      .expect(201);

    accessToken = loginRes.body.data.accessToken;
    refreshToken = loginRes.body.data.refreshToken;
  });

  afterAll(async () => {
    await prisma.carrierPortalSession.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrierPortalUser.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrier.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.company.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.tenant.deleteMany({ where: { id: TEST_TENANT } });
    await app.close();
  });

  it('handles authentication flows', async () => {
    const refresh = await request(app.getHttpServer())
      .post('/api/v1/carrier-portal/auth/refresh')
      .send({ refreshToken })
      .expect(201);
    expect(refresh.body.data.accessToken).toBeDefined();

    const forgot = await request(app.getHttpServer())
      .post('/api/v1/carrier-portal/auth/forgot-password')
      .send({ email: PORTAL_USER_EMAIL })
      .expect(201);
    expect(forgot.body.data.token).toBeDefined();

    await request(app.getHttpServer())
      .post('/api/v1/carrier-portal/auth/reset-password')
      .send({ token: forgot.body.data.token, newPassword: 'newpassword123' })
      .expect(201);

    const relogin = await request(app.getHttpServer())
      .post('/api/v1/carrier-portal/auth/login')
      .send({ email: PORTAL_USER_EMAIL, password: 'newpassword123' })
      .expect(201);

    accessToken = relogin.body.data.accessToken;
    refreshToken = relogin.body.data.refreshToken;

    await request(app.getHttpServer())
      .post('/api/v1/carrier-portal/auth/logout')
      .send({ refreshToken })
      .expect(201);
  });

  it('returns carrier profile and users', async () => {
    const profile = await request(app.getHttpServer())
      .get('/api/v1/carrier-portal/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(profile.body.data.email).toBe(PORTAL_USER_EMAIL);

    const carrier = await request(app.getHttpServer())
      .get('/api/v1/carrier-portal/carrier')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(carrier.body.data.id).toBe(CARRIER_ID);

    const users = await request(app.getHttpServer())
      .get('/api/v1/carrier-portal/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(users.body.data.length).toBeGreaterThan(0);
  });

  it('supports user invite and update', async () => {
    const invite = await request(app.getHttpServer())
      .post('/api/v1/carrier-portal/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'newcarrier@test.com', firstName: 'New', lastName: 'User', role: 'DISPATCHER', permissions: ['VIEW_LOADS'] })
      .expect(201);

    const invitedId = invite.body.data.id;

    await request(app.getHttpServer())
      .put(`/api/v1/carrier-portal/users/${invitedId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ role: 'ADMIN', permissions: ['VIEW_LOADS', 'BID_LOADS'] })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/carrier-portal/users/${invitedId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('lists loads endpoints', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/carrier-portal/loads')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/carrier-portal/loads/available')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
