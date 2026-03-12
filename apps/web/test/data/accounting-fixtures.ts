/**
 * Test fixtures for accounting module
 * Provides mock data for invoices, settlements, payments, and chart of accounts
 */

import type {
  Invoice,
  InvoiceLineItem,
  Settlement,
  SettlementLineItem,
  ChartOfAccount,
} from '@/lib/hooks/accounting/use-invoices';

// ===========================
// Pagination
// ===========================

export const mockPagination = {
  page: 1,
  limit: 25,
  total: 4,
  totalPages: 1,
};

// ===========================
// Chart of Accounts
// ===========================

export const mockChartOfAccounts: ChartOfAccount[] = [
  {
    id: 'coa-1',
    tenantId: 't1',
    accountNumber: '1000',
    accountName: 'Cash',
    accountType: 'ASSET',
    accountSubType: 'Current Asset',
    description: 'Cash in bank',
    normalBalance: 'DEBIT',
    isActive: true,
    isSystemAccount: true,
    balance: 50000,
    quickbooksId: 'qb-1000',
    externalId: 'ext-1000',
    sourceSystem: 'quickbooks',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'coa-2',
    tenantId: 't1',
    accountNumber: '2000',
    accountName: 'Accounts Payable',
    accountType: 'LIABILITY',
    accountSubType: 'Current Liability',
    description: 'Money owed to suppliers',
    normalBalance: 'CREDIT',
    isActive: true,
    isSystemAccount: true,
    balance: 25000,
    quickbooksId: 'qb-2000',
    externalId: 'ext-2000',
    sourceSystem: 'quickbooks',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'coa-3',
    tenantId: 't1',
    accountNumber: '4000',
    accountName: 'Freight Revenue',
    accountType: 'REVENUE',
    accountSubType: 'Operating Revenue',
    description: 'Revenue from freight services',
    normalBalance: 'CREDIT',
    isActive: true,
    isSystemAccount: false,
    balance: 250000,
    quickbooksId: 'qb-4000',
    externalId: 'ext-4000',
    sourceSystem: 'quickbooks',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

// ===========================
// Invoices & Line Items
// ===========================

export const mockInvoiceLineItems: InvoiceLineItem[] = [
  {
    id: 'item-1',
    description: 'Freight Services - Dallas to Houston',
    quantity: 1,
    unitPrice: 500,
    amount: 500,
    loadId: 'load-1',
    loadNumber: 'LOAD-001',
  },
  {
    id: 'item-2',
    description: 'Accessorial - Fuel Surcharge',
    quantity: 1,
    unitPrice: 75,
    amount: 75,
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-draft-1',
    invoiceNumber: 'INV-2026-001',
    status: 'DRAFT',
    customerId: 'comp-1',
    customerName: 'Acme Corp',
    orderId: 'order-1',
    orderNumber: 'ORD-001',
    loadId: 'load-1',
    loadNumber: 'LOAD-001',
    invoiceDate: '2026-03-01T00:00:00Z',
    dueDate: '2026-03-31T00:00:00Z',
    paymentTerms: 'NET30',
    subtotal: 500,
    taxAmount: 42.5,
    totalAmount: 542.5,
    amountPaid: 0,
    balanceDue: 542.5,
    notes: 'Draft invoice pending review',
    lineItems: [mockInvoiceLineItems[0]],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'inv-sent-1',
    invoiceNumber: 'INV-2026-002',
    status: 'SENT',
    customerId: 'comp-1',
    customerName: 'Acme Corp',
    orderId: 'order-2',
    orderNumber: 'ORD-002',
    loadId: 'load-2',
    loadNumber: 'LOAD-002',
    invoiceDate: '2026-02-15T00:00:00Z',
    dueDate: '2026-03-15T00:00:00Z',
    paymentTerms: 'NET30',
    subtotal: 750,
    taxAmount: 63.75,
    totalAmount: 813.75,
    amountPaid: 0,
    balanceDue: 813.75,
    notes: 'Invoice sent to customer',
    lineItems: mockInvoiceLineItems,
    sentAt: '2026-02-16T14:30:00Z',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-16T14:30:00Z',
  },
  {
    id: 'inv-paid-1',
    invoiceNumber: 'INV-2026-003',
    status: 'PAID',
    customerId: 'comp-2',
    customerName: 'Beta Industries',
    orderId: 'order-3',
    orderNumber: 'ORD-003',
    loadId: 'load-3',
    loadNumber: 'LOAD-003',
    invoiceDate: '2026-01-15T00:00:00Z',
    dueDate: '2026-02-15T00:00:00Z',
    paymentTerms: 'NET30',
    subtotal: 1200,
    taxAmount: 102,
    totalAmount: 1302,
    amountPaid: 1302,
    balanceDue: 0,
    notes: 'Fully paid',
    lineItems: mockInvoiceLineItems,
    sentAt: '2026-01-16T09:00:00Z',
    paidAt: '2026-02-10T16:45:00Z',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-02-10T16:45:00Z',
  },
  {
    id: 'inv-voided-1',
    invoiceNumber: 'INV-2026-004',
    status: 'VOID',
    customerId: 'comp-1',
    customerName: 'Acme Corp',
    invoiceDate: '2026-02-01T00:00:00Z',
    dueDate: '2026-03-01T00:00:00Z',
    paymentTerms: 'NET30',
    subtotal: 300,
    taxAmount: 25.5,
    totalAmount: 325.5,
    amountPaid: 0,
    balanceDue: 0,
    notes: 'Voided due to duplicate entry',
    lineItems: [mockInvoiceLineItems[0]],
    voidedAt: '2026-02-05T11:20:00Z',
    voidReason: 'Duplicate entry - corrected with INV-2026-005',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-05T11:20:00Z',
  },
];

// ===========================
// Settlements & Line Items
// ===========================

export const mockSettlementLineItems: SettlementLineItem[] = [
  {
    id: 'settle-item-1',
    payableId: 'payable-1',
    loadNumber: 'LOAD-001',
    description: 'Freight charges',
    amount: 500,
  },
  {
    id: 'settle-item-2',
    payableId: 'payable-2',
    loadNumber: 'LOAD-002',
    description: 'Freight charges',
    amount: 650,
  },
];

export const mockSettlements: Settlement[] = [
  {
    id: 'settle-pending-1',
    settlementNumber: 'SET-2026-001',
    carrierId: 'c1',
    carrierName: 'Swift Trucking LLC',
    status: 'CREATED',
    lineItems: [mockSettlementLineItems[0]],
    grossAmount: 500,
    deductions: 0,
    netAmount: 500,
    notes: 'Settlement pending approval',
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-03-05T08:00:00Z',
  },
  {
    id: 'settle-approved-1',
    settlementNumber: 'SET-2026-002',
    carrierId: 'c1',
    carrierName: 'Swift Trucking LLC',
    status: 'APPROVED',
    lineItems: mockSettlementLineItems,
    grossAmount: 1150,
    deductions: 50,
    netAmount: 1100,
    approvedAt: '2026-03-03T14:30:00Z',
    approvedBy: 'user-1',
    notes: 'Approved for payment',
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-03T14:30:00Z',
  },
  {
    id: 'settle-processed-1',
    settlementNumber: 'SET-2026-003',
    carrierId: 'c2',
    carrierName: "Mike's Hauling",
    status: 'PROCESSED',
    lineItems: mockSettlementLineItems,
    grossAmount: 750,
    deductions: 25,
    netAmount: 725,
    approvedAt: '2026-02-20T09:00:00Z',
    approvedBy: 'user-1',
    processedAt: '2026-02-25T16:00:00Z',
    notes: 'Payment processed via ACH',
    createdAt: '2026-02-15T11:00:00Z',
    updatedAt: '2026-02-25T16:00:00Z',
  },
];

// ===========================
// Payments Received
// ===========================

interface PaymentReceived {
  id: string;
  paymentNumber: string;
  amount: number;
  date: string;
  method: 'CHECK' | 'ACH' | 'WIRE' | 'CREDIT_CARD';
  status: 'RECEIVED' | 'APPLIED' | 'BOUNCED';
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const mockPaymentsReceived: PaymentReceived[] = [
  {
    id: 'pr-received-1',
    paymentNumber: 'PAY-RCV-001',
    amount: 542.5,
    date: '2026-03-10T00:00:00Z',
    method: 'ACH',
    status: 'RECEIVED',
    referenceNumber: 'ACH-12345',
    notes: 'Payment from Acme Corp',
    createdAt: '2026-03-10T09:30:00Z',
    updatedAt: '2026-03-10T09:30:00Z',
  },
  {
    id: 'pr-applied-1',
    paymentNumber: 'PAY-RCV-002',
    amount: 813.75,
    date: '2026-03-08T00:00:00Z',
    method: 'CHECK',
    status: 'APPLIED',
    referenceNumber: 'CHK-98765',
    notes: 'Check from Beta Industries',
    createdAt: '2026-03-08T14:00:00Z',
    updatedAt: '2026-03-09T10:00:00Z',
  },
  {
    id: 'pr-bounced-1',
    paymentNumber: 'PAY-RCV-003',
    amount: 200,
    date: '2026-03-01T00:00:00Z',
    method: 'CHECK',
    status: 'BOUNCED',
    referenceNumber: 'CHK-45678',
    notes: 'Check returned - insufficient funds',
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-03-07T15:30:00Z',
  },
];

// ===========================
// Payments Made
// ===========================

interface PaymentMade {
  id: string;
  paymentNumber: string;
  carrierId: string;
  carrierName: string;
  amount: number;
  date: string;
  method: 'CHECK' | 'ACH' | 'WIRE' | 'CREDIT_CARD';
  status: 'PENDING' | 'SENT' | 'CLEARED';
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const mockPaymentsMade: PaymentMade[] = [
  {
    id: 'pm-pending-1',
    paymentNumber: 'PAY-MADE-001',
    carrierId: 'c1',
    carrierName: 'Swift Trucking LLC',
    amount: 1100,
    date: '2026-03-12T00:00:00Z',
    method: 'ACH',
    status: 'PENDING',
    referenceNumber: 'ACH-56789',
    notes: 'Settlement payment pending',
    createdAt: '2026-03-10T13:00:00Z',
    updatedAt: '2026-03-10T13:00:00Z',
  },
  {
    id: 'pm-sent-1',
    paymentNumber: 'PAY-MADE-002',
    carrierId: 'c1',
    carrierName: 'Swift Trucking LLC',
    amount: 500,
    date: '2026-03-05T00:00:00Z',
    method: 'ACH',
    status: 'SENT',
    referenceNumber: 'ACH-11111',
    notes: 'Payment sent via ACH',
    createdAt: '2026-03-03T09:00:00Z',
    updatedAt: '2026-03-05T16:00:00Z',
  },
  {
    id: 'pm-cleared-1',
    paymentNumber: 'PAY-MADE-003',
    carrierId: 'c2',
    carrierName: "Mike's Hauling",
    amount: 725,
    date: '2026-02-20T00:00:00Z',
    method: 'CHECK',
    status: 'CLEARED',
    referenceNumber: 'CHK-77777',
    notes: 'Check cleared by bank',
    createdAt: '2026-02-18T10:30:00Z',
    updatedAt: '2026-02-25T11:00:00Z',
  },
];

// ===========================
// Dashboard Data
// ===========================

export const mockAccountingDashboard = {
  totalAR: 1356.75,
  totalAP: 25000,
  overdueInvoiceCount: 0,
  overdueAmount: 0,
  DSO: 28,
  revenueMTD: 542.5,
  cashCollectedMTD: 1302,
};
