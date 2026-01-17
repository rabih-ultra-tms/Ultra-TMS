import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { PrismaService } from '../../prisma.service';

describe('ContactsService', () => {
  let service: ContactsService;
  let prisma: {
    contact: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    hubspotSyncLog: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      contact: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      hubspotSyncLog: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ContactsService);
  });

  it('findAll filters by company and deletedAt', async () => {
    prisma.contact.findMany.mockResolvedValue([]);
    prisma.contact.count.mockResolvedValue(0);

    await service.findAll('tenant-1', { companyId: 'cmp-1' });

    expect(prisma.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', deletedAt: null, companyId: 'cmp-1' },
      }),
    );
  });

  it('findAll applies search filter', async () => {
    prisma.contact.findMany.mockResolvedValue([]);
    prisma.contact.count.mockResolvedValue(0);

    await service.findAll('tenant-1', { search: 'alex' });

    expect(prisma.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          deletedAt: null,
          OR: expect.any(Array),
        }),
      }),
    );
  });

  it('throws when contact not found', async () => {
    prisma.contact.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'ct-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns contact by id', async () => {
    prisma.contact.findFirst.mockResolvedValue({ id: 'ct-1', firstName: 'Alex' });

    const result = await service.findOne('tenant-1', 'ct-1');

    expect(result).toEqual({ id: 'ct-1', firstName: 'Alex' });
  });

  it('creates contact with defaults', async () => {
    prisma.contact.create.mockResolvedValue({ id: 'ct-1' });

    await service.create('tenant-1', 'user-1', { firstName: 'A' } as any);

    expect(prisma.contact.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          firstName: 'A',
          customFields: {},
          tags: [],
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('updates contact and sets updatedById', async () => {
    prisma.contact.findFirst.mockResolvedValue({ id: 'ct-1' });
    prisma.contact.update.mockResolvedValue({ id: 'ct-1', lastName: 'Smith' });

    const result = await service.update('tenant-1', 'ct-1', 'user-1', { lastName: 'Smith' } as any);

    expect(result.lastName).toBe('Smith');
    expect(prisma.contact.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ lastName: 'Smith', updatedById: 'user-1' }),
      }),
    );
  });

  it('soft deletes contact', async () => {
    prisma.contact.findFirst.mockResolvedValue({ id: 'ct-1' });
    prisma.contact.update.mockResolvedValue({ id: 'ct-1' });

    await service.delete('tenant-1', 'ct-1', 'user-1');

    expect(prisma.contact.update).toHaveBeenCalledWith({
      where: { id: 'ct-1' },
      data: { deletedAt: expect.any(Date), updatedById: 'user-1' },
    });
  });

  it('syncs contact to HubSpot', async () => {
    prisma.contact.findFirst.mockResolvedValue({ id: 'ct-1', firstName: 'A', lastName: 'B', email: 'a@b.com' });
    prisma.hubspotSyncLog.create.mockResolvedValue({ id: 'log-1' });

    const result = await service.syncToHubspot('tenant-1', 'ct-1', 'user-1');

    expect(result).toEqual({ success: true, message: 'Sync queued', contactId: 'ct-1' });
    expect(prisma.hubspotSyncLog.create).toHaveBeenCalled();
  });

  it('returns message when contact has no company for setPrimary', async () => {
    prisma.contact.findFirst.mockResolvedValue({ id: 'ct-1', companyId: null });

    const result = await service.setPrimary('tenant-1', 'ct-1', 'user-1');

    expect(result).toEqual({
      success: false,
      message: 'Contact must be associated with a company',
    });
  });

  it('sets primary contact and clears others', async () => {
    prisma.contact.findFirst.mockResolvedValue({ id: 'ct-1', companyId: 'cmp-1' });
    prisma.contact.updateMany.mockResolvedValue({ count: 1 });
    prisma.contact.update.mockResolvedValue({ id: 'ct-1', isPrimary: true });

    const result = await service.setPrimary('tenant-1', 'ct-1', 'user-1');

    expect(result).toEqual({ id: 'ct-1', isPrimary: true });
    expect(prisma.contact.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', companyId: 'cmp-1', isPrimary: true } }),
    );
  });

  it('finds contact by email', async () => {
    prisma.contact.findFirst.mockResolvedValue({ id: 'ct-1', email: 'a@b.com' });

    const result = await service.findByEmail('tenant-1', 'a@b.com');

    expect(result).toEqual({ id: 'ct-1', email: 'a@b.com' });
    expect(prisma.contact.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', email: 'a@b.com', deletedAt: null } }),
    );
  });
});
