import { Test, TestingModule } from '@nestjs/testing';
import { PreferencesService } from './preferences.service';
import { PrismaService } from '../../../prisma.service';
import { ConfigCacheService } from '../config-cache.service';

describe('PreferencesService', () => {
  let service: PreferencesService;
  let prisma: any;
  let cache: any;

  beforeEach(async () => {
    prisma = {
      systemConfig: { findMany: jest.fn() },
      userPreference: { findMany: jest.fn(), upsert: jest.fn(), deleteMany: jest.fn() },
      tenantConfig: { findMany: jest.fn() },
      $transaction: jest.fn(),
    };
    cache = { getSystemList: jest.fn(), setSystemList: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreferencesService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigCacheService, useValue: cache },
      ],
    }).compile();

    service = module.get(PreferencesService);
  });

  it('lists merged preferences', async () => {
    cache.getSystemList.mockResolvedValue([{ key: 'sys', value: 1 }]);
    prisma.$transaction.mockResolvedValue([[], []]);

    const result = await service.list('tenant-1', 'user-1');

    expect(result[0].key).toBe('sys');
  });

  it('loads system configs when cache miss', async () => {
    cache.getSystemList.mockResolvedValue(null);
    prisma.systemConfig.findMany.mockResolvedValue([{ key: 'sys', value: 1 }]);
    prisma.$transaction.mockResolvedValue([[], []]);

    const result = await service.list('tenant-1', 'user-1');

    expect(cache.setSystemList).toHaveBeenCalled();
    expect(result[0]).toEqual({ key: 'sys', value: 1, source: 'system' });
  });

  it('merges tenant and user preferences', async () => {
    cache.getSystemList.mockResolvedValue([{ key: 'theme', value: 'light' }]);
    prisma.$transaction.mockResolvedValue([
      [{ preferenceKey: 'theme', preferenceValue: 'dark' }],
      [{ configKey: 'timezone', configValue: 'UTC' }],
    ]);

    const result = await service.list('tenant-1', 'user-1');

    expect(result.find((item: any) => item.key === 'theme')?.source).toBe('user');
    expect(result.find((item: any) => item.key === 'timezone')?.source).toBe('tenant');
  });

  it('sets preference', async () => {
    prisma.userPreference.upsert.mockResolvedValue({ id: 'p1' });

    const result = await service.set('tenant-1', 'user-1', { key: 'theme', value: 'dark' } as any);

    expect(result).toEqual({ id: 'p1' });
  });

  it('resets preference', async () => {
    prisma.userPreference.deleteMany.mockResolvedValue({});

    const result = await service.reset('tenant-1', 'user-1', 'theme');

    expect(result.reset).toBe(true);
  });

  it('bulk sets preferences', async () => {
    prisma.userPreference.upsert.mockResolvedValue({ id: 'p1' });

    const result = await service.bulk('tenant-1', 'user-1', { prefs: [{ key: 'theme', value: 'dark' }] } as any);

    expect(result.length).toBe(1);
  });
});
