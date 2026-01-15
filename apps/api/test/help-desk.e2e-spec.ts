import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma.service';
import { createTestApp, createTestAppWithRole } from './helpers/test-app.helper';

const TEST_TENANT = 'tenant-help-desk';
const TEST_USER = 'user-help-desk';
const TEST_EMAIL = 'user@helpdesk.test';

describe('Help Desk API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createTestApp(TEST_TENANT, TEST_USER, TEST_EMAIL);
    app = setup.app;
    prisma = setup.prisma;

    await prisma.ticketReply.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.supportTicket.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.supportTeam.deleteMany({ where: { tenantId: TEST_TENANT } });
  });

  afterAll(async () => {
    await prisma.ticketReply.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.supportTicket.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.supportTeam.deleteMany({ where: { tenantId: TEST_TENANT } });
    await app.close();
  });

  it('lists support tickets', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/support/tickets')
      .expect(200);
  });

  it('creates and updates tickets', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/support/tickets')
      .send({
        subject: 'Login issue',
        description: 'Cannot login to portal',
        source: 'EMAIL',
        priority: 'HIGH',
      })
      .expect(201);

    const ticketId = createRes.body.data.id;

    await request(app.getHttpServer())
      .get(`/api/v1/support/tickets/${ticketId}`)
      .expect(200);

    await request(app.getHttpServer())
      .put(`/api/v1/support/tickets/${ticketId}`)
      .send({ status: 'OPEN', category: 'Auth' })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/support/tickets/${ticketId}/reply`)
      .send({ body: 'We are investigating.', replyType: 'PUBLIC' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/support/tickets/${ticketId}/close`)
      .send({ resolutionNotes: 'Reset password' })
      .expect(201);
  });

  it('creates and manages support teams', async () => {
    const adminSetup = await createTestAppWithRole('tenant-help-desk-admin', 'user-helpdesk-admin', 'admin@helpdesk.test', 'admin');
    const adminApp = adminSetup.app;
    const adminPrisma = adminSetup.prisma;

    const teamRes = await request(adminApp.getHttpServer())
      .post('/api/v1/support/teams')
      .send({ name: 'Tier 1', description: 'Support team' })
      .expect(201);

    const teamId = teamRes.body.data.id;

    await request(adminApp.getHttpServer())
      .get('/api/v1/support/teams')
      .expect(200);

    await request(adminApp.getHttpServer())
      .put(`/api/v1/support/teams/${teamId}`)
      .send({ description: 'Updated team' })
      .expect(200);

    await request(adminApp.getHttpServer())
      .post(`/api/v1/support/teams/${teamId}/members`)
      .send({ members: [{ userId: 'user-helpdesk-admin', role: 'LEAD' }] })
      .expect(201);

    await adminPrisma.supportTeam.deleteMany({ where: { tenantId: 'tenant-help-desk-admin' } });
    await adminApp.close();
  });
});
