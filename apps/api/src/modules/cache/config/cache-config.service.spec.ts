import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CacheConfigService } from './cache-config.service';
import { PrismaService } from '../../../prisma.service';

describe('CacheConfigService', () => {
  let service: CacheConfigService;
  let prisma: {
    cacheConfig: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    cacheInvalidationRule: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      cacheConfig: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      cacheInvalidationRule: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheConfigService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CacheConfigService);
  });

  it('lists configs by tenant', async () => {
    prisma.cacheConfig.findMany.mockResolvedValue([]);

    await service.listConfigs('tenant-1');

    expect(prisma.cacheConfig.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
  });

  it('throws when updating missing config', async () => {
    prisma.cacheConfig.findFirst.mockResolvedValue(null);

    await expect(
      service.updateConfig('tenant-1', 'ttl', { ttlSeconds: 60 } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('updates config with existing cacheType', async () => {
    prisma.cacheConfig.findFirst.mockResolvedValue({
      cacheType: 'LOADS',
      ttlSeconds: 300,
      tags: ['t1'],
      customFields: null,
    });
    prisma.cacheConfig.update.mockResolvedValue({ key: 'ttl' });

    await service.updateConfig('tenant-1', 'ttl', { ttlSeconds: 120, tags: ['t2'] } as any);

    expect(prisma.cacheConfig.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId_cacheType_key: { tenantId: 'tenant-1', cacheType: 'LOADS', key: 'ttl' } },
        data: expect.objectContaining({ ttlSeconds: 120, tags: ['t2'] }),
      }),
    );
  });

  it('lists invalidation rules ordered by createdAt', async () => {
    prisma.cacheInvalidationRule.findMany.mockResolvedValue([]);

    await service.listRules('tenant-1');

    expect(prisma.cacheInvalidationRule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' }, orderBy: { createdAt: 'desc' } }),
    );
  });
});