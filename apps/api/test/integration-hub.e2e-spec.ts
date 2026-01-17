import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Integration Hub API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-integration', 'user-integration', 'user@integration.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists integration providers', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/integration-hub/providers')
      .expect(200);
  });

  it('allows admin access to integrations list', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/integration-hub/integrations')
      .set('x-test-role', 'ADMIN')
      .expect(200);
  });

  it('denies sales rep access to integrations list', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/integration-hub/integrations')
      .set('x-test-role', 'SALES_REP')
      .expect(403);
  });

  it('allows system integrator access to providers', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/integration-hub/providers')
      .set('x-test-role', 'SYSTEM_INTEGRATOR')
      .expect(200);
  });

  it('allows system integrator access to provider categories', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/integration-hub/providers/categories')
      .set('x-test-role', 'SYSTEM_INTEGRATOR')
      .expect(200);
  });

  it('allows system integrator access to sync jobs', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/integration-hub/sync-jobs')
      .set('x-test-role', 'SYSTEM_INTEGRATOR')
      .expect(200);
  });

  it('allows system integrator access to api logs', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/integration-hub/api-logs')
      .set('x-test-role', 'SYSTEM_INTEGRATOR')
      .expect(200);
  });

  it('allows system integrator access to transformations', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/integration-hub/transformations')
      .set('x-test-role', 'SYSTEM_INTEGRATOR')
      .expect(200);
  });

  it('denies admin access to webhook endpoints', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/integration-hub/webhooks/endpoints')
      .set('x-test-role', 'ADMIN')
      .expect(403);
  });

  it('allows super admin access to webhook endpoints', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/integration-hub/webhooks/endpoints')
      .set('x-test-role', 'SUPER_ADMIN')
      .expect(200);
  });
});
