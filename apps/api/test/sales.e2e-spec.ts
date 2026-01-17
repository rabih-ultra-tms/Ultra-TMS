import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Sales API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-sales', 'user-sales', 'user@sales.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists quotes', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/quotes')
      .expect(200);
  });

  it('denies carrier access to quotes', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/quotes')
      .set('x-test-role', 'CARRIER')
      .expect(403);
  });

  it('allows sales rep access to quotes', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/quotes')
      .set('x-test-role', 'SALES_REP')
      .expect(200);
  });

  it('allows sales manager access to rate contracts', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/rate-contracts')
      .set('x-test-role', 'SALES_MANAGER')
      .expect(200);
  });

  it('denies sales rep access to rate contracts list', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/rate-contracts')
      .set('x-test-role', 'SALES_REP')
      .expect(403);
  });

  it('allows dispatcher access to accessorial rates', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/accessorial-rates')
      .set('x-test-role', 'DISPATCHER')
      .expect(200);
  });

  it('denies carrier access to accessorial rates', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/accessorial-rates')
      .set('x-test-role', 'CARRIER')
      .expect(403);
  });

  it('allows sales rep access to sales quotas', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/sales/quotas')
      .set('x-test-role', 'SALES_REP')
      .expect(200);
  });

  it('allows sales manager access to leaderboard', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/sales/leaderboard')
      .set('x-test-role', 'SALES_MANAGER')
      .expect(200);
  });

  it('denies carrier access to leaderboard', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/sales/leaderboard')
      .set('x-test-role', 'CARRIER')
      .expect(403);
  });

  it('allows sales rep access to performance metrics', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/sales/performance')
      .set('x-test-role', 'SALES_REP')
      .expect(200);
  });
});
