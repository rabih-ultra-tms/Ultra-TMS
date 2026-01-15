import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, createTestAppWithRole } from './helpers/test-app.helper';

describe('Documents API E2E', () => {
  let app: INestApplication;
  let accountingApp: INestApplication;
  let dispatcherApp: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-documents', 'user-documents', 'user@documents.test');
    app = setup.app;

    const accountingSetup = await createTestAppWithRole(
      'tenant-documents',
      'user-documents-accounting',
      'accounting@documents.test',
      'ACCOUNTING',
    );
    accountingApp = accountingSetup.app;

    const dispatcherSetup = await createTestAppWithRole(
      'tenant-documents',
      'user-documents-dispatcher',
      'dispatcher@documents.test',
      'DISPATCHER',
    );
    dispatcherApp = dispatcherSetup.app;
  });

  afterAll(async () => {
    await app.close();
    await accountingApp.close();
    await dispatcherApp.close();
  });

  it('lists documents', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/documents')
      .expect(200);
  });

  it('denies dispatcher access to documents', async () => {
    await request(dispatcherApp.getHttpServer())
      .get('/api/v1/documents')
      .expect(403);
  });

  it('allows accounting access to documents', async () => {
    await request(accountingApp.getHttpServer())
      .get('/api/v1/documents')
      .expect(200);
  });
});
