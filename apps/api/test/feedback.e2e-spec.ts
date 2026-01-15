import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Feedback API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-feedback', 'user-feedback', 'user@feedback.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists feedback entries', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/feedback/entries')
      .expect(200);
  });
});
