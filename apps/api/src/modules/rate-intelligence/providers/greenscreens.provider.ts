import { Injectable } from '@nestjs/common';
import { RateLookupDto } from '../lookup/dto/rate-lookup.dto';
import { ProviderRateResult } from '../lookup/rate-aggregator.service';

@Injectable()
export class GreenscreensProvider {
  async query(_tenantId: string, _lane: RateLookupDto): Promise<ProviderRateResult> {
    // Stubbed provider call; replace with real Greenscreens API integration
    return {
      provider: 'GREENSCREENS',
      lowRate: 1850,
      highRate: 2650,
      averageRate: 2200,
      sampleSize: 30,
      dataAgeHours: 1,
      loadVolume: 130,
      truckVolume: 45,
      marketTrend: 'FLAT',
    };
  }
}
