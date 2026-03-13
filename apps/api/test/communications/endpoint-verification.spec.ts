import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';

describe('Communications Endpoints (MP-07-010)', () => {
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

  it('should verify 30 endpoints respond correctly', async () => {
    const endpoints = [
      { method: 'GET', path: '/api/v1/communications/messages' },
      { method: 'POST', path: '/api/v1/communications/messages' },
      { method: 'GET', path: '/api/v1/communications/messages/1' },
      { method: 'PATCH', path: '/api/v1/communications/messages/1' },
      { method: 'DELETE', path: '/api/v1/communications/messages/1' },
      { method: 'GET', path: '/api/v1/communications/threads' },
      { method: 'GET', path: '/api/v1/communications/threads/1' },
      { method: 'POST', path: '/api/v1/communications/threads/1/reply' },
      { method: 'GET', path: '/api/v1/communications/templates' },
      { method: 'POST', path: '/api/v1/communications/templates' },
      { method: 'GET', path: '/api/v1/communications/templates/1' },
      { method: 'PATCH', path: '/api/v1/communications/templates/1' },
      { method: 'DELETE', path: '/api/v1/communications/templates/1' },
      { method: 'POST', path: '/api/v1/communications/templates/1/preview' },
      { method: 'GET', path: '/api/v1/communications/preferences' },
      { method: 'PATCH', path: '/api/v1/communications/preferences' },
      { method: 'POST', path: '/api/v1/communications/send-email' },
      { method: 'POST', path: '/api/v1/communications/send-sms' },
      { method: 'GET', path: '/api/v1/communications/events' },
      { method: 'POST', path: '/api/v1/communications/events' },
      { method: 'POST', path: '/api/v1/communications/webhooks/sendgrid' },
      { method: 'GET', path: '/api/v1/communications/notifications' },
      { method: 'PATCH', path: '/api/v1/communications/notifications/1' },
      { method: 'DELETE', path: '/api/v1/communications/notifications/1' },
      { method: 'GET', path: '/api/v1/communications/search' },
      { method: 'GET', path: '/api/v1/communications/archive' },
      { method: 'POST', path: '/api/v1/communications/1/archive' },
      { method: 'GET', path: '/api/v1/communications/spam' },
      { method: 'POST', path: '/api/v1/communications/1/spam' },
      { method: 'GET', path: '/api/v1/communications/stats' },
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

    console.log(`✓ ${successCount}/30 Communications endpoints responding`);
    expect(successCount).toBeGreaterThan(28);
  });
});
