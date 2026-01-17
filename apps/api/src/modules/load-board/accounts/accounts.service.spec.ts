import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../../../prisma.service';

describe('AccountsService', () => {
  let service: AccountsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      loadBoardAccount: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
      loadBoardProvider: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AccountsService);
  });

  it('lists accounts', async () => {
    prisma.loadBoardAccount.findMany.mockResolvedValue([]);
    prisma.loadBoardAccount.count.mockResolvedValue(0);

    const result = await service.list('t1', {} as any);

    expect(result.total).toBe(0);
  });

  it('filters accounts by provider and active status', async () => {
    prisma.loadBoardAccount.findMany.mockResolvedValue([]);
    prisma.loadBoardAccount.count.mockResolvedValue(0);

    await service.list('t1', { providerId: 'p1', isActive: true } as any);

    expect(prisma.loadBoardAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1', deletedAt: null, providerId: 'p1', isActive: true } }),
    );
  });

  it('throws when account missing', async () => {
    prisma.loadBoardAccount.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'a1')).rejects.toThrow(NotFoundException);
  });

  it('returns account by id', async () => {
    prisma.loadBoardAccount.findFirst.mockResolvedValue({ id: 'a1' });

    const result = await service.findOne('t1', 'a1');

    expect(result).toEqual({ id: 'a1' });
  });

  it('creates account', async () => {
    prisma.loadBoardProvider.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.loadBoardAccount.create.mockResolvedValue({ id: 'a1' });

    const result = await service.create('t1', 'u1', { providerId: 'p1', accountName: 'Acct' } as any);

    expect(result.id).toBe('a1');
  });

  it('throws when provider missing', async () => {
    prisma.loadBoardProvider.findFirst.mockResolvedValue(null);

    await expect(service.create('t1', 'u1', { providerId: 'missing', accountName: 'Acct' } as any)).rejects.toThrow(NotFoundException);
  });

  it('updates account and sets verified on connected', async () => {
    prisma.loadBoardAccount.findFirst.mockResolvedValue({ id: 'a1', customFields: {}, lastVerifiedAt: null, isVerified: false });
    prisma.loadBoardAccount.update.mockResolvedValue({ id: 'a1', isVerified: true });

    const result = await service.update('t1', 'a1', { connectionStatus: 'CONNECTED', credentials: { apiKey: 'k' } } as any);

    expect(result.isVerified).toBe(true);
    expect(prisma.loadBoardAccount.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isVerified: true, lastVerifiedAt: expect.any(Date) }),
      }),
    );
  });

  it('removes account with soft delete', async () => {
    prisma.loadBoardAccount.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.loadBoardAccount.update.mockResolvedValue({ id: 'a1' });

    const result = await service.remove('t1', 'a1');

    expect(result).toEqual({ success: true });
    expect(prisma.loadBoardAccount.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date), isActive: false }) }),
    );
  });

  it('tests connection', async () => {
    prisma.loadBoardAccount.findFirst.mockResolvedValue({ id: 'a1', customFields: {} });
    prisma.loadBoardAccount.update.mockResolvedValue({ id: 'a1' });

    const result = await service.testConnection('t1', 'a1');

    expect(result.success).toBe(true);
  });
});
