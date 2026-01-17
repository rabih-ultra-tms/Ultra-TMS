import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service';
import { PrismaService } from '../../../prisma.service';

describe('JournalEntriesService', () => {
  let service: JournalEntriesService;
  let prisma: {
    journalEntry: { findFirst: jest.Mock; create: jest.Mock; update: jest.Mock; findMany: jest.Mock; count: jest.Mock };
    journalEntryLine: { findMany: jest.Mock };
    chartOfAccount: { findFirst: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      journalEntry: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      journalEntryLine: { findMany: jest.fn() },
      chartOfAccount: { findFirst: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JournalEntriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(JournalEntriesService);
  });

  it('rejects unbalanced entry on create', async () => {
    await expect(
      service.create('tenant-1', 'user-1', {
        entryDate: new Date().toISOString(),
        totalDebit: 100,
        totalCredit: 50,
        lines: [],
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when entry not found', async () => {
    prisma.journalEntry.findFirst.mockResolvedValue(null);

    await expect(service.findOne('je-1', 'tenant-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects update when posted', async () => {
    prisma.journalEntry.findFirst.mockResolvedValue({ id: 'je-1', status: 'POSTED' });

    await expect(service.update('je-1', 'tenant-1', {} as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('creates a balanced journal entry', async () => {
    prisma.journalEntry.findFirst.mockResolvedValue(null);
    prisma.journalEntry.create.mockResolvedValue({ id: 'je-1', entryNumber: 'JE-000001' });

    const result = await service.create('tenant-1', 'user-1', {
      entryDate: new Date().toISOString(),
      totalDebit: 100,
      totalCredit: 100,
      lines: [{ lineNumber: 1, accountId: 'acct-1', debitAmount: 100 }],
    } as any);

    expect(result.entryNumber).toBe('JE-000001');
    expect(prisma.journalEntry.create).toHaveBeenCalled();
  });

  it('returns journal entries list with total', async () => {
    prisma.journalEntry.findMany.mockResolvedValue([{ id: 'je-1' }]);
    prisma.journalEntry.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', { status: 'DRAFT' });

    expect(result).toEqual({ entries: [{ id: 'je-1' }], total: 1 });
  });

  it('rejects update when totals are unbalanced', async () => {
    prisma.journalEntry.findFirst.mockResolvedValue({ id: 'je-1', status: 'DRAFT' });

    await expect(
      service.update('je-1', 'tenant-1', { totalDebit: 10, totalCredit: 20 } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('posts journal entry and updates balances', async () => {
    prisma.journalEntry.findFirst.mockResolvedValue({
      id: 'je-1',
      status: 'DRAFT',
      lines: [{ accountId: 'acct-1', debitAmount: 100, creditAmount: 0 }],
    });

    const tx = {
      chartOfAccount: {
        findUnique: jest.fn().mockResolvedValue({ id: 'acct-1', balance: 50, normalBalance: 'DEBIT' }),
        update: jest.fn().mockResolvedValue({ id: 'acct-1', balance: 150 }),
      },
      journalEntry: {
        update: jest.fn().mockResolvedValue({ id: 'je-1', status: 'POSTED' }),
      },
    } as any;

    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const result = await service.post('je-1', 'tenant-1', 'user-1');

    expect(result.status).toBe('POSTED');
    expect(tx.chartOfAccount.update).toHaveBeenCalled();
  });

  it('voids a posted entry and reverses balances', async () => {
    prisma.journalEntry.findFirst.mockResolvedValue({
      id: 'je-1',
      status: 'POSTED',
      lines: [{ accountId: 'acct-1', debitAmount: 100, creditAmount: 0 }],
    });

    const tx = {
      chartOfAccount: {
        findUnique: jest.fn().mockResolvedValue({ id: 'acct-1', balance: 150, normalBalance: 'DEBIT' }),
        update: jest.fn().mockResolvedValue({ id: 'acct-1', balance: 50 }),
      },
      journalEntry: {
        update: jest.fn().mockResolvedValue({ id: 'je-1', status: 'VOID' }),
      },
    } as any;

    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const result = await service.void('je-1', 'tenant-1', 'user-1');

    expect(result.status).toBe('VOID');
    expect(tx.chartOfAccount.update).toHaveBeenCalled();
  });

  it('returns account ledger with transactions', async () => {
    prisma.chartOfAccount.findFirst.mockResolvedValue({
      id: 'acct-1',
      accountNumber: '1000',
      accountName: 'Cash',
      accountType: 'ASSET',
      normalBalance: 'DEBIT',
      balance: 200,
    });
    prisma.journalEntryLine.findMany.mockResolvedValue([{ id: 'line-1' }]);

    const result = await service.getAccountLedger('tenant-1', 'acct-1');

    expect(result.account.id).toBe('acct-1');
    expect(result.transactions).toEqual([{ id: 'line-1' }]);
  });
});
