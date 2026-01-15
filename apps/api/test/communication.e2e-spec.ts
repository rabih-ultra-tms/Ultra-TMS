import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Communication API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-communication', 'user-communication', 'user@communication.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists communication templates', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/communication/templates')
      .expect(200);
  });
});
