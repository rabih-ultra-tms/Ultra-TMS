import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('CRM API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-crm', 'user-crm', 'user@crm.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists companies', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/companies')
      .expect(200);
  });
});
