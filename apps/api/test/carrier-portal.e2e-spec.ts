import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Carrier Portal API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-carrier-portal', 'user-carrier-portal', 'user@carrier-portal.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('requests a password reset', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/carrier-portal/auth/forgot-password')
      .send({ email: 'carrier@example.com' })
      .expect(201);
  });
});
