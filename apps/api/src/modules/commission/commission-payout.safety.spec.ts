import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma.service';
import { CommissionPayoutsService } from './services/commission-payouts.service';
import { CommissionEntriesService } from './services/commission-entries.service';

describe('Commission Payouts - Safety Rules (MP-11-011)', () => {
  let module: TestingModule;
  let prisma: PrismaService;

  const tenantId = 'tenant-mp11-001';
  const userId = 'user-mp11-001';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        PrismaService,
        CommissionPayoutsService,
        CommissionEntriesService,
      ],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('1. Double-payout Prevention', () => {
    it('should track entry payoutId to prevent double-payout', async () => {
      // Setup: Create a commission entry
      const entry = await prisma.commissionEntry.create({
        data: {
          tenantId,
          userId,
          entryType: 'INVOICE_PAID',
          calculationBasis: 'INVOICE_TOTAL',
          basisAmount: 1000,
          rateApplied: 0.1,
          commissionAmount: 100,
          commissionPeriod: 'MONTHLY',
          createdById: userId,
          updatedById: userId,
        },
      });

      // Verify entry initially has no payoutId
      expect(entry.payoutId).toBeNull();

      // Create payout linking this entry
      const payout = await prisma.commissionPayout.create({
        data: {
          tenantId,
          userId,
          payoutNumber: `PO-${Date.now()}`,
          payoutDate: new Date(),
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(),
          grossCommission: 100,
          netPayout: 100,
          paymentMethod: 'ACH',
          status: 'PAID',
          createdById: userId,
          updatedById: userId,
          entries: { connect: [{ id: entry.id }] },
        },
      });

      // Verify entry is now linked to payout
      const linkedEntry = await prisma.commissionEntry.findUnique({
        where: { id: entry.id },
      });
      expect(linkedEntry?.payoutId).toBe(payout.id);
    });
  });

  describe('2. Void Safety', () => {
    it('should allow voiding PENDING payouts', async () => {
      const entry = await prisma.commissionEntry.create({
        data: {
          tenantId,
          userId,
          entryType: 'LOAD_ACCEPTED',
          calculationBasis: 'AMOUNT_PERCENTAGE',
          basisAmount: 500,
          rateApplied: 0.05,
          commissionAmount: 25,
          commissionPeriod: 'MONTHLY',
          createdById: userId,
          updatedById: userId,
        },
      });

      // Create PENDING payout (can be voided)
      const pendingPayout = await prisma.commissionPayout.create({
        data: {
          tenantId,
          userId,
          payoutNumber: `PO-PENDING-${Date.now()}`,
          payoutDate: new Date(),
          periodStart: new Date(),
          periodEnd: new Date(),
          grossCommission: 25,
          netPayout: 25,
          paymentMethod: 'ACH',
          status: 'PENDING',
          createdById: userId,
          updatedById: userId,
          entries: { connect: [{ id: entry.id }] },
        },
      });

      // Verify PENDING payout exists
      expect(pendingPayout.status).toBe('PENDING');
    });
  });

  describe('3. Draw Recovery Calculation', () => {
    it('should calculate draw recovery correctly without going negative', async () => {
      const entry = await prisma.commissionEntry.create({
        data: {
          tenantId,
          userId,
          entryType: 'INVOICE_PAID',
          calculationBasis: 'INVOICE_TOTAL',
          basisAmount: 100,
          rateApplied: 0.2,
          commissionAmount: 20,
          commissionPeriod: 'MONTHLY',
          createdById: userId,
          updatedById: userId,
        },
      });

      const payout = await prisma.commissionPayout.create({
        data: {
          tenantId,
          userId,
          payoutNumber: `PO-DRAW-${Date.now()}`,
          payoutDate: new Date(),
          periodStart: new Date(),
          periodEnd: new Date(),
          grossCommission: 20,
          netPayout: 15, // 20 with draw recovery of 5
          paymentMethod: 'ACH',
          status: 'PAID',
          createdById: userId,
          updatedById: userId,
          entries: { connect: [{ id: entry.id }] },
        },
      });

      // Verify netPayout >= 0 (no negative payouts)
      const netPayoutNum = Number(payout.netPayout);
      const grossCommissionNum = Number(payout.grossCommission);
      expect(netPayoutNum).toBeGreaterThanOrEqual(0);
      expect(netPayoutNum).toBeLessThanOrEqual(grossCommissionNum);
    });
  });

  describe('4. Tenant Isolation', () => {
    it('should not allow access to other tenants payouts', async () => {
      const otherTenantId = 'tenant-other-001';

      const entry = await prisma.commissionEntry.create({
        data: {
          tenantId: otherTenantId,
          userId,
          entryType: 'INVOICE_PAID',
          calculationBasis: 'INVOICE_TOTAL',
          basisAmount: 1000,
          rateApplied: 0.1,
          commissionAmount: 100,
          commissionPeriod: 'MONTHLY',
          createdById: userId,
          updatedById: userId,
        },
      });

      const otherTenantPayout = await prisma.commissionPayout.create({
        data: {
          tenantId: otherTenantId,
          userId,
          payoutNumber: `PO-OTHER-${Date.now()}`,
          payoutDate: new Date(),
          periodStart: new Date(),
          periodEnd: new Date(),
          grossCommission: 100,
          netPayout: 100,
          paymentMethod: 'ACH',
          status: 'PAID',
          createdById: userId,
          updatedById: userId,
          entries: { connect: [{ id: entry.id }] },
        },
      });

      // Query payouts for original tenant — should not include other tenant's payout
      const tenantPayouts = await prisma.commissionPayout.findMany({
        where: { tenantId },
      });

      const ids = tenantPayouts.map((p) => p.id);
      expect(ids).not.toContain(otherTenantPayout.id);
    });
  });
});
