/**
 * Carrier Types
 * Carrier companies, drivers, and trucks
 */

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

export interface CarrierListParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string;
  carrierType?: string;
}
