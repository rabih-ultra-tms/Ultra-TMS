import { Injectable } from '@nestjs/common';
import { SaferDataStatus } from '@prisma/client';

@Injectable()
export class FmcsaApiClient {
  async fetchCarrierData(dotNumber?: string | null, mcNumber?: string | null) {
    if (!dotNumber && !mcNumber) {
      return null;
    }

    // Stubbed FMCSA response shape for deterministic tests
    return {
      dotNumber: dotNumber ?? undefined,
      mcNumber: mcNumber ?? undefined,
      legalName: 'FMCSA Verified Carrier',
      dbaName: 'FMCSA DBA',
      operatingStatus: SaferDataStatus.ACTIVE,
      powerUnitCount: 5,
    };
  }
}
