'use client';

import { useQuery } from '@tanstack/react-query';
import {
  contractsApi,
  rateTablesApi,
  amendmentsApi,
  slasApi,
  volumeCommitmentsApi,
} from '@/lib/api/contracts/client';
import type {
  Contract,
  RateTable,
  Amendment,
  SLA,
  VolumeCommitment,
} from '@/lib/api/contracts/types';
import { contractKeys } from './useContracts';

// ===========================
// Hook
// ===========================

/**
 * Hook for loading a single contract with lazy-loaded related data
 * Sub-resources (rate tables, amendments, SLAs, volume commitments) load only after main contract is fetched
 *
 * @param contractId - The ID of the contract to load
 * @returns Contract data with sub-resources and loading/error states
 */
export function useContractDetail(contractId: string) {
  // Main contract query
  const contractQuery = useQuery({
    queryKey: contractKeys.detail(contractId),
    queryFn: () => contractsApi.getById(contractId),
    enabled: !!contractId,
    // 5 minutes: balance between fresh data and avoiding unnecessary requests
    staleTime: 5 * 60 * 1000,
  });

  // Lazy load rate tables only when contract is fetched
  const rateTablesQuery = useQuery({
    queryKey: [...contractKeys.detail(contractId), 'rate-tables'],
    queryFn: () => rateTablesApi.listForContract(contractId),
    enabled: !!contractId && contractQuery.isFetched,
    staleTime: 5 * 60 * 1000,
  });

  // Lazy load amendments only when contract is fetched
  const amendmentsQuery = useQuery({
    queryKey: [...contractKeys.detail(contractId), 'amendments'],
    queryFn: () => amendmentsApi.listForContract(contractId),
    enabled: !!contractId && contractQuery.isFetched,
    staleTime: 5 * 60 * 1000,
  });

  // Lazy load SLAs only when contract is fetched
  const slasQuery = useQuery({
    queryKey: [...contractKeys.detail(contractId), 'slas'],
    queryFn: () => slasApi.listForContract(contractId),
    enabled: !!contractId && contractQuery.isFetched,
    staleTime: 5 * 60 * 1000,
  });

  // Lazy load volume commitments only when contract is fetched
  const volumeCommitmentsQuery = useQuery({
    queryKey: [...contractKeys.detail(contractId), 'volume-commitments'],
    queryFn: () => volumeCommitmentsApi.listForContract(contractId),
    enabled: !!contractId && contractQuery.isFetched,
    staleTime: 5 * 60 * 1000,
  });

  return {
    // Main contract data
    contract: contractQuery.data as Contract | undefined,

    // Sub-resources
    rateTables: (rateTablesQuery.data || []) as RateTable[],
    amendments: (amendmentsQuery.data || []) as Amendment[],
    slas: (slasQuery.data || []) as SLA[],
    volumeCommitments: (volumeCommitmentsQuery.data ||
      []) as VolumeCommitment[],

    // Loading states
    isLoading:
      contractQuery.isLoading ||
      rateTablesQuery.isLoading ||
      amendmentsQuery.isLoading ||
      slasQuery.isLoading ||
      volumeCommitmentsQuery.isLoading,
    isLoadingContract: contractQuery.isLoading,
    isLoadingRelated:
      rateTablesQuery.isLoading ||
      amendmentsQuery.isLoading ||
      slasQuery.isLoading ||
      volumeCommitmentsQuery.isLoading,

    // Error states
    error: contractQuery.error,
    errorContract: contractQuery.error,
    errorRelated:
      rateTablesQuery.error ||
      amendmentsQuery.error ||
      slasQuery.error ||
      volumeCommitmentsQuery.error,

    // Refetch function for all queries
    refetch: async () => {
      await Promise.all([
        contractQuery.refetch(),
        rateTablesQuery.refetch(),
        amendmentsQuery.refetch(),
        slasQuery.refetch(),
        volumeCommitmentsQuery.refetch(),
      ]);
    },
  };
}
