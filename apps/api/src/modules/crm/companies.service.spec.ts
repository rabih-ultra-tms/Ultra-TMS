import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../../prisma.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prisma: {
    company: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      groupBy: jest.Mock;
    };
    order: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
    hubspotSyncLog: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      company: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        groupBy: jest.fn(),
      },
      order: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      hubspotSyncLog: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CompaniesService);
  });

  it('findAll applies search filter and deletedAt', async () => {
    prisma.company.findMany.mockResolvedValue([]);
    prisma.company.count.mockResolvedValue(0);

    await service.findAll('tenant-1', { search: 'acme' });

    expect(prisma.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          deletedAt: null,
          OR: expect.any(Array),
        }),
      }),
    );
  });

  it('findAll returns paginated companies for tenant', async () => {
    prisma.company.findMany.mockResolvedValue([{ id: 'cmp-1' }]);
    prisma.company.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', { page: 2, limit: 5 });

    expect(result.data).toEqual([{ id: 'cmp-1' }]);
    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
  });

  it('findAll filters by companyType when provided', async () => {
    prisma.company.findMany.mockResolvedValue([]);
    prisma.company.count.mockResolvedValue(0);

    await service.findAll('tenant-1', { companyType: 'CUSTOMER' });

    expect(prisma.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          deletedAt: null,
          companyType: 'CUSTOMER',
        }),
      }),
    );
  });

  it('throws when company not found', async () => {
    prisma.company.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'cmp-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns company by id', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'cmp-1', name: 'Acme' });

    const result = await service.findOne('tenant-1', 'cmp-1');

    expect(result).toEqual({ id: 'cmp-1', name: 'Acme' });
    expect(prisma.company.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cmp-1', tenantId: 'tenant-1', deletedAt: null },
      }),
    );
  });

  it('findOne excludes deleted companies', async () => {
    prisma.company.findFirst.mockResolvedValue(null);

    await service.findOne('tenant-1', 'cmp-2').catch(() => undefined);

    expect(prisma.company.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cmp-2', tenantId: 'tenant-1', deletedAt: null },
      }),
    );
  });

  it('creates company with defaults', async () => {
    prisma.company.create.mockResolvedValue({ id: 'cmp-1' });

    await service.create('tenant-1', 'user-1', { name: 'Acme' } as any);

    expect(prisma.company.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          name: 'Acme',
          companyType: 'PROSPECT',
          status: 'ACTIVE',
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('returns company orders with pagination', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'cmp-1' });
    prisma.order.findMany.mockResolvedValue([{ id: 'o1' }]);
    prisma.order.count.mockResolvedValue(1);

    const result = await service.getCompanyOrders('tenant-1', 'cmp-1', { page: 1, limit: 10 });

    expect(result.data).toEqual([{ id: 'o1' }]);
    expect(result.total).toBe(1);
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', customerId: 'cmp-1' } }),
    );
  });

  it('syncs company to HubSpot', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'cmp-1', name: 'Acme', email: 'a@b.com' });
    prisma.hubspotSyncLog.create.mockResolvedValue({ id: 'log-1' });

    const result = await service.syncToHubspot('tenant-1', 'cmp-1', 'user-1');

    expect(result).toEqual({ success: true, message: 'Sync queued', companyId: 'cmp-1' });
    expect(prisma.hubspotSyncLog.create).toHaveBeenCalled();
  });

  it('assigns reps to company', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'cmp-1' });
    prisma.company.update.mockResolvedValue({ id: 'cmp-1', assignedUserId: 'rep-1' });

    const result = await service.assignReps('tenant-1', 'cmp-1', 'user-1', { salesRepId: 'rep-1' });

    expect(result.assignedUserId).toBe('rep-1');
    expect(prisma.company.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ assignedUserId: 'rep-1', updatedById: 'user-1' }) }),
    );
  });

  it('updates tier and returns previous tier', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'cmp-1', tier: 'B' });
    prisma.company.update.mockResolvedValue({ id: 'cmp-1', tier: 'A' });

    const result = await service.updateTier('tenant-1', 'cmp-1', 'user-1', 'A');

    expect(result.tier).toBe('A');
    expect(result.previousTier).toBe('B');
  });

  it('soft deletes company', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'cmp-1' });
    prisma.company.update.mockResolvedValue({ id: 'cmp-1' });

    await service.delete('tenant-1', 'cmp-1', 'user-1');

    expect(prisma.company.update).toHaveBeenCalledWith({
      where: { id: 'cmp-1' },
      data: { deletedAt: expect.any(Date), updatedById: 'user-1' },
    });
  });

  it('throws when deleting missing company', async () => {
    prisma.company.findFirst.mockResolvedValue(null);

    await expect(
      service.delete('tenant-1', 'cmp-404', 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when updating missing company', async () => {
    prisma.company.findFirst.mockResolvedValue(null);

    await expect(
      service.update('tenant-1', 'cmp-1', 'user-1', { name: 'Updated' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('updates company and sets updatedById', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'cmp-1' });
    prisma.company.update.mockResolvedValue({ id: 'cmp-1', name: 'Updated' });

    const result = await service.update('tenant-1', 'cmp-1', 'user-1', { name: 'Updated' } as any);

    expect(result.name).toBe('Updated');
    expect(prisma.company.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cmp-1' },
        data: expect.objectContaining({ name: 'Updated', updatedById: 'user-1' }),
      }),
    );
  });

  it('returns stats grouped by segment', async () => {
    prisma.company.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2);
    prisma.company.groupBy.mockResolvedValue([
      { segment: 'SMB', _count: 2 },
      { segment: null, _count: 1 },
    ]);

    const result = await service.getStats('tenant-1');

    expect(result.bySegment).toEqual({ SMB: 2, UNKNOWN: 1 });
  });
});
