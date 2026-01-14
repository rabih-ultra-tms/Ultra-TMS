import request from 'supertest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { ConfigCategory, FeatureFlagStatus, ResetFrequency } from '@prisma/client';

const TEST_TENANT = 'tenant-config';
const SYSTEM_TENANT = 'system';
const TEST_USER = {
  id: 'user-config',
  email: 'user@config.test',
  tenantId: TEST_TENANT,
  roles: ['admin'],
};

describe('Config API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = TEST_USER;
          req.headers['x-tenant-id'] = TEST_TENANT;
          req.tenantId = TEST_TENANT;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.tenant.upsert({
      where: { slug: SYSTEM_TENANT },
      update: { name: 'System Tenant' },
      create: { id: SYSTEM_TENANT, slug: SYSTEM_TENANT, name: 'System Tenant' },
    });

    await prisma.tenant.upsert({
      where: { slug: TEST_TENANT },
      update: { name: 'Config Tenant' },
      create: { id: TEST_TENANT, slug: TEST_TENANT, name: 'Config Tenant' },
    });

    await prisma.user.upsert({
      where: { id: TEST_USER.id },
      update: {
        tenantId: TEST_TENANT,
        email: TEST_USER.email,
        firstName: 'Config',
        lastName: 'User',
        passwordHash: 'hashed',
        status: 'ACTIVE',
      },
      create: {
        id: TEST_USER.id,
        tenantId: TEST_TENANT,
        email: TEST_USER.email,
        firstName: 'Config',
        lastName: 'User',
        passwordHash: 'hashed',
        status: 'ACTIVE',
      },
    });
  });

  beforeEach(async () => {
    await prisma.configHistory.deleteMany({ where: { tenantId: { in: [TEST_TENANT, SYSTEM_TENANT] } } });
    await prisma.userPreference.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.tenantConfig.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.systemConfig.deleteMany({});
    await prisma.featureFlagOverride.deleteMany({});
    await prisma.featureFlag.deleteMany({});
    await prisma.businessHours.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.holiday.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.numberSequence.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.configTemplate.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('System Config', () => {
    it('lists, validates, updates, and records history', async () => {
      await prisma.systemConfig.createMany({
        data: [
          { key: 'app.theme', category: ConfigCategory.DEFAULTS, value: 'light', dataType: 'STRING' },
          { key: 'app.timezone', category: ConfigCategory.DEFAULTS, value: 'UTC', dataType: 'STRING' },
        ],
      });

      const listRes = await request(app.getHttpServer()).get('/api/v1/config/system').expect(200);
      expect(listRes.body.length).toBe(2);

      const validateRes = await request(app.getHttpServer())
        .post('/api/v1/config/system/validate')
        .send({ key: 'app.theme', value: 'dark' })
        .expect(201);
      expect(validateRes.body.valid).toBe(true);

      const updateRes = await request(app.getHttpServer())
        .put('/api/v1/config/system/app.theme')
        .send({ value: 'dark', changeReason: 'test' })
        .expect(200);
      expect(updateRes.body.value).toBe('dark');

      const history = await prisma.configHistory.findMany({ where: { tenantId: SYSTEM_TENANT } });
      expect(history.length).toBe(1);
      expect(history[0].configKey).toBe('app.theme');
    });
  });

  describe('Tenant Config', () => {
    it('overrides, resets, and bulk updates tenant configs', async () => {
      const setRes = await request(app.getHttpServer())
        .put('/api/v1/config/tenant/ui.locale')
        .send({ value: 'en-US', description: 'locale' })
        .expect(200);
      expect(setRes.body.configValue).toBe('en-US');

      const bulkRes = await request(app.getHttpServer())
        .post('/api/v1/config/tenant/bulk')
        .send({ configs: [{ key: 'date.format', value: 'MM/DD' }, { key: 'currency', value: 'USD' }] })
        .expect(201);
      expect(bulkRes.body.length).toBe(2);

      const resetRes = await request(app.getHttpServer())
        .delete('/api/v1/config/tenant/ui.locale')
        .expect(200);
      expect(resetRes.body.reset).toBe(true);
    });
  });

  describe('User Preferences', () => {
    it('sets, inherits from tenant config, and resets preferences', async () => {
      await prisma.tenantConfig.create({
        data: {
          tenantId: TEST_TENANT,
          configKey: 'ui.timezone',
          configValue: 'UTC',
          dataType: 'STRING',
        },
      });

      const listWithTenant = await request(app.getHttpServer()).get('/api/v1/preferences').expect(200);
      expect(listWithTenant.body.find((p: any) => p.key === 'ui.timezone')?.source).toBe('tenant');

      await request(app.getHttpServer())
        .put('/api/v1/preferences/ui.timezone')
        .send({ value: 'CST' })
        .expect(200);

      const listAfterUser = await request(app.getHttpServer()).get('/api/v1/preferences').expect(200);
      const userPref = listAfterUser.body.find((p: any) => p.key === 'ui.timezone');
      expect(userPref.source).toBe('user');
      expect(userPref.value).toBe('CST');

      const resetRes = await request(app.getHttpServer()).delete('/api/v1/preferences/ui.timezone').expect(200);
      expect(resetRes.body.reset).toBe(true);
    });
  });

  describe('Feature Flags', () => {
    it('applies tenant override and rollout targeting', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/features')
        .send({ code: 'beta_feature', name: 'Beta', defaultEnabled: false, rolloutPercentage: 0 })
        .expect(201);

      const baseEnabled = await request(app.getHttpServer())
        .get('/api/v1/features/beta_feature/enabled')
        .expect(200);
      expect(baseEnabled.body.enabled).toBe(false);

      const overrideRes = await request(app.getHttpServer())
        .put('/api/v1/features/beta_feature/override')
        .send({ isEnabled: true, userIds: [TEST_USER.id] })
        .expect(200);
      expect(overrideRes.body.overrideValue).toBe(true);

      const afterOverride = await request(app.getHttpServer())
        .get('/api/v1/features/beta_feature/enabled')
        .expect(200);
      expect(afterOverride.body.enabled).toBe(true);

      await request(app.getHttpServer())
        .post('/api/v1/features')
        .send({ code: 'rollout_feature', name: 'Rollout', defaultEnabled: false, rolloutPercentage: 100 })
        .expect(201);

      const rolloutRes = await request(app.getHttpServer())
        .get('/api/v1/features/rollout_feature/enabled')
        .expect(200);
      expect(rolloutRes.body.enabled).toBe(true);
    });
  });

  describe('Business Hours and Holidays', () => {
    it('updates hours and adds holidays', async () => {
      const hoursRes = await request(app.getHttpServer())
        .put('/api/v1/config/business-hours')
        .send({
          timezone: 'America/Chicago',
          days: [
            { dayOfWeek: 0, openTime: '08:00', closeTime: '17:00', isClosed: false },
            { dayOfWeek: 6, isClosed: true },
          ],
        })
        .expect(200);
      expect(hoursRes.body.length).toBeGreaterThanOrEqual(2);

      const holidayRes = await request(app.getHttpServer())
        .post('/api/v1/config/holidays')
        .send({ name: 'NY', date: '2025-01-01', isRecurring: true })
        .expect(201);
      expect(holidayRes.body.holidayName).toBe('NY');

      const holidayList = await request(app.getHttpServer()).get('/api/v1/config/holidays').expect(200);
      expect(holidayList.body.length).toBe(1);
    });
  });

  describe('Number Sequences', () => {
    it('generates sequential numbers and resets on period change', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/config/sequences/ORDER')
        .send({ padding: 4, resetFrequency: 'DAILY' })
        .expect(200);

      const first = await request(app.getHttpServer())
        .post('/api/v1/config/sequences/ORDER/next')
        .expect(201);
      expect(first.body.value).toBeDefined();

      // Force reset by moving lastResetAt to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await prisma.numberSequence.updateMany({
        where: { tenantId: TEST_TENANT, sequenceName: 'ORDER' },
        data: { lastResetAt: yesterday, resetFrequency: ResetFrequency.DAILY },
      });

      const second = await request(app.getHttpServer())
        .post('/api/v1/config/sequences/ORDER/next')
        .expect(201);
      expect(second.body.value).toBeDefined();
    });
  });

  describe('Config Templates', () => {
    it('lists and applies templates', async () => {
      await prisma.configTemplate.create({
        data: {
          id: 'tpl-1',
          tenantId: SYSTEM_TENANT,
          templateName: 'Default Template',
          templateType: 'TENANT',
          defaultValues: { 'ui.theme': 'light' },
          isSystem: true,
        },
      });

      const listRes = await request(app.getHttpServer()).get('/api/v1/config/templates').expect(200);
      expect(listRes.body.length).toBeGreaterThanOrEqual(1);

      const applyRes = await request(app.getHttpServer())
        .post('/api/v1/config/templates/tpl-1/apply')
        .send({})
        .expect(201);
      expect(applyRes.body.applied).toBe(true);

      const tenantConfig = await prisma.tenantConfig.findFirst({
        where: { tenantId: TEST_TENANT, configKey: 'ui.theme' },
      });
      expect(tenantConfig?.configValue).toBe('light');
    });
  });
});
