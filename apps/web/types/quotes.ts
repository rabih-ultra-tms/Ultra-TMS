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

export const EQUIPMENT_TYPE_FULL_LABELS: Record<EquipmentType, string> = {
  DRY_VAN: "Dry Van",
  REEFER: "Reefer",
  FLATBED: "Flatbed",
  STEP_DECK: "Step Deck",
  LOWBOY: "Lowboy",
  CONESTOGA: "Conestoga",
  POWER_ONLY: "Power Only",
};

// --- Detail types ---

export interface QuoteStop {
  id: string;
  type: "PICKUP" | "DELIVERY" | "STOP";
  city: string;
  state: string;
  address?: string;
  zipCode?: string;
  facilityName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  notes?: string;
  sequence: number;
}

export interface QuoteDetail extends Quote {
  commodity?: string;
  weight?: number;
  pieces?: number;
  pallets?: number;
  specialHandling?: string[];
  deliveryDate?: string;
  transitTime?: string;
  linehaulRate?: number;
  fuelSurcharge?: number;
  accessorialsTotal?: number;
  marginAmount?: number;
  rateSource?: string;
  ratePerMile?: number;
  marketRateLow?: number;
  marketRateAvg?: number;
  marketRateHigh?: number;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  convertedOrderId?: string;
  convertedOrderNumber?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  parentQuoteId?: string;
  stops?: QuoteStop[];
}

export interface QuoteVersion {
  id: string;
  version: number;
  status: QuoteStatus;
  totalAmount: number;
  changes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface QuoteTimelineEvent {
  id: string;
  type: "created" | "edited" | "sent" | "viewed" | "accepted" | "rejected" | "expired" | "converted" | "note" | "version";
  description: string;
  details?: string;
  createdBy?: string;
  createdAt: string;
}

export interface QuoteNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

// --- Form types ---

export interface QuoteStopInput {
  type: "PICKUP" | "DELIVERY" | "STOP";
  city: string;
  state: string;
  address?: string;
  zipCode?: string;
  facilityName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
  sequence: number;
}

export interface QuoteFormValues {
  customerId: string;
  customerName?: string;
  contactId?: string;
  serviceType: ServiceType;
  equipmentType: EquipmentType;
  commodity?: string;
  weight?: number;
  pieces?: number;
  pallets?: number;
  specialHandling?: string[];
  stops: QuoteStopInput[];
  linehaulRate: number;
  fuelSurcharge?: number;
  accessorials: QuoteAccessorialInput[];
  internalNotes?: string;
  validityDays?: number;
}

export interface QuoteAccessorialInput {
  type: string;
  description?: string;
  rateType: "FLAT" | "PER_MILE" | "PER_CWT" | "PERCENTAGE";
  amount: number;
}

export interface CalculateRateRequest {
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  equipmentType: EquipmentType;
  weight?: number;
  customerId?: string;
}

export interface CalculateRateResponse {
  linehaulRate: number;
  fuelSurcharge: number;
  estimatedCost: number;
  distance: number;
  transitTime: string;
  rateSource: string;
  marketRateLow?: number;
  marketRateAvg?: number;
  marketRateHigh?: number;
}
