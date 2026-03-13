import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { portalClient } from '@/lib/api/portal-client';

// ============================================================================
// Portal Query Keys
// ============================================================================

export const portalKeys = {
  all: ['portal'] as const,
  dashboard: () => [...portalKeys.all, 'dashboard'] as const,
  activeShipments: () =>
    [...portalKeys.all, 'dashboard', 'active-shipments'] as const,
  recentActivity: () =>
    [...portalKeys.all, 'dashboard', 'recent-activity'] as const,
  alerts: () => [...portalKeys.all, 'dashboard', 'alerts'] as const,
  invoices: () => [...portalKeys.all, 'invoices'] as const,
  invoice: (id: string) => [...portalKeys.all, 'invoices', id] as const,
  invoiceAgingSummary: () =>
    [...portalKeys.all, 'invoices', 'aging', 'summary'] as const,
  shipments: () => [...portalKeys.all, 'shipments'] as const,
  shipment: (id: string) => [...portalKeys.all, 'shipments', id] as const,
  shipmentTracking: (code: string) =>
    [...portalKeys.all, 'tracking', code] as const,
  shipmentDocuments: (id: string) =>
    [...portalKeys.all, 'shipments', id, 'documents'] as const,
  paymentHistory: () => [...portalKeys.all, 'payments', 'history'] as const,
  paymentDetails: (id: string) => [...portalKeys.all, 'payments', id] as const,
};

// ============================================================================
// Dashboard Hooks
// ============================================================================

/**
 * Fetch dashboard summary with shipment and invoice statistics
 */
export function useDashboard(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: portalKeys.dashboard(),
    queryFn: () => portalClient.getDashboard(),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch active shipments for dashboard
 */
export function useActiveShipments(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: portalKeys.activeShipments(),
    queryFn: () => portalClient.getActiveShipments(),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch recent activity for dashboard
 */
export function useRecentActivity(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: portalKeys.recentActivity(),
    queryFn: () => portalClient.getRecentActivity(),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch alerts for dashboard
 */
export function useAlerts(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: portalKeys.alerts(),
    queryFn: () => portalClient.getAlerts(),
    staleTime: 30_000,
    ...options,
  });
}

// ============================================================================
// Invoice Hooks
// ============================================================================

/**
 * Fetch list of invoices
 */
export function useInvoices(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: portalKeys.invoices(),
    queryFn: () => portalClient.getInvoices(),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch a single invoice by ID
 * @param id - Invoice ID (required; query is disabled if ID is falsy)
 */
export function useInvoice(
  id: string | undefined,
  options?: UseQueryOptions<any>
) {
  return useQuery({
    queryKey: portalKeys.invoice(id || ''),
    queryFn: () => portalClient.getInvoice(id!),
    enabled: !!id,
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch invoice aging summary
 */
export function useInvoiceAgingSummary(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: portalKeys.invoiceAgingSummary(),
    queryFn: () => portalClient.getInvoiceAgingSummary(),
    staleTime: 30_000,
    ...options,
  });
}

// ============================================================================
// Shipment Hooks
// ============================================================================

/**
 * Fetch list of shipments
 */
export function useShipments(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: portalKeys.shipments(),
    queryFn: () => portalClient.getShipments(),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch a single shipment by ID
 * @param id - Shipment ID (required; query is disabled if ID is falsy)
 */
export function useShipment(
  id: string | undefined,
  options?: UseQueryOptions<any>
) {
  return useQuery({
    queryKey: portalKeys.shipment(id || ''),
    queryFn: () => portalClient.getShipment(id!),
    enabled: !!id,
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch shipment tracking updates by tracking code
 * @param code - Shipment tracking code (required; query is disabled if code is falsy)
 */
export function useShipmentTracking(
  code: string | undefined,
  options?: UseQueryOptions<any>
) {
  return useQuery({
    queryKey: portalKeys.shipmentTracking(code || ''),
    queryFn: () => portalClient.getShipmentTracking(code!),
    enabled: !!code,
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch shipment documents by shipment ID
 * @param id - Shipment ID (required; query is disabled if ID is falsy)
 */
export function useShipmentDocuments(
  id: string | undefined,
  options?: UseQueryOptions<any>
) {
  return useQuery({
    queryKey: portalKeys.shipmentDocuments(id || ''),
    queryFn: () => portalClient.getShipmentDocuments(id!),
    enabled: !!id,
    staleTime: 30_000,
    ...options,
  });
}

// ============================================================================
// Payment Hooks
// ============================================================================

/**
 * Fetch payment history
 */
export function usePaymentHistory(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: portalKeys.paymentHistory(),
    queryFn: () => portalClient.getPaymentHistory(),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch payment details by payment ID
 * @param id - Payment ID (required; query is disabled if ID is falsy)
 */
export function usePaymentDetails(
  id: string | undefined,
  options?: UseQueryOptions<any>
) {
  return useQuery({
    queryKey: portalKeys.paymentDetails(id || ''),
    queryFn: () => portalClient.getPaymentDetails(id!),
    enabled: !!id,
    staleTime: 30_000,
    ...options,
  });
}
