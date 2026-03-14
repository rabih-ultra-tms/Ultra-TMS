import { apiClient } from '@/lib/api/client';
import {
  Claim,
  ClaimDetailResponse,
  ClaimListResponse,
  ClaimFilters,
  ClaimItem,
  ClaimDocument,
  ClaimNote,
  ClaimAdjustment,
  ApiDataResponse,
  CreateClaimDTO,
  UpdateClaimDTO,
  FileClaimDTO,
  AssignClaimDTO,
  UpdateClaimStatusDTO,
  ApproveClaimDTO,
  DenyClaimDTO,
  PayClaimDTO,
  CloseClaimDTO,
  UpdateInvestigationDTO,
  CreateClaimAdjustmentDTO,
  CreateClaimItemDTO,
  UpdateClaimItemDTO,
  CreateClaimDocumentDTO,
  CreateClaimNoteDTO,
  UpdateClaimNoteDTO,
} from './types';

const BASE_URL = '/api/v1/claims';

/**
 * Claims CRUD operations and lifecycle management
 * Handles claim creation, updates, filing, and assignment
 */
export const claimsClient = {
  list: async (
    filters?: ClaimFilters,
    page = 1,
    limit = 20
  ): Promise<ClaimListResponse> => {
    const params = new URLSearchParams();
    if (filters?.claimType) {
      params.append('claimType', filters.claimType.join(','));
    }
    if (filters?.status) {
      params.append('status', filters.status.join(','));
    }
    if (filters?.carrierId) params.append('carrierId', filters.carrierId);
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.dateRange) {
      params.append('startDate', filters.dateRange.startDate);
      params.append('endDate', filters.dateRange.endDate);
    }
    params.append('page', String(page));
    params.append('limit', String(limit));

    const response = await apiClient.get<ClaimListResponse>(
      `${BASE_URL}?${params.toString()}`
    );
    return response;
  },

  create: async (data: CreateClaimDTO): Promise<Claim> => {
    const response = await apiClient.post<ApiDataResponse<Claim>>(
      BASE_URL,
      data
    );
    return response.data;
  },

  getById: async (id: string): Promise<ClaimDetailResponse> => {
    const response = await apiClient.get<ApiDataResponse<ClaimDetailResponse>>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },

  update: async (id: string, data: UpdateClaimDTO): Promise<Claim> => {
    const response = await apiClient.put<ApiDataResponse<Claim>>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  file: async (id: string, data: FileClaimDTO): Promise<Claim> => {
    const response = await apiClient.post<ApiDataResponse<Claim>>(
      `${BASE_URL}/${id}/file`,
      data
    );
    return response.data;
  },

  assign: async (id: string, data: AssignClaimDTO): Promise<Claim> => {
    const response = await apiClient.post<ApiDataResponse<Claim>>(
      `${BASE_URL}/${id}/assign`,
      data
    );
    return response.data;
  },

  updateStatus: async (
    id: string,
    data: UpdateClaimStatusDTO
  ): Promise<Claim> => {
    const response = await apiClient.post<ApiDataResponse<Claim>>(
      `${BASE_URL}/${id}/status`,
      data
    );
    return response.data;
  },
};

/**
 * Claim items management
 * Handles line item operations within a claim
 */
export const claimItemsClient = {
  getItems: async (claimId: string): Promise<ClaimItem[]> => {
    const response = await apiClient.get<ApiDataResponse<ClaimItem[]>>(
      `${BASE_URL}/${claimId}/items`
    );
    return response.data;
  },

  addItem: async (
    claimId: string,
    data: CreateClaimItemDTO
  ): Promise<ClaimItem> => {
    const response = await apiClient.post<ApiDataResponse<ClaimItem>>(
      `${BASE_URL}/${claimId}/items`,
      data
    );
    return response.data;
  },

  updateItem: async (
    claimId: string,
    itemId: string,
    data: UpdateClaimItemDTO
  ): Promise<ClaimItem> => {
    const response = await apiClient.put<ApiDataResponse<ClaimItem>>(
      `${BASE_URL}/${claimId}/items/${itemId}`,
      data
    );
    return response.data;
  },

  deleteItem: async (claimId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${claimId}/items/${itemId}`);
  },
};

/**
 * Claim documents management
 * Handles document uploads and management for claims
 */
export const claimDocumentsClient = {
  getDocuments: async (claimId: string): Promise<ClaimDocument[]> => {
    const response = await apiClient.get<ApiDataResponse<ClaimDocument[]>>(
      `${BASE_URL}/${claimId}/documents`
    );
    return response.data;
  },

  addDocument: async (
    claimId: string,
    data: CreateClaimDocumentDTO
  ): Promise<ClaimDocument> => {
    const response = await apiClient.post<ApiDataResponse<ClaimDocument>>(
      `${BASE_URL}/${claimId}/documents`,
      data
    );
    return response.data;
  },

  deleteDocument: async (
    claimId: string,
    documentId: string
  ): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${claimId}/documents/${documentId}`);
  },
};

/**
 * Claim notes management
 * Handles internal notes for claims
 */
export const claimNotesClient = {
  getNotes: async (claimId: string): Promise<ClaimNote[]> => {
    const response = await apiClient.get<ApiDataResponse<ClaimNote[]>>(
      `${BASE_URL}/${claimId}/notes`
    );
    return response.data;
  },

  addNote: async (
    claimId: string,
    data: CreateClaimNoteDTO
  ): Promise<ClaimNote> => {
    const response = await apiClient.post<ApiDataResponse<ClaimNote>>(
      `${BASE_URL}/${claimId}/notes`,
      data
    );
    return response.data;
  },

  updateNote: async (
    claimId: string,
    noteId: string,
    data: UpdateClaimNoteDTO
  ): Promise<ClaimNote> => {
    const response = await apiClient.put<ApiDataResponse<ClaimNote>>(
      `${BASE_URL}/${claimId}/notes/${noteId}`,
      data
    );
    return response.data;
  },

  deleteNote: async (claimId: string, noteId: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${claimId}/notes/${noteId}`);
  },
};

/**
 * Claim settlement and resolution
 * Handles claim approval, denial, payment, and closure
 */
export const claimSettlementClient = {
  getAdjustments: async (claimId: string): Promise<ClaimAdjustment[]> => {
    const response = await apiClient.get<ApiDataResponse<ClaimAdjustment[]>>(
      `${BASE_URL}/${claimId}/adjustments`
    );
    return response.data;
  },

  addAdjustment: async (
    claimId: string,
    data: CreateClaimAdjustmentDTO
  ): Promise<ClaimAdjustment> => {
    const response = await apiClient.post<ApiDataResponse<ClaimAdjustment>>(
      `${BASE_URL}/${claimId}/adjustments`,
      data
    );
    return response.data;
  },

  deleteAdjustment: async (
    claimId: string,
    adjustmentId: string
  ): Promise<void> => {
    await apiClient.delete(
      `${BASE_URL}/${claimId}/adjustments/${adjustmentId}`
    );
  },

  approve: async (claimId: string, data: ApproveClaimDTO): Promise<Claim> => {
    const response = await apiClient.post<ApiDataResponse<Claim>>(
      `${BASE_URL}/${claimId}/approve`,
      data
    );
    return response.data;
  },

  deny: async (claimId: string, data: DenyClaimDTO): Promise<Claim> => {
    const response = await apiClient.post<ApiDataResponse<Claim>>(
      `${BASE_URL}/${claimId}/deny`,
      data
    );
    return response.data;
  },

  pay: async (claimId: string, data: PayClaimDTO): Promise<Claim> => {
    const response = await apiClient.post<ApiDataResponse<Claim>>(
      `${BASE_URL}/${claimId}/pay`,
      data
    );
    return response.data;
  },

  close: async (claimId: string, data: CloseClaimDTO): Promise<Claim> => {
    const response = await apiClient.post<ApiDataResponse<Claim>>(
      `${BASE_URL}/${claimId}/close`,
      data
    );
    return response.data;
  },

  updateInvestigation: async (
    claimId: string,
    data: UpdateInvestigationDTO
  ): Promise<Claim> => {
    const response = await apiClient.put<ApiDataResponse<Claim>>(
      `${BASE_URL}/${claimId}/investigation`,
      data
    );
    return response.data;
  },
};
