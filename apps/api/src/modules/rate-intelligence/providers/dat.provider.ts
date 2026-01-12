import { Injectable } from '@nestjs/common';
import { RateLookupDto } from '../lookup/dto/rate-lookup.dto';
import { ProviderRateResult } from '../lookup/rate-aggregator.service';

@Injectable()
export class DatProvider {
  async query(_tenantId: string, _lane: RateLookupDto): Promise<ProviderRateResult> {
    // Stubbed provider call; replace with real DAT API integration
    return {
      provider: 'DAT',
      lowRate: 1800,
      highRate: 2600,
      averageRate: 2150,
      sampleSize: 24,
      dataAgeHours: 2,
      loadVolume: 120,
      truckVolume: 40,
      marketTrend: 'FLAT',
    };
  }
}
