/**
 * Carrier Portal Type Definitions
 *
 * These types align with the actual carrier-client API responses
 * and form submission payloads.
 */

// ============================================================================
// Profile Types
// ============================================================================

/**
 * Carrier profile data returned from GET /profile
 */
export interface CarrierProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  language?: string;
}

/**
 * Request DTO for updating carrier profile
 */
export interface CarrierProfileUpdateDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  language?: string;
}

// ============================================================================
// Load Types
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

// ============================================================================
// Driver Types
// ============================================================================

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  status: string;
}

export interface CreateDriverDTO {
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phone?: string;
  email?: string;
}

export interface UpdateDriverDTO {
  firstName?: string;
  lastName?: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
}

// ============================================================================
// Payment Types
// ============================================================================

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

// ============================================================================
// Document Types
// ============================================================================

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

// ============================================================================
// Settlement Types
// ============================================================================

export interface Settlement {
  id: string;
  date: string;
  totalAmount: number;
  status: string;
  invoiceCount: number;
}

// ============================================================================
// Quick Pay Types
// ============================================================================

export interface QuickPayStatus {
  id: string;
  requestedAmount: number;
  status: string;
  approvedAmount?: number;
  approvedAt?: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

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
