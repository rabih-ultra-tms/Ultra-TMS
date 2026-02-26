import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { CarrierScorecardResponse } from '@/types/carriers';

const CARRIERS_KEY = 'carriers';

export function useCarrierScorecard(carrierId: string) {
  return useQuery<CarrierScorecardResponse>({
    queryKey: [CARRIERS_KEY, carrierId, 'scorecard'],
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(
        `/operations/carriers/${carrierId}/scorecard`,
      );
      return (raw as { data: CarrierScorecardResponse }).data;
    },
    enabled: !!carrierId,
  });
}
