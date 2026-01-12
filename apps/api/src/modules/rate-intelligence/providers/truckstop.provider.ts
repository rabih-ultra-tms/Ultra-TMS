import { Injectable } from '@nestjs/common';
import { RateLookupDto } from '../lookup/dto/rate-lookup.dto';
import { ProviderRateResult } from '../lookup/rate-aggregator.service';

@Injectable()
export class TruckstopProvider {
  async query(_tenantId: string, _lane: RateLookupDto): Promise<ProviderRateResult> {
    // Stubbed provider call; replace with real Truckstop API integration
    return {
      provider: 'TRUCKSTOP',
      lowRate: 1750,
      highRate: 2550,
      averageRate: 2100,
      sampleSize: 18,
      dataAgeHours: 3,
      loadVolume: 95,
      truckVolume: 38,
      marketTrend: 'UP',
    };
  }
}
