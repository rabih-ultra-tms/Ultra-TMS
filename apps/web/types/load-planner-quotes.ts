/**
 * Load Planner Quote Types
 * Load planning, cargo items, trucks, and related entities
 */

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
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerZip?: string;
  internalNotes?: string;
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

export interface LoadPlannerQuoteListParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string;
  pickupState?: string;
  dropoffState?: string;
  dateFrom?: string;
  dateTo?: string;
}
