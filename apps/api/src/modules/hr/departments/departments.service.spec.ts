import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { PrismaService } from '../../../prisma.service';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let prisma: {
    department: {
      findMany: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      department: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartmentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(DepartmentsService);
  });

  it('lists departments', async () => {
    prisma.department.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.department.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
  });

  it('creates department', async () => {
    prisma.department.create.mockResolvedValue({ id: 'd1' });

    await service.create('tenant-1', { name: 'Ops', code: 'OPS' } as any);

    expect(prisma.department.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tenantId: 'tenant-1', name: 'Ops' }) }),
    );
  });

  it('throws when department not found', async () => {
    prisma.department.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'd1')).rejects.toThrow(NotFoundException);
  });

  it('updates department', async () => {
    prisma.department.findFirst.mockResolvedValue({ id: 'd1' });
    prisma.department.update.mockResolvedValue({ id: 'd1' });

    await service.update('tenant-1', 'd1', { name: 'Updated' } as any);

    expect(prisma.department.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: 'Updated' }) }),
    );
  });

  it('removes department', async () => {
    prisma.department.findFirst.mockResolvedValue({ id: 'd1' });
    prisma.department.delete.mockResolvedValue({ id: 'd1' });

    const result = await service.remove('tenant-1', 'd1');

    expect(result).toEqual({ deleted: true });
  });
});