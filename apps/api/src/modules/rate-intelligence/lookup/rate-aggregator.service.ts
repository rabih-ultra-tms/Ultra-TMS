import { Injectable, Logger } from '@nestjs/common';
import { ProvidersService } from '../providers/providers.service';
import { RateLookupDto } from './dto/rate-lookup.dto';

export interface ProviderRateResult {
  provider: string;
  lowRate: number;
  highRate: number;
  averageRate: number;
  sampleSize?: number;
  dataAgeHours?: number;
  loadVolume?: number;
  truckVolume?: number;
  marketTrend?: string;
}

export interface AggregatedRateResult {
  primarySource: string;
  lowRate: number;
  highRate: number;
  averageRate: number;
  confidenceScore: number;
  confidenceLabel: string;
  loadVolume?: number;
  truckVolume?: number;
  marketTrend?: string;
  sourceCount: number;
  sources: ProviderRateResult[];
  cachedUntil: Date;
}

@Injectable()
export class RateAggregatorService {
  private readonly logger = new Logger(RateAggregatorService.name);

  constructor(private readonly providers: ProvidersService) {}

  async queryProviders(tenantId: string, lane: RateLookupDto, providers: string[]) {
    const results = await Promise.allSettled(
      providers.map((provider) => this.providers.query(provider, tenantId, lane)),
    );

    const fulfilled = results
      .filter((r): r is PromiseFulfilledResult<ProviderRateResult> => r.status === 'fulfilled')
      .map((r) => r.value);

    const rejected = results.filter((r) => r.status === 'rejected');
    if (rejected.length) {
      rejected.forEach((err) => this.logger.warn(`Provider failed: ${JSON.stringify(err)}`));
    }

    if (!fulfilled.length) {
      throw new Error('No rate data available');
    }

    return fulfilled;
  }

  aggregate(results: ProviderRateResult[]): AggregatedRateResult {
    const lowRate = Math.min(...results.map((r) => r.lowRate));
    const highRate = Math.max(...results.map((r) => r.highRate));
    const averageRate = results.reduce((sum, r) => sum + r.averageRate, 0) / results.length;
    const sourceCount = results.length;

    const confidenceScore = this.calculateConfidence(results);
    const confidenceLabel = confidenceScore >= 80 ? 'HIGH' : confidenceScore >= 60 ? 'MEDIUM' : 'LOW';

    return {
      primarySource: results[0]?.provider ?? 'UNKNOWN',
      lowRate,
      highRate,
      averageRate,
      confidenceScore,
      confidenceLabel,
      loadVolume: results[0]?.loadVolume,
      truckVolume: results[0]?.truckVolume,
      marketTrend: results[0]?.marketTrend,
      sourceCount,
      sources: results,
      cachedUntil: new Date(Date.now() + 60 * 60 * 1000),
    };
  }

  private calculateConfidence(results: ProviderRateResult[]): number {
    const sampleSizes = results.map((r) => r.sampleSize ?? 0);
    const maxAge = Math.max(...results.map((r) => r.dataAgeHours ?? 0));
    const hasSingleSource = results.length === 1;

    let score = 100;
    if (maxAge > 24) score -= 20;
    if (maxAge > 72) score -= 30;

    const minSample = Math.min(...sampleSizes);
    if (minSample < 10) score -= 20;
    if (minSample < 5) score -= 30;

    if (hasSingleSource) score -= 10;

    return Math.max(0, score);
  }
}
