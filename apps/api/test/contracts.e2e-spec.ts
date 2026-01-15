import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Contracts API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-contracts', 'user-contracts', 'user@contracts.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists contracts', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/contracts')
      .expect(200);
  });
});
