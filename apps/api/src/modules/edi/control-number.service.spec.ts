import { Test, TestingModule } from '@nestjs/testing';
import { EdiTransactionType } from '@prisma/client';
import { EdiControlNumberService } from './control-number.service';
import { PrismaService } from '../../prisma.service';

describe('EdiControlNumberService', () => {
  let service: EdiControlNumberService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { ediControlNumber: { upsert: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EdiControlNumberService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(EdiControlNumberService);
  });

  it('returns next control number', async () => {
    prisma.ediControlNumber.upsert.mockResolvedValue({ currentNumber: 2, maxValue: 999999999 });

    const result = await service.next('t1', 'ISA', 'tp1', EdiTransactionType.EDI_204);

    expect(result).toBe('000000002');
  });

  it('returns triple numbers', async () => {
    prisma.ediControlNumber.upsert
      .mockResolvedValueOnce({ currentNumber: 1, maxValue: 999999999 })
      .mockResolvedValueOnce({ currentNumber: 2, maxValue: 999999999 })
      .mockResolvedValueOnce({ currentNumber: 3, maxValue: 999999999 });

    const result = await service.nextTriple('t1', 'tp1', EdiTransactionType.EDI_204);

    expect(result.isaControlNumber).toBe('000000001');
    expect(result.gsControlNumber).toBe('000000002');
    expect(result.stControlNumber).toBe('000000003');
  });
});
