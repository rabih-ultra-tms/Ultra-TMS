import { Test, TestingModule } from '@nestjs/testing';
import { SequencesService } from './sequences.service';
import { PrismaService } from '../../../prisma.service';

describe('SequencesService', () => {
  let service: SequencesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      numberSequence: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SequencesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SequencesService);
  });

  it('lists sequences', async () => {
    prisma.numberSequence.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.numberSequence.findMany).toHaveBeenCalled();
  });

  it('upserts sequence with reset frequency', async () => {
    prisma.numberSequence.findUnique.mockResolvedValue(null);
    prisma.numberSequence.upsert.mockResolvedValue({ id: 's1' });

    await service.update('tenant-1', 'ORDER', { resetFrequency: 'monthly', prefix: 'ORD-' } as any);

    expect(prisma.numberSequence.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ resetFrequency: 'MONTHLY' }) }),
    );
  });

  it('generates next sequence value', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-02T00:00:00Z'));

    prisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        numberSequence: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 's1', currentNumber: 0, padding: 4, customFields: { includeYear: true, includeMonth: true } }),
          update: jest.fn().mockResolvedValue({ id: 's1', currentNumber: 1, padding: 4, customFields: { includeYear: true, includeMonth: true } }),
        },
      };
      return cb(tx);
    });

    const result = await service.next('tenant-1', 'ORDER');

    expect(result.type).toBe('ORDER');
    expect(result.value).toMatch(/\d{2}\d{2}0001/);

    jest.useRealTimers();
  });
});
