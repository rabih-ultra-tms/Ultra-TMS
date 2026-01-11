import request from 'supertest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CSABasicType, InsuranceType, SafetyAlertType, SafetyIncidentType } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

const TEST_TENANT = 'tenant-safety';
const TEST_USER = { id: 'user-safety', email: 'user@safety.test', tenantId: TEST_TENANT, roles: ['admin'] };

describe('Safety Service API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let carrier: { id: string; dotNumber?: string | null };
  let driver: { id: string };

  beforeAll(async () => {
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
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.tenant.upsert({
      where: { slug: TEST_TENANT },
      update: { name: 'Safety Tenant' },
      create: { id: TEST_TENANT, slug: TEST_TENANT, name: 'Safety Tenant' },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.safetyAuditTrail.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.safetyAlert.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrierWatchlist.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.safetyIncident.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.driverQualificationFile.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrierInsurance.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.csaScore.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.fmcsaCarrierRecord.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.driver.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrier.deleteMany({ where: { tenantId: TEST_TENANT } });

    carrier = await prisma.carrier.create({
      data: {
        tenantId: TEST_TENANT,
        legalName: 'Safety Carrier',
        dbaName: 'Safety DBA',
        dotNumber: `DOT-${Date.now()}`,
        mcNumber: `MC-${Date.now()}`,
        equipmentTypes: [],
        serviceStates: [],
      },
    });

    driver = await prisma.driver.create({
      data: {
        tenantId: TEST_TENANT,
        carrierId: carrier.id,
        firstName: 'Safe',
        lastName: 'Driver',
        endorsements: [],
      },
    });
  });

  describe('FMCSA Lookup', () => {
    it('should lookup by DOT, verify authority, and refresh data', async () => {
      const lookupRes = await request(app.getHttpServer())
        .get('/api/v1/safety/fmcsa/lookup')
        .query({ dotNumber: carrier.dotNumber })
        .expect(200);

      expect(lookupRes.body.carrierId).toBe(carrier.id);
      expect(lookupRes.body.dotNumber).toBe(carrier.dotNumber);

      const verifyRes = await request(app.getHttpServer())
        .post(`/api/v1/safety/fmcsa/verify/${carrier.id}`)
        .expect(201);

      expect(verifyRes.body.operatingStatus).toBe('ACTIVE');

      const refreshRes = await request(app.getHttpServer())
        .post(`/api/v1/safety/fmcsa/refresh/${carrier.id}`)
        .expect(201);

      expect(new Date(refreshRes.body.lastSyncedAt).getTime()).toBeGreaterThan(0);
    });
  });

  describe('CSA Scores', () => {
    it('should refresh scores, return current, and keep history', async () => {
      await request(app.getHttpServer()).post(`/api/v1/safety/csa/${carrier.id}/refresh`).expect(201);

      const current = await request(app.getHttpServer())
        .get(`/api/v1/safety/csa/${carrier.id}`)
        .expect(200);

      expect(current.body.length).toBe(7);
      expect(current.body.some((s: any) => s.isAlert === true)).toBe(true);

      const history = await request(app.getHttpServer())
        .get(`/api/v1/safety/csa/${carrier.id}/history`)
        .expect(200);

      expect(history.body.length).toBe(7);
    });
  });

  describe('Insurance', () => {
    it('should create, verify, enforce coverage, and detect expiring insurance', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/safety/insurance')
        .send({
          carrierId: carrier.id,
          insuranceType: InsuranceType.AUTO_LIABILITY,
          policyNumber: 'P-123',
          carrierName: 'Safe Insurance Co',
          coverageAmount: 1_500_000,
          effectiveDate: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      const verifyRes = await request(app.getHttpServer())
        .post(`/api/v1/safety/insurance/${createRes.body.id}/verify`)
        .expect(201);
      expect(verifyRes.body.isVerified).toBe(true);

      await request(app.getHttpServer())
        .post('/api/v1/safety/insurance')
        .send({
          carrierId: carrier.id,
          insuranceType: InsuranceType.CARGO,
          policyNumber: 'P-200',
          carrierName: 'Cargo Ins Co',
          coverageAmount: 50_000,
          effectiveDate: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/api/v1/safety/insurance')
        .send({
          carrierId: carrier.id,
          insuranceType: InsuranceType.CARGO,
          policyNumber: 'P-201',
          carrierName: 'Cargo Ins Co',
          coverageAmount: 150_000,
          effectiveDate: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      const expiring = await request(app.getHttpServer())
        .get('/api/v1/safety/insurance/expiring?days=15')
        .expect(200);

      expect(expiring.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Driver Qualification Files', () => {
    it('should create DQF, check compliance, and add documents', async () => {
      const dqfRes = await request(app.getHttpServer())
        .post('/api/v1/safety/dqf')
        .send({
          driverId: driver.id,
          documentType: 'MVR',
          documentNumber: 'MVR-1',
          expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      const compliance = await request(app.getHttpServer())
        .get(`/api/v1/safety/dqf/${dqfRes.body.id}/compliance`)
        .expect(200);
      expect(compliance.body.status).toBe('EXPIRED');
      expect(compliance.body.missingDocuments.length).toBeGreaterThan(0);

      const addDoc = await request(app.getHttpServer())
        .post(`/api/v1/safety/dqf/${dqfRes.body.id}/documents`)
        .send({ documentUrl: 'https://docs.test/dqf.pdf', expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() })
        .expect(201);

      expect(addDoc.body.documentUrl).toContain('dqf.pdf');
    });
  });

  describe('Incidents', () => {
    it('should report incident, close investigation, and return violations', async () => {
      const incidentRes = await request(app.getHttpServer())
        .post('/api/v1/safety/incidents')
        .send({
          carrierId: carrier.id,
          driverId: driver.id,
          incidentType: SafetyIncidentType.INSPECTION_VIOLATION,
          incidentDate: new Date().toISOString(),
          description: 'Inspection violation',
          violationCodes: ['395.3', '395.8'],
          severity: 'MAJOR',
        })
        .expect(201);

      const closeRes = await request(app.getHttpServer())
        .post(`/api/v1/safety/incidents/${incidentRes.body.id}/close`)
        .send({ investigationNotes: 'Closed', resolutionNotes: 'Resolved' })
        .expect(201);

      expect(closeRes.body.customFields).toBeDefined();

      const violations = await request(app.getHttpServer())
        .get(`/api/v1/safety/incidents/${incidentRes.body.id}/violations`)
        .expect(200);
      expect(violations.body.violations.length).toBe(2);
    });
  });

  describe('Watchlist', () => {
    it('should add and resolve watchlist entries', async () => {
      const addRes = await request(app.getHttpServer())
        .post('/api/v1/safety/watchlist')
        .send({ carrierId: carrier.id, reason: 'CSA alert', riskLevel: 'HIGH', isRestricted: true })
        .expect(201);

      expect(addRes.body.isRestricted).toBe(true);

      const resolveRes = await request(app.getHttpServer())
        .post(`/api/v1/safety/watchlist/${addRes.body.id}/resolve`)
        .send({ resolutionNotes: 'Cleared' })
        .expect(201);

      expect(resolveRes.body.isActive).toBe(false);
    });
  });

  describe('Alerts', () => {
    it('should create, acknowledge, dismiss, and resolve alerts', async () => {
      const alertRes = await request(app.getHttpServer())
        .post('/api/v1/safety/alerts')
        .send({
          carrierId: carrier.id,
          alertType: SafetyAlertType.INSURANCE_EXPIRING,
          alertMessage: 'Insurance expiring soon',
          severity: 'WARNING',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/safety/alerts/${alertRes.body.id}/acknowledge`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/safety/alerts/${alertRes.body.id}/dismiss`)
        .expect(201);

      const resolved = await request(app.getHttpServer())
        .post(`/api/v1/safety/alerts/${alertRes.body.id}/resolve`)
        .send({ resolutionNotes: 'Handled' })
        .expect(201);

      expect(resolved.body.isActive).toBe(false);
    });
  });

  describe('Safety Scores', () => {
    it('should calculate score, fetch current score, and return history', async () => {
      const calcRes = await request(app.getHttpServer())
        .post('/api/v1/safety/scores/calculate')
        .send({ carrierId: carrier.id })
        .expect(201);

      expect(calcRes.body.overallScore).toBeGreaterThan(0);
      expect(calcRes.body.riskLevel).toBeDefined();

      const current = await request(app.getHttpServer())
        .get(`/api/v1/safety/scores/${carrier.id}`)
        .expect(200);
      expect(current.body.overallScore).toBe(calcRes.body.overallScore);

      const history = await request(app.getHttpServer())
        .get(`/api/v1/safety/scores/${carrier.id}/history`)
        .expect(200);
      expect(history.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Reports', () => {
    it('should return compliance, incident, and expiring reports', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/safety/watchlist')
        .send({ carrierId: carrier.id, reason: 'Test', riskLevel: 'LOW' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/safety/incidents')
        .send({
          carrierId: carrier.id,
          incidentType: SafetyIncidentType.ACCIDENT,
          incidentDate: new Date().toISOString(),
          description: 'Minor accident',
        })
        .expect(201);

      const compliance = await request(app.getHttpServer())
        .get('/api/v1/safety/reports/compliance')
        .expect(200);
      expect(compliance.body).toHaveProperty('watchlistActive');

      const incidentsReport = await request(app.getHttpServer())
        .get('/api/v1/safety/reports/incidents')
        .expect(200);
      expect(incidentsReport.body.total).toBeGreaterThanOrEqual(1);

      const expiring = await request(app.getHttpServer())
        .get('/api/v1/safety/reports/expiring')
        .expect(200);
      expect(expiring.body).toHaveProperty('insurance');
    });
  });
});
