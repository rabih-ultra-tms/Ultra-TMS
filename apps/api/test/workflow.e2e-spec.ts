import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma.service';
import { createTestApp, createTestAppWithRole } from './helpers/test-app.helper';

const TEST_TENANT = 'tenant-workflow';
const TEST_USER = 'user-workflow';
const TEST_EMAIL = 'user@workflow.test';

describe('Workflow API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createTestApp(TEST_TENANT, TEST_USER, TEST_EMAIL);
    app = setup.app;
    prisma = setup.prisma;

    await prisma.workflowExecution.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.workflow.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.workflowTemplate.deleteMany({ where: { tenantId: TEST_TENANT } });
  });

  afterAll(async () => {
    await prisma.workflowExecution.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.workflow.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.workflowTemplate.deleteMany({ where: { tenantId: TEST_TENANT } });
    await app.close();
  });

  it('lists workflows', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/workflows')
      .expect(200);
  });

  it('creates and updates workflows', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/workflows')
      .send({
        name: 'Test Workflow',
        triggerType: 'MANUAL',
        steps: [{ stepNumber: 1, stepType: 'ACTION', stepName: 'Notify', actionConfig: { action: 'notify' } }],
      })
      .expect(201);

    const workflowId = createRes.body.data.id;

    await request(app.getHttpServer())
      .get(`/api/v1/workflows/${workflowId}`)
      .expect(200);

    await request(app.getHttpServer())
      .put(`/api/v1/workflows/${workflowId}`)
      .send({ description: 'Updated description' })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/workflows/${workflowId}/execute`)
      .send({ triggerData: { source: 'test' } })
      .expect(201);
  });

  it('manages workflow templates', async () => {
    const adminSetup = await createTestAppWithRole('tenant-workflow-admin', 'user-workflow-admin', 'admin@workflow.test', 'admin');
    const adminApp = adminSetup.app;
    const adminPrisma = adminSetup.prisma;

    const templateRes = await request(adminApp.getHttpServer())
      .post('/api/v1/workflow-templates')
      .send({
        templateName: 'Approval Template',
        category: 'Approvals',
        triggerConfig: { type: 'MANUAL' },
        stepsJson: [{ stepNumber: 1, stepType: 'APPROVAL' }],
        isActive: true,
      })
      .expect(201);

    const templateId = templateRes.body.data.id;

    await request(adminApp.getHttpServer())
      .get('/api/v1/workflow-templates')
      .expect(200);

    await request(adminApp.getHttpServer())
      .post(`/api/v1/workflow-templates/${templateId}/create-workflow`)
      .send({ name: 'Workflow from template', activate: true })
      .expect(201);

    await adminPrisma.workflowTemplate.deleteMany({ where: { tenantId: 'tenant-workflow-admin' } });
    await adminPrisma.workflow.deleteMany({ where: { tenantId: 'tenant-workflow-admin' } });
    await adminApp.close();
  });

  it('restricts template creation to admins', async () => {
    const opsSetup = await createTestAppWithRole('tenant-workflow-rbac', 'user-ops', 'ops@workflow.test', 'OPERATIONS_MANAGER');
    const opsApp = opsSetup.app;

    await request(opsApp.getHttpServer())
      .post('/api/v1/workflow-templates')
      .send({
        templateName: 'Ops Template',
        category: 'Ops',
        triggerConfig: { type: 'MANUAL' },
        stepsJson: [{ stepNumber: 1, stepType: 'ACTION' }],
        isActive: true,
      })
      .expect(403);

    await opsApp.close();
  });
});
