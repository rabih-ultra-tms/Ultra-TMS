export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "CONVERTED"
  | "REJECTED"
  | "EXPIRED";

export type ServiceType = "FTL" | "LTL" | "PARTIAL" | "DRAYAGE";

export type EquipmentType =
  | "DRY_VAN"
  | "REEFER"
  | "FLATBED"
  | "STEP_DECK"
  | "LOWBOY"
  | "CONESTOGA"
  | "POWER_ONLY";

export interface Quote {
  id: string;
  quoteNumber: string;
  version: number;
  status: QuoteStatus;
  customerId: string;
  customerName?: string;
  salesAgentId?: string;
  salesAgentName?: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  distance?: number;
  serviceType: ServiceType;
  equipmentType: EquipmentType;
  totalAmount: number;
  estimatedCost?: number;
  marginPercent?: number;
  pickupDate?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
  serviceType?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface QuoteListResponse {
  data: Quote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuoteStats {
  totalQuotes: number;
  activePipeline: number;
  pipelineValue: number;
  wonThisMonth: number;
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  ACCEPTED: "Accepted",
  CONVERTED: "Converted",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  FTL: "FTL",
  LTL: "LTL",
  PARTIAL: "Partial",
  DRAYAGE: "Drayage",
};

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  DRY_VAN: "DV",
  REEFER: "RF",
  FLATBED: "FB",
  STEP_DECK: "SD",
  LOWBOY: "LB",
  CONESTOGA: "CN",
  POWER_ONLY: "PO",
};
