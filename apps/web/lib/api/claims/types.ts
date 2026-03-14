/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Claims service types
 */

export enum ClaimType {
  CARGO_DAMAGE = 'CARGO_DAMAGE',
  CARGO_LOSS = 'CARGO_LOSS',
  SHORTAGE = 'SHORTAGE',
  LATE_DELIVERY = 'LATE_DELIVERY',
  OVERCHARGE = 'OVERCHARGE',
  OTHER = 'OTHER',
}

export enum ClaimStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  PENDING_DOCUMENTATION = 'PENDING_DOCUMENTATION',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  SETTLED = 'SETTLED',
  CLOSED = 'CLOSED',
}

export enum ClaimDisposition {
  CARRIER_LIABILITY = 'CARRIER_LIABILITY',
  SHIPPER_LIABILITY = 'SHIPPER_LIABILITY',
  RECEIVER_LIABILITY = 'RECEIVER_LIABILITY',
  SHARED_LIABILITY = 'SHARED_LIABILITY',
  NO_LIABILITY = 'NO_LIABILITY',
}

export interface ClaimItem {
  id: string;
  claimId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalValue?: number;
  damageType?: string;
  damageExtent?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ClaimDocument {
  id: string;
  claimId: string;
  fileName: string;
  fileUrl: string;
  documentType: string;
  uploadedBy: string;
  uploadedAt: string;
  deletedAt: string | null;
}

export interface ClaimNote {
  id: string;
  claimId: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ClaimAdjustment {
  id: string;
  claimId: string;
  adjustmentType: string;
  adjustmentAmount: number;
  reason: string;
  createdBy: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface Claim {
  id: string;
  tenantId: string;
  claimNumber: string;
  claimType: ClaimType;
  status: ClaimStatus;
  disposition?: ClaimDisposition;
  loadId?: string;
  orderId?: string;
  carrierId?: string;
  companyId?: string;
  claimedAmount: number;
  approvedAmount?: number;
  paidAmount: number;
  incidentDate: string;
  incidentLocation?: string;
  description: string;
  claimantName: string;
  claimantCompany?: string;
  claimantEmail?: string;
  claimantPhone?: string;
  filedDate: string;
  receivedDate?: string;
  dueDate?: string;
  closedDate?: string;
  assignedToId?: string;
  investigationNotes?: string;
  rootCause?: string;
  preventionNotes?: string;
  externalId?: string;
  sourceSystem?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ClaimDetailResponse {
  id: string;
  tenantId: string;
  claimNumber: string;
  claimType: ClaimType;
  status: ClaimStatus;
  disposition?: ClaimDisposition;
  loadId?: string;
  orderId?: string;
  carrierId?: string;
  companyId?: string;
  claimedAmount: number;
  approvedAmount?: number;
  paidAmount: number;
  incidentDate: string;
  incidentLocation?: string;
  description: string;
  claimantName: string;
  claimantCompany?: string;
  claimantEmail?: string;
  claimantPhone?: string;
  filedDate: string;
  receivedDate?: string;
  dueDate?: string;
  closedDate?: string;
  assignedToId?: string;
  investigationNotes?: string;
  rootCause?: string;
  preventionNotes?: string;
  externalId?: string;
  sourceSystem?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  items?: ClaimItem[];
  documents?: ClaimDocument[];
  notes?: ClaimNote[];
  adjustments?: ClaimAdjustment[];
}

export interface ClaimListResponse {
  data: Claim[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ClaimFilters {
  status?: ClaimStatus[];
  claimType?: ClaimType[];
  carrierId?: string;
  companyId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface CreateClaimItemDTO {
  description: string;
  quantity: number;
  unitPrice: number;
  totalValue?: number;
  damageType?: string;
  damageExtent?: string;
}

export interface UpdateClaimItemDTO {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  totalValue?: number;
  damageType?: string;
  damageExtent?: string;
}

export interface CreateClaimDocumentDTO {
  fileName: string;
  fileUrl: string;
  documentType: string;
}

export interface CreateClaimNoteDTO {
  content: string;
}

export interface UpdateClaimNoteDTO {
  content: string;
}

export interface CreateClaimDTO {
  orderId?: string;
  loadId?: string;
  companyId?: string;
  carrierId?: string;
  claimType: ClaimType;
  description: string;
  incidentDate: string;
  incidentLocation?: string;
  claimedAmount: number;
  claimantName: string;
  claimantCompany?: string;
  claimantEmail?: string;
  claimantPhone?: string;
  receivedDate?: string;
  dueDate?: string;
  items?: CreateClaimItemDTO[];
}

export interface UpdateClaimDTO {
  claimType?: ClaimType;
  description?: string;
  incidentDate?: string;
  incidentLocation?: string;
  claimedAmount?: number;
  claimantName?: string;
  claimantCompany?: string;
  claimantEmail?: string;
  claimantPhone?: string;
  receivedDate?: string;
  dueDate?: string;
}

export interface FileClaimDTO {
  reason?: string;
}

export interface AssignClaimDTO {
  assignedToId: string;
}

export interface UpdateClaimStatusDTO {
  status: ClaimStatus;
  reason?: string;
}

export interface ApproveClaimDTO {
  approvedAmount: number;
  reason?: string;
}

export interface DenyClaimDTO {
  reason: string;
}

export interface PayClaimDTO {
  paidAmount: number;
  paymentMethod?: string;
  reason?: string;
}

export interface CloseClaimDTO {
  reason?: string;
}

export interface UpdateInvestigationDTO {
  investigationNotes?: string;
  rootCause?: string;
  preventionNotes?: string;
  disposition?: ClaimDisposition;
}

export interface CreateClaimAdjustmentDTO {
  adjustmentType: string;
  adjustmentAmount: number;
  reason: string;
}

// API Response Envelopes
export interface ApiDataResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}
