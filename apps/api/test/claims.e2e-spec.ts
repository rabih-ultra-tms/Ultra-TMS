import request from 'supertest';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

const TEST_TENANT = 'tenant-claims';
const TEST_USER = {
  id: 'user-claims',
  email: 'claims@test.com',
  tenantId: TEST_TENANT,
  roles: ['SUPER_ADMIN'],
  role: 'SUPER_ADMIN',
  roleName: 'SUPER_ADMIN',
};

describe('Claims API E2E', () => {
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
      update: { name: 'Claims Tenant' },
      create: { id: TEST_TENANT, slug: TEST_TENANT, name: 'Claims Tenant' },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.claimAdjustment.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.subrogationRecord.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.claimDocument.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.claimNote.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.claimItem.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.claimTimeline.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.claim.deleteMany({ where: { tenantId: TEST_TENANT } });
  });

  const createClaimPayload = () => ({
    claimType: 'CARGO_DAMAGE',
    description: 'Damaged pallets',
    incidentDate: new Date().toISOString(),
    claimedAmount: 500,
    claimantName: 'John Claimant',
    items: [
      {
        description: 'Widgets',
        quantity: 5,
        unitPrice: 100,
      },
    ],
  });

  it('creates, progresses, resolves, and reports on a claim', async () => {
    // Create claim
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/claims')
      .send(createClaimPayload())
      .expect(201);

    const claimId = createRes.body.data.id;
    expect(createRes.body.data.status).toBe('DRAFT');

    // List claims
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/claims')
      .expect(200);
    expect(listRes.body.data.length).toBe(1);

    // File claim
    const fileRes = await request(app.getHttpServer())
      .post(`/api/v1/claims/${claimId}/file`)
      .send({ receivedDate: new Date().toISOString() })
      .expect(200);
    expect(fileRes.body.data.status).toBe('SUBMITTED');

    // Assign claim
    const assignRes = await request(app.getHttpServer())
      .post(`/api/v1/claims/${claimId}/assign`)
      .send({ assignedToId: 'adjuster-1', dueDate: new Date().toISOString() })
      .expect(200);
    expect(assignRes.body.data.assignedToId).toBe('adjuster-1');

    // Add note
    const noteRes = await request(app.getHttpServer())
      .post(`/api/v1/claims/${claimId}/notes`)
      .send({ note: 'Investigation started', noteType: 'INTERNAL', isInternal: true })
      .expect(201);
    expect(noteRes.body.data.note).toBe('Investigation started');

    // Approve claim
    const approveRes = await request(app.getHttpServer())
      .post(`/api/v1/claims/${claimId}/approve`)
      .send({ approvedAmount: 400 })
      .expect(200);
    expect(approveRes.body.data.status).toBe('APPROVED');
    expect(Number(approveRes.body.data.approvedAmount)).toBe(400);

    // Pay claim and expect closure
    const payRes = await request(app.getHttpServer())
      .post(`/api/v1/claims/${claimId}/pay`)
      .send({ amount: 400 })
      .expect(200);
    expect(payRes.body.data.status).toBe('CLOSED');
    expect(Number(payRes.body.data.paidAmount)).toBe(400);

    // Add subrogation record
    const subroRes = await request(app.getHttpServer())
      .post(`/api/v1/claims/${claimId}/subrogation`)
      .send({ targetParty: 'Carrier ABC', targetPartyType: 'CARRIER', amountSought: 300 })
      .expect(201);
    expect(subroRes.body.data.id).toBeDefined();

    // Reports
    const statusReport = await request(app.getHttpServer())
      .get('/api/v1/claims/reports/status')
      .expect(200);
    expect(statusReport.body.data.some((r: any) => r.status === 'CLOSED' && r.count === 1)).toBe(true);

    const typeReport = await request(app.getHttpServer())
      .get('/api/v1/claims/reports/types')
      .expect(200);
    expect(typeReport.body.data.some((r: any) => r.claimType === 'CARGO_DAMAGE')).toBe(true);

    const financials = await request(app.getHttpServer())
      .get('/api/v1/claims/reports/financials')
      .expect(200);
    expect(financials.body.data.approved).toBe(400);
    expect(financials.body.data.paid).toBe(400);

    const overdue = await request(app.getHttpServer())
      .get('/api/v1/claims/reports/overdue')
      .expect(200);
    expect(overdue.body.data.overdue).toBeGreaterThanOrEqual(0);
  });
});
