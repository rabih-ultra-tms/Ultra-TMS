import { Test, TestingModule } from '@nestjs/testing';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import { PrismaService } from '../../../prisma.service';

describe('ChartOfAccountsService', () => {
  let service: ChartOfAccountsService;
  let prisma: {
    chartOfAccount: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      updateMany: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      chartOfAccount: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartOfAccountsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ChartOfAccountsService);
  });

  it('creates a chart of account with defaults', async () => {
    prisma.chartOfAccount.create.mockResolvedValue({ id: 'acct-1' });

    await service.create('tenant-1', { accountNumber: '1000', accountName: 'Cash' } as any);

    expect(prisma.chartOfAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          accountNumber: '1000',
          accountName: 'Cash',
          isActive: true,
          isSystemAccount: false,
          balance: 0,
        }),
      }),
    );
  });

  it('finds all accounts with filters', async () => {
    prisma.chartOfAccount.findMany.mockResolvedValue([]);

    await service.findAll('tenant-1', { type: 'ASSET', active: true });

    expect(prisma.chartOfAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', accountType: 'ASSET', isActive: true }),
      }),
    );
  });

  it('finds one account by id and tenant', async () => {
    prisma.chartOfAccount.findFirst.mockResolvedValue({ id: 'acct-1' });

    await service.findOne('acct-1', 'tenant-1');

    expect(prisma.chartOfAccount.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'acct-1', tenantId: 'tenant-1' } }),
    );
  });

  it('updates an account', async () => {
    prisma.chartOfAccount.updateMany.mockResolvedValue({ count: 1 });

    await service.update('acct-1', 'tenant-1', { accountName: 'Bank' });

    expect(prisma.chartOfAccount.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'acct-1', tenantId: 'tenant-1' },
        data: expect.objectContaining({ accountName: 'Bank' }),
      }),
    );
  });

  it('deletes non-system account', async () => {
    prisma.chartOfAccount.deleteMany.mockResolvedValue({ count: 1 });

    await service.delete('acct-1', 'tenant-1');

    expect(prisma.chartOfAccount.deleteMany).toHaveBeenCalledWith({
      where: { id: 'acct-1', tenantId: 'tenant-1', isSystemAccount: false },
    });
  });

  it('returns trial balance and balanced flag', async () => {
    prisma.chartOfAccount.findMany.mockResolvedValue([
      { accountNumber: '1000', accountName: 'Cash', normalBalance: 'DEBIT', balance: 500 },
      { accountNumber: '2000', accountName: 'Revenue', normalBalance: 'CREDIT', balance: 500 },
    ]);

    const result = await service.getTrialBalance('tenant-1', new Date('2024-01-01T00:00:00.000Z'));

    expect(result.totalDebits).toBe(500);
    expect(result.totalCredits).toBe(500);
    expect(result.isBalanced).toBe(true);
  });
});
