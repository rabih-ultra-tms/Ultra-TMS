import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Integration Hub API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-integration', 'user-integration', 'user@integration.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists integration providers', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/integration-hub/providers')
      .expect(200);
  });
});
