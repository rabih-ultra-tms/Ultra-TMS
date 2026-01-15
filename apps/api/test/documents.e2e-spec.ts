import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Documents API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-documents', 'user-documents', 'user@documents.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists documents', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/documents')
      .expect(200);
  });
});
