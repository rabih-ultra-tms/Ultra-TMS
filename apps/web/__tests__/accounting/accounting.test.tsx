import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
const renderWithProviders = (ui: React.ReactElement) =>
  render(ui, { wrapper: Wrapper });

import { AccDashboardStats } from '@/components/accounting/acc-dashboard-stats';
import { AccRecentInvoices } from '@/components/accounting/acc-recent-invoices';
import { InvoiceStatusBadge } from '@/components/accounting/invoice-status-badge';
import { SettlementStatusBadge } from '@/components/accounting/settlement-status-badge';
import { PayableStatusBadge } from '@/components/accounting/payable-status-badge';
import { PaymentAllocation } from '@/components/accounting/payment-allocation';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockDashboardData = {
  totalAR: 125000,
  totalAP: 87000,
  overdueInvoiceCount: 4,
  dso: 32,
  revenueMTD: 250000,
  cashCollectedMTD: 180000,
  totalARChange: 5.2,
  totalAPChange: -3.1,
  overdueChange: 12.5,
  dsoChange: -2.0,
  revenueMTDChange: 8.3,
};

const mockRecentInvoices = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-001',
    customerName: 'Acme Corp',
    amount: 5200,
    dueDate: '2026-03-15',
    status: 'SENT' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-002',
    customerName: 'Beta Inc',
    amount: 3800,
    dueDate: '2026-02-28',
    status: 'OVERDUE' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-003',
    customerName: 'Gamma LLC',
    amount: 7500,
    dueDate: '2026-04-01',
    status: 'PAID' as const,
    createdAt: new Date().toISOString(),
  },
];

const mockInvoicesForAllocation = [
  {
    id: 'inv-a',
    invoiceNumber: 'INV-100',
    status: 'SENT' as const,
    customerId: 'c1',
    customerName: 'Acme',
    invoiceDate: '2026-02-01',
    dueDate: '2026-03-01',
    paymentTerms: 'NET30',
    subtotal: 5000,
    taxAmount: 0,
    totalAmount: 5000,
    amountPaid: 0,
    balanceDue: 5000,
    lineItems: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-b',
    invoiceNumber: 'INV-101',
    status: 'PARTIAL' as const,
    customerId: 'c1',
    customerName: 'Acme',
    invoiceDate: '2026-01-15',
    dueDate: '2026-02-15',
    paymentTerms: 'NET30',
    subtotal: 3000,
    taxAmount: 0,
    totalAmount: 3000,
    amountPaid: 1000,
    balanceDue: 2000,
    lineItems: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ===================== ACC-001: Dashboard Stats =====================

describe('ACC-001: AccDashboardStats', () => {
  it('renders 5 KPI cards with correct values', () => {
    renderWithProviders(
      <AccDashboardStats data={mockDashboardData} isLoading={false} />
    );
    expect(screen.getByText('Accounts Receivable')).toBeInTheDocument();
    expect(screen.getByText('$125,000')).toBeInTheDocument();
    expect(screen.getByText('Accounts Payable')).toBeInTheDocument();
    expect(screen.getByText('$87,000')).toBeInTheDocument();
    expect(screen.getByText('Overdue Invoices')).toBeInTheDocument();
    expect(screen.getByText('DSO')).toBeInTheDocument();
    expect(screen.getByText('32 days')).toBeInTheDocument();
    expect(screen.getByText('Revenue MTD')).toBeInTheDocument();
    expect(screen.getByText('$250,000')).toBeInTheDocument();
  });

  it('shows loading skeletons', () => {
    const { container } = renderWithProviders(
      <AccDashboardStats data={undefined} isLoading={true} />
    );
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows zero/fallback when data undefined', () => {
    renderWithProviders(
      <AccDashboardStats data={undefined} isLoading={false} />
    );
    const zeros = screen.getAllByText('$0');
    expect(zeros.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('0 days')).toBeInTheDocument();
  });

  it('shows trend indicators', () => {
    renderWithProviders(
      <AccDashboardStats data={mockDashboardData} isLoading={false} />
    );
    expect(screen.getByText('+5.2%')).toBeInTheDocument();
    expect(screen.getByText('-3.1%')).toBeInTheDocument();
  });
});

// ===================== ACC-001: Recent Invoices =====================

describe('ACC-001: AccRecentInvoices', () => {
  it('renders invoice list with numbers and amounts', () => {
    renderWithProviders(
      <AccRecentInvoices invoices={mockRecentInvoices} isLoading={false} />
    );
    expect(screen.getByText('Recent Invoices')).toBeInTheDocument();
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('$5,200.00')).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
  });

  it('renders links to invoice detail', () => {
    renderWithProviders(
      <AccRecentInvoices invoices={mockRecentInvoices} isLoading={false} />
    );
    const links = screen.getAllByRole('link');
    const detailLinks = links.filter((l) =>
      l.getAttribute('href')?.startsWith('/accounting/invoices/')
    );
    expect(detailLinks.length).toBe(3);
  });

  it('shows View all link', () => {
    renderWithProviders(
      <AccRecentInvoices invoices={mockRecentInvoices} isLoading={false} />
    );
    expect(screen.getByText('View all')).toHaveAttribute(
      'href',
      '/accounting/invoices'
    );
  });

  it('shows empty state', () => {
    renderWithProviders(<AccRecentInvoices invoices={[]} isLoading={false} />);
    expect(screen.getByText('No invoices yet')).toBeInTheDocument();
  });

  it('shows status badges', () => {
    renderWithProviders(
      <AccRecentInvoices invoices={mockRecentInvoices} isLoading={false} />
    );
    expect(screen.getByText('SENT')).toBeInTheDocument();
    expect(screen.getByText('OVERDUE')).toBeInTheDocument();
    expect(screen.getByText('PAID')).toBeInTheDocument();
  });

  it('shows loading skeletons', () => {
    const { container } = renderWithProviders(
      <AccRecentInvoices invoices={undefined} isLoading={true} />
    );
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

// ===================== ACC-002: Invoice Status Badge =====================

describe('ACC-002: InvoiceStatusBadge', () => {
  it('renders DRAFT status', () => {
    renderWithProviders(<InvoiceStatusBadge status="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders PAID status', () => {
    renderWithProviders(<InvoiceStatusBadge status="PAID" />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('renders OVERDUE status', () => {
    renderWithProviders(<InvoiceStatusBadge status="OVERDUE" />);
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('renders VOID status', () => {
    renderWithProviders(<InvoiceStatusBadge status="VOID" />);
    expect(screen.getByText('Void')).toBeInTheDocument();
  });
});

// ===================== ACC-004: Payable Status Badge =====================

describe('ACC-004: PayableStatusBadge', () => {
  it('renders PENDING status', () => {
    renderWithProviders(<PayableStatusBadge status="PENDING" />);
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  it('renders ELIGIBLE status', () => {
    renderWithProviders(<PayableStatusBadge status="ELIGIBLE" />);
    expect(screen.getByText(/eligible/i)).toBeInTheDocument();
  });

  it('renders PAID status', () => {
    renderWithProviders(<PayableStatusBadge status="PAID" />);
    expect(screen.getByText(/paid/i)).toBeInTheDocument();
  });
});

// ===================== ACC-005: Settlement Status Badge =====================

describe('ACC-005: SettlementStatusBadge', () => {
  it('renders CREATED status', () => {
    renderWithProviders(<SettlementStatusBadge status="CREATED" />);
    expect(screen.getByText(/created/i)).toBeInTheDocument();
  });

  it('renders APPROVED status', () => {
    renderWithProviders(<SettlementStatusBadge status="APPROVED" />);
    expect(screen.getByText(/approved/i)).toBeInTheDocument();
  });

  it('renders PROCESSED status', () => {
    renderWithProviders(<SettlementStatusBadge status="PROCESSED" />);
    expect(screen.getByText(/processed/i)).toBeInTheDocument();
  });

  it('renders PAID status', () => {
    renderWithProviders(<SettlementStatusBadge status="PAID" />);
    expect(screen.getByText(/paid/i)).toBeInTheDocument();
  });
});

// ===================== ACC-003: Payment Allocation =====================

describe('ACC-003: PaymentAllocation', () => {
  it('renders allocation grid with invoices', () => {
    renderWithProviders(
      <PaymentAllocation
        invoices={mockInvoicesForAllocation}
        totalPayment={5000}
        allocations={[]}
        onAllocationsChange={jest.fn()}
      />
    );
    expect(screen.getByText('INV-100')).toBeInTheDocument();
    expect(screen.getByText('INV-101')).toBeInTheDocument();
  });

  it('shows remaining payment amount', () => {
    renderWithProviders(
      <PaymentAllocation
        invoices={mockInvoicesForAllocation}
        totalPayment={5000}
        allocations={[{ invoiceId: 'inv-a', amount: 2000 }]}
        onAllocationsChange={jest.fn()}
      />
    );
    const remaining = screen.getAllByText('$3,000.00');
    expect(remaining.length).toBeGreaterThanOrEqual(1);
  });
});
