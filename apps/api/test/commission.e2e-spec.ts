import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Commission API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-commission', 'user-commission', 'user@commission.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists commission plans', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/commission/plans')
      .expect(200);
  });
});
