import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma.service';
import { createTestApp } from './helpers/test-app.helper';

const TEST_TENANT = 'tenant-rate-intelligence';
const TEST_USER = 'user-rate-intelligence';
const TEST_EMAIL = 'user@rate-intelligence.test';

describe('Rate Intelligence API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createTestApp(TEST_TENANT, TEST_USER, TEST_EMAIL);
    app = setup.app;
    prisma = setup.prisma;

    await prisma.rateAlertHistory.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.rateAlert.deleteMany({ where: { tenantId: TEST_TENANT } });
  });

  afterAll(async () => {
    await prisma.rateAlertHistory.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.rateAlert.deleteMany({ where: { tenantId: TEST_TENANT } });
    await app.close();
  });

  it('returns rate analytics dashboard', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/rates/analytics/dashboard')
      .expect(200);
  });

  it('manages rate alerts', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/rates/alerts')
      .send({ name: 'Market spike', condition: 'RATE_INCREASE', originMarket: 'TX', destMarket: 'CA' })
      .expect(201);

    const alertId = createRes.body.data.id;

    await request(app.getHttpServer())
      .patch(`/api/v1/rates/alerts/${alertId}`)
      .send({ thresholdValue: 1.5 })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/v1/rates/alerts/${alertId}/history`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/rates/alerts/${alertId}`)
      .expect(200);
  });
});
