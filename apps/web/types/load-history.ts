/**
 * Load History Types
 * Historical load tracking and analytics
 */

import type { OperationsCarrier, OperationsCarrierDriver, OperationsCarrierTruck } from './carriers';

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

export interface LoadHistoryListParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  originState?: string;
  destinationState?: string;
  status?: string;
  carrierId?: string;
  dateFrom?: string;
  dateTo?: string;
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
