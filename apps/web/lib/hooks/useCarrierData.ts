import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { carrierClient } from '@/lib/api/carrier-client';

// ============================================================================
// Type Definitions
// ============================================================================

export interface AvailableLoad {
  id: string;
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate: string;
  weight: number;
  rate: number;
  status: string;
}

export interface LoadDetail extends AvailableLoad {
  pickupAddress?: string;
  deliveryAddress?: string;
  commodities?: Array<{ description: string; weight: number }>;
  specialInstructions?: string;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  status: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: string;
  referenceNumber?: string;
}

export interface PaymentDetail extends PaymentRecord {
  transactionDetails?: Record<string, string>;
}

export interface Document {
  id: string;
  fileName: string;
  type: string;
  uploadedAt: string;
  url: string;
}

export interface ComplianceDocument {
  id: string;
  documentType: string;
  status: string;
  expiryDate?: string;
  uploadedAt: string;
}

export interface Settlement {
  id: string;
  date: string;
  totalAmount: number;
  status: string;
  invoiceCount: number;
}

export interface CarrierProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  language?: string;
}

export interface QuickPayStatus {
  id: string;
  requestedAmount: number;
  status: string;
  approvedAmount?: number;
  approvedAt?: string;
}

export interface DashboardData {
  activeLoads: number;
  totalRevenue: number;
  pendingInvoices: number;
  complianceStatus: string;
  alerts: Array<{ id: string; message: string; severity: string }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

// ============================================================================
// Carrier Query Keys
// ============================================================================

export const carrierKeys = {
  all: ['carrier'] as const,
  dashboard: () => [...carrierKeys.all, 'dashboard'] as const,
  loads: () => [...carrierKeys.all, 'loads'] as const,
  loadFiltered: (filters?: Record<string, unknown>) =>
    [...carrierKeys.all, 'loads', filters] as const,
  load: (id: string) => [...carrierKeys.all, 'loads', id] as const,
  drivers: () => [...carrierKeys.all, 'drivers'] as const,
  driver: (id: string) => [...carrierKeys.all, 'drivers', id] as const,
  paymentHistory: () => [...carrierKeys.all, 'payments', 'history'] as const,
  paymentHistoryFiltered: (filters?: Record<string, unknown>) =>
    [...carrierKeys.all, 'payments', 'history', filters] as const,
  paymentDetail: (id: string) => [...carrierKeys.all, 'payments', id] as const,
  documents: () => [...carrierKeys.all, 'documents'] as const,
  complianceDocs: () =>
    [...carrierKeys.all, 'compliance', 'documents'] as const,
  settlementHistory: () =>
    [...carrierKeys.all, 'settlements', 'history'] as const,
  settlement: (id: string) => [...carrierKeys.all, 'settlements', id] as const,
  profile: () => [...carrierKeys.all, 'profile'] as const,
  quickPayStatus: (requestId: string) =>
    [...carrierKeys.all, 'quick-pay', requestId] as const,
};

// ============================================================================
// Dashboard Hooks
// ============================================================================

/**
 * Fetch carrier dashboard metrics including active loads, revenue, and alerts
 */
export function useDashboardData(options?: UseQueryOptions<DashboardData>) {
  return useQuery({
    queryKey: carrierKeys.dashboard(),
    queryFn: () => carrierClient.getDashboardData(),
    staleTime: 30_000,
    ...options,
  });
}

// ============================================================================
// Load Hooks
// ============================================================================

/**
 * Fetch list of available loads with optional filters
 * @param filters - Optional filter parameters (origin, destination, date range, etc.)
 */
export function useAvailableLoads(
  filters?: Record<string, unknown>,
  options?: UseQueryOptions<AvailableLoad[]>
) {
  return useQuery({
    queryKey: carrierKeys.loadFiltered(filters),
    queryFn: () => carrierClient.getAvailableLoads(filters),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch specific load details by ID
 * @param id - Load ID (required; query is disabled if ID is falsy)
 */
export function useLoadDetail(
  id: string | undefined,
  options?: UseQueryOptions<LoadDetail>
) {
  return useQuery({
    queryKey: carrierKeys.load(id || ''),
    queryFn: () => carrierClient.getLoadDetail(id!),
    enabled: !!id,
    staleTime: 30_000,
    ...options,
  });
}

// ============================================================================
// Driver Hooks
// ============================================================================

/**
 * Fetch list of drivers for the carrier
 */
export function useDrivers(options?: UseQueryOptions<Driver[]>) {
  return useQuery({
    queryKey: carrierKeys.drivers(),
    queryFn: () => carrierClient.getDrivers(),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch specific driver details by ID
 * @param id - Driver ID (required; query is disabled if ID is falsy)
 */
export function useDriverDetail(
  id: string | undefined,
  options?: UseQueryOptions<Driver>
) {
  return useQuery({
    queryKey: carrierKeys.driver(id || ''),
    queryFn: () => {
      // Note: carrierClient doesn't have getDriverDetail, but we fetch from drivers list
      // In a real scenario, there would be a dedicated endpoint
      return carrierClient.getDrivers().then((drivers) => {
        const driver = drivers.find((d) => d.id === id);
        if (!driver) {
          throw new Error(`Driver ${id} not found`);
        }
        return driver;
      });
    },
    enabled: !!id,
    staleTime: 30_000,
    ...options,
  });
}

// ============================================================================
// Payment Hooks
// ============================================================================

/**
 * Fetch payment history with optional filters
 * @param filters - Optional filter parameters (date range, status, etc.)
 */
export function usePaymentHistory(
  filters?: Record<string, unknown>,
  options?: UseQueryOptions<PaymentRecord[]>
) {
  return useQuery({
    queryKey: carrierKeys.paymentHistoryFiltered(filters),
    queryFn: () => carrierClient.getPaymentHistory(filters),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch specific payment details by ID
 * @param id - Payment ID (required; query is disabled if ID is falsy)
 */
export function usePaymentDetail(
  id: string | undefined,
  options?: UseQueryOptions<PaymentDetail>
) {
  return useQuery({
    queryKey: carrierKeys.paymentDetail(id || ''),
    queryFn: () => carrierClient.getPaymentDetail(id!),
    enabled: !!id,
    staleTime: 30_000,
    ...options,
  });
}

// ============================================================================
// Document Hooks
// ============================================================================

/**
 * Fetch list of documents uploaded by the carrier
 */
export function useDocuments(options?: UseQueryOptions<Document[]>) {
  return useQuery({
    queryKey: carrierKeys.documents(),
    queryFn: () => carrierClient.getDocuments(),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch compliance documents for the carrier
 */
export function useComplianceDocs(
  options?: UseQueryOptions<ComplianceDocument[]>
) {
  return useQuery({
    queryKey: carrierKeys.complianceDocs(),
    queryFn: () => carrierClient.getComplianceDocs(),
    staleTime: 30_000,
    ...options,
  });
}

// ============================================================================
// Settlement Hooks
// ============================================================================

/**
 * Fetch settlement history for the carrier
 */
export function useSettlementHistory(options?: UseQueryOptions<Settlement[]>) {
  return useQuery({
    queryKey: carrierKeys.settlementHistory(),
    queryFn: () => carrierClient.getSettlementHistory(),
    staleTime: 30_000,
    ...options,
  });
}

// ============================================================================
// Profile Hooks
// ============================================================================

/**
 * Fetch current carrier user profile
 */
export function useCarrierProfile(options?: UseQueryOptions<CarrierProfile>) {
  return useQuery({
    queryKey: carrierKeys.profile(),
    queryFn: () => carrierClient.getProfile(),
    staleTime: 30_000,
    ...options,
  });
}

// ============================================================================
// Quick Pay Hooks
// ============================================================================

/**
 * Fetch quick pay request status by request ID
 * @param requestId - Quick pay request ID (required; query is disabled if requestId is falsy)
 */
export function useQuickPayStatus(
  requestId: string | undefined,
  options?: UseQueryOptions<QuickPayStatus>
) {
  return useQuery({
    queryKey: carrierKeys.quickPayStatus(requestId || ''),
    queryFn: () => carrierClient.getQuickPayStatus(requestId!),
    enabled: !!requestId,
    staleTime: 30_000,
    ...options,
  });
}
