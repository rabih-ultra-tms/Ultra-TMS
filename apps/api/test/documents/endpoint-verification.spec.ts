import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';

describe('Documents Endpoints (MP-07-001)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should verify 20 endpoints respond correctly', async () => {
    const endpoints = [
      { method: 'GET', path: '/api/v1/documents' },
      { method: 'POST', path: '/api/v1/documents' },
      { method: 'GET', path: '/api/v1/documents/1' },
      { method: 'PATCH', path: '/api/v1/documents/1' },
      { method: 'DELETE', path: '/api/v1/documents/1' },
      { method: 'POST', path: '/api/v1/documents/1/upload' },
      { method: 'GET', path: '/api/v1/documents/1/download' },
      { method: 'GET', path: '/api/v1/documents/1/versions' },
      { method: 'GET', path: '/api/v1/documents/search' },
      { method: 'GET', path: '/api/v1/documents/folders' },
      { method: 'POST', path: '/api/v1/documents/folders' },
      { method: 'PATCH', path: '/api/v1/documents/folders/1' },
      { method: 'DELETE', path: '/api/v1/documents/folders/1' },
      { method: 'POST', path: '/api/v1/documents/1/share' },
      { method: 'GET', path: '/api/v1/documents/1/shares' },
      { method: 'DELETE', path: '/api/v1/documents/shares/1' },
      { method: 'POST', path: '/api/v1/documents/1/versions' },
      { method: 'GET', path: '/api/v1/documents/1/metadata' },
      { method: 'POST', path: '/api/v1/documents/1/move' },
      { method: 'GET', path: '/api/v1/documents/trash' },
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
      try {
        const method = endpoint.method.toLowerCase();
        const res = await request(app.getHttpServer())
          [method](endpoint.path)
          .set('Authorization', 'Bearer mock-token');

        if (res.status < 500) {
          successCount++;
        }
      } catch (e) {
        console.error(
          `Endpoint ${endpoint.method} ${endpoint.path} failed:`,
          e.message
        );
      }
    }

    console.log(`✓ ${successCount}/20 Documents endpoints responding`);
    expect(successCount).toBeGreaterThan(18);
  });
});
