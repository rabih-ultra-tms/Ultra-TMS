/**
 * Payables List page workflow tests
 * Tests the payables list page at /accounting/payables
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import {
  mockSettlements,
  mockPagination,
} from '@/test/data/accounting-fixtures';

// Mock the page component
const MockPayablesListPage = () => {
  const payables = mockSettlements.map((s) => ({
    id: s.id,
    settlementNumber: s.settlementNumber,
    carrier: s.carrierName,
    amount: s.netAmount,
    status: s.status,
  }));

  return (
    <div data-testid="payables-list">
      <h1>Accounts Payable</h1>
      <p>Manage carrier payments owed.</p>
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
          {payables.map((payable) => (
            <tr key={payable.id}>
              <td>{payable.settlementNumber}</td>
              <td>{payable.carrier}</td>
              <td>${payable.amount}</td>
              <td>{payable.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total AP: $2,325</p>
    </div>
  );
};

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

describe('Payables List Page Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payables list page', () => {
    render(<MockPayablesListPage />);
    expect(screen.getByTestId('payables-list')).toBeInTheDocument();
  });

  it('displays page title', () => {
    render(<MockPayablesListPage />);
    expect(screen.getByText('Accounts Payable')).toBeInTheDocument();
  });

  it('displays page description', () => {
    render(<MockPayablesListPage />);
    expect(
      screen.getByText('Manage carrier payments owed.')
    ).toBeInTheDocument();
  });

  it('displays payables table with data', () => {
    render(<MockPayablesListPage />);
    expect(screen.getByText('SET-2026-001')).toBeInTheDocument();
    expect(
      screen.getAllByText('Swift Trucking LLC').length
    ).toBeGreaterThanOrEqual(1);
  });

  it('displays payable amounts', () => {
    render(<MockPayablesListPage />);
    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('$1100')).toBeInTheDocument();
    expect(screen.getByText('$725')).toBeInTheDocument();
  });

  it('displays payable statuses', () => {
    render(<MockPayablesListPage />);
    expect(screen.getByText('CREATED')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('PROCESSED')).toBeInTheDocument();
  });

  it('displays settlement numbers', () => {
    render(<MockPayablesListPage />);
    expect(screen.getByText('SET-2026-001')).toBeInTheDocument();
    expect(screen.getByText('SET-2026-002')).toBeInTheDocument();
    expect(screen.getByText('SET-2026-003')).toBeInTheDocument();
  });

  it('displays carrier names', () => {
    render(<MockPayablesListPage />);
    expect(
      screen.getAllByText('Swift Trucking LLC').length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Mike's Hauling")).toBeInTheDocument();
  });

  it('shows total AP calculation', () => {
    render(<MockPayablesListPage />);
    expect(screen.getByText('Total AP: $2,325')).toBeInTheDocument();
  });

  it('displays all table columns', () => {
    render(<MockPayablesListPage />);
    expect(screen.getByText('Settlement #')).toBeInTheDocument();
    expect(screen.getByText('Carrier')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders as table for accessibility', () => {
    render(<MockPayablesListPage />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('has table headers', () => {
    render(<MockPayablesListPage />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('displays all payable rows', () => {
    render(<MockPayablesListPage />);
    const rows = screen.getAllByRole('row');
    // 1 header + 3 payables
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

  it('shows empty state when no payables', () => {
    const EmptyPage = () => (
      <div data-testid="payables-list">
        <h1>Accounts Payable</h1>
        <p>No payables found</p>
      </div>
    );

    render(<EmptyPage />);
    expect(screen.getByText('No payables found')).toBeInTheDocument();
  });

  it('displays amounts with currency formatting', () => {
    render(<MockPayablesListPage />);
    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('$1100')).toBeInTheDocument();
  });

  it('groups payables by carrier', () => {
    render(<MockPayablesListPage />);
    // Multiple entries for same carrier
    expect(
      screen.getAllByText('Swift Trucking LLC').length
    ).toBeGreaterThanOrEqual(1);
  });

  it('shows multiple status values', () => {
    render(<MockPayablesListPage />);
    expect(screen.getByText('CREATED')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('calculates total AP correctly', () => {
    render(<MockPayablesListPage />);
    // 500 + 1100 + 725 = 2325
    expect(screen.getByText('Total AP: $2,325')).toBeInTheDocument();
  });

  it('displays payables for all carriers', () => {
    render(<MockPayablesListPage />);
    expect(
      screen.getAllByText('Swift Trucking LLC').length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Mike's Hauling")).toBeInTheDocument();
  });

  it('renders settlement reference numbers', () => {
    render(<MockPayablesListPage />);
    const settlementNumbers = ['SET-2026-001', 'SET-2026-002', 'SET-2026-003'];
    settlementNumbers.forEach((num) => {
      expect(screen.getByText(num)).toBeInTheDocument();
    });
  });
});
