import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('HR API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-hr', 'user-hr', 'user@hr.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists departments', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/hr/departments')
      .expect(200);
  });
});
