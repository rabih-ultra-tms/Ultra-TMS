jest.mock('../../../common/utils/geo.utils', () => ({
  geocodeCity: jest.fn(),
}));

import { geocodeCity } from '../../../common/utils/geo.utils';
import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  it('returns cached coordinates', async () => {
    const service = new GeocodingService();
    (geocodeCity as jest.Mock).mockResolvedValue({ latitude: 1, longitude: 2 });

    const first = await service.getCoordinates('Austin', 'TX');
    const second = await service.getCoordinates('Austin', 'TX');

    expect(first).toEqual({ latitude: 1, longitude: 2 });
    expect(second).toEqual({ latitude: 1, longitude: 2 });
  });

  it('batch geocodes locations', async () => {
    const service = new GeocodingService();
    (geocodeCity as jest.Mock).mockResolvedValue({ latitude: 3, longitude: 4 });

    const result = await service.batchGeocode([{ city: 'Dallas', state: 'TX' }]);

    expect(result.get('Dallas,TX')).toEqual({ latitude: 3, longitude: 4 });
  });
});
