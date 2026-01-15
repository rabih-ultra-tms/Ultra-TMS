import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Workflow API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-workflow', 'user-workflow', 'user@workflow.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists workflows', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/workflows')
      .expect(200);
  });
});
