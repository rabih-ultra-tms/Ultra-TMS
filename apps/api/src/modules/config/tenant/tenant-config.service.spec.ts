import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TenantConfigService } from './tenant-config.service';
import { PrismaService } from '../../../prisma.service';
import { ConfigCacheService } from '../config-cache.service';
import { ConfigHistoryService } from '../history/config-history.service';

describe('TenantConfigService', () => {
  let service: TenantConfigService;
  let prisma: any;
  let cache: any;
  let history: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      tenantConfig: { findMany: jest.fn(), findUnique: jest.fn(), upsert: jest.fn(), deleteMany: jest.fn() },
      systemConfig: { findMany: jest.fn(), findUnique: jest.fn() },
      $transaction: jest.fn(),
    };
    cache = { getTenantList: jest.fn(), setTenantList: jest.fn(), getTenant: jest.fn(), setTenant: jest.fn(), getSystem: jest.fn(), setSystem: jest.fn(), invalidateTenant: jest.fn(), setSystemList: jest.fn() };
    history = { record: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantConfigService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigCacheService, useValue: cache },
        { provide: ConfigHistoryService, useValue: history },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(TenantConfigService);
  });

  it('lists tenant config', async () => {
    cache.getTenantList.mockResolvedValue(null);
    prisma.$transaction.mockResolvedValue([[], []]);
    prisma.systemConfig.findMany.mockResolvedValue([]);

    const result = await service.list('tenant-1');

    expect(result).toEqual([]);
  });

  it('returns cached tenant list', async () => {
    cache.getTenantList.mockResolvedValue([{ key: 'k1' }]);

    const result = await service.list('tenant-1');

    expect(result).toEqual([{ key: 'k1' }]);
  });

  it('gets config from cache', async () => {
    cache.getTenant.mockResolvedValue({ key: 'k1' });

    const result = await service.get('tenant-1', 'k1');

    expect(result).toEqual({ key: 'k1' });
  });

  it('gets tenant-specific config when present', async () => {
    cache.getTenant.mockResolvedValue(null);
    prisma.tenantConfig.findUnique.mockResolvedValue({ configKey: 'k1', configValue: 'v1' });

    const result = await service.get('tenant-1', 'k1');

    expect(result).toEqual(expect.objectContaining({ key: 'k1', value: 'v1', source: 'tenant' }));
    expect(cache.setTenant).toHaveBeenCalled();
  });

  it('falls back to system config when tenant missing', async () => {
    cache.getTenant.mockResolvedValue(null);
    prisma.tenantConfig.findUnique.mockResolvedValue(null);
    cache.getSystem.mockResolvedValue(null);
    prisma.systemConfig.findUnique.mockResolvedValue({ key: 'k1', value: 'sys', category: 'cat', dataType: 'STRING' });

    const result = await service.get('tenant-1', 'k1');

    expect(result).toEqual(expect.objectContaining({ key: 'k1', value: 'sys', source: 'system' }));
  });

  it('sets config and emits', async () => {
    jest.spyOn(service, 'get').mockResolvedValue(null as any);
    prisma.tenantConfig.upsert.mockResolvedValue({ configValue: 'v' });

    const result = await service.set('tenant-1', 'user-1', { key: 'k1', value: 'v' } as any);

    expect(result.configValue).toBe('v');
    expect(events.emit).toHaveBeenCalledWith('config.tenant.updated', { tenantId: 'tenant-1', key: 'k1' });
  });

  it('records history on set with old value', async () => {
    jest.spyOn(service, 'get').mockResolvedValue({ configValue: 'old' } as any);
    prisma.tenantConfig.upsert.mockResolvedValue({ configValue: 'new' });

    await service.set('tenant-1', 'user-1', { key: 'k1', value: 'new', description: 'update' } as any);

    expect(history.record).toHaveBeenCalledWith(
      expect.objectContaining({ oldValue: 'old', newValue: 'new', key: 'k1', changedBy: 'user-1' }),
    );
  });

  it('resets config', async () => {
    prisma.tenantConfig.deleteMany.mockResolvedValue({});
    cache.invalidateTenant.mockResolvedValue({});
    jest.spyOn(service, 'get').mockResolvedValue(null as any);

    const result = await service.reset('tenant-1', 'k1');

    expect(result.reset).toBe(true);
  });

  it('returns fallback value on reset', async () => {
    prisma.tenantConfig.deleteMany.mockResolvedValue({});
    cache.invalidateTenant.mockResolvedValue({});
    jest.spyOn(service, 'get').mockResolvedValue({ configValue: 'sys' } as any);

    const result = await service.reset('tenant-1', 'k1');

    expect(result.value).toBe('sys');
  });

  it('bulk updates configs', async () => {
    jest.spyOn(service, 'set').mockResolvedValue({ configValue: 'v' } as any);

    const result = await service.bulk('tenant-1', 'user-1', { configs: [{ key: 'k1', value: 'v' }] } as any);

    expect(result.length).toBe(1);
  });
});
