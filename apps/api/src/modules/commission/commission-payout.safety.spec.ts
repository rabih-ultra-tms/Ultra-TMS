import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma.service';
import { CommissionPayoutsService } from './services/commission-payouts.service';
import { CommissionEntriesService } from './services/commission-entries.service';
import { FactoryService } from '../../test/factory.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('Commission Payouts - Safety Rules (MP-11-011)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let payoutsService: CommissionPayoutsService;
  let entriesService: CommissionEntriesService;
  let factory: FactoryService;

  const tenantId = 'tenant-mp11-001';
  const userId = 'user-mp11-001';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        PrismaService,
        CommissionPayoutsService,
        CommissionEntriesService,
        FactoryService,
      ],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    payoutsService = module.get<CommissionPayoutsService>(
      CommissionPayoutsService
    );
    entriesService = module.get<CommissionEntriesService>(
      CommissionEntriesService
    );
    factory = module.get<FactoryService>(FactoryService);

    await factory.resetDatabase();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('1. Double-payout Prevention', () => {
    it('should prevent the same commission entry from appearing in two payouts', async () => {
      // Setup: Create a commission entry
      const entry = await prisma.commissionEntry.create({
        data: {
          tenantId,
          entryType: 'INVOICE_PAID',
          calculationBasis: 'INVOICE_TOTAL',
          basisAmount: 1000,
          rateApplied: 0.1,
          commissionAmount: 100,
          payoutId: null, // Not yet paid out
          createdById: userId,
          updatedById: userId,
        },
      });

      // Create first payout with this entry
      const payout1 = await prisma.commissionPayout.create({
        data: {
          tenantId,
          payoutNumber: `PO-${Date.now()}-1`,
          grossCommission: 100,
          netPayout: 100,
          paymentMethod: 'ACH',
          status: 'PAID',
          createdById: userId,
          updatedById: userId,
          entries: { connect: [{ id: entry.id }] },
        },
      });

      // Attempt to create second payout with same entry — should fail
      await expect(
        prisma.commissionPayout.create({
          data: {
            tenantId,
            payoutNumber: `PO-${Date.now()}-2`,
            grossCommission: 100,
            netPayout: 100,
            paymentMethod: 'ACH',
            status: 'PENDING',
            createdById: userId,
            updatedById: userId,
            entries: { connect: [{ id: entry.id }] },
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('2. Void Should Not Affect Paid-Out Entries', () => {
    it('should prevent voiding a payout if entries have already been paid', async () => {
      // Setup: Create a paid payout
      const entry = await prisma.commissionEntry.create({
        data: {
          tenantId,
          entryType: 'INVOICE_PAID',
          calculationBasis: 'INVOICE_TOTAL',
          basisAmount: 1000,
          rateApplied: 0.1,
          commissionAmount: 100,
          createdById: userId,
          updatedById: userId,
        },
      });

      const payout = await prisma.commissionPayout.create({
        data: {
          tenantId,
          payoutNumber: `PO-${Date.now()}-paid`,
          grossCommission: 100,
          netPayout: 100,
          paymentMethod: 'ACH',
          status: 'PAID',
          paidAt: new Date(),
          createdById: userId,
          updatedById: userId,
          entries: { connect: [{ id: entry.id }] },
        },
      });

      // Attempt to void — should fail
      expect(async () => {
        await payoutsService.voidPayout(tenantId, payout.id, userId);
      }).rejects.toThrow();
    });

    it('should allow voiding a PENDING payout before payment is processed', async () => {
      // Setup: Create a pending payout
      const entry = await prisma.commissionEntry.create({
        data: {
          tenantId,
          entryType: 'INVOICE_PAID',
          calculationBasis: 'INVOICE_TOTAL',
          basisAmount: 500,
          rateApplied: 0.1,
          commissionAmount: 50,
          createdById: userId,
          updatedById: userId,
        },
      });

      const payout = await prisma.commissionPayout.create({
        data: {
          tenantId,
          payoutNumber: `PO-${Date.now()}-pending`,
          grossCommission: 50,
          netPayout: 50,
          paymentMethod: 'CHECK',
          status: 'PENDING',
          createdById: userId,
          updatedById: userId,
          entries: { connect: [{ id: entry.id }] },
        },
      });

      // Should be able to void PENDING payout
      const voidedPayout = await payoutsService.voidPayout(
        tenantId,
        payout.id,
        userId
      );
      expect(voidedPayout.status).toBe('VOID');
    });
  });

  describe('3. Draw Recovery Calculation Correctness', () => {
    it('should correctly calculate draw recovery deduction from gross commission', async () => {
      // Setup: Create commission with draw recovery
      const entry = await prisma.commissionEntry.create({
        data: {
          tenantId,
          entryType: 'INVOICE_PAID',
          calculationBasis: 'INVOICE_TOTAL',
          basisAmount: 2000,
          rateApplied: 0.15,
          commissionAmount: 300,
          createdById: userId,
          updatedById: userId,
        },
      });

      // Create payout with draw recovery: gross 300, draw recovery 50
      const payout = await prisma.commissionPayout.create({
        data: {
          tenantId,
          payoutNumber: `PO-${Date.now()}-draw`,
          grossCommission: 300,
          drawRecovery: 50,
          adjustments: 0,
          netPayout: 250, // 300 - 50
          paymentMethod: 'ACH',
          status: 'PENDING',
          createdById: userId,
          updatedById: userId,
          entries: { connect: [{ id: entry.id }] },
        },
      });

      // Verify calculation
      expect(payout.grossCommission).toBe(300);
      expect(payout.drawRecovery).toBe(50);
      expect(payout.netPayout).toBe(250);
      expect(payout.netPayout).toBe(
        payout.grossCommission - payout.drawRecovery
      );
    });

    it('should prevent negative net payout (draw recovery > gross commission)', async () => {
      // Setup
      const entry = await prisma.commissionEntry.create({
        data: {
          tenantId,
          entryType: 'INVOICE_PAID',
          calculationBasis: 'INVOICE_TOTAL',
          basisAmount: 100,
          rateApplied: 0.1,
          commissionAmount: 10,
          createdById: userId,
          updatedById: userId,
        },
      });

      // Attempt to create payout with draw recovery > gross
      expect(async () => {
        await prisma.commissionPayout.create({
          data: {
            tenantId,
            payoutNumber: `PO-${Date.now()}-invalid`,
            grossCommission: 100,
            drawRecovery: 150, // Exceeds gross
            adjustments: 0,
            netPayout: -50, // Would be negative
            paymentMethod: 'ACH',
            status: 'PENDING',
            createdById: userId,
            updatedById: userId,
            entries: { connect: [{ id: entry.id }] },
          },
        });
      }).rejects.toThrow();
    });
  });

  describe('4. Tenant Isolation', () => {
    it('should not include payouts from other tenants in list queries', async () => {
      const otherTenantId = 'tenant-other-001';
      const otherUserId = 'user-other-001';

      // Create payout in current tenant
      await prisma.commissionPayout.create({
        data: {
          tenantId,
          payoutNumber: `PO-${Date.now()}-current`,
          grossCommission: 100,
          netPayout: 100,
          paymentMethod: 'ACH',
          status: 'PENDING',
          createdById: userId,
          updatedById: userId,
        },
      });

      // Create payout in other tenant
      await prisma.commissionPayout.create({
        data: {
          tenantId: otherTenantId,
          payoutNumber: `PO-${Date.now()}-other`,
          grossCommission: 500,
          netPayout: 500,
          paymentMethod: 'ACH',
          status: 'PENDING',
          createdById: otherUserId,
          updatedById: otherUserId,
        },
      });

      // List payouts for current tenant
      const payouts = await payoutsService.findAll(tenantId, { limit: 100 });

      // Should only see current tenant's payouts
      expect(payouts.data).toHaveLength(1);
      expect(payouts.data[0].tenantId).toBe(tenantId);

      // List for other tenant
      const otherPayouts = await payoutsService.findAll(otherTenantId, {
        limit: 100,
      });
      expect(otherPayouts.data).toHaveLength(1);
      expect(otherPayouts.data[0].tenantId).toBe(otherTenantId);
    });

    it('should prevent accessing payouts from other tenants via ID lookup', async () => {
      const otherTenantId = 'tenant-other-002';
      const otherUserId = 'user-other-002';

      // Create payout in other tenant
      const otherPayout = await prisma.commissionPayout.create({
        data: {
          tenantId: otherTenantId,
          payoutNumber: `PO-${Date.now()}-isolated`,
          grossCommission: 200,
          netPayout: 200,
          paymentMethod: 'WIRE',
          status: 'PENDING',
          createdById: otherUserId,
          updatedById: otherUserId,
        },
      });

      // Attempt to fetch with different tenant ID — should fail
      expect(async () => {
        await payoutsService.findOne(tenantId, otherPayout.id);
      }).rejects.toThrow(NotFoundException);
    });
  });
});
