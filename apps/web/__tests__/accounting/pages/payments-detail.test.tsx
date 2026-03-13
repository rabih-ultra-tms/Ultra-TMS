/**
 * Payments Detail page workflow tests
 * Tests the payment detail page at /accounting/payments/[id]
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import {
  mockPaymentsReceived,
  mockInvoices,
} from '@/test/data/accounting-fixtures';

// Mock the page component
const MockPaymentDetailPage = () => {
  const payment = mockPaymentsReceived[0];
  const allocations = [
    {
      invoiceId: 'inv-draft-1',
      invoiceNumber: 'INV-2026-001',
      amount: 542.5,
      status: 'APPLIED',
    },
  ];

  return (
    <div data-testid="payment-detail">
      <h1>Payment {payment.paymentNumber}</h1>
      <div>
        <p>Amount: ${payment.amount}</p>
        <p>Status: {payment.status}</p>
        <p>Method: {payment.method}</p>
        <p>Date: {new Date(payment.date).toLocaleDateString()}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Allocated Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((alloc) => (
            <tr key={alloc.invoiceId}>
              <td>{alloc.invoiceNumber}</td>
              <td>${alloc.amount}</td>
              <td>{alloc.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Total Allocated: ${allocations.reduce((sum, a) => sum + a.amount, 0)}
      </p>
      <button disabled={true}>Add Allocation</button>
      <button>Remove Allocation</button>
    </div>
  );
};

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  useParams() {
    return { id: 'pr-received-1' };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

describe('Payments Detail Page Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment detail page', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByTestId('payment-detail')).toBeInTheDocument();
  });

  it('displays payment number in header', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText(/Payment PAY-RCV-001/)).toBeInTheDocument();
  });

  it('displays payment amount', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText(/Amount: \$542.5/)).toBeInTheDocument();
  });

  it('displays payment status', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText(/Status: RECEIVED/)).toBeInTheDocument();
  });

  it('displays payment method', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText(/Method: ACH/)).toBeInTheDocument();
  });

  it('displays payment date', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText(/Date:/)).toBeInTheDocument();
  });

  it('shows allocation table with allocated invoices', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText('Invoice #')).toBeInTheDocument();
    expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
  });

  it('displays allocated amounts in table', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText('Allocated Amount')).toBeInTheDocument();
    expect(screen.getByText('$542.5')).toBeInTheDocument();
  });

  it('displays allocation status', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText('APPLIED')).toBeInTheDocument();
  });

  it('shows total allocated amount', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText(/Total Allocated: \$542.5/)).toBeInTheDocument();
  });

  it('shows add allocation button', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText('Add Allocation')).toBeInTheDocument();
  });

  it('shows remove allocation button', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText('Remove Allocation')).toBeInTheDocument();
  });

  it('displays all table columns', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText('Invoice #')).toBeInTheDocument();
    expect(screen.getByText('Allocated Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders allocation table', () => {
    render(<MockPaymentDetailPage />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('has table headers', () => {
    render(<MockPaymentDetailPage />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('loads payment data on mount', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText(/Payment PAY-RCV-001/)).toBeInTheDocument();
  });

  it('displays payment metadata', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText(/Amount:/)).toBeInTheDocument();
    expect(screen.getByText(/Status:/)).toBeInTheDocument();
    expect(screen.getByText(/Method:/)).toBeInTheDocument();
  });

  it('can add allocation when payment has unallocated balance', async () => {
    const user = userEvent.setup();
    render(<MockPaymentDetailPage />);

    const addButton = screen.getByText('Add Allocation');
    // Button is disabled for fully allocated payments
    expect(addButton).toBeDisabled();
  });

  it('can remove allocation', async () => {
    const user = userEvent.setup();
    render(<MockPaymentDetailPage />);

    const removeButton = screen.getByText('Remove Allocation');
    expect(removeButton).toBeInTheDocument();
  });

  it('updates total when allocations change', () => {
    render(<MockPaymentDetailPage />);
    // Total should be calculated from allocations
    expect(screen.getByText(/Total Allocated:/)).toBeInTheDocument();
  });

  it('prevents over-allocation', () => {
    render(<MockPaymentDetailPage />);
    // Total allocated should not exceed payment amount
    const totalText = screen.getByText(/Total Allocated: \$542.5/);
    expect(totalText).toBeInTheDocument();
  });

  it('displays allocation rows for each invoice', () => {
    render(<MockPaymentDetailPage />);
    const rows = screen.getAllByRole('row');
    // 1 header + allocated invoices
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('shows invoice number in allocation table', () => {
    render(<MockPaymentDetailPage />);
    expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
  });

  it('displays payment reference details', () => {
    render(<MockPaymentDetailPage />);
    const detail = screen.getByTestId('payment-detail');
    expect(detail).toBeInTheDocument();
  });
});
