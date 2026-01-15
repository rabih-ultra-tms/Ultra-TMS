import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma.service';
import { AlertCondition, OutputFormat, ReportType } from '@prisma/client';
import { createTestAppWithRole } from './helpers/test-app.helper';

const TEST_TENANT = 'tenant-analytics';
const TEST_USER = {
  id: 'user-analytics',
  email: 'user@analytics.test',
  tenantId: TEST_TENANT,
  roles: ['ADMIN'],
  role: 'ADMIN',
  roleName: 'ADMIN',
};

describe('Analytics API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let kpiId: string;

  beforeAll(async () => {
    const setup = await createTestAppWithRole(
      TEST_TENANT,
      TEST_USER.id,
      TEST_USER.email,
      'ADMIN',
    );
    app = setup.app;
    prisma = setup.prisma;

    await prisma.kPIDefinition.deleteMany({ where: { tenantId: TEST_TENANT } });

    const kpi = await prisma.kPIDefinition.create({
      data: {
        tenantId: TEST_TENANT,
        code: 'KPI_REVENUE',
        name: 'Revenue',
        category: 'FINANCIAL',
        aggregationType: 'SUM',
        sourceQuery: 'select sum(total)',
        format: 'currency',
        status: 'ACTIVE',
      },
    });
    kpiId = kpi.id;

    await prisma.kPISnapshot.create({
      data: {
        tenantId: TEST_TENANT,
        kpiDefinitionId: kpiId,
        snapshotDate: new Date(),
        value: 12000,
        comparisonValue: 10000,
        trendDirection: 'UP',
        metadata: {},
      },
    });
  });

  beforeEach(async () => {
    await prisma.reportExecution.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.report.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.dashboardWidget.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.dashboard.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.savedAnalyticsView.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.kPIAlert.deleteMany({ where: { tenantId: TEST_TENANT } });
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates dashboard with widget', async () => {
    const dashboardRes = await request(app.getHttpServer())
      .post('/api/v1/analytics/dashboards')
      .send({ name: 'Ops Dashboard', description: 'Main view', isPublic: true })
      .expect(201);

    const dashboardId = dashboardRes.body.data.id;

    const widgetRes = await request(app.getHttpServer())
      .post(`/api/v1/analytics/dashboards/${dashboardId}/widgets`)
      .send({ widgetType: 'KPI_CARD', title: 'Revenue', kpiDefinitionId: kpiId })
      .expect(201);

    expect(widgetRes.body.data.dashboardId).toBe(dashboardId);

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/analytics/dashboards')
      .expect(200);

    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data[0].dashboardWidgets.length).toBeGreaterThan(0);
  });

  it('creates report, executes, and lists executions', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/analytics/reports')
      .send({
        name: 'Margin Report',
        reportType: ReportType.STANDARD,
        sourceQuery: 'select * from loads',
        outputFormat: OutputFormat.PDF,
        isScheduled: false,
      })
      .expect(201);

    const reportId = createRes.body.data.id;

    const execRes = await request(app.getHttpServer())
      .post(`/api/v1/analytics/reports/${reportId}/execute`)
      .send({ outputFormat: OutputFormat.CSV })
      .expect(201);

    expect(execRes.body.data.status).toBe('COMPLETED');

    const executions = await request(app.getHttpServer())
      .get(`/api/v1/analytics/reports/${reportId}/executions`)
      .expect(200);

    expect(executions.body.data.length).toBe(1);
  });

  it('acknowledges and resolves KPI alerts', async () => {
    const alert = await prisma.kPIAlert.create({
      data: {
        tenantId: TEST_TENANT,
        kpiDefinitionId: kpiId,
        alertName: 'Revenue Drop',
        alertCondition: AlertCondition.RATE_THRESHOLD,
        thresholdValue: 5000,
        notifyUsers: [TEST_USER.id],
        isActive: true,
      },
    });

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/analytics/alerts?isActive=true')
      .expect(200);

    expect(listRes.body.data.length).toBe(1);

    await request(app.getHttpServer())
      .post(`/api/v1/analytics/alerts/${alert.id}/acknowledge`)
      .send({ notes: 'Investigating' })
      .expect(201);

    const resolveRes = await request(app.getHttpServer())
      .post(`/api/v1/analytics/alerts/${alert.id}/resolve`)
      .send({ resolutionNotes: 'Threshold adjusted' })
      .expect(201);

    expect(resolveRes.body.data.isActive).toBe(false);
  });

  it('manages saved views and data queries', async () => {
    const viewRes = await request(app.getHttpServer())
      .post('/api/v1/analytics/views')
      .send({ viewName: 'Loads Grid', entityType: 'LOAD', columns: { id: true }, isPublic: false })
      .expect(201);

    const viewId = viewRes.body.data.id;

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/analytics/views')
      .expect(200);

    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0].id).toBe(viewId);

    const dims = await request(app.getHttpServer())
      .get('/api/v1/analytics/data/dimensions')
      .expect(200);
    expect(Array.isArray(dims.body.data.dimensions)).toBe(true);

    const queryRes = await request(app.getHttpServer())
      .post('/api/v1/analytics/data/query')
      .send({ dataSource: 'loads', dimensions: ['customer'], measures: ['revenue'] })
      .expect(201);
    expect(queryRes.body.data.length).toBeGreaterThan(0);

    await request(app.getHttpServer())
      .get(`/api/v1/analytics/data/trends/KPI_REVENUE`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/analytics/data/compare')
      .send({
        currentStart: new Date().toISOString(),
        currentEnd: new Date().toISOString(),
        previousStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        previousEnd: new Date().toISOString(),
      })
      .expect(201);
  });
});
