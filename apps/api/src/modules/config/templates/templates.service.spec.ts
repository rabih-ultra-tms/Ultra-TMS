import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { PrismaService } from '../../../prisma.service';
import { ConfigHistoryService } from '../history/config-history.service';

describe('Config TemplatesService', () => {
  let service: TemplatesService;
  let prisma: any;
  let history: any;

  beforeEach(async () => {
    prisma = {
      configTemplate: { findMany: jest.fn(), findFirst: jest.fn() },
      tenantConfig: { findUnique: jest.fn(), upsert: jest.fn() },
      $transaction: jest.fn(),
    };
    history = { record: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigHistoryService, useValue: history },
      ],
    }).compile();

    service = module.get(TemplatesService);
  });

  it('lists templates', async () => {
    prisma.configTemplate.findMany.mockResolvedValue([]);

    const result = await service.list('tenant-1');

    expect(result).toEqual([]);
  });

  it('throws when template missing', async () => {
    prisma.configTemplate.findFirst.mockResolvedValue(null);

    await expect(service.apply('code', 'tenant-1', { } as any)).rejects.toThrow(NotFoundException);
  });

  it('applies template', async () => {
    prisma.configTemplate.findFirst.mockResolvedValue({ templateName: 'Default', defaultValues: { key: 'value' } });
    prisma.$transaction.mockImplementation(async (cb: any) => cb({ tenantConfig: prisma.tenantConfig }));
    prisma.tenantConfig.findUnique.mockResolvedValue(null);
    prisma.tenantConfig.upsert.mockResolvedValue({ configValue: 'value' });

    const result = await service.apply('Default', 'tenant-1', { targetTenantId: 'tenant-1' } as any);

    expect(result.applied).toBe(true);
  });
});
