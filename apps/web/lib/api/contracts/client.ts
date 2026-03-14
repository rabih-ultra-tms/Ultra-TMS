/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/lib/api/client';
import {
  Contract,
  RateTable,
  RateLane,
  Amendment,
  SLA,
  VolumeCommitment,
  FuelSurchargeTable,
  ContractTemplate,
  ContractFilters,
  PaginatedResponse,
} from './types';
import type {
  CreateContractInput,
  RateTableInput,
  RateLaneInput,
  AmendmentInput,
  SLAInput,
  VolumeCommitmentInput,
  FuelSurchargeTableInput,
} from './validators';

const BASE_URL = '/api/v1/contracts';

// Helper interface for API responses
interface ApiDataResponse<T> {
  data: T;
}

// Contract CRUD
export const contractsApi = {
  list: async (
    filters?: ContractFilters,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Contract>> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status.join(','));
    if (filters?.partyId) params.append('partyId', filters.partyId);
    if (filters?.dateRange) {
      params.append('startDate', filters.dateRange.startDate);
      params.append('endDate', filters.dateRange.endDate);
    }
    params.append('page', String(page));
    params.append('limit', String(limit));

    const response = await apiClient.get<PaginatedResponse<Contract>>(
      `${BASE_URL}?${params.toString()}`
    );
    return response;
  },

  create: async (data: CreateContractInput): Promise<Contract> => {
    const response = await apiClient.post<ApiDataResponse<Contract>>(
      BASE_URL,
      data
    );
    return response.data;
  },

  getById: async (id: string): Promise<Contract> => {
    const response = await apiClient.get<ApiDataResponse<Contract>>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateContractInput>
  ): Promise<Contract> => {
    const response = await apiClient.put<ApiDataResponse<Contract>>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  submit: async (id: string): Promise<Contract> => {
    const response = await apiClient.post<ApiDataResponse<Contract>>(
      `${BASE_URL}/${id}/submit`,
      {}
    );
    return response.data;
  },

  approve: async (id: string, reason: string): Promise<Contract> => {
    const response = await apiClient.post<ApiDataResponse<Contract>>(
      `${BASE_URL}/${id}/approve`,
      { reason }
    );
    return response.data;
  },

  reject: async (id: string, reason: string): Promise<Contract> => {
    const response = await apiClient.post<ApiDataResponse<Contract>>(
      `${BASE_URL}/${id}/reject`,
      { reason }
    );
    return response.data;
  },

  sendForSignature: async (id: string): Promise<Contract> => {
    const response = await apiClient.post<ApiDataResponse<Contract>>(
      `${BASE_URL}/${id}/send-for-signature`,
      {}
    );
    return response.data;
  },

  activate: async (id: string): Promise<Contract> => {
    const response = await apiClient.post<ApiDataResponse<Contract>>(
      `${BASE_URL}/${id}/activate`,
      {}
    );
    return response.data;
  },

  renew: async (id: string): Promise<Contract> => {
    const response = await apiClient.post<ApiDataResponse<Contract>>(
      `${BASE_URL}/${id}/renew`,
      {}
    );
    return response.data;
  },

  terminate: async (id: string, reason: string): Promise<Contract> => {
    const response = await apiClient.post<ApiDataResponse<Contract>>(
      `${BASE_URL}/${id}/terminate`,
      { reason }
    );
    return response.data;
  },

  getHistory: async (id: string): Promise<any[]> => {
    const response = await apiClient.get<ApiDataResponse<any[]>>(
      `${BASE_URL}/${id}/history`
    );
    return response.data;
  },
};

// Rate Tables
export const rateTablesApi = {
  listForContract: async (contractId: string): Promise<RateTable[]> => {
    const response = await apiClient.get<ApiDataResponse<RateTable[]>>(
      `${BASE_URL}/${contractId}/rate-tables`
    );
    return response.data;
  },

  create: async (
    contractId: string,
    data: RateTableInput
  ): Promise<RateTable> => {
    const response = await apiClient.post<ApiDataResponse<RateTable>>(
      `${BASE_URL}/${contractId}/rate-tables`,
      data
    );
    return response.data;
  },

  getById: async (id: string): Promise<RateTable> => {
    const response = await apiClient.get<ApiDataResponse<RateTable>>(
      `/api/v1/rate-tables/${id}`
    );
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<RateTableInput>
  ): Promise<RateTable> => {
    const response = await apiClient.put<ApiDataResponse<RateTable>>(
      `/api/v1/rate-tables/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/rate-tables/${id}`);
  },

  importCSV: async (id: string, file: globalThis.File): Promise<RateTable> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.upload<ApiDataResponse<RateTable>>(
      `/api/v1/rate-tables/${id}/import`,
      formData
    );
    return response.data;
  },

  exportCSV: async (id: string): Promise<globalThis.Blob> => {
    const response = await apiClient.get<globalThis.Blob>(
      `/api/v1/rate-tables/${id}/export`,
      {
        responseType: 'blob',
      }
    );
    return response;
  },
};

// Rate Lanes
export const rateLanesApi = {
  listForTable: async (tableId: string): Promise<RateLane[]> => {
    const response = await apiClient.get<ApiDataResponse<RateLane[]>>(
      `/api/v1/rate-tables/${tableId}/lanes`
    );
    return response.data;
  },

  create: async (tableId: string, data: RateLaneInput): Promise<RateLane> => {
    const response = await apiClient.post<ApiDataResponse<RateLane>>(
      `/api/v1/rate-tables/${tableId}/lanes`,
      data
    );
    return response.data;
  },

  update: async (
    tableId: string,
    id: string,
    data: Partial<RateLaneInput>
  ): Promise<RateLane> => {
    const response = await apiClient.put<ApiDataResponse<RateLane>>(
      `/api/v1/rate-tables/${tableId}/lanes/${id}`,
      data
    );
    return response.data;
  },

  delete: async (tableId: string, id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/rate-tables/${tableId}/lanes/${id}`);
  },
};

// Amendments
export const amendmentsApi = {
  listForContract: async (contractId: string): Promise<Amendment[]> => {
    const response = await apiClient.get<ApiDataResponse<Amendment[]>>(
      `${BASE_URL}/${contractId}/amendments`
    );
    return response.data;
  },

  create: async (
    contractId: string,
    data: AmendmentInput
  ): Promise<Amendment> => {
    const response = await apiClient.post<ApiDataResponse<Amendment>>(
      `${BASE_URL}/${contractId}/amendments`,
      data
    );
    return response.data;
  },

  update: async (
    contractId: string,
    id: string,
    data: Partial<AmendmentInput>
  ): Promise<Amendment> => {
    const response = await apiClient.put<ApiDataResponse<Amendment>>(
      `${BASE_URL}/${contractId}/amendments/${id}`,
      data
    );
    return response.data;
  },

  delete: async (contractId: string, id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${contractId}/amendments/${id}`);
  },

  apply: async (contractId: string, id: string): Promise<Amendment> => {
    const response = await apiClient.post<ApiDataResponse<Amendment>>(
      `${BASE_URL}/${contractId}/amendments/${id}/apply`,
      {}
    );
    return response.data;
  },
};

// SLAs
export const slasApi = {
  listForContract: async (contractId: string): Promise<SLA[]> => {
    const response = await apiClient.get<ApiDataResponse<SLA[]>>(
      `${BASE_URL}/${contractId}/slas`
    );
    return response.data;
  },

  create: async (contractId: string, data: SLAInput): Promise<SLA> => {
    const response = await apiClient.post<ApiDataResponse<SLA>>(
      `${BASE_URL}/${contractId}/slas`,
      data
    );
    return response.data;
  },

  update: async (
    contractId: string,
    id: string,
    data: Partial<SLAInput>
  ): Promise<SLA> => {
    const response = await apiClient.put<ApiDataResponse<SLA>>(
      `${BASE_URL}/${contractId}/slas/${id}`,
      data
    );
    return response.data;
  },

  delete: async (contractId: string, id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${contractId}/slas/${id}`);
  },
};

// Volume Commitments
export const volumeCommitmentsApi = {
  listForContract: async (contractId: string): Promise<VolumeCommitment[]> => {
    const response = await apiClient.get<ApiDataResponse<VolumeCommitment[]>>(
      `${BASE_URL}/${contractId}/volume-commitments`
    );
    return response.data;
  },

  create: async (
    contractId: string,
    data: VolumeCommitmentInput
  ): Promise<VolumeCommitment> => {
    const response = await apiClient.post<ApiDataResponse<VolumeCommitment>>(
      `${BASE_URL}/${contractId}/volume-commitments`,
      data
    );
    return response.data;
  },

  update: async (
    contractId: string,
    id: string,
    data: Partial<VolumeCommitmentInput>
  ): Promise<VolumeCommitment> => {
    const response = await apiClient.put<ApiDataResponse<VolumeCommitment>>(
      `${BASE_URL}/${contractId}/volume-commitments/${id}`,
      data
    );
    return response.data;
  },

  delete: async (contractId: string, id: string): Promise<void> => {
    await apiClient.delete(
      `${BASE_URL}/${contractId}/volume-commitments/${id}`
    );
  },

  getPerformance: async (contractId: string, id: string): Promise<any> => {
    const response = await apiClient.get<ApiDataResponse<any>>(
      `${BASE_URL}/${contractId}/volume-commitments/${id}/performance`
    );
    return response.data;
  },
};

// Fuel Surcharge
export const fuelSurchargeApi = {
  list: async (): Promise<FuelSurchargeTable[]> => {
    const response = await apiClient.get<ApiDataResponse<FuelSurchargeTable[]>>(
      '/api/v1/fuel-tables'
    );
    return response.data;
  },

  create: async (
    data: FuelSurchargeTableInput
  ): Promise<FuelSurchargeTable> => {
    const response = await apiClient.post<ApiDataResponse<FuelSurchargeTable>>(
      '/api/v1/fuel-tables',
      data
    );
    return response.data;
  },

  getById: async (id: string): Promise<FuelSurchargeTable> => {
    const response = await apiClient.get<ApiDataResponse<FuelSurchargeTable>>(
      `/api/v1/fuel-tables/${id}`
    );
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<FuelSurchargeTableInput>
  ): Promise<FuelSurchargeTable> => {
    const response = await apiClient.put<ApiDataResponse<FuelSurchargeTable>>(
      `/api/v1/fuel-tables/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/fuel-tables/${id}`);
  },

  calculate: async (fuelPrice: number): Promise<{ surcharge: number }> => {
    const response = await apiClient.get<
      ApiDataResponse<{ surcharge: number }>
    >(`/api/v1/fuel-surcharge/calculate?fuelPrice=${fuelPrice}`);
    return response.data;
  },
};

// Templates
export const contractTemplatesApi = {
  list: async (): Promise<ContractTemplate[]> => {
    const response = await apiClient.get<ApiDataResponse<ContractTemplate[]>>(
      '/api/v1/contract-templates'
    );
    return response.data;
  },

  clone: async (id: string): Promise<Contract> => {
    const response = await apiClient.post<ApiDataResponse<Contract>>(
      `/api/v1/contract-templates/${id}/clone`,
      {}
    );
    return response.data;
  },
};
