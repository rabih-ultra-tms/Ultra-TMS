import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Tracking API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-tracking', 'user-tracking', 'user@tracking.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns tracking map data', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/tracking/map')
      .expect(200);
  });
});
