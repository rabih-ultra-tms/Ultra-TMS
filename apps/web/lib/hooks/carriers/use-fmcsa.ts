import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// -------------------------------------------------------------------
// Types — mirrors backend Prisma models
// -------------------------------------------------------------------

export interface FmcsaCarrierRecord {
  id: string;
  tenantId: string;
  carrierId: string;
  dotNumber: string | null;
  mcNumber: string | null;
  legalName: string | null;
  dbaName: string | null;
  operatingStatus: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_SERVICE' | null;
  outOfServiceDate: string | null;
  commonAuthority: boolean;
  contractAuthority: boolean;
  brokerAuthority: boolean;
  physicalAddress: string | null;
  physicalCity: string | null;
  physicalState: string | null;
  physicalZip: string | null;
  phone: string | null;
  powerUnitCount: number | null;
  driverCount: number | null;
  lastSyncedAt: string | null;
}

export type CSABasicType =
  | 'UNSAFE_DRIVING'
  | 'HOS_COMPLIANCE'
  | 'DRIVER_FITNESS'
  | 'CONTROLLED_SUBSTANCES'
  | 'VEHICLE_MAINTENANCE'
  | 'HAZMAT_COMPLIANCE'
  | 'CRASH_INDICATOR';

export interface CsaScore {
  id: string;
  carrierId: string;
  basicType: CSABasicType;
  score: number | null;
  percentile: number | null;
  threshold: number | null;
  isAboveThreshold: boolean;
  isAlert: boolean;
  inspectionCount: number;
  violationCount: number;
  oosViolationCount: number;
  asOfDate: string;
}

// -------------------------------------------------------------------
// Hooks
// -------------------------------------------------------------------

interface FmcsaLookupParams {
  dotNumber?: string;
  mcNumber?: string;
}

export const useFmcsaLookup = () => {
  return useMutation({
    mutationFn: async (params: FmcsaLookupParams) => {
      let response: { data: FmcsaCarrierRecord };
      if (params.dotNumber) {
        response = await apiClient.get<{ data: FmcsaCarrierRecord }>(
          `/carriers/fmcsa/lookup/dot/${params.dotNumber}`,
        );
      } else if (params.mcNumber) {
        response = await apiClient.get<{ data: FmcsaCarrierRecord }>(
          `/carriers/fmcsa/lookup/mc/${params.mcNumber}`,
        );
      } else {
        throw new Error('Either dotNumber or mcNumber is required');
      }
      return response.data;
    },
  });
};

export const useCsaScores = (carrierId: string) => {
  return useQuery({
    queryKey: ['csa-scores', carrierId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: CsaScore[] }>(
        `/carriers/${carrierId}/csa-scores`,
      );
      return response.data;
    },
    enabled: !!carrierId,
  });
};
