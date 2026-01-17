import { Test, TestingModule } from '@nestjs/testing';
import { ConfigHistoryService } from './config-history.service';
import { PrismaService } from '../../../prisma.service';

describe('ConfigHistoryService', () => {
  let service: ConfigHistoryService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { configHistory: { create: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigHistoryService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ConfigHistoryService);
  });

  it('records change', async () => {
    prisma.configHistory.create.mockResolvedValue({ id: 'c1' });

    const result = await service.record({ tenantId: 't1', key: 'k1', oldValue: null, newValue: { a: 1 }, changedBy: 'u1' });

    expect(result.id).toBe('c1');
  });
});
