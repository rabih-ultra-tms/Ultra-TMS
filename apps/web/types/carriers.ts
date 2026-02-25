/**
 * Carrier Types
 * Carrier companies, drivers, and trucks
 */

export const EQUIPMENT_TYPES = [
  'VAN', 'REEFER', 'FLATBED', 'STEP_DECK', 'POWER_ONLY',
  'BOX_TRUCK', 'SPRINTER', 'INTERMODAL', 'CONESTOGA',
] as const;

export const CARRIER_EQUIPMENT_TYPE_LABELS: Record<string, string> = {
  VAN: 'Dry Van',
  REEFER: 'Refrigerated',
  FLATBED: 'Flatbed',
  STEP_DECK: 'Step Deck',
  POWER_ONLY: 'Power Only',
  BOX_TRUCK: 'Box Truck',
  SPRINTER: 'Sprinter',
  INTERMODAL: 'Intermodal',
  CONESTOGA: 'Conestoga',
};

export const DOCUMENT_TYPES = [
  'W9', 'CARRIER_AGREEMENT', 'AUTHORITY_LETTER',
  'VOID_CHECK', 'INSURANCE_CERTIFICATE', 'OTHER',
] as const;

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  W9: 'W-9',
  CARRIER_AGREEMENT: 'Carrier Agreement',
  AUTHORITY_LETTER: 'Authority Letter',
  VOID_CHECK: 'Void Check',
  INSURANCE_CERTIFICATE: 'Insurance Certificate',
  OTHER: 'Other',
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export interface OperationsCarrierDocument {
  id: string;
  carrierId: string;
  documentType: string;
  name: string;
  description?: string;
  expiryDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationsCarrierDriver {
  id: string;
  carrierId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  isOwner: boolean;
  phone: string;
  phoneSecondary?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  cdlNumber: string;
  cdlState: string;
  cdlClass: string;
  cdlExpiry: string;
  cdlEndorsements?: string[];
  medicalCardExpiry: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationsCarrierTruck {
  id: string;
  carrierId: string;
  unitNumber: string;
  vin: string;
  licensePlate: string;
  licensePlateState: string;
  year: number;
  make: string;
  model: string;
  truckTypeId?: string;
  category?: string;
  customTypeDescription?: string;
  deckLengthFt?: number;
  deckWidthFt?: number;
  deckHeightFt?: number;
  maxCargoWeightLbs?: number;
  axleCount?: number;
  hasTarps: boolean;
  hasChains: boolean;
  hasStraps: boolean;
  coilRacks: boolean;
  loadBars: boolean;
  ramps: boolean;
  registrationExpiry: string;
  annualInspectionDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_SERVICE' | 'SOLD';
  assignedDriverId?: string;
  assignedDriver?: OperationsCarrierDriver;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationsCarrier {
  id: string;
  tenantId: string;
  carrierType: 'COMPANY' | 'OWNER_OPERATOR';
  companyName: string;
  mcNumber?: string;
  dotNumber?: string;
  einTaxId?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  phoneSecondary?: string;
  email: string;
  website?: string;
  billingEmail: string;
  paymentTermsDays: number;
  preferredPaymentMethod: 'CHECK' | 'ACH' | 'WIRE' | 'QUICK_PAY';
  factoringCompanyName?: string;
  factoringCompanyPhone?: string;
  factoringCompanyEmail?: string;
  insuranceCompany?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string;
  cargoInsuranceLimitCents?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PREFERRED' | 'ON_HOLD' | 'BLACKLISTED';
  notes?: string;
  tier?: string | null;
  onTimePickupRate?: number;
  onTimeDeliveryRate?: number;
  claimsRate?: number;
  avgRating?: number;
  acceptanceRate?: number;
  totalLoadsCompleted?: number;
  performanceScore?: number;
  equipmentTypes?: string[];
  truckCount?: number;
  trailerCount?: number;
  drivers?: OperationsCarrierDriver[];
  trucks?: OperationsCarrierTruck[];
  documents?: OperationsCarrierDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface OperationsCarrierListItem extends Omit<OperationsCarrier, 'drivers' | 'trucks' | 'documents'> {
  _count: {
    drivers: number;
    trucks: number;
    documents?: number;
  };
}

export interface CarrierListParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string;
  carrierType?: string;
  state?: string;
}

export interface CarrierLoadHistoryItem {
  id: string;
  status: string;
  pickupDate?: string;
  deliveryDate?: string;
  carrierRateCents: number;
  ratePerMileCarrierCents: number;
  originCity?: string;
  originState?: string;
  destinationCity?: string;
  destinationState?: string;
  totalMiles?: number;
}

export interface CarrierScorecardResponse {
  carrier: OperationsCarrier & {
    LoadHistory: CarrierLoadHistoryItem[];
  };
}
