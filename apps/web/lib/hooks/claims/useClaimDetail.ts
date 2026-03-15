'use client';

import { useQuery } from '@tanstack/react-query';
import { claimsClient } from '@/lib/api/claims';
import type {
  ClaimDetailResponse,
  ClaimItem,
  ClaimDocument,
  ClaimNote,
  ClaimAdjustment,
} from '@/lib/api/claims/types';
import { claimKeys } from './useClaimList';

// ===========================
// Hook
// ===========================

/**
 * Hook for loading a single claim with related data
 * Includes claim details, items, documents, notes, and adjustments
 *
 * @param claimId - The ID of the claim to load
 * @param enabled - Whether the query is enabled (default: true)
 * @returns Claim data with sub-resources and loading/error states
 */
export function useClaimDetail(claimId: string, enabled = true) {
  // Main claim query
  const claimQuery = useQuery({
    queryKey: claimKeys.detail(claimId),
    queryFn: () => claimsClient.getById(claimId),
    enabled: !!claimId && enabled,
    // 5 minutes: balance between fresh data and avoiding unnecessary requests
    staleTime: 5 * 60 * 1000,
  });

  return {
    // Main claim data
    claim: claimQuery.data as ClaimDetailResponse | undefined,

    // Sub-resources
    items: (claimQuery.data?.items || []) as ClaimItem[],
    documents: (claimQuery.data?.documents || []) as ClaimDocument[],
    notes: (claimQuery.data?.notes || []) as ClaimNote[],
    adjustments: (claimQuery.data?.adjustments || []) as ClaimAdjustment[],

    // Loading states
    isLoading: claimQuery.isLoading,
    isError: claimQuery.isError,

    // Error states
    error: claimQuery.error,

    // Refetch function
    refetch: claimQuery.refetch,
  };
}
