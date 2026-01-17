import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ApiAuditService } from './api-audit.service';
import { PrismaService } from '../../../prisma.service';

describe('ApiAuditService', () => {
  let service: ApiAuditService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { aPIAuditLog: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiAuditService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ApiAuditService);
  });

  it('lists api audits', async () => {
    prisma.aPIAuditLog.findMany.mockResolvedValue([]);
    prisma.aPIAuditLog.count.mockResolvedValue(0);

    const result = await service.list('tenant-1', {} as any);

    expect(result.total).toBe(0);
  });

  it('lists api errors', async () => {
    prisma.aPIAuditLog.findMany.mockResolvedValue([]);
    prisma.aPIAuditLog.count.mockResolvedValue(0);

    const result = await service.listErrors('tenant-1', { statusFrom: 400 } as any);

    expect(result.total).toBe(0);
  });

  it('throws when log missing', async () => {
    prisma.aPIAuditLog.findFirst.mockResolvedValue(null);

    await expect(service.findById('tenant-1', 'l1')).rejects.toThrow(NotFoundException);
  });
});
