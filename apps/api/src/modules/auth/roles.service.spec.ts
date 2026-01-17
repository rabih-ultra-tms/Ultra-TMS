import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { PrismaService } from '../../prisma.service';

describe('RolesService', () => {
  let service: RolesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { role: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() }, user: { count: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(RolesService);
  });

  it('lists roles', async () => {
    prisma.role.findMany.mockResolvedValue([]);

    const result = await service.findAll('tenant-1');

    expect(result).toEqual([]);
  });

  it('throws when role missing', async () => {
    prisma.role.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'r1')).rejects.toThrow(NotFoundException);
  });

  it('prevents updating system role', async () => {
    prisma.role.findFirst.mockResolvedValue({ id: 'r1', isSystem: true });

    await expect(service.update('tenant-1', 'r1', {} as any)).rejects.toThrow(BadRequestException);
  });

  it('prevents deleting role with users', async () => {
    prisma.role.findFirst.mockResolvedValue({ id: 'r1', isSystem: false });
    prisma.user.count.mockResolvedValue(2);

    await expect(service.delete('tenant-1', 'r1')).rejects.toThrow(BadRequestException);
  });

  it('returns permissions list', async () => {
    const result = await service.getAvailablePermissions();

    expect(result.data.length).toBeGreaterThan(0);
  });
});
