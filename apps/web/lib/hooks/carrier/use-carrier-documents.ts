'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export type CarrierDocumentType =
  | 'POD'
  | 'LUMPER_RECEIPT'
  | 'SCALE_TICKET'
  | 'BOL_SIGNED'
  | 'WEIGHT_TICKET'
  | 'OTHER';

export type CarrierDocumentStatus =
  | 'UPLOADED'
  | 'REVIEWING'
  | 'APPROVED'
  | 'REJECTED';

export interface CarrierDocument {
  id: string;
  tenantId: string;
  carrierId: string;
  userId: string;
  loadId?: string;
  documentType: CarrierDocumentType;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: CarrierDocumentStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionNotes?: string;
  externalId?: string;
  sourceSystem?: string;
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface UploadCarrierDocumentParams {
  file: globalThis.File;
  documentType: CarrierDocumentType;
  loadId?: string;
}

export const carrierDocumentKeys = {
  all: ['carrier-documents'] as const,
  list: () => [...carrierDocumentKeys.all, 'list'] as const,
  detail: (id: string) => [...carrierDocumentKeys.all, 'detail', id] as const,
};

export function useCarrierDocuments() {
  return useQuery({
    queryKey: carrierDocumentKeys.list(),
    queryFn: async () => {
      const response = await apiClient.get<CarrierDocument[]>(
        '/carrier-portal/documents'
      );
      return response;
    },
    staleTime: 30_000,
  });
}

export function useUploadCarrierDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UploadCarrierDocumentParams) => {
      const formData = new FormData();
      formData.append('file', params.file);
      formData.append('fileName', params.file.name);
      formData.append('fileSize', params.file.size.toString());
      formData.append('mimeType', params.file.type);
      formData.append('documentType', params.documentType);
      if (params.loadId) {
        formData.append('loadId', params.loadId);
      }

      const response = await apiClient.upload<CarrierDocument>(
        '/carrier-portal/documents',
        formData
      );
      return response;
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({
        queryKey: carrierDocumentKeys.list(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });
}

export function useDeleteCarrierDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      await apiClient.delete(`/carrier-portal/documents/${documentId}`);
    },
    onSuccess: () => {
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries({
        queryKey: carrierDocumentKeys.list(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete document');
    },
  });
}
