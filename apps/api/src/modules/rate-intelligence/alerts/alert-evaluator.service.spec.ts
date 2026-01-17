import { Test, TestingModule } from '@nestjs/testing';
import { AlertEvaluatorService } from './alert-evaluator.service';
import { PrismaService } from '../../../prisma.service';

describe('AlertEvaluatorService', () => {
  let service: AlertEvaluatorService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { rateAlert: { findMany: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertEvaluatorService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AlertEvaluatorService);
  });

  it('returns evaluated count', async () => {
    prisma.rateAlert.findMany.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }]);

    const result = await service.evaluate('t1');

    expect(result.evaluated).toBe(2);
  });
});
