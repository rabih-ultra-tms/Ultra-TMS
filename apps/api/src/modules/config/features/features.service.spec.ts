import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FeaturesService } from './features.service';
import { PrismaService } from '../../../prisma.service';
import { ConfigCacheService } from '../config-cache.service';
import { FeatureFlagEvaluator } from './feature-flag.evaluator';

describe('FeaturesService', () => {
  let service: FeaturesService;
  let prisma: any;
  let cache: any;
  let evaluator: { isEnabled: jest.Mock };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      featureFlag: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      featureFlagOverride: { findFirst: jest.fn(), update: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
    };
    cache = { getFeature: jest.fn(), setFeature: jest.fn(), invalidateFeature: jest.fn() };
    evaluator = { isEnabled: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeaturesService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigCacheService, useValue: cache },
        { provide: FeatureFlagEvaluator, useValue: evaluator },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(FeaturesService);
  });

  it('gets feature from cache', async () => {
    cache.getFeature.mockResolvedValue({ key: 'feature' });

    const result = await service.get('feature');

    expect(result).toEqual({ key: 'feature' });
  });

  it('throws when feature missing', async () => {
    cache.getFeature.mockResolvedValue(null);
    prisma.featureFlag.findUnique.mockResolvedValue(null);

    await expect(service.get('feature')).rejects.toThrow(NotFoundException);
  });

  it('creates feature flag', async () => {
    prisma.featureFlag.create.mockResolvedValue({ id: 'f1' });

    await service.create({ code: 'feature', name: 'Feature' } as any, 'user-1');

    expect(prisma.featureFlag.create).toHaveBeenCalled();
    expect(cache.invalidateFeature).toHaveBeenCalledWith('feature');
  });

  it('checks enabled state', async () => {
    jest.spyOn(service, 'get').mockResolvedValue({ id: 'f1' } as any);
    evaluator.isEnabled.mockReturnValue(true);

    const result = await service.checkEnabled('feature', 'tenant-1', 'user-1');

    expect(result.enabled).toBe(true);
  });

  it('sets override and emits event', async () => {
    jest.spyOn(service, 'get').mockResolvedValue({ id: 'f1' } as any);
    prisma.featureFlagOverride.findFirst.mockResolvedValue(null);
    prisma.featureFlagOverride.create.mockResolvedValue({ id: 'o1' });

    await service.setOverride('feature', 'tenant-1', { isEnabled: true } as any, 'user-1');

    expect(events.emit).toHaveBeenCalledWith('feature.enabled', { flagCode: 'feature', tenantId: 'tenant-1' });
  });

  it('removes override and emits event', async () => {
    jest.spyOn(service, 'get').mockResolvedValue({ id: 'f1' } as any);
    prisma.featureFlagOverride.deleteMany.mockResolvedValue({});

    const result = await service.removeOverride('feature', 'tenant-1');

    expect(result.removed).toBe(true);
    expect(events.emit).toHaveBeenCalledWith('feature.disabled', { flagCode: 'feature', tenantId: 'tenant-1' });
  });
});
