import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, createTestAppWithRole } from './helpers/test-app.helper';

describe('Commission API E2E', () => {
  let app: INestApplication;
  let accountingApp: INestApplication;
  let agentApp: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-commission', 'user-commission', 'user@commission.test');
    app = setup.app;

    const accountingSetup = await createTestAppWithRole(
      'tenant-commission',
      'user-commission-accounting',
      'accounting@commission.test',
      'ACCOUNTING',
    );
    accountingApp = accountingSetup.app;

    const agentSetup = await createTestAppWithRole(
      'tenant-commission',
      'user-commission-agent',
      'agent@commission.test',
      'AGENT',
    );
    agentApp = agentSetup.app;
  });

  afterAll(async () => {
    await app.close();
    await accountingApp.close();
    await agentApp.close();
  });

  it('lists commission plans', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/commission/plans')
      .expect(200);
  });

  it('denies agent access to commission entries', async () => {
    await request(agentApp.getHttpServer())
      .get('/api/v1/commission/entries')
      .expect(403);
  });

  it('allows accounting access to commission entries', async () => {
    await request(accountingApp.getHttpServer())
      .get('/api/v1/commission/entries')
      .expect(200);
  });

  it('allows accounting access to commission payouts', async () => {
    await request(accountingApp.getHttpServer())
      .get('/api/v1/commission/payouts')
      .expect(200);
  });

  it('denies agent access to commission payouts', async () => {
    await request(agentApp.getHttpServer())
      .get('/api/v1/commission/payouts')
      .expect(403);
  });
});
