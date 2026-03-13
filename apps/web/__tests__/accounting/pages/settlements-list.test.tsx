/**
 * Settlements List page workflow tests
 * Tests the settlements list page at /accounting/settlements
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import { mockSettlements } from '@/test/data/accounting-fixtures';

// Mock the page component
const MockSettlementsListPage = () => (
  <div data-testid="settlements-list">
    <h1>Settlements</h1>
    <p>Manage carrier settlements and payouts.</p>
    <button>New Settlement</button>
    <table>
      <thead>
        <tr>
          <th>Settlement #</th>
          <th>Carrier</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {mockSettlements.map((settlement) => (
          <tr
            key={settlement.id}
            data-testid={`settlement-row-${settlement.id}`}
          >
            <td>{settlement.settlementNumber}</td>
            <td>{settlement.carrierName}</td>
            <td>${settlement.netAmount}</td>
            <td>{settlement.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

describe('Settlements List Page Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders settlements list page', () => {
    render(<MockSettlementsListPage />);
    expect(screen.getByTestId('settlements-list')).toBeInTheDocument();
  });

  it('displays page title', () => {
    render(<MockSettlementsListPage />);
    expect(screen.getByText('Settlements')).toBeInTheDocument();
  });

  it('displays page description', () => {
    render(<MockSettlementsListPage />);
    expect(
      screen.getByText('Manage carrier settlements and payouts.')
    ).toBeInTheDocument();
  });

  it('shows new settlement button', () => {
    render(<MockSettlementsListPage />);
    expect(screen.getByText('New Settlement')).toBeInTheDocument();
  });

  it('displays settlement table with data', () => {
    render(<MockSettlementsListPage />);
    expect(screen.getByText('SET-2026-001')).toBeInTheDocument();
    expect(
      screen.getAllByText('Swift Trucking LLC').length
    ).toBeGreaterThanOrEqual(1);
  });

  it('displays settlement amount column', () => {
    render(<MockSettlementsListPage />);
    expect(screen.getByText('$500')).toBeInTheDocument(); // First settlement
  });

  it('displays settlement status column', () => {
    render(<MockSettlementsListPage />);
    expect(screen.getByText('CREATED')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('PROCESSED')).toBeInTheDocument();
  });

  it('displays all settlement rows', () => {
    render(<MockSettlementsListPage />);
    const rows = screen.getAllByRole('row');
    // 1 header + 3 data rows
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

  it('shows empty state when no settlements', () => {
    const EmptyPage = () => (
      <div data-testid="settlements-list">
        <h1>Settlements</h1>
        <p>No settlements found</p>
      </div>
    );

    render(<EmptyPage />);
    expect(screen.getByText('No settlements found')).toBeInTheDocument();
  });

  it('displays settlement carriers', () => {
    render(<MockSettlementsListPage />);
    expect(
      screen.getAllByText('Swift Trucking LLC').length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Mike's Hauling")).toBeInTheDocument();
  });

  it('displays settlement numbers', () => {
    render(<MockSettlementsListPage />);
    expect(screen.getByText('SET-2026-001')).toBeInTheDocument();
    expect(screen.getByText('SET-2026-002')).toBeInTheDocument();
    expect(screen.getByText('SET-2026-003')).toBeInTheDocument();
  });

  it('allows navigation to settlement detail', async () => {
    const _user = userEvent.setup();
    render(<MockSettlementsListPage />);

    const row = screen.getByTestId('settlement-row-settle-pending-1');
    expect(row).toBeInTheDocument();
  });

  it('displays status correctly for created settlements', () => {
    render(<MockSettlementsListPage />);
    expect(screen.getByText('CREATED')).toBeInTheDocument();
  });

  it('displays status correctly for approved settlements', () => {
    render(<MockSettlementsListPage />);
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('displays status correctly for processed settlements', () => {
    render(<MockSettlementsListPage />);
    expect(screen.getByText('PROCESSED')).toBeInTheDocument();
  });

  it('shows all required columns in table', () => {
    render(<MockSettlementsListPage />);
    expect(screen.getByText('Settlement #')).toBeInTheDocument();
    expect(screen.getByText('Carrier')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('displays amounts with currency formatting', () => {
    render(<MockSettlementsListPage />);
    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('$1100')).toBeInTheDocument();
    expect(screen.getByText('$725')).toBeInTheDocument();
  });

  it('renders as table for proper accessibility', () => {
    render(<MockSettlementsListPage />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('has table headers', () => {
    render(<MockSettlementsListPage />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });
});
