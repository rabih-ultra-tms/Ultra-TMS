import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { PrismaService } from '../../prisma.service';

describe('Carrier ContactsService', () => {
  let service: ContactsService;
  let prisma: {
    carrier: { findFirst: jest.Mock };
    carrierContact: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      carrier: { findFirst: jest.fn() },
      carrierContact: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ContactsService);
  });

  it('throws when carrier missing on list', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(service.list('tenant-1', 'car-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates contact and clears primary when needed', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.carrierContact.create.mockResolvedValue({ id: 'ct-1' });

    await service.create('tenant-1', 'car-1', { firstName: 'A', isPrimary: true } as any);

    expect(prisma.carrierContact.updateMany).toHaveBeenCalled();
    expect(prisma.carrierContact.create).toHaveBeenCalled();
  });

  it('prevents deleting only primary contact', async () => {
    prisma.carrierContact.findFirst.mockResolvedValue({ id: 'ct-1', isPrimary: true });
    prisma.carrierContact.count.mockResolvedValue(0);

    await expect(service.remove('tenant-1', 'car-1', 'ct-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('lists contacts for carrier', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.carrierContact.findMany.mockResolvedValue([{ id: 'ct-1' }]);

    const result = await service.list('tenant-1', 'car-1');

    expect(result).toEqual([{ id: 'ct-1' }]);
  });

  it('updates contact', async () => {
    prisma.carrierContact.findFirst.mockResolvedValue({ id: 'ct-1' });
    prisma.carrierContact.update.mockResolvedValue({ id: 'ct-1', firstName: 'Updated' });

    const result = await service.update('tenant-1', 'car-1', 'ct-1', { firstName: 'Updated' } as any);

    expect(result.firstName).toBe('Updated');
  });

  it('removes contact when allowed', async () => {
    prisma.carrierContact.findFirst.mockResolvedValue({ id: 'ct-1', isPrimary: false });
    prisma.carrierContact.count.mockResolvedValue(2);
    prisma.carrierContact.update.mockResolvedValue({ id: 'ct-1' });

    const result = await service.remove('tenant-1', 'car-1', 'ct-1');

    expect(result.success).toBe(true);
  });
});
