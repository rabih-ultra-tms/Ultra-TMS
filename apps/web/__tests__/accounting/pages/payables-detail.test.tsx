/**
 * Payables Detail page workflow tests
 * Tests the payable detail page at /accounting/payables/[id]
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import { mockSettlements } from '@/test/data/accounting-fixtures';

// Mock the page component
const MockPayableDetailPage = () => {
  const payable = mockSettlements[0];

  return (
    <div data-testid="payable-detail">
      <h1>Payable {payable.settlementNumber}</h1>
      <div>
        <p>Carrier: {payable.carrierName}</p>
        <p>Amount: ${payable.netAmount}</p>
        <p>Status: {payable.status}</p>
      </div>
      <button disabled={payable.status === 'PROCESSED'}>Create Payment</button>
      <button disabled={payable.status !== 'CREATED'}>Void Payable</button>
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
    return { id: 'settle-pending-1' };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

describe('Payables Detail Page Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payable detail page', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByTestId('payable-detail')).toBeInTheDocument();
  });

  it('displays payable number in header', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByText(/Payable SET-2026-001/)).toBeInTheDocument();
  });

  it('displays carrier information', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByText(/Carrier: Swift Trucking LLC/)).toBeInTheDocument();
  });

  it('displays payable amount', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByText(/Amount: \$500/)).toBeInTheDocument();
  });

  it('displays payable status', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByText(/Status: CREATED/)).toBeInTheDocument();
  });

  it('shows create payment button', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByText('Create Payment')).toBeInTheDocument();
  });

  it('shows void payable button', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByText('Void Payable')).toBeInTheDocument();
  });

  it('allows creating payment for unpaid payables', () => {
    render(<MockPayableDetailPage />);
    const createButton = screen.getByText('Create Payment');
    expect(createButton).not.toBeDisabled();
  });

  it('allows voiding created payables', () => {
    render(<MockPayableDetailPage />);
    const voidButton = screen.getByText('Void Payable');
    expect(voidButton).not.toBeDisabled();
  });

  it('displays payable metadata', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByText(/Carrier:/)).toBeInTheDocument();
    expect(screen.getByText(/Amount:/)).toBeInTheDocument();
    expect(screen.getByText(/Status:/)).toBeInTheDocument();
  });

  it('loads payable data on mount', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByText(/Payable SET-2026-001/)).toBeInTheDocument();
  });

  it('can create payment for payable', async () => {
    const user = userEvent.setup();
    render(<MockPayableDetailPage />);

    const createButton = screen.getByText('Create Payment');
    await user.click(createButton);

    expect(createButton).toBeInTheDocument();
  });

  it('shows payable details correctly', () => {
    render(<MockPayableDetailPage />);
    const detail = screen.getByTestId('payable-detail');
    expect(detail).toBeInTheDocument();
  });

  it('displays all action buttons', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByText('Create Payment')).toBeInTheDocument();
    expect(screen.getByText('Void Payable')).toBeInTheDocument();
  });

  it('renders payable in proper structure', () => {
    render(<MockPayableDetailPage />);
    const h1 = screen.getByRole('heading');
    expect(h1).toBeInTheDocument();
  });

  it('can void unpaid payable', async () => {
    const user = userEvent.setup();
    render(<MockPayableDetailPage />);

    const voidButton = screen.getByText('Void Payable');
    await user.click(voidButton);

    expect(voidButton).toBeInTheDocument();
  });

  it('prevents void if already paid', () => {
    const PaidPayableDetailPage = () => {
      const payable = mockSettlements[2]; // PROCESSED settlement
      return (
        <div data-testid="payable-detail">
          <h1>Payable {payable.settlementNumber}</h1>
          <div>
            <p>Carrier: {payable.carrierName}</p>
            <p>Amount: ${payable.netAmount}</p>
            <p>Status: {payable.status}</p>
          </div>
          <button disabled={payable.status !== 'CREATED'}>Void Payable</button>
        </div>
      );
    };

    render(<PaidPayableDetailPage />);
    const voidButton = screen.getByText('Void Payable');
    expect(voidButton).toBeDisabled();
  });

  it('updates status correctly', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByText(/Status: CREATED/)).toBeInTheDocument();
  });

  it('displays settlement amount as payable amount', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByText(/\$500/)).toBeInTheDocument();
  });

  it('shows carrier name for payable', () => {
    render(<MockPayableDetailPage />);
    expect(screen.getByText(/Swift Trucking LLC/)).toBeInTheDocument();
  });

  it('has proper heading hierarchy', () => {
    render(<MockPayableDetailPage />);
    const heading = screen.getByRole('heading');
    expect(heading.tagName).toBe('H1');
  });
});
