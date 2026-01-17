import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersService } from './providers.service';
import { PrismaService } from '../../../prisma.service';
import { DatProvider } from './dat.provider';
import { TruckstopProvider } from './truckstop.provider';
import { GreenscreensProvider } from './greenscreens.provider';

const datProvider = { query: jest.fn() };
const truckstopProvider = { query: jest.fn() };
const greenscreensProvider = { query: jest.fn() };

describe('ProvidersService', () => {
  let service: ProvidersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      rateProviderConfig: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        { provide: PrismaService, useValue: prisma },
        { provide: DatProvider, useValue: datProvider },
        { provide: TruckstopProvider, useValue: truckstopProvider },
        { provide: GreenscreensProvider, useValue: greenscreensProvider },
      ],
    }).compile();

    service = module.get(ProvidersService);
  });

  it('lists configs', async () => {
    prisma.rateProviderConfig.findMany.mockResolvedValue([]);

    const result = await service.list('t1');

    expect(result).toEqual([]);
  });

  it('creates config', async () => {
    prisma.rateProviderConfig.create.mockResolvedValue({ id: 'p1' });

    const result = await service.create('t1', 'u1', { provider: 'DAT' });

    expect(result.id).toBe('p1');
  });

  it('updates config', async () => {
    prisma.rateProviderConfig.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.rateProviderConfig.update.mockResolvedValue({ id: 'p1' });

    const result = await service.update('t1', 'p1', { isActive: true });

    expect(result.id).toBe('p1');
  });

  it('tests provider and updates last query', async () => {
    prisma.rateProviderConfig.findFirst.mockResolvedValue({ id: 'p1', provider: 'DAT' });
    prisma.rateProviderConfig.update.mockResolvedValue({ id: 'p1' });
    datProvider.query.mockResolvedValue({ provider: 'DAT', averageRate: 100 });

    const result = await service.test('t1', 'p1');

    expect(result.averageRate).toBe(100);
    expect(prisma.rateProviderConfig.update).toHaveBeenCalled();
  });

  it('throws on unsupported provider', async () => {
    await expect(service.query('UNKNOWN', 't1', { originState: 'TX', destState: 'CA', equipmentType: 'VAN' })).rejects.toThrow(
      'Unsupported provider',
    );
  });
});
