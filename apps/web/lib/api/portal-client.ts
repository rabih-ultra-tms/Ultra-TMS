/**
 * Portal HTTP Client
 *
 * Handles all requests to /api/v1/portal/* endpoints with automatic
 * JWT token management from usePortalAuthStore.
 */

import { usePortalAuthStore } from '@/lib/store/portal-auth.store';

const BASE_URL = '/api/v1/portal';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Backward compatibility: local token storage for SSR/initial hydration
let localToken: string | null = null;
let localRefreshToken: string | null = null;

// eslint-disable-next-line no-undef
interface PortalRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

// ============================================================================
// Main PortalClient Class
// ============================================================================

class PortalClient {
  private getHeaders() {
    const token = usePortalAuthStore.getState().token;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(
    endpoint: string,
    options?: PortalRequestOptions
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const { body, ...fetchOptions } = options || {};

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...this.getHeaders(),
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // Auth endpoints
  login(email: string, password: string) {
    return this.request<{
      token: string;
      user: { id: string; email: string; name: string; companyId: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  logout() {
    return this.request<void>('/auth/logout', { method: 'POST' });
  }

  refreshToken() {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  // Dashboard endpoints
  getDashboard() {
    return this.request<{
      shipmentStats: {
        total: number;
        active: number;
        completed: number;
        delayed: number;
      };
      invoiceStats: {
        total: number;
        pending: number;
        overdue: number;
      };
      alertCount: number;
    }>('/dashboard', { method: 'GET' });
  }

  getActiveShipments() {
    return this.request<
      Array<{
        id: string;
        trackingNumber: string;
        status: string;
        origin: string;
        destination: string;
        estimatedDelivery: string;
        currentLocation: string;
      }>
    >('/dashboard/shipments/active', { method: 'GET' });
  }

  getRecentActivity() {
    return this.request<
      Array<{
        id: string;
        type: string;
        description: string;
        timestamp: string;
        relatedShipmentId?: string;
      }>
    >('/dashboard/activity/recent', { method: 'GET' });
  }

  getAlerts() {
    return this.request<
      Array<{
        id: string;
        type: string;
        severity: string;
        message: string;
        timestamp: string;
        relatedShipmentId?: string;
      }>
    >('/dashboard/alerts', { method: 'GET' });
  }

  // Invoice endpoints
  getInvoices() {
    return this.request<
      Array<{
        id: string;
        invoiceNumber: string;
        issueDate: string;
        dueDate: string;
        totalAmount: number;
        status: string;
      }>
    >('/invoices', { method: 'GET' });
  }

  getInvoice(id: string) {
    return this.request<{
      id: string;
      invoiceNumber: string;
      issueDate: string;
      dueDate: string;
      totalAmount: number;
      status: string;
      items: Array<{
        description: string;
        quantity: number;
        rate: number;
        amount: number;
      }>;
      notes?: string;
    }>(`/invoices/${id}`, { method: 'GET' });
  }

  getInvoicePdf(id: string) {
    return fetch(`${BASE_URL}/invoices/${id}/pdf`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  getInvoiceAgingSummary() {
    return this.request<{
      current: number;
      thirtyDays: number;
      sixtyDays: number;
      ninetyDays: number;
      over90Days: number;
    }>('/invoices/aging/summary', { method: 'GET' });
  }

  // Shipment endpoints
  getShipments() {
    return this.request<
      Array<{
        id: string;
        trackingNumber: string;
        status: string;
        origin: string;
        destination: string;
        shipDate: string;
        estimatedDelivery: string;
      }>
    >('/shipments', { method: 'GET' });
  }

  getShipment(id: string) {
    return this.request<{
      id: string;
      trackingNumber: string;
      status: string;
      origin: string;
      destination: string;
      shipDate: string;
      estimatedDelivery: string;
      actualDelivery?: string;
      weight: number;
      weightUnit: string;
      dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
      };
      items: Array<{
        description: string;
        quantity: number;
        sku?: string;
      }>;
    }>(`/shipments/${id}`, { method: 'GET' });
  }

  getShipmentTracking(code: string) {
    return this.request<
      Array<{
        timestamp: string;
        location: string;
        status: string;
        description: string;
      }>
    >(`/shipments/tracking/${code}`, { method: 'GET' });
  }

  getShipmentDocuments(id: string) {
    return this.request<
      Array<{
        id: string;
        name: string;
        type: string;
        uploadedAt: string;
        url: string;
      }>
    >(`/shipments/${id}/documents`, { method: 'GET' });
  }

  // Payment endpoints
  getPaymentHistory() {
    return this.request<
      Array<{
        id: string;
        date: string;
        amount: number;
        method: string;
        status: string;
        referenceNumber?: string;
      }>
    >('/payments/history', { method: 'GET' });
  }

  makePayment(
    amount: number,
    method: string,
    details?: Record<string, string>
  ) {
    return this.request<{
      id: string;
      transactionId: string;
      status: string;
      amount: number;
      date: string;
    }>('/payments', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        method,
        ...details,
      }),
    });
  }

  getPaymentDetails(id: string) {
    return this.request<{
      id: string;
      date: string;
      amount: number;
      method: string;
      status: string;
      referenceNumber?: string;
      transactionDetails?: Record<string, string>;
    }>(`/payments/${id}`, { method: 'GET' });
  }
}

export const portalClient = new PortalClient();

// ============================================================================
// Backward Compatibility Exports (for existing hooks)
// ============================================================================

export class PortalApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'PortalApiError';
    this.status = status;
  }
}

export function setPortalTokens(accessToken: string, refreshToken?: string) {
  localToken = accessToken;
  if (refreshToken) {
    localRefreshToken = refreshToken;
  }
  usePortalAuthStore.getState().setToken(accessToken);
  if (refreshToken) {
    usePortalAuthStore.getState().setRefreshToken(refreshToken);
  }
}

export function clearPortalTokens() {
  localToken = null;
  localRefreshToken = null;
  usePortalAuthStore.getState().logout();
}

export function getPortalAccessToken(): string | undefined {
  return usePortalAuthStore.getState().token || localToken || undefined;
}

export function getPortalRefreshToken(): string | undefined {
  return (
    usePortalAuthStore.getState().refreshToken || localRefreshToken || undefined
  );
}

async function portalRequest<T>(
  endpoint: string,
  options: PortalRequestOptions & { skipAuth?: boolean } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const { body, skipAuth, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (!skipAuth) {
    const token = getPortalAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // ignore parse error
    }
    throw new PortalApiError(message, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const portalApi = {
  get: <T>(endpoint: string) => portalRequest<T>(endpoint),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: { skipAuth?: boolean }
  ) =>
    portalRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    portalRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    portalRequest<T>(endpoint, { method: 'DELETE' }),
};
