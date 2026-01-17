import { Test, TestingModule } from '@nestjs/testing';
import { RateAggregatorService } from './rate-aggregator.service';
import { ProvidersService } from '../providers/providers.service';

describe('RateAggregatorService', () => {
  let service: RateAggregatorService;
  const providers = { query: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateAggregatorService, { provide: ProvidersService, useValue: providers }],
    }).compile();

    service = module.get(RateAggregatorService);
  });

  it('aggregates results', () => {
    const result = service.aggregate([
      { provider: 'DAT', lowRate: 1, highRate: 3, averageRate: 2, sampleSize: 10, dataAgeHours: 1 },
      { provider: 'TS', lowRate: 2, highRate: 4, averageRate: 3, sampleSize: 10, dataAgeHours: 1 },
    ]);

    expect(result.lowRate).toBe(1);
    expect(result.highRate).toBe(4);
    expect(result.sourceCount).toBe(2);
  });

  it('calculates LOW confidence for stale small sample single source', () => {
    const result = service.aggregate([
      { provider: 'DAT', lowRate: 1, highRate: 2, averageRate: 1.5, sampleSize: 3, dataAgeHours: 80 },
    ]);

    expect(result.confidenceScore).toBe(0);
    expect(result.confidenceLabel).toBe('LOW');
  });

  it('calculates MEDIUM confidence for modest sample and age', () => {
    const result = service.aggregate([
      { provider: 'DAT', lowRate: 1, highRate: 2, averageRate: 1.5, sampleSize: 8, dataAgeHours: 30 },
      { provider: 'TS', lowRate: 2, highRate: 3, averageRate: 2.5, sampleSize: 8, dataAgeHours: 30 },
    ]);

    expect(result.confidenceScore).toBe(60);
    expect(result.confidenceLabel).toBe('MEDIUM');
  });

  it('calculates HIGH confidence for fresh large samples', () => {
    const result = service.aggregate([
      { provider: 'DAT', lowRate: 1, highRate: 2, averageRate: 1.5, sampleSize: 12, dataAgeHours: 5 },
      { provider: 'TS', lowRate: 2, highRate: 3, averageRate: 2.5, sampleSize: 20, dataAgeHours: 4 },
    ]);

    expect(result.confidenceLabel).toBe('HIGH');
  });

  it('queries providers and returns fulfilled', async () => {
    providers.query.mockResolvedValueOnce({ provider: 'DAT', lowRate: 1, highRate: 2, averageRate: 1.5 });
    const result = await service.queryProviders('t1', { originState: 'TX', destState: 'CA', equipmentType: 'VAN' }, ['DAT']);

    expect(result.length).toBe(1);
  });

  it('logs rejected providers but returns fulfilled', async () => {
    const warnSpy = jest.spyOn((service as any).logger, 'warn').mockImplementation(() => undefined);
    providers.query
      .mockResolvedValueOnce({ provider: 'DAT', lowRate: 1, highRate: 2, averageRate: 1.5 })
      .mockRejectedValueOnce(new Error('fail'));

    const result = await service.queryProviders('t1', { originState: 'TX', destState: 'CA', equipmentType: 'VAN' }, ['DAT', 'TS']);

    expect(result.length).toBe(1);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('throws when no providers return', async () => {
    providers.query.mockRejectedValueOnce(new Error('fail'));

    await expect(service.queryProviders('t1', { originState: 'TX', destState: 'CA', equipmentType: 'VAN' }, ['DAT'])).rejects.toThrow(
      'No rate data available',
    );
  });
});
