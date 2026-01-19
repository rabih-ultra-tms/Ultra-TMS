# 10 - Documents UI Implementation

> **Service:** Documents (Document Management & Storage)  
> **Priority:** P1 - High  
> **Pages:** 5  
> **API Endpoints:** 18  
> **Dependencies:** Foundation ✅, Auth API ✅, Documents API ✅  
> **Doc Reference:** [17-service-documents.md](../../02-services/17-service-documents.md)

---

## 📋 Overview

The Documents UI provides interfaces for managing all document types in the TMS including BOLs, PODs, rate confirmations, and other shipping documents. This includes upload, preview, categorization, and document retrieval.

### Key Screens
- Documents dashboard/browser
- Document upload
- Document viewer/preview
- Document search
- Document templates
- Bulk upload interface

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Documents API is deployed

---

## 📦 Additional shadcn Components

```bash
cd apps/web
npx shadcn@latest add scroll-area
```

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── documents/
│   ├── page.tsx                    # Documents browser
│   ├── upload/
│   │   └── page.tsx                # Upload interface
│   ├── [id]/
│   │   └── page.tsx                # Document viewer
│   ├── search/
│   │   └── page.tsx                # Advanced search
│   └── templates/
│       └── page.tsx                # Document templates
```

---

## 🎨 Components to Create

```
components/documents/
├── document-browser.tsx            # Main browser view
├── document-grid.tsx               # Grid view
├── document-list.tsx               # List view
├── document-card.tsx               # Document thumbnail
├── document-viewer.tsx             # Preview modal/page
├── document-upload-zone.tsx        # Drag-drop upload
├── document-upload-form.tsx        # Upload with metadata
├── bulk-upload-dialog.tsx          # Multi-file upload
├── document-details-panel.tsx      # Sidebar details
├── document-actions.tsx            # Download, share, etc.
├── document-search.tsx             # Search interface
├── document-filters.tsx            # Filter controls
├── document-type-badge.tsx         # Type indicator
├── document-template-card.tsx      # Template preview
├── folder-tree.tsx                 # Virtual folder nav
└── recent-documents.tsx            # Recent docs widget
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/documents.ts`

```typescript
export type DocumentType = 
  | 'BOL'
  | 'POD'
  | 'RATE_CONFIRMATION'
  | 'INVOICE'
  | 'INSURANCE_CERTIFICATE'
  | 'CARRIER_AGREEMENT'
  | 'CUSTOMER_CONTRACT'
  | 'WEIGHT_TICKET'
  | 'LUMPER_RECEIPT'
  | 'ACCESSORIAL'
  | 'CLAIM_DOCUMENT'
  | 'OTHER';

export type DocumentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'AVAILABLE'
  | 'ERROR';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  
  // File info
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  
  // Metadata
  description?: string;
  tags?: string[];
  
  // References
  entityType?: string; // 'load', 'order', 'carrier', etc.
  entityId?: string;
  entityNumber?: string;
  
  // Access
  isPublic: boolean;
  accessRoles?: string[];
  
  // OCR/Parsing
  ocrCompleted: boolean;
  parsedData?: Record<string, unknown>;
  
  // Versioning
  version: number;
  previousVersionId?: string;
  
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdByName: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileName: string;
  fileSize: number;
  url: string;
  changedAt: string;
  changedById: string;
  changedByName: string;
  changeNotes?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentType;
  description?: string;
  templateUrl: string;
  previewUrl?: string;
  fields?: DocumentTemplateField[];
  isActive: boolean;
  createdAt: string;
}

export interface DocumentTemplateField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  documentCount: number;
  children?: DocumentFolder[];
}

export interface DocumentSearchParams {
  query?: string;
  type?: DocumentType;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  createdById?: string;
}

export interface DocumentUploadRequest {
  file: File;
  type: DocumentType;
  name?: string;
  description?: string;
  tags?: string[];
  entityType?: string;
  entityId?: string;
  isPublic?: boolean;
}

export interface DocumentDashboardData {
  totalDocuments: number;
  recentDocuments: Document[];
  documentsByType: Array<{ type: DocumentType; count: number }>;
  storageUsed: number;
  storageLimit: number;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/documents/use-documents.ts`

```typescript
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  Document,
  DocumentVersion,
  DocumentTemplate,
  DocumentFolder,
  DocumentSearchParams,
  DocumentDashboardData,
} from '@/lib/types/documents';
import { toast } from 'sonner';

export const documentKeys = {
  all: ['documents'] as const,
  dashboard: () => [...documentKeys.all, 'dashboard'] as const,
  
  list: (params?: DocumentSearchParams) => [...documentKeys.all, 'list', params] as const,
  infinite: (params?: DocumentSearchParams) => [...documentKeys.all, 'infinite', params] as const,
  detail: (id: string) => [...documentKeys.all, 'detail', id] as const,
  versions: (id: string) => [...documentKeys.all, 'versions', id] as const,
  
  folders: () => [...documentKeys.all, 'folders'] as const,
  
  templates: () => [...documentKeys.all, 'templates'] as const,
  templateDetail: (id: string) => [...documentKeys.templates(), id] as const,
  
  entity: (entityType: string, entityId: string) => [...documentKeys.all, 'entity', entityType, entityId] as const,
};

// Dashboard
export function useDocumentsDashboard() {
  return useQuery({
    queryKey: documentKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: DocumentDashboardData }>('/documents/dashboard'),
  });
}

// Documents List
export function useDocuments(params: DocumentSearchParams = {}) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Document>>('/documents', params),
  });
}

export function useDocumentsInfinite(params: DocumentSearchParams = {}) {
  return useInfiniteQuery({
    queryKey: documentKeys.infinite(params),
    queryFn: ({ pageParam = 1 }) => 
      apiClient.get<PaginatedResponse<Document>>('/documents', { ...params, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Document }>(`/documents/${id}`),
    enabled: !!id,
  });
}

// Entity Documents (documents for a specific load, order, etc.)
export function useEntityDocuments(entityType: string, entityId: string) {
  return useQuery({
    queryKey: documentKeys.entity(entityType, entityId),
    queryFn: () => apiClient.get<{ data: Document[] }>(`/documents/entity/${entityType}/${entityId}`),
    enabled: !!entityType && !!entityId,
  });
}

// Upload
export function useUploadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.upload<{ data: Document }>('/documents/upload', formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success('Document uploaded');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });
}

export function useBulkUploadDocuments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.upload<{ data: Document[] }>('/documents/upload/bulk', formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success(`${data.data.length} documents uploaded`);
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload documents');
    },
  });
}

// Update
export function useUpdateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Document> }) =>
      apiClient.patch<{ data: Document }>(`/documents/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.list() });
      toast.success('Document updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update document');
    },
  });
}

// Delete
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success('Document deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete document');
    },
  });
}

// Versions
export function useDocumentVersions(documentId: string) {
  return useQuery({
    queryKey: documentKeys.versions(documentId),
    queryFn: () => apiClient.get<{ data: DocumentVersion[] }>(`/documents/${documentId}/versions`),
    enabled: !!documentId,
  });
}

export function useUploadNewVersion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ documentId, formData }: { documentId: string; formData: FormData }) =>
      apiClient.upload<{ data: Document }>(`/documents/${documentId}/versions`, formData),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) });
      queryClient.invalidateQueries({ queryKey: documentKeys.versions(documentId) });
      toast.success('New version uploaded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload version');
    },
  });
}

// Folders
export function useFolders() {
  return useQuery({
    queryKey: documentKeys.folders(),
    queryFn: () => apiClient.get<{ data: DocumentFolder[] }>('/documents/folders'),
  });
}

// Templates
export function useDocumentTemplates() {
  return useQuery({
    queryKey: documentKeys.templates(),
    queryFn: () => apiClient.get<{ data: DocumentTemplate[] }>('/documents/templates'),
  });
}

export function useDocumentTemplate(id: string) {
  return useQuery({
    queryKey: documentKeys.templateDetail(id),
    queryFn: () => apiClient.get<{ data: DocumentTemplate }>(`/documents/templates/${id}`),
    enabled: !!id,
  });
}

export function useGenerateFromTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: Record<string, unknown> }) =>
      apiClient.post<{ data: Document }>(`/documents/templates/${templateId}/generate`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success('Document generated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate document');
    },
  });
}

// Download URL
export function useDownloadUrl(id: string) {
  return useQuery({
    queryKey: [...documentKeys.detail(id), 'download'],
    queryFn: () => apiClient.get<{ url: string }>(`/documents/${id}/download-url`),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/documents-store.ts`

```typescript
import { createStore } from './create-store';
import { DocumentType, DocumentSearchParams } from '@/lib/types/documents';

interface DocumentsState {
  viewMode: 'grid' | 'list';
  searchParams: DocumentSearchParams;
  selectedDocumentId: string | null;
  selectedFolderId: string | null;
  isUploadDialogOpen: boolean;
  isPreviewOpen: boolean;
  uploadProgress: Record<string, number>;
  
  setViewMode: (mode: 'grid' | 'list') => void;
  setSearchParam: <K extends keyof DocumentSearchParams>(key: K, value: DocumentSearchParams[K]) => void;
  resetSearch: () => void;
  setSelectedDocument: (id: string | null) => void;
  setSelectedFolder: (id: string | null) => void;
  setUploadDialogOpen: (open: boolean) => void;
  setPreviewOpen: (open: boolean) => void;
  setUploadProgress: (fileId: string, progress: number) => void;
  clearUploadProgress: () => void;
}

export const useDocumentsStore = createStore<DocumentsState>('documents-store', (set, get) => ({
  viewMode: 'grid',
  searchParams: {},
  selectedDocumentId: null,
  selectedFolderId: null,
  isUploadDialogOpen: false,
  isPreviewOpen: false,
  uploadProgress: {},
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setSearchParam: (key, value) =>
    set({ searchParams: { ...get().searchParams, [key]: value } }),
  
  resetSearch: () => set({ searchParams: {} }),
  
  setSelectedDocument: (id) => set({ selectedDocumentId: id }),
  
  setSelectedFolder: (id) => set({ selectedFolderId: id }),
  
  setUploadDialogOpen: (open) => set({ isUploadDialogOpen: open }),
  
  setPreviewOpen: (open) => set({ isPreviewOpen: open }),
  
  setUploadProgress: (fileId, progress) =>
    set({ uploadProgress: { ...get().uploadProgress, [fileId]: progress } }),
  
  clearUploadProgress: () => set({ uploadProgress: {} }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/documents.ts`

```typescript
import { z } from 'zod';

export const documentUploadSchema = z.object({
  type: z.enum([
    'BOL',
    'POD',
    'RATE_CONFIRMATION',
    'INVOICE',
    'INSURANCE_CERTIFICATE',
    'CARRIER_AGREEMENT',
    'CUSTOMER_CONTRACT',
    'WEIGHT_TICKET',
    'LUMPER_RECEIPT',
    'ACCESSORIAL',
    'CLAIM_DOCUMENT',
    'OTHER',
  ]),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const documentUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

export const documentSearchSchema = z.object({
  query: z.string().optional(),
  type: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const templateGenerateSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  fields: z.record(z.unknown()),
});

export type DocumentUploadData = z.infer<typeof documentUploadSchema>;
export type DocumentUpdateData = z.infer<typeof documentUpdateSchema>;
export type DocumentSearchData = z.infer<typeof documentSearchSchema>;
export type TemplateGenerateData = z.infer<typeof templateGenerateSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/documents/document-browser.tsx`
- [ ] `components/documents/document-grid.tsx`
- [ ] `components/documents/document-list.tsx`
- [ ] `components/documents/document-card.tsx`
- [ ] `components/documents/document-viewer.tsx`
- [ ] `components/documents/document-upload-zone.tsx`
- [ ] `components/documents/document-upload-form.tsx`
- [ ] `components/documents/bulk-upload-dialog.tsx`
- [ ] `components/documents/document-details-panel.tsx`
- [ ] `components/documents/document-actions.tsx`
- [ ] `components/documents/document-search.tsx`
- [ ] `components/documents/document-filters.tsx`
- [ ] `components/documents/document-type-badge.tsx`
- [ ] `components/documents/document-template-card.tsx`
- [ ] `components/documents/folder-tree.tsx`
- [ ] `components/documents/recent-documents.tsx`

### Pages
- [ ] `app/(dashboard)/documents/page.tsx`
- [ ] `app/(dashboard)/documents/upload/page.tsx`
- [ ] `app/(dashboard)/documents/[id]/page.tsx`
- [ ] `app/(dashboard)/documents/search/page.tsx`
- [ ] `app/(dashboard)/documents/templates/page.tsx`

### Hooks & Stores
- [ ] `lib/types/documents.ts`
- [ ] `lib/validations/documents.ts`
- [ ] `lib/hooks/documents/use-documents.ts`
- [ ] `lib/stores/documents-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [11-communication-ui.md](./11-communication-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/17-service-documents.md)
- [API Review](../../api-review-docs/10-documents-review.html)
