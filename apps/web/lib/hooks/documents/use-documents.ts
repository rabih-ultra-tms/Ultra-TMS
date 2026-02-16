"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type DocumentType =
  | "BOL"
  | "POD"
  | "RATE_CONFIRM"
  | "INVOICE"
  | "INSURANCE"
  | "CONTRACT"
  | "W9"
  | "CARRIER_AGREEMENT"
  | "OTHER";

export type EntityType = "LOAD" | "ORDER" | "CARRIER" | "COMPANY" | "USER";

export interface Document {
  id: string;
  name: string;
  description?: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileExtension?: string;
  entityType?: EntityType;
  entityId?: string;
  loadId?: string;
  orderId?: string;
  carrierId?: string;
  status?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface UploadDocumentParams {
  file: File;
  name: string;
  documentType: DocumentType;
  entityType: EntityType;
  entityId: string;
  description?: string;
}

export function useDocuments(entityType: EntityType, entityId: string) {
  return useQuery<Document[]>({
    queryKey: ["documents", entityType, entityId],
    queryFn: async () => {
      const response = await apiClient.get<Document[]>(
        `/documents/entity/${entityType}/${entityId}`
      );
      return response;
    },
    enabled: !!entityId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UploadDocumentParams) => {
      const formData = new FormData();
      formData.append("file", params.file);
      formData.append("name", params.name);
      formData.append("documentType", params.documentType);
      formData.append("fileName", params.file.name);
      formData.append("fileSize", params.file.size.toString());
      formData.append("mimeType", params.file.type);
      formData.append("entityType", params.entityType);
      formData.append("entityId", params.entityId);
      if (params.description) {
        formData.append("description", params.description);
      }

      const response = await apiClient.post<Document>("/documents", formData);
      return response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.entityType, variables.entityId],
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
    }: {
      documentId: string;
      entityType: EntityType;
      entityId: string;
    }) => {
      await apiClient.delete(`/documents/${documentId}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.entityType, variables.entityId],
      });
    },
  });
}

export function useDocumentDownloadUrl(documentId: string) {
  return useQuery({
    queryKey: ["document-download", documentId],
    queryFn: async () => {
      const response = await apiClient.get<{
        id: string;
        name: string;
        downloadUrl: string;
        expiresAt: string;
      }>(`/documents/${documentId}/download`);
      return response;
    },
    enabled: false, // Only fetch on demand
  });
}
