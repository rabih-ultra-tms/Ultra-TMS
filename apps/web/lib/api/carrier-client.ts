/* eslint-disable no-undef */
/**
 * Carrier Portal HTTP Client
 *
 * Handles all requests to /api/v1/carrier-portal/* endpoints with automatic
 * JWT token management from useCarrierAuthStore.
 */

import { useCarrierAuthStore } from '@/lib/store/carrier-auth.store';

const BASE_URL = '/api/v1/carrier-portal';

interface CarrierRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

// ============================================================================
// Main CarrierClient Class
// ============================================================================

class CarrierClient {
  private getHeaders() {
    const token = useCarrierAuthStore.getState().token;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(
    endpoint: string,
    options?: CarrierRequestOptions
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

  // ========================================================================
  // Auth Endpoints
  // ========================================================================

  login(email: string, password: string) {
    return this.request<{
      token: string;
      user: { id: string; email: string; name: string; carrierId: string };
    }>('/auth/login', {
      method: 'POST',
      body: { email, password },
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

  // ========================================================================
  // Loads Endpoints
  // ========================================================================

  getAvailableLoads(filters?: Record<string, unknown>) {
    const queryString = filters
      ? `?${new URLSearchParams(
          Object.entries(filters).map(([k, v]) => [k, String(v)])
        ).toString()}`
      : '';
    return this.request<
      Array<{
        id: string;
        origin: string;
        destination: string;
        pickupDate: string;
        deliveryDate: string;
        weight: number;
        rate: number;
        status: string;
      }>
    >(`/loads/available${queryString}`, { method: 'GET' });
  }

  getLoadDetail(id: string) {
    return this.request<{
      id: string;
      origin: string;
      destination: string;
      pickupDate: string;
      deliveryDate: string;
      weight: number;
      rate: number;
      status: string;
      pickupAddress?: string;
      deliveryAddress?: string;
      commodities?: Array<{ description: string; weight: number }>;
      specialInstructions?: string;
    }>(`/loads/${id}`, { method: 'GET' });
  }

  acceptLoad(id: string) {
    return this.request<{ id: string; status: string }>(`/loads/${id}/accept`, {
      method: 'POST',
    });
  }

  rejectLoad(id: string) {
    return this.request<{ id: string; status: string }>(
      `/loads/${id}/decline`,
      { method: 'POST' }
    );
  }

  // ========================================================================
  // Documents Endpoints
  // ========================================================================

  uploadDocuments(files: globalThis.File[], type: string) {
    // Note: This would need FormData handling in a real implementation
    // For now, we provide the method signature matching the spec
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('documentType', type);

    return this.request<Array<{ id: string; fileName: string; type: string }>>(
      '/documents',
      {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let fetch set it with boundary
          'Content-Type': undefined as unknown as string,
        },
      }
    );
  }

  getDocuments() {
    return this.request<
      Array<{
        id: string;
        fileName: string;
        type: string;
        uploadedAt: string;
        url: string;
      }>
    >('/documents', { method: 'GET' });
  }

  deleteDocument(id: string) {
    return this.request<void>(`/documents/${id}`, { method: 'DELETE' });
  }

  downloadDocument(id: string) {
    // Returns a fetch response for file download
    return fetch(`${BASE_URL}/documents/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // ========================================================================
  // Drivers Endpoints (via Users API)
  // ========================================================================

  getDrivers() {
    return this.request<
      Array<{
        id: string;
        firstName: string;
        lastName: string;
        licenseNumber: string;
        status: string;
      }>
    >('/users', { method: 'GET' });
  }

  createDriver(data: {
    firstName: string;
    lastName: string;
    licenseNumber: string;
    phone?: string;
    email?: string;
  }) {
    return this.request<{
      id: string;
      firstName: string;
      lastName: string;
      licenseNumber: string;
      status: string;
    }>('/users', {
      method: 'POST',
      body: data,
    });
  }

  updateDriver(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      licenseNumber: string;
      phone: string;
      email: string;
    }>
  ) {
    return this.request<{
      id: string;
      firstName: string;
      lastName: string;
      licenseNumber: string;
      status: string;
    }>(`/users/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  deleteDriver(id: string) {
    return this.request<void>(`/users/${id}`, { method: 'DELETE' });
  }

  assignDriverToLoad(driverId: string, loadId: string) {
    return this.request<{ loadId: string; driverId: string }>(
      `/loads/${loadId}/assign-driver`,
      {
        method: 'POST',
        body: { driverId },
      }
    );
  }

  // ========================================================================
  // Payments Endpoints
  // ========================================================================

  getPaymentHistory(filters?: Record<string, unknown>) {
    const queryString = filters
      ? `?${new URLSearchParams(
          Object.entries(filters).map(([k, v]) => [k, String(v)])
        ).toString()}`
      : '';
    return this.request<
      Array<{
        id: string;
        date: string;
        amount: number;
        status: string;
        referenceNumber?: string;
      }>
    >(`/payment-history${queryString}`, { method: 'GET' });
  }

  getPaymentDetail(id: string) {
    return this.request<{
      id: string;
      date: string;
      amount: number;
      status: string;
      referenceNumber?: string;
      transactionDetails?: Record<string, string>;
    }>(`/invoices/${id}`, { method: 'GET' });
  }

  getSettlementHistory() {
    return this.request<
      Array<{
        id: string;
        date: string;
        totalAmount: number;
        status: string;
        invoiceCount: number;
      }>
    >('/settlements', { method: 'GET' });
  }

  // ========================================================================
  // Quick Pay Endpoints
  // ========================================================================

  requestQuickPay(settlementId: string, amount: number) {
    return this.request<{
      id: string;
      requestedAmount: number;
      status: string;
      requestedAt: string;
    }>(`/quick-pay/${settlementId}`, {
      method: 'POST',
      body: { amount },
    });
  }

  getQuickPayStatus(requestId: string) {
    return this.request<{
      id: string;
      requestedAmount: number;
      status: string;
      approvedAmount?: number;
      approvedAt?: string;
    }>(`/invoices/${requestId}`, { method: 'GET' });
  }

  // ========================================================================
  // Profile Endpoints
  // ========================================================================

  getProfile() {
    return this.request<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      language?: string;
    }>('/profile', { method: 'GET' });
  }

  updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    language?: string;
  }) {
    return this.request<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      language?: string;
    }>('/profile', {
      method: 'PUT',
      body: data,
    });
  }

  getComplianceDocs() {
    return this.request<
      Array<{
        id: string;
        documentType: string;
        status: string;
        expiryDate?: string;
        uploadedAt: string;
      }>
    >('/compliance/documents', { method: 'GET' });
  }

  uploadComplianceDoc(file: globalThis.File, type: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', type);

    return this.request<{
      id: string;
      documentType: string;
      status: string;
      uploadedAt: string;
    }>('/compliance/documents', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': undefined as unknown as string,
      },
    });
  }

  // ========================================================================
  // Dashboard Endpoints
  // ========================================================================

  getDashboardData() {
    return this.request<{
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
    }>('/dashboard', { method: 'GET' });
  }
}

export const carrierClient = new CarrierClient();

// ============================================================================
// Error Class
// ============================================================================

export class CarrierApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'CarrierApiError';
    this.status = status;
  }
}
