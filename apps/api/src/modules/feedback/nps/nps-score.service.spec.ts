import { Test, TestingModule } from '@nestjs/testing';
import { NpsScoreService } from './nps-score.service';
import { PrismaService } from '../../../prisma.service';

describe('NpsScoreService', () => {
  let service: NpsScoreService;
  let prisma: { nPSResponse: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { nPSResponse: { findMany: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NpsScoreService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(NpsScoreService);
  });

  it('returns responses for tenant', async () => {
    prisma.nPSResponse.findMany.mockResolvedValue([{ id: 'r1' }]);

    const result = await service.getResponses('tenant-1');

    expect(result).toEqual([{ id: 'r1' }]);
    expect(prisma.nPSResponse.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
    });
  });

  it('filters responses by surveyId when provided', async () => {
    prisma.nPSResponse.findMany.mockResolvedValue([]);

    await service.getResponses('tenant-1', 'survey-1');

    expect(prisma.nPSResponse.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', surveyId: 'survey-1' },
    });
  });

  it('returns zeroed score when no responses', async () => {
    prisma.nPSResponse.findMany.mockResolvedValue([]);

    const result = await service.calculateNpsScore('tenant-1');

    expect(result).toEqual({
      score: null,
      responses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      promoterPercentage: 0,
      detractorPercentage: 0,
    });
  });

  it('calculates NPS score and breakdown', async () => {
    prisma.nPSResponse.findMany.mockResolvedValue([
      { score: 10 },
      { score: 9 },
      { score: 8 },
      { score: 7 },
      { score: 6 },
    ]);

    const result = await service.calculateNpsScore('tenant-1');

    expect(result.responses).toBe(5);
    expect(result.promoters).toBe(2);
    expect(result.passives).toBe(2);
    expect(result.detractors).toBe(1);
    expect(result.score).toBe(20);
    expect(result.promoterPercentage).toBeCloseTo(40);
    expect(result.detractorPercentage).toBeCloseTo(20);
  });

  it('categorizes scores correctly', () => {
    expect(service.categorizeScore(9)).toBe('PROMOTER');
    expect(service.categorizeScore(7)).toBe('PASSIVE');
    expect(service.categorizeScore(0)).toBe('DETRACTOR');
  });
});
