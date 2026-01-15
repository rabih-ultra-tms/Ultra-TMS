import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Credit API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-credit', 'user-credit', 'user@credit.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists credit limits', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/credit/limits')
      .expect(200);
  });
});
