/**
 * MSW handlers for accounting API endpoints
 * Provides mock implementations for invoices, settlements, payments, and chart of accounts
 */

import { http, HttpResponse } from 'msw';
import {
  mockInvoices,
  mockSettlements,
  mockPaymentsReceived,
  mockPaymentsMade,
  mockChartOfAccounts,
  mockAccountingDashboard,
} from '@/test/data/accounting-fixtures';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

// ===========================
// Invoice Handlers
// ===========================

export const accountingHandlers = [
  // GET /invoices - List invoices with filters
  http.get(apiUrl('/invoices'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = parseInt(url.searchParams.get('limit') ?? '25');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search')?.toLowerCase();

    let filtered = [...mockInvoices];

    if (status && status !== 'all') {
      filtered = filtered.filter((inv) => inv.status === status);
    }

    if (search) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(search) ||
          inv.customerName.toLowerCase().includes(search)
      );
    }

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    return HttpResponse.json({
      data: paginated,
      pagination: { page, limit, total, totalPages },
    });
  }),

  // POST /invoices - Create invoice
  http.post(apiUrl('/invoices'), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${Date.now()}`,
      status: 'DRAFT' as const,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newInvoice, { status: 201 });
  }),

  // GET /invoices/:id - Get single invoice
  http.get(apiUrl('/invoices/:id'), ({ params }) => {
    const invoice = mockInvoices.find((inv) => inv.id === params.id);
    if (!invoice) {
      return HttpResponse.json(
        { error: 'Invoice not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return HttpResponse.json(invoice);
  }),

  // PUT /invoices/:id - Update invoice
  http.put(apiUrl('/invoices/:id'), async ({ params, request }) => {
    const invoice = mockInvoices.find((inv) => inv.id === params.id);
    if (!invoice) {
      return HttpResponse.json(
        { error: 'Invoice not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    const body = (await request.json()) as Record<string, unknown>;
    const updated = {
      ...invoice,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updated);
  }),

  // POST /invoices/:id/send - Send invoice
  http.post(apiUrl('/invoices/:id/send'), ({ params }) => {
    const invoice = mockInvoices.find((inv) => inv.id === params.id);
    if (!invoice) {
      return HttpResponse.json(
        { error: 'Invoice not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    const updated = {
      ...invoice,
      status: 'SENT' as const,
      sentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updated);
  }),

  // POST /invoices/:id/void - Void invoice
  http.post(apiUrl('/invoices/:id/void'), async ({ params, request }) => {
    const invoice = mockInvoices.find((inv) => inv.id === params.id);
    if (!invoice) {
      return HttpResponse.json(
        { error: 'Invoice not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    const body = (await request.json()) as Record<string, string | undefined>;
    const updated = {
      ...invoice,
      status: 'VOID' as const,
      voidedAt: new Date().toISOString(),
      voidReason: body.reason,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updated);
  }),

  // DELETE /invoices/:id - Delete invoice
  http.delete(apiUrl('/invoices/:id'), ({ params }) => {
    const invoice = mockInvoices.find((inv) => inv.id === params.id);
    if (!invoice) {
      return HttpResponse.json(
        { error: 'Invoice not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // ===========================
  // Settlement Handlers
  // ===========================

  // GET /settlements - List settlements with filters
  http.get(apiUrl('/settlements'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = parseInt(url.searchParams.get('limit') ?? '25');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search')?.toLowerCase();

    let filtered = [...mockSettlements];

    if (status && status !== 'all') {
      filtered = filtered.filter((settle) => settle.status === status);
    }

    if (search) {
      filtered = filtered.filter(
        (settle) =>
          settle.settlementNumber.toLowerCase().includes(search) ||
          settle.carrierName.toLowerCase().includes(search)
      );
    }

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    return HttpResponse.json({
      data: paginated,
      pagination: { page, limit, total, totalPages },
    });
  }),

  // GET /settlements/:id - Get single settlement
  http.get(apiUrl('/settlements/:id'), ({ params }) => {
    const settlement = mockSettlements.find((s) => s.id === params.id);
    if (!settlement) {
      return HttpResponse.json(
        { error: 'Settlement not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return HttpResponse.json(settlement);
  }),

  // POST /settlements/:id/approve - Approve settlement
  http.post(apiUrl('/settlements/:id/approve'), ({ params }) => {
    const settlement = mockSettlements.find((s) => s.id === params.id);
    if (!settlement) {
      return HttpResponse.json(
        { error: 'Settlement not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    const updated = {
      ...settlement,
      status: 'APPROVED' as const,
      approvedAt: new Date().toISOString(),
      approvedBy: 'user-1',
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updated);
  }),

  // POST /settlements/:id/process - Process settlement
  http.post(apiUrl('/settlements/:id/process'), ({ params }) => {
    const settlement = mockSettlements.find((s) => s.id === params.id);
    if (!settlement) {
      return HttpResponse.json(
        { error: 'Settlement not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    const updated = {
      ...settlement,
      status: 'PROCESSED' as const,
      processedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updated);
  }),

  // ===========================
  // Payments Received Handlers
  // ===========================

  // GET /payments-received - List payments received
  http.get(apiUrl('/payments-received'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = parseInt(url.searchParams.get('limit') ?? '25');
    const status = url.searchParams.get('status');

    let filtered = [...mockPaymentsReceived];

    if (status && status !== 'all') {
      filtered = filtered.filter((payment) => payment.status === status);
    }

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    return HttpResponse.json({
      data: paginated,
      pagination: { page, limit, total, totalPages },
    });
  }),

  // POST /payments-received - Record payment received
  http.post(apiUrl('/payments-received'), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newPayment = {
      id: `pr-${Date.now()}`,
      paymentNumber: `PAY-RCV-${Date.now()}`,
      status: 'RECEIVED' as const,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newPayment, { status: 201 });
  }),

  // ===========================
  // Payments Made Handlers
  // ===========================

  // GET /payments-made - List payments made
  http.get(apiUrl('/payments-made'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = parseInt(url.searchParams.get('limit') ?? '25');
    const status = url.searchParams.get('status');

    let filtered = [...mockPaymentsMade];

    if (status && status !== 'all') {
      filtered = filtered.filter((payment) => payment.status === status);
    }

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    return HttpResponse.json({
      data: paginated,
      pagination: { page, limit, total, totalPages },
    });
  }),

  // POST /payments-made - Create payment made
  http.post(apiUrl('/payments-made'), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newPayment = {
      id: `pm-${Date.now()}`,
      paymentNumber: `PAY-MADE-${Date.now()}`,
      status: 'PENDING' as const,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newPayment, { status: 201 });
  }),

  // ===========================
  // Chart of Accounts Handlers
  // ===========================

  // GET /chart-of-accounts - List chart of accounts
  http.get(apiUrl('/chart-of-accounts'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = parseInt(url.searchParams.get('limit') ?? '25');
    const accountType = url.searchParams.get('accountType');

    let filtered = [...mockChartOfAccounts];

    if (accountType) {
      filtered = filtered.filter((coa) => coa.accountType === accountType);
    }

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    return HttpResponse.json({
      data: paginated,
      pagination: { page, limit, total, totalPages },
    });
  }),

  // ===========================
  // Dashboard & Reports Handlers
  // ===========================

  // GET /dashboard - Accounting dashboard metrics
  http.get(apiUrl('/dashboard'), () => {
    return HttpResponse.json({ data: mockAccountingDashboard });
  }),

  // GET /aging - Aging report
  http.get(apiUrl('/aging'), ({ request }) => {
    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');

    // Return all overdue invoices for aging report
    const agingData = mockInvoices
      .filter(
        (inv) =>
          (inv.status === 'SENT' || inv.status === 'PARTIAL') &&
          (!customerId || inv.customerId === customerId)
      )
      .map((inv) => ({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        amount: inv.balanceDue,
        daysOverdue: 0,
        dueDate: inv.dueDate,
        bucket: 'CURRENT' as const,
      }));

    return HttpResponse.json({
      data: agingData,
      pagination: {
        page: 1,
        limit: 25,
        total: agingData.length,
        totalPages: 1,
      },
    });
  }),
];
