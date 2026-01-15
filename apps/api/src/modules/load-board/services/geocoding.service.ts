import { Injectable, Logger } from '@nestjs/common';
import { Coordinates, geocodeCity } from '../../../common/utils/geo.utils';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private cache = new Map<string, Coordinates>();

  /**
   * Get coordinates for a location
   * Tries: cache -> built-in lookup
   */
  async getCoordinates(city: string, state: string): Promise<Coordinates | null> {
    const cacheKey = `${city.toLowerCase()},${state.toLowerCase()}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const builtin = await geocodeCity(city, state);
    if (builtin) {
      this.cache.set(cacheKey, builtin);
      return builtin;
    }

    this.logger.warn(`No coordinates found for ${city}, ${state}`);
    return null;
  }

  /**
   * Get coordinates from ZIP code
   */
  async getCoordinatesFromZip(_zip: string): Promise<Coordinates | null> {
    return null;
  }

  /**
   * Batch geocode multiple locations
   */
  async batchGeocode(
    locations: Array<{ city: string; state: string }>,
  ): Promise<Map<string, Coordinates | null>> {
    const results = new Map<string, Coordinates | null>();

    await Promise.all(
      locations.map(async (loc) => {
        const key = `${loc.city},${loc.state}`;
        const coords = await this.getCoordinates(loc.city, loc.state);
        results.set(key, coords);
      }),
    );

    return results;
  }
}
