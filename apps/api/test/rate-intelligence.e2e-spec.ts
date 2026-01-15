import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Rate Intelligence API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-rate-intelligence', 'user-rate-intelligence', 'user@rate-intelligence.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns rate analytics dashboard', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/api/v1/rates/analytics/dashboard')
      .expect(200);
  });
});
