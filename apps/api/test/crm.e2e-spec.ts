import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('CRM API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-crm', 'user-crm', 'user@crm.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists companies', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/crm/companies')
      .expect(200);
  });

  it('denies carrier access to companies', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/crm/companies')
      .set('x-test-role', 'CARRIER')
      .expect(403);
  });

  it('allows sales rep access to companies', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/crm/companies')
      .set('x-test-role', 'SALES_REP')
      .expect(200);
  });

  it('lists contacts for sales rep', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/crm/contacts')
      .set('x-test-role', 'SALES_REP')
      .expect(200);
  });

  it('denies carrier access to contacts', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/crm/contacts')
      .set('x-test-role', 'CARRIER')
      .expect(403);
  });

  it('allows sales rep access to activities', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/crm/activities')
      .set('x-test-role', 'SALES_REP')
      .expect(200);
  });

  it('denies carrier access to activities', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/crm/activities')
      .set('x-test-role', 'CARRIER')
      .expect(403);
  });

  it('allows sales manager access to opportunities', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/crm/opportunities')
      .set('x-test-role', 'SALES_MANAGER')
      .expect(200);
  });

  it('denies carrier access to opportunities', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/crm/opportunities')
      .set('x-test-role', 'CARRIER')
      .expect(403);
  });

  it('returns hubspot connection status', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/crm/hubspot/status')
      .expect(200);
  });
});
