import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Help Desk API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-help-desk', 'user-help-desk', 'user@helpdesk.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists support tickets', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/support/tickets')
      .expect(200);
  });
});
