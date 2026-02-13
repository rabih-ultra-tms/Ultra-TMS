/**
 * Operations Module Types
 * Mirrors backend DTOs and API responses
 */

// ============================================================================
// TRUCK TYPES
// ============================================================================

export interface TruckType {
  id: string;
  name: string;
  category: string;
  deckLengthFt: number;
  deckWidthFt: number;
  deckHeightFt: number;
  wellLengthFt?: number;
  maxCargoWeightLbs: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// LOAD PLANNER QUOTES
// ============================================================================

export interface CargoItem {
  id: string;
  description: string;
  loadType?: string;
  sku?: string;
  quantity: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  weightLbs: number;
  stackable: boolean;
  bottomOnly: boolean;
  maxLayers?: number;
  fragile: boolean;
  hazmat: boolean;
  notes?: string;
  orientation?: string;
  geometryType?: string;
  equipmentMakeId?: string;
  equipmentModelId?: string;
  dimensionsSource?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  imageUrl4?: string;
  assignedTruckIndex?: number;
  placementX?: number;
  placementY?: number;
  placementZ?: number;
  rotation?: number;
  sortOrder: number;
  parentCargoId?: string;
}

export interface LoadPlannerTruck {
  id: string;
  truckIndex: number;
  truckTypeId?: string;
  truckName: string;
  truckCategory?: string;
  deckLengthFt: number;
  deckWidthFt: number;
  deckHeightFt: number;
  wellLengthFt?: number;
  maxCargoWeightLbs: number;
  totalWeightLbs?: number;
  totalItems?: number;
  isLegal: boolean;
  permitsRequired?: string[];
  warnings?: string[];
  truckScore?: number;
  sortOrder: number;
}

export interface ServiceItem {
  id: string;
  serviceTypeId: string;
  name: string;
  rateCents: number;
  quantity: number;
  totalCents: number;
  truckIndex?: number;
  sortOrder: number;
}

export interface Accessorial {
  id: string;
  accessorialTypeId: string;
  name: string;
  billingUnit: 'FLAT' | 'PER_MILE' | 'PER_UNIT';
  rateCents: number;
  quantity: number;
  totalCents: number;
  notes?: string;
  sortOrder: number;
}

export interface Permit {
  id: string;
  stateCode: string;
  stateName: string;
  calculatedPermitFeeCents?: number;
  calculatedEscortFeeCents?: number;
  calculatedPoleCarFeeCents?: number;
  calculatedSuperLoadFeeCents?: number;
  calculatedTotalCents?: number;
  overridePermitFeeCents?: number;
  overrideEscortFeeCents?: number;
  overridePoleCarFeeCents?: number;
  overrideSuperLoadFeeCents?: number;
  overrideTotalCents?: number;
  distanceMiles?: number;
  escortCount?: number;
  poleCarRequired: boolean;
  sortOrder: number;
}

export interface LoadPlannerQuote {
  id: string;
  quoteNumber: string;
  publicToken: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  pickupAddress: string;
  pickupCity: string;
  pickupState: string;
  pickupZip: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffState: string;
  dropoffZip: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceMiles: number;
  durationMinutes: number;
  routePolyline?: string;
  subtotalCents: number;
  totalCents: number;
  sentAt?: string;
  viewedAt?: string;
  expiresAt?: string;
  cargoItems: CargoItem[];
  trucks: LoadPlannerTruck[];
  serviceItems: ServiceItem[];
  accessorials: Accessorial[];
  permits: Permit[];
  createdAt: string;
  updatedAt: string;
}

export interface LoadPlannerQuoteListItem extends Omit<LoadPlannerQuote, 'cargoItems' | 'trucks' | 'serviceItems' | 'accessorials' | 'permits'> {
  _count: {
    cargoItems: number;
    trucks: number;
  };
}

export interface LoadPlannerQuoteStats {
  totalLoads: number;
  draftCount: number;
  sentCount: number;
  acceptedCount: number;
  rejectedCount: number;
  totalValueCents: number;
}

// ============================================================================
// CARRIERS
// ============================================================================

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
  factoringPhone?: string;
  factoringEmail?: string;
  insuranceCompany?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string;
  insuranceCargoLimitCents?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PREFERRED' | 'ON_HOLD' | 'BLACKLISTED';
  notes?: string;
  drivers?: OperationsCarrierDriver[];
  trucks?: OperationsCarrierTruck[];
  createdAt: string;
  updatedAt: string;
}

export interface OperationsCarrierListItem extends Omit<OperationsCarrier, 'drivers' | 'trucks'> {
  _count: {
    drivers: number;
    trucks: number;
  };
}

// ============================================================================
// LOAD HISTORY
// ============================================================================

export interface LoadHistory {
  id: string;
  tenantId: string;
  loadPlannerQuoteId?: string;
  inlandQuoteId?: string;
  quoteNumber: string;
  customerName: string;
  customerCompany?: string;
  carrierId?: string;
  driverId?: string;
  truckId?: string;
  originCity: string;
  originState: string;
  originZip: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  totalMiles: number;
  cargoDescription: string;
  pieces?: number;
  totalLengthIn?: number;
  totalWidthIn?: number;
  totalHeightIn?: number;
  totalWeightLbs?: number;
  isOversize: boolean;
  isOverweight: boolean;
  equipmentTypeUsed?: string;
  customerRateCents: number;
  carrierRateCents: number;
  marginCents: number; // Trigger-calculated
  marginPercentage: number; // Trigger-calculated
  ratePerMileCustomerCents: number; // Trigger-calculated
  ratePerMileCarrierCents: number; // Trigger-calculated
  quoteDate?: string;
  bookedDate?: string;
  pickupDate: string;
  deliveryDate?: string;
  invoiceDate?: string;
  paidDate?: string;
  status: 'BOOKED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  carrier?: OperationsCarrier;
  driver?: OperationsCarrierDriver;
  truck?: OperationsCarrierTruck;
  createdAt: string;
  updatedAt: string;
}

export interface LoadHistoryListResponse {
  data: LoadHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LoadPlannerQuoteListParams extends PaginationParams {
  search?: string;
  status?: string;
  pickupState?: string;
  dropoffState?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LoadHistoryListParams extends PaginationParams {
  search?: string;
  originState?: string;
  destinationState?: string;
  status?: string;
  carrierId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CarrierListParams extends PaginationParams {
  search?: string;
  status?: string;
  carrierType?: string;
}

export interface SimilarLoadsParams {
  originState: string;
  destinationState: string;
  weightLbs: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  tolerance?: number; // Default 0.2 (20%)
}

export interface LaneStats {
  count: number;
  avgRevenueCents: number;
  avgCostCents: number;
  avgMarginCents: number;
}
