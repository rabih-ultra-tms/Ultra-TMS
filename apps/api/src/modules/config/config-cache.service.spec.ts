import { Test, TestingModule } from '@nestjs/testing';
import { ConfigCacheService } from './config-cache.service';
import { RedisService } from '../redis/redis.service';

describe('ConfigCacheService', () => {
  let service: ConfigCacheService;
  let redis: {
    getJson: jest.Mock;
    setJson: jest.Mock;
    deleteKeys: jest.Mock;
  };

  beforeEach(async () => {
    redis = {
      getJson: jest.fn(),
      setJson: jest.fn(),
      deleteKeys: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigCacheService, { provide: RedisService, useValue: redis }],
    }).compile();

    service = module.get(ConfigCacheService);
  });

  it('gets and sets system list', async () => {
    redis.getJson.mockResolvedValue([{ key: 'timezone' }]);

    const result = await service.getSystemList();
    await service.setSystemList([{ key: 'timezone' }] as any);

    expect(result).toEqual([{ key: 'timezone' }]);
    expect(redis.setJson).toHaveBeenCalledWith('config:system:list', [{ key: 'timezone' }], 300);
  });

  it('gets and sets system item', async () => {
    redis.getJson.mockResolvedValue({ key: 'timezone' });

    const result = await service.getSystem('timezone');
    await service.setSystem('timezone', { key: 'timezone' } as any);

    expect(result).toEqual({ key: 'timezone' });
    expect(redis.setJson).toHaveBeenCalledWith('config:system:timezone', { key: 'timezone' }, 300);
  });

  it('invalidates system keys with optional key', async () => {
    await service.invalidateSystem('timezone');

    expect(redis.deleteKeys).toHaveBeenCalledWith([
      'config:system:list',
      'config:system:timezone',
    ]);
  });

  it('gets and sets tenant list', async () => {
    redis.getJson.mockResolvedValue([{ key: 'theme' }]);

    const result = await service.getTenantList('tenant-1');
    await service.setTenantList('tenant-1', [{ key: 'theme' }]);

    expect(result).toEqual([{ key: 'theme' }]);
    expect(redis.setJson).toHaveBeenCalledWith('config:tenant:tenant-1:list', [{ key: 'theme' }], 300);
  });

  it('gets and sets tenant item', async () => {
    redis.getJson.mockResolvedValue({ key: 'theme' });

    const result = await service.getTenant('tenant-1', 'theme');
    await service.setTenant('tenant-1', 'theme', { key: 'theme' });

    expect(result).toEqual({ key: 'theme' });
    expect(redis.setJson).toHaveBeenCalledWith('config:tenant:tenant-1:theme', { key: 'theme' }, 300);
  });

  it('invalidates tenant keys with optional key', async () => {
    await service.invalidateTenant('tenant-1', 'theme');

    expect(redis.deleteKeys).toHaveBeenCalledWith([
      'config:tenant:tenant-1:list',
      'config:tenant:tenant-1:theme',
    ]);
  });

  it('gets and sets feature flag', async () => {
    redis.getJson.mockResolvedValue({ code: 'NEW_UI' });

    const result = await service.getFeature('NEW_UI');
    await service.setFeature('NEW_UI', { code: 'NEW_UI' } as any);

    expect(result).toEqual({ code: 'NEW_UI' });
    expect(redis.setJson).toHaveBeenCalledWith('config:feature:NEW_UI', { code: 'NEW_UI' }, 300);
  });

  it('invalidates feature flag', async () => {
    await service.invalidateFeature('NEW_UI');

    expect(redis.deleteKeys).toHaveBeenCalledWith(['config:feature:NEW_UI']);
  });
});