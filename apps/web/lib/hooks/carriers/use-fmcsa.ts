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
      const query: Record<string, string> = {};
      if (params.dotNumber) query.dotNumber = params.dotNumber;
      if (params.mcNumber) query.mcNumber = params.mcNumber;
      const response = await apiClient.get<{ data: FmcsaCarrierRecord }>(
        '/safety/fmcsa/lookup',
        query,
      );
      return response.data;
    },
  });
};

export const useCsaScores = (carrierId: string) => {
  return useQuery({
    queryKey: ['csa-scores', carrierId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: CsaScore[] }>(
        `/safety/csa/${carrierId}`,
      );
      return response.data;
    },
    enabled: !!carrierId,
  });
};
