import request from 'supertest';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { Prisma } from '@prisma/client';

const TEST_TENANT = 'tenant-agent';
const TEST_USER = {
  id: 'user-agent',
  email: 'user@agent.test',
  tenantId: TEST_TENANT,
  roles: ['admin'],
};

describe('Agent API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = TEST_USER;
          req.headers['x-tenant-id'] = TEST_TENANT;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.tenant.upsert({
      where: { slug: TEST_TENANT },
      update: { name: 'Agent Tenant' },
      create: { id: TEST_TENANT, slug: TEST_TENANT, name: 'Agent Tenant' },
    });

    await prisma.company.upsert({
      where: { id: 'customer-1' },
      update: { tenantId: TEST_TENANT, legalName: 'Customer One', name: 'Customer One' },
      create: {
        id: 'customer-1',
        tenantId: TEST_TENANT,
        name: 'Customer One',
        legalName: 'Customer One',
        companyType: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.agentCommission.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.agentPayout.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.agentCustomerAssignment.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.agentLead.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.agentAgreement.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.agentContact.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.agent.deleteMany({ where: { tenantId: TEST_TENANT } });

    await prisma.company.upsert({
      where: { id: 'customer-1' },
      update: { tenantId: TEST_TENANT, legalName: 'Customer One', name: 'Customer One' },
      create: {
        id: 'customer-1',
        tenantId: TEST_TENANT,
        name: 'Customer One',
        legalName: 'Customer One',
        companyType: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
  });

  it('creates agent and performs lifecycle actions', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/agents')
      .send({
        companyName: 'Alpha Agent',
        contactFirstName: 'Alice',
        contactLastName: 'Agent',
        contactEmail: 'alice@agent.test',
        agentType: 'REFERRING',
      })
      .expect(201);

    const agentId = createRes.body.id;
    expect(createRes.body.agentCode).toContain('A-');
    expect(createRes.body.status).toBe('PENDING');

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/agents')
      .expect(200);

    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].id).toBe(agentId);

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/agents/${agentId}`)
      .expect(200);

    expect(getRes.body.id).toBe(agentId);

    await request(app.getHttpServer())
      .post(`/api/v1/agents/${agentId}/activate`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/agents/${agentId}/suspend`)
      .send({ reason: 'Docs missing' })
      .expect(200);

    const terminateRes = await request(app.getHttpServer())
      .post(`/api/v1/agents/${agentId}/terminate`)
      .send({ reason: 'Inactive' })
      .expect(200);

    expect(terminateRes.body.status).toBe('TERMINATED');
    expect(terminateRes.body.terminationReason).toBe('Inactive');
  });

  it('manages agent contacts', async () => {
    const agent = await prisma.agent.create({
      data: {
        tenantId: TEST_TENANT,
        agentCode: 'A-0001',
        companyName: 'Contacts Agent',
        contactFirstName: 'Bob',
        contactLastName: 'Builder',
        contactEmail: 'bob@agent.test',
        agentType: 'SELLING',
        tier: 'STANDARD',
      },
    });

    const addRes = await request(app.getHttpServer())
      .post(`/api/v1/agents/${agent.id}/contacts`)
      .send({
        firstName: 'Carol',
        lastName: 'Contact',
        email: 'carol@agent.test',
        role: 'OPS',
        isPrimary: true,
      })
      .expect(201);

    const contactId = addRes.body.id;

    const listRes = await request(app.getHttpServer())
      .get(`/api/v1/agents/${agent.id}/contacts`)
      .expect(200);

    expect(listRes.body[0].id).toBe(contactId);

    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/agents/${agent.id}/contacts/${contactId}`)
      .send({ role: 'SALES', hasPortalAccess: true })
      .expect(200);

    expect(updateRes.body.role).toBe('SALES');
    expect(updateRes.body.hasPortalAccess).toBe(true);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/agents/${agent.id}/contacts/${contactId}`)
      .expect(200);

    expect(deleteRes.body.isActive).toBe(false);
  });

  it('creates agreements and updates status', async () => {
    const agent = await prisma.agent.create({
      data: {
        tenantId: TEST_TENANT,
        agentCode: 'A-0002',
        companyName: 'Agreement Agent',
        contactFirstName: 'Dana',
        contactLastName: 'Dealer',
        contactEmail: 'dana@agent.test',
        agentType: 'REFERRING',
        tier: 'STANDARD',
      },
    });

    const createRes = await request(app.getHttpServer())
      .post(`/api/v1/agents/${agent.id}/agreements`)
      .send({
        effectiveDate: new Date().toISOString(),
        splitType: 'PERCENT_OF_REP',
        splitRate: 0.1,
        paymentDay: 15,
      })
      .expect(201);

    const agreementId = createRes.body.id;

    const activateRes = await request(app.getHttpServer())
      .post(`/api/v1/agent-agreements/${agreementId}/activate`)
      .expect(200);

    expect(activateRes.body.status).toBe('ACTIVE');

    const terminateRes = await request(app.getHttpServer())
      .post(`/api/v1/agent-agreements/${agreementId}/terminate`)
      .expect(200);

    expect(terminateRes.body.status).toBe('TERMINATED');
  });

  it('assigns customers and handles lifecycle', async () => {
    const agent = await prisma.agent.create({
      data: {
        tenantId: TEST_TENANT,
        agentCode: 'A-0003',
        companyName: 'Assignment Agent',
        contactFirstName: 'Eli',
        contactLastName: 'Assign',
        contactEmail: 'eli@agent.test',
        agentType: 'SELLING',
        tier: 'STANDARD',
      },
    });

    const assignRes = await request(app.getHttpServer())
      .post(`/api/v1/agents/${agent.id}/customers`)
      .send({ customerId: 'customer-1', assignmentType: 'PRIMARY' })
      .expect(201);

    const assignmentId = assignRes.body.id;

    const startSunsetRes = await request(app.getHttpServer())
      .post(`/api/v1/agent-assignments/${assignmentId}/start-sunset`)
      .send({ reason: 'Transition' })
      .expect(200);

    expect(startSunsetRes.body.status).toBe('SUNSET');

    const lookupRes = await request(app.getHttpServer())
      .get(`/api/v1/customers/${'customer-1'}/agent`)
      .expect(200);

    expect(lookupRes.body?.id).toBe(assignmentId);

    const terminateRes = await request(app.getHttpServer())
      .post(`/api/v1/agent-assignments/${assignmentId}/terminate`)
      .send({ reason: 'Ended' })
      .expect(200);

    expect(terminateRes.body.status).toBe('TERMINATED');
  });

  it('submits, qualifies, converts leads and auto-assigns customer', async () => {
    const agent = await prisma.agent.create({
      data: {
        tenantId: TEST_TENANT,
        agentCode: 'A-0004',
        companyName: 'Lead Agent',
        contactFirstName: 'Faye',
        contactLastName: 'Lead',
        contactEmail: 'faye@agent.test',
        agentType: 'HYBRID',
        tier: 'STANDARD',
      },
    });

    const leadRes = await request(app.getHttpServer())
      .post(`/api/v1/agents/${agent.id}/leads`)
      .send({
        companyName: 'Lead Co',
        contactFirstName: 'Greg',
        contactLastName: 'Lead',
        contactEmail: 'greg@lead.test',
      })
      .expect(201);

    const leadId = leadRes.body.id;

    await request(app.getHttpServer())
      .post(`/api/v1/agent-leads/${leadId}/qualify`)
      .send({ qualificationNotes: 'Valid lead', assignedTo: 'owner-1' })
      .expect(200);

    const convertRes = await request(app.getHttpServer())
      .post(`/api/v1/agent-leads/${leadId}/convert`)
      .send({ customerId: 'customer-1', notes: 'Converted' })
      .expect(200);

    expect(convertRes.body.status).toBe('CONVERTED');

    const assignment = await prisma.agentCustomerAssignment.findFirst({
      where: { tenantId: TEST_TENANT, agentId: agent.id, customerId: 'customer-1' },
    });

    expect(assignment).toBeTruthy();
    expect(assignment?.status).toBe('ACTIVE');
  });

  it('returns commissions, performance, and rankings', async () => {
    const agent = await prisma.agent.create({
      data: {
        tenantId: TEST_TENANT,
        agentCode: 'A-0005',
        companyName: 'Commission Agent',
        contactFirstName: 'Hank',
        contactLastName: 'Earn',
        contactEmail: 'hank@agent.test',
        agentType: 'REFERRING',
        tier: 'STANDARD',
      },
    });

    await prisma.agentCommission.create({
      data: {
        tenantId: TEST_TENANT,
        agentId: agent.id,
        splitRate: new Prisma.Decimal(0.1),
        splitType: 'PERCENT_OF_REP',
        commissionBase: new Prisma.Decimal(1000),
        grossCommission: new Prisma.Decimal(100),
        netCommission: new Prisma.Decimal(95),
      },
    });

    const listRes = await request(app.getHttpServer())
      .get(`/api/v1/agents/${agent.id}/commissions`)
      .expect(200);

    expect(listRes.body.data.length).toBe(1);

    const perfRes = await request(app.getHttpServer())
      .get(`/api/v1/agents/${agent.id}/performance`)
      .expect(200);

    expect(perfRes.body.totalNet).toBeDefined();

    const rankingsRes = await request(app.getHttpServer())
      .get('/api/v1/agents/rankings')
      .expect(200);

    expect(rankingsRes.body.length).toBeGreaterThan(0);
  });

  it('returns statements list and details', async () => {
    const agent = await prisma.agent.create({
      data: {
        tenantId: TEST_TENANT,
        agentCode: 'A-0006',
        companyName: 'Statement Agent',
        contactFirstName: 'Ivy',
        contactLastName: 'Statement',
        contactEmail: 'ivy@agent.test',
        agentType: 'SELLING',
        tier: 'STANDARD',
      },
    });

    const payout = await prisma.agentPayout.create({
      data: {
        tenantId: TEST_TENANT,
        agentId: agent.id,
        payoutNumber: 'P-0001',
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-01-31'),
        grossCommissions: new Prisma.Decimal(500),
        netAmount: new Prisma.Decimal(480),
        status: 'PENDING',
      },
    });

    const listRes = await request(app.getHttpServer())
      .get(`/api/v1/agents/${agent.id}/statements`)
      .expect(200);

    expect(listRes.body.data[0].id).toBe(payout.id);

    const detailRes = await request(app.getHttpServer())
      .get(`/api/v1/agents/${agent.id}/statements/${payout.id}`)
      .expect(200);

    expect(detailRes.body.id).toBe(payout.id);

    const pdfRes = await request(app.getHttpServer())
      .get(`/api/v1/agents/${agent.id}/statements/${payout.id}/pdf`)
      .expect('Content-Type', /pdf/)
      .expect(200);

    expect(pdfRes.body).toBeDefined();
  });
});