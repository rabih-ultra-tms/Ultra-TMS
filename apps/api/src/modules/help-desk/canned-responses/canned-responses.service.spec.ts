import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CannedResponsesService } from './canned-responses.service';
import { PrismaService } from '../../../prisma.service';

describe('CannedResponsesService', () => {
  let service: CannedResponsesService;
  let prisma: {
    cannedResponse: { findMany: jest.Mock; create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      cannedResponse: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CannedResponsesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CannedResponsesService);
  });

  it('lists responses', async () => {
    prisma.cannedResponse.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.cannedResponse.findMany).toHaveBeenCalled();
  });

  it('creates response', async () => {
    prisma.cannedResponse.create.mockResolvedValue({ id: 'c1' });

    await service.create('tenant-1', 'user-1', { title: 'Hello', content: 'Body' } as any);

    expect(prisma.cannedResponse.create).toHaveBeenCalled();
  });

  it('throws when response missing', async () => {
    prisma.cannedResponse.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'c1')).rejects.toThrow(NotFoundException);
  });

  it('updates response', async () => {
    prisma.cannedResponse.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.cannedResponse.update.mockResolvedValue({ id: 'c1' });

    await service.update('tenant-1', 'user-1', 'c1', { title: 'Updated' } as any);

    expect(prisma.cannedResponse.update).toHaveBeenCalled();
  });

  it('soft deletes response', async () => {
    prisma.cannedResponse.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.cannedResponse.update.mockResolvedValue({ id: 'c1' });

    const result = await service.remove('tenant-1', 'c1');

    expect(result).toEqual({ deleted: true });
  });
});