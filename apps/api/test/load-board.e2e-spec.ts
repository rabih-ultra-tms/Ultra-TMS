import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';

describe('Load Board API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-load-board', 'user-load-board', 'user@load-board.test');
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists load board accounts', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/load-board/accounts')
      .expect(200);
  });
});
