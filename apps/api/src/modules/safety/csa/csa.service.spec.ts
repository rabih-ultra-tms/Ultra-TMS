import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CSABasicType } from '@prisma/client';
import { CsaService } from './csa.service';
import { PrismaService } from '../../../prisma.service';

describe('CsaService', () => {
  let service: CsaService;
  let prisma: { csaScore: { findMany: jest.Mock; create: jest.Mock } };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      csaScore: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CsaService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(CsaService);
  });

  it('returns latest score per basic type', async () => {
    prisma.csaScore.findMany.mockResolvedValue([
      { id: '1', basicType: CSABasicType.UNSAFE_DRIVING, percentile: 70, asOfDate: new Date('2024-02-01') },
      { id: '2', basicType: CSABasicType.UNSAFE_DRIVING, percentile: 60, asOfDate: new Date('2024-01-01') },
      { id: '3', basicType: CSABasicType.HOS_COMPLIANCE, percentile: 50, asOfDate: new Date('2024-02-01') },
    ]);

    const result = await service.getCurrent('tenant-1', 'carrier-1');

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(['1', '3']);
  });

  it('returns score history', async () => {
    prisma.csaScore.findMany.mockResolvedValue([]);

    await service.getHistory('tenant-1', 'carrier-1');

    expect(prisma.csaScore.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', carrierId: 'carrier-1', deletedAt: null } }),
    );
  });

  it('refreshes scores and emits alerts', async () => {
    prisma.csaScore.create.mockImplementation(({ data }: any) => ({
      id: data.basicType,
      basicType: data.basicType,
      percentile: data.percentile,
      isAlert: data.isAlert,
    }));

    const result = await service.refresh('tenant-1', 'carrier-1');

    expect(result).toHaveLength(7);
    expect(prisma.csaScore.create).toHaveBeenCalledTimes(7);

    const alertCalls = events.emit.mock.calls.filter((call) => call[0] === 'safety.csa.alert');
    expect(alertCalls.length).toBe(7);
    expect(events.emit).toHaveBeenCalledWith('safety.csa.updated',
      expect.objectContaining({ carrierId: 'carrier-1', scores: expect.any(Array) }),
    );
  });
});
