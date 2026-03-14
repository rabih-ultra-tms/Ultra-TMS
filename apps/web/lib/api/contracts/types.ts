/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Contract service types
 */

export enum ContractType {
  CARRIER = 'CARRIER',
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  PENDING_SIGNATURE = 'PENDING_SIGNATURE',
  SIGNED = 'SIGNED',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export interface Contract {
  id: string;
  tenantId: string;
  contractNumber: string;
  contractName: string;
  type: ContractType;
  status: ContractStatus;
  partyId: string;
  partyName: string;
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  terms: string;
  attachments: string[];
  externalId?: string;
  sourceSystem?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface RateTable {
  id: string;
  contractId: string;
  name: string;
  type: string;
  effectiveDate: string;
  expiryDate: string;
  baseCurrency: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface RateLane {
  id: string;
  rateTableId: string;
  origin: string;
  destination: string;
  originZone?: string;
  destinationZone?: string;
  weight?: number;
  distance?: number;
  baseRate: number;
  markup?: number;
  discount?: number;
  minCharge?: number;
  effectiveDate: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Amendment {
  id: string;
  contractId: string;
  title: string;
  description: string;
  effectiveDate: string;
  status: string;
  changes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SLA {
  id: string;
  contractId: string;
  name: string;
  description: string;
  deliveryTime: number;
  pickupTime: number;
  onTimePercentage: number;
  penalty?: number;
  reward?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VolumeCommitment {
  id: string;
  contractId: string;
  commitmentPeriod: string;
  minVolume: number;
  maxVolume: number;
  volumeUnit: string;
  discountPercentage: number;
  penaltyPercentage?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface FuelSurchargeTable {
  id: string;
  name: string;
  baseFuelPrice: number;
  surchargePercentage: number;
  effectiveDate: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  type: ContractType;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ContractFilters {
  type?: ContractType;
  status?: ContractStatus[];
  partyId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
