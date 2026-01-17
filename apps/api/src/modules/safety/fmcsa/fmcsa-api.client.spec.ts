import { FmcsaApiClient } from './fmcsa-api.client';

describe('FmcsaApiClient', () => {
  it('returns null when no identifiers provided', async () => {
    const client = new FmcsaApiClient();

    const result = await client.fetchCarrierData();

    expect(result).toBeNull();
  });

  it('returns stubbed data when dot number provided', async () => {
    const client = new FmcsaApiClient();

    const result = await client.fetchCarrierData('123', null);

    expect(result?.dotNumber).toBe('123');
    expect(result?.legalName).toBe('FMCSA Verified Carrier');
  });
});
