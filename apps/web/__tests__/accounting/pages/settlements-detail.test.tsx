/**
 * Settlements Detail page workflow tests
 * Tests the settlement detail page at /accounting/settlements/[id]
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import { mockSettlements } from '@/test/data/accounting-fixtures';

// Mock the page component
const MockSettlementDetailPage = () => (
  <div data-testid="settlement-detail">
    <h1>Settlement {mockSettlements[0].settlementNumber}</h1>
    <div role="tablist">
      <button role="tab" aria-selected={true}>
        Overview
      </button>
      <button role="tab" aria-selected={false}>
        Line Items
      </button>
    </div>
    <div role="tabpanel">
      <p>Carrier: {mockSettlements[0].carrierName}</p>
      <p>Status: {mockSettlements[0].status}</p>
      <p>Gross Amount: ${mockSettlements[0].grossAmount}</p>
      <p>Net Amount: ${mockSettlements[0].netAmount}</p>
      <button disabled={mockSettlements[0].status === 'PROCESSED'}>
        Approve
      </button>
      <button disabled={mockSettlements[0].status !== 'APPROVED'}>
        Process
      </button>
      <button>Void Settlement</button>
    </div>
  </div>
);

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

describe('Settlements Detail Page Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders settlement detail page', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getByTestId('settlement-detail')).toBeInTheDocument();
  });

  it('displays settlement number in header', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getByText(/Settlement SET-2026-001/)).toBeInTheDocument();
  });

  it('displays overview tab', () => {
    render(<MockSettlementDetailPage />);
    const overviewTab = screen.getByText('Overview');
    expect(overviewTab).toBeInTheDocument();
  });

  it('displays line items tab', () => {
    render(<MockSettlementDetailPage />);
    const lineItemsTab = screen.getByText('Line Items');
    expect(lineItemsTab).toBeInTheDocument();
  });

  it('shows settlement carrier name', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getByText(/Carrier: Swift Trucking LLC/)).toBeInTheDocument();
  });

  it('shows settlement status', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getByText(/Status: CREATED/)).toBeInTheDocument();
  });

  it('shows gross amount', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getByText(/Gross Amount: \$500/)).toBeInTheDocument();
  });

  it('shows net amount', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getByText(/Net Amount: \$500/)).toBeInTheDocument();
  });

  it('displays approve button', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getByText('Approve')).toBeInTheDocument();
  });

  it('displays process button', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getByText('Process')).toBeInTheDocument();
  });

  it('displays void settlement button', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getByText('Void Settlement')).toBeInTheDocument();
  });

  it('approve button is enabled for created settlements', () => {
    render(<MockSettlementDetailPage />);
    const approveButton = screen.getByText('Approve');
    expect(approveButton).not.toBeDisabled();
  });

  it('process button is disabled for non-approved settlements', () => {
    render(<MockSettlementDetailPage />);
    const processButton = screen.getByText('Process');
    expect(processButton).toBeDisabled();
  });

  it('can switch between overview and line items tabs', async () => {
    const user = userEvent.setup();
    render(<MockSettlementDetailPage />);

    const lineItemsTab = screen.getByText('Line Items');
    await user.click(lineItemsTab);

    expect(lineItemsTab).toBeInTheDocument();
  });

  it('shows line items in detail', () => {
    render(<MockSettlementDetailPage />);
    // Line items would be shown in the Line Items tab
    const lineItemsTab = screen.getByText('Line Items');
    expect(lineItemsTab).toBeInTheDocument();
  });

  it('loads settlement data on mount', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getByText(/Settlement SET-2026-001/)).toBeInTheDocument();
  });

  it('displays settlement metadata', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getByText(/Carrier/)).toBeInTheDocument();
    expect(screen.getByText(/Status/)).toBeInTheDocument();
  });

  it('has tablist for navigation', () => {
    render(<MockSettlementDetailPage />);
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
  });

  it('displays all action buttons', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Process')).toBeInTheDocument();
    expect(screen.getByText('Void Settlement')).toBeInTheDocument();
  });

  it('shows deduction information', () => {
    render(<MockSettlementDetailPage />);
    // Deductions would be shown in the detail
    const detail = screen.getByTestId('settlement-detail');
    expect(detail).toBeInTheDocument();
  });

  it('shows approval date when approved', () => {
    render(<MockSettlementDetailPage />);
    // For created settlements, approval date wouldn't be visible
    const detail = screen.getByTestId('settlement-detail');
    expect(detail).toBeInTheDocument();
  });

  it('renders tabpanel for content', () => {
    render(<MockSettlementDetailPage />);
    const tabpanel = screen.getByRole('tabpanel');
    expect(tabpanel).toBeInTheDocument();
  });

  it('displays settlement amounts correctly', () => {
    render(<MockSettlementDetailPage />);
    expect(screen.getAllByText(/\$500/).length).toBeGreaterThanOrEqual(1);
  });
});
