import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemConfigService } from './system-config.service';
import { PrismaService } from '../../../prisma.service';
import { ConfigCacheService } from '../config-cache.service';
import { ConfigHistoryService } from '../history/config-history.service';

describe('SystemConfigService', () => {
  let service: SystemConfigService;
  let prisma: any;
  let cache: any;
  let history: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = { systemConfig: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() } };
    cache = { getSystemList: jest.fn(), setSystemList: jest.fn(), getSystem: jest.fn(), setSystem: jest.fn(), invalidateSystem: jest.fn() };
    history = { record: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemConfigService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigCacheService, useValue: cache },
        { provide: ConfigHistoryService, useValue: history },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(SystemConfigService);
  });

  it('returns cached list', async () => {
    cache.getSystemList.mockResolvedValue([{ key: 'a', category: 'GENERAL' }]);

    const result = await service.list();

    expect(result.length).toBe(1);
  });

  it('throws when config missing', async () => {
    cache.getSystem.mockResolvedValue(null);
    prisma.systemConfig.findUnique.mockResolvedValue(null);

    await expect(service.get('missing')).rejects.toThrow(NotFoundException);
  });

  it('updates config and records history', async () => {
    prisma.systemConfig.findUnique.mockResolvedValue({ key: 'a', value: 1 });
    prisma.systemConfig.update.mockResolvedValue({ key: 'a', value: 2 });

    const result = await service.update('a', { value: 2 } as any, 'user-1');

    expect(result.value).toBe(2);
    expect(history.record).toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith('config.system.updated', expect.any(Object));
  });

  it('validates config', async () => {
    jest.spyOn(service, 'get').mockResolvedValue({ key: 'a' } as any);

    const result = await service.validate('a', 'value');

    expect(result.valid).toBe(true);
  });
});
