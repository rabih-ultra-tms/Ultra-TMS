import { Test, TestingModule } from '@nestjs/testing';
import { AccessLogService } from './access-log.service';
import { PrismaService } from '../../../prisma.service';

describe('AccessLogService', () => {
  let service: AccessLogService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { accessLog: { findMany: jest.fn(), count: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessLogService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AccessLogService);
  });

  it('lists access logs with filters', async () => {
    prisma.accessLog.findMany.mockResolvedValue([]);
    prisma.accessLog.count.mockResolvedValue(0);

    const result = await service.list('tenant-1', { resourceType: 'ORDER', granted: 'true' } as any);

    expect(result.total).toBe(0);
    expect(prisma.accessLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-1', resourceType: 'ORDER', granted: true }) }),
    );
  });

  it('returns recent logs for user', async () => {
    prisma.accessLog.findMany.mockResolvedValue([{ id: 'l1' }]);

    const result = await service.recentForUser('tenant-1', 'user-1');

    expect(result).toEqual([{ id: 'l1' }]);
  });
});
