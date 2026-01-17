import { Test, TestingModule } from '@nestjs/testing';
import { TimeOffBalanceService } from './balance.service';
import { PrismaService } from '../../../prisma.service';

describe('TimeOffBalanceService', () => {
  let service: TimeOffBalanceService;
  let prisma: {
    timeOffBalance: {
      findMany: jest.Mock;
      upsert: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      timeOffBalance: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeOffBalanceService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TimeOffBalanceService);
  });

  it('lists balances ordered', async () => {
    prisma.timeOffBalance.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.timeOffBalance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
  });

  it('adds pending reduces balance', async () => {
    prisma.timeOffBalance.upsert.mockResolvedValue({ id: 'b1', balanceHours: 10 });
    prisma.timeOffBalance.update.mockResolvedValue({ id: 'b1' });

    await service.addPending('tenant-1', 'e1', 'VACATION' as any, 2025, 2);

    expect(prisma.timeOffBalance.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { balanceHours: 8 } }),
    );
  });

  it('removes pending increases balance', async () => {
    prisma.timeOffBalance.upsert.mockResolvedValue({ id: 'b1', balanceHours: 8 });
    prisma.timeOffBalance.update.mockResolvedValue({ id: 'b1' });

    await service.removePending('tenant-1', 'e1', 'VACATION' as any, 2025, 2);

    expect(prisma.timeOffBalance.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { balanceHours: 10 } }),
    );
  });

  it('moves pending to used', async () => {
    prisma.timeOffBalance.upsert.mockResolvedValue({ id: 'b1' });

    const result = await service.movePendingToUsed('tenant-1', 'e1', 'VACATION' as any, 2025, 4);

    expect(result).toEqual({ moved: true });
  });

  it('gets balance via upsert', async () => {
    prisma.timeOffBalance.upsert.mockResolvedValue({ id: 'b1' });

    const result = await service.getBalance('tenant-1', 'e1', 'VACATION' as any, 2025);

    expect(result).toEqual({ id: 'b1' });
  });
});