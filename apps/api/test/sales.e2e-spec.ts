import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Sales API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-sales', 'user-sales', 'user@sales.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists quotes', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/quotes')
      .expect(200);
  });
});
